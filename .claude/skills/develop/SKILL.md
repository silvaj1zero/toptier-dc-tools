---
name: develop
description: Implement a story in the current worktree — feature-branch guard, REUSE>ADAPT>CREATE, entity/OCC awareness (db-bound), multi-engine self-heal review (/self-heal), test-before-done, local commits only. Adopts the story's executor persona. Three modes. Two-channel learning. Delegates push to @devops.
version: "1.1.0"
context: inline
agent: dev
user-invocable: true
argument-hint: "{story-path} [yolo|interactive|preflight]"
status: active
allowed-tools: Read, Edit, Write, Bash, Grep, AskUserQuestion, Agent, Skill
---

# /develop — Story Development

Implement a story's tasks, write tests, **self-heal via a second engine**, commit locally on a feature branch, and hand off to `@devops` for push. Runs inline. Default mode: `interactive`.

## Dynamic agent binding
Read the story's `**Executor:**` field, strip `@`, **adopt that agent's persona** (`.aiox-core/agents/{id}.md`) for this run. Fallback: `dev`. `executor: @db-sage` → you are the DB specialist; `@architect` → the architect.

## Input
`$ARGUMENTS[0]` = story path (ask if absent). `$ARGUMENTS[1]` = mode (`interactive` default · `yolo` · `preflight`). Invalid → `interactive` + warning.

## Phase 0a — Learning loop, INBOUND (KB heuristics)
Zero-overhead if empty. Read approved heuristics from `.aiox/learning/approved/*.yaml`, relevance-filter by `task_mode`/`entity_input.entity_type`/`deploy_type`, inject a "Known Heuristics" block into the implementation context (in-memory; never written to the story). Absent → WARN + continue.
> **Overlay hook:** a project may bind a richer KB source (e.g. a `DS_KE_HE_*` corpus) via `.aiox-project`; the agnostic default is `.aiox/learning/approved/`.

## Phase 0b — Learning loop, OUTBOUND (lazy promotion)
Scan `.aiox/learning/entries/develop/*.yaml` for `status: draft` with `promotion_score ≥` threshold (`aiox.config.json → learning.promotion_thresholds`, default 3.5); prompt to promote (`y/n/1,2/d`), promote to `.aiox/learning/promoted/`, mark the entry (never delete). SINKRA promotion targets → overlay.

## Story analysis (AIOX fields + epic context + dynamic context)
`task_mode` sets the lens (`CRIAR` → entity create + artifact; `EXECUTAR` → status transition + artifact; `VALIDAR` → query/correctness; `REVISAR` → artifact quality; `CONSOLIDAR` → aggregation). `appetite`+`confidence_level` frame effort/risk. Read the epic `## Development Log` + prior Dev Agent Records + `.aiox/learning/logs/` gotchas (build on what the epic established — REUSE/ADAPT). `entity_input`/`entity_output` = the transition contract. Read bound architecture/SOT docs (resolved per project).

## Modes
- **Interactive (default)** — report progress, stop at blocking conditions, ask at critical checkpoints (architecture/library/algorithm/test) with options + trade-offs.
- **YOLO** — autonomous; 0–1 prompts. Record autonomous decisions (domain decisions → Phase 7a; metrics → 7b).
- **Pre-Flight** — surface ALL ambiguities up front, batch-ask, build an execution plan, get approval, then execute with zero further decision points.

## Gate — Constitutional
HALT unless: story file exists · status `Ready`/`InProgress` (NOT `Draft`) · has ACs · has ≥1 task. CLI First is a WARN (CLI before UI), not a block.

## Pre-Execution Branch Setup (NON-NEGOTIABLE — once, before the first commit)
Committing to `main`/`master` makes PR review structurally impossible. 1) `git branch --show-current`. 2) starts with `feat/{story_id}` → proceed. 3) `feat/{story_id}-*` exists → checkout it. 4) else → `git checkout -b feat/{story_id}-{slug}`. 5) re-confirm; if still `main`/`master` → **HALT, do not commit.**

## Implementation loop (per task)
1. Read the task fully (with the Gate lens).
2. **REUSE > ADAPT > CREATE** — before creating, search for an existing pattern/util/component (use a bound code-intelligence helper if the project configures one — `aiox.config.json`; else search manually). Never skip the discipline.
3. Implement task + subtasks. 4. Write tests. 5. Run local validations (lint · typecheck · tests). 6. Mark `[x]` **only if ALL pass**. 7. Update the File List incrementally. 8. Repeat.

## UI changes → design gate
If the change touches UI, consult **@design-ops** before creating a component (REUSE the design system bound via `aiox.config.json → design_system.root`). Dormant if no DS configured.

