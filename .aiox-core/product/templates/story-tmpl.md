---
# ─────────────────────────────────────────────────────────────────────────────
# AIOX canonical story frontmatter (F2 — the machine-readable contract every SDC
# skill reads/writes). This block IS the schema: the enums + invariants below are
# what /validate's 15-point check enforces. A project may bind a richer template
# via its .aiox-project overlay; this is the agnostic default.
# ─────────────────────────────────────────────────────────────────────────────
story_id: "{{epic}}.{{wave}}.{{n}}"   # e.g. 202.W3.2  (stable id; never renamed)
title: "{{short title}}"
epic: "{{epic-id}}"                    # parent epic (its ## Development Log is /validate's enrichment source)

status: Draft                          # Draft → Ready → InProgress → InReview → Done  (+ Blocked · Skipped)
                                       #   only /validate does Draft→Ready; only /close does →Done. Never hand-edit to Done.

# ── F9 agent selection by domain (ADR-COCKPIT-AGENT-SELECTION) ──
# Filled at draft-time by /governance-pipeline (the conductor scorer over .aiox/cache/executors.json),
# tie-broken by @sm. /validate [6] re-checks; /full-cycle + /close adopt these personas at runtime.
executor: "@{{executor}}"              # the agent that implements (must resolve in .aiox-core/agents/)
quality_gate: "@{{quality_gate}}"      # the reviewer — MUST differ from executor (D8 anti-self-validation; HALT if equal)

# ── Shape Up sizing (NO-GO in /validate if missing) ──
appetite: 3d                           # 1d | 3d | 5d | 10d   (>10d → shape smaller, split the story)
hill_phase: figuring_out               # figuring_out → executing → done   (figuring_out + Ready = contradiction)
confidence_level: know-how             # know-how (1.0x) | needs-spike (1.5x) | high-risk (2.0x) — reflected in appetite
task_mode: EXECUTAR                    # CRIAR | VALIDAR | EXECUTAR | REVISAR | CONSOLIDAR

# ── entity transition (REQUIRED when task_mode ∈ {CRIAR, EXECUTAR}; N/A otherwise) ──
# status_expected on input vs output MUST differ — a real transition, not a no-op.
entity_input: null                     # { entity_type, status_expected }  or null
entity_output: null                    # { entity_type, status_expected }  or null

# ── deploy / verify binding (per-project; resolved from aiox.config.json → deploy) ──
deploy_type: none                      # none → /deploy + /verify skip, /close CHK-7 N/A. Else the project's deploy_type.
involves_ui: false                     # true → @design-ops gate runs in /review
requires_real_display: false           # true → this story's ACs need a HUMAN visual/screenshot confirmation (a real
                                        #   display + TCC session) — a PRECONDITION for /develop, checked BEFORE the
                                        #   dev session starts. Orthogonal to e2e_verification below (that one is
                                        #   POST-hoc, written by /verify, only active when deploy_type ≠ none).
                                        #   Absent/false = no display requirement (backward-compatible default; never
                                        #   retroactively required on pre-existing stories). Canonical trigger example:
                                        #   an AC that reads "confirm visually" / "screenshot" — /validate Phase 3
                                        #   raises a SHOULD-FIX safety-net if such language is present and this field
                                        #   is still absent/false (Epic 014 W1.3).

# ── wave + cross-epic dependency metadata (consumed by build-wave-dag + EPIC-202 conflict gate) ──
depends_on: []                         # story IDs that must be Done before this runs (ORDERING / WL-5 file-ownership)
consumes_artifacts_of: []              # ⊆ depends_on — story IDs whose COMMITTED output this worktree needs (PROVISIONING)
cross_epic_dependencies: []            # cross-epic logical deps (EPIC-202; { epic, story?, reason }) — /wave-execute conflict gate

# ── written by /verify, read by /close CHK-7 (only when deploy_type ≠ none) ──
e2e_verification: null                 # { status: PASS|FAIL|PARTIAL, environment, checks: [{name,status,details}] }
---

# Story {{story_id}} — {{title}}

## Story
**As a** {{role}},
**I want** {{action}},
**so that** {{benefit}}.

## Acceptance Criteria
<!-- Numbered, each independently testable (given/when/then). Copied/refined from the epic. -->
1. {{AC-1}}
2. {{AC-2}}

<!-- ## Validation Conditions   ← added by /validate Phase 5 only if non-blocking observations remain (VC-1, VC-2…) -->

## Tasks / Subtasks
<!-- Decomposed; reference the AC each task satisfies. Checked off by /develop as completed. -->
- [ ] Task 1 (AC: 1)
  - [ ] Subtask 1.1
- [ ] Task 2 (AC: 2)

## Dev Notes
<!-- Enough context that the executor never needs to read the architecture docs. Populated from the
     epic's Development Log + prior Done stories + the learning KB by /validate (Phase 2). Do not invent. -->
- {{relevant decisions, source tree, gotchas carried forward}}

### Testing
<!-- Test file locations, standards, frameworks/patterns, story-specific test requirements. -->
- {{testing standards}}

## Dev Agent Record
<!-- Populated by the executor during /develop. -->
### Agent Model Used
{{agent_model_name_version}}

### Completion Notes
- {{what was done / issues encountered}}

### File List
<!-- EVERY file created/modified/deleted, with an explicit Operation column. /close CHK-9 (Deliverable
     Reality Gate) reads Operation: ADD/MODIFY → EXISTS + git-TRACKED + COMMITTED; DELETE → confirm absence.
     Without this column CHK-9 has no source and degrades. -->
| File | Operation | Notes |
|------|-----------|-------|
| {{path}} | ADD\|MODIFY\|DELETE | {{what changed}} |

## QA Results
<!-- The quality_gate's verdict, written by /review. Structured: verdict (PASS|FAIL|CONCERNS),
     score, findings[] (severity, location, prescription), reviewed_by, reviewed_at. /close CHK-1 reads it. -->

## Change Log
<!-- Every status transition + significant edit. /validate, /review, /close each append a row. -->
| Date | Author | Change |
|------|--------|--------|
| {{date}} | @{{agent}} | {{what}} |
