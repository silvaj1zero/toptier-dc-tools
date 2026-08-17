# R1 — White Papers Schneider Electric/APC: Modelo de Eficiência por Componentes (PUE Calculator)

Pesquisa para reconstrução do modelo por trás da "Data Center Efficiency and PUE Calculator"
(TradeOff Tool) da Schneider Electric/APC. Todo conteúdo abaixo foi extraído diretamente dos
PDFs originais (texto completo lido via parser de PDF, não resumo de terceiros). Nenhum valor
foi inventado — onde a fonte não apresenta um número, isso é declarado explicitamente como
"não encontrado".

PDFs baixados e salvos nesta pasta (`docs/research/2026-08-17-pue-calculator/`):

| Arquivo | Conteúdo |
|---|---|
| `WP113-Electrical-Efficiency-Modeling-R2.pdf` | WP 113, Revision 1 (2006) — mirror ETH Zürich |
| `WP113-Electrical-Efficiency-Modeling-Official-R2.pdf` | WP 113, Revision 2 (2012) — mirror oficial Schneider Electric |
| `WP154-Electrical-Efficiency-Measurement-R2.pdf` | WP 154, Revision 2 — mirror oficial Schneider Electric |
| `WP158-Guidance-PUE-R3.pdf` | WP 158, Revision 3 — mirror apc.com/salestools |

---

## 1. White Paper 113 — "Electrical Efficiency Modeling for Data Centers" / "Electrical Efficiency Modeling of Data Centers"

- **Título exato (Rev 1, 2006):** *Electrical Efficiency Modeling of Data Centers*
- **Título exato (Rev 2, 2012):** *Electrical Efficiency Modeling for Data Centers*
- **Número:** White Paper #113 (Rev 1) / White Paper 113 (Rev 2)
- **Autor:** Neil Rasmussen (fundador da APC; à época da Rev 1, CTO da American Power
  Conversion; à época da Rev 2, Senior VP of Innovation, Schneider Electric)
- **Editora:** American Power Conversion (Rev 1, © 2006) → Schneider Electric Data Center
  Science Center (Rev 2, © 2011/2012)
- **URLs (mirrors verificados nesta pesquisa):**
  - Rev 1: `https://www.biblioite.ethz.ch/downloads/nran-66ck3d_r1_en.pdf` (ETH Zürich)
  - Rev 1: `https://nikom.in/assets/pdf/41ee00b6-2961-4a35-9e60-1878dc50d3ac.pdf`
  - Rev 1: `http://media.comtec.com/pdf/apc/ElectricalEfficiencyModelling.pdf`
  - Rev 2 (oficial): `https://download.schneider-electric.com/files?p_Doc_Ref=SPD_NRAN-66CK3D_EN`
- **Confirmação de estabilidade dos dados:** a Tabela de coeficientes de perda (ver §1.3) é
  **idêntica byte-a-byte** entre a Revision 1 (2006) e a Revision 2 (2012) — os valores não
  mudaram em 6 anos de revisão do paper. Isto reforça que são os coeficientes de referência
  canônicos usados nos TradeOff Tools da época.

### 1.1 A definição central do modelo

> "Data center efficiency = IT load power / Total data center input power" (Rev 1, p.4)
>
> "Data center efficiency (PUE) = Total facility power / IT equipment power" (Rev 2, p.3) —
> a Rev 2 já usa a nomenclatura PUE (Power Usage Effectiveness) diretamente, refletindo a
> adoção do termo entre 2006–2012.

### 1.2 As "3 wrong assumptions" que o modelo corrige (Table 1, p.8/p.6)

| # | Suposição errada (modelos convencionais) | Realidade (modelo melhorado) |
|---|---|---|
| 1 | Eficiência de componentes de energia/refrigeração é constante e independente da carga de TI | Eficiência de componentes — especialmente UPS e CRAC — **cai significativamente em cargas baixas** |
| 2 | Componentes de energia/refrigeração operam perto da carga de projeto (design load) | Carga típica de TI é **significativamente menor** que a capacidade de projeto do DCPI/NCPI |
| 3 | O calor produzido por equipamentos de energia/refrigeração é insignificante | O calor gerado por esses equipamentos é **carga de refrigeração significativa** e deve ser incluído na análise de ineficiência do sistema de refrigeração |

