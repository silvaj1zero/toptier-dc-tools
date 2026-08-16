---
name: governance-pipeline
description: Orchestrate the formal governance chain — consolidated input → ADR → Epic → Stories → /validate — via the architect→pm→sm→po agents, with human gates, a traceability matrix, ADR cooldown, cross-epic dependency emission, and F9 agent-selection-by-domain at draft-time. Meta-skill, team-led.
version: "1.4.0"
context: conversation
agent: master
user-invocable: true
argument-hint: "{input-path} [--yolo | --yolo-gate ADR|GAPS] [--skip-phases 1,2] [--dry-run]"
depends_on: ["/validate", "/roundtable", "/adr"]
status: active
allowed-tools: Read, Glob, Edit, Write, Bash, AskUserQuestion, Agent, Skill
---

# /governance-pipeline — Governance Chain

Turn a consolidated input (a roundtable report, a research doc, a handoff, a mapped spec) into a governed development plan: **consolidated artifact → ADR → Epic → Stories → `/validate`**. MAIN adopts the `master` (governance guardian) persona and runs the chain through the right agents.

**Invocation:** `/governance-pipeline {input-path} [--yolo|--yolo-gate ADR|GAPS] [--skip-phases 1,2] [--dry-run]`.
- `--yolo` auto-approves ALL human gates (audit trail mandatory). `--yolo-gate ADR|GAPS` auto-approves one. `--skip-phases` skips Consolidation (1) / Architecting (2) when pre-validated artifacts exist. `--dry-run` parses + plans, no agent invocations.

## The chain (phases)
1. **Pre-flight** — mechanical discipline before anything: resolve the input; compute epic numbering; resolve any referenced ADR path; validate `--skip-phases` args. HALT on an unresolved ADR ref. These outputs are passed to `@pm` in Phase 4 (it does NOT recompute them).
   - **Epic numbering (compute, don't just check).** Glob the existing epic dirs, parse their numbers, and emit BOTH `next_epic_number` (max+1) AND `alternative_numbers` — the **gaps** in the existing sequence (e.g. existing `[110,111,113,118]` → next `119`, alternatives `[112,114,115,116,117]`). `@pm` uses `next_epic_number` unless a collision/intent requires an alternative; a directory collision on the chosen number → HALT.
   - **ADR fuzzy-match (Phase-0 generalized via LAG, `031.W4.3`).** For each referenced ADR, PREFER querying the Living Architecture Graph's `list_adrs` tool (`031.W4.1`'s `aiox-core lag-mcp`, called through the shared helper `.aiox-core/skills/governance-pipeline/scripts/lag-query.mjs::listAdrs`) and fuzzy-matching the slug against the returned `adr_id`/`title` fields — the graph already carries `status`/`decisions[]`/`enforced_by[]` per ADR, so a match doubles as the cooldown lookup below with zero extra I/O. **When the LAG is unavailable** (`lag-query.mjs` returns `{available: false, reason}` — no `aiox-core` binary built, or `.aiox/lag/lag.db` not yet generated for this project), **fall back unchanged** to the pre-existing mechanism: glob `<adr_dir>/ADR-*{slug}*.md` (slug from the ref; the project binds `adr_dir`, default `docs/architecture/`). Either path: **0 matches → HALT** with the common-gotcha hint (the ref is usually a prefix of the real filename — e.g. `ADR-SANDBOX` → `ADR-SANDBOX-AGENT-OUTSIDE.md`). **1 → resolve.** **>1 → ask the human which** (`AskUserQuestion`). Resolved paths feed Phase 3/4. This is opt-in per project (AC5 of `031.W4.3`): a project whose `aiox-core` isn't built, or whose LAG hasn't been generated yet, sees the identical glob-only behavior this phase always had — the LAG path is a preferential fast lane, never a hard requirement.
