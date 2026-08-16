---
name: three-brain
description: Engine router — pick the right AI engine per task and enforce no-self-review. Claude is the driver; a DIFFERENT engine (Codex / Gemini / a structured reviewer) reviews Claude's output. Routes by task type; never lets an engine review its own work.
version: "1.0.0"
context: inline
agent: general-purpose
user-invocable: true
argument-hint: "[task description or file glob]"
status: active
allowed-tools: Bash, AskUserQuestion
---

# /three-brain — Engine Router

Route a task to the AI engine best suited to it, and **never let an engine review its own output**. Fits the cockpit's multi-CLI model (the same SOT projects to `.claude` / `.codex` / `.gemini`), so the engines are the CLIs the project has configured.

**Invocation:** `/three-brain "{task}"` or `/three-brain {file-glob}`.

## The law: no self-review (READ FIRST — NON-NEGOTIABLE)
Claude (the driver) **never reviews its own output**. When a review/verify step is needed, it is delegated to a **different engine**. Self-review has structural blind spots; a second engine is the cheapest way to catch them.

## The engines
- **Claude** — the primary driver: implementation, orchestration, reasoning.
- **Codex (or another reasoning engine)** — reviewer / rescue: reviews Claude's diffs, second-opinions a hard bug.
- **Gemini (or a long-context engine)** — eyes/ears: long-context reads, large-corpus scans, cross-file analysis Claude's window can't hold.
- **A structured reviewer (optional)** — AST/security/standards review when one is configured.

Availability is per the project's configured CLIs — route only to engines that exist; if the only engine is Claude, say so and fall back to a self-review with an explicit blind-spot warning (don't pretend a second engine ran).

## When to route
- Code written by Claude needs review → a different engine (Codex / structured reviewer).
- A task needs more context than fits Claude's window → the long-context engine.
- A hard failure Claude can't crack after a couple of tries → the rescue engine.
- A trivial single-engine task → no routing; just do it.

## Announce forced routes
When you route a task away from Claude, announce it briefly (which engine, why) so the human sees the delegation — don't silently hand off.

## Failure detection (HARD)
If a routed engine is unavailable or errors, report it and fall back explicitly (next-best engine, or Claude with a stated blind-spot caveat) — never fabricate a review that didn't run.

## Output
The routing decision (engine + reason), the engine's result, and — for a review route — the findings (which feed `/apply-qa-fixes` or the `/review` gate). Ambiguous task → ask which engine via `AskUserQuestion`.
