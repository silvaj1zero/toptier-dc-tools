---
story_id: "TESTKIT.W1.5"
title: "Cenário S05 — HALT idempotente"
epic: "TESTKIT"
status: Done
executor: "@dev"
quality_gate: "@qa"
appetite: 1d
hill_phase: done
confidence_level: know-how
task_mode: VALIDAR
entity_input: null
entity_output: null
deploy_type: none
involves_ui: false
requires_real_display: false
parent_epic: ".aiox-core/skills/validate/test-kit/fixtures/EPIC-TESTKIT.md"
---

# S05 — HALT idempotente

> ESTADO INJETADO: `status: Done`. O Step 0 manda ABORTAR sem nenhuma mudança e sem rodar
> NADA abaixo (nem promoção de learning). Um re-run tem que ser livre de efeito colateral.

## Acceptance Criteria
- **AC1** — Dado que a story está `Done`, quando `/validate` roda, então aborta e NENHUM arquivo é modificado.

## Tasks
- [x] T1 — concluída

## Dev Notes
Fixture do test-kit.
