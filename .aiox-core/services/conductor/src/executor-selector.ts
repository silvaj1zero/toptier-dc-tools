/**
 * executor-selector.ts — F9 agent-selection-by-domain (ADR-COCKPIT-AGENT-SELECTION).
 *
 * The D4 6-gate scorer ported VERBATIM from sinkra-hub packages/executor-selector
 * (already agnostic, zero-dep), plus the F9 draft-time layer (D7 adaptive-collapse,
 * D8 anti-self-validation pairing).
 *
 * Score sets the ORDER (deterministic, cheap, auditable); the agent tie-break + human
 * gate set the CHOICE — and only fire on a tight tie OR a risk-sensitive category.
 *
 * Run-directly TS (node --experimental-strip-types), zero runtime deps.
 */

// --- types (mirror sinkra D4 types.ts) -------------------------------------

export interface Executor {
  id: string;
  name: string;
  type: 'agent' | 'human' | 'tool' | 'hybrid';
  subagent_type?: string;
  source: string;
  capabilities: string[];
  domains: string[];
  authority: string[];
  wip_limit: number;
  escalation: string;
  status: 'active' | 'inactive' | 'overloaded';
  current_wip?: number;
}

export interface TaskRequirements {
  /** What the task needs done (matched against capabilities) */
  capabilities_required: string[];
  /** Domain context (matched against domains) */
  domain: string;
  /** Operation type needed (matched against authority) */
  operations_required: string[];
  /** Optional: prefer a specific executor (boosted into the top-3 if eligible) */
  preferred_executor?: string;
}

export interface GateResult {
  gate: 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6';
  name: string;
  passed: boolean;
  reason?: string;
  score: number;
}

export interface SelectionResult {
  executor: Executor;
  gates: GateResult[];
  total_score: number;
  passed_all: boolean;
  rank: number;
}

export interface SelectionResponse {
  task_requirements: TaskRequirements;
  results: SelectionResult[];
  top_3: SelectionResult[];
  fallback_used: boolean;
}

export interface ExecutorRegistry {
  $schema: string;
  type: string;
  total_executors: number;
  entries: Executor[];
  human_executors?: Executor[];
}

// --- gate weights (verbatim from D4) ---------------------------------------

const GATE_WEIGHTS = {
  G1: 1.0, // Exists (hard gate — must pass)
  G2: 0.3, // Capable (soft — partial match OK)
  G3: 0.2, // Available (soft — WIP pressure)
  G4: 1.0, // Authorized (hard gate — must pass)
  G5: 0.25, // Compatible (soft — domain fit)
  G6: 0.15, // Accountable (soft — escalation chain)
} as const;

/** Theoretical max weighted score (sum of all weights), for normalization. */
export const MAX_SCORE =
  GATE_WEIGHTS.G1 + GATE_WEIGHTS.G2 + GATE_WEIGHTS.G3 + GATE_WEIGHTS.G4 + GATE_WEIGHTS.G5 + GATE_WEIGHTS.G6;

// --- the 6 gates (verbatim) ------------------------------------------------

function gateExists(executor: Executor): GateResult {
  const passed = executor.status === 'active';
  return { gate: 'G1', name: 'Exists', passed, score: passed ? 1 : 0, reason: passed ? undefined : `Executor ${executor.id} status: ${executor.status}` };
}

function gateCapable(executor: Executor, req: TaskRequirements): GateResult {
  const required = req.capabilities_required;
  if (required.length === 0) return { gate: 'G2', name: 'Capable', passed: true, score: 1 };
  const matched = required.filter((cap) => executor.capabilities.some((ec) => ec === cap || ec.includes(cap) || cap.includes(ec)));
  const score = matched.length / required.length;
  const passed = score > 0;
  return { gate: 'G2', name: 'Capable', passed, score, reason: passed ? undefined : `No capability match for: ${required.join(', ')}` };
}

function gateAvailable(executor: Executor): GateResult {
  const currentWip = executor.current_wip ?? 0;
  const remaining = executor.wip_limit - currentWip;
  if (remaining <= 0) return { gate: 'G3', name: 'Available', passed: false, score: 0, reason: `WIP at limit: ${currentWip}/${executor.wip_limit}` };
  return { gate: 'G3', name: 'Available', passed: true, score: remaining / executor.wip_limit };
}

