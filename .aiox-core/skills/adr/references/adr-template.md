# ADR Template — Distilled Frontmatter + Body Sections

This template is distilled from a large real-world corpus of architecture decision records (73
documents) and is a **superset** of the host project's required ADR frontmatter schema
(`adr-frontmatter.md`). It never removes or contradicts a required field — it only adds optional
fields that the elicitation phases (see `playbook.md`) already surface but, without this template,
tend to be lost after the decision is ratified.

## 1. Required baseline (unchanged — do not contradict)

The host project's schema remains the minimum, mandatory contract for every ADR:

```yaml
adr_id: ADR-<DOMAIN-OR-KEBAB-ID>   # REQUIRED — matches the filename (no .md)
title: "<one-line title>"           # REQUIRED
status: PROPOSED                    # REQUIRED — closed enum, see below
date: <YYYY-MM-DD>                  # REQUIRED
decisions:                          # REQUIRED — >=1
  - id: D1                          #   REQUIRED
    summary: "<one-line summary>"   #   REQUIRED
    enforced_by: []                 #   REQUIRED — real enforcer token(s) or []
```

`status` closed enum: `APPROVED` · `ACCEPTED` · `PROPOSED` · `SUPERSEDED` · `DEPRECATED` ·
`REJECTED` · `DRAFT`. `status: SUPERSEDED`/`DEPRECATED` requires a non-null `superseded_by`.
`supersedes[]`/`superseded_by`/`complements[]` targets must exist. See `adr-frontmatter.md` for the
full authoritative baseline — this document never restates it as a competing source of truth, only
extends it.

## 2. The 7 new optional fields (this template's addition)

None of these are invented — each traces to a concrete, well-established practice (see the research
this template distills from). All are optional; a minimal ADR can omit every one of them and still
be fully valid against the required baseline.

### 2.1 `consulted[]` / `informed[]` — lightweight responsibility tracking

```yaml
consulted: ["@some-domain-specialist"]   # who gave input / was asked for a domain opinion
informed: ["@some-downstream-owner"]     # who was kept in the loop but didn't shape the decision
```

Populate `consulted[]` with whoever gave a real opinion during an adversarial/peer review pass
(Phase 5/7 of the playbook); populate `informed[]` with stakeholders who needed to know but weren't
asked to weigh in.

### 2.2 `decisions[].confirmation` — how an unenforced decision is still confirmed

```yaml
decisions:
  - id: D1
    summary: "..."
    enforced_by: []
    confirmation: manual-review   # REQUIRED when enforced_by is [] — see rule below
```

Closed enum: `mechanical` (there's a real, automated enforcer — usually redundant with a non-empty
`enforced_by[]`) · `manual-review` (a human periodically re-checks compliance; there is no automated
enforcer yet) · `none` (genuinely unconfirmed — must be paired with an explicit rationale in the
decision's prose, never used silently).

> **Rule (NON-NEGOTIABLE):** if `enforced_by: []`, this template requires `confirmation` to be
> explicitly set. An empty `enforced_by[]` with no `confirmation` field is a silent gap — this
> generalizes the required baseline's "no-invention, never fabricate a check" rule by making the
> *absence* of a check equally explicit instead of leaving it implicit.

### 2.3 `decisions[].reversibility` + `decisions[].confidence`

```yaml
decisions:
  - id: D1
    reversibility: one-way-door   # one-way-door | two-way-door
    confidence: ALTA              # ALTA | MÉDIA | BAIXA — matches the host project's confidence tiers
```

`reversibility` flags whether undoing the decision later is cheap (`two-way-door`) or expensive/
practically irreversible (`one-way-door`) — a one-way-door decision deserves proportionally more
rigor during Phase 3 ratification (open prose over a quick closed question, per the anti-pattern
named in `playbook.md`). `confidence` reuses the same three-tier scale used elsewhere for
epistemic honesty in this project (ALTA/MÉDIA/BAIXA) so a low-confidence decision is visibly
flagged rather than presented with false certainty.

### 2.4 `decisions[].owner`

```yaml
decisions:
  - id: D1
    owner: "@some-agent-or-person"   # who is accountable for this decision staying correct over time
```

Distributed ownership: any decision can name an owner accountable for noticing when reality drifts
from what was decided, rather than every decision implicitly belonging to whoever happened to write
the ADR.

### 2.5 `decisions[].options[]` — the considered alternatives, persisted

```yaml
decisions:
  - id: D1
    options:
      - name: "Option A — <short name>"
        pros: ["<gain 1>", "<gain 2>"]
        cons: ["<cost 1>"]
      - name: "Option B — <short name>"
        pros: ["<gain 1>"]
        cons: ["<cost 1>", "<cost 2>"]
```

The elicitation in Phase 3 already surfaces a recommendation plus explicit trade-offs for each
decision — today that reasoning is easy to lose once ratification happens. This field persists it
as structured data instead of letting it evaporate after the decision is made, and doubles as the
source for a "Considered Options" section in the body when the decision is genuinely close.

### 2.6 `change_history[]` — machine-readable audit trail

```yaml
change_history:
  - date: <YYYY-MM-DD>
    author: "@who-made-this-pass"
    change: "<what changed in this pass and why>"
```

A structured counterpart to the prose Change Log table in the body — useful when the ADR is queried
as data (e.g. "show every ADR touched in the last 30 days") rather than read as prose.

### 2.7 `links[]` — typed relationships beyond supersedes/complements

```yaml
links:
  - type: refines          # refines | conflicts-with | enables
    target: ADR-<SOME-ID>
```

The required baseline already has `supersedes[]`/`superseded_by`/`complements[]` for the two most
common relationship shapes (full replacement, and "extends without replacing"). `links[]` adds
finer-grained, typed relationships for cases those two don't capture: `refines` (narrows or
specializes a broader decision without replacing it), `conflicts-with` (a known, currently
unresolved tension between two ADRs — flagged rather than hidden), `enables` (this decision is a
prerequisite that unlocks another, without either superseding or merely complementing it).

