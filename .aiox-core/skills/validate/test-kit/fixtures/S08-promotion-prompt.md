---
story_id: "TESTKIT.W1.8"
title: "Cenário S08 — HITL #2: prompt de promoção do learning"
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
involves_ui: false
requires_real_display: false
parent_epic: ".aiox-core/skills/validate/test-kit/fixtures/EPIC-TESTKIT.md"
---

# S08 — HITL #2: prompt de promoção do learning (Phase 0b)

> **O gatilho deste cenário NÃO está nesta story.** Ela é deliberadamente banal (passaria como
> `GO limpo`). O que se mede é a **Phase 0b**, que roda *antes* de tudo: quando existem entradas de
> learning em `status: draft` com `promotion_score` acima do threshold, a skill **pergunta ao humano**
> se deve promovê-las (`y` = todas · `n` = pular · `1,2` = seleção · `d` = adiar).
>
> **Por que este cenário existe (K-3):** a Phase 0b é o **segundo** ponto de decisão humana da skill, e
> o kit 0.1.0 não o exercitava — a KB não existe neste repo, então a fase degradava para WARN+continue
> em todos os cenários. Um par podia passar em E5 tendo implementado **apenas um** dos dois canais de
> decisão, e o kit não notaria.
>
> **Setup obrigatório antes de rodar** (ver `kit.yaml → scenarios[S08].setup_required`):
> criar ao menos uma entrada em `.aiox/learning/entries/validate/` com `status: draft` e
> `promotion_score` ≥ o threshold de `aiox.config.json → learning.promotion_thresholds`
> (default `pattern: 3.5`). Sem esse setup, o cenário degrada para WARN e **não mede nada** — registre
> como `not_measurable`, nunca como PASS.

## Acceptance Criteria
- **AC1** — Dado que existe uma entrada de learning promovível, quando `/validate` roda, então o humano é consultado antes de qualquer promoção.
- **AC2** — Dado que o humano responde `n` (pular), quando a validação continua, então nenhuma entrada é promovida e nenhuma é apagada.

## Tasks
- [ ] T1 — nenhuma

## Dev Notes
Fixture do test-kit. A story em si é irrelevante — o objeto de medida é a Phase 0b.
