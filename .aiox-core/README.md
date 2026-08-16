# `.aiox-core/` — the AIOX framework SOT

**This is the CLI-agnostic source-of-truth for the AIOX dev environment.** Everything an AIOX
install lays down and upgrades lives here. Hand-edit **here**, never in the projections.

```
.aiox-core/
├─ skills/      # the unit of capability — each = <skill>/SKILL.md + references/ + assets/ + scripts/ + config
├─ agents/      # subagent personas (*.md)
├─ rules/       # governance, auto-loaded (*.md, with `paths:` frontmatter)
├─ templates/   # shared output templates
└─ sync/        # the projector → .claude / .codex / .gemini / …
```

## Sync (SOT → per-CLI projections, overlay-aware)

```bash
node .aiox-core/sync/sync.mjs            # all adapters
node .aiox-core/sync/sync.mjs claude     # one adapter
node .aiox-core/sync/sync.mjs codex      # Codex skills projection
```

Projections (`.claude/`, `.codex/`, later `.gemini/`, Grok, opencode, …) are **GENERATED and
committed** so a fresh clone works with no build step. **Never hand-edit a projection** — that is
the #1 drift/garbage source. Edit the SOT and re-run the sync.

The Codex adapter emits `.codex/skills/` with Codex-native `name` + `description` frontmatter,
stripping Claude-only execution metadata while preserving each skill body and bundled resources.

**Overlay (clients).** The sync layers two SOTs: this `.aiox-core/` (the **base** — installed
framework) plus an optional **`.aiox-project/`** at the repo root (the consuming project's own
layer). On a name collision the **project layer wins**, and a base update **never deletes** a
project-authored skill/rule (it lives in a separate SOT). The cockpit now uses this layer for its
installed SINKRA/project-only framework surface; the base remains independently publishable. This is also how
`sinkra-hub` becomes a client: it pulls the base from GHCR and keeps its SINKRA layer in
`.aiox-project/`. See `docs/distribution/aiox-core-publishing.md`.

Adding a new CLI = add one entry to `ADAPTERS` in `sync/sync.mjs`. The SOT never changes.

## Principles

- **Everything is a Skill** (the `/validate`-style mold). The legacy `development/{agents,tasks,workflows,checklists}` split is NOT used — it drifts. Capability = self-contained Skill.
- **Audit for dead weight.** Anything in the SOT never invoked is removed, not kept "just in case".
- Dev tooling only — `sync.mjs` is zero-dependency Node, not part of the shipped product.