### 2.8 `type` + the `ui-ux` design-first fields (type-aware routing)

```yaml
type: ui-ux              # architecture (default) | ui-ux — the ADR type that governs its lifecycle
design_refs:             # ui-ux only — pre-phase R references/benchmark (≥1 concrete reference)
  - "<reference pattern> (<screenshot/URL/extraction file:line>)"
mockup_ref: "<branch> — <DS candidate paths> + Storybook <group>"   # ui-ux only — pre-phase M
visual_approval:         # ui-ux only — pre-phase A (the visual Human Gate)
  approved_by: "<founder/approver>"
  approved_at: <YYYY-MM-DD>
  decisions: ["<visual decision>", "..."]
spike_ref: "<green DS-gate artifact path>"   # ui-ux only — pre-phase S (buildability proof)
```

`type` is the routing axis introduced by `ADR-COCKPIT-ADR-LIFECYCLE-SKILL` D10. **Absent ⇒
`architecture`** (the default 8-phase lifecycle) — every existing ADR is valid unchanged. `type:
ui-ux` selects the design-first lifecycle: the four pre-phases R/M/A/S run **before** Phase 0 (full
playbook: the `/adr` skill's `references/ui-ux-lifecycle.md`), and the four fields above carry their
evidence — `design_refs[]` (Referências), `mockup_ref` (Mockup applying IDS), `visual_approval`
(the visual approval, with each design decision captured), `spike_ref` (the green DS-gate spike). All
are **optional and ui-ux-only**: an `architecture` ADR omits every one of them. A `ui-ux` ADR MUST
carry `visual_approval` + `spike_ref` before it opens — the skill's blocking condition enforces it.

**Retrocompat vs. new ADRs:** "absent ⇒ architecture" governs ADRs written before D10 — they remain
valid unchanged. Any ADR produced by the `/adr` skill from `006.W5.2` onward writes `type` explicitly
(including the `architecture` default) — the skill's automatic classifier always settles and records a
`type`, so a new ADR's silence is never ambiguous between "not yet classified" and "classified as
architecture".

## 3. Universal vs. conditional body sections

| Section | Type | When it appears |
|---|---|---|
| Title line + status line | Universal | Always |
| Context & Problem | Universal | Always — grounded in Phase 0 evidence |
| Design Evidence (references · mockup · visual approval · spike) | Conditional | Only `type: ui-ux` ADRs — the R/M/A/S pre-phase artifacts, cited as first-class evidence |
| Decisions (D1..DN) | Universal | Always — 1:1 with `decisions[]` |
| Data Model / schema sketch | Conditional | Only schema/data-model ADRs (Phase 2) |
| Contract (I/O flow, stage by stage) | Conditional | Only execution/data-contract ADRs (Phase 1) |
| Deprecation & Cleanup Audit | Conditional | Required for any schema/structural ADR (Phase 6) |
| Considered Options (detailed, per-option) | Conditional | When `decisions[].options[]` is populated and the decision was genuinely close |
| Consequences | Universal | Always |
| Open / Next Steps (tracked) | Conditional | Design ADRs still evolving (Phase 4 open items) |
| Migration plan | Conditional | Only schema/structural ADRs |
| Rejected Alternatives / Constraints / Rollback | Conditional | Varies — infra/operational ADRs carry more of these; a small design ADR may carry only Rejected Alternatives |
| Review Findings (resolution tracking) | Conditional | Only ADRs that went through an adversarial/peer review pass |
| References | Universal | Always |
| Change Log | Conditional | Required for multi-pass ADRs; a single-pass ADR may carry only the footer |
| Footer identity line | Universal | Always |

## 4. Full template

```markdown
---
adr_id: ADR-<DOMAIN-OR-KEBAB-ID>
title: "<one-line title>"
status: PROPOSED               # APPROVED|ACCEPTED|PROPOSED|SUPERSEDED|DEPRECATED|REJECTED|DRAFT
date: <YYYY-MM-DD>
author: "<proposer>"           # + (ratifier) / companion-research path if any
type: architecture             # optional — architecture (default) | ui-ux (design-first, §2.8); absent ⇒ architecture
consulted: []                  # optional — who gave real input
informed: []                   # optional — who was kept in the loop
supersedes: []
superseded_by: null
complements:                   # spine<->child-ADR / parent ADRs (targets must exist)
  - ADR-<RELATED-ID>
links: []                      # optional — [{type: refines|conflicts-with|enables, target: ADR-<ID>}]
applies_to_paths:              # globs this ADR governs
  - "<path/glob/**>"
decisions:                     # >=1; each id maps 1:1 to a ### D-section below
  - id: D1
    summary: "<one-line summary>"
    enforced_by: []            # real enforcer token(s) OR [] — never fabricate one
    confirmation: manual-review  # REQUIRED when enforced_by is []
    reversibility: two-way-door  # optional — one-way-door | two-way-door
    confidence: ALTA             # optional — ALTA | MÉDIA | BAIXA
    owner: "<accountable owner>" # optional
    options: []                  # optional — [{name, pros: [], cons: []}]
  - id: D2
    summary: "<...>"
    enforced_by: []
    confirmation: manual-review
change_history: []             # optional — [{date, author, change}]
---

# ADR-<DOMAIN-OR-KEBAB-ID> — <title>

> **Status:** <STATUS> — <YYYY-MM-DD> (v<x.y>).
> **Authorship:** <proposer>, via <interactive elicitation | companion research: docs/research/<date>-<slug>/>; ratified by <ratifier>.
> **Scope:** <what this ADR is canonical for — the contract/policy/model it fixes>.
> **[multi-pass only] Pass N (<date>):** <what this pass closed; what remains open — point to §Open>.

---

## 1. Context & Problem

<Why this ADR exists. Anchor in MEASURED reality, not abstraction.>

1. **<AS-IS pain #1>** — <evidence: grep count / "zero matches" / a real `file:line` finding>.
2. **<AS-IS pain #2>** — <...>.
3. **<AS-IS pain #3>** — <mixed concepts / redundancy / N representations of the same thing>.

<Optional governing principle the decisions below hang off of.>

---

## 2. Decisions

### D1 — <imperative decision title>

<Statement + rationale + evidence/prior-art + the trade-off the frontmatter summary omits.>
<For a pointer-decision: "RESOLVED (Option B): **ADR-<CHILD-ID>** — <one-line summary> (detail there).">

```jsonc|sql   // optional inline shape/DDL sketch, only when it clarifies the decision
{ "<example>": "<...>" }
```

### D2 — <...>
<...>

<!-- repeat per decision; nested sub-decisions allowed (### D5.1). Keep it terse in large ADRs; push detail to child ADRs. -->

---

## 3. Considered Options for D<n>          <!-- CONDITIONAL: only when decisions[].options[] is populated -->

| Option | Pros | Cons |
|---|---|---|
| <name> | <pros> | <cons> |

---

## 4. Data Model                            <!-- CONDITIONAL: only schema/data-model ADRs -->

```
<diagram of the model — layers/tables/edges>
```

### 4.1 New / changed structures (sketch — declarative intent, not a migration itself)
```sql
-- D<n>: <what>
CREATE TABLE IF NOT EXISTS <t> ( ... );
ALTER TABLE <t> ADD COLUMN IF NOT EXISTS <c> <type> ...;
```
> This is a sketch of intent. The real, idempotent migration is generated separately and follows
> the host project's own migration/schema discipline (append-only, expand-then-contract for
> anything destructive).

---

## 5. Contract — INPUT / OUTPUT               <!-- CONDITIONAL: execution/data-contract ADRs -->

```
[STAGE 1 TRIGGER]  <event/shape>                                   (Dn)
[STAGE 2 RESOLVE]  <...>                                           (Dn)
[STAGE 3 PERSIST]  <...>                                           (Dn)
[STAGE 4 FINALIZE] <...> → return { <handle> }                     (Dn)
```

---

## 6. Deprecation & Cleanup Audit (the DELETE half — pairs with §2/§4)   <!-- CONDITIONAL: schema/structural ADRs -->

> Measured surface (grep): <family X = N references / M files; ...>.

### 6.1 DROP — structures
<t1> · <t2> · <...>     <!-- include anything the sweep finds, even if it wasn't in the original create-side list -->
### 6.2 RENAME / repurpose (not a drop)
<old> → <new> (D<n>)
### 6.3 DROP — fields
<structure>: <field>, <field>; remove '<x>' from the constraint <constraint-name>
### 6.4 DROP — types/enums      (KEEP: <the ones that survive/migrate>)
### 6.5 Functions / triggers / access rules / grants
<audit ~N functions; drop access rules/grants on dead structures; KEEP + extend <survivors>>
### 6.6 Live code to re-wire
<file paths that need re-wiring>
### 6.7 Do not hand-edit
<generated-after-schema artifacts>. Append-only: <migration files> (cleanup = a NEW migration that drops).
### 6.8 Exhaustive sweep
<inline, or a pointer to a dated sweep manifest with file:line entries + the correct drop order (access-rules→triggers→indexes→foreign-keys→constraints/enums→structure)>

---

## 7. Consequences

**Positive:** <what the decision buys>.
**Trade-offs:** <accepted cost — refactor size, multi-phase migration, ...>.
**Debt:** <any debt explicitly named here → feeds §Open>.

---

## 8. Open / Next Steps (tracked)            <!-- CONDITIONAL: design ADRs still evolving -->

| # | Item | Type |
|---|---|---|
| O1 | <open item> | <cleanup / research / migration / design> |
| ~~O2~~ | <closed item> | ✅ **ADR-<CHILD-ID>** / STORY-<id> |

---

## 9. Migration plan                          <!-- CONDITIONAL: schema/structural ADRs -->

This ADR **declares the target model**. It is not big-bang: every creation goes through an
**expand** phase; every deletion (§6) goes through a **contract** phase after consumers have
migrated, following the host project's own append-only, declarative migration discipline.

---

## 10. Rejected Alternatives / Constraints / Compliance / Rollback   <!-- CONDITIONAL — include what applies -->

- **Rejected alternatives:** <what was considered and why it was rejected>.
- **Constraints / Compliance:** <governance principles this decision must respect>.
- **Risks & Mitigations / Rollback / Emergency Procedures:** <for infra/operational ADRs>.

---

## 11. Review Findings (Resolution Tracking)    <!-- CONDITIONAL: ADRs that went through review -->

| Finding | Status | Action |
|---|---|---|
| F01 | FIXED | <what was applied> |
Total: <resolved>/<total>.

---

## 12. References

- Companion research: `docs/research/<date>-<slug>/<files>.md`
- Prior art (code): `<file references>`
- ADRs: `ADR-<related>` · `ADR-<child>` · governing rules: `<rule file references>`

---

## Change Log

| Date | Version | Change |
|---|---|---|
| <YYYY-MM-DD> | <x.y> (<STATUS>) | <what changed in this pass and why> |

---

*ADR-<ID> v<x.y> (<STATUS>) — <host project> | <key descriptor> | complements <list> | <provenance/companion>*
```
