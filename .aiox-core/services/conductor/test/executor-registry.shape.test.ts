/**
 * executor-registry.shape.test.ts — F9a registry generator/loader (ADR-COCKPIT-AGENT-SELECTION).
 *
 * Builds the registry from the REAL .aiox-core/agents frontmatter (the SOT) and asserts:
 *   - every EXECUTOR with F9 metadata is captured; the CHIEF (aiox-chief) is excluded;
 *   - the minimal frontmatter parser reads inline arrays + scalars correctly;
 *   - the .aiox-project overlay merges domains additively (D5).
 *
 * Run: node --experimental-strip-types --test test/executor-registry.shape.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

import {
  parseFrontmatter,
  isExecutorFrontmatter,
  buildRegistry,
} from '../src/index.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = join(HERE, '..', '..', '..', 'agents'); // .aiox-core/agents

// --- minimal frontmatter parser --------------------------------------------

test('parseFrontmatter: reads inline arrays + scalars from an executor block', () => {
  const md = [
    '---',
    'name: dev',
    'description: Full Stack Developer — implements, debugs.',
    'tools: Read, Edit, Write',
    'model: sonnet',
    '# F9 selection metadata',
    'capabilities: [implementation, debugging, testing]',
    'domains: [application, frontend, backend]',
    'authority: [code-write, test-write]',
    'wip_limit: 3',
    'escalation: architect',
    '---',
    '',
    '# dev — Full Stack Developer',
  ].join('\n');
  const fm = parseFrontmatter(md);
  assert.equal(fm?.name, 'dev');
  assert.deepEqual(fm?.capabilities, ['implementation', 'debugging', 'testing']);
  assert.deepEqual(fm?.domains, ['application', 'frontend', 'backend']);
  assert.equal(fm?.wip_limit, 3);
  assert.equal(fm?.escalation, 'architect');
  assert.equal(isExecutorFrontmatter(fm), true);
});

test('isExecutorFrontmatter: a CHIEF block (no F9 fields) is NOT an executor', () => {
  const md = ['---', 'name: aiox-chief', 'tools: Read, TeamCreate, TeamDelete', 'model: sonnet', '---', '# chief'].join('\n');
  assert.equal(isExecutorFrontmatter(parseFrontmatter(md)), false);
});

// --- build from the REAL agents (the SOT) ----------------------------------

test('buildRegistry: captures the lean EXECUTORs from real frontmatter, excludes the CHIEF', () => {
  const reg = buildRegistry({ agentsDir: AGENTS_DIR });
  const ids = reg.entries.map((e) => e.id).sort();
  // the 10 executors that received F9b metadata
  for (const id of ['dev', 'architect', 'qa', 'po', 'pm', 'sm', 'devops', 'master', 'db-sage', 'design-ops']) {
    assert.ok(ids.includes(id), `missing executor ${id} (ids: ${ids.join(',')})`);
  }
  // aiox-chief is a CHIEF — not selectable
  assert.ok(!ids.includes('aiox-chief'), 'CHIEF must be excluded from the registry');
  assert.equal(reg.total_executors, reg.entries.length);
  assert.equal(reg.$schema, 'aiox-executors-v1');
  // source points back to the .md SOT
  const dev = reg.entries.find((e) => e.id === 'dev')!;
  assert.ok(dev.source.endsWith('dev.md'));
  assert.ok(dev.capabilities.includes('implementation'));
});

// --- D5 overlay ------------------------------------------------------------

test('buildRegistry: .aiox-project overlay merges domains additively (D5)', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'aiox-overlay-'));
  const overlayPath = join(tmp, 'executors-overlay.json');
  writeFileSync(overlayPath, JSON.stringify({ dev: { 'domains+': ['rust', 'egui', 'wgpu'] }, 'db-sage': { wip_limit: 1 } }));
  const reg = buildRegistry({ agentsDir: AGENTS_DIR, overlayPath });
  const dev = reg.entries.find((e) => e.id === 'dev')!;
  assert.ok(dev.domains.includes('rust') && dev.domains.includes('application'), 'base ∪ overlay domains');
  // no duplicates introduced
  assert.equal(dev.domains.length, new Set(dev.domains).size);
  const db = reg.entries.find((e) => e.id === 'db-sage')!;
  assert.equal(db.wip_limit, 1, 'overlay scalar override applied');
});
