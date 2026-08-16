/**
 * conductor-loop.ts — the conductor-side resolution loop (Fatia 1).
 *
 * The other half of the Conductor: it watches the decision channel for a child's
 * pending decision and RESOLVES it — either autonomously (the zero-token policy
 * engine) or by leaving it for a human and reconciling once the human answers.
 *
 * For each pending decision under `<rootDir>/.sdc-decision/<spawnId>/pending.json`:
 *   1. emit `conductor_decision_detected`
 *   2. applyPolicy(pending, autonomyLevel, cbState)
 *   3a. auto-resolve  → write resolved.json (resolved_by:'policy') + clearDecision,
 *                       bump the spawn's circuit breaker, emit `conductor_inject`
 *   3b. escalate      → leave pending in place (the cockpit's read-only rail surfaces
 *                       it), emit `conductor_escalated`; when a human/cockpit writes
 *                       resolved.json, reconcile → emit `conductor_inject` (resolved_by
 *                       :'human') + clearDecision
 *
 * SAFETY: ships at AL1 by default → the policy escalates EVERYTHING (no auto-resolve).
 * AL3 (auto-resolve [style, perf, proceed-gate]) is opt-in and must not run in
 * production without owner sign-off — see policy.ts. The `false-auto-resolve=0`
 * guarantee is the policy's; this loop only routes its verdict.
 *
 * Transport: built directly on the file protocol (protocol.ts). It is conductor-side
 * (discover-many + write-resolution), which the per-spawn ConductorTransport interface
 * does not model; a P3 NativeIpc variant would re-implement this loop over IPC.
 *
 * Determinism/testability: `processOnce()` does one full sweep with no timers — tests
 * drive it directly. `start()/stop()` wrap it in a poll interval for live use.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  readPending,
  readResolved,
  writeResolved,
  clearDecision,
  type ResolvedDecision,
} from './protocol.ts';
import {
  applyPolicy,
  buildResolvedFromPolicy,
  type AutonomyLevel,
  type DecisionCategory,
} from './policy.ts';
import { freshCbState, DEFAULT_MAX_INVOCATIONS, type CbState } from './state.ts';

/** Telemetry event emitted by the loop. Names align with the conductor_* enum the cockpit labels. */
export interface ConductorEvent {
  type: 'conductor_decision_detected' | 'conductor_inject' | 'conductor_escalated';
  spawnId: string;
  ts: string;
  category?: DecisionCategory;
  /** policy name when auto-resolved; null/absent otherwise. */
  policy?: string | null;
  /** who resolved it (on conductor_inject). */
  resolved_by?: 'human' | 'policy';
  /** whether it was escalated to a human. */
  escalated?: boolean;
  /** human-readable detail (escalation reason, etc.). */
  detail?: string;
}

export interface ConductorLoopOptions {
  /** Root dir holding .sdc-decision/ and .sdc-resolution/ (never hardcoded). */
  rootDir: string;
  /** Active autonomy level. Default 'AL1' (escalate everything — safe ship default). */
  autonomyLevel?: AutonomyLevel;
  /** Circuit-breaker ceiling per spawn. Default DEFAULT_MAX_INVOCATIONS (3). */
  maxInvocations?: number;
  /** Restrict the auto-resolvable set without mutating the policy global (e.g. new Set(['style'])). */
  overrideLoopable?: ReadonlySet<DecisionCategory>;
  /** conductor_version stamped into resolved.json. Default '1.0'. */
  conductorVersion?: string;
  /** Telemetry sink. */
  onEvent?: (e: ConductorEvent) => void;
  /** Poll interval (ms) for start()/stop() live mode. Default 1000. */
  pollIntervalMs?: number;
}

/**
 * The conductor-side resolution loop. Construct it bound to a run root; call
 * processOnce() (deterministic) or start()/stop() (poll-driven).
 */
export class ConductorLoop {
  private readonly rootDir: string;
  private readonly al: AutonomyLevel;
  private readonly maxInvocations: number;
  private readonly overrideLoopable?: ReadonlySet<DecisionCategory>;
  private readonly conductorVersion: string;
  private readonly onEvent: (e: ConductorEvent) => void;
  private readonly pollIntervalMs: number;

