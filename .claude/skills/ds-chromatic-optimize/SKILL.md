---
name: ds-chromatic-optimize
description: Visual-regression optimization — tune the visual-regression corpus (snapshot scope, TurboSnap/affected-only, baseline hygiene) so the visual gate stays fast and signal-rich, not flaky.
version: "1.0.0"
context: inline
agent: design-ops
user-invocable: true
argument-hint: "[scope]"
status: active
allowed-tools: Read, Bash, Edit
---

# ds-chromatic-optimize — Visual-Regression Optimization (Layer 3)

Keep the visual-regression gate fast and meaningful. Binds to the project's visual-regression tool (Chromatic or equivalent), configured via `aiox.config.json`. Dormant if none configured.

## What it tunes
- **Snapshot scope:** snapshot the states/variants that carry visual signal; drop redundant permutations that only add cost + flake.
- **Affected-only runs:** where the tool supports it (TurboSnap / affected detection), snapshot only what a change touched — the gate's cost should track the diff, not the catalog.
- **Baseline hygiene:** keep baselines current; a stale baseline turns every run into noise. Re-baseline deliberately, never to silence a real diff.
- **Determinism:** isolate non-determinism (animation, time, random data — use seeded fixtures) so a pixel diff means a code change, not data drift.

## Why
A slow or flaky visual gate gets ignored, and an ignored gate is no gate. This skill is the corpus lever that keeps `ds-quality-gate`'s visual check trustworthy.

## Output
The optimization plan/applied changes (scope, affected-only config, baseline actions) + the before/after cost & flake estimate.
