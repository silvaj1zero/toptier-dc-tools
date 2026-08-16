# UI/UX ADR — Design-First Lifecycle (the `type: ui-ux` playbook)

This is the playbook the SKILL.md orchestrates for `type: ui-ux` ADRs (the visual analogue of
`references/playbook.md`, which governs `type: architecture`). SKILL.md **orchestrates**; this
document is the **source of what to do** in the four design-first pre-phases R/M/A/S that run
**before** the 8-phase formal ADR. Ratified: `ADR-COCKPIT-ADR-LIFECYCLE-SKILL` D10.

## The core inversion

A design decision is validated **by the eye, not the argument.** You cannot decide "modal 3xl vs
5xl", "full-bleed vs centered", "this color vs that color" from prose — the human decides by
**looking**. Therefore the formal ADR is written **last**: the References, Mockup, visual Approval,
and Spike come first and become the ADR's own evidence. Writing a UI/UX ADR from a written
description before the user has SEEN it is the visual-world GAPS-dump anti-pattern (HALT + recover).

## Pre-phase R — Referências / Benchmark (Gate R, BLOCKING)

**Before any design option is drawn.** Gather the state-of-the-art: how do the best-in-class
products solve this exact UI problem?

- Sources: user-provided screenshots; `agent-browser` (headed) on the reference product; prior
  extractions (design tokens, component libraries, research docs); the host's own DS/tokens.
- Reuse before re-benchmarking: check for an existing benchmark/extraction (a research doc, a
  `*-pilot` token set) before capturing fresh.
- **Gate R:** no design option is proposed without ≥1 concrete reference cited (screenshot / URL /
  extraction file:line). A zero-reference design is speculation — the visual analogue of G0's
  "zero-match grep is a finding".

Output: a short benchmark/brief section naming the reference patterns to match (and to reject).

## Pre-phase M — Mockup applying IDS (Gate M)

The DS-owner (the host's design-system agent — bound per `.aiox-core/rules/project-config-bindings.md`;
graceful-dormant when no DS is configured) builds **real candidates in the design system** — actual
components + Storybook stories, not disposable wireframes — applying **IDS REUSE > ADAPT > CREATE**:

- **REUSE** first: does the component/token already exist in the DS? Import it. (Real example from
  the first case: the field/value picker already existed — extend, don't recreate.)
- **ADAPT**: is there a near neighbor? Extend it via the DS's variant mechanism (CVA/tokens).
- **CREATE** only the genuinely new — and even then through the DS's sourcing rule (e.g. 21st.dev →
  adapt to tokens/icons/a11y), never raw.
- Present comparative stories (**Reference ↔ our version**) and **≥2 variants wherever a decision is
  open** (so the human can compare side by side in Approval).
- **Gate M:** the host's mechanical DS gate (tokens-only, DS icons, a11y WCAG AA, anti-AI-look) +
  story-dedup. No UI recreated that already existed. Persist the DS-gate verdict as a durable
  artifact (it is the input to the Spike gate).

## Pre-phase A — Visual approval with the user (Human Gate, visual)

Serve the **live** Storybook (a real URL) and let the user **SEE and decide by looking**. This is a
human gate, but the medium is **visual**, not prose.

- Capture **each** design decision the user makes (e.g. `max-w-3xl` over `5xl`, full-bleed over
  centered) — these are the `visual_approval.decisions[]`.
