---
name: self-heal
description: Multi-engine, no-self-review code self-healing — route an uncommitted diff to the project's AVAILABLE review engines (CodeRabbit / Codex / Gemini / …), aggregate + dedupe findings, auto-fix CRITICAL/HIGH, re-review, circuit breaker. Two modes (synchronous gate · concurrent). Findings → project; run signal → product telemetry. Graceful skip when no engine is available (never fakes a review).
version: "0.1.0"
context: inline
agent: general-purpose
user-invocable: true
argument-hint: "[diff|file-glob] [gate|concurrent]"
status: active
depends_on: ["/three-brain"]
allowed-tools: Bash, Read, Edit
---

# /self-heal — Multi-Engine Self-Healing Review

Operationalize `/three-brain`'s law (**a different engine reviews — never the one that wrote**) into a self-healing loop: review the change with every AVAILABLE review engine, aggregate + dedupe findings, fix the criticals, re-review until clean or the circuit breaker trips. Reused by `/develop` (before done) and `/review`; runnable standalone.

## The law: NO SELF-REVIEW (NON-NEGOTIABLE)
The engine that **wrote** the code never reviews its own diff. Self-review has structural blind spots; a second engine is the cheapest way to catch them. The writer is excluded from the reviewer set (see F7 routing). If the ONLY available engine is the writer → graceful skip with an explicit blind-spot warning — **never fabricate a review that didn't run.**

## Input
`$ARGUMENTS[0]` = what to review: `diff` (default — uncommitted working tree) · a file glob · a story path (review its File List). `$ARGUMENTS[1]` = mode: `gate` (default) · `concurrent`.

## The engine layer (F7 — multi-CLI registry; consumed, bound per project)
Review engines are the project's configured CLIs — resolved at runtime, never hardcoded (agnostic, like the design/db bindings). The registry (`aiox.config.json → engines[]`, default a bundled set) declares per engine:
- `id` (e.g. `coderabbit`, `codex`, `gemini`, `grok`, `opencode`, `openclaw`, `claude`)
- `detect` — availability probe (e.g. `command -v coderabbit`); only **available** engines route.
- `review` — how to invoke it on a diff (the adapter's invocation).
- `parse` — how to map its output → normalized findings.
- `role` — `reviewer` | `long-context` | `driver`.

**Adapters mirror the `sync.mjs` ADAPTERS pattern** (add a CLI = add an adapter; the loop is untouched). The bundled set ships known adapters (CodeRabbit, and the `/three-brain` engines: a reasoning reviewer like Codex, a long-context engine like Gemini); grok / opencode / openclaw / hermes register an adapter when integrated. **No adapter → that engine is simply absent** (graceful), never an error.

Probe availability first; announce which engines will review and why (the no-self-review delegation is visible, not silent).

## Normalized finding
`{ engine, file, line, severity: CRITICAL|HIGH|MEDIUM|LOW, message }`. Map each engine's native severities into this scale (e.g. CodeRabbit `potential_issue`→HIGH, `improvement`→MEDIUM). **Dedupe** across engines by `(file, line, normalized-message)` — the same issue found by two engines is one finding (record which engines agreed → higher confidence).

## The self-healing loop
```
writer = the engine that produced the diff (default: claude / the /develop executor)
reviewers = available engines with role=reviewer, MINUS writer   (no-self-review)
if reviewers is empty → graceful skip + blind-spot WARN; record signal; return SKIPPED

iteration = 1; max_iterations = config.self_heal.max_iterations (default 2)
while iteration <= max_iterations:
   findings = parallel-run each reviewer on the current diff → normalize → dedupe
   crit_high = findings where severity in {CRITICAL, HIGH}
   if crit_high is empty: break (PASS)
   auto-fix each CRITICAL/HIGH (read the file, apply the fix); log MEDIUM/LOW as recommendations
   iteration++
final: re-evaluate
```
- **Zero CRITICAL after the loop** → PASS. Log "self-heal PASSED (N iterations, engines: …)".
- **CRITICAL persists after `max_iterations`** → **HALT** (the caller, e.g. `/develop`, must NOT set Ready-for-Review). Report the remaining criticals.
- HIGH/MEDIUM survivors → recorded as recommendations (non-blocking).

## Modes
- **`gate` (default, synchronous):** the caller (`/develop` before done, `/review`) invokes `/self-heal` and waits for PASS/HALT. Deterministic, simple, reused everywhere. This is what ships first.
- **`concurrent` (opt-in, cockpit-native):** spawned when `/develop` starts; watches the diff and re-runs reviewers per commit/task, streaming findings back while the dev works (latency win — review overlaps implementation). Leans on the cockpit's native spawn + the conductor (a self-heal pane/agent; findings surface on the rail). The writer still can't self-review (the concurrent reviewer is a different engine). The final commit still passes through a `gate` confirmation. **Evolution path** — the `gate` mode is the baseline it builds on.

## Two-channel output (ADR-COCKPIT-LEARNING-TELEMETRY)
- **Findings → Channel 1 (project):** the actual issues (file/line/message, about the user's code) are reported to the caller + recorded in the project's Dev Agent Record / `.aiox/learning/`. They stay local.
- **Run signal → Channel 2 (product telemetry, via `@aiox/conductor`):** framework metrics ONLY — which engines ran, iterations, findings-count by severity, agreement rate, auto-fix success, tokens/time per engine, PASS/HALT/SKIP. NO code, NO finding text. Anonymized, opt-in, user-inspectable. This is how the product learns which engines/gates pay off.

## Outcome (returned to the caller)
`PASS` (clean) · `HALT` (CRITICAL persists — caller blocks the done) · `SKIP` (no non-writer engine available — blind-spot warning recorded). Plus the findings list (Channel 1) for `/apply-qa-fixes` or the `/review` gate.

## Failure detection (HARD)
A routed engine that errors or times out → report it, fall back to the next available reviewer; if none remain → SKIP with the blind-spot warning. Never count a crashed engine as a clean review. A specific reviewer's per-run timeout is bounded (config `self_heal.engine_timeout_ms`, default 900000).

## Red flags
"Only Claude is available, I'll let it review its own diff" → FORBIDDEN (no-self-review); SKIP + warn instead · "the engine timed out, count it as clean" → never · "fake the second engine ran" → never · "ship with a persisting CRITICAL" → HALT, don't set done · "hardcode the CodeRabbit command in the loop" → it's an adapter in the registry, not in the loop.

## Notes
- **F7 (the engine registry + adapters + probe) is built** (`@aiox/conductor`: `engine-registry.ts` load/probe/`selectReviewers` no-self-review + `findings.ts` normalize/dedupe; `aiox.config.json → engines[]` + `self_heal` knobs; ADR-COCKPIT-ENGINE-REGISTRY). `/self-heal` resolves the configured/bundled adapters, probes availability, and routes. A project with zero review engines configured runs `/develop` exactly as before, minus the second-engine gate (with the blind-spot warning). Per-adapter `review`/`parse` invocation is tuned as each CLI is integrated.
- **`/three-brain`** is the router this generalizes; `/self-heal` is the self-healing *loop* over `/three-brain`'s no-self-review routing.
- Reused by `/develop` (Self-heal review before done) and `/review` (QG can require a self-heal pass); standalone-invocable for an ad-hoc diff review.
