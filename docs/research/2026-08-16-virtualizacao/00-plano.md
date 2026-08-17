# Plano — Calculadora de Virtualização (Ferramenta 3 da suíte)

> 2026-08-16. Incorporação da Calculadora de Economia de Energia por Virtualização, conforme definido no diálogo claude.ai "Calculadora de eficiência energética em data centers" (chat 6f7ee6fb, 2026-08-15/16). Reconstrução didática do TradeOff Tool descontinuado da Schneider. Implementação de referência capturada em `referencia-artefato-claude.jsx`.

## Por que agora (e por que ela fura a fila do roadmap)

1. **A ferramenta original da Schneider foi descontinuada.** A Parte II do Estudo de Caso do MBA (questões 11–15) e o slide 15 do deck hands-on R3 dependem dela — o link pode morrer a qualquer momento. A calculadora própria elimina esse risco e completa a substituição das ferramentas de terceiros (42U ✓, LBL ✓, Schneider → esta).
2. **A engine já existe e foi validada.** O diálogo produziu um artefato React que reproduz o caso de referência do White Paper 118 (1.000 kW, 500 kW TI, 750 servidores, 50% virtualizáveis, 10:1, todas as melhorias): 750→413 servidores, 250→~156 kW, TI 500→~406 kW, PUE 2,28→~1,72, conta ~$1,2M→~$735k. Erro < 2%.
3. **Não existe clone open-source** (pesquisa do diálogo) — a ferramenta vira ativo exclusivo, e nenhuma concorrente modela o **paradoxo do PUE** (consolidar TI sem right-sizing piora o PUE).

## Decisões herdadas do diálogo (mini-ADR)

| # | Decisão | Racional |
|---|---|---|
| D1 | Curve fit exato `P_host = P_servidor × N_VMs^0.38837` | Publicado pela própria SE (blog Wendy Torell/DCSC, 2013; WP 118), derivado de SPECpower + Google WSC + Sine Nomine. Fidelidade ao original, licença limpa. |
| D2 | Infra = modelo de componentes (perdas fixas × capacidade + proporcionais × carga), coeficientes **calibrados** no caso de referência | A SE nunca publicou os coeficientes; estrutura segue WP 158/DOE. Calibração ≠ engenharia reversa. Reproduz o paradoxo do PUE. |
| D3 | Premissas expostas na UI + disclaimer didático | Princípio nº 1 da suíte (transparência metodológica). Uso seguro em sala. |
| D4 | Extras sobre o original: seletor de moeda e 4 arquiteturas (N/N+1/2N água gelada, N DX) | Contexto BR + valor didático. |
| D5 | Confiabilidade declarada por bloco | Bloco 1 consolidação: **ALTA** (fonte primária, mas curve fit ~2010-13 — servidores modernos economizam menos). Bloco 2 infra: **MÉDIA** (estrutura referenciada, coeficientes calibrados em 1 ponto). Bloco 3 racks/melhorias (×0,42, ×0,57, −5%): **BAIXA** (plausíveis, não medidas). |

## Incorporação no toptier-dc-tools (Fase A — port)

Seguindo a arquitetura da suíte (client-side, funções puras testadas, dado com fonte):

| Item | Destino | Nota |
|---|---|---|
| Engine | `src/lib/virtualization.ts` | Port das funções `coefsComMelhorias`, `potenciaInfra` e do pipeline pré/pós como **funções puras** (padrão `calc.ts`). Tipos explícitos, sem estado. |
| Constantes | `src/data/virtualizacao.ts` | `EXP = 0.38837`, presets `INFRA`, fatores das melhorias, premissas de rack — **cada valor com fonte + nível de evidência (alta/média/baixa)**, estendendo o princípio "nada inventado" para "nada sem classificação de evidência". |
| Regression test | `src/lib/virtualization.test.ts` | Caso de referência WP 118 travado (item 4 do plano de certificação): servidores, kW, PUE e conta pré/pós com tolerância ±2%. Mais: paradoxo do PUE (consolidar sem right-sizing ⇒ PUE sobe), monotonicidade do ratio, `loadRatio` limites. |
| Página | `src/pages/calculadora-virtualizacao.astro` + `src/components/VirtualizationCalculator.tsx` | UI reescrita no design system da suíte (global.css, `fields.tsx`), **não** o Tailwind do artefato. |
| Tarifa | Reutilizar o seletor BR existente (presets ANEEL + bandeiras + custom) | Substitui o input simples $/R$ do artefato; manter opção USD custom (o Estudo de Caso Parte II usa USD 0.15). |
| Gráfico | Breakdown pré/pós (DC total, infra, TI, servidores) | Artefato usa recharts (dependência nova). Preferir SVG próprio no padrão do `PueGauge` (barra dupla é simples); decidir no develop. |
| i18n | `pt.ts` + `en.ts` (bloco `virtualization`) | Mesma forma dos blocos existentes. |
| Metodologia | Seção nova em `/metodologia/` | Fórmula do curve fit, modelo de componentes, tabela de coeficientes com nível de evidência, limitação do curve fit (~2010-13), fontes (WP 118, WP 158, blog SE, SPECpower, Google WSC, Sine Nomine). |
| Home + README | Card da 3ª ferramenta; linha na tabela do README ("Substitui: Schneider TradeOff Virtualization, descontinuada") | — |
| Lead/print | `LeadForm` + botão Imprimir/PDF | Igual às outras páginas. |

