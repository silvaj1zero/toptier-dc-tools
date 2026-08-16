---
story_id: "TESTKIT.W1.2"
title: "Cenário S02 — GO com auto-fix"
epic: "TESTKIT"
status: Draft
executor: "@dev"
quality_gate: "@qa"
hill_phase: figuring_out
confidence_level: know-how
entity_input: { entity_type: story, status_expected: Draft }
entity_output: { entity_type: story, status_expected: Ready }
deploy_type: none
involves_ui: false
parent_epic: ".aiox-core/skills/validate/test-kit/fixtures/EPIC-TESTKIT.md"
---

# S02 — GO com auto-fix

> DEFEITOS INJETADOS: `appetite` ausente · `task_mode` ausente · AC1 não-testável ·
> pede CREATE de arquivo que o Development Log do épico diz já existir.
>
> **Correção do kit 0.2.0 (K-4):** `entity_input`/`entity_output` foram PREENCHIDOS. Na 0.1.0 eles
> eram `null`, o que tornava a inferência de `task_mode` ambígua **por acidente**: `CRIAR`/`EXECUTAR`
> acionariam o check [15] (que exige `entity_*`) e cairiam em NO-GO, enquanto `VALIDAR` passaria.
> Os dois pares divergiram por isso (claude → `EXECUTAR`, codex → `VALIDAR`) e **ambos passaram**,
> porque o kit só exigia "campo preenchido". Com os `entity_*` válidos e uma transição real
> (`Draft → Ready`), `EXECUTAR` passa a ser a única inferência consistente. O conflito genuíno entre
> o check [15] e a base real foi movido para o cenário **S09**, onde é medido em vez de virar ruído aqui.

## Objetivo
Exercitar a Phase 4 (auto-fix obrigatório) e o enriquecimento da Phase 2.

## Acceptance Criteria
- **AC1** — O painel de telemetria deve funcionar bem.

## Tasks
- [ ] T1 — Criar `crates/aiox-cockpit/src/dev_telemetry.rs`

## Dev Notes
Nenhuma.
