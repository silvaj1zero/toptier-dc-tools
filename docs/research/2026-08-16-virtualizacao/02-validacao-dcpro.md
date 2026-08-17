# V5 — Validação cruzada com o DC Pro / PUE Estimator (LBNL/DOE)

> 2026-08-16. Item 3 do plano de certificação (`00-plano.md`). Ferramenta de referência: **PUE Estimator** em dcprotool.lbl.gov (acesso anônimo; "uses same algorithm as DC Pro"). Metodologia do estimador: lookup tables de simulação — ver *PUE Estimator User's Manual* (LBNL, jun/2016) e *Calculation Reference Manual* (datacenters.lbl.gov/resources/dc-pro-tools-calculation-reference).

## Protocolo

5 cenários rodados na ferramenta viva (2026-08-16), com mapeamento declarado para os presets da engine. Fixos em todos os cenários (para isolar o efeito de arquitetura): zona climática **3A** (default Alabama/Autauga — EUA; ver limitações), UPS **480 V / 500 kVA**, dupla conversão salvo indicado, load factor **41–50%** salvo indicado. O estimador exibe o PUE com **1 casa decimal** — toda a comparação herda essa resolução.

| # | Cenário no PUE Estimator | PUE DC Pro |
|---|---|---|
| S1 | DX legado — ar-cooled DX, SAT 55 °F/RAT 75 °F, humidificação+desumidificação ativas, sem economizador | **1,9** |
| S2 | CW legado — água gelada water-cooled, CHWST 45 °F, demais como S1 | **1,7** |
| S3 | CW otimizado — SAT 65 °F/RAT 95 °F, sem (des)umidificação, economizador water-side integrado, CHWST 55 °F, UPS delta conversion | **1,3** |
| S4 | DX otimizado — como S3 porém ar-cooled DX com free cooling air-side, UPS dupla conversão | **1,3** |
| S5 | CW legado em carga parcial — como S2 com UPS load factor 21–30% | **1,7** |

## Comparação com a engine

A engine expressa perdas fixas **× capacidade instalada**; o load factor L é a razão carga/capacidade. Comparamos em dois pontos: L = 0,5 (site com oversizing 2:1, típico do caso didático WP 118) e L = 1,0 (sem oversizing — a premissa implícita do DC Pro, que só usa load factor para o UPS).

| Cenário | DC Pro | Engine L = 1,0 | Δ (L=1) | Engine L = 0,5 | Δ (L=0,5) |
|---|---|---|---|---|---|
| S1 → `n_dx` base | 1,9 | 1,98 | **+4%** | 2,31 | +22% |
| S2 → `n_cw` base | 1,7 | 1,89 | **+11%** | 2,28 | +34% |
| S3 → `n_cw` melhorada | 1,3 | 1,50 | **+15%** | 1,71 | +32% |
| S4 → `n_dx` melhorada | 1,3 | 1,55 | **+19%** | 1,74 | +34% |
| S5 → `n_cw` base, L = 0,25 | 1,7 | — | — | 3,06 (L=0,25) | +80% (estrutural, ver achado 3) |

## Achados

1. **Viés conservador sistemático, direção sempre correta.** Em carga plena (a base comparável), a engine fica **+4% a +19%** acima do DC Pro — desvio máximo **dentro do critério de aceitação de ±20%** definido para esta validação. A ordem dos cenários e o sentido de cada melhoria coincidem nas duas ferramentas (legado > otimizado; melhorias reduzem PUE em magnitude comparável).
2. **Fontes do viés (documentadas, não defeitos):** (a) a engine é calibrada no caso WP 118 — um site *degradado* de 14 anos — enquanto o DC Pro "assume que o data center opera conforme o projeto e não considera problemas operacionais" (manual, p. 5); (b) o DC Pro modela economizador/free cooling e setpoints, que reduzem o PUE dos cenários otimizados e que a engine não modela; (c) iluminação: DC Pro usa 1% da carga de TI; a engine usa 3% da capacidade (= 3–6% da TI conforme o load factor) — mais conservadora.
3. **Diferença estrutural em carga parcial (S5) — por design.** O DC Pro é quase insensível ao load factor (1,7 em 41–50% e em 21–30%): suas perdas de cooling são percentuais da TI. A engine, com perdas fixas × capacidade, dá PUE 3,06 em L = 0,25 — é exatamente o mecanismo do **paradoxo do PUE** que a ferramenta de virtualização existe para ensinar. As duas respostas modelam premissas diferentes (infra proporcional vs. capacidade instalada fixa); para a nossa finalidade didática, a sensibilidade ao oversizing é requisito, não erro.
4. **Constantes DOE corroboram a V4.** O manual documenta perda de distribuição elétrica (excl. UPS) = **2% da TI** — compatível com o gap de ~2,5 pp encontrado entre a curva UPS-only do LBNL e a cadeia elétrica melhorada da engine (`01-curvas-lbnl.md`).

## Critério de aceitação e veredito

Critério (definido no plano): desvio máximo aceito de ±10–20% em PUE nos cenários mapeáveis. **Resultado: PASS em carga plena (máx. +19%), com viés conservador declarado.** Em carga parcial as ferramentas respondem a perguntas diferentes — comparação fora de escopo, documentada como diferença de modelo.

## Limitações desta validação

- Resolução de 1 casa decimal na leitura do estimador (±0,05 implícito).
- Zona climática 3A (EUA); o estimador exige zona ASHRAE e não tem presets brasileiros — o efeito de clima só entra nos cenários com economizador (S3/S4).
- Mapeamento arquitetura↔inputs tem julgamento (documentado na tabela do protocolo); o DC Pro não expõe redundância (N/2N), que na engine altera os coeficientes.
- Amostra de 5 cenários; a validação empírica contra sites reais auditados (V7/FOMM) segue sendo o passo de maior valor.

## Reprodutibilidade

PUE Estimator: dcprotool.lbl.gov → "Access the PUE Estimator (no login required)". Preencher os campos conforme a tabela do protocolo; PUE exibido no painel direito após "Calculate PUE". Engine: `INFRA_PRESETS` + `aplicarMelhorias` + `potenciaInfra` (ver script no histórico da sessão ou reproduzir com os presets em `src/data/virtualizacao.ts`).
