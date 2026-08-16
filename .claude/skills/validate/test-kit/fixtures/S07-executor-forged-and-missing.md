---
story_id: "TESTKIT.W1.7"
title: "Cenário S07 — executor forjado + referência inexistente"
epic: "TESTKIT"
status: Draft
executor: "@sinkra-creator-chief"
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

# S07 — executor forjado + referência inexistente

> DEFEITOS INJETADOS (dois eixos num cenário só):
> 1. `executor` é uma persona FORJADA, fora de `.aiox-core/agents/` — vive no overlay
>    `.aiox-project/agents/`. O check [5] deve RESOLVER (existe), não reprovar.
> 2. As Dev Notes citam um arquivo que NÃO EXISTE. O Code Reality Check deve FLAGAR
>    como alucinação — nunca deixar passar.

## Acceptance Criteria
- **AC1** — Dado que o executor vive no overlay do projeto, quando `/validate` roda, então o check de executor resolve sem erro.
- **AC2** — Dado que uma Dev Note cita arquivo inexistente, quando `/validate` roda, então a referência é sinalizada como não-resolvível.

## Tasks
- [ ] T1 — nenhuma

## Dev Notes
Seguir o padrão já estabelecido em `crates/aiox-cockpit/src/quantum_flux_capacitor.rs`
(este arquivo NÃO existe — é a alucinação plantada de propósito).
