---
name: deploy
description: Deploy a story's artifact to the target resolved from the project's deploy config — Reality-First pre-check, immutable-version deploy, post-deploy health, ACK + telemetry, route to /verify. @devops-exclusive. Agnostic (never hardcodes targets); dormant when no deploy is configured.
version: "1.1.0"
context: fork
agent: devops
user-invocable: true
argument-hint: "{story-path} [--environment=dev|staging|prod]"
status: active
allowed-tools: Read, Bash, Edit, Write, AskUserQuestion
---

# /deploy — Deploy Story

Deploy a story's built artifact to the target the project declares. **`@devops`-exclusive.** Runs only when the story actually deploys something.

**Input:** story path from `$ARGUMENTS`; optional `--environment=dev|staging|prod`.

## Step 0 — Skip gate
Read `deploy_type`. If `none` (or absent) → **SKIP entirely** ("no deploy needed; next: `/close`"). The cockpit itself ships this way — a native app distributes (sign/notarize/installer, see `docs/distribution/` + `@devops`), it doesn't server-deploy; for such projects `/deploy` is dormant.

## Binding (per-project, agnostic — K2)
**Never hardcode a target, URL, app id, port, or credential.** Resolve everything at runtime from the project's deploy config (`aiox.config.json → deploy`, or the project's infrastructure map): the provider, the target per environment, the health endpoint, and the **name** of each secret env var (never the value). If no deploy config exists → **HALT graceful** ("no deploy target configured — set `deploy` in aiox.config.json").

## Step 1 — Environment + target resolution
Resolve the environment (first hit): `--environment` flag → the story's `deploy_environment` → infer from `deploy_type` (conservative default `prod`). Then resolve the target for that environment from the deploy config. Unknown environment or no matching target → HALT.

## Step 2 — Reality-First pre-deploy check
Read the live state of the target (via the provider's API, from config). If the target is unhealthy or in an unexpected state → HALT (don't deploy over a broken service). If the live state is stale/unavailable → WARN + ask for explicit human confirmation; never block silently.

## Step 3 — Deploy via the data-driven engine (★)
The deploy is **not hardcoded per provider** — it runs the `deploy_commands[]` the project declares for this `deploy_type` (auto-detected from the File List when the story omits it). A generic engine executes the configured command sequence; the skill stays provider-agnostic.
- **`installer` / `release` deploy_type (the cockpit's own distribution):** the `deploy_commands[]` are the signing/notarization/installer-build/publish steps (macOS notarytool, Windows installer sign, GHCR/Releases publish, auto-update feed) — see `docs/distribution/` + `@devops`. This is how the AIOX Cockpit itself "deploys".
- Where the provider supports it, deploy a **pinned, immutable version** (a digest/sha), not a moving tag — resolve it from `--digest`/the build context/the registry per the config.

## Step 4 — Post-deploy health
Hit the target's health endpoint (from config). Unhealthy after deploy → report + HALT (consider rollback per the provider). Healthy → record what was deployed (target, environment, version, timestamp).

## Step 5 — Route to verify
On success: "Deploy complete. Next: `/verify {story-path}`." Hand off to `@devops` for `/verify`. Pre-populate the story's `e2e_verification` with `status: pending` so `/verify` knows what to check.

## Step 6 — ACK + two-channel learning
Emit the `deploy` ACK via **`@aiox/conductor`** (`passed` on a healthy deploy, `failed` on a HALT/unhealthy). **Phase 7 (two channels — ADR-COCKPIT-LEARNING-TELEMETRY):** 7a project learning → `.aiox/learning/logs/deploy/…` (what deployed: target, environment, version); 7b product telemetry via the conductor (framework metrics only: deploy_type, duration, health-check outcome, rollback? — NO secrets, NO target URLs/identity). Best-effort, never HALT on a log-write failure.

## Decision points (interactive)
Stale-state confirmation, rollback decision → ask via `AskUserQuestion`. Standalone, ask directly; under an orchestrator (`CONDUCTOR_ACTIVE`), the decision routes through the conductor — poll `resolved.json`, **fail-closed on timeout** (default 1800000 → HALT + `idle_no_ack`), never re-`AskUserQuestion` under conductor. (DP-deploy: the deploy-confirmation decision.)

## Absolute rules
Deploy @devops-exclusive · never hardcode targets/secrets (resolve from config) · never deploy over an unhealthy target · prefer immutable-version deploys · production targets honor the project's protection rules + escalation ceiling (`devops-escalation-ceiling.md`) · a failed deploy never routes to `/verify`.
