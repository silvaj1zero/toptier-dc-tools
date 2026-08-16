---
name: design-md
description: DESIGN.md source — classify README-only references or scaffold, lint, and read formal design-token contracts without inventing tokens.
version: "1.1.0"
context: inline
agent: design-ops
user-invocable: true
argument-hint: "{lint|scaffold|read} [path]"
status: active
allowed-tools: Read, Bash, Write
---

# design-md — DESIGN.md Token Source (Layer 1)

`DESIGN.md` may be either a formal **token contract** or a deliberately informal README-style design reference. Classify the file before interpreting it; never promote narrative documentation into a token system implicitly.

## Binding
The `DESIGN.md` lives at the project's design root (`aiox.config.json → design_system.root`, default `ds-core/DESIGN.md`). Other design skills treat it as the token SOT only after classification as `formal-token-contract`. A `readme-only` file is narrative/reference documentation and its token audits are `N/A`; `ambiguous-frontmatter` is a HALT.

## Format preflight (mandatory)
Run `node <design-md-skill-root>/scripts/classify-design-md.mjs <resolved-DESIGN.md>` before `read` or `lint`.

- `formal-token-contract` — YAML frontmatter exists and declares token keys. Continue with the existing Base → Semantic → Component behavior below.
- `readme-only` — no YAML frontmatter. `read` may return the narrative reference, explicitly labeled **non-token documentation**. `lint` returns `N/A — README-only; no formal token contract to lint`; never report token compliance, synthesize aliases, or require Base → Semantic → Component.
- `ambiguous-frontmatter` — frontmatter exists but declares none of the recognized token keys. **HALT** with the classifier reason; do not guess whether the file is formal.

If the classifier cannot read the file, HALT with its real error. `scaffold` remains available only when no `DESIGN.md` exists; it must never overwrite or upgrade a README-only file.

## Operations
- **read** — for a formal contract, load the token front matter (`colors:` / `typography:` / `spacing:` / `rounded:` / modes) and treat it as the authoritative token source for the session. For README-only, return narrative documentation without a token map.
- **lint** — for a formal contract, validate the token layering and integrity: Base → Semantic → Component (one-directional; Base never aliases Semantic; Component references only Semantic); no literal hex/rgb where an alias belongs; no cycles; modes/themes (light/dark/…) present when declared. Surface errors before any build proceeds — a broken formal DS is the blocker. For README-only, report the explicit `N/A` result from the preflight.
- **scaffold** — create a `DESIGN.md` from the conventional template (the base/semantic/component layers + a default mode set) for a project that has none.

## The rule
For a formal contract, **never hand-roll `globals.css`/tokens from zero when a DESIGN.md exists** — emit from it. Token values are OKLCH-first; alias over literal ("tokens or nothing"). A README-only file is documentation, not an emission source; consumers must not invent generated tokens from it.

## Output
The read tokens, the lint findings (with the exact violation), or the scaffolded `DESIGN.md`.
