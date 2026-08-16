/**
 * transport.shape.test.ts — Shape + behavior tests for the transport adapters.
 *
 *   - FileProtocolTransport (adapter A): interface conformance + a real round-trip
 *     (routeDecision → pending on disk; resolved on disk → awaitResolution) +
 *     onComplete on ACK + isAlive flip.
 *   - NativeIpcTransport (adapter B): every method throws NotYetImplementedError (P3).
 *
 * Run: node --experimental-strip-types --test test/transport.shape.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  FileProtocolTransport,
  NativeIpcTransport,
  NotYetImplementedError,
  readPending,
  writeResolved,
  type ConductorTransport,
  type HarvestResult,
  type PendingDecision,
} from '../src/index.ts';

function tmpRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'conductor-transport-'));
}

function makePending(): PendingDecision {
  return {
    from: 'sub-executor',
    story_id: 'spawn-1',
    question: 'Proceed?',
    options: ['Proceed', 'Cancel'],
    ts: '2026-06-29T00:00:00.000Z',
    conductor_version: '1.0',
  };
}

// --- interface conformance -------------------------------------------------

test('FileProtocolTransport conforms to ConductorTransport (4 methods)', () => {
  const root = tmpRoot();
  try {
    const t: ConductorTransport = new FileProtocolTransport(root);
    assert.equal(typeof t.routeDecision, 'function');
    assert.equal(typeof t.awaitResolution, 'function');
    assert.equal(typeof t.onComplete, 'function');
    assert.equal(typeof t.isAlive, 'function');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// --- routeDecision → on-disk pending ---------------------------------------

test('FileProtocolTransport.routeDecision writes a valid pending.json', async () => {
  const root = tmpRoot();
  try {
    const t = new FileProtocolTransport(root);
    await t.routeDecision('spawn-1', makePending());
    const read = readPending(root, 'spawn-1');
    assert.ok(read, 'pending.json should be readable');
    assert.equal(read?.question, 'Proceed?');
    assert.equal(read?.from, 'sub-executor');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// --- resolved on disk → awaitResolution ------------------------------------

test('FileProtocolTransport.awaitResolution resolves with an on-disk resolution', async () => {
  const root = tmpRoot();
  try {
    const t = new FileProtocolTransport(root, { awaitTimeoutMs: 2000 });
    // Write the resolution first → watchResolved takes the fast (already-present) path.
    writeResolved(root, 'spawn-1', {
      selected: 'Proceed',
      instruction: 'go',
      resolved_by: 'policy',
      policy: 'proceed-gate-auto-v1',
      escalated: false,
    });
    const resolved = await t.awaitResolution('spawn-1', 'decision-1');
    assert.equal(resolved.selected, 'Proceed');
    assert.equal(resolved.instruction, 'go');
    assert.equal(resolved.resolved_by, 'policy');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// --- onComplete on ACK + isAlive flip --------------------------------------

test('FileProtocolTransport.onComplete fires "completed" when the ACK exists', () => {
  const root = tmpRoot();
  try {
    const t = new FileProtocolTransport(root);
    // Pre-create the completion ACK so onComplete fires on the fast path (deterministic).
    const ackDir = path.join(root, '.sdc-ack', 'spawn-1');
    fs.mkdirSync(ackDir, { recursive: true });
    fs.writeFileSync(path.join(ackDir, 'sdc-complete.ack'), 'done', 'utf8');

    let got: HarvestResult | null = null;
    t.onComplete('spawn-1', (r) => { got = r; });

    assert.ok(got, 'onComplete callback should have fired');
    assert.equal(got!.spawnId, 'spawn-1');
    assert.equal(got!.status, 'completed');
    assert.ok(got!.ackPath?.endsWith('sdc-complete.ack'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('FileProtocolTransport.isAlive is true before completion, false after ACK', () => {
  const root = tmpRoot();
  try {
    const t = new FileProtocolTransport(root);
    assert.equal(t.isAlive('spawn-1'), true);
    const ackDir = path.join(root, '.sdc-ack', 'spawn-1');
    fs.mkdirSync(ackDir, { recursive: true });
    fs.writeFileSync(path.join(ackDir, 'sdc-complete.ack'), 'done', 'utf8');
    assert.equal(t.isAlive('spawn-1'), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('FileProtocolTransport rejects path-traversal spawnIds', async () => {
  const root = tmpRoot();
  try {
    const t = new FileProtocolTransport(root);
    await assert.rejects(() => t.routeDecision('../escape', makePending()), /invalid spawnId/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// --- NativeIpcTransport skeleton: every method throws NotYetImplemented -----

test('NativeIpcTransport conforms to the interface (typeof) but is a P3 skeleton', () => {
  const t: ConductorTransport = new NativeIpcTransport();
  assert.equal(typeof t.routeDecision, 'function');
  assert.equal(typeof t.awaitResolution, 'function');
  assert.equal(typeof t.onComplete, 'function');
  assert.equal(typeof t.isAlive, 'function');
});

test('NativeIpcTransport: all 4 methods throw NotYetImplementedError', () => {
  const t = new NativeIpcTransport();
  assert.throws(() => t.routeDecision('spawn-1', makePending()), NotYetImplementedError);
  assert.throws(() => t.awaitResolution('spawn-1', 'd1'), NotYetImplementedError);
  assert.throws(() => t.onComplete('spawn-1', () => {}), NotYetImplementedError);
  assert.throws(() => t.isAlive('spawn-1'), NotYetImplementedError);
});
