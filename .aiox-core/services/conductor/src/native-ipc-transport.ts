/**
 * native-ipc-transport.ts — Adapter B: in-process IPC transport (SKELETON).
 *
 * P1 STATUS: skeleton only. Every method throws NotYetImplemented. The real
 * implementation is P3.
 *
 * Why it exists now: to prove ConductorTransport is genuinely pluggable and to fix
 * the seam. When the AIOX Cockpit hosts spawned children as native panes in the
 * embedded daemon, this transport will carry decisions over in-process IPC instead
 * of files — sub-ms routing, true process-handle liveness, and no .sdc-* file churn.
 *
 * Planned P3 implementation (sketch — NOT built here):
 *   - constructor binds to a daemon IPC endpoint (the in-process v4 protocol channel).
 *   - routeDecision   → push a decision message to the child's pane channel.
 *   - awaitResolution → await a resolution message (no fs.watch; event from the daemon).
 *   - onComplete      → subscribe to the daemon's pane-exit / completion event.
 *   - isAlive         → ground-truth: query the daemon's live pane/PID table.
 *
 * The decision shapes (PendingDecision/ResolvedDecision) and the policy engine are
 * reused unchanged — only the wire changes.
 */

import type {
  ConductorTransport,
  HarvestResult,
  PendingDecision,
  ResolvedDecision,
} from './transport.ts';

/** Thrown by every NativeIpcTransport method until P3 lands. */
export class NotYetImplementedError extends Error {
  constructor(method: string) {
    super(`NativeIpcTransport.${method}: not yet implemented (P3 — native in-process IPC)`);
    this.name = 'NotYetImplementedError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface NativeIpcTransportOptions {
  /** P3: the daemon IPC endpoint / discovery handle (e.g. parsed from .aiox/daemon.json). */
  endpoint?: string;
}

/**
 * Adapter B — native in-process IPC transport. SKELETON: do not use in P1.
 */
export class NativeIpcTransport implements ConductorTransport {
  // Retained so the P3 implementation has the constructor shape it needs; unused in P1.
  private readonly endpoint: string | undefined;

  constructor(opts?: NativeIpcTransportOptions) {
    this.endpoint = opts?.endpoint;
    void this.endpoint;
  }

  routeDecision(_spawnId: string, _p: PendingDecision): Promise<void> {
    throw new NotYetImplementedError('routeDecision');
  }

  awaitResolution(_spawnId: string, _decisionId: string): Promise<ResolvedDecision> {
    throw new NotYetImplementedError('awaitResolution');
  }

  onComplete(_spawnId: string, _cb: (r: HarvestResult) => void): void {
    throw new NotYetImplementedError('onComplete');
  }

  isAlive(_spawnId: string): boolean {
    throw new NotYetImplementedError('isAlive');
  }
}
