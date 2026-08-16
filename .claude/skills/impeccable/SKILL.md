---
name: impeccable
description: Craft-lift (taste layer) — POST-gate visual refinement (polish / delight / bolder / quieter / typeset / colorize) once conformance already passed. Vendored upstream skill; the cockpit registers it and its boundary, never modifies it.
version: "vendored"
context: inline
agent: design-ops
user-invocable: true
argument-hint: "{audit|critique|polish|delight|bolder|quieter|typeset|colorize|live} [target]"
status: vendored
license: "Apache-2.0"
status_note: "Third-party skill — installed from upstream, not authored here. This file registers it in the design-ops system with the correct boundary; the real skill content is vendored separately and MUST NOT be modified locally (skill governance)."
allowed-tools: Read, Edit
---

# impeccable — Craft-Lift (taste layer, POST-gate)

A **taste** layer that raises craft *after* conformance is already satisfied. Vendored (Apache 2.0) — the cockpit uses it but does not author or modify it.

## When (the boundary — NON-NEGOTIABLE)
Invoke **only after** the design system's conformance gate has PASSED (`ds-quality-gate`: tokens + a11y + visual). Conformance = `ds-quality-gate` (mandatory). **Craft = `impeccable` (this layer, post-gate).** They are distinct planes — do not use impeccable to bypass the gate, and do not confuse its `PRODUCT.md`/`DESIGN.md` notion with the DS token contract.

## Subcommands
`audit` / `critique` (fine critique) · `polish` / `delight` / `bolder` / `quieter` / `typeset` / `colorize` (taste-lift) · `live` (iterate in the browser).

## Use in the system
The last step in the design build, after `ds-quality-gate` PASS, when the result is conformant but the *taste* needs to rise (bland → bolder, loud → quieter, polish, delight). Optional, never a gate.

## Governance
Vendored: install from upstream; never hand-edit. If upstream changes, re-vendor — don't fork locally. (See skill governance: vendored skills carry `status: vendored` + `license` and are not modified without upstream coordination.)
