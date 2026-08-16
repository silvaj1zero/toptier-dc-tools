/**
 * learning-store.shape.test.ts — F3 Channel-1 learning store (ADR-COCKPIT-LEARNING-TELEMETRY).
 *
 * Covers the deterministic substrate: targeted YAML parse/emit round-trip, the Phase-0a
 * relevance filter, the Phase-0b promotion threshold, the promote() move (writes promoted/,
 * marks the source entry), and writeLog().
 *
 * Run: node --experimental-strip-types --test test/learning-store.shape.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  parseLearningYaml,
  emitLearningYaml,
  relevanceFilter,
  promotionCandidates,
  promote,
  readEntries,
  readActiveKb,
  writeLog,
  logPath,
  DEFAULT_THRESHOLDS,
  type Heuristic,
  type DraftEntry,
} from '../src/index.ts';

// --- targeted YAML parse ---------------------------------------------------

test('parseLearningYaml: scalars, inline array, inline + block context', () => {
  const inline = parseLearningYaml([
    'type: anti-pattern',
    'promotion_score: 3.5',
    'tags: [validation, draft-to-ready]',
    'context: { task_mode: EXECUTAR, entity_type: null, deploy_type: none }',
  ].join('\n'));
  assert.equal(inline.type, 'anti-pattern');
  assert.equal(inline.promotion_score, 3.5);
  assert.deepEqual(inline.tags, ['validation', 'draft-to-ready']);
  assert.deepEqual(inline.context, { task_mode: 'EXECUTAR', entity_type: null, deploy_type: 'none' });

  const block = parseLearningYaml([
    'status: draft',
    'context:',
    '  task_mode: CRIAR',
    '  deploy_type: none',
    'tags: [x]',
  ].join('\n'));
  assert.deepEqual(block.context, { task_mode: 'CRIAR', deploy_type: 'none' });
  assert.equal(block.status, 'draft');
});

test('emitLearningYaml → parseLearningYaml round-trip preserves decision fields', () => {
  const doc = { type: 'gotcha', promotion_score: 2.5, status: 'draft', tags: ['a', 'b'], context: { task_mode: 'EXECUTAR', entity_type: null, deploy_type: 'none' } };
  const parsed = parseLearningYaml(emitLearningYaml(doc));
  assert.equal(parsed.type, 'gotcha');
  assert.equal(parsed.promotion_score, 2.5);
  assert.deepEqual(parsed.tags, ['a', 'b']);
  assert.deepEqual(parsed.context, { task_mode: 'EXECUTAR', entity_type: null, deploy_type: 'none' });
});

// --- Phase 0a relevance filter ---------------------------------------------

function heuristic(p: Partial<Heuristic> & { heuristic_id: string }): Heuristic {
  return { type: 'pattern', skill_scope: [], context: {}, tags: [], statement: '', ...p };
}

test('relevanceFilter: context axis + tag cross-cut match; skill_scope gate; wildcard default', () => {
  const kb: Heuristic[] = [
    heuristic({ heuristic_id: 'mode-match', context: { task_mode: 'EXECUTAR' } }),
    heuristic({ heuristic_id: 'tag-match', tags: ['validation'] }),
    heuristic({ heuristic_id: 'other-mode', context: { task_mode: 'CRIAR' } }),
    heuristic({ heuristic_id: 'scoped-out', skill_scope: ['develop'], tags: ['validation'] }),
    heuristic({ heuristic_id: 'wildcard' }), // no context, no tags → relevant by default
  ];
  const out = relevanceFilter(kb, { task_mode: 'EXECUTAR', tags: ['validation'] }, 'validate').map((h) => h.heuristic_id).sort();
  assert.deepEqual(out, ['mode-match', 'tag-match', 'wildcard']);
});

// --- Phase 0b promotion threshold ------------------------------------------

test('promotionCandidates: only draft entries at/above the per-type threshold', () => {
  const entries: DraftEntry[] = [
    { entry_id: 'p-hi', skill_id: 'validate', type: 'pattern', status: 'draft', created_at: '', promotion_score: 3.5, context: {}, tags: [], statement: '' },
    { entry_id: 'p-lo', skill_id: 'validate', type: 'pattern', status: 'draft', created_at: '', promotion_score: 3.4, context: {}, tags: [], statement: '' },
    { entry_id: 'g-hi', skill_id: 'develop', type: 'gotcha', status: 'draft', created_at: '', promotion_score: 2.5, context: {}, tags: [], statement: '' },
    { entry_id: 'already', skill_id: 'validate', type: 'pattern', status: 'promoted', created_at: '', promotion_score: 9, context: {}, tags: [], statement: '' },
  ];
  const out = promotionCandidates(entries, DEFAULT_THRESHOLDS).map((e) => e.entry_id).sort();
  assert.deepEqual(out, ['g-hi', 'p-hi']); // p-lo below pattern 3.5; already-promoted excluded
});

// --- promote() move + writeLog() + readers ---------------------------------

test('promote: writes promoted/ heuristic and marks the source entry promoted', () => {
  const root = mkdtempSync(join(tmpdir(), 'aiox-learn-'));
  const entryDir = join(root, 'entries', 'validate');
  mkdirSync(entryDir, { recursive: true });
  const entryFile = join(entryDir, 'adapt-not-create-20260630.yaml');
  writeFileSync(entryFile, emitLearningYaml({
    schema_version: '1.0', entry_id: 'adapt-not-create-20260630', skill_id: 'validate',
    type: 'pattern', status: 'draft', created_at: '2026-06-30T00:00:00.000Z', promotion_score: 4,
    context: { task_mode: 'EXECUTAR', entity_type: null, deploy_type: 'none' }, tags: ['validation'], statement: 'reuse before create',
  }));

  const entries = readEntries(root, 'validate');
  assert.equal(entries.length, 1);
  const cand = promotionCandidates(entries, DEFAULT_THRESHOLDS);
  assert.equal(cand.length, 1);

  const h = promote(root, cand[0], '2026-06-30T01:00:00.000Z');
  assert.equal(h.heuristic_id, 'adapt-not-create'); // trailing date stamp stripped
  assert.ok(existsSync(join(root, 'promoted', 'adapt-not-create.yaml')));
  // source entry now marked promoted
  assert.match(readFileSync(entryFile, 'utf-8'), /^status: promoted$/m);

  // the promoted heuristic is now in the active KB and relevance-filterable
  const kb = readActiveKb(root);
  assert.equal(kb.length, 1);
  const rel = relevanceFilter(kb, { task_mode: 'EXECUTAR' }, 'validate');
  assert.equal(rel.length, 1);
  assert.equal(rel[0].heuristic_id, 'adapt-not-create');
});

test('writeLog: writes the Phase-7 log at the canonical path', () => {
  const root = mkdtempSync(join(tmpdir(), 'aiox-log-'));
  const p = writeLog(root, '20260630-120000', {
    skill_id: 'validate', story_id: '202.W3.2', timestamp: '2026-06-30T12:00:00.000Z',
    outcome: 'passed', summary: { checks_passed: 15, auto_fixed: 2 },
    epilogue: { what_worked: 'enrichment hit', what_failed: '', confidence: 'HIGH' },
  });
  assert.equal(p, logPath(root, 'validate', '202.W3.2', '20260630-120000'));
  const parsed = parseLearningYaml(readFileSync(p, 'utf-8'));
  assert.equal(parsed.outcome, 'passed');
  assert.equal(parsed.skill_id, 'validate');
});
