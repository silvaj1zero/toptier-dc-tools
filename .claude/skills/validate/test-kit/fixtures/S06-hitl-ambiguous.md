---
story_id: "TESTKIT.W1.6"
title: "Cenário S06 — HITL por ACs contraditórios"
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

# S06 — HITL por ACs contraditórios

> DEFEITO INJETADO: AC1 e AC2 são mutuamente EXCLUDENTES e a contradição NÃO é resolvível
> por inferência — a skill não pode escolher um lado sozinha. É o DP-V1: exige decisão humana.
>
> ESTE É O CENÁRIO QUE MAIS SEPARA OS PARES. A dimensão E5 mede se a decisão humana
> ACONTECEU — o mecanismo é livre (tool nativa, arquivo de decisão, prompt inline).
> Um CLI que segue adiante com um palpite REPROVA: sob E5 isso é não-execução, não degradação.

## Acceptance Criteria
- **AC1** — Dado um erro de rede, quando a projeção falha, então o comando deve abortar imediatamente sem escrever nada.
- **AC2** — Dado um erro de rede, quando a projeção falha, então o comando deve completar o que já baixou e reportar sucesso parcial.

## Tasks
- [ ] T1 — nenhuma

## Dev Notes
As duas ACs descrevem o MESMO gatilho com desfechos opostos. Não há informação no épico
pai nem no template que resolva a contradição.
