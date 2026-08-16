# Decision-Fork Catalog

A **fork** is a point in an ADR's elicitation where more than one genuinely defensible path exists
and a discrete, ratified decision (`D<n>` — see `playbook.md` Phase 3) is required to close it. This
catalog names the recurring *types* of fork observed across a large real-world corpus of
architecture decision records, so that a new decision can be classified quickly and elicited with
the right method (open prose vs. a closed-option question — see the elicitation anti-pattern named
in `playbook.md`).

Each entry: **name**, **detection signal** (how to recognize you're in this fork), and an
**agnostic example** (illustrative only — no real product or client name).

---

## F1 — Architectural fork that blocks the build

**Detection signal:** two pieces of the system need to depend on each other in a way that would
create a circular dependency, or a structural contradiction otherwise prevents the codebase from
even compiling/building. This fork typically blocks progress on something else until resolved.

**Example:** module A needs a type defined in module B, and module B needs a helper defined in
module A. Resolution requires extracting the shared piece into a third module that both can depend
on, or restructuring the boundary so the dependency only flows one way.

---

## F2 — Contract/wire-shape fork

**Detection signal:** the same piece of data or event could be represented in more than one shape
across a boundary (a minimal set of identifiers vs. a fully enriched payload vs. something in
between), and the choice has real cost/legibility trade-offs on both sides of the boundary.

**Example:** should an internal event carry only the IDs needed for routing, a denormalized
"display" snapshot for convenience, or the full resolved object? A hybrid (canonical IDs for
routing + a small denormalized snapshot for legibility) is a common resolution.

---

## F3 — Resolution-source fork

**Detection signal:** a value could legitimately come from more than one layer of the system (a
static template/default, a runtime-computed value, or a value bound to something concrete at
execution time), and it isn't obvious which layer should be the actual source of truth at read
time.

**Example:** should a computed field's default come from a static template, a per-instance
override, or a live binding to another field's current value? A layered resolution order (binding
> override > template default) is a common resolution.

---

## F4 — Storage-shape fork (business/technical trade-off)

**Detection signal:** a repeated tension between normalization purity (a fully relational,
satellite-table shape) and read performance / migration cost (a denormalized column, e.g. a
flexible key-value blob). This fork tends to resurface multiple times across related decisions in
the same ADR.

**Example:** should configuration for a flexible, per-type set of fields live as a structured
key-value column on the parent row, or as a fully normalized satellite table with its own rows?
Weighing normalization purity against fast reads and migration cost is the recurring trade-off.

---

## F5 — Materialization-mechanism fork

**Detection signal:** a side effect could legitimately be triggered from more than one layer with
different atomicity and ownership guarantees — most commonly a database-level trigger vs.
application-level code.

**Example:** should a derived record be created via a database trigger fired atomically on insert,
or via application code that runs afterward? The trigger buys atomicity within a single transaction
at the cost of logic living outside the application layer.

---

## F6 — Ownership/lifecycle-model fork (business trade-off)

**Detection signal:** it's unclear which entity should own or hold a piece of long-lived state
across a multi-step lifecycle, and getting this wrong has cascading effects on every step that
follows.

**Example:** does a long-running unit of work belong to the top-level container it started under,
to a specific stage within it, or to something created lazily and then reused? The direction chosen
here shapes every subsequent decision about where state lives.

---

## F7 — Unification / collapse fork

**Detection signal:** N existing representations of the same underlying concept have accumulated
(often through incremental additions over time) and now overlap or duplicate each other.

**Example:** three different tables/structures each independently track "what depends on what"
between two kinds of records. Collapsing them into a single, unified graph structure removes the
duplication but requires migrating every consumer of the old representations.

---

## F8 — Rename-vs-drop fork (irreversible, schema)

**Detection signal:** a legacy name or structure maps ambiguously onto a new concept — is the right
move to rename/repurpose it (keep the underlying storage, repoint references) or to genuinely drop
it and replace it with something new? Getting this wrong in a schema/structural ADR is a one-way
door (see `decisions[].reversibility` in `adr-template.md`).

**Example:** an old table `x_outcomes` closely resembles the new concept `x_effects` — is it a
rename (same rows, new name and shape) or a genuine drop-and-recreate? The cleanup audit
(`playbook.md` Phase 6) is where this gets resolved with evidence rather than guessed from memory.

---

## F9 — Generalization fork

**Detection signal:** a narrow, single-purpose mechanism could be broadened to cover a whole family
of similar cases, at the cost of added complexity and a less specialized interface.

**Example:** a tool that can only set one specific field type could be generalized to set any field
type generically. The trade-off is a simpler, more reusable surface against a less specialized, more
defensive implementation.

---

## F10 — Persistence-durability fork (business trade-off)

**Detection signal:** how a result or output should be persisted for replay-safety and audit —
append-only log of every effect vs. a single mutable row holding only the latest state.

**Example:** should every step of a long-running process append an immutable effect record (safe to
replay, but more storage and more to query), or should it overwrite a single "current state" row
(compact, but loses history and isn't replay-safe)? Systems that need audit trails or replay
consistently favor the append-only shape, at a storage and query-complexity cost.

---

## F11 — Research-deferred fork (spawns a child ADR)

**Detection signal:** the decision genuinely cannot be ratified with the evidence on hand — it
requires external research (a market/technology scan, a comparison of established approaches,
domain expertise the current session doesn't have).

**Example:** which of several established storage backends, or which of several external-provider
integration patterns, should be adopted? This fork is resolved by parking the decision as an open
item, running the research in a companion session (`playbook.md` Phase 4), and promoting the result
to its own child ADR rather than blocking or bloating the spine.

---

## F12 — Cross-ADR reconciliation fork (spawns errata / a merge)

**Detection signal:** a new decision touches, narrows, or contradicts something an already-approved
sibling ADR decided.

**Example:** a new ADR introduces a constraint that an existing, approved ADR's design didn't
anticipate. Resolution is either an errata note on the sibling ADR (if it's durable) or, when
several ADRs in the same cluster have drifted into overlapping/conflicting territory, a
`/adr reconcile` that creates one new ADR superseding the cluster (`playbook.md` Phase 5 + Phase 7).

---

## F13 — Deletion-audit fork (irreversible, schema)

**Detection signal:** a structural/schema change requires deciding, alongside what gets created,
exactly what must be dropped — and whether an ambiguous, possibly-still-load-bearing structure is
safe to auto-drop or needs a human architectural review first.

**Example:** a schema rewrite clearly makes several old tables dead, but one ambiguous container
table might still be referenced by something outside the audited surface. The fork resolves by
routing the unambiguous cases straight to the drop manifest and the ambiguous ones to an explicit
"needs architectural review" carve-out (`playbook.md` Phase 6) rather than guessing either way.

---

## How this catalog is used

During Phase 3 (`playbook.md`), when a discrete decision `D<n>` is surfaced, classifying it against
this catalog helps pick the right elicitation method: forks with irreversible/schema/cross-cutting
character (F4, F6, F8, F10, F13) warrant open prose and extra rigor; a clearly closed, low-stakes
fork can use a closed-option question — provided the "Other — I'll write it myself" option stays
visible (the anti-pattern named in `playbook.md` Phase 3). Forks that spawn a child document (F11,
F12) route to Phase 4/5 rather than being resolved inline.
