---
name: ds-story-dedup
description: Dedup a proposed component/story against the existing design-system catalog — prevent re-specifying something that already exists (REUSE > ADAPT > CREATE). Catches duplicate components before they're built.
version: "1.0.0"
context: inline
agent: design-ops
user-invocable: true
argument-hint: "{component-spec | story}"
status: active
allowed-tools: Read, Glob, Grep
---

# ds-story-dedup — Catalog Dedup (Layer 3)

Before a new component/story is built, check it against the existing catalog so the project doesn't grow a second `Button`. Binds to `aiox.config.json → design_system.root`; dormant if none.

## What it does
1. **Glob the real catalog** (`design_system.root` index + components) — never a fixed count.
2. **Match the proposal** by intent + shape against existing components (semantic search where the project has an index, else name + API comparison).
3. **Verdict:**
   - **COVERS** → an existing component already does this → REUSE (don't build).
   - **ADAPTABLE** → a near-match exists → ADAPT it (extend a variant), don't create.
   - **UNRELATED** → genuinely new → proceed to `*approve-new-component`.

## Why
Duplicate primitives are the main source of design drift. This is the REUSE-check before any CREATE; a CREATE verdict requires the dedup to return UNRELATED first.

## Output
The match result (COVERS / ADAPTABLE / UNRELATED) + the matched component + path, so the build either reuses, adapts, or proceeds to approval.
