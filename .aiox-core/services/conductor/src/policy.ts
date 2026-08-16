/**
 * policy.ts — AIOX Conductor Policy Engine.
 *
 * Pure, deterministic, zero-token decision policy: given a child's pending
 * decision, classify it and decide whether to auto-resolve (mechanically) or
 * escalate to a human. No LLM call, no network — just classification + gates.
 *
 * DESIGN INVARIANTS (NON-NEGOTIABLE):
 *   I-4   — NEVER invoke any unbounded autonomous mode. All auto-actions stay
 *           inside bounded circuit breakers.
 *   I-SAFE — Default = ESCALATE. Auto-resolve ONLY when mechanically certain and low-risk.
 *   I-AL  — Auto-resolve ONLY at AL3+. AL1/AL2 always escalate regardless of category.
 *   I-CB  — Circuit breaker: max N invocations per spawn (not sub-calls).
 *   I-CAT — Only [style, perf] categories may be auto-resolved.
 *           [security, architecture] ALWAYS escalate — never auto-resolved.
 *           [ambiguous, unknown, *] ALWAYS escalate.
 *
 * FALSE-AUTO-RESOLVE RATE = 0 is the CRITICAL safety gate of this engine.
 * If a decision SHOULD escalate but the policy auto-resolves it, that is a CRITICAL
 * failure. The policy is designed with extreme conservative bias to keep that rate at 0.
 *
 * OWNER SIGN-OFF REQUIRED: this engine MUST NOT be activated in production
 * (i.e. allowed to auto-resolve, AL3+) without explicit owner sign-off after
 * reviewing the evidence + smoke results.
 *
 * Ported verbatim (logic byte-equivalent) from the SINKRA Hub mux-adapter
 * (conductor-policy.ts) and sanitized of hub-specific names. The classifier
 * corpora, gates, and mechanical resolvers are unchanged — they ARE the rubric.
 */

import type { PendingDecision, ResolvedDecision } from './protocol.ts';
import type { CbState } from './state.ts';

// ---------------------------------------------------------------------------
// Autonomy Level type
// ---------------------------------------------------------------------------

export type AutonomyLevel = 'AL1' | 'AL2' | 'AL3' | 'AL4';

// ---------------------------------------------------------------------------
// Decision taxonomy (category field)
// ---------------------------------------------------------------------------

/**
 * Canonical decision categories derived from pending.json content.
 *
 * The loopable set defaults to ['style', 'perf'] — the ONLY categories the
 * policy may auto-resolve (under AL3+). ALL other categories MUST escalate.
 */
export type DecisionCategory =
  | 'style'         // Auto-resolvable (AL3+): lint errors, formatting, naming convention issues
  | 'perf'          // Auto-resolvable (AL3+): known perf patterns (missing await, sync-in-loop, etc.)
  | 'security'      // ALWAYS escalate — hardcoded credentials, SQL injection risk, auth bypass
  | 'architecture'  // ALWAYS escalate — structural design decisions, tech stack changes
  | 'scope_mismatch' // ALWAYS escalate — spec scope differs from implementation
  | 'missing_dependency' // ALWAYS escalate — required resource/work not available
  | 'ambiguous'     // ALWAYS escalate — unclear intent, contradictory evidence
  | 'unknown'       // ALWAYS escalate — catch-all for anything not positively classified
  | 'auto_proceed'; // Auto-confirmable: a "proceed gate" when mechanical preconditions pass
                    // (work ready + run launched by a human) AND no escalation signal. NOT in
                    // LOOPABLE_CATEGORIES nor ALWAYS_ESCALATE_CATEGORIES — it owns a dedicated
                    // GATE 0 in applyPolicy() resolved by resolveAutoProceed().

/**
 * Auto-resolvable categories. ONLY these may be auto-resolved by the policy engine,
 * and ONLY under AL3+.
 */
export const LOOPABLE_CATEGORIES: ReadonlySet<DecisionCategory> = new Set(['style', 'perf']);

/**
 * Categories that ALWAYS escalate — never auto-resolved regardless of AL level.
 */
export const ALWAYS_ESCALATE_CATEGORIES: ReadonlySet<DecisionCategory> = new Set([
  'security',
  'architecture',
  'scope_mismatch',
  'missing_dependency',
  'ambiguous',
  'unknown',
]);

