/**
 * file-protocol-transport.ts — Adapter A: the portable, file-protocol transport.
 *
 * FUNCTIONAL (ships first). Implements ConductorTransport on top of the on-disk
 * decision channel in protocol.ts:
 *   - routeDecision   → writePending(.sdc-decision/<spawnId>/pending.json)
 *   - awaitResolution → watchResolved(.sdc-resolution/<spawnId>/resolved.json)
 *   - onComplete      → fs.watch for the completion ACK (.sdc-ack/<spawnId>/<ackFile>)
 *   - isAlive         → best-effort: alive until the completion ACK is observed
 *
 * Liveness note: the file protocol has no real process handle, so isAlive() is a
 * best-effort approximation (alive until completion is observed). Ground-truth
 * liveness is a NativeIpcTransport (adapter B) capability.
 *
 * Completion statuses beyond 'completed' (failed / committed_no_ack / aborted) are
 * not inferable from the bare completion ACK alone; the functional adapter reports
 * 'completed' on ACK. Richer harvest classification is a follow-up (see TODO).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  writePending,
  watchResolved,
  type PendingDecision,
  type ResolvedDecision,
} from './protocol.ts';
import type { ConductorTransport, HarvestResult } from './transport.ts';

/** Default completion-ACK filename (the marker a finished child writes). */
const DEFAULT_ACK_FILE = 'sdc-complete.ack';

/** Mirror of protocol.ts path-safety guard for the ACK path (no traversal). */
function safeSpawnId(spawnId: string): string {
  if (!/^[\w.\-]+$/.test(spawnId)) {
    throw new Error(
      `FileProtocolTransport: invalid spawnId ${JSON.stringify(spawnId)} — ` +
      `must match /^[\\w.\\-]+$/ (no path separators, traversal, or empty)`,
    );
  }
  return spawnId;
}

export interface FileProtocolTransportOptions {
  /** Max wait for awaitResolution (ms). Falls back to protocol default when absent. */
  awaitTimeoutMs?: number;
  /** Completion-ACK filename. Defaults to 'sdc-complete.ack'. */
  ackFile?: string;
}

/**
 * Adapter A — file-protocol transport. Construct it bound to a run root directory.
 */
export class FileProtocolTransport implements ConductorTransport {
  private readonly rootDir: string;
  private readonly awaitTimeoutMs?: number;
  private readonly ackFile: string;

  /** spawns whose completion ACK has been observed (no longer alive). */
  private readonly completed = new Set<string>();
  /** active completion watchers, for cleanup. */
  private readonly watchers = new Map<string, fs.FSWatcher>();

  constructor(rootDir: string, opts?: FileProtocolTransportOptions) {
    this.rootDir = rootDir;
    this.awaitTimeoutMs = opts?.awaitTimeoutMs;
    this.ackFile = opts?.ackFile ?? DEFAULT_ACK_FILE;
  }

  /** Build the completion-ACK path for a spawn. */
  private ackPath(spawnId: string): string {
    return path.join(this.rootDir, '.sdc-ack', safeSpawnId(spawnId), this.ackFile);
  }

  async routeDecision(spawnId: string, p: PendingDecision): Promise<void> {
    // async so a synchronous validation throw (writePending → sanitizeStoryId) surfaces
    // as a Promise rejection — the contract callers of a Promise-returning method expect.
    // writePending validates the spawnId and writes atomically (tmp+rename).
    writePending(this.rootDir, spawnId, p);
  }

  awaitResolution(spawnId: string, _decisionId: string): Promise<ResolvedDecision> {
    // decisionId is carried for caller-side matching/logging; the file channel keys
    // on spawnId (one resolved.json per spawn at a time).
    return this.awaitTimeoutMs !== undefined
      ? watchResolved(this.rootDir, spawnId, { timeoutMs: this.awaitTimeoutMs })
      : watchResolved(this.rootDir, spawnId);
  }

  onComplete(spawnId: string, cb: (r: HarvestResult) => void): void {
    const ackFilePath = this.ackPath(spawnId);
    const ackDir = path.dirname(ackFilePath);

    let fired = false;
    const fire = () => {
      if (fired) return;
      if (!fs.existsSync(ackFilePath)) return;
      fired = true;
      this.completed.add(spawnId);
      const w = this.watchers.get(spawnId);
      if (w) { try { w.close(); } catch (_) { /* best-effort */ } this.watchers.delete(spawnId); }
      // TODO(P-followup): richer HarvestStatus (failed/committed_no_ack/aborted) needs
      // additional file-protocol convention; the bare completion ACK proves 'completed'.
      cb({
        spawnId,
        status: 'completed',
        ackPath: ackFilePath,
        ts: new Date().toISOString(),
      });
    };

    // Ensure the dir exists so fs.watch doesn't throw ENOENT.
    try { fs.mkdirSync(ackDir, { recursive: true }); } catch (_) { /* may exist */ }

    // Fire immediately if the ACK already landed before registration.
    if (fs.existsSync(ackFilePath)) { fire(); return; }

    try {
      const watcher = fs.watch(ackDir, { persistent: false }, (_event, filename) => {
        if (filename === this.ackFile || filename === null) fire();
      });
      watcher.on('error', () => {
        const w = this.watchers.get(spawnId);
        if (w) { try { w.close(); } catch (_) { /* best-effort */ } this.watchers.delete(spawnId); }
      });
      this.watchers.set(spawnId, watcher);
    } catch (_) {
      // If watch setup fails, leave it to a future isAlive()/poll; do not throw.
    }
  }

  isAlive(spawnId: string): boolean {
    // Best-effort: not alive once completion was observed (via onComplete or a present ACK).
    if (this.completed.has(spawnId)) return false;
    try {
      if (fs.existsSync(this.ackPath(spawnId))) {
        this.completed.add(spawnId);
        return false;
      }
    } catch (_) { /* invalid id etc. — treat as alive */ }
    return true;
  }

  /** Close all active completion watchers. Call when tearing down the transport. */
  dispose(): void {
    for (const [, w] of this.watchers) {
      try { w.close(); } catch (_) { /* best-effort */ }
    }
    this.watchers.clear();
  }
}