2. **Consolidation** (`@architect` + `@analyst`) — distill the input into a consolidation artifact (decisions, gaps, open questions). Skippable via `--skip-phases 1` if a pre-validated consolidation exists.
3. **Architecting — ADR** (`@architect`) — produce/update the ADR with the machine-readable frontmatter (`adr-frontmatter.md`), invoking `/adr` as a sub-skill for the draft (same pattern as invoking `/roundtable`/`/validate` below — this phase does not reimplement `/adr`'s own elicitation/gates, it consumes the ADR `/adr` hands off at its Phase 7). Bounded loop (max iterations); a CONCERNS finding routes to `/roundtable` if the decision is contested. Skippable via `--skip-phases 2`.
4. **Epic + Stories** (`@pm` then `@sm`) — `@pm` creates the epic structure (Gate-1: epic, not stories); `@sm` drafts the stories from it. **Emit cross-epic dependencies** — when a story depends on another epic's work, record `cross_epic_dependencies[]` (consumed by `/wave-execute`'s conflict gate, EPIC-202).
   - **Agent selection by domain (F9 — ADR-COCKPIT-AGENT-SELECTION).** For each drafted story, `@sm` fills `**Executor:**` + `**Quality Gate:**` by the story's domain, not by triad-bias. Derive `TaskRequirements` (domain of the touched paths + operation type + capabilities) → ask the conductor's scorer (`recommend`/`selectPair` over the generated `.aiox/cache/executors.json`, rebuilt from agent frontmatter). The deterministic score returns the ranked top-3; **`@sm` confronts the top-3 with the real story scope and picks one** (the tie-break the score can't make). **Adaptive-collapse (D7):** when the top-1 confidence ≥ 0.85 AND the domain is not risk-sensitive (auth/migration/security/secret), auto-pick it; on a tight tie OR a sensitive domain, **elicit to the human** (the gate fires only where it matters). **Anti-self-validation (D8):** `quality_gate` MUST be a distinct agent from `executor` — if the registry can't yield a distinct QG, **HALT at draft** (a real QG loop is impossible). Runtime binding (`/full-cycle`, `/close`) then adopts the named persona — unchanged.
5. **Validate** (`@po`) — run `/validate` on each drafted story → Ready.

## Human gates (with traceability ★)
Two human gates by default: **ADR approval** and **GAPS resolution**. At each gate, present the decision + its provenance and get explicit approval (or `--yolo`, which records an auto-approval in the audit trail — never a silent pass).
**Traceability matrix (★):** maintain a live matrix linking **input → consolidation → ADR (decision id) → epic → stories**, so every story traces back to the decision that authorized it. The final report includes it.

## ADR cooldown (★)
An ADR that was recently decided is in **cooldown** — don't re-open/re-decide it within the cooldown window. If the input would re-litigate a cooled-down ADR, surface that ("ADR-X decided {date}, in cooldown") and require an explicit override rather than silently re-running the architecting loop. Prevents decision thrash. When the Pre-flight ADR fuzzy-match above resolved via the LAG, `status`/`decisions[]`/`date` are already in hand from that same `list_adrs` call — no second lookup needed to decide cooldown. When it resolved via the glob fallback, read the target ADR's frontmatter directly (unchanged, pre-`031.W4.3` behavior).

## Output
A pipeline report: the chain's artifacts (consolidation, ADR, epic, stories), the traceability matrix, the human-gate decisions (with audit trail), and the suggested next step (`/wave-execute {epic} {wave}` unless `--skip-wave-hint`).

## Decision points (interactive)
The human gates and any contested ADR decision → `AskUserQuestion` (or `/roundtable` for a multi-agent call). Standalone, ask directly; under an orchestrator, route through the conductor transport.

## Per-phase metadata (★)
Each phase records structured metadata (what it produced, decisions, skipped?, the gate verdict) — not prose — so the pipeline is resumable and auditable, and feeds the digest/learning loop.

## Blocking conditions
Epic-number collision (Pre-flight) · unresolved ADR ref · a human gate declined · an ADR in cooldown re-litigated without override · `--skip-phases` arg without the required pre-validated artifact. Surface to the human; never fabricate an approval.
