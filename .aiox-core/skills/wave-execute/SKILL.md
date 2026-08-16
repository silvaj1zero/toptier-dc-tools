---
name: wave-execute
description: Orchestrate a wave — dispatch N /full-cycle children (one per story) across a file-ownership-partitioned DAG, route their decisions via @aiox/conductor (ConductorLoop), detect fan-in conflicts, hand off to @devops for merge-back. Spawns natively; delegates decision transport to the conductor service. Telemetry is Channel-2 product self-improvement.
version: "1.5.0"
context: conversation
agent: aiox-chief
user-invocable: true
argument-hint: "{epic-id} {wave-number} [--autonomy AL1|AL3] [--dry-run] [--no-confirm]"
depends_on: ["/full-cycle"]
status: active
allowed-tools: Read, Edit, Bash, AskUserQuestion, Agent
---

# /wave-execute — Wave Execution

Run a whole wave: dispatch one `/full-cycle` per story in parallel where safe, route every child's decisions through the conductor, detect conflicts at fan-in, and hand off to `@devops` for merge-back. MAIN adopts the `aiox-chief` coordinator persona.

**Invocation:** `/wave-execute {epic} {wave} [--autonomy AL1|AL3] [--dry-run] [--no-confirm]`. Default autonomy **AL1** (every child decision escalates to the human — safe; AL3 auto-resolves only `style`/`perf`/proceed-gate and is opt-in).

## What it delegates (NOT reimplemented here)
- **Decision routing** → `@aiox/conductor`'s `ConductorLoop` (the zero-token policy engine + escalation). This skill does not poll files or parse panes. **Requires a live loop-host** — see the Stage 3 preflight and the runbook below; a child spawned with no loop-host driving it hangs forever at its first decision gate.
- **Spawn + completion + liveness** → the `ConductorTransport` (the cockpit's native spawn surface; `FileProtocolTransport` as the portable fallback). Concretely: `aiox-core wave launch --story-id <id> [--root <dir>] [--cwd <dir>] [--prompt "…"]` (see Stage 3 — this is a FIRST-CLASS wave-child spawn, distinct from `aiox-core companion launch`, which is exclusive to Companion Mode). Escalations surface in the cockpit's session rail (the decision-resolve affordance).
- **Merge** → `@devops` (exclusive), per `references/pr-merge-strategy.md`.

## Stage 1 — Deterministic preflight (code computes, you judge)
A preflight pass computes the mechanical facts from disk — each story's status, the `depends_on` DAG, daemon liveness, orphaned worktrees. **Don't rediscover these by reasoning** (grepping `status:`, guessing DAG args). Spend judgment on: does the DAG make sense? Any story `Ready` that shouldn't be? Anything to adjust before dispatch?

**Agent-selection gate (F9 — ADR-COCKPIT-AGENT-SELECTION).** Each story must carry a resolved `**Executor:**` + `**Quality Gate:**` with `quality_gate ≠ executor`. Normally these were filled at draft-time by `/governance-pipeline` (the scorer over `.aiox/cache/executors.json`). For a story missing them (e.g. an emergent injection), fill them here via the same conductor scorer (`selectPair` by domain) — auto-pick on a confident, non-sensitive match, else elicit. **A story whose `executor == quality_gate` is a self-validation conflict → HALT before dispatch** (the QG loop in `/full-cycle` would have the reviewer grading its own work).

## Stage 1b — Build DAG + file-ownership partition + conflict gate
1. Build the wave DAG from `depends_on`.
2. **File-ownership partition (WL-5):** stories whose file-sets overlap are **SEQUENCED**; disjoint stories are **PARALLEL**. Record `partition` + `partition_source` per story.
3. **Cross-epic conflict gate (EPIC-202):** before dispatch, check physical conflicts (`file_ownership_overlap` · `occ_version_mismatch` · `path_collision`) against other open waves. **Resolution-aware:** if the overlap is merge-safe in separate worktrees → propose parallelizing; if not → auto-sequence (adjust `depends_on`). This lifts WL-5 from intra-wave to cross-epic.
4. **Effort calibration (feed-forward):** show each story's calibrated effort = documented × the calibration ratio (`calibrateEffort`, default 0.3 — historical 3–5× over-estimation; the prior wave's retrospective overrides the ratio). Calibration informs the plan/timebox, never gates dispatch.