  /** Circuit-breaker state per spawn (accumulates across decisions for the same spawn). */
  private readonly cb = new Map<string, CbState>();
  /** Spawns escalated and awaiting a human resolution (avoids re-emitting `escalated`). */
  private readonly awaitingHuman = new Set<string>();

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(opts: ConductorLoopOptions) {
    this.rootDir = opts.rootDir;
    this.al = opts.autonomyLevel ?? 'AL1';
    this.maxInvocations = opts.maxInvocations ?? DEFAULT_MAX_INVOCATIONS;
    this.overrideLoopable = opts.overrideLoopable;
    this.conductorVersion = opts.conductorVersion ?? '1.0';
    this.onEvent = opts.onEvent ?? (() => {});
    this.pollIntervalMs = opts.pollIntervalMs ?? 1000;
  }

  /** List spawnIds that currently have a `.sdc-decision/<spawnId>/` directory. */
  private listDecisionDirs(): string[] {
    const base = path.join(this.rootDir, '.sdc-decision');
    try {
      return fs.readdirSync(base, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
    } catch {
      return []; // .sdc-decision/ absent — nothing pending.
    }
  }

  private emit(e: Omit<ConductorEvent, 'ts'>): void {
    this.onEvent({ ...e, ts: new Date().toISOString() });
  }

  private cbFor(spawnId: string): CbState {
    let s = this.cb.get(spawnId);
    if (!s) { s = freshCbState(this.maxInvocations); this.cb.set(spawnId, s); }
    return s;
  }

  /**
   * One full deterministic sweep over the decision channel. Returns the number of
   * decisions acted on (auto-resolved, escalated, or reconciled) this sweep.
   */
  processOnce(): number {
    let acted = 0;

    for (const spawnId of this.listDecisionDirs()) {
      const pending = readPending(this.rootDir, spawnId);
      if (pending === null) continue; // no/invalid pending (already cleared, or malformed) — skip.

      const resolved = readResolved(this.rootDir, spawnId);

      // CASE A — a resolution already exists alongside the pending. This is a human
      // (or cockpit) answer to a previously-escalated decision. Reconcile + clear.
      if (resolved !== null) {
        this.reconcileResolved(spawnId, resolved);
        acted++;
        continue;
      }

      // CASE B — escalated and still awaiting a human; nothing to do until resolved.json lands.
      if (this.awaitingHuman.has(spawnId)) continue;

      // CASE C — a fresh, unresolved pending. Detect → decide.
      this.emit({ type: 'conductor_decision_detected', spawnId });

      const cbState = this.cbFor(spawnId);
      const result = applyPolicy(pending, this.al, cbState, this.overrideLoopable);

      if (result.shouldAutoResolve) {
        // Autonomous resolution.
        const resolvedOut = buildResolvedFromPolicy(result, this.conductorVersion);
        writeResolved(this.rootDir, spawnId, resolvedOut);
        cbState.invocationCount += 1;
        if (cbState.invocationCount >= cbState.maxInvocations) cbState.tripped = true;
        clearDecision(this.rootDir, spawnId); // removes pending; leaves resolved for the child
        this.emit({
          type: 'conductor_inject',
          spawnId,
          category: result.category,
          policy: result.policyName,
          resolved_by: 'policy',
          escalated: false,
        });
        acted++;
      } else {
        // Escalate to human — leave pending in place for the cockpit's rail.
        this.awaitingHuman.add(spawnId);
        this.emit({
          type: 'conductor_escalated',
          spawnId,
          category: result.category,
          escalated: true,
          detail: result.escalationReason ?? undefined,
        });
        acted++;
      }
    }

    return acted;
  }

  /** Emit the inject for an externally-written resolution and clear the decision. */
  private reconcileResolved(spawnId: string, resolved: ResolvedDecision): void {
    this.emit({
      type: 'conductor_inject',
      spawnId,
      policy: resolved.policy,
      resolved_by: resolved.resolved_by,
      escalated: resolved.escalated,
    });
    this.awaitingHuman.delete(spawnId);
    // Removes pending.json; preserves resolved.json until the child marks it consumed.
    clearDecision(this.rootDir, spawnId);
  }

  /** Start the poll-driven loop (live mode). No-op if already running. */
  start(): void {
    if (this.timer !== null) return;
    this.timer = setInterval(() => this.processOnce(), this.pollIntervalMs);
    // Do not keep the event loop alive solely for this timer.
    if (typeof this.timer === 'object' && this.timer && 'unref' in this.timer) {
      (this.timer as { unref: () => void }).unref();
    }
  }

  /** Stop the poll-driven loop. */
  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
