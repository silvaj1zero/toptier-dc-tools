---
name: full-cycle
description: Full SDC lifecycle for ONE story via real Agent Teams — fail-closed story/tool preflight + exact spawn budget → validate → develop → review (self-heal + real QG loop) → [deploy → verify] → close. Sequence Lock + Post-Phase Verification Gate + provenance dispatch + two-channel telemetry.
version: "1.3.0"
context: conversation
agent: aiox-chief
user-invocable: true
argument-hint: "{story-path} [yolo|interactive]"
depends_on: ["/validate", "/develop", "/review", "/deploy", "/verify", "/close"]
status: active
allowed-tools: Read, Bash, AskUserQuestion, TeamCreate, SendMessage, TeamDelete
---

# /full-cycle — Full SDC Lifecycle (one story)

Run one story end-to-end through the SDC via **Agent Teams** — each phase executed by the right agent under its full skill protocol. The MAIN session adopts the `aiox-chief` coordinator persona as team-lead; it orchestrates, it never implements a phase itself.

**Invocation:** `/full-cycle {story-path} [yolo|interactive]` (default `interactive`).

## Real teams — the cockpit's win (NON-NEGOTIABLE)
Spawn the teammates — `@po`, the story's `@{executor}`, `@{quality_gate}` — as **separate agents** (native cockpit panes). Because the cockpit's `.aiox-core` footprint is lean (small rules + lean personas), spawning a teammate does NOT inject the ~500 KB of governance context that forces consolidation elsewhere. So the **QG loop is real**: the executor and a *different* QG agent converse until PASS — the reviewer is never grading its own work. Do NOT collapse to a single consolidated agent unless a real thrash is observed; if it ever is, that's a footprint bug to fix, not a reason to consolidate.

## Modes
`interactive` (default — report progress, stop at blocking conditions, ask at decision points) · `yolo` (autonomous; stop only at absolute blockers).

## Mechanical safety preflight (BEFORE Phase 0b — NON-NEGOTIABLE)

Resolve `scripts/full-cycle-guard.mjs` relative to this loaded `SKILL.md`; never substitute a global,
legacy, or project-local lookalike. The guard is the mechanical layer for story validation and the
per-run spawn budget:

1. Run `node <skill-dir>/scripts/full-cycle-guard.mjs inspect "<story-path>"` before any team creation
   or child spawn. Any non-zero result is a hard HALT. A missing file, non-Markdown argument, path
   outside the current project, malformed frontmatter, missing AC/tasks, `Done` story, or unresolved
   anti-self-validation therefore produces **zero child attempts**.
2. Inspect the tools actually available in the current invocation transport. Native Agent Teams means
   both a native teammate-create operation and native direct teammate messaging/lifecycle operations
   are present now. Engine name, registry metadata, shell access, or a configured adapter are not proof.
   Run `node <skill-dir>/scripts/full-cycle-guard.mjs require-native-tool
   "<native-create>+<native-message>"`; when either operation is absent, pass `none`. Any non-zero result
   is a hard HALT with: `full-cycle requires native Agent Teams in this transport; use /develop
   standalone or switch to a team-capable cockpit transport`. Do not initialize a run, and emit no
   child attempt.
3. Only after steps 1–2 pass, run
   `node <skill-dir>/scripts/full-cycle-guard.mjs init "<story-path>" "<native-create>+<native-message>"`.
   Preserve its returned `state_path`. The plan contains the unique roles `{po, executor, quality_gate}`,
   plus `design-ops` when `involves_ui == true` and `devops` when `deploy_type != none`; `spawn_budget`
   is exactly that unique-role count.
4. Immediately **before every native teammate-create call**, run
   `node <skill-dir>/scripts/full-cycle-guard.mjs charge "<state_path>" "<role>"`. Charging happens
   before the attempt, so a failed create still consumes that role's only attempt. A duplicate role,
   unplanned role, corrupted/mismatched state, or exhausted budget is a hard HALT and emits the existing
   `child_spawn_failure` event with the guard error code. Never retry a failed spawn and never increase,
   reset, replace, or delete the state during the run.
5. On resume, `init` must return the existing matching state. Roles already charged are reactivated only
   through native messaging; they are never spawned again. If a charged teammate no longer exists, HALT
   for human recovery. After Phase 6 succeeds, run
   `node <skill-dir>/scripts/full-cycle-guard.mjs complete "<state_path>"`.

This checks the real transport surface and does **not** add or infer a capability field in the engine
registry. There is no fallback to Terminal.app, `open -a Terminal`, `osascript`, `ttab`, multimodal
`pm.*` scripts, `AIOX_INLINE_MODE`, a legacy adapter, or any external shell/session launcher. Missing
native Agent Teams always means one actionable HALT in the current session.

