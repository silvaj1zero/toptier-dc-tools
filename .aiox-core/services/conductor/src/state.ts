/**
 * state.ts — Circuit-breaker state for the Conductor policy engine.
 *
 * The policy engine (policy.ts) bounds how many times it will auto-resolve the
 * same spawn's decisions before forcing a human escalation. That bound is a
 * circuit breaker: a per-spawn counter against a maximum. This is the canonical
 * unified state type — 3 fields, no more.
 *
 * Ported from the SINKRA Hub mux-adapter (conductor-state.ts), reduced to the
 * minimal shape the policy engine consumes.
 */

/** Default circuit-breaker max: auto-resolve at most this many times per spawn. */
export const DEFAULT_MAX_INVOCATIONS = 3;

/**
 * Circuit-breaker state for a single spawn.
 *
 *   invocationCount — how many policy auto-resolves have fired for this spawn.
 *   maxInvocations  — the ceiling; once invocationCount >= maxInvocations the
 *                     breaker is tripped and the policy escalates instead.
 *   tripped         — convenience flag; true once the ceiling is reached.
 */
export interface CbState {
  invocationCount: number;
  maxInvocations: number;
  tripped: boolean;
}

/** Build a fresh circuit-breaker state for a spawn (counter at zero). */
export function freshCbState(maxInvocations: number = DEFAULT_MAX_INVOCATIONS): CbState {
  return { invocationCount: 0, maxInvocations, tripped: false };
}