- **No visual approval → the formal ADR does not open.**
- A design often **forces a model/architecture decision** (e.g. "the field picker only makes sense
  with one concrete entity type → drop the 'all types' concept"). Note these — they are NOT decided
  visually; they are ratified in **Phase 3 of the formal ADR** (with a proper Decision Card). The
  *visual* choice is approved here; its *systemic implication* is ratified there.
- Record `visual_approval = { approved_by, approved_at, decisions[] }` in the progress file.

## Pre-phase S — Spike (Gate S, BLOCKING)

Mechanical proof the approved mockup is **implementable in the DS/stack without inventing**:

- Compiles, builds (the DS's build — ESM/CJS/DTS), DS gate passes (or PASS_WITH_NOTES with the
  notes being CI-only gates like Chromatic/axe-runtime that need a server).
- Produce the explicit list of **data/backend prerequisites** the implementation will need (e.g.
  "the value-picker needs the action to return `options[]` with a color per option"). These become
  stories/ACs in the epic — surfacing them here prevents a mid-implementation surprise.
- **Gate S:** spike green + prerequisites listed. Record `spike_ref` (the DS-gate artifact path).

## → Then the formal ADR (the 8 phases), with three deltas

Run `references/playbook.md`'s 8 phases, but:

1. **Phase 0 (Grounding):** the approved mockup + spike + references **satisfy G0's evidence bar**
   (you still verify the code AS-IS with real `file:line` — the design doesn't excuse you from
   knowing the current implementation). The Context section cites the mockup/spike/refs.
2. **Phase 3 (Decisions):** ratify the **model/architecture decisions the design forced** (the ones
   noted in pre-phase A), each as a proper User-Facing Decision Card. The visual decisions are
   already approved — do not re-litigate them; ratify their systemic consequences.
3. **Phase 7 (Handoff):** the ADR frontmatter carries `type: ui-ux`, `design_refs[]`, `mockup_ref`,
   `visual_approval`, `spike_ref` as first-class fields; hand off to the governance-pipeline as
   usual (the epic's waves promote the DS candidates + wire them + do the backend prerequisites).

## Frontmatter fields (ui-ux)

```yaml
type: ui-ux
design_refs:            # pre-phase R — the benchmark/references
  - "ClickUp automation modal (founder screenshots + clickup-automation-model.md)"
mockup_ref: "origin/design/<branch> — <ds-core candidate paths> + Storybook <group>"
visual_approval:        # pre-phase A
  approved_by: "<founder>"
  approved_at: "<ISO date>"
  decisions: ["modal max-w-3xl", "full-bleed list", "..."]
spike_ref: "outputs/qa/ds-gate-<slug>.yaml"   # pre-phase S — green DS gate
```

These extend the required baseline (`.aiox-core/rules/adr-frontmatter.md`) and the distilled optional
set (`references/adr-template.md` §2.8) — all optional; an `architecture` ADR omits every one of them.

## Mechanical enforcement (Gate A / Gate S — `006.W5.3`)

Pre-phases A and S are not only described here — they are mechanically enforced, grafted onto the
`006.W2.1` sequence-lock: `scripts/uiux-gate-check.js` reads `adr-progress.json`, and for
`type: ui-ux` writes `.aiox/adr/<slug>/gate-A.ack` only when `visual_approval` has the real shape
(`approved_by`/`approved_at`/non-empty `decisions[]`), and `.aiox/adr/<slug>/gate-S.ack` only when
`spike_ref` resolves to a file that actually exists on disk. See SKILL.md's "The ui-ux gate is
MECHANICAL, not described" section for the exact contract, exit codes, and the fixture-based test
path (`data/adr-progress.uiux-*.json`) used when the host has no live DS to exercise against.

## Anti-patterns (HALT + recover)

- **Writing the UI/UX ADR first, deciding in prose** — the visual GAPS-dump. Recover: stop, run
  R/M/A/S, reopen the ADR with the approved mockup.
- **Recreating UI that already exists in the DS** (skipping IDS REUSE) — Gate M rejects it.
- **Opening Phase 0 / ratifying a design decision without `visual_approval` + `spike_ref` on disk**
  — mechanically blocked by `scripts/uiux-gate-check.js` (see "Mechanical enforcement" above), not
  merely a SKILL.md prose condition.
- **Throwaway wireframes instead of real DS candidates** — the mockup must be buildable (it's what
  the Spike proves and the epic promotes).

## First documented case

`sinkra-hub` EPIC-228 (Automation UI/UX redesign) — the exemplar. See
`docs/research/2026-07-adr-type-system/REPORT-ADR-TYPE-SYSTEM-ui-ux.md` §1 and §6 for the full
R→M→A→S→ADR→governance trace.

---

*UI/UX ADR Design-First Lifecycle v1.0 — the `type: ui-ux` playbook — origin: sinkra-hub EPIC-228, canonized in aiox-cockpit (ADR-COCKPIT-ADR-LIFECYCLE-SKILL D10)*
