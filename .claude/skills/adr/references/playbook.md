# ADR Playbook — 8 Phases, Gates G0–G7, Lifecycle Commands

This is the process behind the `/adr` skill: how a real, high-stakes architectural decision gets
elicited, grounded, ratified, and made durable — as opposed to how one gets *written*. It is the
operational knowledge the skill orchestrates; the mechanical enforcement of each gate (sequence-lock
files, weight classifiers, sub-skill invocation) is a separate, later concern — this document
describes **what each gate guarantees**, not how it is wired.

## Master principle (governs every phase)

> **A deep-change ADR is elicited as a lifecycle walk, not a topic list.** Pick a spine (the
> sequence of stages the decision moves through), close one side of it completely before opening
> the other, and let every contract decision pull in the data-model decision it rests on.
> **Deciding what to CREATE is half the work; the other half is deciding what to DELETE.**

An ADR is not assembled from a checklist of sections. It is walked, stage by stage, with evidence
gathered before options are offered, and with the human ratifying one decision at a time — never a
bundle.

---

## Phase 0 — Pre-decision grounding

**Objective:** anchor every decision in the reality of the codebase/schema/data *before* any option
is offered. Reality-first is the mechanical entry gate — no invented context, no assumed state.

**Steps:**
- **Search the reality first.** Grep the artifact under discussion before assuming anything about
  it. A grep returning **zero matches** is itself a finding — it can prove that a contract, a
  field, or a code path simply does not exist yet, which is exactly what opens the ADR.
- **Read the real schema/code.** Read the actual schema files and the real code paths involved —
  never rely on a remembered or assumed shape.
- **Parallel reality-readers.** For a wide surface, spawn read-only sub-agents in parallel to map
  the as-is state (schema, code paths, contradictions with existing ADRs); re-verify every finding
  they report against the real files before trusting it.
- **Count surfaces, don't estimate them.** Reference counts ("N references across M files") are
  *counted*, not guessed. These counts become inputs to the cleanup audit (Phase 6) and to any
  downstream migration story.

**Gate G0 — Reality Gate (BLOCKING).** *Guarantees:* the Context & Problem section is written FROM
this grounding — every AS-IS defect is numbered and carries real evidence (a file:line reference or
a grep count). A problem that does not trace to real evidence does not enter the document.

**Output:** a populated Context & Problem section, optionally anchored to a governing principle the
later decisions will hang off of.

---

## Phase 1 — Frame the spine by lifecycle

**Objective:** frame the whole ADR around a lifecycle or pipeline, not a list of unrelated topics.

**Steps:**
- **Choose the spine.** Identify the lifecycle/pipeline the decision actually lives inside (e.g. an
  event's journey from trigger to persistence, a request's journey from input to output).
- **Walk stage by stage, one side first.** Close one side of the spine (e.g. INPUT) completely
  before opening the opposite side (e.g. OUTPUT).
- **Engineer symmetry deliberately.** When a contract has two mirrored halves, make the symmetry
  explicit — it reduces the decision surface and catches gaps.

**Gate G1 — Spine-Side-Closed Gate.** *Guarantees:* the side chosen first is fully closed before the
opposite side is opened. This becomes the document's own before/after split (e.g. an "INPUT
(closed)" section followed by an "OUTPUT" section).

---

## Phase 2 — Descend into the data model the contract rests on

**Objective:** a contract cannot be specified without first fixing the data model (source of truth)
it depends on. Resolving the early stages of the spine forces the underlying model into view.

**Steps:**
- **Identify the subjacent data model.** Name the layers/entities the contract actually touches.
- **Normalize in an explicit arc of sub-decisions.** Column shape vs. satellite table, junction
  tables for N-valued fields, a single unified graph instead of N overlapping representations,
  dissolving an ambiguous intermediate concept into its neighbors, unifying vocabulary across
  runtime and authoring surfaces.
- **Separate properties from associations, canonically.** A value belongs on the entity as a
  property; a relationship between two entities is a first-class association — never smuggle a
  relationship in as if it were a property value.

**Gate G2 — Data-Model-Coherence Gate.** *Guarantees:* the normalized data model is internally
coherent before the contract is declared on top of it. This becomes the document's Data Model
section (plus an optional DDL/schema sketch).

---

