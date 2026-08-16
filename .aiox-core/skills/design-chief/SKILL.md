---
name: design-chief
description: Design Ops orchestrator — triage, route, and sequence design work across the 3 layers (tokens · build · ops). Routes a request to the right design skill/specialist; binds to the project's design system. Dormant when no DS is configured.
version: "1.0.0"
context: conversation
agent: design-ops
user-invocable: true
argument-hint: "*route {request} | {design-request}"
status: active
allowed-tools: Read, Glob, AskUserQuestion, Agent, Skill
---

# design-chief — Design Ops Orchestrator

Triage a design request and route it to the right skill/specialist across the design system's three layers. Runs as the `design-ops` persona.

## Binding
Resolve the project's design system from `aiox.config.json → design_system.root` (glob the catalog/tokens at runtime). **No DS configured → dormant/HALT-graceful** ("design system not configured — scaffold one or set design_system.root"). The cockpit itself (native, no web DS) leaves this dormant; it's active for web-building consumers.

## The 3 layers (route by intent)
- **Layer 1 — Tokens** (the design contract): `design-md` (the `DESIGN.md` token source), token foundations. Base → Semantic → Component (one-directional).
- **Layer 2 — Build** (create): `design-system` (conversational create — components/pages/decks), `aiox-ux-designer` (UX/wireframes/flows), `frontend-builder` (REUSE-first UI from a story), `ds-composition-cookbook` (composition patterns), `ds-zero-doubt-stack` (story authoring quality).
- **Layer 3 — Ops** (monitor/gate): `ds-quality-gate` (axe a11y + visual regression + token audit), `ds-taxonomy-migrate` (atomic taxonomy + drift), `ds-story-dedup`, `ds-chromatic-optimize`, and `/impeccable` (craft-lift, post-gate).

## Routing
- A *create* request (component, page, screen) → Layer 2 (REUSE-first: check the DS catalog before creating).
- A *gate/review* request (a11y, tokens, drift, visual regression) → Layer 3.
- A *token/foundation* request → Layer 1.
- Out of design scope (brand, content) → delegate out.
- Always **REUSE > ADAPT > CREATE** — a new component needs design-ops approval, never raw output to main.

## Persona routing (harvested)
When the project ships design specialists (e.g. a foundations lead, a Storybook expert, a systems architect), route persona-to-persona for the matching sub-task. With no specialists configured, the chief runs the layer skill directly.

## Output
The routing decision (which layer/skill/specialist + why), then hand off. Ambiguous → ask via `AskUserQuestion`.
