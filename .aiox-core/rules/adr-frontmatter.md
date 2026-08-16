---
paths:
  - "docs/architecture/**"
---

# ADR Frontmatter — Machine-Readable Decision Schema — AIOX Cockpit

Applies when **creating, editing, or retrofitting** any Architecture Decision Record (`docs/architecture/**/ADR-*.md`).

> **Why:** an agent (or you, six weeks later) needs to know the architectural truth — which ADR is `APPROVED`, who supersedes whom, where a decision is mechanically enforced — **without parsing prose or hallucinating an old version**. The frontmatter IS the source of truth; the prose below it is human detail. ADRs are DATA: filterable by `status`, not re-read by narrative.

## Schema

Every ADR carries a YAML frontmatter block at the **top of the file**, BEFORE the `# ADR-...` H1. Any human prose/blockquote (`> **Status:** ...`) stays just below the H1 — the frontmatter **adds**, it doesn't replace.

```yaml
---
adr_id: ADR-COCKPIT-DISTRIBUTION        # REQUIRED — matches the filename (no .md)
title: "Distribution & signing strategy" # REQUIRED — one line
status: APPROVED                         # REQUIRED — enum (below)
date: 2026-06-29                         # REQUIRED — YYYY-MM-DD
author: "@architect ..."                 # recommended
supersedes: []                           # ADR-IDs THIS supersedes ([] if none)
superseded_by: null                      # ADR-ID that supersedes this (null when current)
complements:                             # ADR-IDs complemented (not replaced)
  - ADR-COCKPIT-LICENSING
applies_to_paths:                        # globs the ADR GOVERNS
  - "packaging/**"
decisions:                               # REQUIRED — ≥1; each traces to the body
  - id: D1                               #   exact id from the ADR body (D1/D2/...)
    summary: "Sign macOS via notarytool" #   one-line summary
    enforced_by: [".github/workflows/release.yml"]  # where it's mechanically guaranteed (or [])
---
```

### Required fields
`adr_id`, `title`, `status`, `date`, `decisions[]` (each with `id` + `summary` + `enforced_by[]`).

### `status` — closed enum
`APPROVED` · `ACCEPTED` · `PROPOSED` · `SUPERSEDED` · `DEPRECATED` · `REJECTED` · `DRAFT`. Normalize emojis/prose (`✅ ACCEPTED`) to the plain value.

### `type` — optional lifecycle-routing axis (default `architecture`)
Optional. `architecture` (the default 8-phase lifecycle) or `ui-ux` (the design-first lifecycle: four pre-phases R/M/A/S before Phase 0). **Absent ⇒ `architecture`** — every existing ADR is valid unchanged. Introduced by `ADR-COCKPIT-ADR-LIFECYCLE-SKILL` D10; the `/adr` skill (`references/ui-ux-lifecycle.md` + `adr-template.md` §2.8) is the operational source. A `type: ui-ux` ADR additionally carries the optional design-evidence fields `design_refs[]`, `mockup_ref`, `visual_approval`, `spike_ref` (all ui-ux-only; an `architecture` ADR omits them). The value is a free string, not a closed enum — the type system is extensible by design (future `db`/`process`/`integration` are placeholders); only `architecture` and `ui-ux` have a defined lifecycle today (No-Invention).

### `enforced_by[]` — the critical link
Each token points to **where the decision is mechanically guaranteed** — a CI workflow path, a build script, a hook, or a cross-ref to another ADR (`ADR-X` = "governed by"). **No-Invention:** if a decision has no mechanical enforcer yet, use `enforced_by: []`. Never fabricate a check; a not-yet-built enforcer is legitimate and simply advisory.

### Supersession coherence
- `status: SUPERSEDED`/`DEPRECATED` ⇒ `superseded_by` non-null.
- `superseded_by`, `supersedes[]`, `complements[]` ⇒ the target ADR must exist.

## Enforcement

Governance, by agent compliance (advisory). ADRs without frontmatter are tolerated as "pending retrofit" — never an error — but any ADR you create or edit MUST carry the schema. Query ADRs as data: filter `status == "APPROVED"` from the frontmatter, never from prose.
