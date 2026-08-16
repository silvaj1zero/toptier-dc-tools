/**
 * ack.shape.test.ts — F1 phase-completion ACK channel (the conductor's multi-write contract).
 *
 * Covers: write/read round-trip + schema, the /close 3-ACK recovery semantics
 * (phase-5-checkpoint present + sdc-complete absent → resumable mid-close), listAcks,
 * path traversal rejection, and emitAck context-awareness (graceful no-op standalone,
 * writes under a conductor, never throws).
 *
 * Run: node --experimental-strip-types --test test/ack.shape.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  writeAck,
  readAck,
  hasAck,
  listAcks,
  ackPath,
  isResumableMidClose,
  isSdcComplete,
  resolveAckRoot,
  emitAck,
  CLOSE_ACK_SEQUENCE,
  ACK_PHASES,
  ACK_SCHEMA_VERSION,
} from '../src/index.ts';

function root(): string {
  return mkdtempSync(join(tmpdir(), 'aiox-ack-'));
}

// --- write / read ----------------------------------------------------------

test('writeAck → readAck round-trip, schema matches the on-disk contract', () => {
  const r = root();
  const rec = writeAck(r, '202.W3.2', 'validate', 'passed', { executor: 'validate' });
  assert.equal(rec.phase, 'validate');
  assert.equal(rec.status, 'passed');
  assert.equal(rec.story_id, '202.W3.2');
  assert.equal(rec.event_schema_version, ACK_SCHEMA_VERSION);
  assert.ok(existsSync(ackPath(r, '202.W3.2', 'validate')));

  const back = readAck(r, '202.W3.2', 'validate');
  assert.equal(back?.status, 'passed');
  // on-disk JSON carries the canonical fields
  const onDisk = JSON.parse(readFileSync(ackPath(r, '202.W3.2', 'validate'), 'utf-8'));
  assert.deepEqual(Object.keys(onDisk).sort(), ['event_schema_version', 'executor', 'phase', 'status', 'story_id', 'timestamp', 'written_at'].sort());
});

test('readAck: absent / malformed → null', () => {
  const r = root();
  assert.equal(readAck(r, 'nope', 'validate'), null);
});

// --- /close 3-ACK recovery contract ----------------------------------------

test('CLOSE_ACK_SEQUENCE is the canonical ordered trio', () => {
  assert.deepEqual([...CLOSE_ACK_SEQUENCE], ['phase-5-checkpoint', 'close', 'sdc-complete']);
});

test('isResumableMidClose: checkpoint present + sdc-complete absent → resumable; then complete → not', () => {
  const r = root();
  const story = '202.W3.2';
  writeAck(r, story, ACK_PHASES.phase5Checkpoint, 'passed');
  assert.equal(isResumableMidClose(r, story), true);
  assert.equal(isSdcComplete(r, story), false);

  writeAck(r, story, ACK_PHASES.close, 'passed');
  writeAck(r, story, ACK_PHASES.sdcComplete, 'passed');
  assert.equal(isResumableMidClose(r, story), false);
  assert.equal(isSdcComplete(r, story), true);
  assert.deepEqual(listAcks(r, story), ['close', 'phase-5-checkpoint', 'sdc-complete']);
});

// --- security --------------------------------------------------------------

test('path traversal in storyId / phase is rejected', () => {
  const r = root();
  assert.throws(() => writeAck(r, '../escape', 'validate', 'passed'), /invalid storyId/);
  assert.throws(() => ackPath(r, 'ok', '../x'), /invalid phase/);
});

// --- emitAck context-awareness ---------------------------------------------

test('resolveAckRoot: explicit > CONDUCTOR_ROOT_DIR > CONDUCTOR_ACTIVE(cwd) > null', () => {
  assert.equal(resolveAckRoot({}, '/explicit'), '/explicit');
  assert.equal(resolveAckRoot({ CONDUCTOR_ROOT_DIR: '/cr' }), '/cr');
  assert.equal(resolveAckRoot({ CONDUCTOR_ACTIVE: 'true' }), process.cwd());
  assert.equal(resolveAckRoot({}), null); // standalone → no context
  assert.equal(resolveAckRoot({ CONDUCTOR_ACTIVE: 'false' }), null);
});

test('emitAck: standalone (no context) is a graceful no-op', () => {
  const res = emitAck('202.W3.2', 'validate', 'passed', { env: {} });
  assert.equal(res.written, false);
  assert.equal(res.skipped, 'no-context');
});

test('emitAck: under a conductor root, writes the ACK', () => {
  const r = root();
  const res = emitAck('202.W3.2', 'validate', 'passed', { rootDir: r, executor: 'validate' });
  assert.equal(res.written, true);
  assert.ok(res.path && hasAck(r, '202.W3.2', 'validate'));
});

test('emitAck: never throws — an unwritable root returns skipped:error', () => {
  // a storyId that passes sanitize but a root under a file (not a dir) forces an IO error
  const r = root();
  writeAck(r, 'blocker', 'x', 'passed'); // creates .sdc-ack/blocker/x.ack
  // point the root at a regular FILE so mkdir/rename fail
  const fileAsRoot = ackPath(r, 'blocker', 'x');
  const res = emitAck('202.W3.2', 'validate', 'passed', { rootDir: fileAsRoot });
  assert.equal(res.written, false);
  assert.equal(res.skipped, 'error');
});
