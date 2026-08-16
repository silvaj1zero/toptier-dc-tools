---
name: ds-quality-gate
description: The design-system review gate — accessibility, visual regression, and format-aware token audit that never treats README-only documentation as a formal token contract.
version: "1.1.0"
context: inline
agent: design-ops
user-invocable: true
argument-hint: "{story-path | component | file}"
status: active
allowed-tools: Read, Grep, Glob, Bash, Skill
---

# ds-quality-gate — DS Review Gate (Layer 3)

The mandatory gate for a UI change: accessibility, visual regression, and token compliance, run against the project's design system. Invoked by `/review` (+ `@design-ops`) when `involves_ui`.

## Binding
Resolve the DS from `aiox.config.json → design_system.root`; glob the catalog/tokens at runtime (never a fixed count). **Dormant/HALT-graceful** if no DS configured. **HALT if the DS root is declared but missing** ("DS not initialized").

When the root contains `DESIGN.md`, run the `design-md` format preflight before the token check:

- `formal-token-contract` — run the existing token audit unchanged.
- `readme-only` — report the token check as `N/A — README-only; no formal token contract`. This is not a token PASS and must not block an unrelated UI change. Continue accessibility and visual checks without inventing tokens or aliases.
- `ambiguous-frontmatter` or classifier error — **HALT** with the exact reason; never silently PASS or guess the format.

## The three checks
1. **Accessibility — WCAG 2.1 AA** (axe / equivalent): contrast ≥ 4.5:1 normal / 3:1 large + non-text/focus; focus always visible; no `outline:none` without a substitute. Run the project's a11y tooling if configured.
2. **Token audit (formal contracts only):** implementations use **semantic tokens**, no magic hex/rgb/px; layering Base → Semantic → Component holds; no orphaned/undefined CSS vars after a token change. **HALT if token drift exceeds the configured threshold.** For README-only, emit the explicit `N/A` result from the preflight instead of applying formal-token rules.
3. **Visual regression** (Chromatic / equivalent, if configured): pixel-diff against the baseline; new diffs reviewed, not auto-accepted.

## Verdict
PASS only when all configured, applicable checks pass and no preflight HALT remains. `N/A` is reported separately and never relabeled PASS. Findings follow complete-findings (`references/complete-findings-resolution.md`) — each FIXED/WON'T_FIX/DEFERRED. Runs in parallel with `@qa`'s `/review`; **both must PASS** to close.

## Anti-AI-look
Also flag the AI-slop signals (banned default fonts, >1 accent / oversaturation, decorative gradient-text/glassmorphism, generic "Jane Doe" copy) — see the `design-ops` agent / design bans. A high slop score blocks.

## Output
Per-check status (a11y / token / visual) + the findings table + the gate verdict. A FAIL routes back to the executor (via `/apply-qa-fixes`).
