---
name: review
description: Quality-gate review of a completed story — self-heal gate (/self-heal), risk-assessed depth, AC+conditions, NFR validation, code quality, tests, complete-findings, deterministic gate-decision order + quality score, machine-readable gate file. Status-READ-ONLY (writes QA Results only, NEVER status). Anti-self-validation (quality_gate ≠ executor). Verdict PASS/CONCERNS/FAIL/WAIVED.
version: "1.1.0"
context: inline
agent: qa
user-invocable: true
argument-hint: "{story-path}"
status: active
depends_on: ["/self-heal"]
allowed-tools: Read, Edit, Write, Bash, AskUserQuestion, Agent, Skill
---

# /review — Story Quality Gate

Run the quality gate on a completed story: a second-engine self-heal pass, a risk-calibrated review across the gates, every finding resolved, a **deterministic verdict** + a machine-readable gate file. Runs inline as the `qa` persona (or the story's declared quality gate). **Informative only — never closes.**

## Role boundary (NON-NEGOTIABLE) — status-read-only
`/review` **reads and analyzes; it NEVER writes `status` or any frontmatter outside `## QA Results`.** Only `/close` transitions a story to Done.

**GATE-STATUS-MUTATION (HARD):** any urge to edit `status` → STOP, emit `ROLE BOUNDARY VIOLATION — /review cannot mutate status; the owner must invoke /close`, HALT. Do not close inline. Do not narrate "via /close" without invoking it. Emit a Channel-2 telemetry event (`review_close_collapse`, a `out_of_sequence` subtype) when triggered.

**Branch-A hard-stop:** if the resolved `quality_gate` persona is ALSO the story's closer (role-collapse — e.g. `quality_gate == @po` and `@po` will close), HARD-STOP: remit to the owner to invoke `/close`; `/review` never closes inline. A structural gate, not advisory prose.

## Anti-self-validation (absolute)
The quality-gate agent MUST differ from the executor. If the resolved QG was the story's executor → **HALT** and escalate to a different agent (e.g. `@architect`). Evaluated BEFORE the dynamic binding takes effect — self-validation invalidates the review regardless of persona.

## Dynamic agent binding
Read the story's `**Quality Gate:**` field, strip `@`, adopt that agent's persona (`.aiox-core/agents/{id}.md`) for the review lens (`@architect` → architecture, `@db-sage` → data). Fallback: `qa`.

## Input
Story path from `$ARGUMENTS` (ask if absent). Prerequisite: `Ready for Review`, executor's work committed (not pushed), Dev Agent Record + File List populated. Blocking pre-conditions (HALT): story file missing critical sections · File List empty · no acceptance criterion.

## Phase 0 — Learning loop (two-way) + setup
- **0a INBOUND:** inject relevant approved heuristics from `.aiox/learning/approved/` (filter by task_mode/review tags) to calibrate the review (in-memory; never written to the story). Overlay may bind a richer KB.
- **0b OUTBOUND:** lazy-promote `.aiox/learning/entries/review/` draft entries ≥ threshold (config). SINKRA promotion targets → overlay.
- Read the story: `executor`, `task_mode`, `entity_*`, `artifact_contract`, `involves_ui`, `deploy_type`, `quality_gate`. If `involves_ui` → spawn the design gate (`ds-quality-gate` / `@design-ops`) in parallel.

## Gate 1 — Self-heal pass (/self-heal)
Run **`/self-heal`** on the committed diff (multi-engine, no-self-review — the reviewer engine ≠ the writer). Its findings feed the analysis; **`/self-heal` HALT (CRITICAL persists) → Gate = FAIL (automatic)**. No engine available → graceful skip with a recorded blind-spot warning (never fake). Replaces the old single-tool CodeRabbit loop; CodeRabbit is just one F7 adapter now.

## Phase 1 — Risk assessment (locks the review depth)
Lock `risk_profile: standard | deep` BEFORE analysis. **Auto-escalate to DEEP** if ANY: (1) auth/payment/security files touched · (2) no tests added · (3) diff > 500 lines · (4) prior gate was FAIL/CONCERNS · (5) > 5 acceptance criteria · (6) any modified file has > 10 consumers (when a code-intel binding reports it). Record the triggered conditions. Defaulting to standard on a deep-criteria story is an un-fixable quality escape.

## Phase 2 — The gates (evaluate all; classify each finding CRITICAL · HIGH · MEDIUM · LOW)
1. **Acceptance Criteria** — each AC met + traced to a test (record `ac_covered[]` / `ac_gaps[]`).
2. **Validation Conditions** — every `VC-N` addressed (unmarked → CONCERNS; absent section → PASS).
3. **Code quality + standards** — conventions, structure, no security/perf anti-patterns.
4. **Tests + coverage** — tests per feature, pass, cover real paths; regression clean.
5. **File List accuracy** — matches what changed. **Read it from git, never from the prose.** Run `git show --name-only <sha>` (or `git diff --name-only <base>..<head>`) and diff that set against the declared File List **in BOTH directions** — declared-but-unchanged is as much a defect as changed-but-undeclared.
   - **5b — Commit provenance (MANDATORY, not optional depth).** Open the actual commit(s), not just the file set: `git log --format='%h %s%n%b' <range>`. Verify (i) a squashed PR did not smuggle in **sub-commits belonging to other work** — read the squashed body, each `*` bullet is a separate change; and (ii) every `[Story X]` trailer in that range **resolves to exactly one story, and that story is THIS one**. A trailer naming a different story, or an id that resolves to two stories (epic numbers collide in this repo), is a finding — the work it labels has no gate of its own.
   > **Why this is a gate and not advice:** it is the step that found the worst defect this pipeline has caught. Round 1 of a review saw the *symptom* (a self-contradicting comment in a workflow) and stopped there; only when round 2 traced where that comment came from did it surface that the PR had squashed a second sub-commit tagged with **another epic's** story id — real changes to a release-adjacent workflow that lived on `main` for 8 days with no story, no ACs, no gate and no Development Log entry. No file-set diff catches that; only reading the commits does.
6. **NFR validation** — record PASS/CONCERNS/FAIL for **security · performance · reliability · maintainability**.
7. **Design gate (if UI)** — `ds-quality-gate` / `@design-ops` must PASS (tokens, a11y, REUSE, bound DS).
> **Overlay hook (domain gates plug into the decision order):** a project binds extra hard-gates via `.aiox-project` — e.g. SINKRA's entity-lifecycle, OCC-compliance, artifact-linkage, sandbox-cleanup, and external-security (`sec/*`) gates. They register as hard-gates (rule 0 of the decision order) + their own checklists. The agnostic core ships gates 1–7.

## Active refactoring authority
The QG MAY directly improve code within scope (style, small structural fixes) + record it under `Refactoring Performed` — never expand scope, change ACs, or touch `status`/File List. Out-of-scope → a finding, not a silent edit.

## Complete findings (NON-NEGOTIABLE)
Every finding ends in FIXED · WON'T_FIX (written justification) · DEFERRED (tracked task + owner). No "blockers only". Found N → resolve N. End QA Results with a resolution table + `Total: resolved/total`.

## Gate decision — deterministic order (first match wins)
0. **Hard-gates FAIL** (core gates 1–7 + any overlay-registered domain hard-gate) → **FAIL**.
1. **/self-heal exhausted** (CRITICAL persists) → **FAIL**.
2. **Risk thresholds** (if scored): any risk ≥ 9 → FAIL; ≥ 6 → CONCERNS.
3. **Coverage gaps:** a missing P0 security/data-loss test → FAIL; other P0 gap → CONCERNS.
4. **Issue severity:** any HIGH → FAIL (unless waived); any MEDIUM → CONCERNS.
5. **NFR:** any FAIL → FAIL; any CONCERNS → CONCERNS; all PASS → PASS.
**WAIVED** only with `waiver.active: true` + `reason` + named `approver`.

## Quality score (deterministic baseline)
`quality_score = clamp(0..100, 100 − 20×count(FAIL) − 10×count(CONCERNS))` over {gates 1–7, design gate, any overlay domain-gate, NFRs}. If the project configures a rubric (`aiox.config.json`), use its weights; **HALT-no-fallback** if a configured rubric is declared but unreadable (a fabricated score is worse than none).

## Verdict
**PASS** (all clear → `/close`) · **CONCERNS** (non-blocking, documented; owner decides) · **FAIL** (blocking → back to the executor with a fix list / `/apply-qa-fixes`) · **WAIVED** (accepted with written rationale).

## Outputs
- **QA Results (prose)** — append to the story's `## QA Results` (create if absent): verdict, per-gate results, risk profile + triggers, self-heal outcome, refactoring performed, findings resolution table + `Total: resolved/total`, and:
  ```
  ### QG Verdict
  Gate: PASS | CONCERNS | FAIL | WAIVED
  Next: /close {story-path} by the owner — /review does NOT close.
  ```
- **Gate file (machine-readable)** — write `gate-{story-id}-{epic-slug}-{ts}.yaml` (path bound per project; default `.aiox/qa/`). **The `{epic-slug}` is NOT decorative.** A `story-id` already carries the epic NUMBER (`023.W1.1` -> epic 023), so the number alone disambiguates nothing — and epic numbers have collided in practice: this repo has carried duplicated epic numbers in practice. The `023` pair (`023-actions-budget-containment` × `023-role-aware-distribution`) made **`023.W1.1` name two different stories** — `reduce-premium-runner-fanout` and `distribution-portal-worker` — both with that exact `story_id` in their frontmatter; it was resolved on 2026-07-28 by renumbering the budget epic to `042-*`. The **`028` pair is still live** (`028-browser-copilot-collaborative` × `028-cockpit-update-experience`), so the hazard is current, not historical. Note also that renumbering does NOT retroactively fix commit trailers: `[Story 023.W1.1]` in git history still resolves ambiguously for commits made before the rename — which is precisely why the file name must carry the slug regardless of how clean the epic numbering looks today. Without the slug their gates share a filename stem and a `PASS` from one reads as evidence for the other — the fake-green `CHK-9` exists to prevent. Also emit `epic_slug` as a first-class field INSIDE the yaml (not only in the filename), so a consumer globbing by story id can still disambiguate. Content:

## Phase 7 — Two-channel learning (ADR-COCKPIT-LEARNING-TELEMETRY)
- **7a Project** → `.aiox/learning/logs/review/…` (the findings, gate results — domain).
- **7b Product telemetry** → Channel-2 buffer via `@aiox/conductor` (framework metrics only: gates run, verdict, quality_score, risk_profile, self-heal engines+iterations, NFR statuses, duration/tokens — NO finding text, NO code). Anonymized, opt-in.
Both best-effort (warn, never HALT).

## ACK
Emit the `review` ACK via **`@aiox/conductor`** (`status`: `passed` for PASS/CONCERNS/WAIVED, `failed` for FAIL; carry `gate`, `quality_score`, and `finding_categories[]` when PASS-with-CONCERNS so an AL3 category-restricted auto-fix loop can bound itself). Writing the ACK does NOT authorize a status transition — Role Boundary stands.

## Conductor integration (fail-closed)
No `CONDUCTOR_ACTIVE` → ignore. Under it: `AskUserQuestion` is intercepted; poll `<CONDUCTOR_ROOT_DIR>/.sdc-resolution/<CONDUCTOR_STORY_ID>/resolved.json`, use `instruction`(halt→HALT) else `selected`, clear it; timeout (default 1800000) → HALT fail-closed + `idle_no_ack`. Blocking conditions (scope mismatch, architectural issue) route through the conductor, not a direct prompt. Never re-`AskUserQuestion` under conductor; never set `CONDUCTOR_ACTIVE`.

## Decision points (interactive)
A genuine judgment call (accept a CONCERNS, waive an issue) → `AskUserQuestion` (standalone: ask directly; under orchestrator: via the conductor).

## Blocking conditions (HALT)
Story incomplete (missing Dev Agent Record / empty File List / no AC) · no tests when the ACs required them (→ immediate FAIL) · `/self-heal` exhausted (→ FAIL) · code doesn't match the story's requirements · critical architectural issue (→ `@architect`) · anti-self-validation violated (→ escalate). Emit the `review` ACK before ending.

## Red flags
"I'll set it to Done" (status-read-only is HARD) · "report blockers, rest later" (complete-findings: resolve all N) · "I reviewed my own code" (anti-self-validation HALT) · "review passed, I'll close it" (premature-close — Branch-A hard-stop; only `/close` closes) · "standard review, the story's simple" (risk assessment is objective, not a vibe) · "skip the self-heal, tests pass" (a second engine catches what tests don't).

## Git
Read-only (`status`/`log`/`diff`). `/review` never commits or pushes.