## Architecture
```
team-lead (aiox-chief, MAIN)
  ├─ Phase 1  @po        → /validate   (Draft → Ready)
  ├─ Phase 2  @executor  → /develop    (implement, local commits on feat/ branch)
  ├─ Phase 3  @qg        → /review     ── FAIL ─→ SendMessage(@executor: apply fixes)
  │                                              SendMessage(@qg: re-review)   ↺ (circuit breaker)
  ├─ Phase 4  @devops    → /deploy → /verify   (CONDITIONAL — only if deploy_type ≠ none)
  ├─ Phase 5  @po        → /close      (gates → Done; writes epic Development Log)
  └─ Phase 6  shutdown   → tear down the team
```

## Sequence Lock (NON-NEGOTIABLE)
Do not dispatch phase N+1 until the team-lead has **verified on disk** that phase N's promised artifacts exist (the Post-Phase Verification Gate). Do not pre-announce terminal phases. Every skill-invoking `SendMessage` begins with `[ACTION REQUIRED: {skill}]` — the prefix is the team-lead's authorization to start that phase, issued only after the lock's conditions are met (it is NOT a cue for a teammate to self-start).

## Phases

**Phase 0 — Story analysis (team-lead, inline).** Read the story; resolve `executor` and `quality_gate` (must differ — anti-self-validation; if equal, escalate QG to a different agent). Note `deploy_type` (decides Phase 4), `task_mode`, `involves_ui` (design-ops gate in Phase 3).

**Phase 0b — Create core team.** After the mechanical safety preflight passes, charge and spawn only the
core roles `po`, `executor`, and `quality_gate` as real native agents (see "Real teams"). Phase 3 owns
the conditional `design-ops` charge/spawn and Phase 4 owns the conditional `devops` charge/spawn. Create
each unique role at most once; if one persona owns multiple phases, reuse that teammate through native
messaging. The executor inside `/develop` works on the feature branch (the `/develop` branch-guard
handles `feat/{story_id}`); isolation is the cockpit's native spawn surface (no manual worktree dance
standalone).

**Phase 1 — Validate.** `@po` runs `/validate`; reports the verdict via SendMessage. NO-GO → back to the author. GO → proceed.

**Phase 2 — Develop.** `@{executor}` runs `/develop`; produces a deliverable manifest (what shipped). `halted` → surface the blocker to the human, get guidance, resume.

**Phase 3 — Review + real QG loop.** `@{quality_gate}` runs `/review`; when `involves_ui: true`,
charge and spawn the planned `design-ops` role before invoking it in parallel, then incorporate its UX
verdict. FAIL/CONCERNS → SendMessage the executor to apply fixes (`/apply-qa-fixes`), then SendMessage
the QG to re-review. Loop until PASS **or the circuit breaker trips** (max 3 fix cycles) → escalate to
the human. The verdict is the QG's, not the executor's. (Self-heal is transitive — `/develop` and
`/review` invoke it; the team-lead doesn't run it directly.)

**Phase 4 — Deploy + verify (conditional).** Only if `deploy_type ≠ none`: charge and create `@devops`
if that unique planned role is not already alive, then run `/deploy` followed by `/verify` (writes
`e2e_verification`). `deploy_type: none` → skip and the plan contains no devops spawn allocation.

**Phase 5 — Close.** `@po` runs `/close` (gates CHK-0..9 → `Done`; writes the epic `## Development Log` entry = Channel 1). **Immediately BEFORE the `[ACTION REQUIRED: /close]` dispatch, the team-lead WRITES the dispatch lockfile mechanically:** `node <skill-dir>/scripts/write-dispatch-lock.mjs --story-id <id>` (cwd = the story worktree) → `.aiox/dispatch/<story-id>-phase5-close.lock.json`. That file IS the provenance `/close` CHK-0 verifies — a review agent narrating "via /close" without it fails CHK-0. (This step used to be prose — "the Sequence-Lock authorization writes the dispatch record" — and no step actually wrote it: 3 consecutive orchestrated closes paid a HALT + hand-remediation, Channel-2 findings `2.1`/`041.W1.1`/`041.W1.2`. Never hand-write the file; the script is the writer, same AP7 posture as `write-ack.mjs`.)

**Phase 6 — Shutdown.** SendMessage each teammate a shutdown request; tear down the team; then mark the
guard state complete. The team-lead emits the run's **orchestration telemetry → Channel 2** (product
self-improvement — ADR-COCKPIT-LEARNING-TELEMETRY): per-phase durations, verification-gate retries,
circuit-breaker trips, ACK gaps — framework metrics only, via `@aiox/conductor`. (Each phase's own 7a
project-learning + 7b telemetry are emitted by its skill; `/close`'s System-Improvement Findings is the
per-story Channel-2 producer.)

