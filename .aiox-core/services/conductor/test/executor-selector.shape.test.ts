/**
 * executor-selector.shape.test.ts — F9 agent-selection-by-domain (ADR-COCKPIT-AGENT-SELECTION).
 *
 * Three jobs:
 *   1. The D4 6-gate scorer ranks correctly (hard gates G1+G4 gate eligibility; domain fit ranks).
 *   2. D7 adaptive-collapse: an obvious-domain story collapses (auto-pick); a tight tie or a
 *      sensitive category does NOT collapse (routes to the agent tie-break / human gate).
 *   3. D8 anti-self-validation: selectPair returns a DISTINCT quality_gate, or flags the conflict.
 *
 * Run: node --experimental-strip-types --test test/executor-selector.shape.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  selectExecutors,
  recommend,
  selectPair,
  selectionConfidence,
  isSensitive,
  COLLAPSE_THRESHOLD,
  type Executor,
  type ExecutorRegistry,
  type TaskRequirements,
} from '../src/index.ts';

// --- fixtures --------------------------------------------------------------

function exec(p: Partial<Executor> & { id: string }): Executor {
  return {
    name: p.id,
    type: 'agent',
    source: `.aiox-core/agents/${p.id}.md`,
    capabilities: [],
    domains: [],
    authority: [],
    wip_limit: 3,
    escalation: 'master',
    status: 'active',
    ...p,
  };
}

const REGISTRY: ExecutorRegistry = {
  $schema: 'aiox-executors-v1',
  type: 'dev-executors',
  total_executors: 4,
  entries: [
    exec({ id: 'dev', capabilities: ['implementation', 'debugging', 'testing'], domains: ['application', 'frontend', 'backend'], authority: ['code-write', 'test-write', 'branch-create'], wip_limit: 3, escalation: 'architect' }),
    exec({ id: 'architect', capabilities: ['architecture-design', 'api-design', 'security-review'], domains: ['system-design', 'api', 'security'], authority: ['architecture-decisions', 'tech-stack-changes'], wip_limit: 2, escalation: 'master' }),
    exec({ id: 'po', capabilities: ['story-validation', 'acceptance-criteria'], domains: ['user-stories', 'backlog'], authority: ['story-validate', 'story-close'], wip_limit: 5, escalation: 'pm' }),
    exec({ id: 'db-sage', capabilities: ['schema-design', 'migrations'], domains: ['database', 'sql'], authority: ['migration-design', 'schema-changes', 'rls-write'], wip_limit: 2, escalation: 'architect' }),
  ],
};

const codeReq: TaskRequirements = {
  capabilities_required: ['implementation', 'testing'],
  domain: 'application',
  operations_required: ['code-write'],
};

// --- D4 scorer: ranking + hard gates ---------------------------------------

test('selectExecutors: an obvious code story ranks dev first', () => {
  const r = selectExecutors(REGISTRY, codeReq);
  assert.equal(r.top_3[0].executor.id, 'dev');
  assert.equal(r.fallback_used, false);
});

test('selectExecutors: G4 hard gate filters out an executor lacking the required authority', () => {
  // a migration op only db-sage is authorized for → only db-sage eligible
  const r = selectExecutors(REGISTRY, { capabilities_required: ['migrations'], domain: 'database', operations_required: ['schema-changes'] });
  assert.equal(r.top_3[0].executor.id, 'db-sage');
  assert.ok(r.results.every((x) => x.executor.authority.some((a) => a.includes('schema-changes'))));
});

test('selectExecutors: G1 hard gate excludes an inactive executor', () => {
  const reg: ExecutorRegistry = { ...REGISTRY, entries: REGISTRY.entries.map((e) => e.id === 'dev' ? { ...e, status: 'inactive' as const } : e) };
  const r = selectExecutors(reg, codeReq);
  assert.ok(!r.results.some((x) => x.executor.id === 'dev'));
});

test('selectExecutors: WIP at limit (G3) drops to score 0 but does not gate (soft)', () => {
  const reg: ExecutorRegistry = { ...REGISTRY, entries: REGISTRY.entries.map((e) => e.id === 'dev' ? { ...e, current_wip: e.wip_limit } : e) };
  const r = selectExecutors(reg, codeReq);
  const dev = r.results.find((x) => x.executor.id === 'dev');
  assert.ok(dev, 'dev still eligible (G3 is soft)');
  assert.equal(dev!.gates.find((g) => g.gate === 'G3')!.score, 0);
});

test('selectExecutors: preferred_executor is boosted into the top-3', () => {
  // operations_required: [] → all agents eligible; db-sage ranks low for domain=application,
  // so without the boost it would fall outside the top-3 — the boost pulls it in.
  const r = selectExecutors(REGISTRY, { capabilities_required: ['implementation'], domain: 'application', operations_required: [], preferred_executor: 'db-sage' });
  assert.ok(r.top_3.some((x) => x.executor.id === 'db-sage'));
});

// --- D7 adaptive-collapse --------------------------------------------------

test('recommend: obvious-domain story collapses (auto-pick dev, no elicitation)', () => {
  const rec = recommend(REGISTRY, codeReq);
  assert.equal(rec.collapsible, true);
  assert.equal(rec.auto_pick?.id, 'dev');
  assert.ok(rec.confidence >= COLLAPSE_THRESHOLD);
});

test('recommend: a sensitive category NEVER collapses (always elicit), even with a clear leader', () => {
  const rec = recommend(REGISTRY, { capabilities_required: ['migrations'], domain: 'database', operations_required: ['schema-changes', 'rls-write'] });
  assert.equal(rec.sensitive, true);
  assert.equal(rec.collapsible, false);
  assert.equal(rec.auto_pick, null);
});

test('selectionConfidence: a lone eligible candidate is full confidence', () => {
  const reg: ExecutorRegistry = { ...REGISTRY, entries: [REGISTRY.entries[0]] };
  assert.equal(selectionConfidence(selectExecutors(reg, codeReq)), 1);
});

test('selectionConfidence: empty eligible set is zero confidence', () => {
  const empty: ExecutorRegistry = { ...REGISTRY, entries: [] };
  const r = selectExecutors(empty, codeReq);
  assert.equal(r.fallback_used, true);
  assert.equal(selectionConfidence(r), 0);
});

test('isSensitive: auth/migration/security/secret tokens trip the gate', () => {
  assert.equal(isSensitive({ capabilities_required: [], domain: 'auth', operations_required: [] }), true);
  assert.equal(isSensitive({ capabilities_required: [], domain: 'application', operations_required: ['deploy-production'] }), true);
  assert.equal(isSensitive({ capabilities_required: [], domain: 'frontend', operations_required: ['code-write'] }), false);
});

// --- D8 anti-self-validation -----------------------------------------------

test('selectPair: returns a DISTINCT quality_gate (executor ≠ QG)', () => {
  const pair = selectPair(REGISTRY, codeReq);
  assert.equal(pair.executor?.id, 'dev');
  assert.ok(pair.quality_gate && pair.quality_gate.id !== 'dev');
  assert.equal(pair.self_validation_conflict, false);
});

test('selectPair: flags self_validation_conflict when only one executor is eligible', () => {
  const reg: ExecutorRegistry = { ...REGISTRY, entries: [REGISTRY.entries[0]] }; // only dev
  const pair = selectPair(reg, codeReq);
  assert.equal(pair.executor?.id, 'dev');
  assert.equal(pair.quality_gate, null);
  assert.equal(pair.self_validation_conflict, true);
});