> "As a result, data center electrical losses are routinely underestimated by a factor of
> two or even more." (WP113, p.8/p.6)

### 1.3 O modelo de 3 parâmetros por componente (núcleo do TradeOff Tool)

Cada componente de infraestrutura (NCPI/DCPI) é modelado com até **3 tipos de perda**,
cada um expresso como fração (%) da potência nominal (rated power) do componente:

1. **No-load loss** (também chamada fixed, shunt, tare ou parallel loss): perda constante,
   independente da carga — presente mesmo a carga zero (ex.: perdas de lógica de controle).
   "Loss percent **increases** with decrease of load" (em % da carga real).
2. **Proportional loss**: perda proporcional à carga. "Loss percent is **constant**
   (independent of load)."
3. **Square-law loss**: perda proporcional ao **quadrado** da carga. "Loss percent
   **decreases** with decrease of load."

Fórmula geral (reconstruída a partir da descrição textual do paper — o paper não escreve a
equação em notação matemática explícita, apenas descreve os 3 termos em prosa e tabela):

```
Loss(x) = NoLoad_frac  +  Proportional_frac * x  +  SquareLaw_frac * x²
```

onde `x` = fração da carga real em relação à carga nominal (rated) do componente
(0 ≤ x ≤ 1), e `Loss(x)` é a perda como fração da potência nominal do componente.
A "Total loss (single parameter)" na Tabela 2 é a soma das 3 frações **avaliada em x = 1**
(plena carga), ou seja, `NoLoad + Proportional + SquareLaw`, que é a "eficiência de placa"
(nameplate) tradicionalmente publicada por fabricantes — e que o paper demonstra ser
enganosa fora da plena carga.

### 1.4 TABELA 2 — Coeficientes de perda por componente (a tabela mais importante da pesquisa)

**Fonte: WP113, Table 2, "Typical electrical losses of NCPI [Rev1] / DCPI [Rev2] components
expressed as a fraction of full load component rating"** — Rev 1 p.11, Rev 2 p.9.
Valores **idênticos** nas duas revisões.

| Componente (NCPI/DCPI) | No-load loss | Proportional loss | Square-law loss | Total loss (single parameter, full load) |
|---|---|---|---|---|
| **UPS** | 4% | 5% | — | 9% |
| **PDU** | 1.5% | — | 1.5% | 3% |
| **Lighting** | 1% | — | — | 1% |
| **Wiring** | — | — | 1% | 1% |
| **Switchgear** | — | — | 0.5% | 0.5% |
| **Generator** | 0.3% | — | — | 0.3% |
| **CRAC** | 9% | 0% | — | 9% |
| **Humidifier** | 1% | 1% | — | 2% |
| **Chiller plant** | 6% | 26% | — | 32% |

Notas literais do paper sobre esta tabela (WP113 Rev2 p.9 / Rev1 p.11):

> "The typical UPS efficiency depicted in Figures 7 and 8 would not be accurately modeled by
> a single efficiency parameter, but has instead been appropriately modeled by the no-load
> (4%) and proportional loss (5%) parameters of Table 2."

