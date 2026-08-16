---
paths:
  - "**"
---

# Complete Findings Resolution — AIOX Cockpit

Applies when any review, audit, or analysis produces a list of findings, gaps, or actions.

## Non-Negotiable Rule

**ALL findings from ANY review must be resolved. No exceptions.**

When a review (code-review, an adversarial pass, a roundtable, CodeRabbit, or any analysis) returns N findings, ALL N must be addressed. Cherry-picking "blockers only" is process debt.

## What "resolved" means

Each finding must be in ONE of these states:

| State | Meaning | Allowed? |
|-------|---------|----------|
| **FIXED** | Applied to the artifact | YES |
| **WON'T_FIX** | Explicitly rejected with written justification | YES (rare) |
| **DEFERRED** | Tracked in a follow-up task with owner + deadline | YES (with tracking) |

NOT allowed: silently omitted · "follow-up" without a tracked task · "non-blocking" used to skip.

## Prioritization vs omission

Severity determines the ORDER of execution, not WHETHER to execute. Apply CRITICAL → HIGH → MEDIUM → LOW — all of them. Result: N/N resolved, not "the blockers, rest abandoned".

## Anti-patterns

- "Apply blockers, defer the rest" — deferral without tracking = abandon.
- "It's just MEDIUM/LOW" — severity sets order, not inclusion.
- Presenting only the top-N findings — if the tool found N, report N.

## Enforcement

Governance, by agent compliance. Every review output SHOULD end with a resolution table (`Finding | Status | Action`) and a `Total: resolved/total` line. 100% resolution is the only acceptable outcome; partial resolution requires explicit per-finding justification.
