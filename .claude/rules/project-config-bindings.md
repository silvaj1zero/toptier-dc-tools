---
paths:
  - "aiox.config.json"
  - ".aiox-core/agents/db-sage.md"
  - ".aiox-core/agents/design-ops.md"
  - ".aiox-core/skills/**"
---

# Project Config Bindings — AIOX Cockpit

Applies when an agent or skill needs a **per-project binding** — where the design system lives, which database to use, or any project fact that differs per consumer. The AIOX dev environment is **agnostic**: it ships the same agents/skills to every project; the *bindings* are resolved at runtime from the consuming project's config.

## The config file

**`aiox.config.json`** at the **repo root**, **committed** — a project fact, like `package.json`/`tsconfig.json`. It is NOT `.aiox/` (gitignored state) and NOT `.aiox-core/` (read-mostly installed framework).

```json
{
  "aiox_core": { "version": "0.1.0", "channel": "pinned" },
  "design_system": { "root": "ds-core" },
  "database": { "provider": "postgres", "url_env": "DATABASE_URL" }
}
```

`aiox_core` pins which published framework version this project consumes from
`ghcr.io/synkraai/aiox-core` (F-X3). Absent ⇒ the project is not yet an aiox-core client (it
hand-maintains its own `.claude/`). See `docs/distribution/aiox-core-publishing.md`.

## Resolution (NON-NEGOTIABLE)

Every binding resolves at runtime, in this order, and **globs/reads the path live** — never a hardcoded path, never a fixed count:

| Binding | Resolution order | Absent → |
|---------|------------------|----------|
| **aiox-core** | `aiox.config.json → aiox_core.version` → pull `ghcr.io/synkraai/aiox-core:<version>` | **dormant**: project is not an aiox-core client yet — hand-maintains its own `.claude/`. |
| **design system** | `aiox.config.json → design_system.root` → default `ds-core/` (repo root). Neste repo o binding real é `"root": "."` (DESIGN.md na raiz) | **HALT graceful**: "Design system not configured — scaffold one or set `design_system.root`." |
| **database** | `aiox.config.json → database.url_env` (an env-var NAME) → `DATABASE_URL` → `SUPABASE_DB_URL` | **HALT graceful**: "No database configured — set `database` in aiox.config.json." |

A `null`/absent binding is **valid** — the agent is *shipped-but-dormant* for projects that don't use that capability (e.g., a native app with no web design system or no app database). Dormant ≠ broken: HALT graceful, never invent a target.

## Secret-safety (NON-NEGOTIABLE)

`aiox.config.json` is committed, so it **NEVER holds a secret**. It holds only:
- non-secret config (a DS path, a DB `provider`), and
- the **NAME** of the env var that holds the secret (`url_env`), never the value.

The actual secret (DB password / connection string) lives in the environment or in `.aiox/` (gitignored). This mirrors the name-only-refs pattern (secrets out of committed config).

## Anti-patterns (BLOCKING)

| # | Anti-pattern | Why |
|---|--------------|-----|
| PB1 | Hardcoding a specific project's DS/DB path in an agent/skill (e.g. `@sinkra/ds-core`, a fixed connection) | breaks agnosticism — the agent ships to every project; bindings are per-project |
| PB2 | Putting a secret (DB password / full URL with credentials) in `aiox.config.json` | committed file → secret leak. Use `url_env` (the name) + env value. |
| PB3 | A fixed count/path in docs ("ds-core has 42 tokens") instead of a runtime glob | drifts instantly; always resolve + glob live |
| PB4 | Treating an absent binding as an error/crash instead of HALT-graceful "not configured" | dormant capability is valid for projects that don't use it |

## Applies To
- `aiox.config.json` (the contract).
- `db-sage` (database binding) and `design-ops` (design-system binding) agents.
- Any future design/database **skill** that needs a project binding.