Interpretação numérica confirmada no texto: um UPS com 4% no-load + 5% proportional loss,
a 100% de carga, tem eficiência de placa de **91%** (100% − 9%); a 10% de carga, a
eficiência cai para **60%** (dado explicitamente citado no texto: "at 10% load the same UPS
exhibits only 60% efficiency" — Rev1 p.10/Rev2 p.8). A curva completa de eficiência do UPS
por % de carga (Figure 8, ambas as revisões) é:

| Carga (% full power) | 0% | 10% | 20% | 30% | 40% | 50% | 60% | 70% | 80% | 90% | 100% |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Eficiência UPS | 0% | 60% | 75% | 80% | 84% | 86% | 88% | 89% | 90% | 90% | 91% |

**Chiller plant** é de longe o maior contribuinte de perda proporcional (26%) — muito maior
que qualquer outro componente — e também tem no-load loss relevante (6%), somando 32% de
perda total na placa. Isso é consistente com o gráfico de fluxo de potência (Figure 4) em
ambas revisões, onde o chiller domina o consumo não-TI.

**Não encontrado:** WP113 não fornece um breakdown numérico separado para *bombas*
(chilled water pumps, condenser water pumps) nem para *torre de resfriamento* como linhas
individuais na Tabela 2 — esses subsistemas aparecem apenas implicitamente dentro do
"Chiller plant" agregado (6% no-load / 26% proportional / 32% total). O WP158 lista bombas e
torre de resfriamento como subsistemas separados a serem contabilizados no PUE (ver §3), mas
**nenhum dos dois papers fornece coeficientes numéricos de no-load/proportional/square-law
para bombas ou torre isoladamente**. Da mesma forma, não há tabela separada para
transformador isolado (é mencionado no texto como parte da "power path" mas não aparece como
linha própria na Tabela 2 — está implícito dentro de UPS/PDU/Wiring) nem para STS (static
transfer switch).

### 1.5 Composição do PUE em função da carga (%load) — a curva do calculador

O modelo compõe a curva de PUE vs. carga através do seguinte fluxo operacional, descrito
literalmente (Rev2 p.11-12, Rev1 p.14):

1. Determinar o grau médio de **oversizing** (sobredimensionamento) de cada tipo de
   componente de energia/refrigeração, a partir de fatores de **derating**, **diversidade de
   carga** e **redundância**.
2. Determinar as perdas operacionais de cada tipo de componente usando: carga de entrada,
   fração da carga nominal do componente (calculada a partir do oversizing), no-load loss e
   proportional loss.
3. Determinar a perda proporcional adicional decorrente da necessidade do sistema de
   refrigeração resfriar o calor gerado pelos próprios equipamentos de energia/refrigeração
   dentro do data center (ciclo de realimentação: mais perda elétrica → mais carga térmica →
   mais consumo de refrigeração).
4. Somar todas as perdas.
5. Computar e tabular as perdas em função da carga de TI no data center.

> "A computer model based on these principles has been implemented to compute energy
> consumption in the [APC/Schneider Electric] Data Center TCO analysis methodology,
> described in White Paper 6, Determining Total Cost of Ownership for Data Center and
> Network Room Infrastructure." (WP113, confirmando que o motor de cálculo do TradeOff Tool
> de TCO/PUE se baseia nestes princípios).

**Fatores de sobredimensionamento (oversizing) citados no texto, com valores numéricos:**

| Fator | Valor citado | Fonte |
|---|---|---|
| Carga média de TI vs. capacidade de projeto | "average data center operates at 65% below the design value" (citando WP 37) | WP113 Rev2 p.10 / Rev1 p.12 |
| Derating recomendado (margem de segurança) | 10%–20% | WP113 Rev2 p.10 / Rev1 p.12 |
| Redundância 2N | carga de qualquer componente individual < 50% do valor de projeto | WP113 Rev2 p.10 / Rev1 p.12 |
| Oversizing de PDU por diversidade de carga | tipicamente 30%–100% | WP113 Rev2 p.11 / Rev1 p.13 |
| Variação de carga entre PDUs distintos em um mesmo DC | até fator de 2× | WP113 Rev2 p.10-11 / Rev1 p.12-13 |

### 1.6 Exemplo numérico de composição — breakdown de potência por subsistema

O paper apresenta (Figure 4) um diagrama de fluxo de potência para um data center-exemplo de
alta disponibilidade, dual power path, N+1 CRAC, a 30% da capacidade de projeto. Os dois
exemplos numéricos publicados nas duas revisões (usam premissas ligeiramente diferentes —
não são o mesmo data center):

**Rev 1 (2006), Figure 4 — DC a 30% de carga de TI, eficiência resultante = 30%:**

| Subsistema | % da potência total de entrada |
|---|---|
| Chiller | 33% |
| Humidifier | 3% |
| CRAC | 9% |
| **IT Equipment** | **30%** |
| PDU | 5% |
| UPS | 18% |
| Lighting | 1% |
| Main switchgear / Generator | 1% |
| **Total** | **100%** |

**Rev 2 (2012), Figure 4 — DC exemplo com PUE = 2.13 (IT = 47% da entrada):**

