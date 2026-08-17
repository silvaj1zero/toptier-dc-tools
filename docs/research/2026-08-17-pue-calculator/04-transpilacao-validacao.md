# Modelador de PUE — transpilação da planilha SE e validação

> 2026-08-17. Como a "Data Center Efficiency and PUE Calculator" (Schneider TradeOff Tool) foi reconstruída como réplica exata, e como foi validada.

## Descoberta central

A ferramenta viva em se.com é um dashboard **SAP Xcelsius exportado para HTML5**. Nesse formato, a planilha Excel que define o modelo (fórmulas + constantes) é servida ao navegador como JavaScript (`gen_*/cells_1.js`). Capturamos os 8 arquivos do app (1,18 MB) de dentro da própria página (fetch same-origin — o CDN bloqueia acesso direto) e os preservamos em `fonte-xcelsius/se-pue-calculator-fonte-xcelsius.txt`.

## Estrutura recuperada

- **10 abas**; as relevantes: `Device Losses` (tabelas de perdas por dispositivo — 422 células), `Power Meters` (motor de agregação — 538), `Crystal Interface` (bindings/saídas — 467), `Interface TXT` (textos, opções e tooltips — 319).
- **1.754 células, 1.047 fórmulas** no formato `new _C(row, col, cache[, formula])` — extraídas por parser próprio (`extrair-planilha.py` → `extraido/*.md`).
- **Modelo por dispositivo** (35 subsistemas nomeados): perdas **fixa / proporcional / quadrática** + fator de dimensionamento (× TI), conforme WP 113 — com os valores REAIS do tool (ex.: Legacy UPS 1,4× / 4% / 4,5% / 4%; chillers 5 variantes; CRAC/CRAH room vs in-row).

## Mapa UI → célula (confirmado pelos bindings `selectionDes`/`insertIn` do dashboard)

| Controle | Célula | Valores |
|---|---|---|
| Capacidade de TI | Power Meters!r1c1 | kW (fonte CI c0) |
| Custo/kWh | Interface TXT!r44c2 | número |
| Moeda | Crystal Interface!r1c52 | símbolo (display) |
| UPS System | Device Losses!r3c19 | 1..4 (Legacy/Typical/HighEff/None) |
| Power Redundancy | Device Losses!r3c13 | No/Yes |
| Cooling System | Device Losses!r5c13 | 1..3 (CW/DX-glycol/Air) |
| Chiller | Device Losses!r12c13 | 1..5 |
| Air Distribution | Device Losses!r7c13 | No/Yes (perimeter/close-coupled) |
| CRAC/CRAH Redundancy | Device Losses!r6c13 | 1..4 (N/N+1/2N/2(N+1)) |
| Heat Rejection Redundancy | Device Losses!r9c13 | No/Yes |
| Economizer (horas) | Crystal Interface!r26c1 | 0..8760 |
| Slider de carga | Power Meters!r5c1 | 0..1 |
| 13 checkboxes | DL r4c13, r7c19, r4c19, r5c19, r9c19, r5c25, r10c13, r8c13, r6c25, r8c25, r7c25, r3c25, r4c25 | No/Yes (r5c19: 1/2) |

Armadilha documentada: `Power Meters!r7c1`/`r32c1` (default 23) são **constantes internas** — não são as horas de economizador (setá-las desloca o modelo; o binding oficial vai em CI r26c1).

## Saídas

- Curva PUE × carga: `Crystal Interface!r3..103c42` (101 pontos; labels em c40).
- Alocação de energia (Power/Cooling/IT/Other): CI r100..103 c1 (energia) e c4 (custo).
- Breakdowns: cadeia elétrica CI r55..59, climatização CI r60..65 (c1 energia, c6 custo).
- Assumptions: Device Losses r74..103 c0..c4.

## Pipeline de build

`gerar-ts.py` transpila `cells_1.js` → `src/lib/pue-model/modelo-se.gen.ts` **podado** à clausura de dependências das saídas (1.347 células; 74 KB). `avaliador.ts` executa o grafo (26 funções Excel/Xcelsius, memoização); `api.ts` é a façade tipada (`ProjectScenario` → curva/alocações/custo/assumptions).

## Validação

1. **Default vs. ferramenta viva (2026-08-17):** réplica 2,1759 @50% — tool exibe "PUE is 2.18, annual electricity cost of $1,140,000" (nosso custo: $1.143.674; o tool arredonda). Alocação idêntica: Power 11,3% / Cooling 40,4% / IT 46,0% / Other 2,4%. Breakdown elétrico (UPS 8,07% / PDU 2,57% / …) igual ao gráfico.
2. **Auto-consistência:** avaliar as 1.047 fórmulas reproduz o cache embutido do dashboard nas células não-runtime.
3. **Física (suite de testes):** DX > CW em PUE; redundância piora PUE; economizador melhora com horas; cada checkbox de eficiência isolada nunca piora; PUE independe da capacidade (modelo normalizado); curva monotônica decrescente 5–100%.
4. **Locks de regressão:** 13 testes em `src/lib/pue-model.test.ts`.

### Bateria de variações contra a ferramenta viva (2026-08-17, janela visível) — CONCLUÍDA

Método: escrita direta nas células de input do runtime vivo (`cell.value()` + `CalculateAllDirtyCells()` — o mesmo caminho dos bindings) e leitura de `Crystal Interface!r53c42` (PUE @50%). **10/10 variações com match exato (≥7 casas decimais):**

| Variação | Ferramenta viva | Réplica |
|---|---|---|
| Default | 2,175940305 | 2,1759… ✓ |
| Cooling DX-glycol | 2,772821027 | 2,7728… ✓ |
| Cooling air-cooled | 2,415917450 | 2,4159… ✓ |
| UPS high efficiency | 2,024523125 | 2,0245… ✓ |
| Dual power path | 2,359481696 | 2,3595… ✓ |
| CRAC 2N | 2,648928696 | 2,6489… ✓ |
| Economizador 4000 h | 1,997130530 | 1,9971… ✓ |
| Blanking+Coordinated+VFD CW | 2,089405916 | 2,0894… ✓ |
| Close-coupled | 1,782748296 | 1,7827… ✓ |
| Chiller VFD tower | 2,027821456 | 2,0278… ✓ |
| Capacidade 400 kW | 2,175940305 (invariante) | 2,1759… ✓ |

Notas de mecânica descobertas na bateria:
1. **Economizador:** escrever direto em CI r26c1 no runtime vivo não propaga (listener lazy); via CI r25c1 (fração horas/8760) o efeito é idêntico ao da réplica — caminho do modelo: perdas do chiller × (1 − horas/8760), confirmado nas fórmulas PM r22c12-14.
2. **A curva depende fracamente do load do marker** (ex.: r33c42 com marker em 50% = 2,7826 vs 2,7809 com marker em 30%) — a réplica seta o load antes de ler (semântica do usuário arrastando o marker), igual ao comportamento interativo do tool.

## Fontes

- Captura do app: se.com TradeOff Tools (2026-08-17) — `fonte-xcelsius/`.
- APC/SE WP 113 (modelo de perdas 3 componentes), WP 154, WP 158 — `R1-white-papers-se.md` (+PDFs).
- LBNL/DOE DC Pro Calculation Reference Manual — `R3-referencias-tecnicas.md`.
- Wayback/histórico — `R2-wayback.md`.
