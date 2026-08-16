---
name: frontend-builder
description: REUSE-first UI build pipeline for a story — produce a REUSE map before any JSX, build from the design-system catalog, gate with ds-quality-gate (parallel to @qa). The Layer-2 build pipeline that turns a UI story into composed, gated UI.
version: "1.0.0"
context: conversation
agent: design-ops
user-invocable: true
argument-hint: "{story-path}"
status: active
allowed-tools: Read, Edit, Write, Bash, Skill
---

# frontend-builder — REUSE-First UI Pipeline (Layer 2)

Turn a UI story into built, gated UI — reusing the design system before writing anything new. Binds to `aiox.config.json → design_system.root`; dormant if no DS. Invoked for `involves_ui` stories (often from `/develop` or `design-chief`).

## Phase 1 — REUSE map (BEFORE any JSX)
Produce a **REUSE Map** of the screen: each part gets a verdict (**REUSE** / **ADAPT** / **CREATE**) + the design-system component + its path. Run `ds-story-dedup` for each candidate. A **CREATE** requires `*approve-new-component` (`ds-composition-cookbook` + `ds-zero-doubt-stack`) first — never a primitive recreated in the app as a workaround.

## Phase 2 — Build
Compose from the catalog per the REUSE map; emit tokens from `DESIGN.md` (Base → Semantic → Component); no magic hex/px. **Edit-first** — fix the located element; regenerate a section only when its structure is fundamentally broken (minimize blast radius).

## Phase 3 — Gate (parallel to @qa)
Run `ds-quality-gate` (token audit + a11y WCAG 2.1 AA + visual regression + anti-AI-look) **in parallel with `@qa`'s `/review`** — **both must PASS**. A gap in the DS is a `design-ops` finding (owner: extend the DS), never accepted as an app one-off.

## Principles
REUSE > ADAPT > CREATE · tokens-or-nothing · WCAG 2.1 AA · anti-AI-look · edit-first. Implementation commits are local; push is `@devops`.

## Output
The built UI + the REUSE map (what was reused/adapted/created) + the gate result. Gaps registered against the DS.
