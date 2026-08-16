/**
 * ack.ts — F1 phase-completion ACK channel (the conductor's multi-write contract).
 *
 * The decision channel (protocol.ts: .sdc-decision/.sdc-resolution) carries QUESTIONS.
 * This is the separate COMPLETION channel: `.sdc-ack/<story>/<phase>.ack` — the on-disk
 * markers every SDC skill emits at the end of its phase ("emit the ACK via @aiox/conductor"),
 * and that the wave monitor + the recovery path consume (`sdc-complete.ack` is the terminal
 * marker; `phase-5-checkpoint.ack` is /close's mid-sequence recovery point).
 *
 * The conductor OWNS this write — skills call it, they do not hand-write the file. Native
 * in-cockpit and file-protocol headless write the same on-disk marker, so one impl serves
 * both. Outside a conductor context (standalone, human present) `emitAck` is a graceful no-op.
 *
 * Schema matches the established on-disk `.ack` JSON (phase/status/story_id/executor/
 * timestamp/written_at/event_schema_version[/commit_sha]) so existing monitors keep reading it.
 *
 * Zero runtime deps.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export const ACK_SCHEMA_VERSION = '1.0';

export type AckStatus = 'passed' | 'failed' | 'halted' | 'partial';

export interface AckRecord {
  phase: string;
  status: AckStatus;
  story_id: string;
  executor?: string;          // the skill/agent that produced it (e.g. "validate", "sinkra-full-cycle")
  timestamp: string;          // logical event time
  written_at: string;         // physical write time
  event_schema_version: string;
  commit_sha?: string;        // optional — close/sdc-complete may carry the merged sha
  note?: string;              // optional — e.g. PARTIAL rationale
}

/**
 * Canonical phase names. The /close recovery contract is the trio
 * phase-5-checkpoint → close → sdc-complete (in order); sdc-complete is the terminal marker.
 */
export const ACK_PHASES = {
  validate: 'validate',
  develop: 'develop',
  review: 'review',
  applyQaFixes: 'apply-qa-fixes',
  deploy: 'deploy',
  verify: 'verify',
  dispatch: 'dispatch',
  phase5Checkpoint: 'phase-5-checkpoint',
  close: 'close',
  sdcComplete: 'sdc-complete',
} as const;

/** /close writes these three in order; a crash after [0] but before [2] is re-dispatchable. */
export const CLOSE_ACK_SEQUENCE: readonly string[] = [
  ACK_PHASES.phase5Checkpoint,
  ACK_PHASES.close,
  ACK_PHASES.sdcComplete,
];

// ---------------------------------------------------------------------------
// internals (mirror protocol.ts: allowlist sanitize + atomic write + safe read)
// ---------------------------------------------------------------------------

function sanitizeStoryId(storyId: string): string {
  if (!/^[\w.\-]+$/.test(storyId)) {
    throw new Error(`conductor-ack: invalid storyId ${JSON.stringify(storyId)} — must match /^[\\w.\\-]+$/`);
  }
  return storyId;
}

function sanitizePhase(phase: string): string {
  if (!/^[\w.\-]+$/.test(phase)) {
    throw new Error(`conductor-ack: invalid phase ${JSON.stringify(phase)} — must match /^[\\w.\\-]+$/`);
  }
  return phase;
}

function atomicWrite(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  fs.renameSync(tmp, filePath);
}