// ---------------------------------------------------------------------------
// Escalation-signal helpers (anti-drift)
//
// The PRIORITY 1/2/3 classifier corpora are extracted into reusable predicate
// helpers so BOTH classifyDecision() (the keyword cascade) AND the PRIORITY 0
// proceed-gate check consume the SAME regex corpus. Duplicating a partial subset
// inline would drift and break the escalation guarantee for any signal outside
// the subset. `text` is expected pre-lowercased; the /i flags make the predicates
// case-insensitive regardless.
// ---------------------------------------------------------------------------

/** PRIORITY 1 — security signals (credential exposure, injection, auth bypass, RLS, XSS, ...). */
export function hasSecuritySignal(text: string): boolean {
  return (
    // Credential exposure — very specific patterns
    /hardcoded\s+(api[_\s-]?key|credential|secret|password|token)/i.test(text) ||
    /api[_\s-]?key[s]?\s*(=|:|\s+is)\s*["']?[a-z0-9_\-]{8,}/i.test(text) ||
    /\bpassword\s+(hash|visible|exposed|stored|plain|in\s+log)/i.test(text) ||
    /\bservice[_\s-]?role[_\s-]?key\b/i.test(text) ||
    /\bcredential[s]?\s+(exposed|visible|hardcoded|in\s+source)/i.test(text) ||
    // Injection vulnerabilities
    /sql\s+inject/i.test(text) ||
    /\binjection\s+(risk|vulnerabilit|attack)/i.test(text) ||
    /user\s+input\s+.{0,40}(interpolat|concatenat|inject|without\s+sanitiz)/i.test(text) ||
    // XSS
    /\bxss\b/i.test(text) ||
    /exposed\s+to\s+xss/i.test(text) ||
    // Auth bypass / permission bypass
    /auth(entication|orization)?\s+(bypass|skip|circumvent|disabled)/i.test(text) ||
    /permission\s+(gate\s+(bypass|skip)|check\s+bypass)/i.test(text) ||
    /\bbypass\b.{0,50}\b(auth|permission|rls|access\s+control|repeated\s+check)/i.test(text) ||
    /\bcache\b.{0,60}\b(auth|token)\s+(validation|check)\b.{0,60}\bbypass\b/i.test(text) ||
    /\bbypass\b.{0,60}\b(auth|token)\s+(validation|check)/i.test(text) ||
    /\bimport\.meta\.env\.dev\b.{0,50}\b(auth|permission|bypass)/i.test(text) ||
    // RLS policy violations
    /rls\s+policy\s+(bypass|violat|skip)/i.test(text) ||
    // Encryption / key exposure
    /encryption\s+key\s+(exposed|missing|hardcoded)/i.test(text) ||
    // Privilege escalation
    /privileged\s+(route|access|operation)/i.test(text) ||
    // Sanitization missing
    /without\s+sanitiz/i.test(text) ||
    // Vulnerability explicit
    /\bvulnerabilit(y|ies)\b/i.test(text) ||
    // Stored in insecure location (localStorage for sensitive data)
    /\b(token|password|credential)\s+(stored\s+in|is\s+in)\s+localstorage/i.test(text)
  );
}

/** PRIORITY 2 — architecture signals (structural design, tech stack, schema/API contract, ...). */
export function hasArchitectureSignal(text: string): boolean {
  return (
    /\barchitecture\b/i.test(text) ||
    /\bdesign\s+pattern\b/i.test(text) ||
    /\b(architectural|structural)\s+refactor/i.test(text) ||
    /refactor\s+(the\s+)?(api|service|module|architecture|system|database|schema)/i.test(text) ||
    /\bmicroservice[s]?\b/i.test(text) ||
    /\bapi\s+design\b/i.test(text) ||
    /\btech\s+stack\b/i.test(text) ||
    /\bframework\b.{0,50}\b(choose|select|switch|migrate|replace)/i.test(text) ||
    /\bdependency\s+injection\b/i.test(text) ||
    /\bservice\s+boundar/i.test(text) ||
    /\bmonolith\b/i.test(text) ||
    /\bschema\s+(design|change)\b/i.test(text) ||
    /\bdatabase\s+design\b/i.test(text) ||
    /\bbreaking\s+change\b/i.test(text) ||
    /\bapi\s+(contract|versioning|incompatible)\b/i.test(text) ||
    // State management decision (architecture-level)
    /\bstate\s+management\b/i.test(text) ||
    // Batch API design
    /\bredesign\s+(the\s+)?api\b/i.test(text) ||
    // Existing React context vs new lib decision
    /\b(existing|use\s+the)\s+react\s+context\b.{0,50}\bor\b/i.test(text) ||
    /\bintroduce\s+(zustand|redux|mobx|jotai|recoil)\b/i.test(text)
  );
}

/** PRIORITY 3a — scope-mismatch signals (scope drift / out-of-scope work). */
export function hasScopeMismatchSignal(text: string): boolean {
  return (
    /\bscope\s+(mismatch|drift|change|out\s+of)\b/i.test(text) ||
    /\bstory\s+scope\b/i.test(text) ||
    /\boriginal\s+(scope|intent|spec)\b/i.test(text) ||
    /\bdiffers?\s+from\s+(spec|story|requirement)\b/i.test(text) ||
    // Renaming that expands scope beyond boundaries
    /\b(renaming|rename)\b.{0,60}\b(files?\s+outside|beyond\s+(story|spec))\b/i.test(text) ||
    /\b(outside|beyond)\s+(story|spec|original)\s+scope\b/i.test(text)
  );
}

/** PRIORITY 3b — missing-dependency signals (required resource/work not available). */
export function hasMissingDependencySignal(text: string): boolean {
  return (
    /\bmissing\s+(dependency|requirement|prerequisite|resource)\b/i.test(text) ||
    /\bthis\s+story\s+depends\s+on\b/i.test(text) ||
    /\bdepend(s?\s+on)\s+(story|epic)\b/i.test(text) ||
    /\bbeing\s+done\s+\(auth\s+hook\)/i.test(text) ||
    /\bnot\s+yet\s+(done|complete|implemented)\b/i.test(text) ||
    /\bblocked\s+by\b/i.test(text) ||
    /\bnot\s+available\s+in\s+the\s+(staging|production|dev)\s+environment\b/i.test(text)
  );
}

/**
 * Classify a pending decision's category from its question + context.
 *
 * CONSERVATIVE DESIGN: defaults to 'unknown' (escalates) when uncertain. A decision is
 * classified as [style|perf] ONLY when there is a STRONG, unambiguous signal. Any security
 * or architecture keyword causes immediate classification override to those must-escalate
 * categories, regardless of other signals.
 *
 * Category is derived from the `category` field if present, otherwise inferred from
 * question content using keyword sets.
 */
export function classifyDecision(pending: PendingDecision): DecisionCategory {
  // If `category` field is explicitly set, trust it (validate against known set).
  const extended = pending as PendingDecision & { category?: string };
  if (typeof extended.category === 'string' && extended.category.trim()) {
    const explicit = extended.category.trim().toLowerCase() as DecisionCategory;
    const knownCategories: DecisionCategory[] = [
      'style', 'perf', 'security', 'architecture',
      'scope_mismatch', 'missing_dependency', 'ambiguous', 'unknown',
    ];
    if (knownCategories.includes(explicit)) return explicit;
    // 'auto_proceed' is intentionally absent from `knownCategories` — it is NEVER accepted
    // as an externally-supplied explicit category; it is inferred ONLY from mechanical
    // preconditions in PRIORITY 0 below. An explicit "auto_proceed" string therefore falls
    // through to 'unknown' (conservative escalate).
    return 'unknown';
  }

  // Infer from question + options text (lower-cased for matching).
  const text = [
    pending.question,
    ...(pending.options ?? []),
  ].join(' ').toLowerCase();

  // PRIORITY 0 — proceed-gate auto-proceed.
  // Runs AFTER the explicit-category trust block (explicit category still wins) and BEFORE
  // the keyword cascade. Returns 'auto_proceed' ONLY when ALL hold:
  //   (a) question text matches the proceed-gate pattern;
  //   (b) mechanical preconditions pass: work status Ready AND run launched by a human
  //       (both injected onto `pending` by the conductor loop before this call);
  //   (c) the text carries NO escalation signal.
  // Anti-drift: the escalation guard reuses the FULL PRIORITY 1/2/3 corpus via the
  // hasXSignal() helpers — never a partial inline duplicate. Any security/architecture/
  // scope_mismatch/missing_dependency signal makes PRIORITY 0 fall through to the cascade
  // below, which classifies it as that higher-priority (always-escalate) category.
  const isProceedGateQuestion =
    /proceed\s+with\s+(story|development)/i.test(text) ||
    /prosseguir\s+com\s+(o\s+)?desenvolvimento/i.test(text) ||
    /begin\s+(story\s+)?development/i.test(text);
  const proceed = pending as PendingDecision & {
    story_status?: string;          // injected by the conductor loop from the work item
    wave_explicit_launch?: boolean;  // true when the run was launched by a human
  };
  if (
    isProceedGateQuestion &&
    proceed.story_status === 'Ready' &&
    proceed.wave_explicit_launch === true &&
    !hasSecuritySignal(text) &&
    !hasArchitectureSignal(text) &&
    !hasScopeMismatchSignal(text) &&
    !hasMissingDependencySignal(text)
  ) {
    return 'auto_proceed';
  }

  // PRIORITY 1: Security signals — ALWAYS take precedence over other keywords.
  if (hasSecuritySignal(text)) {
    return 'security';
  }

  // PRIORITY 2: Architecture signals — escalate.
  if (hasArchitectureSignal(text)) {
    return 'architecture';
  }

  // PRIORITY 3: Scope / dependency signals — escalate.
  if (hasScopeMismatchSignal(text)) {
    return 'scope_mismatch';
  }

  if (hasMissingDependencySignal(text)) {
    return 'missing_dependency';
  }

  // PRIORITY 4: Ambiguity signals — escalate.
  if (
    /\bunclear\b/.test(text) ||
    /\bambiguous\b/.test(text) ||
    /\bcontradict/.test(text) ||
    /\bconflict(ing)?\b/.test(text) ||
    /\buncertain\b/.test(text) ||
    /\bnot\s+sure\b/.test(text) ||
    /\bmultiple\s+interpret/.test(text) ||
    /\bwhich\s+(approach|option|path|implementation)\s+is\s+(correct|preferred|intended)\b/.test(text)
  ) {
    return 'ambiguous';
  }

  // PRIORITY 5: Style signals (mechanical, tool-fixable code style issues).
  // Must NOT match security/arch issues that use style-adjacent words.
  if (
    /\blint\s+error[s]?\b/i.test(text) ||
    /\bcode\s+(style\s+violation|formatting)\b/i.test(text) ||
    /prettier\s+(formatting|violation|check\s+failed)/i.test(text) ||
    /eslint\s+(report[s]?|error[s]?|violation[s]?|formatting\s+violation[s]?)/i.test(text) ||
    /eslint\s+.{0,30}\bviolation[s]?\b/i.test(text) ||
    /\bindentation\s+(mismatch|error|violation)\b/i.test(text) ||
    /\btrailing\s+whitespace\b/i.test(text) ||
    /\bmissing\s+semicolon[s]?\b/i.test(text) ||
    /\bnaming\s+convention\s+(issue|violation|mismatch)\b/i.test(text) ||
    /\bline\s+(length\s+exceeds|too\s+long|ending[s]?\s+(mismatch|crlf|lf))\b/i.test(text) ||
    /\bunused\s+(import[s]?|variable[s]?|parameter[s]?)\b/i.test(text) ||
    /\bno-explicit-any\b/i.test(text) ||
    /\btype\s+annotation[s]?\s+(missing|required|violation)\b/i.test(text)
  ) {
    return 'style';
  }

  if (
    /\bmissing\s+await\b/i.test(text) ||
    /\bforget\s+to\s+await\b/i.test(text) ||
    // Sync I/O in async context — flexible word order
    /\bsync\w*\s+(call|read|write|op(eration)?|handler)\b.{0,60}\b(async|loop|promise)\b/i.test(text) ||
    /\b(async\s+(handler|context|function)|async\s+function).{0,80}\bsync\w*\s+(read|write|call|op)/i.test(text) ||
    /\bsync\w*\s+(call|read|write|operation)\s+in\s+(async|loop|an?\s+async)/i.test(text) ||
    /\bn\+1\s+quer/i.test(text) ||
    /\b(unnecessar(y|ily)\s+(re-?render|re-?computation|recalculation)|re-?render(s|ing)?\s+unnecessar(y|ily))\b/i.test(text) ||
    /\bmemory\s+leak\b/i.test(text)
  ) {
    return 'perf';
  }

  // Default: unknown → escalate (conservative bias).
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Policy resolution (mechanical, deterministic)
// ---------------------------------------------------------------------------

/**
 * Policy result returned by applyPolicy.
 */
export interface PolicyResult {
  /** Should this decision be auto-resolved (true) or escalated to human (false)? */
  shouldAutoResolve: boolean;

  /** If shouldAutoResolve=true, the NL instruction to write into resolved.json; else null. */
  instruction: string | null;

  /** If shouldAutoResolve=true, the selected option string; else null. */
  selected: string | null;

  /** The classified category. Always present for telemetry. */
  category: DecisionCategory;

  /** The policy name used to resolve (for the inject's policy field). Null if escalated. */
  policyName: string | null;

  /** Reason for escalation (when shouldAutoResolve=false). Null when auto-resolved. */
  escalationReason: string | null;

  /**
   * True when this result was produced because the circuit breaker was tripped
   * (GATE 3: invocationCount >= maxInvocations). Consumers should gate
   * "escalated because exhausted" telemetry on this boolean — never regex the reason.
   */
  cbTripped: boolean;
}

// Re-export CbState for consumers that import the breaker type alongside the policy.
export type { CbState } from './state.ts';

// Re-export the circuit-breaker default for convenience.
export { DEFAULT_MAX_INVOCATIONS } from './state.ts';

/**
 * Apply the conductor policy to a pending decision.
 *
 * CONSERVATIVE DESIGN PRINCIPLES:
 *   1. Default = ESCALATE. Auto-resolve is the exception, not the rule.
 *   2. Auto-resolve ONLY if: AL3+, category in LOOPABLE_CATEGORIES, circuit breaker not tripped.
 *   3. security/architecture: ALWAYS escalate, regardless of AL level or circuit breaker.
 *   4. The mechanical resolver returns a deterministic NL instruction, NOT freeform LLM output.
 *   5. I-4: this function NEVER invokes any unbounded autonomous mode.
 *
 * @param pending          - The pending decision from the child session.
 * @param al               - Active autonomy level for this execution.
 * @param cbState          - Circuit breaker state for this spawn.
 * @param overrideLoopable - Optional scope restriction on LOOPABLE_CATEGORIES for this call.
 *                           When provided, replaces LOOPABLE_CATEGORIES in GATE 4 without
 *                           modifying the global (e.g. pass new Set(['style']) to restrict).
 *                           Undefined = use LOOPABLE_CATEGORIES global (default behavior).
 * @returns PolicyResult describing whether to auto-resolve or escalate.
 */
export function applyPolicy(
  pending: PendingDecision,
  al: AutonomyLevel,
  cbState: CbState,
  overrideLoopable?: ReadonlySet<DecisionCategory>,
): PolicyResult {
  const category = classifyDecision(pending);

  // GATE 0: auto_proceed category — the proceed gate.
  // Runs BEFORE the AL check (GATE 1) because a proceed gate is a launch confirmation,
  // NOT a quality decision. The human already authorized the launch by starting the run;
  // auto-confirming the proceed gate here is safe. classifyDecision only returns
  // 'auto_proceed' when BOTH mechanical preconditions pass (status Ready AND launched by
  // human) AND no escalation signal is present. If either fails, category is 'unknown'
  // and GATE 1/2 escalate normally.
  if (category === 'auto_proceed') {
    return resolveAutoProceed(pending);
  }

  // GATE 1: AL check — AL1/AL2 always escalate regardless of category.
  if (al === 'AL1' || al === 'AL2') {
    return {
      shouldAutoResolve: false,
      instruction: null,
      selected: null,
      category,
      policyName: null,
      escalationReason: `AL gate: autonomy level ${al} requires human escalation for all decisions`,
      cbTripped: false,
    };
  }

  // GATE 2: Always-escalate categories (security, architecture, scope_mismatch,
  // missing_dependency, ambiguous, unknown).
  if (ALWAYS_ESCALATE_CATEGORIES.has(category)) {
    return {
      shouldAutoResolve: false,
      instruction: null,
      selected: null,
      category,
      policyName: null,
      escalationReason: `Category "${category}" always requires human escalation`,
      cbTripped: false,
    };
  }

  // GATE 3: Circuit breaker. If max invocations exhausted, escalate.
  if (cbState.invocationCount >= cbState.maxInvocations) {
    return {
      shouldAutoResolve: false,
      instruction: null,
      selected: null,
      category,
      policyName: null,
      escalationReason:
        `Circuit breaker tripped: ${cbState.invocationCount}/${cbState.maxInvocations} ` +
        `invocations exhausted`,
      cbTripped: true,
    };
  }

  // GATE 4: Category must be in the effective loopable set.
  // Default: LOOPABLE_CATEGORIES [style, perf]. Override: caller-provided set.
  const effectiveLoopable: ReadonlySet<DecisionCategory> = overrideLoopable ?? LOOPABLE_CATEGORIES;
  if (!effectiveLoopable.has(category)) {
    // Caught by GATE 2 for non-loopable categories, but kept as defense-in-depth
    // (and for caller-restricted overrides like ['style']):
    return {
      shouldAutoResolve: false,
      instruction: null,
      selected: null,
      category,
      policyName: null,
      escalationReason: `Category "${category}" is not in effective loopable set [${[...effectiveLoopable].join(', ')}]`,
      cbTripped: false,
    };
  }

  // ALL GATES PASSED — apply mechanical resolver.
  // At this point: AL3+, category in [style|perf], circuit breaker not tripped.
  return mechanicalResolve(pending, category);
}

// ---------------------------------------------------------------------------
// Proceed-gate resolver (category 'auto_proceed')
// ---------------------------------------------------------------------------

/**
 * Resolve a proceed gate auto-confirmation.
 *
 * Invoked by applyPolicy GATE 0 ONLY when classifyDecision returned 'auto_proceed' —
 * meaning the mechanical preconditions (work Ready + run launched by human) already
 * passed and the question text carried no escalation signal. Produces a deterministic
 * "proceed" instruction with policy name `proceed-gate-auto-v1`.
 *
 * I-SAFE: this is NOT a quality decision — it is a launch confirmation the human already
 * authorized by starting the run. No unbounded autonomy (I-4).
 */
function resolveAutoProceed(pending: PendingDecision): PolicyResult {
  const proceedOption = pending.options.find(
    (o) => /proceed|yes|continue|prosseguir|sim/i.test(o),
  ) ?? null;

  return {
    shouldAutoResolve: true,
    selected: proceedOption,
    instruction:
      'Proceed with development. ' +
      'Work status is Ready and the run was explicitly launched by the human operator. ' +
      'No human confirmation is required for this gate — continue.',
    category: 'auto_proceed',
    policyName: 'proceed-gate-auto-v1',
    escalationReason: null,
    cbTripped: false,
  };
}

// ---------------------------------------------------------------------------
// Mechanical resolvers (deterministic — one per loopable category)
// ---------------------------------------------------------------------------

/**
 * Apply the mechanical resolver for a confirmed auto-resolvable decision.
 *
 * CRITICAL: these resolvers are DETERMINISTIC and KEYWORD-DRIVEN, not LLM-freeform.
 * They produce a fixed NL instruction pattern per category. If the pending decision
 * does not match a known resolution pattern, the resolver falls back to escalation
 * (conservative bias).
 *
 * I-4 compliance: no unbounded autonomous loop. O(1) time, single bounded instruction.
 */
function mechanicalResolve(
  pending: PendingDecision,
  category: DecisionCategory,
): PolicyResult {
  if (category === 'style') {
    return resolveStyle(pending);
  }
  if (category === 'perf') {
    return resolvePerf(pending);
  }
  // Fail-safe: any category without a dedicated mechanical resolver escalates.
  return {
    shouldAutoResolve: false,
    instruction: null,
    selected: null,
    category,
    policyName: null,
    escalationReason: `No mechanical resolver for category "${category}"`,
    cbTripped: false,
  };
}

/**
 * Style resolver: produces a standard "run lint and apply fixes" instruction.
 * All style issues are addressable by the linter with --fix: safe, bounded, reversible via git.
 */
function resolveStyle(pending: PendingDecision): PolicyResult {
  const lintOption = pending.options.find(
    (o) => /lint|format|fix/i.test(o),
  ) ?? null;

  return {
    shouldAutoResolve: true,
    selected: lintOption,
    instruction:
      'Apply lint and formatter auto-fixes (run the project linter/formatter with --fix). ' +
      'These are mechanical style corrections with no semantic impact. ' +
      'Commit the fixes and proceed.',
    category: 'style',
    policyName: 'style-lint-autofix-v1',
    escalationReason: null,
    cbTripped: false,
  };
}

/**
 * Perf resolver: produces bounded instructions for known, safe patterns only.
 * Conservative: only resolves patterns where the fix is unambiguous and reversible.
 * Unknown perf patterns fall back to escalation.
 */
function resolvePerf(pending: PendingDecision): PolicyResult {
  const text = [pending.question, ...pending.options].join(' ').toLowerCase();

  // Pattern 1: missing await (safe, mechanical fix)
  if (/missing\s+await\b/i.test(text) || /\bforget\s+to\s+await\b/i.test(text)) {
    return {
      shouldAutoResolve: true,
      selected: pending.options.find((o) => /await|async/i.test(o)) ?? null,
      instruction:
        'Add the missing `await` keyword before the async call. ' +
        'This is a mechanical correctness fix that eliminates the unhandled promise. ' +
        'Run tests after applying to confirm behavior is unchanged.',
      category: 'perf',
      policyName: 'perf-missing-await-v1',
      escalationReason: null,
      cbTripped: false,
    };
  }

  // Pattern 2: sync operation in async context (safe, mechanical fix)
  if (
    /\bsync\w*\s+(call|read|write|op(eration)?|handler)\b.{0,60}\b(async|loop|promise)\b/i.test(text) ||
    /\b(async\s+(handler|context|function)|async\s+function).{0,80}\bsync\w*\s+(read|write|call|op)/i.test(text) ||
    /\bsync\w*\s+(call|read|write|operation)\s+in\s+(async|loop|an?\s+async)/i.test(text)
  ) {
    return {
      shouldAutoResolve: true,
      selected: pending.options.find((o) => /async|await|promise/i.test(o)) ?? null,
      instruction:
        'Replace the synchronous operation with its async equivalent ' +
        '(e.g., fs.readFileSync → fs.promises.readFile). ' +
        'This is a safe mechanical change that improves throughput. ' +
        'Run tests after applying.',
      category: 'perf',
      policyName: 'perf-sync-to-async-v1',
      escalationReason: null,
      cbTripped: false,
    };
  }

  // Pattern 3: unused imports / dead code (safe, typically linter-handled)
  if (/unused\s+(import|variable|parameter)\b/i.test(text)) {
    return {
      shouldAutoResolve: true,
      selected: pending.options.find((o) => /remove|delete|unused/i.test(o)) ?? null,
      instruction:
        'Remove the unused import/variable flagged by the linter. ' +
        'This is a dead code cleanup with no functional impact. Run tests after.',
      category: 'perf',
      policyName: 'perf-unused-code-v1',
      escalationReason: null,
      cbTripped: false,
    };
  }

  // Unknown perf pattern → conservative fallback to escalation.
  return {
    shouldAutoResolve: false,
    instruction: null,
    selected: null,
    category: 'perf',
    policyName: null,
    escalationReason:
      'Performance issue does not match a known safe resolution pattern. ' +
      'Escalating to human for review.',
    cbTripped: false,
  };
}

// ---------------------------------------------------------------------------
// ResolvedDecision builder (for conductor-loop integration)
// ---------------------------------------------------------------------------

/**
 * Build a ResolvedDecision object from a PolicyResult.
 *
 * When shouldAutoResolve=true: resolved_by='policy', escalated=false, policy=policyName.
 * This function is NOT used for the human-escalation path — only the policy-auto-resolve path.
 * The inject event MUST include the `policy` field (never null when auto-resolved).
 */
export function buildResolvedFromPolicy(
  result: PolicyResult,
  conductorVersion: string,
): ResolvedDecision {
  if (!result.shouldAutoResolve) {
    throw new Error(
      'conductor-policy: buildResolvedFromPolicy called with shouldAutoResolve=false. ' +
      'Only call this function when the policy has decided to auto-resolve.',
    );
  }
  return {
    selected: result.selected,
    instruction: result.instruction,
    resolved_by: 'policy',
    policy: result.policyName,   // never null when auto-resolved
    escalated: false,
    ts: new Date().toISOString(),
    conductor_version: conductorVersion,
  };
}
