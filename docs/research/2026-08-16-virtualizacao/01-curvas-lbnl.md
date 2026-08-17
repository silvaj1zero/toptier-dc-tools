# V4 — Curvas do LBNL Electrical Power Chain Tool (extração e análise)

> 2026-08-16. Item 2 do plano de certificação (`00-plano.md`). Fonte: **Power Chain Tool v2.1** (LBNL/DOE, março/2020), baixado de datacenters.lbl.gov — cópia em `power-chain-tool-v2.1-lbnl.xlsx` (não versionar em repo público se a licença exigir; hoje o repo é privado).

## O que foi extraído

**Table F (aba `UPS_data`)** — curvas de eficiência de 3 UPS reais de dupla conversão, 480 V, 500–600 kW, "modernos e relativamente eficientes" (definição do próprio tool), com fonte primária por modelo (spec guides da Schneider):

| Load factor | 0,1 | 0,2 | 0,25 | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,75 | 0,8 | 0,9 | 1,0 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Galaxy VX (2017) | 0,900 | 0,950 | 0,958 | 0,9605 | 0,963 | 0,964 | 0,9635 | 0,9625 | 0,962 | 0,9615 | 0,961 | 0,961 |
| Symmetra PX (2016) | 0,925 | 0,950 | 0,955 | 0,958 | 0,961 | 0,963 | 0,9637 | 0,9641 | 0,964 | 0,9637 | 0,9632 | 0,963 |
| Symmetra MW (2014) | 0,870 | 0,927 | 0,941 | 0,950 | 0,9594 | 0,963 | 0,9659 | 0,9683 | 0,969 | 0,9695 | 0,970 | 0,970 |
| **MÉDIA (UPS típico)** | **0,8983** | **0,9423** | **0,9513** | **0,9562** | **0,9611** | **0,9633** | **0,9644** | **0,9650** | **0,9650** | **0,9649** | **0,9647** | **0,9647** |

Nota metodológica do próprio tool: os documentos-fonte publicam eficiência em 25/50/75/100%; os demais pontos foram lidos dos gráficos ou suavizados. Valores fora de eco-mode.

## Conversão para o modelo de componentes da engine

Perdas do UPS como fração da **capacidade**: `perdas(L)/C = L × (1/η(L) − 1)`. Ajuste linear sobre a curva média (L = 0,1–1,0):

```
perdas_UPS/C = 0,00581 + 0,02908 × L      (resíduo máx. 0,26 pp da capacidade)
```

Ou seja: um UPS moderno de dupla conversão ≈ **0,58% de perda fixa + 2,91% proporcional**.

## Comparação com a engine (`src/data/virtualizacao.ts`)

| Cadeia elétrica | Modelo (fração da capacidade) | Em L = 0,5 |
|---|---|---|
| **LBNL — só o UPS moderno** | 0,0058 + 0,0291·L | 2,03% |
| **Engine — cadeia melhorada** (base N × fatores UPS alta ef.: 0,0252 + 0,04·L) | 0,0252 + 0,0400·L | 4,52% |
| **Engine — cadeia base N** (0,06 + 0,10·L) | 0,06 + 0,10·L | 11,0% |

**Leitura:**
1. **Consistência física ✓** — a cadeia melhorada da engine perde MAIS que o UPS sozinho (obrigatório: ela inclui PDU, transformador e distribuição). A diferença (~2,5 pp em L=0,5) é compatível com perdas típicas de PDU+trafo (2–3%).
2. **Base legada coerente ✓** — a cadeia base (calibrada para reproduzir o PUE 2,28 do caso WP 118, um DC de 14 anos) perde 3–5× o UPS moderno — exatamente o salto geracional que o retrofit explora.
3. A curva LBNL portanto **corrobora** os coeficientes calibrados como *bounds* (não os contradiz), sem ser derivação direta.

## Decisão de escopo (registrada)

**Não substituímos os coeficientes calibrados pela curva nesta rodada.** Substituir mudaria o PUE do caso de referência (2,28→1,72) e **invalidaria o gabarito determinístico do Estudo de Caso R4** (Parte II) publicado em 2026-08-16, além de quebrar a fidelidade didática ao modelo original do WP 118. O que a V4 entrega:

- A curva LBNL publicada como **dado citável na ferramenta** (`UPS_CURVA_LBNL` em `src/data/virtualizacao.ts`, evidência **alta**) e exposta na página de Metodologia.
- **Testes de bounds** na suite: cadeia melhorada ≥ perdas UPS-only LBNL e ≤ cadeia base, em toda a faixa de operação — a curva vira um trilho de sanidade permanente da engine.
- Re-baseline completo (engine "v2" com curvas LBNL como base e recalibração do caso legado) fica como **V4b**, major version, condicionada a nova rodada do estudo de caso (R5) — decisão do professor.

## Fontes

- LBNL/DOE — *Data Center Electrical Power Chain Tool* v2.1 (mar/2020), aba UPS_data (Table F), datacenters.lbl.gov/tools.
- Schneider Electric — spec guides Galaxy VX (MBPN-A7TE49), Symmetra PX (MBPN-9QECL6), Symmetra MW (MBPN-9N5KL3) — URLs registradas no próprio xlsx.