## Phase 3 — Ratify decision-by-decision (D1…DN), in passes

**Objective:** nothing is bundled; the human is the decision-maker on *every single* discrete
decision — and each choice is understood in **plain language with a real user scenario**, not only
as engineering trade-offs.

**Steps:**
- **Surface each choice as a discrete, numbered decision (Dn).** Present a recommendation plus its
  explicit trade-offs — never a fait accompli.
- **Present the User-Facing Decision Card** (NON-NEGOTIABLE) — full contract + gold-standard
  exemplar in `references/decision-elicit-card.md`. Minimum fields every turn: (1) human title
  (“D{n} de {total} — …”), (2) non-technical context (what is at stake in daily use), (3) practical
  example with a real person/request and visible before/after behavior, (4) options or open prose
  in terms of **life outcomes**, (5) wait for an answer before D{n+1}.
- **Ratify individually.** The decision-maker ratifies each `D` on its own; large ADRs commonly
  ratify in multiple passes (pass 1 covers the input+model+cleanup half, pass 2 covers the
  output+downstream half, etc.). Opening line when starting the walk: *“Vamos decidir uma por vez,
  D1 → Dn. Só avanço após sua escolha.”*
- **Draft ≠ ratified.** An ADR file may already be written on disk (proposed/draft). That does **not**
  replace Phase 3. Never ask “aprova o ADR D1–D9 / `aprovar`|`ajustar`|`rejeitar`” as a single gate.
- **Record provenance in the Change Log.** Every pass is logged with who ratified what.
- **Route research-heavy decisions to pointer-decisions.** A decision that genuinely needs external
  research becomes a *pointer decision* to a child ADR rather than blocking the spine (see Phase 4).

**Gate G3 — Ratification Gate (per-decision, BLOCKING).** *Guarantees:* a controversial decision is
NEVER embedded inside an obvious one. Sub-decisions (e.g. `D5.1`) are allowed when genuinely nested,
but each top-level `D` in the body traces 1:1 to one item in the machine-readable `decisions[]`
frontmatter array. *Also guarantees:* every top-level `D` was presented with a User-Facing Decision
Card (or open-prosa equivalent) — a technical bullet list alone is **not** ratification.

> **Elicitation ergonomics anti-pattern (NON-NEGOTIABLE — name it explicitly):** a closed-option
> question UI that shows a rich preview for each option tends to **hide the free-text field**
> behind the visible choices — the person answering sees only the pre-formatted options and doesn't
> realize they can write a genuinely different answer. This has been observed **twice** in real
> elicitation sessions. **Every closed-option question in Phase 3 MUST keep an explicit,
> always-visible "Other — I'll write it myself" option** — never rely on an implicit/automatic
> free-text affordance that a rich preview can visually crowd out. For a genuinely controversial,
> irreversible, or cross-cutting decision, prefer open prose over closed options altogether — let
> the person write the trade-off in their own words rather than picking from a menu.

> **Bulk-ratify / GAPS dump anti-pattern (NON-NEGOTIABLE — founder mandate 2026-07-09):** after
> grounding or drafting, presenting “Decisões D1–D9:” as a compressed technical list and asking the
> human to `aprovar` / `ajustar` / `rejeitar` the whole ADR **is a Phase 3 failure**, even if the
> document is excellent. Correct recovery: stop bulk approval; walk **one card per decision** per
> `decision-elicit-card.md` (gold exemplar: “D1 de 9 — Quem tem a palavra final?” with non-technical
> context + practical publish/review example). Technical one-liners belong in the ADR body and
> frontmatter — **not** as the sole elicit surface.

---

## Phase 4 — Spin off heavy research to a companion session (conditional)

**Objective:** don't block the spine on research, and don't let research inflate the spine.
Conditional branch — fires only when a decision genuinely needs deep research (market scan,
prior-art survey, technology comparison) before it can be ratified.

**Steps:**
- **Mark it as an open decision.** Park the decision as an explicitly tracked open item in the
  document rather than silently deferring it.
- **Emit a companion-session prompt.** Hand off the research to a **separate, disposable session**
  (a companion/research skill) so the main spine session's context stays lean and the research can
  run without polluting it. The spine keeps moving in the meantime — it does not block.
