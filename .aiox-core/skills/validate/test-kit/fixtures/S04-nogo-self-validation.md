---
story_id: "TESTKIT.W1.4"
title: "Cenário S04 — NO-GO por anti-self-validation"
epic: "TESTKIT"
status: Draft
executor: "@qa"
quality_gate: "@qa"
appetite: 1d
hill_phase: figuring_out
confidence_level: know-how
task_mode: VALIDAR
entity_input: null
entity_output: null
deploy_type: none
involves_ui: false
requires_real_display: false
parent_epic: ".aiox-core/skills/validate/test-kit/fixtures/EPIC-TESTKIT.md"
---

# S04 — NO-GO por anti-self-validation

> DEFEITO INJETADO: `executor == quality_gate` (`@qa` nos dois). O check [6] é NON-NEGOTIABLE
> e a Phase 4 PROÍBE auto-fix deste caso — o esperado é NO-GO, com a story permanecendo `Draft`.

## Acceptance Criteria
- **AC1** — Dado que executor e quality_gate são o mesmo agente, quando `/validate` roda, então o veredito é NO-GO e o status permanece `Draft`.

## Tasks
- [ ] T1 — nenhuma

## Dev Notes
Fixture do test-kit.
