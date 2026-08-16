---
name: ds-zero-doubt-stack
description: Component-story quality checklist — type-safe stories, args-as-API, play/interaction tests, automated a11y, autodocs, visual regression, full coverage. The story-authoring quality bar for a new/changed component.
version: "1.0.0"
context: inline
agent: design-ops
user-invocable: true
argument-hint: "{component | story}"
status: active
allowed-tools: Read, Grep
---

# ds-zero-doubt-stack — Story Quality Checklist (Layer 2)

The quality bar for a component's stories (Storybook / equivalent), so a new component ships fully exercised. Binds to `aiox.config.json → design_system.root`; dormant if none. Part of `*approve-new-component`.

## The checklist
- **Type-safe stories** — `satisfies Meta<typeof Component>`, never `as Meta<…>`.
- **Args as API** — inputs via `args`, not props hardcoded in `render`.
- **Play / interaction tests** — interaction testing inline (await; scoped to the canvas).
- **Automated a11y** — the a11y addon / axe runs on every story (catches ~57% of WCAG issues).
- **Autodocs** — `tags: ['autodocs']`; MDX only when needed.
- **Visual regression** — every state/variant has a story (the visual contract; pixel-perfect).
- **Coverage** — every state, variant, interaction, and edge case gets a dedicated story.
- **Composition** — spread args from base stories; compose play functions.

## Use
Run before approving a new component (with `ds-composition-cookbook`). A story set that misses any item isn't "zero doubt" — list the gaps. Feeds the `ds-quality-gate` visual/a11y checks.

## Output
The per-item checklist result + the gaps to close before approval.
