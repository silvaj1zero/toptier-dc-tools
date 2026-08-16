---
paths:
  - "**"
---

# Agent Handoff Protocol — AIOX Cockpit

Applies when switching between agents or when context compaction occurs.

## When to Create a Handoff

1. Agent switching (e.g., `@dev` → `@devops` for push).
2. Context window approaching its limit.
3. Session ending with work in progress.

## Handoff Artifact Format

```yaml
# docs/handoffs/{date}-{slug}.md (ou .yaml estruturado)
handoff:
  from: "@dev"
  to: "@devops"
  date: "2026-06-29"
  story: "Story X.Y"
  branch: "feat/x.y-short-desc"

context:
  what_was_done:
    - "Added soft-tab handling in src/main.rs apply_soft_tab()"
  what_remains:
    - "Push to remote"
    - "Open PR"
  files_modified:
    - crates/aiox-cockpit/src/main.rs
  decisions_made:
    - "4-space soft tab, configurable later"
  blockers: []
```

## Location

Store at `docs/handoffs/` (versionado — prática real do repo: 30+ handoffs commitados). Um handoff é SOT durável que a próxima sessão precisa encontrar, não estado de runtime; `.aiox/` fica para estado efêmero (ver CLAUDE.md § dot-dir convention).

## Key Principle

A handoff artifact carries ~400 tokens of context instead of reloading full agent personas (~3-5K tokens). It preserves the context-window budget and makes the cross-agent boundary explicit. Validate any artifact a handoff references before passing it on.