## Certificação (Fase B — plano do diálogo, em ordem)

1. **Testes de regressão + rastreabilidade** *(entra já na Fase A)* — cada coeficiente comentado com fonte + página; suite travando o caso de referência.
2. **Curvas LBNL** — extrair curvas de eficiência de UPS/PDU/transformador do *Electrical Power Chain Tool* (Excel v2.1, 2020, fórmulas abertas) e substituir os coeficientes elétricos calibrados ⇒ Bloco 2 sobe de "calibrado" para "referenciado DOE". Análogo: *Air Management Tool* para cooling.
3. **Validação cruzada multi-ponto** — 5–10 cenários no DC Pro/PUE Estimator (LBNL) vs. a engine; documentar desvio máximo aceito (ex.: ±10%) na página de metodologia.
4. **Validação empírica FOMM (ativo exclusivo TTI)** — rodar contra 10–15 sites auditados anonimizados (PUE medido, carga, arquitetura, ano); publicar erro médio ⇒ selo "modelo validado contra N sites auditados no Brasil".
5. **Disclaimer com escopo de validade** — faixa de carga/porte/arquitetura validada; fora dela, extrapolação.

## Impacto no material do MBA (Fase C)

- **Estudo de Caso**: com a ferramenta publicada e validada (Fases A + B1), migrar a Parte II da Schneider para a ferramenta própria ⇒ **R4** do estudo de caso. Recalcular gabarito das questões 11–15 com a engine (determinístico — hoje o gabarito Dória depende da tela da Schneider).
- **Deck hands-on**: atualizar slides 15–16 (Schneider deixa de ser necessária; a narrativa "medir ≠ modelar" permanece, agora 100% Top Tier).
- **Bônus didático**: o paradoxo do PUE vira exercício próprio (consolidar sem right-sizing e ver o PUE piorar na tela).

## Sequência sugerida (stories)

| # | Story | Depende de | Status |
|---|---|---|---|
| V1 | Engine + dados + regression tests (`lib` + `data`) | — | ✅ 2026-08-16 (35 testes, commit `2097e0b`) |
| V2 | Página + componente UI + i18n + metodologia | V1 | ✅ 2026-08-16 |
| V3 | Home/README/SEO + deploy | V2 | ✅ 2026-08-16 (produção verificada) |
| V4 | Curvas LBNL nos coeficientes elétricos (cert. item 2) | V1 | ✅ 2026-08-16 — curva extraída e publicada como bound (não substitui coeficientes: preservaria o gabarito R4; re-baseline = V4b major). Ver `01-curvas-lbnl.md` |
| V5 | Validação cruzada DC Pro documentada (cert. item 3) | V1 | ✅ 2026-08-16 — 5 cenários, PASS ±20% em carga plena, viés conservador declarado. Ver `02-validacao-dcpro.md` |
| V6 | Estudo de Caso R4 + deck atualizado (Parte II → Top Tier) | V3 | ✅ 2026-08-16 (deck R4 + caso R4 + gabarito determinístico em `clients/mba-brpos/07-eficiencia-energetica/`) |
| V7 | Validação FOMM + selo (cert. item 4) | V3, dados de campo TTI | pendente |

## Riscos e ressalvas

- **Curve fit datado**: expoente 0.38837 é da era 2010-13; servidores pós-2019 têm proporcionalidade energética melhor ⇒ a economia por consolidação tende a ser **superestimada** hoje. Mitigação: declarar na UI (D5) e, na evolução, oferecer expoente alternativo derivado de SPECpower recente (exige pesquisa própria — não inventar).
- **Coeficientes Bloco 3** (melhorias ×0,42/×0,57/−5%) são os mais fracos — não prometer acurácia; classificar como BAIXA na UI até B2/B4.
- **recharts**: adicionar dependência só se o SVG próprio ficar caro; manter bundle enxuto (site estático).

## Fontes (rastreabilidade)

- Blog Schneider Electric / Wendy Torell (DCSC, 2013) — curve fit N^0.38837 e modelo da ferramenta.
- APC/SE White Paper 118 — *Virtualization and Cloud Computing: Optimized Power, Cooling, and Management Maximizes Benefits* (caso de referência 1 MW, premissas das melhorias).
- APC/SE White Paper 158 — metodologia de perdas fixas/proporcionais.
- LBNL/DOE — *Electrical Power Chain Tool* (Excel v2.1, 2020), *DC Pro / PUE Estimator*, *Air Management Tool* (datacenters.lbl.gov/tools).
- SPEC.org SPECpower; Google — *Power Provisioning for a Warehouse-sized Computer*; Sine Nomine Associates.
- GitHub `nuoaleon/Data-center-PUE-prediction-tool` (referência acadêmica, journal Energy 2020).
- Diálogo de origem: claude.ai chat 6f7ee6fb-8516-47e1-af41-ac569aa44a29 (artefato em `referencia-artefato-claude.jsx`).
