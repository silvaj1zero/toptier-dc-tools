---
name: adr
description: Orchestrate the full ADR lifecycle on the MAIN session with the @architect persona adopted — grounding with real evidence before any option (G0), decision-by-decision elicitation (D3 adaptive: open prose for controversial/non-collapsible decisions, a closed question with an always-visible "Other" for small ones; each D{n} as a non-technical User-Facing Decision Card with a real user example — never bulk "aprova D1–Dn"), automatic companion-research triggers (Phase 4, 5-signal dirty-work classifier) and automatic adversarial review (Phase 5, /roundtable or /advisory-council + optional /pedro-advisor sanity-check), a deprecation/cleanup audit, and a governance handoff. The 8-phase "jeito Pedro" walk (ADR-COCKPIT-ADR-LIFECYCLE-SKILL). Resumable via adr-progress.json.
version: "1.7.0"
owner_squad: master
sinkra_tier: "Tier1"
context: conversation
agent: architect
user-invocable: true
argument-hint: "[<topic> | revise <path> | reconcile <cluster> | audit <path>]"
depends_on: ["/companion", "/roundtable", "/advisory-council", "/pedro-advisor"]
status: active
allowed-tools: Read, Edit, Write, Grep, Bash, AskUserQuestion, Agent, Skill
---

# /adr — ADR Lifecycle (8 Phases, "jeito Pedro")

**You are the MAIN session with the @architect persona adopted.** Read `.aiox-core/agents/architect.md`
now and hold that persona for the rest of this run (holistic system thinking, evidence over assumption,
security at every layer). The orchestration machinery lives entirely in THIS skill (D2,
`ADR-COCKPIT-ADR-LIFECYCLE-SKILL`) — `architect.md` itself stays a lean EXECUTOR persona
(`.aiox-core/rules/agent-formats.md` AF2, not edited by this skill). You are not becoming a "chief"; you
are running a multi-phase orchestration skill while wearing the architect's judgment throughout.

**Read before doing anything else** — `references/playbook.md` in full (the 8-phase process, gates
G0-G7, the elicitation anti-pattern, the LLM-generation anti-patterns), `references/decision-elicit-card.md`
(**Phase 3 presentation contract** — non-technical User-Facing Decision Card + gold-standard exemplar;
NON-NEGOTIABLE), `references/adr-template.md` (the frontmatter/body contract Phase 7 writes to),
`references/decision-forks.md` (the fork catalog Phase 3 classifies decisions against), and
`data/adr-progress-schema.json` (the resumable-state contract). This SKILL.md **orchestrates**; it never
restates the playbook's content — where a phase below says "per `playbook.md` Phase N", that document is
the actual source of what to do; this file only adds the mechanics playbook.md deliberately leaves
unspecified (progress bookkeeping, subagent rules, which skill to invoke, exact elicitation UI).

## Invocation & command parsing

`/adr {topic}` (create, default) · `/adr revise {adr-path}` · `/adr reconcile {cluster}` · `/adr audit
{adr-path}`. Parse `$ARGUMENTS[0]`: exactly `revise`/`reconcile`/`audit` → that mode, `$ARGUMENTS[1..]` is
the target. Anything else (including nothing) → `create` mode, the whole argument string is the topic.
**All 4 modes are fully implemented (`006.W3.1`)** — see "`revise` / `reconcile` / `audit`" below for
each mode's real behavior, including the two mechanical scripts (`scripts/reconcile.js`,
`scripts/audit.js`) that `reconcile` and `audit` invoke for the parts of their job that must be
mechanically atomic/reproducible rather than agent-narrated.

## ADR Types (type-aware routing — D10)

An ADR has a **type** that governs its lifecycle (ratified: `ADR-COCKPIT-ADR-LIFECYCLE-SKILL` D10).
Default `architecture` (everything below runs as written). The type is a routing axis of Phase-0
Recognition — **orthogonal** to the D8 elicitation-weight 2-axis classifier (`006.W2.2`, consequence ×
uncertainty): that classifier decides how HEAVILY a decision inside an already-open ADR gets elicited;
this one decides WHICH lifecycle the ADR runs at all (architecture vs ui-ux). Never conflate the two —
a `type: ui-ux` ADR still runs the D8 weight classifier on its own Phase 3 decisions once open, and a
`type: architecture` ADR can still have a non-collapsible/controversial decision inside it.

| `type` | When | Lifecycle |
|--------|------|-----------|
| `architecture` (default) | Structure, contract, technical trade-off — decidable **on paper** from code/constraints | The 8 phases below, unchanged. Evidence = `file:line` (G0). |
| `ui-ux` | How something **looks and behaves** — **cannot be decided without SEEING it** | **4 design-first pre-phases R/M/A/S run BEFORE Phase 0** (per `references/ui-ux-lifecycle.md`), then the 8 phases with the approved mockup+spike AS the Phase-0 evidence. |

`/adr {topic} --type ui-ux` selects it explicitly, and **explicit always wins** — when `--type` is
present the classifier below does not run (recognition is already resolved; there is nothing to
suggest). Set `type` in `adr-progress.json` (the schema's optional `type` field) and in the ADR
frontmatter (`references/adr-template.md` §2.8, `.aiox-core/rules/adr-frontmatter.md`) — the default
`architecture` is written explicitly too, never left as silent absence, so `adr-progress.json` always
carries the routing decision that was actually made.

### Automatic type classifier (conservative — suggest, never force)

When `--type` is **absent**, run this classifier on the topic BEFORE Phase 0 (it is part of Phase-0
Recognition, `006.W1.3`) to decide whether to suggest `ui-ux`. It **replaces manual recognition** for
the common case; the philosophy is the same the D10 text always described — **default architecture,
`ui-ux` only on a clear signal, and a suggestion never auto-routes**.

**Signals that suggest `ui-ux`** (any one is enough to trigger the suggestion — heuristic, not a closed
list; calibrate conservatively, prefer a false-negative over a false-positive):
- The decision is about **visual appearance or interaction behavior**: layout, modal, color, spacing,
  a specific component's look, a screen, a user-facing interaction flow (e.g. "redesign the X modal",
  "how should the Y screen look/behave").
- The **evidence offered is visual**: the topic references screenshots, a Storybook link, or a mockup
  as the primary input.
- The topic **explicitly names design vocabulary**: "design", "DS"/"design system", "mockup",
  "Storybook", "wireframe".

**What does NOT trigger it (stays `architecture`):** a topic that merely *mentions* a UI-adjacent noun
("painel", "tela", "dashboard") while the actual decision is structural/data/contract — e.g.
"redesenhar o modelo de dados do painel" is about a **data model**, not about how the panel looks; the
word "painel" is not itself a signal. Read for what is actually being decided, not for keyword
presence — a keyword-only match is exactly the kind of false-positive this classifier must avoid,
because it would route an architecture ADR into the 4 heavy R/M/A/S pre-phases for nothing.