## Database changes → conditional DB verification (db-bound)
If the story touches the DB (migration, schema, or an `entity_input`/`entity_output` transition), verify against the project's database (`aiox.config.json → database`, the `@db-sage` binding). Skip entirely if it doesn't (dormant). **Entity transition:** code moves `entity.status` to the expected output + bumps the OCC `version`. **OCC:** every UPDATE to a versioned row guards `WHERE version = $expected`, sets `version = version + 1`, handles `rows_affected = 0`. Schema DDL → delegate to **@db-sage**. A violation is a HALT (don't mark `[x]`).
> **Overlay hook:** a project with a richer entity/artifact model (e.g. SINKRA's Real Value Cycle — `artifact_contract` linkage, advisory-lock specifics, checklist-execution recording) binds those deeper gates via `.aiox-project`. The agnostic core carries entity-transition + OCC only.

## Self-heal review (before done) → /self-heal
Before marking the story complete, run a **second-engine review** via **`/self-heal`** (the multi-engine, no-self-review loop — never the writing engine reviews its own diff). `/self-heal` routes the uncommitted diff to the project's available review engines (CodeRabbit / Codex / Gemini / … — F7 registry), aggregates + dedupes findings, auto-fixes CRITICAL/HIGH, re-reviews (circuit breaker). Mode is `/self-heal`'s (synchronous gate by default; concurrent opt-in). **CRITICAL persisting after the breaker → HALT** (don't set Ready-for-Review). If no review engine is available → graceful skip with an explicit blind-spot warning (never fake a review). Findings → Phase 7a (project); the run signal (engines, iterations, pass/fail) → Phase 7b (product).

## Story file updates — allowed vs forbidden
**Allowed:** Tasks/Subtasks checkboxes, the Dev Agent Record + all subsections (model, started/completed, debug log, completion notes, File List, Change Log), Status (only when complete → `Ready for Review`). **Forbidden:** the story description, Acceptance Criteria, Dev Notes, Testing sections. Same in all 3 modes.

## Ready-for-Review criteria (ALL true)
1. Code meets every requirement + AC. 2. All validations pass (lint, typecheck, unit + integration). 3. Follows repo conventions (absolute imports, no `any`, kebab-case files, PascalCase components). 4. File List complete + accurate. 5. `/self-heal` clean (no persisting CRITICAL) or an explicit no-engine warning recorded.

## Completion protocol
DoD check (the canonical DoD checklist; a project may bind a richer one via overlay) → set `Ready for Review` → emit the `develop` **ACK via `@aiox/conductor`** (Phase 6.5 pattern) → Phase 7 (7a + 7b) → **HALT, delegate push to @devops** (never push directly). If `deploy_type` is set, note it for `/verify` (the deploy-specific check matrix is resolved by `/verify` + overlay, not hardcoded here). Next: `@qa` runs `/review`.

## Phase 7 — Two-channel learning (ADR-COCKPIT-LEARNING-TELEMETRY)
- **7a — Project learning** → `.aiox/learning/logs/develop/develop-{story-id}-{ts}.yaml` (domain: decisions, task_mode, entity transition, files, what worked/failed). Drives the next `/validate` enrichment + promotion.
- **7b — Product telemetry** → the Channel-2 buffer via `@aiox/conductor` (framework metrics ONLY per the allowlist: duration, tokens, mode, self-heal engines+iterations, OCC-violation count, gate outcomes — NO code/story content). Anonymized, opt-in, user-inspectable.
Both mandatory-emit, best-effort-write (warn, never HALT).

## Conductor integration (fail-closed)
No `CONDUCTOR_ACTIVE` → ignore; behavior identical to standalone. Under `CONDUCTOR_ACTIVE=true`: a PreToolUse hook intercepts `AskUserQuestion` (decision checkpoints, Pre-Flight batch, blocking conditions) — do NOT retry it; poll `<CONDUCTOR_ROOT_DIR>/.sdc-resolution/<CONDUCTOR_STORY_ID>/resolved.json`, use `instruction` (halt/stop → HALT) else `selected`, clear it. **Timeout `CONDUCTOR_DECISION_TIMEOUT_MS` (default 1800000) → HALT fail-closed + `idle_no_ack` telemetry.** Never fall back to `AskUserQuestion` under conductor (re-intercept → infinite loop). Never set `CONDUCTOR_ACTIVE` (skills only read).

## Decision points (interactive)
Critical decisions (architecture/library/algorithm/test) + blocking conditions → `AskUserQuestion`. Standalone: ask directly. Under an orchestrator: routes through the conductor — never substitute prose for the tool.

## Blocking conditions (HALT)
1. Unapproved dependency (declare + ask). 2. Ambiguity surviving the story + Dev Notes + epic + bound docs. 3. Three consecutive failures on the same item. 4. Missing required config not inferable. 5. Regression (previously-passing tests fail) — revert or get approval. 6. DB violation (missing version guard / wrong transition). 7. `/self-heal` CRITICAL persisting after the circuit breaker. In every HALT: state the problem, ask for guidance, don't mark tasks complete, don't change status. Emit the `develop` ACK with `status: failed` before ending.

## Red flags
"Commit first, tests later" · "mark done before /self-heal runs" (a second engine catches what self-implementation missed) · "I'll update the File List at the end" · "this path looks right, I won't check" · "skip the code-intel/REUSE search — it's optional" (optional = graceful fallback when unbound, not optional discipline) · "this small-table UPDATE doesn't need a version guard" (OCC is an invariant, not an optimization).

## Git
Local only (`add`/`commit`/`status`/`diff`/`log`/`branch`/`checkout`). **Push/PR is `@devops`-exclusive.**
