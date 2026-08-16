---
paths:
  - ".aiox-core/skills/**"
  - ".aiox-project/skills/**"
  - ".claude/skills/**"
  - "scripts/**"
---

# Claude CLI — Skill Invocation Syntax — AIOX Cockpit

Applies when invoking a Claude Code skill from the OS shell (PowerShell, Git Bash, cmd, bash) — NOT from the Claude Code REPL.

## The Rule (NON-NEGOTIABLE)

When invoking a skill **with arguments** via the `claude` CLI, wrap the **entire invocation including arguments in quotes**, so it reaches the session as a single prompt string:

```bash
claude [flags] "/skill-name <arg1> <arg2> ..."
```

### Why

The CLI splits unquoted arguments into separate positionals that get dropped/mis-routed:
- `claude --dangerously-skip-permissions /full-cycle path/to/story.md` → only `/full-cycle` reaches dispatch; the path is lost (the skill then tries to discover it heuristically).
- `claude --dangerously-skip-permissions "/full-cycle path/to/story.md"` → the full string enters as if typed in the REPL → the skill gets its argument intact.

## Canonical forms

| Form | Command | When |
|------|---------|------|
| **A (primary)** — quoted prompt | `claude --dangerously-skip-permissions "/full-cycle <path>"` | default for all arg'd invocations; orchestrators emit Form A when spawning child sessions |
| **B (fallback)** — stdin pipe | `echo "/full-cycle <path>" \| claude --dangerously-skip-permissions` | when quote-escaping is awkward |
| **C (one-shot)** — print mode | `claude --dangerously-skip-permissions -p "/verify <story>"` | ⚠ `-p` is one-shot — NEVER for multi-turn skills (kills the session before internal Agent Teams finish) |

## Anti-patterns

- No quotes → arg lost.
- Separate quotes (`claude "/skill" "arg"`) → each is a separate positional, not one prompt.
- `-p` on a multi-turn skill → dies after phase 1.

NÃO aplica a invocações via REPL (digitar `/skill args` numa sessão aberta) — esse caminho não passa pelo CLI parser.