| Subsistema | % da potência total de entrada |
|---|---|
| Chiller | 23% |
| Humidifier | 3% |
| CRAC/CRAH | 15% |
| **IT Equipment** | **47%** |
| PDU | 3% |
| UPS | 6% |
| Lighting / aux devices | 2% |
| Switchgear / generator | 1% |
| **Total** | **100%** |

Estes dois breakdowns **não são a "tabela de coeficientes" em si** (essa é a Tabela 2, §1.4)
— são exemplos ilustrativos de saída do modelo aplicado a dois cenários de premissas
diferentes (o Rev1 usa oversizing/derating mais agressivo, resultando em PUE implícito de
~3.33 [100/30]; o Rev2 usa premissas que resultam em PUE = 2.13 explicitamente rotulado no
gráfico).

### 1.7 Curva de eficiência do data center vs. fração de carga (Figure 10)

- **Rev 1:** eixo Y em "Electrical Efficiency" (%), variando de ~0% (carga zero) a ~51% (100%
  de carga), com a observação: "A conventional estimate of efficiency of the data center
  described by Figure 10 would be a value of 60-70%, independent of load." — ou seja, o
  modelo convencional (single-parameter, nameplate) superestima a eficiência real do DC em
  ~2× nas cargas baixas.
- **Rev 2:** o mesmo gráfico é reapresentado em termos de **PUE** (não mais "efficiency %"),
  variando de PUE ≈ 6.0 a 10% de carga até PUE ≈ 1.8 a 100% de carga.
- Ponto numérico citado explicitamente: **a 10% da capacidade nominal, para cada 10 W de
  entrada apenas ~1 W chega ao equipamento de TI** (WP113, ambas revisões).

### 1.8 Impacto financeiro (Figure 11) — DC de 1 MW, US$0,10/kWh

- Custo elétrico anual total varia de **US$600.000 a US$1.700.000/ano**, dependendo da carga
  de TI (0% a 100% da capacidade).
- Mesmo com carga de TI **zero**, o custo é **> US$500.000/ano** — inteiramente devido a
  ineficiências dos sistemas de energia/refrigeração (no-load losses).
- **A 30% de utilização** (carga típica de DC segundo o paper), **> 70% dos custos elétricos
  são causados por ineficiências dos equipamentos de energia e refrigeração**, não pela carga
  de TI em si.

### 1.9 "Efficiency entitlement" — 3 alavancas de melhoria, com % de redução de perdas

(WP113, Rev2 p.14 / Rev1 p.17)

| Alavanca | Redução potencial de perdas |
|---|---|
| 1. Reduzir o sobredimensionamento (oversizing) via arquitetura modular escalável | **50%** |
| 2. Melhorar a eficiência dos sistemas de refrigeração | **30%** |
| 3. Reduzir as perdas no-load dos componentes de energia/refrigeração | **10%** |

