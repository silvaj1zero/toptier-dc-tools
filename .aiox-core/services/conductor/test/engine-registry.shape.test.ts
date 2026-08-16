/**
 * engine-registry.shape.test.ts — F7 multi-CLI engine registry (ADR-COCKPIT-ENGINE-REGISTRY).
 *
 * Covers: registry load (config ∪ bundled, config overrides by id), availability probe
 * (injectable), the CODE-ENFORCED no-self-review reviewer selection + blind-spot, and the
 * normalized-finding contract (severity mapping, cross-engine dedupe + agreement, blocking subset).
 *
 * Run: node --experimental-strip-types --test test/engine-registry.shape.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BUNDLED_ENGINES,
  loadEngines,
  probeAvailable,
  selectReviewers,
  selectLongContext,
  normalizeSeverity,
  normalizeFinding,
  dedupeFindings,
  blockingFindings,
  severityCounts,
  type EngineConfig,
  type Prober,
  type NormalizedFinding,
} from '../src/index.ts';

// --- registry load ---------------------------------------------------------

test('loadEngines: bundled set when no config', () => {
  const ids = loadEngines().map((e) => e.id).sort();
  assert.deepEqual(ids, ['claude', 'coderabbit', 'codex', 'gemini']);
});

test('loadEngines: config overrides bundled by id and adds new engines', () => {
  const engines = loadEngines({ engines: [
    { id: 'codex', role: 'reviewer', detect: 'which codex-custom' }, // override
    { id: 'grok', role: 'reviewer', detect: 'command -v grok' },     // new
  ]});
  const codex = engines.find((e) => e.id === 'codex')!;
  assert.equal(codex.detect, 'which codex-custom', 'config entry overrides bundled');
  assert.ok(engines.some((e) => e.id === 'grok'), 'new engine added');
  assert.ok(engines.some((e) => e.id === 'claude'), 'bundled-only engine retained');
});

// --- availability probe (injectable) ---------------------------------------

test('probeAvailable: only engines whose detect probe succeeds route', () => {
  const present = new Set(['codex', 'claude']);
  const probe: Prober = (cmd) => [...present].some((id) => cmd.includes(id)) || cmd === 'true';
  const avail = probeAvailable(loadEngines(), probe).map((e) => e.id).sort();
  assert.deepEqual(avail, ['claude', 'codex']); // gemini + coderabbit absent
});

// --- no-self-review (D3, enforced in code) ---------------------------------

test('selectReviewers: excludes the writer (no-self-review)', () => {
  const engines: EngineConfig[] = [
    { id: 'claude', role: 'reviewer' }, // pretend claude could review
    { id: 'codex', role: 'reviewer' },
    { id: 'gemini', role: 'long-context' },
  ];
  const sel = selectReviewers(engines, 'claude');
  assert.deepEqual(sel.reviewers.map((e) => e.id), ['codex']);
  assert.equal(sel.blindSpot, false);
  assert.equal(sel.writer, 'claude');
});

test('selectReviewers: blind-spot when the only reviewer IS the writer', () => {
  const engines: EngineConfig[] = [{ id: 'claude', role: 'reviewer' }, { id: 'gemini', role: 'long-context' }];
  const sel = selectReviewers(engines, 'claude');
  assert.deepEqual(sel.reviewers, []);
  assert.equal(sel.blindSpot, true); // caller must SKIP + warn, never self-review
});

test('selectLongContext: excludes the writer too', () => {
  const engines: EngineConfig[] = [{ id: 'gemini', role: 'long-context' }, { id: 'claude', role: 'driver' }];
  assert.deepEqual(selectLongContext(engines, 'claude').map((e) => e.id), ['gemini']);
});

// --- normalized findings (D4) ----------------------------------------------

test('normalizeSeverity: severity_map → canonical → conservative HIGH default', () => {
  assert.equal(normalizeSeverity('potential_issue', { potential_issue: 'HIGH' }), 'HIGH');
  assert.equal(normalizeSeverity('CRITICAL'), 'CRITICAL');
  assert.equal(normalizeSeverity('weird-unmapped-token'), 'HIGH'); // never silently LOW
});

test('dedupeFindings: same (file,line,message) across engines → one finding, agreement recorded, max severity', () => {
  const raw: NormalizedFinding[] = [
    normalizeFinding({ file: 'a.ts', line: 10, severity: 'HIGH', message: 'SQL injection risk' }, 'codex'),
    normalizeFinding({ file: 'a.ts', line: 10, severity: 'CRITICAL', message: 'sql injection risk' }, 'coderabbit'), // same, diff case + higher sev
    normalizeFinding({ file: 'b.ts', line: 3, severity: 'MEDIUM', message: 'naming' }, 'codex'),
  ];
  const deduped = dedupeFindings(raw);
  assert.equal(deduped.length, 2);
  const sqli = deduped.find((f) => f.file === 'a.ts')!;
  assert.equal(sqli.severity, 'CRITICAL', 'highest severity wins');
  assert.deepEqual(sqli.agreed_by.sort(), ['coderabbit', 'codex'], 'both engines recorded');
});

test('blockingFindings + severityCounts', () => {
  const fs: NormalizedFinding[] = [
    normalizeFinding({ file: 'a', line: 1, severity: 'CRITICAL', message: 'x' }, 'codex'),
    normalizeFinding({ file: 'b', line: 2, severity: 'HIGH', message: 'y' }, 'codex'),
    normalizeFinding({ file: 'c', line: 3, severity: 'LOW', message: 'z' }, 'codex'),
  ];
  assert.equal(blockingFindings(fs).length, 2); // CRITICAL + HIGH
  assert.deepEqual(severityCounts(fs), { CRITICAL: 1, HIGH: 1, MEDIUM: 0, LOW: 1 });
});

test('BUNDLED_ENGINES: claude is the always-on driver, the rest probe', () => {
  const claude = BUNDLED_ENGINES.find((e) => e.id === 'claude')!;
  assert.equal(claude.role, 'driver');
  assert.equal(claude.detect, 'true');
});