- **Hand back via a ready-signal artifact.** The companion session writes its findings plus a
  machine-readable ready-signal (status, artifact path, timestamp, a time-to-live) so the spine
  session can pick the result back up reliably, without stale or duplicated work.
- **Promote each research report to its own child ADR.** Rather than folding the research inline
  and inflating the spine, promote it to a dedicated child ADR that the spine ADR complements/links
  to (a thin spine + N child ADRs, not one bloated document).

**Gate G4 — Complements-Graph Gate.** *Guarantees:* the spine stays legible and stable, and the
graph of links between the spine ADR and its child ADRs is the load-bearing structure that makes the
whole family machine-traversable (see `adr-template.md`'s `complements[]`/`links[]`).

> Companion-grounded child ADRs should trade speculative rationale for real evidence gathered during
> the research (e.g. a survey of N real prior-art examples), which is exactly what makes them worth
> spinning off in the first place.

---

## Phase 5 — Reconcile N research sources & adversarial/peer review (conditional)

**Objective:** two related jobs share this slot in the walk, both gated before the decisions move
on to cleanup/handoff. First: when N companion research reports come back, a dedicated step
cross-checks *all of them* against each other AND against what the ADR already decided — this is
never naive concatenation. Second — and distinct from simple reconciliation — every ADR (whether or
not it spun off companion research) gets a dedicated **adversarial/peer-review pass**: the ratified-
but-still-open decision set is routed through a council/roundtable/advisory pass *before* it is
treated as final, so at least one voice actively argues against the current framing instead of only
confirming it.

**Steps:**
- **Cross-conflict.** Confront every companion report against the others and against the
  already-ratified decisions, surfacing real contradictions rather than papering over them.
- **Practice orthogonality discovery.** Be willing to invert your own prior framing when the
  evidence demands it — e.g. discovering that two tracks assumed to be dependent are actually
  independent, or that a piece of work assumed to require creation is actually just completion of
  something that already exists.
- **Catch errors from the sources themselves.** Reconciliation is also where a mistaken assumption
  inside one of the incoming reports gets caught and corrected — treat every source as fallible.
- **Route the decision set through an adversarial pass.** Before the ADR is treated as settled, send
  the controversial or high-stakes decisions through a council/roundtable/advisory-style review
  whose job is to argue the *other* side, not to rubber-stamp — a distinct voice from whoever
  authored the recommendation. An optional lightweight sanity-check pass (a single advisory persona)
  can run alongside or instead of a full council for lower-stakes decisions, but it is never the
  human's substitute — the human ratifying in Phase 3 always has the final call.
- **Record the outcome, not just the verdict.** Capture who weighed in (feeds `consulted[]` in
  `adr-template.md`) and what they found — every finding gets a resolution, tracked in the
  document's "Review Findings" section (`adr-template.md` §11) as FIXED / WON'T-FIX / DEFERRED, the
  same way any other reviewed artifact tracks findings to closure, never left dangling.

**Gate G5 — Zero-Contradiction & Adversarial-Review Gate.** *Guarantees:* (a) contradictory
sub-decisions cannot coexist in the final family of documents — intellectual honesty takes priority
over consistency with a prior claim; AND (b) no ADR reaches the cleanup/handoff phases having only
ever been read by the person who wrote it — at least one adversarial pass has weighed in on the
controversial decisions, with its findings tracked to a recorded resolution.

---

## Phase 6 — Deprecation & cleanup audit (the DELETE half)

**Objective:** audit, with the same rigor as creation, what needs to be **deleted**. This is the
central "create+delete" principle: an architectural change is only half-specified if it only
describes what gets built — the leftover, deprecated pieces (dead tables, dead functions, dead code
paths) are exactly what silently accumulates otherwise.

**Steps:**
- **Write a per-object DROP/RENAME manifest.** Per object type (tables, columns, enums, functions,
  triggers, access-control rules, grants, live code) — each entry carries a measured surface count
  (from grep, not memory).
- **Carve out "do not hand-edit."** Generated artifacts (regenerated after a schema change) and
  append-only artifacts (migration files — cleanup there means a *new* migration that drops, never
  editing an old one) are called out explicitly so nobody hand-edits them.
- **Carve out "needs architectural review, not auto-drop."** Ambiguous containers that might still
  be load-bearing get routed to human review at the implementation-story stage rather than being
  auto-dropped.
- **Run an exhaustive, line-by-line sweep.** Produce a dated sweep manifest with a `file:line`
  reference per dead object, plus the correct drop order (access rules → triggers → indexes →
  foreign keys → constraints/enums → the object itself).

**The sweep is a safety net, not a formality.** A mechanical, line-by-line sweep routinely finds
things a memory-based enumeration misses entirely — e.g. an entire dead table family that a
first-pass "create-side" write-up omitted. **Empirical lesson: the mechanical audit finds what
human enumeration-from-memory omits.**

**Gate G6 — Delete-Contract Gate (BLOCKING for schema/structural ADRs).** *Guarantees:* deletion is
a tracked, evidenced, reviewable contract — never an afterthought of memory. This is the structural
counterweight that keeps a large architectural rewrite from silently accumulating drift.

---

## Phase 7 — Errata, reconciliation with sibling ADRs, and handoff

**Objective:** new decisions that touch already-approved sibling ADRs get an errata note and a
bidirectional link; the ADR family closes with a handoff to governance.

**Steps:**
- **Errata sibling ADRs.** A new decision that touches an existing, approved ADR gets an errata
  entry reconciling the two; the `complements`/link relationship is wired in both directions.
- **Defer when the target isn't durable yet.** If the ADR being touched hasn't landed in the
  canonical location yet, defer the errata rather than referencing something that might still
  change.
- **Practice durability discipline.** Every decision has to land in the single canonical location
  (never left only in a scratch/working copy) — verify where it actually lives before trusting it,
  and route the actual commit through whichever role owns repository writes in the host project
  (never assume the authoring session itself is authorized to push).
- **Emit a clean-session handoff.** Close with a handoff prompt that turns the ratified ADR family
  into a governed development plan (epic + stories) in a fresh, clean-context session.

**Gate G7 — Durability + Handoff Gate (BLOCKING).** *Guarantees:* the ADR is durable in its
canonical location AND a handoff has been emitted before the ADR is treated as actionable. A
frontmatter/schema validator (where one exists in the host project) checks the resulting frontmatter
and supersession graph.

---

## Summary table — 8 phases × gates × output

| Phase | Name | Gate | What lands in the document | Conditional? |
|---|---|---|---|---|
| 0 | Pre-decision grounding | G0 Reality (BLOCKING) | Context & Problem (evidence-backed) | No |
| 1 | Frame the spine | G1 Side-closed | The chosen spine, one side closed | No |
| 2 | Descend into the data model | G2 Model-coherent | Data Model section (+ optional DDL sketch) | No |
| 3 | Ratify decision-by-decision | G3 Per-decision (BLOCKING) | Decisions D1..DN + Change Log | No |
| 4 | Companion research | G4 Complements-graph | Open-decision items + child ADRs | Yes — only if research is needed |
| 5 | Reconcile N sources & adversarial review | G5 Zero-contradiction + adversarial-review | Corrections + orthogonality notes + Review Findings | Reconciliation: only if N>1 sources returned. Adversarial pass: always, before cleanup/handoff |
| 6 | Deprecation & cleanup audit | G6 Delete-contract | Cleanup section + dated sweep manifest | Structural/schema ADRs only |
| 7 | Errata + handoff | G7 Durability + handoff (BLOCKING) | Errata + links + governance handoff | No |

---

## The 4 lifecycle commands

The `/adr` skill exposes the full lifecycle, not just creation — "create" is only one of the verbs.

| Command | What it does | Phases it runs |
|---|---|---|
| `/adr <topic>` | Create a brand-new ADR from a topic/problem statement. | The full walk, Phases 0→7, in order. |
| `/adr revise <path>` | Re-enter an *existing* ADR to add or adjust decisions (a new pass on the same document, not a new document). | Phase 0 (delta grounding — re-check what changed in reality since the last pass) → Phase 3 (ratify the new/changed decisions) → Phase 7 (append a Change Log entry, re-run the durability/handoff gate). Phases 1/2/4/5/6 are re-entered only if the revision genuinely reopens the spine or the data model. |
| `/adr reconcile <cluster>` | Merge a cluster of related or conflicting ADRs into one. **Never edits in place** — creates a brand-new ADR that supersedes the N old ones. | Primarily Phase 5 (reconcile N sources — here the "sources" are the ADRs in the cluster) → Phase 7 (handoff, with the supersession graph wired). |
| `/adr audit <path>` | Ongoing audit mode over an already-approved ADR (or a whole directory of them): checks enforcement coverage, staleness, and drop candidates. | Primarily Phase 6 (deprecation/cleanup audit, generalized as a recurring practice, not just a one-time pass) plus the enforcement-coverage and review-cadence practices below. |

---

## Practices carried into the playbook as process rules

These are rules of **process**, not mechanism — the mechanical implementation of each (a CI check, a
hook, a generator script) is a separate concern from documenting the rule here.

1. **Enforcement-coverage invariant.** Every ADR whose status is `APPROVED`/`ACCEPTED` must have,
   for each decision, either a non-empty enforcement list OR an explicit statement of how it is
   confirmed by other means (e.g. manual review). A silently empty enforcement list on an approved,
   binding decision is not acceptable — either it is mechanically enforced, or the document says
   explicitly how a human confirms it.
2. **Atomic supersede/reconcile.** Merging a cluster of ADRs is, in principle, a single atomic
   operation: create the new ADR that supersedes the N old ones, flip their status and
   superseded-by pointer, and never hand-edit an old ADR in place. (This playbook documents the
   principle as a **textual preview** of the operation — the mechanical, atomic implementation of
   `reconcile` is separate, later work.)
3. **Index/graph generator (desirable future capability, not built here).** An ADR family with
   supersession and typed links already has a latent graph. A generator that produces a
   human-readable index and a visual graph from that latent structure (which ADR supersedes which,
   which complements which, which paths each governs) is a desirable capability — this playbook
   only names it as a target for a future story; it is out of this document's appetite to build the
   generator itself.
4. **PR guard via governed-paths.** An ADR that declares which paths it governs enables a
   lightweight mechanism (e.g. a CI check or a bot comment) that, when a change touches one of those
   paths, surfaces the relevant ADR on the pull request — closing the loop between "the decision is
   written down" and "the code that decision governs is being changed." The mechanism itself is
   later work; the governed-paths field is what makes it possible.
5. **Explicit review cadence in `audit` mode.** Auditing an ADR family is not a one-off act — it
   recurs on a cadence, looking for ADRs that have gone stale, ADRs with no enforcement coverage,
   and clusters of related ADRs that are candidates for a `reconcile`.
6. **ADR debt becomes an explicit backlog item at handoff.** When the code has drifted from an
   `APPROVED` ADR and full compliance isn't achievable immediately, the handoff should surface that
   drift as an explicit, trackable debt item rather than letting it remain invisible.
7. **LLM-generation anti-patterns (watch for these when a language model drafts or edits an ADR):**
   - **Verbosity without rationale density** — an ungrounded generation tends to produce inflated,
     padded prose instead of the concise, rationale-heavy style of a real architectural document.
   - **Inventing a link or a piece of evidence** where a real reference should exist — a generation
     under pressure to be self-contained will fabricate a citation or a code reference rather than
     admit the evidence isn't available. The real link or evidence always outranks an invented
     paraphrase.
   - **Ignoring chronological order** — generating decisions out of the order they were actually
     made loses the causal relationships between them (why decision 3 depended on decision 1 being
     settled first). This is exactly why the cleanup audit and the Change Log are chronological.
   - **One-shot generation without elicitation or adversarial review** — generating an entire ADR in
     a single pass, without decision-by-decision ratification (Phase 3) or an adversarial/peer
     review pass (a council, a roundtable, an advisory pass before the human gate), produces a
     document nobody actually decided on. Elicitation-plus-review, not one-shot generation, is the
     reliable path.
   - **Bulk “aprova D1–Dn” after a technical dump** — same failure mode as one-shot, even when the
     draft was grounded: the human never lived each trade-off in user terms. Use the User-Facing
     Decision Card (`decision-elicit-card.md`) instead.

---

## Provenance

This playbook is an adapted, domain-agnostic derivation of a longer internal case-study document
that recorded a real, multi-day ADR elicitation session and distilled it into this 8-phase process,
the 8 gates, and a template drawn from 73 real architectural decision records. It has been
generalized here to remove every project-specific naming convention, domain vocabulary, and
tool-specific reference from the source material — the process and the gates are the durable part;
the specific project it was first observed in is not.
