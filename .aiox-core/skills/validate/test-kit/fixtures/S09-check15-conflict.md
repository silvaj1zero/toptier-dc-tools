---
story_id: "TESTKIT.W1.9"
title: "Cenário S09 — check [15] contra a base real"
epic: "TESTKIT"
status: Draft
executor: "@dev"
quality_gate: "@qa"
appetite: 3d
hill_phase: figuring_out
confidence_level: know-how
task_mode: EXECUTAR
entity_input: null
entity_output: null
deploy_type: none
involves_ui: false
requires_real_display: false
parent_epic: ".aiox-core/skills/validate/test-kit/fixtures/EPIC-TESTKIT.md"
---

# S09 — check [15] contra a base real

> **Este cenário NÃO tem veredito esperado, de propósito.**
>
> O check [15] exige `entity_input` + `entity_output` quando `task_mode ∈ {CRIAR, EXECUTAR}`, com
> `status_expected` diferentes (uma transição real). Esta fixture tem `task_mode: EXECUTAR` com
> ambos `null` — exatamente o formato que **as stories de produção deste repo usam universalmente**.
>
> Ou seja: **a base real viola o check**. Uma leitura literal reprova toda a base; uma leitura
> tolerante torna o check [15] letra morta para stories de código.
>
> **O cenário existe para MEDIR, não para arbitrar.** Registre o que cada par fez — NO-GO literal,
> GO tolerante, ou GO condicional com VC — e trate a divergência entre pares como dado, não como
> falha de nenhum deles. A resolução (o check está mal-especificado para stories de código, ou a base
> está irregular?) é decisão humana, fora do alcance do kit.
>
> **Proveniência:** finding **F-16**, run `20260725-162352`. O par claude reportou que desempatou a
> inferência de `task_mode` do cenário S02 justamente olhando a base real — e concluiu que
> `docs/epics/001-*/stories/*.md` usam `EXECUTAR` com `entity_*: null` de forma consistente.

## Acceptance Criteria
- **AC1** — Dado que `task_mode` é `EXECUTAR` e os campos de entidade são nulos, quando `/validate` roda, então o comportamento observado é registrado sem juízo de valor.

## Tasks
- [ ] T1 — nenhuma

## Dev Notes
Fixture de medição de conflito. Não corrigir a fixture para "passar" — corrigi-la destruiria o cenário.
