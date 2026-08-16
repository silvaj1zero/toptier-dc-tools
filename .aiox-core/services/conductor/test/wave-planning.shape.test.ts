/**
 * wave-planning.shape.test.ts — wave-execute agnostic enrichments (bucket 3).
 *
 * Covers: cascade-block transitive dependents (+ cycle safety), BACKLOG-id assignment,
 * effort calibration, flywheel circularidade delta (improvements/regressions, effort_accuracy
 * proximity), and the deterministic finding-level verdict rollup.
 *
 * Run: node --experimental-strip-types --test test/wave-planning.shape.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  cascadeBlock,
  assignBacklogIds,
  calibrateEffort,
  flywheelDelta,
  verdictFromFindings,
  normalizeFinding,
  type NormalizedFinding,
} from '../src/index.ts';

// --- cascade-block ---------------------------------------------------------

test('cascadeBlock: transitively blocks all dependents of a blocked story', () => {
  // A ← B ← C, and D depends on A too; block A → B, C, D cascade
  const deps = { B: ['A'], C: ['B'], D: ['A'], E: ['X'] };
  assert.deepEqual(cascadeBlock(deps, ['A']), ['B', 'C', 'D']);
});

test('cascadeBlock: independent stories are not blocked; result excludes the originally blocked', () => {
  const deps = { B: ['A'], C: ['B'] };
  const out = cascadeBlock(deps, ['A']);
  assert.ok(!out.includes('A'));
  assert.deepEqual(out, ['B', 'C']);
});

test('cascadeBlock: cycle-safe (does not infinite-loop)', () => {
  const deps = { A: ['B'], B: ['A'], C: ['A'] };
  assert.deepEqual(cascadeBlock(deps, ['A']).sort(), ['B', 'C']);
});

// --- BACKLOG ids -----------------------------------------------------------

test('assignBacklogIds: BACKLOG-{epic}-{seq} from startSeq', () => {
  assert.deepEqual(assignBacklogIds('202', ['202.W2.3', '202.W2.4'], 5), {
    '202.W2.3': 'BACKLOG-202-5',
    '202.W2.4': 'BACKLOG-202-6',
  });
});

// --- effort calibration ----------------------------------------------------

test('calibrateEffort: default 0.3 ratio, rounds to 1 decimal, guards non-positive', () => {
  assert.equal(calibrateEffort(10), 3);
  assert.equal(calibrateEffort(7, 0.5), 3.5);
  assert.equal(calibrateEffort(0), 0);
  assert.equal(calibrateEffort(-4), 0);
});

// --- flywheel circularidade ------------------------------------------------

test('flywheelDelta: classifies improvements vs regressions by metric direction', () => {
  const d = flywheelDelta(
    { velocity: 2, qg_pass_rate: 0.8, friction: 1.5, effort_accuracy: 0.6 },
    { velocity: 3, qg_pass_rate: 0.7, friction: 1.0, effort_accuracy: 0.9 },
  );
  const imp = d.improvements.map((c) => c.metric).sort();
  const reg = d.regressions.map((c) => c.metric).sort();
  // velocity up = good; friction down = good; effort_accuracy 0.6→0.9 closer to 1.0 = good
  assert.deepEqual(imp, ['effort_accuracy', 'friction', 'velocity']);
  // qg_pass_rate down = regression
  assert.deepEqual(reg, ['qg_pass_rate']);
});

test('flywheelDelta: effort_accuracy judged by proximity to 1.0, not raw direction', () => {
  // 1.4 → 1.1 is a DROP in value but CLOSER to 1.0 → improvement
  const d = flywheelDelta({ effort_accuracy: 1.4 }, { effort_accuracy: 1.1 });
  assert.equal(d.improvements.length, 1);
  assert.equal(d.improvements[0].metric, 'effort_accuracy');
});

test('flywheelDelta: equal/absent metrics are skipped', () => {
  const d = flywheelDelta({ velocity: 2, friction: 1.0 }, { velocity: 2 });
  assert.equal(d.improvements.length, 0);
  assert.equal(d.regressions.length, 0);
});

// --- deterministic verdict rollup ------------------------------------------

test('verdictFromFindings: HIGH/CRITICAL → FAIL, MEDIUM → CONCERNS, clean → PASS', () => {
  const mk = (sev: string): NormalizedFinding => normalizeFinding({ file: 'a', line: 1, severity: sev, message: 'x' }, 'codex');
  assert.equal(verdictFromFindings([mk('CRITICAL')]), 'FAIL');
  assert.equal(verdictFromFindings([mk('HIGH')]), 'FAIL');
  assert.equal(verdictFromFindings([mk('MEDIUM')]), 'CONCERNS');
  assert.equal(verdictFromFindings([mk('LOW')]), 'PASS');
  assert.equal(verdictFromFindings([]), 'PASS');
});
