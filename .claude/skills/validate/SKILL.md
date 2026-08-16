---
name: validate
description: Validate a story draft — 15-point check, auto-fix should-fix issues, ENRICH the story from the epic's Development Log + the learning KB, write Validation Conditions, transition Draft → Ready. Anti-self-validation (quality_gate ≠ executor). Conductor-aware (fail-closed). Standalone, interactive.
version: "1.3.0"
context: inline
agent: po
model: opus
model_floor: opus
user-invocable: true
argument-hint: "{story-path}"
status: active
allowed-tools: Read, Edit, Write, Glob, Bash, AskUserQuestion
---

# /validate — Story Draft Validation

Validate a dev story draft, **enrich it with what the epic + the learning KB already established**, auto-fix the mechanical gaps, and transition it `Draft → Ready`. Standalone and interactive (asks the human directly on genuine ambiguity); under an orchestrator, decisions route through the conductor. Runs as the `po` persona (or the story's quality gate).

## Model Floor (NON-NEGOTIABLE)
This skill REQUIRES **Opus**. In one session it loads CLAUDE.md + rules + the story + the parent epic + the epic's prior Done stories (Phase 2) + the template — easily 80–150K tokens of iterative tool use, above Sonnet's reliable single-turn budget (empirical autocompact-thrash, 2026-05-24). Dispatchers (`/wave-execute`, `/full-cycle`) SHOULD honor `model_floor`; refusing a Sonnet assignment is cheaper than the thrash.

## Input
Story file path from `$ARGUMENTS`. If absent, ask the user.

## Test mode — `--test` (NON-NEGOTIABLE contract)
`/validate <story-path> --test` runs the skill **exactly as it always runs** — same 15 checks, same
phases in the same order, same verdict logic, same HALT conditions — and **only redirects where the
side effects land**. This is the whole contract, and the reason it is trustworthy:

> **`--test` MUST NOT change behavior. It changes destination.**
> Any test mode that skips a check, softens a gate, or short-circuits a phase is testing itself, not the
> skill — the result would say nothing about the real run. If you ever find yourself branching on
> `--test` anywhere other than a *path*, stop: that is the anti-pattern this contract exists to forbid.

**Sandbox root** (per run, per adapter — so parallel pairs never collide):
`.aiox/test-kits/validate/runs/<AIOX_TEST_RUN_ID>/<AIOX_ADAPTER_ID>/effects/`
`AIOX_ADAPTER_ID` is already injected by the spawner; `AIOX_TEST_RUN_ID` comes from the caller. If either
is absent → HALT with a clear message (never silently fall back to the production paths — that is exactly
the collision this mode prevents).

**What redirects** (each is the same write, to a different root):

| Effect | Normal | Under `--test` |
|---|---|---|
| Phase 6.5 ACK | `.sdc-ack/<story>/validate.ack` | `<sandbox>/sdc-ack/<story>/validate.ack` |
| Phase 7 learning log | `.aiox/learning/logs/validate/…` | `<sandbox>/learning/logs/validate/…` |
| Phase 0b promotion target | `.aiox/learning/promoted/` | `<sandbox>/learning/promoted/` |

**What does NOT change:** the story file itself is still written in place (it IS the artifact under test —
the caller supplies a disposable copy), every check still runs, every verdict is still real, and the
Phase 0b prompt still asks the human.

**Phase 0b under `--test`:** the prompt still fires (it is a measured decision channel), but a `y`
promotes into the sandbox, never into the project KB.

## Verdicts
- **GO** · all checks pass → Ready. **GO with Auto-Fix** · minor issues fixed → Ready. **GO Conditional** · ready with Validation Conditions written into the story → Ready. **NO-GO** · blocked, list issues; stays Draft.

## Dynamic agent binding
Read the story's `**Quality Gate:**` field, strip `@`, adopt that agent's persona (`.aiox-core/agents/{id}.md`) for verification depth (e.g. `@db-sage` → data lens). Fallback: `po`. The binding refines the lens; it NEVER relaxes check [6] (anti-self-validation) nor transfers status-transition authority.

## Sequential — run all phases in order; accumulate all findings, don't exit early.

## Step 0 — Idempotency guard
Read `Status`. **If `Done` → ABORT** with a clear message ("re-validation requires explicit reopen"), make NO changes — and run NOTHING below (no learning promotion). Re-runs (delayed agent action / human error) must be side-effect-free.

## Phase 0a — Learning loop, INBOUND (KB heuristics injection)
Zero-overhead if the KB is empty. Read approved heuristics from `.aiox/learning/approved/*.yaml`, relevance-filter by the story's `task_mode` / `entity_input.entity_type` / `deploy_type` (+ cross-cutting tags: `validation`, `draft-to-ready`, `quality-gate`), and inject a **"Known Heuristics"** block into the validation context (in-memory — NEVER written to the story file). Phase 3/4 then flag known anti-patterns + prefer KB-recommended fixes, citing the heuristic id. Absent KB → WARN + continue (zero-regression).
> **Overlay hook:** a project may bind a richer KB source (e.g. a curated `DS_KE_HE_*` corpus) via its `.aiox-project` overlay; the agnostic default is `.aiox/learning/approved/`.

## Phase 0b — Learning loop, OUTBOUND (lazy promotion)
> Under `--test`, the prompt still fires (measured channel) but promotion targets the sandbox (see §Test mode).
Scan `.aiox/learning/entries/validate/*.yaml` for `status: draft` entries with `promotion_score ≥` the threshold (read from `aiox.config.json → learning.promotion_thresholds`, default `pattern: 3.5`). If candidates exist, prompt the human (`y=all / n=skip / 1,2=select / d=defer`) and, for approved ones, promote to the project's heuristics store and mark the entry `promoted` (never delete). The agnostic target is `.aiox/learning/promoted/`.
> **Overlay hook:** SINKRA-specific promotion targets (L2 decision-cards / L3 heuristic docs under `squads/.../heuristics/`) are an `.aiox-project` overlay concern; the core only owns the agnostic mechanism + the `.aiox/learning/` paths.

## Phase 1 — Gates
Story file exists + readable (else HALT) · Status is `Draft` (else HALT) · load the canonical story template / known required sections for the completeness comparison (a project may bind its own template path via the overlay; default = the bundled template `.aiox-core/product/templates/story-tmpl.md` — its frontmatter block IS the field/enum/invariant contract checked in Phase 3).

## Phase 2 — Epic context, Development Log & enrichment (the temporal inbound channel)
Complements Phase 0a (atemporal KB) — this is the temporal read of the epic's state. It **enriches and updates the story**:
1. Read the parent epic, including its `## Development Log` — the running record of what each prior story shipped (written by `/close`).
2. Read prior `Done`/`InReview` stories' Dev Agent Records: decisions, files created/modified, patterns set.
3. Read this skill's recent execution logs (`.aiox/learning/logs/validate/`) for known gotchas in this epic's domain.
4. **Enrich + write into the story:** inject established decisions into Dev Notes; any "Create" of a file that already exists (per the Development Log / disk) → rewrite as **ADAPT, not CREATE**; carry forward gotchas as Dev Notes / Validation Conditions; align so the story doesn't contradict prior `Done` work.

Produce an Epic Context Summary. Validating without this is the main source of cross-story divergence.

## Phase 3 — The 15-point check
**Core (dev-story quality):** **[1]** descriptive title + naming · **[2]** clear problem/objective (what & why) · **[3]** ACs testable (given/when/then) · **[4]** tasks decomposed · **[5]** executor defined + **resolvable in `.aiox-core/agents/`** · **[6]** quality_gate defined **AND ≠ executor** (anti-self-validation, **NON-NEGOTIABLE**) · **[7]** `deploy_type` defined · **[8]** `depends_on` verified (Done or planned) · **[9]** Dev Notes sufficient to implement · **[10]** aligned with epic, no contradiction.

**Code Reality Check + anti-hallucination (★):** every concrete reference (files, functions, agents, prior stories, paths) must resolve against reality (disk, agent registry, epic). A non-existent reference is a hallucination → flag, never pass through. Dedup against Phase 2 (re-specifying an existing artifact = ADAPT, not CREATE).

**AIOX planning fields (NO-GO if missing):** **[11]** `appetite` (`1d|3d|5d|10d`; `>10d` → shape smaller) · **[12]** `hill_phase` (`figuring_out|executing|done`; `figuring_out`+`Ready` = contradiction) · **[13]** `confidence_level` (`know-how 1.0x|needs-spike 1.5x|high-risk 2.0x`, reflected in appetite) · **[14]** `task_mode` (`CRIAR|VALIDAR|EXECUTAR|REVISAR|CONSOLIDAR`; auto-fix: infer from ACs) · **[15]** `entity_input`+`entity_output` when `task_mode ∈ {CRIAR, EXECUTAR}` (`status_expected` must differ — a real transition); N/A otherwise.

**Real-display safety-net (heuristic, non-blocking — Epic 014 W1.3):** if the Acceptance Criteria contain visual-confirmation language ("confirm visually"/"confirmar visualmente", "screenshot", or an equivalent semantic — a human-eyes-on-a-rendered-UI check) AND `requires_real_display` is absent or `false`, raise a SHOULD-FIX: the story likely needs a session with a real display/TCC available before `/develop` starts (this recurred 3× unflagged in Epic 013 — `013.W2.1`/`013.W3.1`/`013.W4.1`). This is a safety-net, not a veto — it never blocks `Draft → Ready` by itself, and it is orthogonal to `e2e_verification` (POST-hoc, `/verify`-owned, `deploy_type ≠ none` only). If `requires_real_display: true` is already set, the field itself covers the signal — do NOT also raise the heuristic (no duplicate finding).

Classify each finding CRITICAL · SHOULD-FIX · OBSERVATION.

> **Sections `## Acceptance Criteria` / `## Tasks / Subtasks` — pure, anchored headings.** The
> `/full-cycle` dispatch guard matches them with `^## …$`, so a decorated heading (a qualifier appended
> after the title, e.g. `## Acceptance Criteria (spike — …)`) reads as ABSENT and the story cannot be
> dispatched. Put the qualifier in a note UNDER the heading, never in it. This is checked mechanically
> in **Phase 5.5** — flag it here as a should-fix so Phase 4 fixes it before the gate runs, rather than
> letting the gate be the first to say no.

> **Domain gates (overlay):** projects with extra story classes bind additional conditional gates via `.aiox-project` (e.g. SINKRA's DB-migration gates — schema parity / prod-drift / expand-contract — under the `db-sage` lens). The agnostic core does NOT carry domain-specific gates.

## Phase 4 — Auto-fix (mandatory)
Apply every should-fix with Edit, then re-read to confirm. Auto-fix: missing `appetite`/`task_mode`/`deploy_type`/`hill_phase`/`confidence_level` (infer) · non-testable ACs → given/when/then · missing Dev Notes → from epic context · deprecated executor → replace · Phase 2/0a enrichment (decisions, ADAPT-not-CREATE, KB-recommended fixes). **Do NOT auto-fix (flag NO-GO):** business decisions not derivable from inputs · scope changes (new/removed ACs) · `executor == quality_gate` · dependencies not Done with no alternative.

## Phase 5 — Validation Conditions (non-blocking)
If non-blocking observations remain, add a `## Validation Conditions` section (`VC-1`, `VC-2`, … checkboxes) after Acceptance Criteria. If none, no empty section. (Conditions in chat vanish on compaction; in the story every agent sees them.) When the Phase 3 real-display safety-net fires, it ALWAYS becomes one such VC — explicitly labeled (e.g. `VC-n — requer display real / confirmação visual humana antes do /develop`) — reusing this same mechanism, never a parallel output.

## Phase 5.5 — Mechanical dispatch gate (`full-cycle-guard`, BLOCKING) — REUSE, never a second checker

**Runs AFTER Phase 4, never before.** The order is load-bearing: Phase 4 auto-fixes missing
`deploy_type`/`appetite`/`task_mode`/etc., so a guard placed earlier would HALT on exactly the fields
this skill is supposed to fill. This gate asks a different question — *"would `/full-cycle` accept this
story if it were dispatched right now?"* — and it can only be answered on the post-auto-fix text.

**Invoke the guard the `/full-cycle` itself uses** (REUSE > ADAPT > CREATE — never re-implement its
checks here; a second copy of the contract drifts on day 1):

```bash
node <repo-root>/.aiox-core/skills/full-cycle/scripts/full-cycle-guard.mjs inspect <story-path>
```

Resolve the script path relative to the repo root (same discipline as `lag-query.mjs`), never a
machine-absolute path. It prints one JSON line: `{"ok":true,…}` or `{"ok":false,"code":…,"message":…}`.

| Guard verdict | What `/validate` does |
|---|---|
| `ok: true` | proceed to Phase 6 |
| `STORY_SECTIONS_MISSING` · `STORY_FIELD_MISSING` · `STORY_FIELD_INVALID` | **NO-GO** — story stays `Draft`, the guard's `code`+`message` go verbatim into the remediation list and the Change Log |
| `ANTI_SELF_VALIDATION_UNRESOLVED` | **NO-GO** — the same verdict Phase 3 `[6]` already reaches (`quality_gate ≠ executor`); the guard is the mechanical second opinion, not a new rule |
| `STORY_FRONTMATTER_MISSING` | **NO-GO** — the file has no frontmatter block at all. Judge whether it is a story at all: this repo has at least one file under `stories/` that is a *report*, not a story (`031.W3.5`), and fabricating story headings onto it would manufacture conformance |
| `STORY_PATH_REQUIRED` · `STORY_PATH_INVALID` · `STORY_OUTSIDE_PROJECT` | HALT — the invocation is wrong, not the story: no path given, path is not an existing `.md`, or it resolves outside the project root. A `/validate` bug or a bad call, never a story defect |
| `STORY_ALREADY_DONE` | unreachable here (Step 0 aborts on `Done` first). If it ever fires, HALT — it means Step 0 was bypassed |
| script absent / not executable / non-JSON output | **WARN + continue** — graceful degradation, never a hard failure (see below) |

**Graceful degradation (NON-NEGOTIABLE, AC5-style).** A project may consume `/validate` without the
`/full-cycle` skill installed. Absent script ⇒ warn (`"dispatch gate skipped — full-cycle-guard not
found; story not mechanically verified against the dispatch contract"`) and continue with the
pre-existing behavior. The gate is a **preferred fast lane**, never a hard requirement — same contract
`lag-phase0-query.md` establishes for the LAG. Never fabricate a pass; never silently skip.

**Why this exists (measured, not theoretical).** `/validate` and `/full-cycle` were enforcing *different*
contracts: the guard requires `^## Acceptance Criteria$` and `^## Tasks / Subtasks$` — pure, anchored
headings — and `/validate` never ran that check. A sweep of this repo's 370 stories on 2026-08-09 found
**17 promoted to `Ready`/`InProgress` that `/full-cycle` would reject**, in 7 epics.

The failure mode is what makes it BLOCKING rather than advisory: a rejected story does **not** fail
loudly at dispatch. The child sits at `waiting_input` with `pane_alive: true`, the escalation becomes a
`Notification` that never reaches `aiox-core wave pending`, and nothing distinguishes it from "working
slowly." Story `052.W2.3` burned ~72 minutes that way and was only diagnosed by reading the child's
JSONL transcript by hand. This gate moves that cost from dispatch-time (silent, ~72 min) to
validation-time (loud, one line).

> **Agnosticism note (AP5, `skill-agnosticism.md`):** this phase adds no orchestrator dependency —
> Modes 1-5 (standalone) are unchanged. `/validate` still runs anywhere, still writes no worktree, and
> still needs no `CONDUCTOR_ACTIVE`. The guard is invoked as a plain subprocess on a file path; it reads
> nothing but the story.

## Phase 6 — Status transition + Change Log
Append a `## Change Log` entry (date · `@po` · verdict · checks · auto-fixes · conditions · enrichment · **the Phase 5.5 guard verdict — `ok` or the `code` that blocked**). **GO/GO-Auto-Fix/GO-Conditional** → `Status: Draft → Ready` (and `hill_phase: figuring_out → executing` if applicable). **NO-GO** → stays Draft + remediation list. **A story NEVER reaches `Ready` with a failing Phase 5.5 gate** — that is the whole point of the phase, and it is the one condition here that no verdict can override. The PO is not a manual gateway: a GO transitions automatically. A validation that leaves no Change Log trace is unauditable.

## Phase 6.5 — Phase-completion ACK (via the conductor)
> Under `--test`, the ACK is written to the sandbox root instead (see §Test mode). Same call, same
> status semantics, different destination.
Emit the `validate` phase-completion marker **through `@aiox/conductor`** (the in-process/native conductor when the cockpit hosts the run; the file-protocol transport otherwise — `.sdc-ack/<story>/validate.ack`, relative-to-cwd). `status`: `passed` (GO*) | `failed` (NO-GO) | `halted` (a HALT after Phase 3). The conductor owns the ACK protocol — the skill calls it; it does NOT hand-write the file nor depend on a project-specific lib. Outside a conductor/worktree context the conductor returns a graceful no-op — not a failure.

## Phase 7 — Execution learning log
> Under `--test`, the log is written to the sandbox root (see §Test mode).
Write a short log to `.aiox/learning/logs/validate/validate-{story-id}-{YYYYMMDD-HHmmss}.yaml` (verdict, checks passed/failed/auto-fixed, enrichment applied, ack result, what worked/failed, `confidence`, `source_type: skill_execution`). Feeds the conductor digest + the next validation's Phase 0a/2 read + Phase 0b promotion. On write failure: warn, never halt, never skip.

## Conductor integration (fail-closed)
Fast path: no `CONDUCTOR_ACTIVE` in env → ignore this section; behavior is identical to standalone. Under `CONDUCTOR_ACTIVE=true` a PreToolUse hook intercepts `AskUserQuestion` before it runs; do NOT retry it or seek input another way. Poll `<CONDUCTOR_ROOT_DIR>/.sdc-resolution/<CONDUCTOR_STORY_ID>/resolved.json`, use `resolved.instruction` (halt/stop → HALT) else `resolved.selected`, then clear it (single consumption). **Timeout (NON-NEGOTIABLE): if `resolved.json` doesn't appear within `CONDUCTOR_DECISION_TIMEOUT_MS` (default 1800000) → HALT fail-closed + emit `idle_no_ack` telemetry.** Never fall back to `AskUserQuestion` under conductor (the hook re-intercepts → infinite loop). All non-conductor modes are unaffected (agnosticism).

## Decision points (interactive)
Genuinely ambiguous/conflicting ACs (DP-V1) or scope conflict with a dependent story (DP-V2) → ask via `AskUserQuestion`. Standalone: ask directly. Under an orchestrator: the decision routes through the conductor — never substitute prose for the tool.

## Red flags
"Flag but don't fix" (auto-fix is mandatory) · "skip the Change Log" (invisible validation) · "leave it Draft for the author" (a GO auto-transitions) · "validate without the epic Development Log" (the main divergence source) · "Sonnet is fine, the epic is small" (`model_floor: opus` is NON-NEGOTIABLE) · "timeout under conductor → ask the user directly" (FORBIDDEN — fail-closed HALT + `idle_no_ack`).

## Blocking conditions (HALT)
Story not found · already past Draft · `executor == quality_gate` · dependencies not Done with no alternative · scope-changing issues · missing required AIOX field with no inferable auto-fix · conductor decision timeout (fail-closed). On any HALT after Phase 3, emit the `validate` ACK with `status: halted` before ending.