## Stage 2 — Show plan
Present the batches (PARALLEL/SEQUENCED), the partition decisions, and the conflict-gate verdict. Get human confirmation (skip with `--no-confirm`; `--dry-run` stops here).

## Stage 3 — Dispatch

**Loop-host preflight (D5, `ADR-COCKPIT-CONDUCTOR-MASTER-LOOP`) — run BEFORE spawning any child in this batch.** `ConductorLoop` only routes a child's escalated decisions if something is actually ticking it; the incident this preflight exists to prevent (226.W0.1) was exactly a spawner that never checked. Verify a FRESH loop-host heartbeat exists at `<CONDUCTOR_STATE_DIR>/.sdc-conductor/loop-host.json` first:

1. **Resolve `CONDUCTOR_STATE_DIR`** — env-first if already set in this session (same precedence `aiox-core wave launch`/`conductor loop` use, VC-1 of story 030.W1.2); otherwise it is `~/.aiox/projects/<slug(repo_root)>/sdc`, where `slug()` replaces `/`, `\`, `:`, `.` with `-` (byte-identical port of `aiox_conductor::state_dir::slug`, `crates/aiox-conductor/src/state_dir.rs`):
   ```bash
   STATE_DIR="${CONDUCTOR_STATE_DIR:-$HOME/.aiox/projects/$(printf '%s' "$REPO_ROOT" | tr '/\\.:' '----')/sdc}"
   HB="$STATE_DIR/.sdc-conductor/loop-host.json"
   ```
2. **Judge freshness exactly like `aiox_conductor::heartbeat` does** (no dedicated `aiox-core conductor status` CLI verb exists yet — this is the same file + predicate the codebase itself reads, not a second heuristic, AC5): freshness is the FILE's **mtime**, never the `ts` field inside it (the module's own doc: `ts` is provenance-only, the freshness clock is the filesystem's), against the same default TTL of **30s**, AND the recorded `pid` must be alive — the identical two-part test (`fresh AND alive`) that `heartbeat::check_single_instance` performs and that both the CLI host's own single-instance refusal and the `030.W1.2` `ensure_loop_host` guard already reuse. Use `stat` for the mtime (portable across GNU/BSD; a `find -mmin` one-liner is NOT portable — some `find` implementations, e.g. `bfs`, reject fractional minutes outright):
   ```bash
   if [ -f "$HB" ]; then
     MTIME=$(stat -f %m "$HB" 2>/dev/null || stat -c %Y "$HB" 2>/dev/null)
     AGE=$(( $(date +%s) - MTIME ))
     PID=$(jq -r .pid "$HB")
     [ "$AGE" -le 30 ] && kill -0 "$PID" 2>/dev/null   # true → proceed; false → HALT
   fi
   ```
   (Windows: mtime-only — the same accepted gap the heartbeat module itself documents, AC6 of story 030.W1.1.)
3. **Fresh + alive → proceed.** **Absent, stale, or dead pid → HALT the WHOLE batch before spawning even the first child** (never a partial spawn) and surface the runbook below.

This is a **protocol-level** (orchestrator-side) check, not a code change to any atomic skill — it exists because Stage 3's spawn surface is not guaranteed to be `aiox-core wave launch` for every consumer (the legacy `wave-launch.js` env-contract mirrored below never calls it at all). **When this batch's spawn command IS the native `aiox-core wave launch`** — the path this skill documents — this preflight is REDUNDANT with the ensure-then-guard the binary already performs internally (`conductor_ensure::ensure_loop_host`, story 030.W1.2): kept anyway as defense-in-depth, never removed. The two are complementary, not duplicative: this batch-level check fails the WHOLE batch before a single child is attempted, whereas the binary's own per-call ensure only guards its own single spawn. Symmetrically — if any per-child `wave launch` call ever reports `"ensure_conductor":"halted"` in its JSON output (its own internal guard tripped, e.g. the loop-host died between the batch preflight and this specific child), **stop dispatching the REST of the batch immediately** and surface the same runbook; never let a mid-batch halt look like "one story failed, move on to the next."

For each story in the current batch, spawn a `/full-cycle` child **natively** (one pane per story, isolated per `worktree-isolation` invariants — per-story, never nested, fresh base). **Story 047.W1.1 (2026-07-29) moved worktree provisioning INTO `aiox-core wave launch` itself** — it now provisions `.claude/worktrees/story-{story_id}` (off `--root`'s current HEAD) and uses it as the child's `cwd` whenever `--cwd` is absent. **This skill therefore no longer resolves `{worktree_dir}` by hand and passes it explicitly** — doing so was the exact reachability gap a QA review of that story caught: nothing in this repo ever created that directory before this Stage ran, so the pre-047.W1.1 documented invocation (`--cwd {worktree_dir}` with nothing upstream provisioning it) never actually exercised worktree isolation through this path at all. The concrete spawn command is now:

```
aiox-core wave launch --story-id {story_id} --root {repo_root} \
  --program claude --prompt "/full-cycle {story_path}" --launched-by {your_pane_token}
