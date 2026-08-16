/**
 * wave-planning.ts — wave-execute agnostic enrichments (the wave-execute mapping's bucket 3).
 *
 * Deterministic helpers the /wave-execute orchestrator uses for the mechanical parts of:
 *   - cascade-block: when a story is Blocked, transitively block its dependents + assign BACKLOG ids;
 *   - effort calibration: documented effort × calibration ratio (feed-forward from prior waves);
 *   - flywheel circularidade: compare wave N vs N+1 metrics → improvements / regressions.
 *
 * Code, not LLM reasoning, for the graph traversal + the metric deltas. Pure functions, zero deps.
 */

// ---------------------------------------------------------------------------
// Cascade-block (Stage 4) — a Blocked story blocks everything that depends on it
// ---------------------------------------------------------------------------

/** depends_on map: storyId → the story IDs it must wait for (ORDERING edges). */
export type DependsOn = Record<string, string[]>;

/**
 * Given the wave's depends_on map and the set of directly-blocked stories (circuit breaker /
 * timeout), return the TRANSITIVE set of dependents that must also be blocked — every story that
 * (transitively) depends on a blocked one. The originally-blocked ids are NOT included in the result
 * (they're already blocked); the result is the cascade. Deterministic (sorted), cycle-safe.
 */
export function cascadeBlock(dependsOn: DependsOn, blocked: string[]): string[] {
  // reverse edges: dep → [stories that depend on dep]
  const dependents: Record<string, string[]> = {};
  for (const [story, deps] of Object.entries(dependsOn)) {
    for (const d of deps) (dependents[d] ??= []).push(story);
  }
  const blockedSet = new Set(blocked);
  const cascaded = new Set<string>();
  const queue = [...blocked];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const dep of dependents[cur] ?? []) {
      if (blockedSet.has(dep) || cascaded.has(dep)) continue;
      cascaded.add(dep);
      queue.push(dep);
    }
  }
  return [...cascaded].sort();
}

/**
 * Assign BACKLOG ids to deferred/blocked stories: `BACKLOG-{epic}-{seq}` from startSeq, in the
 * given order. Returns storyId → backlogId. (Mirror of the sinkra BACKLOG-{epic}-{seq} convention.)
 */
export function assignBacklogIds(epic: string, storyIds: string[], startSeq = 1): Record<string, string> {
  const out: Record<string, string> = {};
  storyIds.forEach((id, i) => { out[id] = `BACKLOG-${epic}-${startSeq + i}`; });
  return out;
}

// ---------------------------------------------------------------------------
// Effort calibration (Stage 1) — documented effort is historically over-estimated
// ---------------------------------------------------------------------------

/**
 * Calibrate a documented effort estimate by the ratio (default 0.3 — historical 3–5× over-estimation;
 * a prior wave's retrospective overrides the ratio). Rounded to 1 decimal. Non-positive input → 0.
 */
export function calibrateEffort(documentedHours: number, ratio = 0.3): number {
  if (!(documentedHours > 0) || !(ratio > 0)) return 0;
  return Math.round(documentedHours * ratio * 10) / 10;
}

// ---------------------------------------------------------------------------
// Flywheel circularidade (Stage 6 retrospective) — did wave N→N+1 actually improve?
// ---------------------------------------------------------------------------

export interface WaveMetrics {
  /** stories done per wave-day — higher is better. */
  velocity?: number;
  /** % of stories that passed QG first try (0..1) — higher is better. */
  qg_pass_rate?: number;
  /** average QG fix→re-review rounds per story — lower is better. */
  friction?: number;
  /** actual / calibrated effort ratio — closer to 1.0 is better. */
  effort_accuracy?: number;
}

export interface MetricChange {
  metric: keyof WaveMetrics;
  prev: number;
  curr: number;
  /** true = moved in the good direction (improvement); false = regression. */
  improved: boolean;
}

const HIGHER_IS_BETTER: Record<keyof WaveMetrics, boolean> = {
  velocity: true,
  qg_pass_rate: true,
  friction: false,        // lower is better
  effort_accuracy: true,  // proximity to 1.0 — handled specially below
};

/**
 * Compare prior-wave vs current-wave metrics → the improvements + regressions (flywheel
 * circularidade FW-R8). `effort_accuracy` is judged by PROXIMITY to 1.0 (not raw direction).
 * Only metrics present in BOTH waves are compared. Equal values are neither (skipped).
 */
export function flywheelDelta(prev: WaveMetrics, curr: WaveMetrics): { improvements: MetricChange[]; regressions: MetricChange[] } {
  const improvements: MetricChange[] = [];
  const regressions: MetricChange[] = [];
  for (const key of Object.keys(HIGHER_IS_BETTER) as (keyof WaveMetrics)[]) {
    const p = prev[key];
    const c = curr[key];
    if (typeof p !== 'number' || typeof c !== 'number' || p === c) continue;
    let improved: boolean;
    if (key === 'effort_accuracy') {
      improved = Math.abs(c - 1.0) < Math.abs(p - 1.0); // closer to 1.0 wins
    } else {
      improved = HIGHER_IS_BETTER[key] ? c > p : c < p;
    }
    (improved ? improvements : regressions).push({ metric: key, prev: p, curr: c, improved });
  }
  return { improvements, regressions };
}
