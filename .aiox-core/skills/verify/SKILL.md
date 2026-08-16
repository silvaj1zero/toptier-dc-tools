---
name: verify
description: E2E verification of a deployed story — Reality-First (prove the value works, not just that it's running), checks resolved from the project's deploy config, writes e2e_verification (consumed by /close), ACK + telemetry. Status-read-only. Never auto-rollback. Agnostic; dormant when deploy_type none.
version: "1.1.0"
context: inline
agent: devops
user-invocable: true
argument-hint: "{story-path} [--environment=dev|staging|prod]"
status: active
allowed-tools: Read, Bash, Edit, Write, AskUserQuestion
---

# /verify — Verify Deploy

Prove the deployed story actually works end-to-end — not just that containers are up. Write the result into the story's `e2e_verification` block, which `/close` (CHK-7) reads. **Status-read-only** — `/verify` never transitions the story.

**Input:** story path from `$ARGUMENTS`; optional `--environment`.

## Binding (per-project, agnostic — K2)
**Never hardcode endpoints, ports, or targets.** Resolve the health endpoint, the target per environment, and the checks-to-run from the project's deploy config (`aiox.config.json → deploy`, or the project's infrastructure map). The set of checks for a given `deploy_type` is declared by the project, not baked into this skill.

**Env-var expansion guard (★, NON-NEGOTIABLE):** when a check or endpoint references `${ENV_VAR}`, the var MUST be set and expansible at runtime. If it expands to empty / is unset → **HALT** — never run a check against a literal unexpanded `${ENV_VAR}` string (that produces a meaningless PASS/FAIL). Report which var is missing.

## Verification Phase Protocol (3 phases, STOP gates — don't skip)

### Phase 1 — Environment check
Read the story's `deploy_type` (auto-detect from the File List if absent). **`deploy_type: none` → record SKIP/PASS, jump to Phase 3.** Resolve the target + health endpoint from config. Evaluate prerequisites (provider CLI/token present, host reachable). **Unreachable host/VPN → record PARTIAL** (an environment gap, not a deploy failure) and continue — never emit misleading FAILs for an unreachable environment.

### Phase 2 — Verification execution
Run the foundation check first (connection/health). Then run the project-declared checks for this `deploy_type`, **Reality-First**: prove the real value cycle works (the migration applied and the data is queryable; the endpoint serves; the deployed version matches what was built). Record each check with `name`, `status` (PASS/FAIL/PARTIAL/SKIP), and `details`. A critical FAIL stops that check group, not the whole run.

### Phase 3 — E2E sign-off
Determine the overall status from the per-check results (a critical-check FAIL → overall FAIL; non-critical → PARTIAL). **Write the `e2e_verification` block into the story** (overall status + the per-check list). If overall is FAIL, emit a Failure Reporting Block with a suggested fix per failed check. **Never auto-rollback** — a FAIL is a human decision.

```yaml
e2e_verification:
  status: PASS | FAIL | PARTIAL
  environment: { dev | staging | prod }
  checks:
    - { name: "...", status: PASS | FAIL | PARTIAL | SKIP, details: "..." }
```

## Why it writes to the story
A PASS stated only in chat is invisible to `/close` CHK-7 and will block the close. The verdict must live in the story's `e2e_verification` block.

## ACK + two-channel learning
Emit the `verify` ACK via **`@aiox/conductor`** (`passed` on overall PASS, `failed` on FAIL; PARTIAL carries a `partial` note). **Phase 7 (two channels — ADR-COCKPIT-LEARNING-TELEMETRY):** 7a project learning → `.aiox/learning/logs/verify/…` (per-check results — domain); 7b product telemetry via the conductor (framework metrics only: deploy_type, checks run, PASS/FAIL/PARTIAL counts, duration — NO endpoint/target/secret values). Best-effort, never HALT on a log-write failure. (Writing the ACK does NOT transition status — `/verify` is status-read-only.)

## Decision points (interactive)
Stale-state confirmation, accepting a PARTIAL, a FAIL's next step → ask via `AskUserQuestion`. Standalone, ask directly; under an orchestrator (`CONDUCTOR_ACTIVE`), the decision routes through the conductor — poll `resolved.json`, **fail-closed on timeout** (default 1800000 → HALT + `idle_no_ack`), never re-`AskUserQuestion` under conductor.

## Absolute rules
Reality-First (prove the value, not the process) · never hardcode endpoints (resolve from config) · unreachable environment → PARTIAL, not FAIL · never auto-rollback · status-read-only (`/close` transitions) · the verdict is written to `e2e_verification` or it didn't happen.
