---
paths:
  - ".claude/skills/**"
---

# Skill Execution Discipline — AIOX Cockpit

Applies when executing any skill from `.claude/skills/`.

## Non-Negotiable Rule

**Before executing Phase 1 of any skill, read ALL files in the skill's subdirectories** — `references/`, `assets/`, `config.yaml`. They hold execution context that `SKILL.md` references but does NOT inline.

## Why

Claude Code loads ONLY `SKILL.md` into context at activation. Subdirectory files are NOT auto-injected. If the executor doesn't read them, output diverges from the canonical format (real failure mode: a skill run without reading `assets/<template>` produced entities with the wrong schema).

## When delegating to agents

When a skill delegates to sub-agents, the agent does NOT have the skill's references. So:
1. **Include the output template** in the agent prompt.
2. **Include the config tokens** (thresholds/behavior) explicitly.
3. **Include the canonical field list** — agents invent fields if not constrained.

## Anti-patterns

- `see references/output-format.md` in SKILL.md without actually reading it.
- Delegating with an improvised schema instead of the canonical template.
- Hardcoding a template in a script instead of reading the asset.
