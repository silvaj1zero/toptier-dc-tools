---
name: ds-composition-cookbook
description: Composition patterns + props-API validation for new/changed components — how to compose from the catalog, when_to_use / when_not_to_use, and a preserved props API on ADAPT. Part of approve-new-component.
version: "1.0.0"
context: inline
agent: design-ops
user-invocable: true
argument-hint: "{component | spec}"
status: active
allowed-tools: Read, Grep
---

# ds-composition-cookbook — Composition Patterns (Layer 2)

Guide how a component is composed from the design system, and validate its API. Binds to `aiox.config.json → design_system.root`; dormant if none.

## What it gives
- **Composition recipes:** how to build the target from existing catalog primitives (REUSE > ADAPT > CREATE) rather than reinventing.
- **when_to_use / when_not_to_use:** usage guidelines for the component, so consumers pick the right one.
- **Props-API validation (on ADAPT):** preserve the base component's props API — never add a required prop or remove one; preserve composition (`data-slot`), accessibility primitives (ARIA, roles, focus-visible, keyboard nav). Modify only visual utilities / semantic-token color / radius / spacing / states.
- **CSS-var integrity:** after a token/variant change, every referenced CSS var still resolves — zero orphaned vars.

## Use
Part of `*approve-new-component` (with `ds-zero-doubt-stack`): before a genuinely-new component is approved, prove it composes correctly, has clear usage guidelines, and preserves the API contract on any ADAPT.

## Output
The composition recipe + usage guidelines + the props-API/CSS-var validation result (PASS/findings).