function gateAuthorized(executor: Executor, req: TaskRequirements): GateResult {
  const required = req.operations_required;
  if (required.length === 0) return { gate: 'G4', name: 'Authorized', passed: true, score: 1 };
  if (executor.authority.includes('all')) return { gate: 'G4', name: 'Authorized', passed: true, score: 1 };
  const missing = required.filter((op) => !executor.authority.some((auth) => auth === op || auth.includes(op)));
  const passed = missing.length === 0;
  const score = passed ? 1 : (required.length - missing.length) / required.length;
  return { gate: 'G4', name: 'Authorized', passed, score, reason: passed ? undefined : `Missing authority: ${missing.join(', ')}` };
}

function gateCompatible(executor: Executor, req: TaskRequirements): GateResult {
  const domain = req.domain;
  if (!domain) return { gate: 'G5', name: 'Compatible', passed: true, score: 0.5 };
  if (executor.domains.some((d) => d === domain)) return { gate: 'G5', name: 'Compatible', passed: true, score: 1 };
  if (executor.domains.some((d) => d.includes(domain) || domain.includes(d))) return { gate: 'G5', name: 'Compatible', passed: true, score: 0.7 };
  return { gate: 'G5', name: 'Compatible', passed: true, score: 0.2, reason: `No domain match for: ${domain}` };
}

function gateAccountable(executor: Executor): GateResult {
  const hasEscalation = Boolean(executor.escalation);
  return { gate: 'G6', name: 'Accountable', passed: hasEscalation, score: hasEscalation ? 1 : 0, reason: hasEscalation ? undefined : 'No escalation path defined' };
}

function evaluateExecutor(executor: Executor, req: TaskRequirements): SelectionResult {
  const gates: GateResult[] = [
    gateExists(executor),
    gateCapable(executor, req),
    gateAvailable(executor),
    gateAuthorized(executor, req),
    gateCompatible(executor, req),
    gateAccountable(executor),
  ];
  const hardGatesPassed = gates[0].passed && gates[3].passed; // G1 + G4
  const totalScore = gates.reduce((sum, g) => sum + g.score * GATE_WEIGHTS[g.gate], 0);
  return {
    executor,
    gates,
    total_score: Math.round(totalScore * 1000) / 1000,
    passed_all: hardGatesPassed && gates.every((g) => g.passed),
    rank: 0,
  };
}

/**
 * D4 Selection — evaluate all executors through the 6-gate pipeline, return ranked results.
 * Eligible iff hard gates G1+G4 pass; ranked by weighted sum; returns top_3.
 */
export function selectExecutors(registry: ExecutorRegistry, req: TaskRequirements): SelectionResponse {
  const all = [...registry.entries, ...(registry.human_executors ?? [])];
  const eligible = all
    .map((e) => evaluateExecutor(e, req))
    .filter((r) => r.gates[0].passed && r.gates[3].passed);

  eligible.sort((a, b) => b.total_score - a.total_score);
  eligible.forEach((r, i) => { r.rank = i + 1; });

  // Preferred-executor boost: if specified and eligible, ensure it sits in the top-3.
  if (req.preferred_executor) {
    const idx = eligible.findIndex((r) => r.executor.id === req.preferred_executor);
    if (idx > 2) {
      const [pref] = eligible.splice(idx, 1);
      eligible.splice(2, 0, pref);
      eligible.forEach((r, i) => { r.rank = i + 1; });
    }
  }

  return { task_requirements: req, results: eligible, top_3: eligible.slice(0, 3), fallback_used: eligible.length === 0 };
}

// --- F9 draft-time layer (D7 adaptive-collapse + D8 anti-self-validation) ---

/** D7 — confidence at/above which the deterministic top-1 is auto-picked (no elicitation). */
export const COLLAPSE_THRESHOLD = 0.85;

/**
 * Domains/operations that ALWAYS elicit (never collapse), regardless of score — D7.
 * Risk-sensitive: a wrong auto-pick here is expensive. Substring-matched, lower-cased.
 */