```

`wave launch` provisions the worktree and passes it to the daemon as the child's `cwd` — the child's own `/full-cycle` sees a genuinely isolated worktree without this skill ever computing a path itself. **If a caller genuinely needs an explicit `--cwd`** (e.g. a worktree provisioned by some OTHER mechanism ahead of time), `wave launch` validates it fail-closed: an explicit `--cwd` that resolves to the SAME working tree as `--root` — whether `--root` is the repo's main checkout or itself a linked (non-main) worktree — is refused (`SPAWN_FAILED`) rather than silently spawning a second child into the working tree this very session is running in.

This mirrors the legacy `wave-launch.js` env contract (`CONDUCTOR_ACTIVE=true`, `CONDUCTOR_STORY_ID={story_id}`, `CONDUCTOR_ROOT_DIR={repo_root}`) so the daemon records a REAL `story_id` on the pane — the canvas then draws a wave CHILD badge + edge, not a COMPANION one. `--story-id` refuses anything starting with `companion-` (that prefix is Companion Mode's own domain — see the note below). **Always pass `--launched-by {your_pane_token}` explicitly** — it is no longer framed as optional syntax. A fallback to this session's own `AIOX_PANE_ID` env var still exists (`resolve_launched_by` in `wave.rs`) for when the flag genuinely cannot be threaded through, but relying on that fallback silently is the exact failure mode this hardening targets: `aiox-core wave launch` now logs the RESOLVED value on every call, including the `None` case, so a silent fallback miss is observable instead of invisible. **Never** use `aiox-core companion launch` here — it forges a `companion-<slug>-<n>` id and is exclusive to Companion Mode (arbitrary-purpose sessions, not wave stories); using it for a wave child is the exact bug this note prevents (`docs/backlog/wave-spawn-surface-gap.md`).

Start a `ConductorLoop({ rootDir, autonomyLevel })` for the run: it watches each child's decisions and either auto-resolves (policy) or escalates to the human via the session rail. Children inside `/full-cycle` run **real Agent Teams** (the lean-footprint win — see `/full-cycle`).

## Headless failure mode & runbook (D5)

**Failure mode:** headless (no cockpit GUI open, no `aiox-core conductor loop` running) means the Stage 3 preflight above HALTs before any spawn. If it were ever skipped or bypassed, the visible symptom is silent and total: every dispatched child hangs FOREVER at its first decision gate — the conductor's `PreToolUse` hook blocks `AskUserQuestion`, writes `pending.json`, and nothing on the machine is ticking `ConductorLoop` to ever notice or resolve it. This is exactly incidente 226.W0.1. There is no timeout that saves you here — a `pending.json` with no loop-host is pending forever, not eventually.

**Two remedies (either one; pick before retrying Stage 3):**
1. **Open the cockpit** — its GUI already runs `ConductorLoop` internally (`start_conductor`) and writes the same heartbeat file (`host_kind:"cockpit-gui"`).
2. **Run `aiox-core conductor loop [--root <repo_root>] [--autonomy AL1..AL4]`** in a background/detached terminal — the headless host (story 030.W1.1). Default autonomy is AL1 (escalate everything to the human), matching this skill's own default.

Either remedy satisfies the Stage 3 preflight; nothing else does (do not "wait it out" — there is no auto-recovery from a genuinely headless loop-host).

**Answering a headless decision (once a loop-host is alive):** resolve a wave child's escalated decision with `aiox-core wave pending` (lists pending decisions — wave ids only, mirrors `companion pending`'s inverted guard) and `aiox-core wave resolve <story-id> --selected "<label>"|--instruction "<text>"` — `[Confiança: MÉDIA]`, this pair is story 030.W2.1, landing alongside this one in the same Wave 2 and not yet merged to `main` as of this writing; until it lands, resolve via the cockpit's session rail (already shipped). **Never** resolve a wave decision with `aiox-core companion resolve` — that verb is exclusive to Companion Mode and refuses a wave story-id by design (the mirror-image of the note in Stage 3 above).

## Stage 4 — Monitor
`transport.onComplete(spawnId, …)` reports each child's terminal state (`completed` / `failed` / `committed_no_ack` / `aborted`). No passive waiting — the transport signals. A `committed_no_ack` is recoverable (an operator finalizes it). Telemetry events (`conductor_decision_detected`/`inject`/`escalated`) are **Channel 2** (product self-improvement telemetry — ADR-COCKPIT-LEARNING-TELEMETRY): they flow to the durable record → the digest (the learning loop that improves the framework), and the cockpit reads them locally for the live wave panel. Framework metrics only — no story/domain content.

**Cascade-block on a Blocked story.** When a child terminates Blocked (circuit breaker exhausted / `story_timeout`), do NOT dispatch its dependents into a guaranteed failure: run `cascadeBlock(depends_on, [blockedId])` to get the transitive dependent set, mark them Blocked too, and `assignBacklogIds(epic, …)` → `BACKLOG-{epic}-{seq}` for the deferred set. Surface the blocked story + its cascade + the backlog ids to the human; the rest of the wave (independent stories) proceeds. Never silently drop a dependent.

## Stage 5 — Fan-in conflict detection
Before any merge, detect conflicts across the parallel branches (the partition should have prevented file-overlap; verify). Surface any real conflict to `@devops` to resolve at merge, never silently.

## Stage 6 — Merge-back + teardown
Hand off to **`@devops`** (exclusive) to merge each story branch — strategy by branch shape + pre-merge head verification (`references/pr-merge-strategy.md`), honoring the `devops-escalation-ceiling`; use the handoff artifact format in `references/agent-handoff.md` for the cross-agent context. After confirmed merges, GC the per-story worktrees/panes. Fire the wave-complete digest trigger.

**Flywheel circularidade (retrospective → next wave).** Record this wave's metrics (velocity, qg_pass_rate, friction, effort_accuracy) and `flywheelDelta(prevWave, thisWave)` against the prior wave's retrospective → the improvements + regressions. A regression (e.g. friction up, qg_pass_rate down) is surfaced with its metric delta, NOT buried; the new `effort_accuracy` (actual ÷ calibrated) feeds next wave's calibration ratio (Stage 1b). The retrospective is **Channel-2** product telemetry (framework metrics only — no story content) AND seeds the next wave's plan. This closes the loop: each wave verifies whether the *prior* wave's improvements actually landed (FW-R8), not just that work got done.

## Bounded autonomy
Auto-actions stay inside the conductor's circuit breakers (the policy's per-spawn cap). The autonomy level is the `ConductorLoop`'s `autonomyLevel` (AL1 default = escalate everything). Push/merge is `@devops`-exclusive regardless of autonomy. Never hand control to an unbounded autonomous mode.

## Standalone & transport note
The decision transport and spawn surface are the cockpit's native ones (`aiox-core wave launch`, Stage 3); the `FileProtocolTransport` is the portable fallback so a wave can run on a plain terminal too. The orchestration protocol above is identical across transports — only the mechanism differs (see the conductor blueprint).

## Blocking conditions
A story not `Ready` at dispatch · a story whose `executor == quality_gate` (F9 self-validation conflict, Stage 1) · an unresolved cross-epic conflict (Stage 1b) · **no fresh loop-host heartbeat at Stage 3** (D5 preflight above — HALT the whole batch, runbook: open the cockpit or `aiox-core conductor loop`) · the conductor decision timeout (HALT fail-closed) · a fan-in conflict `@devops` can't auto-resolve. Surface to the human; never fake a green wave.
