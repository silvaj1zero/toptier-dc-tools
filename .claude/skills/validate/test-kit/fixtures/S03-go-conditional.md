---
story_id: "TESTKIT.W1.3"
title: "Cenário S03 — GO condicional"
epic: "TESTKIT"
status: Draft
executor: "@dev"
quality_gate: "@qa"
appetite: 1d
hill_phase: figuring_out
confidence_level: know-how
task_mode: VALIDAR
entity_input: null
entity_output: null
deploy_type: none
involves_ui: true
parent_epic: ".aiox-core/skills/validate/test-kit/fixtures/EPIC-TESTKIT.md"
---

# S03 — GO condicional

> DEFEITO INJETADO: AC com linguagem de confirmação visual + `requires_real_display` **AUSENTE**.
> A safety-net da Phase 3 deve levantar um SHOULD-FIX (não-bloqueante), e a Phase 5 deve
> materializá-lo como uma `## Validation Conditions` explicitamente rotulada — reusando esse
> mesmo mecanismo, nunca uma saída paralela.

## Acceptance Criteria
- **AC1** — Dado que o painel renderizou, quando o operador abre o cockpit, então **confirmar visualmente** que o badge aparece (screenshot).

## Tasks
- [ ] T1 — nenhuma

## Dev Notes
Fixture do test-kit.