export const SENSITIVE_TOKENS: readonly string[] = [
  'auth', 'security', 'migration', 'schema-change', 'rls', 'deploy-production', 'secret', 'credential',
];

export function isSensitive(req: TaskRequirements): boolean {
  const hay = [req.domain, ...req.operations_required, ...req.capabilities_required].join(' ').toLowerCase();
  return SENSITIVE_TOKENS.some((t) => hay.includes(t));
}

/**
 * D7 — normalized confidence that the leader is the right pick, in [0,1].
 *   no eligible → 0 · one eligible → 1 · else 0.5 + dominance, where
 *   dominance = (top1 - top2) / top1  (leader's lead, relative to its own score).
 * So confidence ≥ 0.85 ⟺ the leader beats the runner-up by ≥35% of its own score —
 * an obvious-domain story collapses; a close call (e.g. dev vs architect on a
 * design-flavored code story) stays below threshold and routes to the tie-break.
 */
export function selectionConfidence(resp: SelectionResponse): number {
  const [t1, t2] = resp.top_3;
  if (!t1 || t1.total_score <= 0) return 0;
  if (!t2) return 1;
  const dominance = (t1.total_score - t2.total_score) / t1.total_score;
  return Math.min(1, 0.5 + dominance);
}

export interface Recommendation {
  top_3: SelectionResult[];
  confidence: number;
  /** false → ALWAYS elicit (tie or sensitive); true → top-1 may be auto-picked. */
  collapsible: boolean;
  sensitive: boolean;
  /** the auto-pick when collapsible, else null (agent/human decides from top_3). */
  auto_pick: Executor | null;
  fallback_used: boolean;
}

/**
 * D6/D7 — the draft-time recommendation: rank, measure confidence, decide whether the
 * deterministic top-1 can be auto-picked or must go to the agent tie-break / human gate.
 */
export function recommend(registry: ExecutorRegistry, req: TaskRequirements): Recommendation {
  const resp = selectExecutors(registry, req);
  const confidence = selectionConfidence(resp);
  const sensitive = isSensitive(req);
  const collapsible = !sensitive && confidence >= COLLAPSE_THRESHOLD && resp.top_3.length > 0;
  return {
    top_3: resp.top_3,
    confidence,
    collapsible,
    sensitive,
    auto_pick: collapsible ? resp.top_3[0].executor : null,
    fallback_used: resp.fallback_used,
  };
}

export interface PairResult {
  executor: Executor | null;
  quality_gate: Executor | null;
  /** D8 — true when a DISTINCT quality_gate could not be found (draft-time HALT). */
  self_validation_conflict: boolean;
  recommendation: Recommendation;
}

/**
 * D8 — anti-self-validation pairing.
 *
 * The executor and the quality gate have DIFFERENT requirements: the executor must hold
 * the task's write authority (operations_required); the QG reviews — it does NOT need the
 * executor's write authority, it needs domain competence. So the QG is selected with its
 * own requirements (default: same domain + capabilities, but operations_required dropped),
 * and is the highest-ranked ELIGIBLE candidate whose id differs from the executor's.
 *
 * If no DISTINCT candidate exists (e.g. a single-agent registry), flag
 * self_validation_conflict so the draft-time caller HALTs before dispatch (a real QG loop
 * is impossible — the reviewer would be grading its own work).
 */
export function selectPair(registry: ExecutorRegistry, req: TaskRequirements, qgRequirements?: TaskRequirements): PairResult {
  const rec = recommend(registry, req);
  const executor = rec.top_3[0]?.executor ?? null;

  const qgReq: TaskRequirements = qgRequirements ?? {
    capabilities_required: req.capabilities_required,
    domain: req.domain,
    operations_required: [], // a reviewer reviews — it needs competence, not write authority
  };
  const qgResp = selectExecutors(registry, qgReq);
  const quality_gate = qgResp.results.find((r) => r.executor.id !== executor?.id)?.executor ?? null;

  return {
    executor,
    quality_gate,
    self_validation_conflict: executor !== null && quality_gate === null,
    recommendation: rec,
  };
}