function safeReadJson(filePath: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// paths
// ---------------------------------------------------------------------------

export function ackDir(rootDir: string, storyId: string): string {
  return path.join(rootDir, '.sdc-ack', sanitizeStoryId(storyId));
}
export function ackPath(rootDir: string, storyId: string, phase: string): string {
  return path.join(ackDir(rootDir, storyId), `${sanitizePhase(phase)}.ack`);
}

// ---------------------------------------------------------------------------
// write / read (rootDir explicit — the low-level contract)
// ---------------------------------------------------------------------------

export interface WriteAckOptions {
  executor?: string;
  timestamp?: string;
  commit_sha?: string;
  note?: string;
}

/** Write `.sdc-ack/<story>/<phase>.ack` atomically. Returns the record written. */
export function writeAck(rootDir: string, storyId: string, phase: string, status: AckStatus, opts: WriteAckOptions = {}): AckRecord {
  const now = new Date().toISOString();
  const record: AckRecord = {
    phase,
    status,
    story_id: storyId,
    executor: opts.executor,
    timestamp: opts.timestamp ?? now,
    written_at: now,
    event_schema_version: ACK_SCHEMA_VERSION,
    commit_sha: opts.commit_sha,
    note: opts.note,
  };
  atomicWrite(ackPath(rootDir, storyId, phase), record);
  return record;
}

export function readAck(rootDir: string, storyId: string, phase: string): AckRecord | null {
  const raw = safeReadJson(ackPath(rootDir, storyId, phase));
  if (raw === null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.phase !== 'string' || typeof o.status !== 'string' || typeof o.story_id !== 'string') return null;
  return o as unknown as AckRecord;
}

export function hasAck(rootDir: string, storyId: string, phase: string): boolean {
  return fs.existsSync(ackPath(rootDir, storyId, phase));
}

/** Phases with an ACK present for this story (the monitor/recovery view). */
export function listAcks(rootDir: string, storyId: string): string[] {
  const dir = ackDir(rootDir, storyId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.ack')).map((f) => f.slice(0, -'.ack'.length)).sort();
}

/**
 * /close recovery point: phase-5-checkpoint written but sdc-complete absent → the close
 * crashed mid-sequence and is re-dispatchable WITHOUT re-running the gates.
 */
export function isResumableMidClose(rootDir: string, storyId: string): boolean {
  return hasAck(rootDir, storyId, ACK_PHASES.phase5Checkpoint) && !hasAck(rootDir, storyId, ACK_PHASES.sdcComplete);
}

/** A story is SDC-complete iff its terminal marker exists (what the wave monitor consumes). */
export function isSdcComplete(rootDir: string, storyId: string): boolean {
  return hasAck(rootDir, storyId, ACK_PHASES.sdcComplete);
}

// ---------------------------------------------------------------------------
// emitAck — the contract the skills call (context-aware, graceful no-op, never throws)
// ---------------------------------------------------------------------------

export interface AckEnv {
  CONDUCTOR_ROOT_DIR?: string;
  CONDUCTOR_ACTIVE?: string;
  [k: string]: string | undefined;
}

/**
 * Resolve the ACK root, or null when there is no conductor context (standalone, human present
 * → ACKs are nobody's signal → emit is a no-op). Order: explicit rootDir → CONDUCTOR_ROOT_DIR
 * → (CONDUCTOR_ACTIVE truthy ? cwd : null).
 */
export function resolveAckRoot(env: AckEnv = process.env as AckEnv, explicitRoot?: string): string | null {
  if (explicitRoot && explicitRoot.length) return explicitRoot;
  if (env.CONDUCTOR_ROOT_DIR && env.CONDUCTOR_ROOT_DIR.length) return env.CONDUCTOR_ROOT_DIR;
  if (env.CONDUCTOR_ACTIVE && env.CONDUCTOR_ACTIVE !== 'false' && env.CONDUCTOR_ACTIVE !== '0') return process.cwd();
  return null;
}

export interface EmitAckOptions extends WriteAckOptions {
  rootDir?: string;
  env?: AckEnv;
}

export interface EmitAckResult {
  written: boolean;
  path?: string;
  record?: AckRecord;
  skipped?: 'no-context' | 'error';
  error?: string;
}

/**
 * The contract every skill calls at phase end. Context-aware (writes under a conductor,
 * no-ops standalone) and BEST-EFFORT: it never throws — a write/IO failure returns
 * `{written:false, skipped:'error'}` so the skill warns and continues (never HALTs on an ACK).
 */
export function emitAck(storyId: string, phase: string, status: AckStatus, opts: EmitAckOptions = {}): EmitAckResult {
  const root = resolveAckRoot(opts.env ?? (process.env as AckEnv), opts.rootDir);
  if (root === null) return { written: false, skipped: 'no-context' };
  try {
    const record = writeAck(root, storyId, phase, status, opts);
    return { written: true, path: ackPath(root, storyId, phase), record };
  } catch (e) {
    return { written: false, skipped: 'error', error: e instanceof Error ? e.message : String(e) };
  }
}
