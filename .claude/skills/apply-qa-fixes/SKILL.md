---
name: apply-qa-fixes
description: Remediate quality-gate findings — read the QG findings from /review, apply ALL of them (complete-findings, severity order), re-validate, hand back to the QG for re-review. The fix half of the QG loop. Never self-approves, never closes.
version: "1.1.0"
context: inline
agent: dev
user-invocable: true
argument-hint: "{story-path}"
status: active
depends_on: ["/review"]
allowed-tools: Read, Edit, Bash, Write
---

# /apply-qa-fixes — Remediate Quality-Gate Findings

Apply the fixes a `/review` produced. The executor half of the QG loop: read the findings, fix every one, re-validate, hand back to the QG. Runs as the story's **executor persona** (dynamic binding: read the story's `**Executor:**`, adopt `.aiox-core/agents/{id}.md`; fallback `dev`).

**Input:** story path from `$ARGUMENTS` (the QG findings live in its `## QA Results` + the machine-readable gate file from `/review`).

## Phase 1 — Finding extraction (STOP gate)
Read the story's `## QA Results` + the gate file. Parse every finding with its severity (CRITICAL · HIGH · MEDIUM · LOW) + affected files; sort severity-descending. **STOP** — don't fix without the complete inventory (fixing low-severity while a critical hides is wasted effort).

## Phase 2 — Fix application (STOP gate)
Per finding, in severity order: read + understand the affected file(s), apply the fix, **verify the specific finding no longer holds**, confirm no adjacent regression. Resolve **all CRITICAL + HIGH before any MEDIUM/LOW**. **Complete-findings (NON-NEGOTIABLE, `references/complete-findings-resolution.md`):** every finding ends FIXED · WON'T_FIX (written justification) · DEFERRED (tracked task + owner). Order, not inclusion — never cherry-pick "just the blockers". **STOP** — don't proceed with an unresolved CRITICAL (re-review can't pass regardless of MEDIUM/LOW fixes).

## Phase 3 — Re-validate + story update (STOP gate)
Re-run local validations (lint · typecheck · tests) after the fixes — a fix that reds a check isn't done. Mark each finding resolved in `## QA Results`, update the **File List** with anything the fixes touched, add fix notes. **STOP** — not complete until validations pass AND the story reflects the resolved state.

## Hand back — never self-approve
Hand back to the QG (`/review` re-review). **Do NOT self-approve, do NOT set status, do NOT close** — the QG owns the verdict, `/close` closes. (The QG's re-review runs its own self-heal gate; this skill does not duplicate it.)

## Loop discipline
This is ONE iteration of the QG loop driven by `/full-cycle` (or standalone). The circuit breaker (max iterations) lives in the **caller** — if findings keep recurring after the cap, escalate to the human, don't loop forever.

## ACK + two-channel learning
Emit the `apply-qa-fixes` ACK via **`@aiox/conductor`** (`passed` when all findings resolved + validations green; `failed` on HALT). **Phase 7 (two channels — ADR-COCKPIT-LEARNING-TELEMETRY):** 7a project learning → `.aiox/learning/logs/apply-qa-fixes/…` (what was fixed, files); 7b product telemetry via the conductor (framework metrics only: findings-by-severity, iterations, fix-success, duration — no code/finding text). Best-effort, never HALT on a log-write failure.

## Conductor integration (fail-closed)
No `CONDUCTOR_ACTIVE` → ignore. Under it: a genuine decision (e.g. a WON'T_FIX judgment) routes through the conductor (intercept → poll `resolved.json` → `instruction`/`selected`; timeout default 1800000 → HALT fail-closed + `idle_no_ack`). Never re-`AskUserQuestion` under conductor; never set `CONDUCTOR_ACTIVE`.

## Blocking conditions (HALT)
1. Story not found. 2. No QG findings in the story (run `/review` first). 3. A CRITICAL finding needs an architectural change beyond this story's scope → escalate to `@architect` (the story may need re-scoping); don't force a fix. 4. Validations fail after all fixes → HALT with the failing check; do NOT mark findings resolved. In every HALT: emit the ACK with `status: failed`, state the problem, don't self-approve.

## Git
Local commits only (the fixes). Push/PR is `@devops`-exclusive.

## Red flags
- "Fix the blockers, the rest later" — complete-findings: resolve all N. · "Fixed it, marking the story done" — never self-approves/closes; the QG re-reviews, `/close` closes. · "The lint error is unrelated" — a fix that leaves a red check isn't a fix. · "Batch-edit all findings without per-finding verify" — a fix for A can reintroduce B; verify sequentially.
