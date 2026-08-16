---
paths:
  - ".claude/skills/**"
---

# Skill Agnosticism — AIOX Cockpit

Applies when creating, editing, or refactoring any skill in `.claude/skills/` — especially orchestrator skills (e.g. `/wave-execute`) and the atomic dev-cycle skills they invoke (`/validate`, `/develop`, `/review`, `/close`, `/deploy`, `/verify`, `/push`).

## The Rule (NON-NEGOTIABLE)

**Every skill MUST be usable STANDALONE, with no dependency on an orchestrator.**

When an orchestrator skill (e.g. `/wave-execute`) invokes an atomic skill (e.g. `/full-cycle`), the atomic skill MUST keep working standalone exactly as before. A change that breaks unit invocation is REJECTED.

### Why

- **Modularity** — each skill is an independent unit; coupling to the orchestrator breaks REUSE > ADAPT > CREATE.
- **Debugability** — when something fails, you invoke the skill in isolation to reproduce.
- **CLI First** — features work 100% via CLI before any UI/orchestration.
- **Composability** — future orchestrators reuse the same atomic skill.

## Context Contract

| `context` | Can | Cannot |
|-----------|-----|--------|
| `inline` | read session conversation + already-loaded files | spawn isolated sub-process |
| `fork` | spawn an isolated sub-agent | access the session conversation |
| `conversation` | Agent Teams (TeamCreate + SendMessage) | pre-announce phases that aren't verified |

## Anti-Patterns (BLOCKING in review)

### AP1 — Hard-coded orchestrator dependency
An atomic skill must NEVER assume it was invoked by an orchestrator.
```
WRONG:   if not env["WAVE_RUN_ID"]: raise "must be invoked by /wave-execute"
CORRECT: run_id = env["WAVE_RUN_ID"] or generate_standalone_id()
```

### AP2 — Assume pre-provisioned state
An atomic skill cannot assume a worktree/workspace was pre-provisioned. The fallback-creation path MUST exist and work standalone.
```
WRONG:   assert exists(".ack/dispatch.ack")
CORRECT: if exists → use; else → create
```

### AP3 — inline ↔ fork mismatch
A `context: inline` skill must not spawn isolated sub-processes; a `context: fork` skill must not reach into session state. Match behavior to the declared context.

### AP4 — Cross-skill state leak
Skill A must not read/write Skill B's private artifacts. Shared state goes through canonical ACK files (`.ack/{id}/<phase>.ack`), never by reaching into another skill's working dir.

## Decision Tree — modifying a skill

```
Modifying an atomic skill (inline/fork)?
  └─ Could the change affect standalone (no-orchestrator) behavior?
       ├─ YES → list the standalone test cases, prove they still pass, update this skill's "Skill Agnosticism" note.
       └─ NO  → OK.

Modifying an orchestrator skill (conversation)?
  └─ Does it change the contract with a child skill?
       ├─ YES → verify the child still works standalone; update its compatibility note.
       └─ NO  → OK.
```

## Enforcement

Advisory — by review. Any PR touching an atomic or orchestrator skill SHOULD demonstrate that standalone invocation still works (test case or smoke evidence).
