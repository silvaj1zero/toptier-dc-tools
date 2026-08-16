/**
 * conductor-loop.shape.test.ts — Behavior tests for the conductor-side resolution loop.
 *
 * Covers: AL1 escalates everything (no resolved.json written); AL3 auto-resolves
 * style/perf (resolved.json written, pending cleared); AL3 still escalates security;
 * human reconciliation (escalate → external resolved.json → inject); circuit breaker
 * trips after maxInvocations auto-resolves for the same spawn.
 *
 * Run: node --experimental-strip-types --test test/conductor-loop.shape.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  ConductorLoop,
  writePending,
  writeResolved,
  readResolved,
  readPending,
  type ConductorEvent,
  type PendingDecision,
} from '../src/index.ts';

function tmpRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'conductor-loop-'));
}

function pend(spawnId: string, question: string, options: string[] = ['A', 'B']): PendingDecision {
  return {
    from: 'sub-executor',
    story_id: spawnId,
    question,
    options,
    ts: '2026-06-29T00:00:00.000Z',
    conductor_version: '1.0',
  };
}

function collect(): { events: ConductorEvent[]; onEvent: (e: ConductorEvent) => void } {
  const events: ConductorEvent[] = [];
  return { events, onEvent: (e) => events.push(e) };
}

// --- AL1: escalate everything ----------------------------------------------

test('AL1: a style decision escalates (no resolved.json written)', () => {
  const root = tmpRoot();
  try {
    const { events, onEvent } = collect();
    const loop = new ConductorLoop({ rootDir: root, autonomyLevel: 'AL1', onEvent });
    writePending(root, 'spawn-a', pend('spawn-a', 'ESLint reports formatting violations'));

    const acted = loop.processOnce();
    assert.equal(acted, 1);
    assert.equal(readResolved(root, 'spawn-a'), null, 'AL1 must not auto-write a resolution');
    assert.ok(readPending(root, 'spawn-a'), 'pending stays for the human');
    assert.deepEqual(events.map((e) => e.type), ['conductor_decision_detected', 'conductor_escalated']);
    assert.equal(events[1]?.category, 'style');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('AL1: idempotent — re-sweeping an escalated decision does not re-emit', () => {
  const root = tmpRoot();
  try {
    const { events, onEvent } = collect();
    const loop = new ConductorLoop({ rootDir: root, autonomyLevel: 'AL1', onEvent });
    writePending(root, 'spawn-a', pend('spawn-a', 'ESLint reports formatting violations'));
    loop.processOnce();
    const countAfterFirst = events.length;
    loop.processOnce(); // second sweep, nothing new
    assert.equal(events.length, countAfterFirst, 'no duplicate events on re-sweep');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// --- AL3: auto-resolve loopable, escalate the rest -------------------------

test('AL3: a style decision auto-resolves (resolved.json policy + pending cleared)', () => {
  const root = tmpRoot();
  try {
    const { events, onEvent } = collect();
    const loop = new ConductorLoop({ rootDir: root, autonomyLevel: 'AL3', onEvent });
    writePending(root, 'spawn-s', pend('spawn-s', 'ESLint reports formatting violations'));

    loop.processOnce();
    const resolved = readResolved(root, 'spawn-s');
    assert.ok(resolved, 'resolved.json should be written');
    assert.equal(resolved?.resolved_by, 'policy');
    assert.equal(resolved?.escalated, false);
    assert.equal(resolved?.policy, 'style-lint-autofix-v1');
    assert.equal(readPending(root, 'spawn-s'), null, 'pending cleared after auto-resolve');
    const inject = events.find((e) => e.type === 'conductor_inject');
    assert.equal(inject?.resolved_by, 'policy');
    assert.equal(inject?.category, 'style');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('AL3: a security decision still escalates (never auto-resolved)', () => {
  const root = tmpRoot();
  try {
    const { events, onEvent } = collect();
    const loop = new ConductorLoop({ rootDir: root, autonomyLevel: 'AL3', onEvent });
    writePending(root, 'spawn-x', pend('spawn-x', 'Hardcoded API key detected in source'));

    loop.processOnce();
    assert.equal(readResolved(root, 'spawn-x'), null, 'security must never be auto-resolved');
    const esc = events.find((e) => e.type === 'conductor_escalated');
    assert.equal(esc?.category, 'security');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// --- human reconciliation --------------------------------------------------

test('human reconciliation: escalate → external resolved.json → inject(human) + pending cleared', () => {
  const root = tmpRoot();
  try {
    const { events, onEvent } = collect();
    const loop = new ConductorLoop({ rootDir: root, autonomyLevel: 'AL1', onEvent });
    writePending(root, 'spawn-h', pend('spawn-h', 'Pick an approach', ['One', 'Two']));

    loop.processOnce(); // escalates
    assert.ok(events.some((e) => e.type === 'conductor_escalated'));

    // Simulate the cockpit/human writing the resolution.
    writeResolved(root, 'spawn-h', {
      selected: 'One',
      instruction: 'go with One',
      resolved_by: 'human',
      policy: null,
      escalated: true,
    });

    loop.processOnce(); // reconciles
    const inject = events.find((e) => e.type === 'conductor_inject');
    assert.ok(inject, 'inject emitted after human resolution');
    assert.equal(inject?.resolved_by, 'human');
    assert.equal(inject?.escalated, true);
    assert.equal(readPending(root, 'spawn-h'), null, 'pending cleared after reconciliation');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// --- circuit breaker -------------------------------------------------------

test('circuit breaker: after maxInvocations auto-resolves, the same spawn escalates', () => {
  const root = tmpRoot();
  try {
    const { events, onEvent } = collect();
    const loop = new ConductorLoop({ rootDir: root, autonomyLevel: 'AL3', maxInvocations: 2, onEvent });
    const q = 'ESLint reports formatting violations';
    // Simulate the child consuming its resolution before raising the next decision
    // (protocol contract: one open decision per spawn; resolved.json is read+consumed).
    const consume = () => fs.rmSync(path.join(root, '.sdc-resolution', 'spawn-cb', 'resolved.json'), { force: true });

    // 1st + 2nd style decisions for the SAME spawn auto-resolve.
    writePending(root, 'spawn-cb', pend('spawn-cb', q));
    loop.processOnce();
    assert.equal(readResolved(root, 'spawn-cb')?.resolved_by, 'policy', '1st auto-resolves');
    consume();

    writePending(root, 'spawn-cb', pend('spawn-cb', q)); // fresh pending after consumption
    loop.processOnce();
    assert.equal(readResolved(root, 'spawn-cb')?.resolved_by, 'policy', '2nd auto-resolves');
    consume();

    // 3rd hits the tripped breaker (invocationCount 2 >= max 2) → escalate.
    writePending(root, 'spawn-cb', pend('spawn-cb', q));
    const before = events.length;
    loop.processOnce();
    const newEvents = events.slice(before);
    assert.ok(newEvents.some((e) => e.type === 'conductor_escalated'), '3rd escalates (breaker tripped)');
    assert.equal(readResolved(root, 'spawn-cb'), null, '3rd writes no policy resolution');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
