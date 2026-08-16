/**
 * policy.shape.test.ts — Shape + behavior tests for the ported policy engine.
 *
 * Two jobs:
 *   1. Confirm the classify → applyPolicy table behaves as the rubric specifies
 *      (style/perf auto-resolve at AL3; everything else escalates; AL gate; CB).
 *   2. THE CRITICAL GATE — false-auto-resolve rate = 0: a battery of must-escalate
 *      decisions must NEVER auto-resolve, at any autonomy level, with a fresh breaker.
 *
 * Run: node --experimental-strip-types --test test/policy.shape.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyDecision,
  applyPolicy,
  buildResolvedFromPolicy,
  freshCbState,
  type AutonomyLevel,
  type DecisionCategory,
} from '../src/index.ts';
import type { PendingDecision } from '../src/index.ts';

// --- helpers ---------------------------------------------------------------

function makePending(
  question: string,
  options: string[] = ['Option A', 'Option B'],
  extra: Record<string, unknown> = {},
): PendingDecision {
  return {
    from: 'sub-executor',
    story_id: 'spawn-test',
    question,
    options,
    ts: '2026-06-29T00:00:00.000Z',
    conductor_version: '1.0',
    ...extra,
  } as PendingDecision;
}

// --- classify table --------------------------------------------------------

const classifyCases: Array<{ name: string; pending: PendingDecision; expected: DecisionCategory }> = [
  { name: 'style — eslint formatting', pending: makePending('ESLint reports formatting violations in the file'), expected: 'style' },
  { name: 'perf — missing await', pending: makePending('There is a missing await before the async call'), expected: 'perf' },
  { name: 'security — hardcoded api key', pending: makePending('Hardcoded API key detected in the source'), expected: 'security' },
  { name: 'architecture — refactor', pending: makePending('This requires an architecture refactor of the service module'), expected: 'architecture' },
  { name: 'scope_mismatch — outside scope', pending: makePending('This change is outside story scope'), expected: 'scope_mismatch' },
  { name: 'missing_dependency — blocked by', pending: makePending('This work is blocked by another task'), expected: 'missing_dependency' },
  { name: 'ambiguous — unclear', pending: makePending('The intent here is unclear and ambiguous'), expected: 'ambiguous' },
  { name: 'unknown — plain choice', pending: makePending('Should the label say Save or Submit?'), expected: 'unknown' },
];

for (const c of classifyCases) {
  test(`classifyDecision: ${c.name} → ${c.expected}`, () => {
    assert.equal(classifyDecision(c.pending), c.expected);
  });
}

test('classifyDecision: explicit category field is trusted', () => {
  const p = makePending('anything at all', ['x'], { category: 'security' });
  assert.equal(classifyDecision(p), 'security');
});

test('classifyDecision: explicit "auto_proceed" string is NEVER trusted (→ unknown)', () => {
  const p = makePending('anything at all', ['x'], { category: 'auto_proceed' });
  assert.equal(classifyDecision(p), 'unknown');
});

// --- applyPolicy: auto-resolve happy paths (AL3) ---------------------------

test('applyPolicy: style auto-resolves at AL3', () => {
  const r = applyPolicy(makePending('ESLint reports formatting violations'), 'AL3', freshCbState());
  assert.equal(r.shouldAutoResolve, true);
  assert.equal(r.category, 'style');
  assert.equal(r.policyName, 'style-lint-autofix-v1');
  assert.equal(r.cbTripped, false);
});

test('applyPolicy: perf (missing await) auto-resolves at AL3', () => {
  const r = applyPolicy(makePending('There is a missing await before the async call'), 'AL3', freshCbState());
  assert.equal(r.shouldAutoResolve, true);
  assert.equal(r.category, 'perf');
  assert.equal(r.policyName, 'perf-missing-await-v1');
});

// --- applyPolicy: auto_proceed proceed-gate (GATE 0, bypasses AL gate) ------

test('applyPolicy: proceed-gate auto-confirms when Ready + human-launched (even at AL2)', () => {
  const p = makePending('Proceed with story development?', ['Proceed', 'Cancel'], {
    story_status: 'Ready',
    wave_explicit_launch: true,
  });
  const r = applyPolicy(p, 'AL2', freshCbState());
  assert.equal(r.shouldAutoResolve, true);
  assert.equal(r.category, 'auto_proceed');
  assert.equal(r.policyName, 'proceed-gate-auto-v1');
  assert.equal(r.selected, 'Proceed');
});

test('applyPolicy: proceed-gate does NOT auto-confirm when precondition missing (no story_status)', () => {
  const p = makePending('Proceed with story development?', ['Proceed', 'Cancel'], {
    wave_explicit_launch: true,
  });
  const r = applyPolicy(p, 'AL3', freshCbState());
  assert.equal(r.shouldAutoResolve, false);
  assert.equal(r.category, 'unknown');
});

test('applyPolicy: proceed-gate with a security signal escalates (K1 guard)', () => {
  const p = makePending('Proceed with story development? Note: hardcoded API key detected', ['Proceed'], {
    story_status: 'Ready',
    wave_explicit_launch: true,
  });
  const r = applyPolicy(p, 'AL3', freshCbState());
  assert.equal(r.shouldAutoResolve, false);
  assert.equal(r.category, 'security');
});

// --- applyPolicy: AL gate + circuit breaker --------------------------------

for (const al of ['AL1', 'AL2'] as AutonomyLevel[]) {
  test(`applyPolicy: ${al} escalates even a clean style decision (AL gate)`, () => {
    const r = applyPolicy(makePending('ESLint reports formatting violations'), al, freshCbState());
    assert.equal(r.shouldAutoResolve, false);
    assert.match(r.escalationReason ?? '', /AL gate/);
  });
}

test('applyPolicy: tripped circuit breaker escalates a loopable category (cbTripped=true)', () => {
  const cb = { invocationCount: 3, maxInvocations: 3, tripped: true };
  const r = applyPolicy(makePending('ESLint reports formatting violations'), 'AL3', cb);
  assert.equal(r.shouldAutoResolve, false);
  assert.equal(r.cbTripped, true);
});

test('applyPolicy: overrideLoopable restricts the auto-resolvable set (perf excluded)', () => {
  const r = applyPolicy(
    makePending('There is a missing await before the async call'),
    'AL3',
    freshCbState(),
    new Set(['style'] as DecisionCategory[]),
  );
  assert.equal(r.shouldAutoResolve, false);
  assert.equal(r.category, 'perf');
});

// --- buildResolvedFromPolicy ----------------------------------------------

test('buildResolvedFromPolicy: builds policy-resolved decision on auto-resolve', () => {
  const r = applyPolicy(makePending('ESLint reports formatting violations'), 'AL3', freshCbState());
  const resolved = buildResolvedFromPolicy(r, '1.0');
  assert.equal(resolved.resolved_by, 'policy');
  assert.equal(resolved.escalated, false);
  assert.equal(resolved.policy, 'style-lint-autofix-v1');
  assert.ok(resolved.instruction && resolved.instruction.length > 0);
});

test('buildResolvedFromPolicy: throws when called on an escalation result', () => {
  const r = applyPolicy(makePending('Hardcoded API key detected'), 'AL3', freshCbState());
  assert.throws(() => buildResolvedFromPolicy(r, '1.0'), /shouldAutoResolve=false/);
});

// --- THE CRITICAL GATE: false-auto-resolve rate = 0 ------------------------

// Every entry here MUST escalate, at EVERY autonomy level, with a fresh breaker.
// If any single one auto-resolves, that is a CRITICAL safety failure.
const mustEscalate: string[] = [
  // security
  'Hardcoded API key detected in the source',
  'There is an SQL injection risk in this query',
  'This bypasses the auth validation check',
  'service_role_key is exposed in the client bundle',
  'The token is stored in localStorage',
  'This route is exposed to XSS',
  'RLS policy bypass detected',
  // architecture
  'This requires an architecture refactor of the service module',
  'Should we introduce zustand for state management?',
  'This is a breaking change to the api contract',
  'Refactor the database schema design',
  // scope / dependency
  'This change is outside story scope',
  'This work is blocked by another task',
  'Missing dependency: required resource not available',
  // ambiguous / unknown
  'The intent here is unclear and ambiguous',
  'Which approach is correct for this implementation?',
  'Should the label say Save or Submit?',
  // proceed-gate that must NOT slip through (security poison)
  'Proceed with story development? Note: hardcoded API key detected',
];

for (const al of ['AL3', 'AL4'] as AutonomyLevel[]) {
  test(`FALSE-AUTO-RESOLVE=0 sentinel @ ${al}: ${mustEscalate.length} must-escalate decisions never auto-resolve`, () => {
    const offenders: string[] = [];
    for (const q of mustEscalate) {
      // include proceed-gate preconditions to make the test maximally adversarial:
      // even with Ready + human-launched, none of these may auto-resolve.
      const p = makePending(q, ['Proceed', 'Cancel'], {
        story_status: 'Ready',
        wave_explicit_launch: true,
      });
      const r = applyPolicy(p, al, freshCbState());
      if (r.shouldAutoResolve) offenders.push(`${r.category}: "${q}"`);
    }
    assert.deepEqual(offenders, [], `auto-resolved decisions that MUST escalate:\n${offenders.join('\n')}`);
  });
}