## Post-Phase Verification Gate (NON-NEGOTIABLE)
After a teammate reports completion, the team-lead verifies on disk that the artifacts the skill promised actually exist — BEFORE marking the phase complete. A reported PASS without the on-disk artifact is not a pass (an agent can report "done" + list a path it never wrote). On a missing/empty artifact: SendMessage the agent to produce it (max 2 retries), then escalate. ACK-or-Execute: a teammate given an `[ACTION REQUIRED]` acknowledges and declares intent in the same turn.

### Three mechanical backstops (incident-learned — pair with `/close` CHK-0)
The Sequence Lock is LLM-read protocol (probabilistic). These three on-disk checks are the mechanical layer:

1. **Integrity-violation auto-HALT (NON-NEGOTIABLE).** After EVERY phase verification (1–4 + each QG-loop iteration), read the story frontmatter on disk and check `status`. **If `status: Done` is seen at ANY point OUTSIDE Phase 5 → hard HALT** + emit a structured `integrity-violation { subtype: premature-done-outside-phase5, detected_at: <phase> }` event (Channel-2 telemetry). This catches the direct-edit/subagent bypass that `/close` CHK-0 can't (CHK-0 governs only the `/close` invocation path; this catches a `Done` that never went through `/close` at all). Do not auto-recover — human triage.

2. **L2 status diff-check (after Phase 3, before Phase 4/5).** `/review` is status-read-only. After it
reports, read the story `status`. `Done` follows rule 1: immutable HALT for human triage, with no revert.
If review mutated a non-Done status to `Ready for Review`, L2 FAIL: restore the captured pre-review
non-Done status and restart Phase 3. Any unchanged non-`Done` value (`InProgress`/`InReview`/`Ready`) →
L2 PASS.

3. **Post-Phase-2 branch guard (after Phase 2, before Phase 3).** Backstops `/develop`'s own branch guard (L1). `git branch --show-current`: if `main`/`master` → a `verification_gate_retry` (NOT an integrity-violation): SendMessage the still-alive executor to move the commits onto `feat/{story_id}-*` and re-verify (max 2 retries → escalate). `feat/*` → PASS.

## Blocking elicitation = AskUserQuestion (NON-NEGOTIABLE)
Any BLOCKING elicitation — the team-lead's or any teammate's, any phase — MUST be raised via
`AskUserQuestion`, never by ending a turn with the question in prose. The reason is mechanical, not
stylistic: under an orchestrator the conductor's hook intercepts `AskUserQuestion` (→ `pending.json`
→ routable, resolvable, wake-able), while a prose question at turn-end is INVISIBLE to it — no
pending, no wake, the run silently stalls until a human notices the pane. Measured A/B (weekend
2026-07-26..28, 6 blocking elicitations across 3 epics): 3× prose → every one required a human
manually typing into the pane; 3× protocol → every one resolved through the conductor without
founder intervention. Ending a turn with a blocking question in prose is a protocol violation of
this skill. (Standalone with a human present, `AskUserQuestion` is still the form — it renders
natively in the pane.)

## Standalone & transport
Runs standalone (one story, human present) — decisions go to the human via `AskUserQuestion`, native in the pane. Under a wave orchestrator (`/wave-execute`), the spawn surface and human-decision routing go through the **ConductorTransport** (see the conductor blueprint) — the phase protocol above is identical; only the transport differs. Concretely, a wave dispatches this skill's own pane via `aiox-core wave launch --story-id <id> --prompt "/full-cycle <story_path>"` (never `aiox-core companion launch` — that CLI is exclusive to Companion Mode's arbitrary-purpose sessions, a different domain entirely). The `story-path` invocation argument is identical either way; the spawn's `CONDUCTOR_STORY_ID`/`CONDUCTOR_ROOT_DIR` env is consumed downstream by the conductor's file-protocol decision routing (`.sdc-decision/<story_id>/`), not by this skill directly — so it never REQUIRES an orchestrator env var. It is resumable only through the matching guard state: re-invoking on a story mid-cycle picks up from the last completed, on-disk-verified phase without replenishing spawn attempts.

## Blocking conditions
Invalid story preflight · native Agent Teams create/message operations unavailable · spawn guard refusal
or native create failure · charged teammate missing on resume · anti-self-validation (executor == QG)
unresolved · a phase's artifact missing on the Verification Gate · QG circuit breaker exhausted ·
**`status: Done` outside Phase 5 (integrity-violation auto-HALT)** · **`/review` mutated `status` (L2
FAIL)** · **a blocking elicitation raised in prose instead of `AskUserQuestion` (protocol violation —
the conductor cannot see it)** · branch-guard unrecoverable after 2 retries · any atomic skill's own HALT. In every case:
surface one actionable error to the human, do not fake progress, and never switch to an external spawn
surface.
