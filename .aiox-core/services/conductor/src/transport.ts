/**
 * transport.ts — The pluggable Conductor transport interface.
 *
 * The Conductor's decision-routing is the SAME regardless of HOW it talks to a
 * spawned child: route the child's pending decision somewhere it can be resolved,
 * wait for the resolution, learn when the child completes, and know if it's alive.
 *
 * That contract is `ConductorTransport`. Two implementations:
 *   - FileProtocolTransport (adapter A) — portable: pending.json/resolved.json on
 *     disk + fs.watch. Ships first. See file-protocol-transport.ts.
 *   - NativeIpcTransport (adapter B) — in-process IPC inside the AIOX Cockpit
 *     daemon. SKELETON only in P1 (methods throw). See native-ipc-transport.ts.
 *
 * Swapping the transport never changes the policy engine (policy.ts) nor the
 * decision shapes (PendingDecision/ResolvedDecision) — those are transport-agnostic.
 */

import type { PendingDecision, ResolvedDecision } from './protocol.ts';

// Re-export the decision shapes so consumers can import everything from the transport.
export type { PendingDecision, ResolvedDecision, DecisionFrom } from './protocol.ts';

/**
 * Terminal status of a spawned child, reported through onComplete.
 *
 *   completed         — the child finished its work and emitted a completion ACK.
 *   failed            — the child exited/errored without completing.
 *   committed_no_ack  — the child committed work but never emitted the completion ACK
 *                       (recoverable: an operator/orchestrator can finalize it).
 *   aborted           — the run was cancelled before the child finished.
 */
export type HarvestStatus = 'completed' | 'failed' | 'committed_no_ack' | 'aborted';

/**
 * Result delivered to an onComplete callback when a spawn reaches a terminal state.
 */
export interface HarvestResult {
  /** The spawn this result is about. */
  spawnId: string;
  /** Terminal status of the spawn. */
  status: HarvestStatus;
  /** Path to the completion ACK that proved completion, when applicable. */
  ackPath?: string;
  /** Human-readable detail for diagnostics/telemetry. */
  detail?: string;
  /** ISO8601 timestamp of when this terminal state was observed. */
  ts: string;
}

/**
 * The Conductor transport contract.
 *
 * A transport is constructed bound to a single run/root and is responsible for the
 * decision channel and completion signal of every spawn under it.
 */
export interface ConductorTransport {
  /**
   * Route a child's pending decision into the channel so it can be resolved
   * (by the policy engine or a human). Idempotent for a given spawn's current decision.
   *
   * @param spawnId - Identifier of the spawned child (path-safe).
   * @param p       - The pending decision to route.
   */
  routeDecision(spawnId: string, p: PendingDecision): Promise<void>;

  /**
   * Await the resolution of a routed decision. Resolves when the channel carries a
   * valid ResolvedDecision for this spawn; rejects on timeout (transport-defined).
   *
   * @param spawnId    - Identifier of the spawned child.
   * @param decisionId - Identifier of the specific decision being awaited (for matching/logging).
   */
  awaitResolution(spawnId: string, decisionId: string): Promise<ResolvedDecision>;

  /**
   * Register a callback fired once when the spawn reaches a terminal state.
   *
   * @param spawnId - Identifier of the spawned child.
   * @param cb      - Invoked with the HarvestResult on completion.
   */
  onComplete(spawnId: string, cb: (r: HarvestResult) => void): void;

  /**
   * Best-effort liveness check for a spawn. Returns false once the spawn is known
   * to have terminated. Transports without a true process handle (e.g. file-protocol)
   * return a best-effort approximation; in-process transports return ground truth.
   *
   * @param spawnId - Identifier of the spawned child.
   */
  isAlive(spawnId: string): boolean;
}