**Suggest + confirm, never force:** on a signal, `AskUserQuestion` before Phase 0 opens — reuse the
same ergonomic pattern as the D3 small/obvious-fork closed question (epic D3/AC6): a short non-technical
framing ("isto parece uma decisão de UI/UX — como algo parece ou se comporta. Sugiro o lifecycle
design-first, que roda Referências → Mockup → Aprovação visual → Spike antes do ADR formal. Confirma?"),
2-3 closed options (Sim, seguir ui-ux · Não, seguir architecture), and **"Outro — escrevo livre" always
last and visible**. No confirmation (declined, or "Outro" used to say otherwise) → the ADR proceeds as
`architecture` — the classifier never silently routes ui-ux without an explicit yes. Absent any signal
at all, do not even ask — proceed as `architecture` with no interruption, exactly as today.

**Telemetry (`006.W5.4`) — emit `adr_type_routed` at the exact moment `type` is settled,** per
`.claude/rules/orchestration-telemetry.md` (referenced here, never copied — same discipline as the
`006.W3.3` emit point in Phase 3 below). Exactly one event per ADR, at the earliest of these three
mutually-exclusive moments (Phase-0 Recognition, before the resume check):
- **`--type` was passed explicitly** → emit immediately with `routed_by: "explicit-flag"`, `type` =
  whatever was passed. The classifier never runs in this case (it is short-circuited — "explicit always
  wins" above), so there is nothing to suggest and **no `human_decision{}` accompanies this event** (no
  gate humano — a escolha já veio pronta na invocação).
- **The classifier fired a signal and the human answered the `AskUserQuestion` above** → emit with
  `routed_by: "human-confirmed"`, `type` = what the human actually chose (`ui-ux` if confirmed,
  `architecture` if declined/"Outro" — both are a real human gate, both emit). Accompany it with the
  `human_decision{}` block carrying the `type: {proposed: "ui-ux", chosen: "<what the human picked>"}`
  dimension (per `orchestration-telemetry.md` "Dimensão `type` no `human_decision{}`") — `decided_by`/
  `gate_type: "soft"` (this gate is a suggestion-confirm, not one of the D8 T3 categories)/
  `rationale_ref`/`resolved_at` follow the same shape the `006.W3.3` block already defines.
- **No signal fired at all (no question asked)** → emit with `routed_by: "auto"`, `type: "architecture"`
  — the silent default, now made visible in telemetry even though it interrupts nothing (mirrors "the
  default `architecture` is written explicitly too, never left as silent absence" two paragraphs above).
  No `human_decision{}` (no gate humano occurred).
- `adr_id`/slug + `timestamp` are the same identifiers every other `/adr` telemetry event already uses.
  This skill emits inline (no learning-log file it maintains today), same as `adr_decision_recorded`/
  `adr_superseded` below — record it in the session's own output/notes as evidence when asked.

**`ui-ux` — the non-negotiable inversion:** a design decision is validated **by the eye, not the
argument**. So the formal ADR is written **last**, not first. Before Phase 0, run the four
design-first pre-phases (full playbook: `references/ui-ux-lifecycle.md`):

1. **R — Referências/Benchmark** (BLOCKING, before any option is drawn): gather how best-in-class
   products solve this (screenshots, `agent-browser` on the reference product, prior extractions) +
   existing DS/tokens. Gate R: ≥1 concrete reference cited before any design option — the visual
   analogue of G0.
2. **M — Mockup applying IDS** (the core): the DS-owner builds **real candidates** in the design
   system (components + Storybook, not throwaway wireframes) applying **IDS REUSE>ADAPT>CREATE** —
   never recreate UI that already exists. Comparative stories (Reference ↔ our version) + ≥2 variants
   where a decision is open. Gate M: mechanical DS gate (tokens, a11y, anti-AI-look) + story-dedup.
3. **A — Visual approval** (Human Gate, visual): serve the live Storybook; the user **SEES it and
   decides by looking**. Capture each design decision. No visual approval → the formal ADR does not
   open. Model/architecture decisions the design *forces* are noted for Phase 3 of the formal ADR.
4. **S — Spike** (BLOCKING): mechanical proof the approved mockup is buildable in the DS/stack
   without inventing (compiles/builds/DS gate passes) + the explicit list of data/backend
   prerequisites the implementation will need (these become stories in the epic).

Only after R+M+A+S do the 8 phases run — and **Phase 0's grounding is satisfied by the approved
mockup + spike + references** (still verify the code AS-IS), **Phase 3 ratifies the model/arch
decisions the design forced** (the *visual* decision was already approved in A), **Phase 7** attaches
the mockup+spike+DS-gate as first-class references and hands off to governance as usual.

**First documented case (exemplar):** `sinkra-hub` EPIC-228 — Automation UI/UX redesign. References =
ClickUp (screenshots + `clickup-automation-model.md` + `clickup-pilot` tokens); Mockup =
`origin/design/automation-ux-fase0` ds-core candidates + Storybook `Automation/Fase 0`; Approval =
founder 2026-07-22 (modal `max-w-3xl`, full-bleed, tipo-primeiro-único, 1 tom); Spike =
`outputs/qa/ds-gate-automation-ux-f0.yaml` (`PASS_WITH_NOTES`); formal ADR =
`ADR-AUTOMATION-ENTITY-TYPE-REQUIRED-SCOPE-SIMPLIFICATION` → EPIC-228 (PR #1471 merged). Full
write-up: `docs/research/2026-07-adr-type-system/REPORT-ADR-TYPE-SYSTEM-ui-ux.md` §1 and §6.

### The ui-ux gate is MECHANICAL, not described (`006.W5.3`)

D10.d's HALT condition ("a `type: ui-ux` ADR does not open Phase 0 nor ratify a design decision
without `visual_approval` + `spike_ref` on disk") used to live only as prose in "Blocking
conditions" below — a **described-gate**, exactly the category Wave W2 proved insufficient (the
Consultive Mandate collapses as prose; 1 `AskUserQuestion` in 458 events in the audit session).
`006.W5.3` mechanizes it, **grafted onto `006.W2.1`'s sequence-lock** (never a parallel
mechanism) — `scripts/uiux-gate-check.js`:

- **Reads `adr-progress.json`** (the same file every phase already reads/writes) and checks
  `type`. **`type` absent or `"architecture"` → total no-op** — zero checks, zero ack files, exit
  0 (AC3: architecture ADRs, the default, are totally unaffected by this gate; verifiable by
  running the script against `data/adr-progress.architecture-control.json`).
- **`type: "ui-ux"` → validates two independent gates**, each its own ack, in the exact
  `{"phase", "status", "ts", "evidence_ref"}` shape `006.W2.1` established for `gate-<N>.ack`
  (the only delta: `phase` is the pre-phase **letter** `"A"`/`"S"` instead of an integer 0-7,
  since R/M/A/S run *before* the numeric phase 0 and are not part of the schema's `phase.current`
  range):
  - **Gate A (visual approval)** — `visual_approval` must have the real shape: non-empty
    `approved_by`, a real string `approved_at`, and `decisions[]` with **≥1 non-empty (non-whitespace)
    decision** — a blank/whitespace `decisions: [""]`/`["   "]` does NOT count (content-checked, not
    just length-checked; `006.W5.3` review finding). An absent field, an empty `visual_approval: {}`,
    or an all-blank `decisions[]` BLOCKS (exit 1, no ack written) — the exact throwaway/invented
    anti-pattern D10.d exists to catch (AC4).
  - **Gate S (spike)** — `spike_ref` must resolve to a file that **exists on disk** (repo-root-
    relative, falling back to slug-dir-relative). A string pointing nowhere BLOCKS (exit 1, no
    ack written) — an invented-looking path never passes (AC4). **Known scope limitation (disclosed,
    `006.W5.3` review):** Gate S is an EXISTENCE check only — it does not validate the spike file's
    *content/shape* (a real-but-irrelevant existing file would pass). This is an accepted residual
    (an agnostic gate cannot know every host's DS-gate artifact format), analogous to G0's disclosed
    textual-grounding limitation — mitigated by the design-lens `/review`, not eliminated.
  - The two gates are independent: Gate A can pass while Gate S blocks (or vice versa) — each
    writes its own `.aiox/adr/<slug>/gate-A.ack` / `gate-S.ack` only when ITS OWN condition holds
    (AC2 — "pre-phase A only writes its ack when `visual_approval` is recorded; pre-phase S only
    when `spike_ref` points to an existing artifact").
- **Run it** before opening Phase 0 and before ratifying any Phase-3 design decision on a
  `type: ui-ux` ADR: `node .aiox-core/skills/adr/scripts/uiux-gate-check.js
  .aiox/adr/<slug>/adr-progress.json`. Exit 0 (both `gate-A.ack`/`gate-S.ack` written) → proceed
  exactly like reading any other `gate-<N>.ack` per the sequence-lock section above. **Exit 1 →
  HALT** — surface the printed BLOCKED reason(s) verbatim, do not improvise around it, do not
  proceed into Phase 0 or ratify the design decision.
- **AC5 — graceful dormant when the host has no design system.** This script itself never
  resolves a design-system binding (that is `.aiox-core/rules/project-config-bindings.md`'s
  `design_system.root`, per-project and outside this agnostic skill's own scope) — before even
  reaching this script for a fresh `type: ui-ux` ADR, check the host's binding: absent
  (`aiox.config.json` has no `design_system.root` and no default `ds-core/` exists) → inform *"o
  lifecycle ui-ux requer um design system configurado (a pré-fase M constrói candidatos nele) —
  nenhum configurado neste projeto"* and stop **gracefully** (dormant, not an error) — never
  invent a DS, never fake the gate by writing an ack anyway. The mechanical gate above is
  agnostic/reusable by any host **with** a DS (e.g. `sinkra-hub`'s EPIC-228); a host without one
  simply never reaches Gate A/S in practice because Phase M (mockup) has nothing to build in.
- **Testable under dormancy (VC-2)** — since this repo (`aiox-cockpit`) has no web design system,
  the gate is exercised via **fixtures**, not a served Storybook: `data/adr-progress.uiux-*.json`
  (blocked-missing-approval / blocked-placeholder-approval / blocked-missing-spike-file / passed)
  plus `data/adr-progress.architecture-control.json` (the AC3 control). Copy a fixture to a
  scratch `.aiox/adr/<test-slug>/adr-progress.json`-shaped path and run the script against it —
  no live DS/Storybook required.

## Progress bookkeeping + sequence-lock (every phase, same pattern) — `006.W2.1`

`.aiox/adr/<slug>/adr-progress.json` (`<slug>` = the topic slugified, or `adr_id` from the target for
revise/reconcile/audit) is the single machine-readable index — per `data/adr-progress-schema.json`.
Entering a phase: set `phase.current`/`phase.name`/`phase.entry_rule`. Closing a phase: `gate_status:
"passed"`, `phase.transition_to` = the next phase's name (`null` on Phase 7), `revision += 1`,
`updated_at` = now; append the section/artifact path just produced to `outputs.partial[]` (a pointer,
never inline prose — the schema's own principle). A phase genuinely not applicable to this ADR (e.g. no
data-model surface) still closes explicitly — `gate_status: "passed"` with `entry_rule` noting why it
was skipped — never silently omitted. `reconcile_policy` is always `"disk-wins"` (fixed by the schema);
if a decision is reopened after being ratified, record it in `decision_forks[]` (`superseded_choice`/
`new_choice`/`forked_at_revision`) instead of silently overwriting `decision.decided[]`.

**Sequence-lock on disk (NON-NEGOTIABLE — mechanically enforced, not "described").** Closing a phase is
ONE atomic operation with two writes, always in this order, both or neither:
1. Write `.aiox/adr/<slug>/gate-<N>.ack` — a small JSON file, minimum shape `{"phase": <N>, "status":
   "passed", "ts": "<ISO8601>", "evidence_ref": "<string|null>"}` (`evidence_ref` points at the artifact
   that grounds the close — e.g. the Context & Problem section path for gate-0, `null` when a phase has
   no single artifact of its own).
2. In the SAME update, set `adr-progress.json`'s `phase.gate.ack_ref` to that same relative path
   (`.aiox/adr/<slug>/gate-<N>.ack`) and `phase.gate_status: "passed"`.

These are never two independent facts — `gate.ack_ref` in the JSON and the `.ack` file on disk describe
the same close. If you ever find yourself about to set `gate_status: "passed"` without also having just
written the `.ack` file (or vice versa), that is exactly the blocking condition named at the bottom of
this document ("a gate about to be marked `passed` with no real evidence... behind it") — stop.

**Before starting ANY work for Phase N+1, read `.aiox/adr/<slug>/gate-<N>.ack` from disk.** This is a
structural precondition, not a courtesy check you might forget under pressure — treat it exactly like the
Phase-0 resume check above (read-the-file-first, not read-if-you-remember-to):
- **File present and parses** with `status: "passed"` and `phase == N` → proceed into Phase N+1.
- **File absent, unreadable, or `status` ≠ `"passed"`** → **HALT** before doing any Phase N+1 work.
  Surface it plainly: *"Fase <N+1> bloqueada — `gate-<N>.ack` ausente/inválido em `.aiox/adr/<slug>/`.
  A fase <N> precisa fechar (gate real gravado) antes de eu prosseguir."* Do not improvise around it, do
  not "just this once" trust `adr-progress.json`'s `gate_status` alone — the JSON is the hint, the `.ack`
  file on disk is the truth (same `reconcile_policy: "disk-wins"` principle the schema already states for
  Phase-0 resume; this is that same principle applied at every single phase boundary, not only at resume
  time). A skipped/not-applicable phase (see the "phase genuinely not applicable" rule above) still
  writes its `.ack` — `status: "passed"` with `evidence_ref: null` — so N+1 finds it exactly like any
  other closed phase; "skipped" is never a reason to omit the ack file.
- This is what makes the skeleton described in earlier versions of this document mechanically true now:
  the sequence-lock is a file on disk that the next phase's own entry procedure reads, not a promise this
  document makes in prose. See "Blocking conditions" at the bottom for the adjacent gates this composes
  with (G0 grounding, the bulk-ratify guard, the ui-ux mockup gate) — all read the same way: check disk
  before acting, HALT rather than assume.

## Phase-0 — Recognition & Resume

**Order:** the type classifier ("ADR Types" above) runs FIRST, before the resume check below — it
decides `type` (architecture vs ui-ux), which in turn decides whether the 4 ui-ux pre-phases R/M/A/S
precede everything else. Only once `type` is settled does the resume check run.

Before entering Phase 0 — Grounding: check whether `.aiox/adr/<slug>/adr-progress.json` exists.
- **Absent** → fresh start. Initialize it (schema fields: `schema_version: "adr-progress-v1"`,
  `revision: 0`, `adr_id`, `target_ref` = best-guess `docs/architecture/ADR-<SLUG>.md`, `type` = the
  value the classifier (or `--type`) just settled — `"architecture"` written explicitly even on the
  default, never omitted, `phase: {current:
  0, name: "grounding", entry_rule: "invocation", transition_to: "spine", gate_status: "pending", gate:
  {ack_ref: null}}`, `active_mode: "consultive"`, `reconcile_policy: "disk-wins"`). Proceed to Phase 0.
- **Present** → read it, then **reconcile disk-wins**: if `phase.gate.ack_ref` is set and that file
  exists on disk, the phase is `passed` regardless of what `gate_status` says; if `gate_status` claims
  `passed` but the ack file is absent/null, treat it as `in_progress` — disk is truth, the JSON is a
  hint. Then `AskUserQuestion` with the reconciled state (phase name + decision progress, if any)
  summarized, four options, **"Outro — escrevo livre" always last and visible**: (a) Retomar de onde
  parei (continue at `phase.current`); (b) Re-rodar do zero (archive the old file with a timestamp
  suffix, start fresh); (c) Inspecionar (show progress + partial outputs, execute nothing); (d) Outro —
  escrevo livre. A `lock` present and unexpired from a different `owner_session` is a **soft warning**
  mentioned alongside the question, never a hard block (no real lock/owner_session runtime in this
  version — the field is modeled, not enforced).

This is the minimal Phase-0 Recognition (`006.W1.3` AC4) — no real lock runtime. The 2-axis
consequence/uncertainty classifier (`006.W2.2`) lives in Phase 3 ("D3 — adaptive elicitation, 2-axis
classifier" below), where discrete decisions are actually enumerated and classified — Phase 0 itself
still has no per-decision classifier to run (there are no `D<n>`s yet at this point in the walk).

## The 8 phases

| # | Name (progress `phase.name`) | Gate | Conditional? |
|---|---|---|---|
| 0 | `grounding` | G0 Reality (BLOCKING) | No |
| 1 | `spine` | G1 Side-closed | No |
| 2 | `data-model` | G2 Model-coherent | Skippable — no data-model surface |
| 3 | `decisions` | G3 Per-decision (BLOCKING) | No |
| 4 | `companion-research` | G4 Complements-graph | Yes — only if research is needed |
| 5 | `adversarial-review` | G5 Zero-contradiction + adversarial | Reconciliation conditional; adversarial pass always |
| 6 | `cleanup-audit` | G6 Delete-contract (BLOCKING for schema ADRs) | Structural/schema ADRs only |
| 7 | `handoff` | G7 Durability + handoff (BLOCKING) | No |

### Phase 0 — Grounding (G0, BLOCKING)

Per `playbook.md` Phase 0 — grep/read the reality first; a zero-match grep is itself a finding. For a
wide surface, spawn read-only subagents in parallel (one message, multiple `Agent` tool calls,
`general-purpose`/`Explore`) to map the as-is state; **you re-verify every finding against the real files
yourself** before trusting it — a subagent's report is never taken on faith.

**Canal humano único (NON-NEGOTIABLE, D6-e — `006.W2.1`).** Every Phase-0 subagent/parallel reader
reports back to YOU (the MAIN session, `@architect`-persona) **only** via its `Agent()` tool return value
or plain text in that return — **never** via `AskUserQuestion` or any other direct elicitation of the
human. You are the sole channel that ever asks the human anything, in this skill, always. A subagent that
surfaces something a human should decide (an ambiguity, a genuine fork it found while mapping) writes
that observation into its return text and stops — it does not ask, it does not wait for an answer, it
does not have the tool available to do so in its own turn. You read its return, decide whether it belongs
in Phase 0's evidence or should become a Phase 3 decision, and if a human call is needed, YOU make it.
This is the same contract Phase 6's cleanup-sweep subagents follow (see below) — stated once here,
referenced there, never duplicated wording that could drift out of sync. Treat any subagent report that
reads like it is trying to address the human directly ("would you like me to...", a question mark aimed
at the reader) as a signal to re-ground it yourself before using it — it is evidence to verify, not a
question to relay verbatim.

**Gate G0 — grounding-before-options, checklist-gated (`006.W2.1`, VC-1 mechanism decision).** No option
or alternative reaches the human — not in a closed elicitation, not in prose — until `gate-0.ack` is
writable, and `gate-0.ack` is writable **only after** you have filled this checklist explicitly, one row
per AS-IS pain that will appear in the Context & Problem section:

| # | AS-IS pain (one line) | Evidence (`file:line` or `grep -n "<pattern>" <path>` + match count) | Verified by you? |
|---|---|---|---|
| 1 | … | … | yes/no |

- **Every row's Evidence column must be real** — a path that exists, a line number you actually read, or
  a grep command plus the count it actually returned (a **zero-match** grep is a valid, real finding —
  "this does not exist yet" — record it as such, not as an empty row). A row with no evidence, a
  paraphrased "the code does X" with no locator, or an invented-looking reference is an incomplete
  checklist — `gate-0.ack` does not get written until every row is closed.
- **This is a checklist, not a script** (VC-1 decision, documented here as the story requires): the
  mechanism is an explicit table the Phase-0 body must produce and fill before the phase can close — not
  a programmatic regex/pattern scan over the output. Rationale: `/adr` is agent-orchestrated prose, not
  code a deterministic checker parses at runtime; a naive `file:line`-shaped-string detector (e.g.
  `\w+\.\w+:\d+`) is trivially satisfiable by a fabricated-looking string that matches the pattern without
  being real — it would launder the appearance of rigor without the substance, which is worse than no
  mechanism at all. The checklist instead makes the grounding **visible and reviewable**: it forces you
  (and, downstream, `@qa`'s adversarial review) to look at a concrete table of claims-with-locators before
  any option is drawn, and a missing/thin/vague row is immediately legible as a gap to a human reader —
  where a regex-pass/fail would only be legible as a boolean.
- **Known residual risk (named explicitly, not hidden):** no purely textual mechanism is 100% burla-proof
  against an agent that is mistaken, in a hurry, or actively cutting corners — a determined-enough (or
  simply careless) run could still write a checklist row that *looks* like a real locator but wasn't
  actually re-verified. This risk is **not eliminated** by this gate; it is **mitigated** by (a) the
  explicit "you re-verify every finding against the real files yourself" rule two paragraphs up, and (b)
  `@qa`'s adversarial `/review` of the resulting ADR, whose job includes spot-checking a sample of the
  checklist's evidence rows against the real files. The checklist raises the cost of skipping grounding
  and makes skipping it visible; it does not make skipping it impossible.

### Phase 1 — Frame the spine (G1)

Per `playbook.md` Phase 1. No orchestration-specific mechanics beyond the bookkeeping above.

### Phase 2 — Data model (G2)

Per `playbook.md` Phase 2. Explicitly skip (see "skipped-phase" rule above) when the ADR has no
data-model surface.

### Phase 3 — Ratify decision-by-decision (G3, per-decision BLOCKING)

Per `playbook.md` Phase 3 **and** `references/decision-elicit-card.md` (presentation contract).
Enumerate every discrete choice as a numbered `D<n>`; classify each against
`references/decision-forks.md` (F1-F13) to pick the elicitation method. Set `decision.total` once
enumerated, `decision.current: 0`, before eliciting the first one.

**Order of operations (NON-NEGOTIABLE):**
1. You may draft the ADR file early (proposed/draft) for continuity — **draft ≠ ratified**.
2. Open Phase 3 with: *“Vamos decidir uma por vez, D1 → D{n}. Só avanço após sua escolha.”*
3. For **each** `D<n>`, present a **User-Facing Decision Card** (see `decision-elicit-card.md`): human
   title · non-technical context · practical user example (before/after the person can picture) ·
   options or open prose in life-outcome language · recommendation optional · wait for answer.
4. **Forbidden:** bulk technical dump of D1–Dn + single gate “aprova o ADR / `aprovar`|`ajustar`|`rejeitar`”
   (GAPS-dump anti-pattern — playbook + decision-elicit-card anti-exemplar). If you already did that,
   **recover**: discard the bulk ask; restart from the first unratified `D` with a proper card.
5. Only after every `D` is ratified or parked → Phase 7 may mark the ADR durable/APPROVED path.

**D3 — adaptive elicitation, 2-axis classifier (NON-NEGOTIABLE — `006.W2.2`).** Before any `D<n>` is
presented to the human, run this classifier on it — in the MAIN orchestration, never in a subagent
(`006.W2.1` canal-humano-único contract, reused verbatim: see AC6 sub-bullet below). This **replaces** the
purely-manual non-collapsible recognition `006.W1.3` shipped as its provisional solution (VC-3) — the
mechanism below is structured and testable, but it does not claim to be infallible (no classifier is);
the adversarial pass in every `/review` remains the real backstop, exactly as `006.W1.3`'s residual risk
already said.

**Axis A — Consequence (the GATE: decides IF a decision reaches the human at all).** Classify every
discrete `D<n>` into exactly one of 4 tiers, in this order (first matching tier wins — always check T3
before considering T0):

| Tier | Meaning | Elicits? |
|---|---|---|
| `T3 mandatory-elicit` | Non-collapsible (enum below) | **Always** — ignores confidence, never downgraded |
| `T2 elicit` | Touches third parties / shared state, not in the T3 enum | Yes |
| `T1 log-and-proceed` | Reversible, has an audit trail | No — proceeds autonomously, but logs |
| `T0 auto-resolve` | Reversible + no external effect + collapsible | No — resolves without asking the human, but the default is always logged (never silent to the record) |

**T3 non-collapsible enum (AMPLIFIED per research R2 — VC-1: adopted in full, see rationale below):**
- The 4 original categories (D3/D6 of the ADR, `006.W1.3`'s baseline): **security**, **schema/data-model**,
  **irreversible** (`reversibility: one-way-door`, `adr-template.md` §2.3), **cross-product/cross-app**.
- Plus the 5 research-recommended additions (R2, industry Tier-4 convergence): **production deploy**,
  **destructive operation** (delete/migration), **privilege/authz change**, **external communication**
  (push/PR/release — this repo's own "only `@devops` pushes/merges/releases" rule makes every
  `@devops`-exclusive action non-collapsible by construction), **real-cost transaction**.
- **VC-1 decision (`@architect`, this story):** adopt the enum **in full**, not a subset. Rationale — the
  ADR's own D8 text says D8 was *"already revisada pelo research"* before ratification, so the 9-item enum
  is not a speculative add-on being smuggled in; it is the ratified design. A narrower enum would also
  contradict R2's own justification (it maps 1:1 onto this repo's existing governance-lite rule for
  `@devops`), so trimming it would reopen a gap the repo already closed by convention elsewhere.
- A decision touching **any one** of these 9 categories is `T3`, however small it looks. `T3` is a floor,
  not a ceiling — a decision can independently also be a controversial/close-call fork (`decision-forks.md`
  F4/F6/F8/F10/F13); both facts can be true of the same `D<n>`.

**Axis A determination is evidence-based, not vibes-based:** ask "does this decision's chosen path touch
one of the 9 T3 categories, in fact — not in how it's phrased?" A decision *phrased* as a style choice can
still be schema/security in substance — a decision's surface framing (how it's described) is never the
basis for its tier; only what it actually changes is. This is exactly the disguise the adversarial smoke
(`006.W2.2` AC7 — see the story's Dev Agent Record for the 3 recorded attempts) is designed to catch.

**Axis B — Uncertainty (decides HOW a T2/T3 decision is presented — prose vs. closed question). Applies
ONLY to `T2`/`T3`** — `T0`/`T1` never reach Axis B because they never reach the human at all. Evaluate 3
**discrete, binary** signals (fire / does not fire — never a continuous or weighted score, per R4):

1. **Novelty** — no precedent for this exact decision in the Development Log or ADR history (grep/search
   before deciding; a genuine zero-match search is itself "fires").
2. **Divergence between opinions** — two or more independent analysis sources (a companion research report,
   a `/roundtable`/`/advisory-council` pass, a second model/session's read) disagree on the right path.
   **VC-2 decision (`@architect`, this story):** in this first version — before `006.W2.3` wires automatic
   companion/advisory invocation — a `D<n>` frequently has only ONE source of analysis (your own read as
   the architect persona). When there is no second opinion to compare, this signal **defaults to "not
   available, does not count as fired."** Never fabricate a second opinion (e.g. asking yourself the same
   question twice and calling it "divergence") just to have something to compare — that would launder a
   1-source read as if it were inter-rater evidence, exactly the miscalibration R3 warns against. If a
   real second source genuinely exists for this `D<n>` (a companion report already returned, a roundtable
   already ran), use its actual verdict.
3. **Cost / blast-radius** — the decision's blast radius is large even though it didn't clear the T3
   bar (e.g. touches many files/callers, affects multiple stories downstream, or is expensive to reverse
   even if technically reversible).

**Threshold (discrete count, NON-NEGOTIABLE per R4 — never continuous/weighted):** count how many of the 3
signals fired.
- **≥2 fired → open prose.** Present the Decision Card, then ask the human to write how-it-is /
  how-it-would-be / gain / loss / alternatives in their own words — no forced menu.
- **<2 fired (0 or 1) → closed `AskUserQuestion`**, Decision Card + real recommendation + explicit
  trade-offs, 2-4 options, **"Outro — escrevo livre" ALWAYS visible as the last option** (same
  anti-pattern `playbook.md` names — never rely on an implicit free-text affordance a rich preview can
  crowd out). This applies even when you're confident the closed options cover it.
- This is a **count of discrete fired/not-fired signals**, never a score, weight, or percentage — write
  "2 of 3 signals fired" in your own reasoning, never "uncertainty ≈ 0.7".

**AC4 — Confidence never downgrades T3 (NON-NEGOTIABLE, R3).** However confident you (the architect
persona) are about the right answer, a decision that lands in the T3 enum stays `T3 mandatory-elicit` —
there is no confidence-based escape hatch to T2 or lower. This mirrors "divergence between opinions" being
preferred over self-confidence as an uncertainty signal above: self-confidence of a single model is
known-miscalibrated (research: verbalized ~90% confidence ≈ ~75% real, composing to ~42% real reliability
across a 3-step chain) and is never a legitimate reason to skip or soften a T3 elicitation.

**T0 auto-resolve — CONSERVATIVE by design (AC5, NON-NEGOTIABLE).** `T0` is a narrow definition, not a
default: a decision is `T0` only when **all three** hold simultaneously —
  (a) **no external effect** observable outside the current session/artifact,
  (b) **trivially reversible** (e.g. a rename, a formatting choice, picking between two options that are
      technically equivalent and were already validated in a prior ratified ADR),
  (c) **outside every one of the 9 T3 categories** above.
If any of (a)/(b)/(c) is unclear or arguable, it is **not** `T0` — fall through to `T1`/`T2` per the normal
tier logic; `T0` never gets the benefit of the doubt. **The T0-resolved default is ALWAYS logged, never
silent** — append an entry to `adr-progress.json`'s `transitions[]` (`006.W1.2` AC6 append-only trail) at
the moment of resolution, e.g. `{"revision": <n>, "from_phase": 3, "to_phase": 3, "mode": "<active_mode>",
"reason": "T0 auto-resolve D<k>: <one-line default chosen>", "ts": "<ISO8601>"}` — so `006.W3.3`'s
telemetry can later measure exactly what T0 resolved, across every ADR run. A `T0` resolution with no
`transitions[]` entry is a bug in this skill's own execution, not an acceptable silent default.

**Enforcement lives in the MAIN, never a subagent-decidable check (AC6, reinforces `006.W2.1` AC4 — the
same canal-humano-único contract, not duplicated).** The tier classification and the resulting
elicit-or-not decision are made by the MAIN session's `@architect` persona orchestrating Phase 3, exactly
like Phase 0/6's parallel readers may surface evidence but never decide to skip a human call themselves.
A subagent reading code for Phase 0/6 may flag "this looks like it touches schema" in its return text —
that flag is evidence for YOU to classify, never a subagent's own tier verdict that this skill accepts
uncritically.

**Then, as before:**
- **Controversial/close-call forks** (F4, F6, F8, F10, F13 per `decision-forks.md`, or anything genuinely
  contested) that are `T2`/`T3` → open prose per Axis B above (a controversial fork's uncertainty signals
  will typically fire ≥2 on their own — novelty and cost/blast-radius are common companions of "genuinely
  contested").
- **One decision at a time.** Never bundle a controversial decision inside an obvious one. Large ADRs
  ratify in passes — log each pass's provenance in the Change Log.
- **Research-heavy decision** → don't force a ratification: mark it an explicit open item, route to
  Phase 4 (a pointer-decision, `playbook.md` Phase 4 / fork F11).

After each `D<n>` is ratified: append to `decision.decided[]` (`id`, `choice`, `decided_at`), bump
`decision.current`. Close the phase once every enumerated `D<n>` is either ratified or explicitly parked
for Phase 4.

**Telemetry (`006.W3.3`) — emit `adr_decision_recorded` at this same moment,** per
`.claude/rules/orchestration-telemetry.md` (referenced here, never copied — this section only states
what this skill does, not the vocabulary/schema itself). One event per ratified `D<n>`:
- `type: "adr_decision_recorded"`, `phase: 3`, `skill: "adr"`, `run_id`, `timestamp`, `severity: "medium"`,
  `event_schema_version: "1.1"`, `detail` = the `D<n>` id + a one-line summary of the choice.
- **When the decision went through a real human gate** (`T2 elicit` or `T3 mandatory-elicit` — the Axis A
  tier just classified above), include `human_decision{decided_by, choice, gate_type, rationale_ref,
  resolved_at}`: `gate_type` is `"hard"` for `T3`, `"soft"` for `T2`; `rationale_ref` points at
  `adr-progress.json`'s own `decision.decided[]` entry for this `D<n>` (or the transcript, when a more
  specific pointer exists); `resolved_at` = the same `decided_at` just written.
- **When the decision was `T0 auto-resolve`** (no human gate — see AC5 above), emit the event **without**
  `human_decision{}` — the `T0` default is already logged in `transitions[]` (`006.W2.2` AC5); do not
  fabricate a `human_decision{}` for a decision no human actually made.
- This skill emits the event inline (no learning-log file this skill maintains today) — record it in the
  session's own output/notes as evidence when asked; a future aggregator (`.synapse/metrics/
  orchestration-friction.json`, not present in this repo yet) is the durable sink once it exists.

### Phase 4 — Companion research (conditional; automatic trigger detection — `006.W2.3`)

Per `playbook.md` Phase 4. This phase **fires** the moment any decision inside the ADR's Phase 3 walk
(or a genuine research need surfacing in Phase 0/6) trips one of the **5 dirty-work triggers** below —
you no longer wait for the human to notice; you self-detect and act. These are the same 5 triggers this
repo already uses in every other orchestration pipeline (`.aiox-core/rules/agent-formats.md` §"The 5
chief execution patterns" → "Companion system"; conceptual precedent `dual-session-workflow.md`,
reconstructed here without SINKRA vocabulary per D1 agnosticism) — this skill does not invent a
different threshold set, it reuses the ratified one:

1. **Sampling/analysis of N ≥ 20 items** — e.g. scanning many existing ADRs for a `reconcile`, or
   walking ≥20 call sites while grounding Phase 0.
2. **External research > 15 min estimated, or 3+ external sub-queries** — a market scan, a prior-art
   survey, a multi-query technology comparison.
3. **ETL of a file > 50 KB or a directory > 10 files** — parsing/summarizing a large log, dataset, or
   sprawling directory tree as evidence for a decision.
4. **Exploratory doubt before a structural decision** — "será que", "como outros fazem", any moment
   where you'd otherwise start improvising research inline instead of grounding a `D<n>` in real
   evidence.
5. **Work that would add > 8K tokens to the clean context of this `/adr` session — INVIOLABLE.** This
   trigger is never skipped for convenience even when the other 4 don't fire on their own; it exists
   specifically to protect the spine's context from exactly the kind of inline-research bloat this
   epic's own empirical extraction finding identified as the root problem this skill exists to solve.
   However confident you are that "just this once" the research is short, if your own estimate crosses
   8K tokens of raw material you would otherwise pull inline, this trigger has fired — treat it exactly
   like the other 4, not as a softer suggestion.

**Any one trigger firing → invoke `/companion`, never do the research inline.** Detecting a trigger and
then doing the work yourself anyway is the exact anti-pattern this phase exists to prevent — the fact
that you *could* answer the question inline is not a reason to; the point of the 5 triggers is that
inline research of this shape pollutes the ADR's decision context regardless of how capable you are of
doing it.

**Handoff protocol (VC-1 — confirmed against `.aiox-core/skills/companion/SKILL.md` in full; this is
the REAL mechanism, not the human-opens-a-new-session pattern `dual-session-workflow.md` describes for
its own different pipeline):**
1. **Pause this phase.** Park the decision as an explicitly tracked open item in the ADR draft/progress
   (per the "Steps" in `playbook.md` Phase 4) — never silently defer it, never let Phase 3 stall waiting
   on it.
2. **Spawn the companion directly** — this session issues the CLI call itself, it does not ask the
   founder to open a new session and paste a prompt: `aiox-core companion launch --slug
   adr-<slug>-research --prompt "<the research question, framed as a self-contained brief>"` (or `aiox-
   core companion respawn adr-<slug>-research` if a companion for this ADR already exists and the
   question changed). **Precondition D2 (NON-NEGOTIABLE):** this requires the AIOX Cockpit already
   running — its daemon is the spawn authority. If it's not running, tell the founder to open the AIOX
   Cockpit (or run `/update-cockpit`) and retry; **never fail silently, never fabricate a research
   result to avoid the dependency.**
3. **Poll asynchronously, never block the foreground.** `aiox-core companion pending --wait --story
   <story_id> --timeout-ms <N>` run with `run_in_background: true` (or your CLI's equivalent) — same C1
   mitigation the `/companion` skill itself mandates. Continue other Phase-3/4 bookkeeping (or simply
   wait for the notification) instead of freezing the main session on a synchronous call.
4. **Resolve pending decisions as they surface.** Routine ones (fit the scenario's `policy_hint`, or an
   operational choice with an obvious safe option) you resolve yourself via `aiox-core companion resolve
   <story_id> --selected "<label>"` — structural ones (touching the ADR's own design/contract) you
   escalate to the founder via your own `AskUserQuestion` (per `companion/SKILL.md` §"Resolving
   decisions"), never by typing into the companion pane.
5. **Resume on the ready-signal, not on a guess.** The companion's `done` event plus its behavior-report
   path is the only valid ready-signal — read the report from there, validate it's fresh (not a stale
   prior run), and consume it. A response with no ready-signal artifact is not resumable evidence.
6. **Promote the finding to its own child ADR** (`complements[]` wired both ways) rather than inflating
   this spine — exactly as `playbook.md` Phase 4 already prescribes; this wiring changes HOW research
   happens, never WHAT happens to its output.

### Phase 5 — Reconcile + adversarial review (G5; automatic invocation — `006.W2.3`)

Per `playbook.md` Phase 5. Two jobs share this slot: (a) if Phase 4 produced N companion reports,
cross-check them against each other and against what's already ratified; (b) **every** ADR gets a
dedicated adversarial pass before it's treated as final — this phase now **invokes it automatically**,
you no longer wait to be told to run the command.

**Choosing `/roundtable` vs. `/advisory-council` (AC4/VC-2 — confirmed against both `SKILL.md` in full;
the distinction is already explicit in both, not invented here):**
- **`/roundtable {adr-path}`** — **domain-expert lenses** (`@architect`, `@cso`, `@qa`, `@db-sage`, …
  each analyzing from their professional specialty). Use it when the ADR's open/contested decisions need
  scrutiny from the domain expertise already mapped in this repo (architecture, data, quality,
  governance) — the default choice for most ADRs.
- **`/advisory-council {adr-path}`** — **cognitive-diversity lenses** (Contrarian, First Principles,
  Expansion, Outsider isolated to web-only knowledge, Executor), with an anonymization protocol against
  anchoring bias. Its own `SKILL.md` states it plainly: *"Complementary to /roundtable: roundtable uses
  domain-expert lenses... advisory-council uses cognitive-diversity lenses"* and *"NOT for: domain-
  expert review (use /roundtable)"*. Use it instead of `/roundtable` when the goal is to break anchoring
  bias on a still-open structural decision (a controversial ADR, or a `D<n>` that landed in
  `decision-forks.md`'s F4/F6/F8/F10/F13 controversial/close-call categories) — not as a substitute for
  domain review, as an addition when the decision itself is the thing in doubt, not just its execution.
- The two are not mutually exclusive across an ADR's lifetime — a contested `D<n>` can go through
  `/advisory-council` to pressure-test the framing, and the resulting ADR can still go through
  `/roundtable` for the domain-expert pass before Phase 7. Pick per decision, not once per ADR.

**Invoke it — `/roundtable {adr-path}` or `/advisory-council {adr-path}`** per the criterion above,
**plus, optionally, `/pedro-advisor {question}` as a lightweight sanity-check** — never as a
replacement for either. `/pedro-advisor` is advisory only, exactly like the `pedro-valerio-advisor`
agent this repo already defines: it never issues a veto, only `LEAN_APPROVE` / `CONCERN` /
`LEAN_AGAINST`, and its parecer is one more input into the human gate, never a substitute for it — the
founder ratifying a `D<n>` in Phase 3 (or reconciling a Phase 5 finding) always keeps the final call.
Running `/pedro-advisor` is never mandatory before Phase 5 can close; skipping it is never a defect.

Record who weighed in (`consulted[]`, `adr-template.md` §2.1) and log every finding to closure in a
"Review Findings" section (FIXED / WON'T-FIX / DEFERRED) — never leave one dangling. The human ratifying
in Phase 3 always keeps the final call.

### Phase 6 — Deprecation & cleanup audit (G6, BLOCKING for schema/structural ADRs)

Per `playbook.md` Phase 6. Only for ADRs that create or change schema/structure — otherwise close as a
skipped phase (see bookkeeping rule). **Same canal-humano-único contract as Phase 0 applies here, verbatim
(`006.W2.1`, D6-e)** — parallel read-only cleanup-sweep subagents report their findings to you via
`Agent()` return/text only; they never `AskUserQuestion` the human directly, and if a sweep subagent
surfaces something ambiguous ("this table might still be load-bearing"), it stops and reports the
ambiguity to you — you decide whether it needs a human call, and if so, you make it.

### Phase 7 — Errata, reconciliation, handoff (G7, BLOCKING)

Per `playbook.md` Phase 7. Errata any already-approved sibling ADR a new decision touches (bidirectional
`complements`/link; defer if the target isn't durable yet). Write the final ADR to its canonical
location — `docs/architecture/ADR-<SLUG>.md` — frontmatter per `.aiox-core/rules/adr-frontmatter.md`
(required baseline: `adr_id`, `title`, `status`, `date`, `decisions[]` each with `id`/`summary`/
`enforced_by[]`) **plus** whichever optional fields from `references/adr-template.md` §2 genuinely apply
(`consulted[]`/`informed[]`, `decisions[].confirmation` — REQUIRED when `enforced_by: []`,
`reversibility`+`confidence`, `owner`, `options[]`, `change_history[]`, `links[]`). `decisions[]` is
populated **one entry per ratified `D<n>`**, never a single umbrella entry. You do not push directly —
repository writes route through whichever role owns them in the host project.

Close `adr-progress.json`: `phase.current: 7`, `gate_status: "passed"`, `transition_to: null`,
`target_ref` = the real final path — same atomic pattern as every other phase close ("Progress
bookkeeping + sequence-lock" above): write `.aiox/adr/<slug>/gate-7.ack` in the same operation, with
`evidence_ref` pointing at the final ADR path.

**Emit a clean-session handoff prompt** — the ADR terminates here (D7); this skill does not invoke
`/governance-pipeline` automatically (that wiring is `006.W3.2`). Print, for the human to copy into a
fresh session:

```
🔀 ADR ready for governance handoff
ADR: docs/architecture/ADR-<SLUG>.md (status: <STATUS>)
Decisions ratified: D1..D<n> (<n> total)
Cleanup debt (if any): <pointer to §6, or "none">
Next: open a fresh session and run `/governance-pipeline docs/architecture/ADR-<SLUG>.md` to turn this
into an epic + stories, OR file the ADR-debt as an explicit backlog item if compliance isn't immediate
(playbook.md practice #6).
```

## `revise` / `reconcile` / `audit` — full implementation (`006.W3.1`)

The immutability principle this skill adopts from `playbook.md` ("an ADR is immutable, only its status
changes") is a **default with one legitimate, explicit exception**: `revise` edits the SAME ADR file
in-place because it IS a new ratification (recorded via `change_history[]`/`decision_forks[]`, never a
silent rewrite) — `reconcile` NEVER edits an old ADR's body, it only ever flips `status:`/
`superseded_by:` on the old ADRs after writing a brand-new one that supersedes them. Conflating the two
is the exact failure mode this section exists to prevent — re-read this paragraph if a `revise` request
starts to feel like it wants to touch more than one file, or a `reconcile` request starts to feel like
it wants to edit an old ADR's prose.

### `revise {adr-path}` (AC1, VC-3)

**Precondition (BLOCKING):** read the target ADR's frontmatter `status`. If it is `SUPERSEDED` /
`DEPRECATED` / `REJECTED` — HALT: *"`revise` não se aplica a um ADR `<status>` — esses estados são
terminais. Use `reconcile` se a intenção é substituir/mergear este ADR com outros, ou edite manualmente
se for uma correção editorial que não muda a decisão em si (fora do escopo desta skill)."* Any other
status (`APPROVED`/`ACCEPTED`/`PROPOSED`/`DRAFT`) is mutable — proceed.

**Walk (same machinery as `create`, entered at a different point, re-using the SAME
`adr-progress.json`):**
1. Resolve `<slug>` the same way `create` does (from the ADR's own `adr_id`, not a freshly-slugified
   topic) and read `.aiox/adr/<slug>/adr-progress.json` if it exists (Phase-0 Recognition above) — a
   `revise` on an ADR that has no prior `adr-progress.json` (e.g. an ADR written before this skill
   existed) starts a fresh one, `phase.current: 0`, exactly like a brand-new `create` would, EXCEPT
   `target_ref` is the EXISTING file path (never a new one) from the very first write.
2. **Delta Phase 0 (targeted, not a full re-grounding).** Re-check only what the human says changed in
   reality since the ADR's last pass (or since its `date`/last `change_history[]` entry if nothing was
   said) — the same G0 checklist discipline applies (real `file:line`/grep evidence per row), but scoped
   to the delta, not the whole original Context & Problem section. Close with `gate-0.ack` exactly like
   any other phase close (sequence-lock section above) — a `revise` still writes real acks, it does not
   get a lighter bookkeeping bar just because it's a re-entry.
3. **Phase 3, targeted — the decision-by-decision walk applies to ONLY the decision(s) the human wants
   to revise (new ones, or specific existing `D<n>` being reopened), never a re-walk of every already-
   ratified `D<n>` in the ADR.** The User-Facing Decision Card contract (Phase 3 above,
   `decision-elicit-card.md`) and the **D3 2-axis classifier (`006.W2.2`) run exactly as they do in
   `create`, with zero exception** — this is VC-3's non-negotiable: a `revise` touching a `T3`
   non-collapsible decision (security/schema/irreversible/cross-product/… the 9-category enum) gets the
   SAME mandatory-elicit rigor as its original ratification, never a shortcut because "it's just a
   revise". Confidence never downgrades `T3` here either (AC4 of the classifier, reused verbatim).
   - **Reopening an already-ratified `D<n>`** (its `id` already appears in `decision.decided[]`): this is
     a fork — append to `adr-progress.json`'s `decision_forks[]` (`decision_id`, `superseded_choice` =
     the old `choice`, `new_choice` = the new one, `forked_at_revision` = current `revision`,
     `stale_phases[]` if any downstream phase depended on the old choice) BEFORE updating
     `decision.decided[]`'s entry for that `id` to the new choice — the old choice is preserved for
     audit, never overwritten silently (`006.W1.2` AC contract, reused here).
   - **A genuinely new `D<n>`** (never ratified before in this ADR): ratify it exactly like `create`
     Phase 3 would, append to `decision.decided[]` as usual — no fork.
4. **Phase 7, targeted.** Update `decisions[]` in the ADR's frontmatter (the reopened/new entries only —
   every other `decisions[]` entry is untouched, byte-for-byte, exactly the same discipline `reconcile`
   enforces mechanically below, just not mechanically checked here since `revise` legitimately touches
   the SAME file's OTHER sections too, e.g. a body paragraph the decision's prose lives in). Append a
   `change_history[]` entry (`adr-template.md` §2.6: `date`, `author`, `change` — one line naming what
   this pass revised and why) AND a row in the body's prose Change Log table (the two are the same fact
   recorded twice on purpose — structured for machine query, prose for human reading, per
   `adr-template.md` §2.6's own rationale). Re-run the durability/handoff gate (G7) — write `gate-7.ack`
   the same atomic way `create` does.
5. **Re-entering Phases 1/2/4/5/6** — only if the revision genuinely reopens the spine (a new stage
   inserted into the lifecycle) or the data model (a new/changed structure). Most revisions (adjusting
   one decision's reasoning, adding a new decision that doesn't touch the model) never need this — say so
   explicitly either way, don't silently skip a phase that genuinely needed re-entry.

**Telemetry (`006.W3.3`):** a fork (step 3, reopened `D<n>`) emits `adr_superseded` (`detail` =
`decision_id` case) **alongside** the `adr_decision_recorded` for the new choice — the two events
describe the same fork from two angles (what changed vs. what it became), both fire. A `revise` that
only adds new `D<n>`s (no fork) emits `adr_decision_recorded` only, exactly like `create`.

### `reconcile {cluster}` (AC2, AC3 — decisive: mechanical, not narrated)

`reconcile` takes a cluster of **N ≥ 2** existing ADRs and produces **exactly one new ADR** file that
`supersedes[]` all N — the N old ADRs are NEVER edited beyond two frontmatter fields
(`status: SUPERSEDED` + `superseded_by: <new adr_id>`). This is enforced **mechanically**, not by
prose discipline alone, via `scripts/reconcile.js` — the same "described-gate vs. mechanical-gate"
lesson `006.W5.3`'s ui-ux gate already applied to this skill.

**Walk:**
1. **Draft the new ADR through the normal Phase 0-7 walk**, treating the cluster's N ADRs as the input
   evidence for Phase 0 (their Context & Problem sections, their `decisions[]`, any drift between them)
   — Phase 5's reconciliation job ("cross-check N sources against each other") is exactly this step, per
   `playbook.md` Phase 5 ("here the sources are the ADRs in the cluster"). Ratify the merged decision set
   through Phase 3 like any other ADR (a decision the cluster already agreed on can be a fast `T0`/`T1`
   re-confirmation; a genuine conflict between the N old ADRs is itself a `T2`/`T3` decision needing a
   real elicitation — never silently pick a side). Write the new ADR to its canonical
   `docs/architecture/ADR-<NEW-SLUG>.md` location (Phase 7) with `supersedes: [<the N old adr_id>s]` set
   in its frontmatter from the start — this is a precondition `reconcile.js` checks, not an
   afterthought.
2. **Preview first (`--check`), always, before applying.** Run:
   ```
   node .aiox-core/skills/adr/scripts/reconcile.js --new <new-adr-path> --old <old1> [--old <old2> ...] --check
   ```
   This validates preconditions (the new ADR's `supersedes[]` matches the `--old` set exactly; no `--old`
   ADR is already terminal) and prints exactly what would change, **mutating nothing**. Show this preview
   to the human and get explicit confirmation before applying — `reconcile` is always an explicit human
   action (VC-1's own framing: "the `audit` só sugere, o `reconcile` em si SEMPRE é uma ação explícita do
   humano").
3. **Apply atomically** (same command, without `--check`):
   ```
   node .aiox-core/skills/adr/scripts/reconcile.js --new <new-adr-path> --old <old1> [--old <old2> ...]
   ```
   This performs the ordering AC3 requires — the new ADR is already on disk (step 1) BEFORE any old ADR
   is touched, so `superseded_by` on an old ADR never points at a file that doesn't exist yet — then
   flips `status:`/`superseded_by:` on each old ADR via a targeted line-level rewrite (never a full
   re-serialize, which is exactly what would risk corrupting unrelated content — see the script's own
   header comment for the CRLF corruption bug this design choice was hardened against during this
   story's own smoke test). It then runs its **own byte-diff self-check** against a pre-mutation
   snapshot of each old ADR and reports PASS/FAIL per file — exit 0 only if every old ADR is verified
   byte-identical to its pre-reconcile state except those exact 2 lines. **Exit non-zero → HALT, do not
   report `reconcile` as done** — investigate the reported diff before trusting the result.
4. **REQUIRED smoke evidence (AC2 — do this at least once per story/session that touches this path,
   not only during this story's own authoring):** the byte-diff self-check IS the AC2 verification
   mechanism baked into the tool itself — every real `reconcile` run produces this evidence
   automatically, it is not a separate manual step someone might forget.

**Telemetry (`006.W3.3`):** emit `adr_superseded` (`detail` = `superseded_ref` case, the N old ADR
paths) at the moment `reconcile.js` reports the apply-mode self-check PASSED — never before (a
`--check` preview the human hasn't confirmed is not a real supersede, fabricating the event for it
would violate the "real fill, not synthetic" principle this telemetry rule exists to uphold), never on
a self-check FAIL (the mutation happened but is not trusted yet — surface the failure, don't also claim
telemetry success for it).

### `audit {adr-path}` (AC4, AC5, VC-1, VC-2)

`audit` is **report-only** — it never mutates an ADR, never auto-merges, never auto-fixes. Run:
```
node .aiox-core/skills/adr/scripts/audit.js <path-to-adr.md-or-directory> [--stale-days=180]
```
`<path>` may be a single ADR file or a directory (e.g. `docs/architecture/`) to audit the whole corpus
at once. The script performs, mechanically:

- **(a) Enforcement-coverage invariant** (`playbook.md` practice #1) — every `APPROVED`/`ACCEPTED`
  ADR's decision must have a non-empty `enforced_by[]` OR an explicit `confirmation` field
  (`adr-template.md` §2.2's own rule). A decision with neither is reported as a `GAP`.
- **(b) Merge candidates** (VC-1 heuristic — @master decision, documented limitation) — two signals,
  either is enough to flag a pair: mutual `complements[]` (A complements B AND B complements A), or
  `applies_to_paths[]` textual overlap ≥50% of the smaller list's entries **with at least 2 shared
  paths** (the 2-path floor exists because this repo's own real corpus, audited during this story,
  showed a concrete false-positive class: two unrelated ADRs sharing only 1 broad crate-root glob like
  `crates/aiox-cockpit/**` trivially "overlap 100%" on a 2-item list without being a real merge
  candidate — see the script's header comment for the full finding). **False-negatives are accepted;
  false-positives must be human-checkable — a `CANDIDATE` line is a suggestion to look, never grounds to
  run `reconcile` automatically.**
- **(c) Staleness** (VC-2 threshold — @master decision, documented rationale, non-blocking) — an
  `APPROVED`/`ACCEPTED` ADR with no `change_history[]` entry (or `date`) within the last 180 days is
  flagged `STALE`. 180 days is a starting default (no direct precedent exists for this exact question in
  the ADR or its research — the AWS "2-3 sprints" citation is about early-stage churn right after
  ratification, a different concern), adjustable via `--stale-days` per run without editing this skill.
- **AC5 — ADR-debt detection** — for every `APPROVED`/`ACCEPTED` ADR, each `applies_to_paths[]` glob is
  checked for at least one real match on disk (a lightweight existence check, not a full glob engine —
  see the script's own scoping note). A glob resolving to zero files is reported as `DEBT` — code has
  drifted from an `APPROVED` decision. **Never silently ignore a `DEBT` line** — name it as an explicit
  backlog/story item in your response; this script only detects and reports, it does not create the
  story itself.

Exit code is always 0 (a report, not a gate) — findings are for the human/orchestrating session to act
on, never a reason to fail the `audit` invocation itself.

**Not yet a recurring, scheduled cadence** (`playbook.md` practice #5, "review cadence") — that remains
later work beyond this skill's current appetite; `audit` today is a manual, on-demand invocation.

## Conductor integration (fail-closed)

No `CONDUCTOR_ACTIVE` in env → ignore this section; behavior is exactly as described above. Under
`CONDUCTOR_ACTIVE=true`: every `AskUserQuestion` in this skill (Phase-0 resume choice, Phase 3
elicitation, Phase 5 review acceptance) is intercepted by a PreToolUse hook — do not retry it directly;
poll `<CONDUCTOR_ROOT_DIR>/.sdc-resolution/<CONDUCTOR_STORY_ID>/resolved.json`, use `instruction`
(halt/stop → HALT) else `selected`, then clear it. Timeout (default 1800000ms) → HALT fail-closed +
`idle_no_ack` telemetry — never fall back to a direct `AskUserQuestion` (re-intercept → infinite loop).
This skill never sets `CONDUCTOR_ACTIVE` itself — it only reads it.

## Blocking conditions (HALT)

A `T3`-classified (non-collapsible, `006.W2.2`) decision about to be presented as a closed question or
auto-resolved anyway — self-catch this at classification time, before the elicitation UI is chosen · a
`D<n>` about to be resolved as `T0` when any of the three `T0` conditions (no external effect / trivially
reversible / outside all 9 non-collapsible categories) is unclear or arguable rather than clearly true —
`T0` never gets the benefit of the doubt (`006.W2.2` AC5) · a `T0` resolution about to happen without a
matching `transitions[]` entry logged (`006.W2.2` AC5 — no silent T0 defaults) · a gate about to be marked
`passed` with no real evidence/ratification/target behind it · **about to start Phase N+1's work with
`.aiox/adr/<slug>/gate-<N>.ack` absent, unreadable, or not
`status: "passed"`** (`006.W2.1` sequence-lock — read disk, never trust memory of "I think I closed that
phase") · **about to present any option/alternative in Phase 0 before every row of the G0 grounding
checklist has real evidence** (`006.W2.1`) · **any subagent (Phase 0 parallel readers, Phase 6 cleanup
sweep) about to call, or having called, `AskUserQuestion` directly** — this must never happen; if it
somehow does, treat the subagent's turn as void, discard anything it obtained that way, and re-run it
under the correct contract (`006.W2.1`, D6-e) · `adr-progress.json` `revision` observed lower than the
last known value (a stale snapshot — someone else is mid-write) · a `lock` present and unexpired from a
different `owner_session` (surface as a warning, never auto-override) · an attempt to hand-edit an
already-`APPROVED`/`SUPERSEDED` ADR in place instead of an errata/`revise`/`reconcile` · **about to
bulk-ratify D1–Dn with a technical list and a single `aprovar`/`ajustar`/`rejeitar` (or English
equivalent) instead of one User-Facing Decision Card per decision** — stop, recover per
`decision-elicit-card.md` · **a `type: ui-ux` ADR about to ratify a design decision (or open Phase 0)
without `gate-A.ack`/`gate-S.ack` present and `status: "passed"` on disk** — **mechanically enforced,
not merely described (`006.W5.3`)**: run `scripts/uiux-gate-check.js` against the ADR's
`adr-progress.json` first — exit 1 (BLOCKED) means `visual_approval` and/or `spike_ref` are
absent/illegitimate; stop, run (or finish) the R/M/A/S pre-phases first (`references/ui-ux-lifecycle.md`
+ "The ui-ux gate is MECHANICAL" section above); writing a UI/UX ADR from prose before the user has
SEEN it is the visual-world GAPS-dump · **`scripts/reconcile.js` about to be reported as done with a
non-zero exit code** (`006.W3.1`) — exit 1 means preconditions failed and NOTHING was mutated (safe to
just fix and retry); exit 3 means the mutation happened but the tool's own byte-diff self-check found
an old ADR was NOT byte-identical except `status:`/`superseded_by:` — this must never be silently
reported as a successful `reconcile`, investigate the diff before doing anything else. In every case:
surface it, don't fake progress, don't silently downgrade a non-collapsible decision to a closed
question.
