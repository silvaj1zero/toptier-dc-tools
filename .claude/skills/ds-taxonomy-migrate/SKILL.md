---
name: ds-taxonomy-migrate
description: Atomic-taxonomy classification + drift detection — classify components atoms→molecules→organisms→templates→pages, and detect divergence from the design system. Dry-run by default.
version: "1.0.0"
context: inline
agent: design-ops
user-invocable: true
argument-hint: "[--dry-run] [scope]"
status: active
allowed-tools: Read, Glob
---

# ds-taxonomy-migrate — Taxonomy + Drift (Layer 3)

Classify the project's components into the atomic taxonomy and detect drift from the design system. Binds to `aiox.config.json → design_system.root`; dormant if none.

## Atomic taxonomy (Brad Frost)
**atoms → molecules → organisms → templates → pages.** Classify every component:
- **atoms** — indivisible (Button, Input, Icon); standalone, tokens only, single-responsibility.
- **molecules** — groups of atoms as a unit (FormField, SearchBar); compose, don't reimplement.
- **organisms** — sections from molecules/atoms (Nav, LoginForm); reusable cross-template.
- **templates** — page-level layout, no real content.
- **pages** — templates with real content (app-specific).

## Drift detection (the interface-inventory method)
1. **Show the horror:** glob every real variation of a pattern (all buttons, all cards) and list them side by side — make the inconsistency visible.
2. **Minimal viable set:** propose the smallest variant set that covers the real cases.
3. **Consolidation metric:** `% reduction = (observed − minimal) / observed`. Quantify, don't opine. Counts come from a **runtime glob**, never a number in a doc.

## Output
`--dry-run` (default): the taxonomy classification + the drift report (over-variant patterns, consolidation %) — no changes. Without `--dry-run`: propose the migration (reclassify/consolidate) for approval. Feeds `ds-quality-gate`'s drift check.