Figure 12 (ambas revisões) ilustra a progressão de eficiência do data center: **30% → 35% →
70%**, correspondendo a "Do Nothing" → "Increase Efficiency of NCPI/DCPI Equipment by 10%" →
"Rightsize NCPI/DCPI" — confirmando que o rightsizing (alavanca #1) domina o ganho total.

Economia de custo estimada: **US$2.000.000 a US$4.000.000** ao longo de 10 anos de vida útil
para um data center típico de 1 MW.

### 1.10 Dispositivos com múltiplos modos de operação (ex.: economizer)

O modelo de 3 parâmetros **não** cobre dispositivos com múltiplos modos operacionais (ex.:
CRAC com modo "economizer" para clima frio). Para esses casos, o paper prescreve a técnica de
**"state-space averaging"**: determinar a fração de tempo em cada modo, gerar curvas de
eficiência separadas por modo, e computar uma curva "esperada" ponderada pelo tempo em cada
modo. **Não há coeficientes numéricos de exemplo** para o modo economizer no WP113 — o
tratamento é apenas metodológico/qualitativo. Os valores numéricos de comparação DX vs. água
gelada, ou os ganhos quantitativos do modo economizer, **não foram encontrados** no WP113.

---

## 2. White Paper 154 — "Electrical Efficiency Measurement for Data Centers"

- **Título exato:** *Electrical Efficiency Measurement for Data Centers*
- **Número:** White Paper 154, Revision 2
- **Autor:** Neil Rasmussen (Senior VP of Innovation, Schneider Electric)
- **URL (oficial, verificado):**
  `https://download.schneider-electric.com/files?p_File_Name=NRAN-72754V_R2_EN.pdf&p_Doc_Ref=SPD_NRAN-72754V_EN`
- Este paper **não redefine** o modelo de perdas do WP113 — ele o **referencia diretamente**
  como a base teórica ("A detailed description of the theory, construction, and use of a data
  center efficiency model are described in White Paper 113, Electrical Efficiency Modeling for
  Data Centers.", p.11) e foca em **como medir** os dados necessários para calibrar esse
  modelo, e como agregar as medições em um relatório de PUE.

### 2.1 Diagrama de demanda/perda (Figure 9, p.11) — mapa dos nós do modelo

Este é o único diagrama que mostra explicitamente **todos os subsistemas modelados** e como
se conectam no fluxo de cálculo. Nós de dispositivo (retângulos): **Power Dist, UPS, Gen,
Humidifier, CRAH, Pumps, Chiller, Cooling Tower, Lights**. Fluxos de entrada: **IT Load**
(demanda elétrica) e **Outdoor Temperature & Humidity** (impacto em Heat Infiltration →
demanda térmica). Saídas somadas em cascata: **Total UPS Load → Total Power Losses**;
**Total Thermal Load (IT + Heat Infiltration) → alimenta CRAH/Pumps/Chiller/Cooling Tower →
Total Cooling Losses**; **Lights → Total Lighting Losses**; soma final = **Total Losses**.

Isso confirma que o modelo completo do TradeOff Tool inclui **Pumps** e **Cooling Tower**
como nós de perda distintos — mesmo que o WP113 não publique coeficientes numéricos
separados para eles (ficam agregados em "Chiller plant" na Tabela 2 pública).

### 2.2 PUE como função de %load — mesma curva de referência do WP113

Figure 5 (p.7) mostra a mesma família de curvas do WP113: PUE cai de ~3.5 (10% de carga) para
~1.5 (100% de carga) num exemplo típico — consistente qualitativamente com a Figure 10 do
WP113 Rev2, embora os dois gráficos usem datasets de exemplo diferentes (não são a mesma
instância numérica).

### 2.3 PUE como função da temperatura externa (Figure 7, p.8) — único dado sobre economizer

- Sem modo economizer: PUE sobe **linearmente** de ~1.9 (0°C) para ~2.4 (40°C), a carga de
  TI constante.
- Com modo economizer (curva tracejada, válida até ~16°C): PUE começa em ~1.5 (0°C) e sobe
  para ~2.0 perto do ponto de transição para modo mecânico (~16°C), permanecendo **abaixo**
  da curva sem economizer nessa faixa.
- **Não há equação nem coeficientes numéricos publicados** para esta curva — é apresentada
  apenas como gráfico ilustrativo qualitativo, sem tabela de dados subjacente.

### 2.4 Erro de usar a saída do UPS como proxy da carga de TI

> "The error caused by using the UPS output power as representative of the actual IT load can
> be in the range of **2% to 25%** depending on the data center" (p.14) — porque a saída do
> UPS inclui as perdas de PDU (e possíveis outras cargas alimentadas pelo UPS, como air
> handlers). O modelo corrige isso subtraindo a perda de PDU calculada (não medida) da
> potência de saída do UPS.

### 2.5 Perda de PDU em % da carga de TI (dado adicional, não presente no WP113/WP158)

> "In a partially loaded data center, the losses in PDUs can be in excess of **10% of the IT
> load**" (WP158, p.10 — replicado também conceitualmente no WP154).

### 2.6 Checklist de dados que devem acompanhar toda medição pontual de PUE (p.16)

Data/hora da medição, intervalo de média usado, pontos de medição e instrumentos usados em
cada ponto, capacidade nominal (full load) do data center, carga de TI real no momento da
medição, temperatura e umidade externas, nível de redundância, tipo de rejeição de calor (dry
cooler, cooling tower, free air, packaged chiller), tipo de economizer instalado (se houver),
e status do economizer no momento da medição (engaged/disengaged).

### 2.7 Relatório de eficiência recomendado (p.17) — campos de saída do modelo

PUE anual real (medido ou extrapolado do modelo); PUE anual esperado sob condições padrão da
indústria; valor de projeto do PUE anual sob condições padrão; carga média anual de TI (% da
capacidade nominal); breakdown de consumo por subsistema principal; comparação do PUE anual
real com DCs similares (pior caso, típico, melhor caso); consumo elétrico anual total
(kWh); custo elétrico anual estimado; tendências de PUE/consumo/custo.

---

## 3. White Paper 158 — "Guidance for Calculation of Efficiency (PUE) in Data Centers"

- **Título exato:** *Guidance for Calculation of Efficiency (PUE) in Data Centers*
- **Número:** White Paper 158, Revision 3
- **Autor:** Victor Avelar (Senior Research Analyst, Schneider Electric)
- **URL (oficial, verificado):** `http://www.apc.com/salestools/SNIS-7E6LKL/SNIS-7E6LKL_R3_EN.pdf`
- **Escopo:** este paper **não trata do modelo de perdas por componente** (isso é WP113). Seu
  foco é a **classificação padronizada de cargas** — o que conta como carga de TI, o que
  conta como infraestrutura física, e o que fica de fora do cálculo de PUE — além de como
  estimar consumo de subsistemas compartilhados ou impraticáveis de medir diretamente.

### 3.1 As 3 categorias de classificação de subsistemas (Tables 1–4, p.5-8)

Cada subsistema do data center é classificado em exatamente uma de três categorias: **IT
load**, **Physical infrastructure**, ou **Not included**.

**IT load (Table 1):** Servers, Storage equipment, Networking gear, KVM and monitors,
Disaster recovery IT loads (se compartilhado no mesmo site), IT equipment in NOC.

**Physical infrastructure — power (Table 2):** Switchgear & panel boards, Automatic transfer
switches (ATS), Generators (incl. block heater, jacket water heater, strip heaters, generator
controls, battery charger), UPS, Static transfer switches (STS), PDUs, Disaster recovery
power systems (se compartilhado). **Not included:** Alternate energy systems (PV, wind) —
por mascararem o desempenho real do DC.

**Physical infrastructure — cooling (Table 3):** Chillers, Chilled water pumps (primária,
secundária, terciária), Condenser water pumps, Cooling tower (fans, basin heaters), Water
treatment (sand filter pumps & injectors), Pipe freeze protection (heat tape/trace, strip
heaters), Air compressors (suporte a válvulas pneumáticas em plantas de água gelada),
Centralized humidifiers, CRAH/CRAC (fans, reheat coils, humidification), Condensate pumps,
Make-up/fresh air system power, Unit heaters, Condensers (apenas unidades CRAC resfriadas a
ar), Dry coolers, Cooling for NOC, Disaster recovery cooling systems, Well pumps.

**Physical infrastructure — other (Table 4):** Lights in white space, Lights in mechanical &
electrical rooms, Other plant controls (fire, dampers, physical security, BMS HVAC, PLCs,
incluindo servidores de BMS/segurança/fire). **Not included:** Outdoor lights, Personnel
office loads, Lights in personnel areas.

### 3.2 Erros comuns citados explicitamente

> "Many reported measurements of PUE incorrectly assign PDUs and static transfer switch
> (STS) units as part of the IT load during PUE calculations, which can result in large
> errors, especially in partially loaded data centers." (p.5)

> "Other common mistakes made in PUE calculations are omissions of switchgear and automatic
> transfer switch (ATS) equipment... these subsystems are a small percentage of the overall
> system energy use (**around 1%**)" (p.5) — este é o único valor numérico de referência
> explícito neste paper, e é **consistente** com o WP113 (Switchgear = 0.5% square-law loss
> na Tabela 2, e o breakdown de "Switchgear/generator" combinado em ~1% na Figure 4 do
> WP113 Rev2).

### 3.3 Metodologia de 3 partes para dados incompletos/compartilhados (p.3, p.9-10)

1. **Categorização padrão** dos subsistemas (Tables 1-4, acima).
2. **Estimativa de recursos compartilhados** (ex.: chiller compartilhado com prédio
   adjacente) — 3 técnicas alternativas descritas: (a) medir/estimar carga térmica via perdas
   elétricas conhecidas de outras cargas do DC + performance do chiller; (b) medir/estimar a
   divisão fracionária da carga térmica (temperatura da água, pressão, ajustes de bomba) e
   alocar proporcionalmente a potência do chiller; (c) desligar as cargas não-DC e medir o
   chiller isoladamente (nota: geralmente **superestima** ligeiramente as perdas atribuídas ao
   DC, porque parte das perdas do chiller são fixas e não param quando as cargas não-DC são
   desligadas).
3. **Estimativa de dispositivos impraticáveis de medir diretamente** — caso principal: PDU.
   Motivo: instrumentação de PDU nunca fornece diretamente dados de perda; entrada/saída
   tipicamente só em VA ou amps (não watts); instrumentação não é precisa o suficiente para
   subtração; múltiplas saídas exigiriam soma de dezenas de circuitos. **Solução:** calcular a
   perda de PDU deterministicamente a partir da carga de TI conhecida e das características do
   PDU — mais precisa, segundo o paper, que a própria instrumentação embutida do PDU (que
   pode erroneamente indicar eficiência > 100% devido a erro de medição por subtração de
   números grandes).

---

## 4. Como o modelo compõe o PUE — síntese consolidada (WP113 + WP154 + WP158)

1. **Entrada do modelo:** carga de TI (kW, como fração da capacidade nominal do DC) +
   condições externas (temperatura/umidade) + configuração do sistema (tipo de dispositivos
   alimentados pelo UPS, tipo de planta de refrigeração, presença de modo economizer) +
   fatores de sobredimensionamento (derating, diversidade, redundância N+1/2N) por tipo de
   componente.
2. **Para cada componente NCPI/DCPI** (UPS, PDU, Lighting, Wiring, Switchgear, Generator,
   CRAC, Humidifier, Chiller plant — e, no diagrama mais granular do WP154, também Pumps e
   Cooling Tower separadamente): calcular a perda em função da carga real usando os 3
   coeficientes da Tabela 2 (no-load, proportional, square-law) aplicados sobre a fração de
   carga do **componente** (não do DC como um todo) — a fração de carga do componente já
   incorpora o oversizing daquele componente específico.
3. **Realimentação térmica:** somar ao IT load as perdas de todos os componentes de
   energia/refrigeração situados dentro do espaço condicionado, para obter a carga térmica
   total que o sistema de refrigeração precisa remover — isto é o que WP113 chama de
   "Effect of Heat" (Wrong Assumption #3) e o WP154 formaliza no diagrama de demanda/perda
   (Figure 9: "Total Thermal Load" = IT Load + Heat Infiltration + perdas dos componentes).
4. **Somar todas as perdas** (Total Power Losses + Total Cooling Losses + Total Lighting
   Losses = Total Losses).
5. **PUE = (IT Load + Total Losses) / IT Load**, recalculado como curva em função de %load
   (a mesma estrutura de cálculo é reaplicada para cada ponto de carga de 0% a 100%,
   produzindo a curva PUE-vs-load como a Figure 10 do WP113 / Figure 5 do WP154).
6. **Classificação de escopo (WP158):** antes de alimentar o modelo, cada subsistema físico
   real do DC deve ser mapeado para "IT load" / "physical infrastructure" / "not included"
   segundo as Tabelas 1-4 do WP158, e cargas compartilhadas ou impraticáveis de medir são
   resolvidas pelas técnicas de estimativa do WP158 (§3.3) antes de entrarem no modelo do
   WP113/WP154.

---

## 5. O que NÃO foi encontrado (declarado explicitamente, conforme regra "no invention")

- Coeficientes numéricos (no-load/proportional/square-law) **separados** para **bombas de
  água gelada** e **torre de resfriamento** — aparecem apenas agregados dentro de "Chiller
  plant" (6%/26%/—/32%) na única tabela pública (WP113 Table 2). O WP154 confirma que são nós
  distintos no modelo interno (Figure 9), mas não publica os coeficientes numéricos deles.
- Coeficientes separados para **transformador** isolado (aparece apenas mencionado
  textualmente como parte do "power path", não como linha própria da Tabela 2).
- Coeficientes separados para **STS (static transfer switch)** — WP158 confirma que deve ser
  classificado como infraestrutura física, mas nenhum dos três papers publica coeficiente
  numérico de perda para STS.
- Equação numérica explícita (com coeficientes) para a curva **PUE vs. temperatura externa**
  com/sem modo economizer (WP154 Figure 7) — apresentada apenas como gráfico ilustrativo, sem
  tabela de dados nem fórmula publicada.
- Comparação numérica quantitativa entre arquiteturas **DX (expansão direta) vs. água
  gelada (chilled water)** — nenhum dos três papers pesquisados apresenta uma tabela
  comparativa de coeficientes por arquitetura de resfriamento. (O WP113 apenas cita a técnica
  geral de "state-space averaging" para dispositivos multi-modo, sem dar exemplo numérico.)
- **Código-fonte ou fórmula proprietária exata do TradeOff Tool** (a calculadora web em
  `tools.apc.com`) — os papers descrevem o modelo teórico que fundamenta a ferramenta e
  confirmam textualmente que "a computer model based on these principles has been
  implemented" (WP113) na metodologia de TCO (WP6, não pesquisado nesta rodada), mas não
  publicam a implementação em si.
- Não foi possível fazer download bem-sucedido de **White Paper 6** ("Determining Total Cost
  of Ownership for Data Center and Network Room Infrastructure") nem **White Paper 37**
  ("Avoiding Costs from Oversizing Data Center and Network Room Infrastructure") nesta
  rodada — ambos são citados repetidamente como fontes primárias dos fatores de
  sobredimensionamento (WP37) e do motor de cálculo de TCO que implementa o modelo (WP6), mas
  não foram buscados/baixados neste research pass. Recomendação: pesquisa follow-up (R2) se
  esses dados numéricos adicionais forem necessários.

---

## 6. Os 10 coeficientes mais importantes encontrados (resumo executivo)

Todos da **Tabela 2 do WP113** (idêntica nas Revisions 1 e 2), "Typical electrical losses of
NCPI/DCPI components expressed as a fraction of full load component rating":

1. **UPS — no-load loss: 4%**
2. **UPS — proportional loss: 5%** (→ total de placa a plena carga: 9%, ou seja, 91% de
   eficiência nominal — mas cai para 60% a 10% de carga)
3. **PDU — no-load loss: 1.5%** e **square-law loss: 1.5%** (total 3%)
4. **CRAC — no-load loss: 9%**, proportional loss: 0% (total 9%)
5. **Chiller plant — proportional loss: 26%** (o maior coeficiente individual de toda a
   tabela — o chiller domina o custo de operação em carga parcial/plena)
6. **Chiller plant — no-load loss: 6%** (total chiller plant: 32%, o maior total de todos os
   componentes)
7. **Humidifier — no-load 1% / proportional 1%** (total 2%)
8. **Lighting — no-load 1%** (perda fixa, sem componente proporcional)
9. **Wiring — square-law loss: 1%**; **Switchgear — square-law loss: 0.5%**; **Generator —
   no-load loss: 0.3%** (os três menores contribuintes individuais)
10. **Fatores de sobredimensionamento do sistema** (não são coeficientes de componente, mas
    são os multiplicadores que a Tabela 2 precisa para virar curva de PUE real): derating
    10–20%, oversizing de PDU por diversidade 30–100%, carga média real ~65% abaixo da
    capacidade de projeto, redundância 2N reduz carga de componente individual para <50%.

---

## 7. Arquivos escritos nesta pesquisa

- `docs/research/2026-08-17-pue-calculator/R1-white-papers-se.md` (este arquivo)
- `docs/research/2026-08-17-pue-calculator/WP113-Electrical-Efficiency-Modeling-R2.pdf` (Rev 1, mirror ETH Zürich)
- `docs/research/2026-08-17-pue-calculator/WP113-Electrical-Efficiency-Modeling-Official-R2.pdf` (Rev 2, mirror oficial Schneider Electric)
- `docs/research/2026-08-17-pue-calculator/WP154-Electrical-Efficiency-Measurement-R2.pdf` (Rev 2, mirror oficial Schneider Electric)
- `docs/research/2026-08-17-pue-calculator/WP158-Guidance-PUE-R3.pdf` (Rev 3, mirror apc.com/salestools)
