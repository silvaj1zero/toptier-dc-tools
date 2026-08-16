---
name: close
description: Close a completed story — invocation-provenance gate, closure gates (review PASS, ACs, tasks, File List, deploy-verified, deliverable-reality, hill-phase), transition to Done, write the epic Development Log (Channel 1), 3-ACK recovery sequence via the conductor, System-Improvement Findings (Channel 2). The ONLY skill authorized to set status Done.
version: "1.2.0"
context: inline
agent: po
user-invocable: true
argument-hint: "{story-path}"
status: active
allowed-tools: Read, Edit, Write, Bash, AskUserQuestion
---

# /close — Close Story

Transition a reviewed story to `Done` after its closure gates pass, write the epic Development Log, and emit the close ACKs. Runs inline as the `po` persona (or the story's quality gate). **This is the ONLY skill that writes `status: Done` — never edit Status to Done by hand.**

## Input
Story path from `$ARGUMENTS` (ask if absent).

## Dynamic agent binding
Read the story's `**Quality Gate:**` field, strip `@`, adopt that agent's persona (`.aiox-core/agents/{id}.md`) for the closure lens. Fallback: `po`.

## Pre-Closure Gates — evaluate in order; any BLOCKING failure → HALT (no status change, no epic edit)

- **CHK-0 — Invocation-Provenance (BLOCKING · FIRST · MECHANICAL).** Prove this close was legitimately dispatched, MECHANICALLY (a prose "I verified" is spoofable by the very premature-close it prevents). Under an orchestrator: the dispatch lockfile `.aiox/dispatch/<story-id>-phase5-close.lock.json` (cwd-relative; written by the orchestrator via `/full-cycle`'s `scripts/write-dispatch-lock.mjs` — the canonical path, pinned 2026-07-28 after 3 consecutive closes paid a HALT to a path convention that existed only in prose) must exist. Direct human invocation: no lockfile required — the human IS the authorizer; PASS + write an audit-log line (`CHK-0: human-direct /close — {story-id} @ {ts}`). No lockfile AND not human-direct → HALT (anti-`review_close_collapse`: a review agent narrating "via /close" without a real dispatch fails here). **Runs before any mutation — non-destructive.**
- **CHK-1 — Reviewed.** A `/review` verdict exists + is PASS (or CONCERNS explicitly accepted with written rationale). No review → HALT. **BLOCKING.** — *one narrow, mechanically-fenced exception: the retroactive carve-out below.*
  - **CHK-1-R — Retroactive carve-out (the ONLY substitute for a verdict).** A story documenting work that ALREADY landed never went through `/review`, and fabricating a verdict for it would be exactly the fake-green this gate exists to stop. Such a story may satisfy CHK-1 **without** a verdict, but only by passing **all three** locks below, each **MECHANICAL** — a prose claim satisfies none of them:
    1. **`retroactive: true`** in frontmatter. Declared and greppable, so every use of this exception is auditable with one command.
    2. **`implemented_by: <sha>` names a commit that EXISTS** (`git cat-file -e <sha>`) **and that commit's diff really contains the story's implementation paths** (`git show --name-only <sha>`). Declaring the commit is not enough — the artifacts must actually be in it. Because a retroactive story's File List legitimately mixes two kinds of path, the check is split and BOTH halves are mandatory:
       - Every File List entry **not** marked `*(registro retroativo)*` is an **implementation path** and MUST appear in the commit's diff.
       - Entries marked `*(registro retroativo)*` are the record written at authoring time — the story file itself, the epic Development Log, an annotation on a sibling story. They MUST NOT be required in the commit; demanding it is incoherent, since a commit from before the story existed cannot contain the story.
       - **At least one** implementation path must exist and match, or `implemented_by` is decorative and the lock fails.
       > This split was not theoretical: the first draft of this rule required *every* File List path to be in the commit, and it **failed the very story it was written for** (`042.W1.4` — 2 of 4 paths were authoring-time record). A lock that rejects the legitimate case teaches people to disable the lock.
    3. **The commit PREDATES the story file's own creation** (`git log --diff-filter=A --format=%ct -- <story-path>` > the commit's `%ct`; for an uncommitted story file, its birth on disk). **This is the lock that matters.** It makes the carve-out structurally unusable for work being done now: if you are implementing today, your commit is NEWER than the story, condition 3 fails, and the normal `/review` path is the only way through. The exception can only ever cover what genuinely happened before the story existed.
  - **What the carve-out does NOT relax:** CHK-2..CHK-9 all still apply in full. CHK-9 (Deliverable Reality) becomes MORE load-bearing, not less — with no verdict upstream, it is the primary proof that the thing is real. The story MUST also carry a visible banner stating its ACs were written after execution and therefore never gated anything.
  - **Why this is fenced so tightly (do not loosen without re-reading this):** CHK-1 is the anti-fake-green backbone of the whole pipeline. Any exception to it is a legitimate path to `Done` that skips review, and a label an agent could reach for to dodge a gate. Locks 1 and 2 make abuse *auditable*; lock 3 makes it *impossible for present-day work*. Drop lock 3 and this stops being a carve-out for history and becomes a review bypass for anyone who types `retroactive: true`.
- **CHK-2 — Acceptance Criteria met** (every AC satisfied + verifiable). **BLOCKING.**
- **CHK-3 — Tasks complete** (all `[x]`). **BLOCKING.**
- **CHK-4 — Tests pass** (lint + typecheck + tests green; regression clean). **BLOCKING.**
- **CHK-5 — File List complete** (matches the actual diff). **BLOCKING.**
- **CHK-6 — Validation Conditions resolved** (every `VC-N` addressed or explicitly deferred). **BLOCKING.**
- **CHK-7 — Deploy verified (conditional).** `deploy_type ≠ none` → `/verify` must have passed (`e2e_verification` PASS in the story); `none` → SKIP. **BLOCKING when applicable.**
  - **An ABSENT `e2e_verification` is a HALT, never a pass.** If `deploy_type ≠ none` and the story does not declare the field, stop and require it to be declared and then satisfied. Do not read silence as "nothing to verify".
  > **Why this had to be said explicitly:** the field is declared by the story itself, so *not declaring it* was the cheapest way through — the gate passed by omission on every story that simply never wrote it. Measured on this repo when the rule was added: exactly **one** story out of the whole corpus declared `e2e_verification`, while many carried `deploy_type ≠ none`. A conditional gate whose condition is supplied by the thing being gated defaults to OFF unless absence is itself a failure.
  - Declaring it late (at `/close`, for work already shipped) is allowed and is better than not declaring it — but the *verification itself* must be real and its provenance stated: what was measured, where, and whether any part is inference rather than observation. A retroactive contract with a real measurement is honest; a retroactive contract with a retroactive "PASS" is the fake-green this gate exists to stop.
- **CHK-8 — Hill phase consistent.** `hill_phase` is `executing` (about to → `done`); a story still `figuring_out` can't close. **BLOCKING.**
- **CHK-9 — Deliverable Reality Gate (anti-fake-green).** The thing the story promised actually **exists and works** — verified physically: every File List path EXISTS + is git-TRACKED + COMMITTED (not stash-only), the command runs, the test really passes. Not "the checkbox is ticked". **BLOCKING.**
> **Overlay hook:** a project binds extra advisory gates via `.aiox-project` (e.g. SINKRA's registry-governance + IDS post-check) — they slot in as advisory CHKs; the agnostic core ships CHK-0..9.

## Closure sequence (only here) — with a 3-ACK recovery contract
On all BLOCKING gates PASS, in this order. **Each ACK is written by a MECHANICAL script call — never prose, never "the conductor will handle it".** Ownership was ambiguous before (the ACK was described as "written via the conductor", so a closing session sometimes wrote it and sometimes assumed something else had — non-deterministic; wave 031.W4 saw 1 of 3 children emit `sdc-complete` and 2 skip it). The canonical writer is `scripts/write-ack.mjs`, resolved relative to this loaded `SKILL.md` (same discipline as `full-cycle-guard.mjs`; never substitute a global). It does an atomic tmp+rename and writes the path relative-to-cwd per AP7 — the orchestrator's reader is multi-path. Run it explicitly at each ACK step; do not delegate the write:
```bash
node <skill-dir>/scripts/write-ack.mjs --story-id <story-id> --ack <phase-5-checkpoint|close|sdc-complete> [--field key=value ...]
```
1. **`phase-5-checkpoint` ACK** — `write-ack.mjs --ack phase-5-checkpoint`, written AFTER the gates PASS, **BEFORE** the `status: Done` mutation. The recovery point: if this exists but `sdc-complete` is absent, a crash mid-sequence is re-dispatchable WITHOUT re-running the gates.
2. Append a `## Change Log` entry (date · `@po` · "Closed [PASS]. CHK-0..9 PASS. {summary}").
3. Edit `Status → Done`; set `hill_phase → done`.
4. Update the epic stories table: mark this story `Done`.
5. **Append to the epic's `## Development Log`** (Channel 1 — the producer side of the enrichment loop `/validate` reads): a narrative of what this story actually shipped — decisions, files, patterns, gotchas. Without it the next validation can't see what this story built.
6. Update the epic state file **idempotently** (a two-write/compare pattern — re-running converges, never double-applies).
7. **`close` ACK** — `write-ack.mjs --ack close`, written AFTER status:Done + Change Log + epic table + Development Log + epic-state all landed on disk (pass the landed facts as `--field`, e.g. `--field close_commit=<sha> --field review_verdict=PASS`).
8. **`sdc-complete` ACK** — `write-ack.mjs --ack sdc-complete`, written LAST (the terminal marker the orchestrator's monitor consumes). Until this file exists on disk, the SDC pipeline is considered incomplete — so this step is NON-SKIPPABLE and MECHANICAL, never inferred.

**Under `@aiox/conductor` (in-cockpit or file-protocol headless):** the conductor still owns decision-resolution (see Conductor integration below); the ACK writes above remain the mechanical `write-ack.mjs` calls regardless — the conductor does not replace them. If a project's conductor provides its own atomic multi-write ACK surface, it MUST land the same `.sdc-ack/<story-id>/<ack>.ack` files this script produces (same path, same terminal marker), so the orchestrator's reader is unaffected.

On any BLOCKING failure: status stays as-is; list the failed gate(s) + remediation.

## Phase 7 — Two-channel learning (ADR-COCKPIT-LEARNING-TELEMETRY)
- **7a Project learning** → `.aiox/learning/logs/close/…` (domain: gates, what shipped, the `epilogue{}`). **Epilogue floor-gate:** the epilogue (`what_worked`/`what_failed`/`confidence`) must be populated — a close with an empty epilogue is a thin record; WARN + fill, don't skip.
- **7b System-Improvement Findings (Channel 2 — product telemetry).** Inspect the just-written epilogue + the run and emit framework-improvement findings — **gaps/errors/opportunities of the DEV-SYSTEM itself** (how to improve the SDC/skills), to the Channel-2 buffer via the conductor (`.aiox/telemetry/` → origin). Framework metrics + finding-type only; NO project code/content. NON-blocking (a write failure → WARN + continue, never blocks the terminal marker). This is the close-time producer of the product self-improvement signal.

## Manual-status-edit prohibition (NON-NEGOTIABLE)
A story reaches `Done` ONLY through this skill's gates. Hand-editing Status to Done bypasses CHK-7/CHK-9 and is forbidden — every agent, no exceptions. Need to close → run `/close`; a gate blocks → fix it first.

**This includes retroactive stories — they are the tempting case, and the rule still holds.** A story documenting already-landed work still reaches `Done` by RUNNING `/close`; the retroactive carve-out (CHK-1-R) relaxes *which evidence satisfies CHK-1*, never *who writes the status*. Authoring a story with `status: Done` already in its frontmatter is the same prohibited hand-edit — it just skips all ten gates instead of one, and CHK-9 (the proof the deliverable is physically real) is precisely what gets skipped. Author it as `Ready for Review` + `retroactive: true` + `implemented_by`, then run `/close` and let CHK-1-R do its job.

## Closure summary
Emit a short handoff: story id, verdict, gates passed, files changed, what shipped, the next story if obvious.

## Conductor integration (fail-closed)
No `CONDUCTOR_ACTIVE` → ignore. Under it: decisions (accepting a CONCERNS, waiving a gate, CHK-0 ambiguity) are intercepted → poll `<CONDUCTOR_ROOT_DIR>/.sdc-resolution/<CONDUCTOR_STORY_ID>/resolved.json`, use `instruction`/`selected`, clear it; **timeout (default 1800000) → HALT fail-closed + `idle_no_ack`**. Never re-`AskUserQuestion` under conductor; never set `CONDUCTOR_ACTIVE`. (CHK-0's lockfile is the orchestrator's dispatch proof — distinct from the decision-resolution channel.)

## Decision points (interactive)
Accepting a CONCERNS verdict, or waiving a gate with rationale → `AskUserQuestion` (standalone: ask directly; under orchestrator: via the conductor).

## Red flags
- "It's basically done, I'll set Status: Done" — closure is gated; hand-editing bypasses CHK-7/9. · "The checkbox is ticked, that's enough" — CHK-9 demands the deliverable is physically real (EXISTS+TRACKED+COMMITTED). · "It wasn't reviewed but it's simple" — CHK-1 is blocking. · "It's retroactive, so I'll just write `status: Done` in the frontmatter" — that is the hand-edit, not the carve-out: CHK-1-R changes what satisfies CHK-1, never who writes the status; author it `Ready for Review` and RUN `/close`. · "It's old work, so it's retroactive" — lock 3 decides that mechanically, not your judgement: if the commit is newer than the story file, it is NOT retroactive and `/review` is the only path. · "Review passed, I'll close it inline from /review" — CHK-0 fails it (no dispatch provenance); only the owner invokes `/close`. · "Skip the epic Development Log, it's just narrative" — it's Channel 1; the next `/validate` is blind without it. · "The conductor/orchestrator will emit the `sdc-complete` ack" — NO: the ack is a mechanical `write-ack.mjs` call this skill owns (step 8); assuming someone else writes it is exactly the non-determinism that stranded 2 of 3 children in wave 031.W4.

## Skill Agnosticism (AP5)
The mechanical ACK writes preserve all standalone/orchestrated modes. `write-ack.mjs` is orchestrator-unaware — it writes `.sdc-ack/<story-id>/<ack>.ack` relative to cwd (AP7), never a path chosen by who dispatched it; the orchestrator's reader (`wave-launch.js`) already resolves that multi-path (Mode 1 root · Mode 6 worktree `story-`/`wt-` prefixes). A human-direct `/close` (Modes 2-5) writes the same acks harmlessly (no reader consumes them standalone). No `CONDUCTOR_ACTIVE` branch changed — the writes are unconditional; the conductor governs only decision-resolution, not the ACK emission. Evidence: `scripts/write-ack.test.mjs` (4 cases — canonical path, field override, invalid-input rejection, CLI entrypoint).

## Git
Read-only (`status`/`log`/`diff`). `/close` does not push — push/merge is `@devops`-exclusive.
