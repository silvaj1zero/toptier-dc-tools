# Goal-loop de validação massiva — Modelador de PUE vs. ferramenta original

> 2026-08-17. Diretriz do operador: comparar sistematicamente a ferramenta original (SE PUE Calculator viva) e a réplica, com resultados simulados, orquestração/subagentes, parada somente com consistência ≥ 98%, usando o print de teste do operador como âncora, sem aceitar variações não justificadas.

## Âncora — o print do operador (`TESTE DO MODELADOR DE pue.pdf`, 17/08 03:45)

| Item do print | Valor no print | Reprodução na engine |
|---|---|---|
| Cenário A: PUE @25% | 3,09 | 3,0858 → exibido "3,09" ✓ |
| Cenário A: potência total | 771 kW | 771,4 kW ✓ |
| Cenário A: custo anual (R$ 0,15/kWh) | **R$ 1.013.670** | **R$ 1.013.670 — EXATO ao real** ✓ |
| Cenário B: PUE @25% / potência / custo | 1,47 / 369 kW / R$ 484.452 | Região reproduzível (PUE 1,4744–1,4756 em 3 configs candidatas); a config exata é degenerada no arredondamento de 2 casas do print — 2 candidatas incluídas na bateria abaixo |

Conclusão da âncora: o Cenário A identifica-se como o default com custo 0,15 — reprodução exata até o real; o print é consistente com a engine publicada.

## Protocolo da bateria massiva

- **Amostra determinística** (seed 98211747, `goal-loop/gerar-amostra.ts`): 24 cantos fatoriais (4 UPS × 3 coolings × detalhes off/on) + 2 candidatas do Cenário B do print + 96 cenários aleatórios uniformes sobre todos os eixos (UPS, dual power, cooling, 5 chillers, distribuição de ar, 4 redundâncias CRAC, heat rejection, 11 níveis de economizador, 2¹³ subconjuntos de detalhes) = **122 cenários**.
- **5 cargas por cenário** (10/25/50/75/100%) lidas da curva com **marker fixo em 50%** nos dois lados (elimina a dependência fraca curva↔marker documentada em `04-…`): **610 pontos pareados**.
- **Original**: execução no runtime vivo da SE por escrita nas células de input (`cell.value()` + `CalculateAllDirtyCells()` — o mesmo caminho interno dos bindings da UI), leitura de `Crystal Interface!r3+load,c42` com 9 casas.
- **Réplica**: engine `src/lib/pue-model` offline.
- **Critérios**: match exato = |Δ| relativo ≤ 1e-6; correspondência para a meta = ≤ 1e-4; acima disso, divergência a justificar individualmente.

## Resultados

**Rodada 1 (bruta):** 610 pontos → 605 exatos (**99,18%**), 5 divergentes — todos no mesmo cenário (`canto-typical-dxGlycol-detoff`), e o arquivo de observação tinha 123 linhas para 122 cenários.

**Análise da divergência (obrigatória pelo protocolo):** um runner assíncrono da instrumentação ficara suspenso pelo throttling de aba em background do Chrome e, ao acordar, regravou o id do cenário 8 com o estado *final* da planilha. **Prova:** os 5 valores da linha duplicada são idênticos dígito a dígito ao esperado do último cenário da bateria (`rnd-95`: 3,660543927, 2,116632624, 1,608441168, 1,444415387, 1,366431024), enquanto a 1ª ocorrência do id (medição do fluxo síncrono) bate exata com o esperado (8,451141498…). Artefato de instrumentação, não divergência de modelo — linha descartada com registro.

**Resultado final (dados limpos): 610/610 pontos em match EXATO (≤1e-6 relativo) = 100,00%. Meta ≥98%: PASS — encerrando o loop na rodada 1.**

## Orquestração empregada

- Fable (maestro + harness determinístico); engine offline via vite-node; execução no original via canal de células no Chrome (processamento síncrono em fatias — o runner assíncrono foi abandonado após o throttling, ver artefato acima).
- **Auditoria independente multi-engine** do protocolo e do descarte: codex (exec read-only) e gemini (headless) — vereditos anexados abaixo quando concluídos.

## Arquivos

`goal-loop/`: `gerar-amostra.ts` (amostra + gabarito) · `amostra.json` · `observado-rodada1.txt` (bruto, 123 linhas) · `observado-limpo.txt` (122) · `comparar.py` (estatística) · chunks/lotes de execução.

## Vereditos da auditoria independente (2026-08-17)

- **codex (OpenAI, exec read-only): APROVADO.** Ressalvas incorporadas como escopo declarado: a equivalência demonstrada é *numérica, nesta amostra e neste caminho de execução* (escrita direta nas células — não exercita a camada de UI/listeners do original); ameaças listadas: corrida entre runners (ocorreu e foi tratada com prova), espera fixa sem confirmação de estabilização, seed única, capacidade de TI fixa em 1000 kW na amostra (invariância de capacidade validada à parte na bateria de variações), cargas correlacionadas por cenário.
- **gemini (Google, headless): APROVADO.** Ressalva: recomenda rotina de reset explícito de estado entre cenários; reconhece que o `sets()` exaustivo (23 células por cenário, estado completo) cumpriu esse papel — corroborado pelo 100% nos dados limpos.

**Conclusão do goal-loop:** critério ≥98% excedido (100,00% exato em 610 pontos), única anomalia explicada com prova mecânica, dois auditores independentes aprovando o protocolo. A equivalência reivindicada é a do MOTOR DE CÁLCULO (o que a réplica promete); a fidelidade da camada de UI do original não é reivindicada nem necessária.
