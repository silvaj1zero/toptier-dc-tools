---
name: companion
description: Conductor Companion Mode — spawn and direct arbitrary-purpose companion sessions from the MAIN session via `aiox-core companion` (launch/respawn/pending/resolve/status/kill). The main session edits the artifact under test; companions actually run it; their elicitations route back here. Requires the AIOX Cockpit running (its daemon is the spawn authority).
version: "1.0.0"
context: conversation
agent: general-purpose
user-invocable: true
argument-hint: "[launch <slug> | respawn <slug> | loop <slug> | status | kill <slug>]"
status: active
allowed-tools: Read, Edit, Bash, AskUserQuestion
---

# /companion — dirigir sessões companion pelo conductor

You are the MAIN session of Companion Mode (ADR-COCKPIT-COMPANION-MODE): the founder works here on an
artifact (a skill, code, config); N **companion** sessions execute the real scenario against each edit.
Their `AskUserQuestion` elicitations are intercepted by the conductor hooks and routed to YOU through the
file-protocol. You resolve the routine ones and escalate structural ones to the founder.

**Transport:** the `aiox-core companion` subcommand. Resolve the binary **silently**, in this order —
never narrate the search to the founder as a first message; only speak up if **every** step below fails
(then tell them to open the AIOX Cockpit, or run `/update-cockpit`, and retry):
1. `$AIOX_CORE_BIN` if set (explicit override always wins);
2. `core_bin` from the discovery descriptor (`<root>/.aiox/daemon.json`, or the machine-global
   `~/.aiox/cockpit-daemon.json`) — the running cockpit publishes the exact `aiox-core(.exe)` it resolved
   at startup (Story 2.1 / ADR-COCKPIT-DAEMON-OWNERSHIP addendum); this is what makes discovery work on an
   installed machine with no dev checkout;
3. `~/.aiox/bin/aiox-core(.exe)` — the cockpit-managed stable copy (survives Velopack app-dir version
   churn), in case the descriptor is stale/missing but a prior provision already materialized it;
4. `aiox-core` on PATH;
5. inside the cockpit repo (dev checkout only, cwd = repo root): `target/release/aiox-core`.

All verbs print single-line JSON on stdout. `--root <dir>` defaults to the cwd — always pass the PROJECT
ROOT (never a worktree): the conductor file-protocol lives there.

**Precondition (D2):** the AIOX Cockpit must be running — `launch/respawn/kill/status` dial ITS daemon and
never spawn one. On "abra o AIOX Cockpit", tell the user to open it (or run `/update-cockpit`), then retry.

## The iteration loop (R7 — the heart of the mode)

```
1. edit the artifact under test (normal work in this session)
2. aiox-core companion respawn <slug>            # ONE action: kills the old pane, spawns run n+1
3. aiox-core companion pending --wait --story <story_id> --timeout-ms 300000
4a. {"event":"pending", ...}  → resolve or escalate (below), then GOTO 3
4b. {"event":"done", ...}     → read the behavior-report, apply the next edit, GOTO 1
4c. {"event":"timeout"}       → check `companion status` (state "parada?"/"morta" = stall/crash —
                                 inspect the pane in the cockpit, then respawn or kill)
```

`respawn` re-reads the scenario file, so prompt/env edits between runs are picked up automatically.

**C1 mitigation (story 2.2 / AC5) — run step 3 in the BACKGROUND, never foreground-blocking:** `pending
--wait` can legitimately sit for the full `--timeout-ms` (default 120000ms; the loop above uses
300000ms) with the companion mid-scenario — running it as a blocking foreground `Bash` call freezes the
MAIN session for that whole window, exactly when you should be free to keep editing the artifact, review
the previous report, or resolve a DIFFERENT companion's pending decision. Launch it with the Bash tool's
`run_in_background: true` (or your CLI's equivalent background-process facility) and poll/read its output
instead of blocking on it:

```
1. edit the artifact under test (normal work in this session)
2. aiox-core companion respawn <slug>
3. aiox-core companion pending --wait --story <story_id> --timeout-ms 300000   # run_in_background: true
   … continue other work in the main session; you are notified (or poll) when it completes …
4a/4b/4c. same as above, once the backgrounded call returns
```

Never poll it in a tight foreground `sleep` loop either — that just re-creates the block by another
name; use the run's own completion notification (or a bounded, infrequent poll) the way you would for any
other long-running background process.

## Scenarios (`<root>/.aiox/companions/<slug>.json`)

First launch creates the scenario declaratively:

```
aiox-core companion launch --slug forge-skill-map \
  --prompt "Rode a skill X sobre a fixture Y e relate o comportamento real, incluindo cada elicitação." \
  [--cwd <dir>] [--env K=V] [--program claude] [--policy-hint "aprove escolhas de estilo; escale schema"]
```

The transport prepends the protocol preamble (terminal marker + report path-contract) — never add those
to the prompt yourself. The spawn output includes `story_id` (`companion-<slug>-<n>`) and `report_path`
(`.aiox/companions/<slug>/report-<n>.md`) — read the report from there on `done`.

## Resolving decisions (D6 — you are the founder's delegate)

For each entry in `pending`:
1. **Routine** (fits the scenario's `policy_hint`, or is an operational choice with an obvious safe
   option): resolve it yourself —
   `aiox-core companion resolve <story_id> --selected "<label>"` (label must match an option
   **byte-exact**; the CLI validates and lists the options on mismatch) or
   `--instruction "<free text>"` when no option fits.
2. **Structural** (changes the artifact's design, schema, contract, or anything the founder ratified):
   ask the founder HERE via your own `AskUserQuestion`, then resolve with their answer.
3. Record every resolution (question → answer → who decided) — the elicitation behavior is itself part of
   what the companion run is testing; it belongs in your summary alongside the behavior-report.

**Never** resolve a non-`companion-*` id (the CLI refuses wave ids — that is the wave orchestrator's job),
and never type into the companion pane to answer a structured decision (K6: keystroke-relay never writes
`resolved.json`).

## A/B variation

Two scenarios with different prompts/env = two companions in parallel
(`launch --slug x-variant-a …`, `launch --slug x-variant-b …`), then one `pending --wait` loop serves both
(it surfaces pendings from ALL companions).

## Observability

The cockpit rail shows a **COMPANIONS** section per scenario (state dot, run number, respawn/kill/report
buttons); pending decisions also surface in its DECISÕES panel where the founder can resolve directly —
first valid `resolved.json` wins, no race. `aiox-core companion status` gives the same view as JSON
(state `done | decisão | working | parada? | morta`).
