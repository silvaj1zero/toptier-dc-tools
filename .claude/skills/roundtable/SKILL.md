---
name: roundtable
description: Multi-agent consensus review — spawn domain-expert reviewers (real Agent Teams, sequential fallback), each analyzes in isolation, the moderator synthesizes a verdict. For design/architecture/code review that benefits from several expert lenses.
version: "1.0.0"
context: conversation
agent: roundtable
user-invocable: true
argument-hint: "[artifact-path] [--preset <name>] [--mode <mode>]"
status: active
allowed-tools: Read, Agent, TeamCreate, SendMessage, Write
---

# /roundtable — Multi-Agent Consensus Review

Review an artifact (an ADR, a design, a diff, a spec) through several **domain-expert lenses** at once, then synthesize a single verdict. Each reviewer analyzes **in isolation**; the moderator consolidates.

**Invocation:** `/roundtable {artifact-path} [--preset <name>] [--mode <mode>]`.

## Execution — real teams, with fallback
1. **SWARM (preferred):** `TeamCreate("roundtable-{id}")`, spawn ALL reviewers simultaneously in one message (each a teammate), wait for their `SendMessage` replies. The cockpit's lean footprint makes real parallel teams cheap.
2. **FALLBACK (graceful):** if `TeamCreate` throws (e.g. a one-team-at-a-time limit), downgrade — run the reviewers **sequentially** with plain `Agent()`, no `team_name`, no background; wait for each before the next. Never crash on the team limit.

**Golden rule:** reviewers analyze in isolation; the moderator consolidates. **No reviewer commits, pushes, or writes a handoff** — they only return findings.

## Agent selection
Pick the reviewer set from the artifact's domain (or a `--preset`): e.g. `@architect` (structure/trade-offs), `@qa` (quality/risk), `@db-sage` (data), `@design-ops` (UI). Default: a general technical panel. The moderator chooses lenses that actually apply — don't spawn a lens with nothing to say.

## Per-reviewer analysis
Each reviewer applies its lens and returns: findings (each CRITICAL/HIGH/MEDIUM/LOW), a per-lens verdict, and rationale. Reviewers do not see each other's output (anti-anchoring) until the moderator synthesizes.

## Synthesis → verdict
The moderator consolidates all reviewers' findings (dedup, resolve disagreements), and issues one verdict: **APPROVE · APPROVE_WITH_FIXES · REJECT**. Findings are listed with their source lens. Apply complete-findings (`references/complete-findings-resolution.md`): every finding gets FIXED / WON'T_FIX / DEFERRED — no cherry-picking.

## Modes
The mode tunes the output template, the verdict model, and the suggested reviewer preset (e.g. `epic_review`, `architecture_review`, `code_review`). Default: full technical panel.

## Output
A consolidated report: verdict, per-lens findings, the resolution table, and a one-line recommendation. Persist to `docs/architecture/` if it's an ADR review, else report inline.

## When to use which
`/roundtable` = **domain-expert** lenses (architecture, security, data). For **cognitive-diversity** lenses (contrarian, first-principles, outsider) use `/advisory-council`. For engine-diverse review (a different AI engine reviews) use `/three-brain`.
