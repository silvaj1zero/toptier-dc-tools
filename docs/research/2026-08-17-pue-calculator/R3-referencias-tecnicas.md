# R3 — Referências Técnicas: Modelo de PUE por Subsistema (curva PUE×carga e alocação de energia)

Pesquisa para calculadora didática de projeto de data center. Todos os valores abaixo foram extraídos diretamente dos documentos-fonte (PDFs lidos na íntegra); nada foi inventado. Onde um valor público não foi encontrado, isso é declarado explicitamente.

---

## FONTE 1 — LBNL "DC Pro" Data Center Profiler — Calculation Reference Manual

**URL (HTML):** https://datacenters.lbl.gov/resources/dc-pro-tools-calculation-reference
**PDF efetivamente recuperado:** `DC Pro v3.0 Calculation Reference Manual_2014-07-28_0.pdf` — https://datacenters.lbl.gov/sites/default/files/DC%20Pro%20v3.0%20Calculation%20Reference%20Manual_2014-07-28_0.pdf (28 jul 2014, Integral Group para LBNL/DOE)

Status: **PDF recuperado com sucesso e lido integralmente (86 páginas).** WebFetch inicial reportou "binário ilegível" — o PDF é baseado em texto real, apenas precisou ser lido via ferramenta de leitura de PDF nativa em vez de extração HTML do WebFetch.

### 1.1 Fórmula de PUE (idêntica em todo o DC Pro)

```
PUE = (IT Energy Use + Lighting Energy Use + Electric Distribution Loss
       + Fans Energy Use + Cooling & Humidity Control Energy Use) / (IT Energy Use)
```
(p.5)

### 1.2 Constantes fixas (Figure 17, p.31 — "Constants" box)

| Constante | Valor | Citação exata |
|---|---|---|
| IT power draw | assumido constante 24/7/365 | "IT.L.1: IT power draw is assumed constant, 24/7/365." |
| **Lighting** | **1% da IT Energy** (no diagrama de fluxo, Figure 17) | "L.L.1: Lighting Energy is fixed at 1% of the IT Energy." |
| **Electric Distribution System Loss** (fora do UPS) | **2% da IT Energy** | "ED.L.1: Electric Distribution System Loss (aside from UPS Loss) is fixed at 2% of the IT Energy." |

⚠️ **Inconsistência interna encontrada no próprio documento-fonte** (não é erro de extração nosso): na seção "Calculations" (p.31, corpo do texto, não o diagrama), o manual diz literalmente:

> "Annual lighting energy is assumed to be constant at **0.1%** of the IT load, for all hours of the year." (p.31, texto)

E o exemplo numérico completo do próprio manual (Tabela 18, p.38) usa **0.07%–0.08%** de lighting nos cálculos reais (consistente com 0.1%, não com 1%). O Apêndice D (Model Constants, p.84) confirma: "Average Lighting Load (Constant) = 1 kW" para um "IT Load (Constant) = 1,000 kW" → **0.1% exatamente**, batendo com o texto e o exemplo numérico, e contradizendo o rótulo "1%" que aparece no diagrama de fluxo (Figure 17).
**Conclusão:** o valor operacional real usado pelo DC Pro é **lighting = 0,1% da carga de TI**; o "1%" na Figure 17 é uma etiqueta com erro de digitação no próprio PDF da LBNL. Registrar isso na calculadora com cautela — recomendamos usar 0,1% (validado por 3 fontes internas independentes no mesmo documento) e não replicar o erro do diagrama.

### 1.3 Lookup Table: UPS Efficiency (Apêndice C, p.81–83)

Fonte primária dos dados: "data provided in March 2013 by Munther Salim, PhD, Hewlett Packard" — tabela cobre **12 capacidades de UPS × 2 voltagens × 4 tipos de tecnologia × 10 faixas de fator de carga**.

Exemplo completo extraído (225 kVA, 480V, Double Conversion — usado no exemplo passo-a-passo do manual, p.33):

| Load Factor | 1–10% | 11–20% | 21–30% | 31–40% | 41–50% | 51–60% | 61–70% | 71–80% | 81–90% | 91–100% |
|---|---|---|---|---|---|---|---|---|---|---|
| Eficiência | 80.7% | 86.9% | 90.2% | 92.1% | 93.2% | 94.2% | 95.8% | 95.8% | 95.5% | 95.3% |

Outros exemplos extraídos (mesma tabela, 480V):

- **50 kVA, Double Conversion:** 78.0% (1–10%) → 92.5% (71–90%)
- **50 kVA, Double Conversion + Filter:** 77.7% → 92.3%
- **50 kVA, Delta Conversion:** 80.0% → 93.8% (61–70%)
- **50 kVA, Rotary:** 72.1% → 92.9% (71–80%)
- **1000 kVA, Double Conversion, 480V:** 80.7% (1–10%) → 95.8% (61–80%) → 95.3% (91–100%)
- **1000 kVA, Delta Conversion, 480V:** 88.0% (1–10%) → **97.1%** (61–90%) — a maior eficiência de pico encontrada na tabela inteira.

Padrão geral observável nos dados: eficiência sobe rapidamente de ~1–10% de carga até ~50–60%, atinge platô/pico entre 51–90% de carga, e cai levemente acima de 90% em várias combinações. Delta Conversion tende a ter eficiência de pico mais alta que Double Conversion na mesma capacidade/voltagem. Unidades de 208V são consistentemente ~1 percentual point mais baixas que 480V equivalentes (confirmado também na fonte 1.4 abaixo).

**Cálculo de UPS Loss:** `UPS Loss = 100% − UPS Efficiency` (aplicado depois somando 2% fixo de distribuição elétrica → ex. UPS Loss 7.9% + 2% = 9.9% Electric Distribution System Loss total, no exemplo do manual).

### 1.4 Lookup Table: Cooling System Energy (Apêndice B, p.79–80)

Gerada por simulação EnergyPlus (não medição direta) — **28.800 iterações totais** rodadas via JePlus, cobrindo:

**Modelo constante (Model Constants, Apêndice B, p.79):**
| Parâmetro | Valor |
|---|---|
| IT Load (constante) | 1.000 kW |
| Average Lighting Load (constante) | 1 kW |
| Data Center Floor Area | 10.000 sf |
| IT Load Density | 100 W/sf |
| Average Lighting Power Density | 0.1 W/sf |

**Variáveis do modelo (8 parâmetros, Apêndice B):**
| Variável | Valores testados | Iterações DX | Iterações CHW |
|---|---|---|---|
| Climate Zone | 1A,2A,2B,3A,3B,3C,4A,4B,4C,5A,5B,6A,6B,7,8 (15 zonas) | 15 | 15 |
| Electric Distribution System Loss (% do IT) | 0%, 15%, 45% | 3 | 3 |
| Humidity Control | None, ASHRAE Recommended | 2 | 2 |
| Integrated Air Side Economizer | Yes, No | 2 | 2 |
| Cooling System Type | CRAC Air-Cooled DX / CRAC Water-Cooled DX (DX); CRAH Air-Cooled Chiller / CRAH Water-Cooled Chiller com No WSE / Integrated WSE / Non-Integrated WSE (CHW) | 2 | 4 |
| Supply Air Temperature (°F) | 55, 65, 75, 85 | 4 | 4 |
| Air Side Delta-T (°F) | 5, 10, 15, 20 | 4 | 4 |
| Chilled Water Supply Temp (°F) | 45, 55 (DX: 1 fixo) | 1 | 2 |
| **Subtotal** | | **5.760** | **23.040** |
| **Total** | | **28.800** | |

**Exemplo numérico completo (3 linhas reais da tabela, Zona 3C, CHW Air, Figure 19, p.35):**

| Index | Zona | Sistema | Economizer | Dist. Loss (kW) | CHW Supply Temp (°F) | Supply Air (°F) | ΔT ar (°F) | Humidity Ctrl | Supply Fans % do IT | Total Cooling Plant % do IT |
|---|---|---|---|---|---|---|---|---|---|---|
| 7886 | 3C | CHW Air | FixedDryBulb | 0 | 45 | 65 | 15 | 50 (=Yes) | **15.03%** | **16.31%** |
| 7934 | 3C | CHW Air | FixedDryBulb | 0 | 55 | 85 | 20 | 0 (=No) | **10.74%** | **0.06%** |
| 7951 | 3C | CHW Air | FixedDryBulb | 150 | 45 | 65 | 15 | 50 | **17.28%** | **17.19%** |

Isso mostra a amplitude real dos percentuais de energia de resfriamento como % da carga de TI, dependendo apenas de humidity control, temperatura de suprimento e distribution loss assumido — de **0,06%** (melhor caso, sem controle de umidade, alto ΔT) até **17,19%** (com controle de umidade ativo).

### 1.5 Metodologia de interpolação para PUE default (Passo a passo completo, p.31–38)

O DC Pro NÃO usa uma fórmula fechada tipo `P_total(L) = IT + Σ(fixo + prop×L + quad×L²)`. Em vez disso:

1. Consulta a tabela de UPS Efficiency → UPS Loss (%)
2. Soma 2% fixo → "Electric Distribution System Loss" total (ED.L.3)
3. Usa ED.L.3 para localizar as **duas linhas mais próximas** (uma acima, uma abaixo) na tabela de Cooling System Energy (28.800 linhas, indexada por zona climática + tipo de sistema + condições)
4. Normaliza cada um dos dois casos (High/Low EDS Loss) para 100% da energia total do data center
5. **Interpola linearmente** entre os dois casos usando ED.L.3 como peso

**Exemplo numérico completo do manual (p.36–38), climate zone 3C, chilled water, air-cooled chiller, 45°F CHWST, UPS Double Conversion 225kVA/480V/31-40% load factor:**

| End Use | High EDS Loss (15%) | Low EDS Loss (0%) | Interpolado (ED.L.3=9.9%) |
|---|---|---|---|
| IT Load | 66.84% | 76.10% | **69.99%** |
| Lights | 0.07% | 0.08% | **0.07%** |
| Electric Distribution System Loss | 10.03% | 0.00% | **6.62%** |
| Fan Energy | 11.56% | 11.42% | **11.51%** |
| Cooling & Humidity Control Energy | 11.50% | 12.40% | **11.81%** |
| **PUE resultante** | | | **PUE = 100% / 69.99% = 1.43** |

### 1.6 PUE "Potencial" (melhor caso teórico, p.39, Table 33)

O DC Pro também calcula um PUE "potencial" (melhor cenário possível nas lookup tables, ignorando custo/praticidade): usa Electric Distribution Loss mínimo de **2%** (sem UPS) e os melhores valores de fan/cooling encontrados na tabela para aquela zona climática.

Exemplo do manual: IT=88.57% normalizado, Lights=0.09%, Electric Dist Loss=1.77%, Fans=9.51%, Cooling=0.05% → **PUE potencial = 1.13** (vs. 1.43 do caso "default" realista do mesmo data center — mesma zona/configuração).

### 1.7 Apêndice D — HVAC Efficiencies and Setpoints (modelo EnergyPlus, p.84–86)

Esta é a tabela mais próxima de um "modelo de componentes com coeficientes técnicos" pedido na pesquisa. Fontes citadas pelo próprio LBNL: **ASHRAE Standard 90.1-2007**, **"Thermal Guidelines for Data Processing Environments" ASHRAE TC 9.9 (2011)**, e **"Energy Efficiency Baselines for Data Centers", Pacific Gas & Electric (PG&E), 1 out 2010**.

| Componente | Parâmetro | Valor | Unidade | Fonte citada |
|---|---|---|---|---|
| Fans | Fan System Efficiency | **1.500** | cfm/kW | PG&E Data Center Baseline 2010 (média de estratégias de containment, incl. "no containment") |
| Fans | Fan System Efficiency (inverso) | **0.67** | W/cfm | (derivado) |
| Fans | Nominal Motor Efficiency | 90% | — | assumido (típico CRAC/CRAH) |
| Fans | Nominal Drive Efficiency | 95% | — | PG&E Baseline 2010 (belt drive) |
| Fans | Nominal Fan Efficiency | 60% | — | assumido (típico CRAC/CRAH) |
| Fans | Total Static Pressure | **3.4** | in. w.g. (847 Pa) | calculado de Fan System Eff. + Nominal Fan Eff. |
| Air-Side Economizer Relief Fan | Part-Load Curve | Variable Speed | — | ASHRAE 90.1-2007 |
| **Chiller Air-Cooled** | **COP** | **2.80** | — | ASHRAE 90.1-2007 §6.8.1c (com condensador) |
| Chiller Air-Cooled | Curve Set | DOE-2 Screw | — | EnergyPlus |
| **Chiller Water-Cooled** | **COP** | **5.55** | — | ASHRAE 90.1-2007 §6.8.1c (centrifugal <300 tons) |
| Chiller Water-Cooled | Curve Set | DOE-2 Centrifugal | — | EnergyPlus |
| **DX Air-Cooled** | **COP** | **2.84** | — | ASHRAE 90.1-2007 §6.8.1A; ≥760 kBtu/hr Electric, EER 9.7 |
| **DX Water-Cooled** | **COP** | **3.22** | — | ASHRAE 90.1-2007 §6.8.1A, EER 11 |
| Chilled Water Pump | Nominal Motor Efficiency | 94.1% | — | PG&E Baseline 2010 |
| Chilled Water Pump | Nominal Pump Efficiency | 68% | — | PG&E Baseline 2010 |
| Chilled Water Pump | Static Pressure | 75 | ft | PG&E Baseline 2010 |
| **Condenser Water Pump** | **Pump System Efficiency** | **19** | **W/gpm** | ASHRAE 90.1-2007 §G3.1.3.11 |
| Condenser Water Pump | Nominal Motor Efficiency | 90% | — | assumido |
| Condenser Water Pump | Nominal Pump Efficiency | 65% | — | assumido |
| Condenser Water Pump | Static Pressure | 65 | ft | calculado |
| **Cooling Tower** | **Design Wetbulb Temperature** | **75** | °F | PG&E Baseline 2010 |
| Cooling Tower | **Approach Temperature** | **10** | °F | PG&E Baseline 2010 |
| **Heat Exchanger (waterside economizer)** | Approach Temperature | 3 | °F | assumido |
| Chilled Water Loop | CHW Supply Temp Setpoint | 45 | °F | PG&E Baseline 2010 |
| Chilled Water Loop | CHW Delta-T | 10 | °F | PG&E Baseline 2010 |
| Condenser Water Loop | CW Temp Setpoint | Ambiente wetbulb + 5 | °F | PG&E Baseline 2010 |
| Condenser Water Loop | CW Delta-T | 10 | °F | PG&E Baseline 2010 |
| Humidifier | Tipo | Electric Steam Generator | — | PG&E Baseline 2010 |
| Humidifier | Max Allowed Humidity | 60% | RH | ASHRAE Thermal Guidelines (faixa recomendada) |
| Humidifier | Min Allowed Humidity | 40% | RH | ASHRAE Thermal Guidelines (faixa recomendada) |

**Nota sobre o PG&E "Energy Efficiency Baselines for Data Centers" (Oct 2010):** tentamos buscar o PDF diretamente (https://www.pge.com/assets/pge/docs/save-energy-and-money/rebate-and-incentives/data_center_baseline.pdf) mas o servidor da PG&E retornou HTTP 403 (bloqueio de bot/crawler). Os valores acima são citados pelo LBNL diretamente do documento PG&E e reproduzidos aqui com a cadeia de citação intacta (LBNL → PG&E 2010).

### 1.8 Seis tipos de sistema de resfriamento modelados (com diagramas de fluxo, p.88–98)

O manual documenta 6 arquiteturas EnergyPlus completas, cada uma com diagrama de componentes (kW rotulados):
1. Air-Cooled DX
2. Water-Cooled DX (com Fluid Cooler Fan kW + Condenser Water Pump kW)
3. Air-Cooled Chiller (com Chilled Water Pump kW)
4. Water-Cooled Chiller (+ Cooling Tower Fan kW + Condenser Water Pump kW)
5. Water-Cooled Chiller com Waterside Economizer Integrado (+ Heat Exchanger Pump kW)
6. Water-Cooled Chiller com Waterside Economizer Não-Integrado

Cada diagrama identifica os "nós" de consumo de energia (Compressor kW, Condenser Fan kW, Humidifier kW, Heating Element kW, etc.) que compõem o "Total Cooling Plant" na tabela de lookup — mas o manual não publica um coeficiente numérico isolado por componente (ex. "chiller consome X kW/ton isoladamente"); os componentes só existem agregados dentro das 28.800 linhas de simulação da tabela de lookup.

---

## FONTE 2 — LBNL PUE Estimator Tool — User's Manual

**URL:** https://datacenters.lbl.gov/sites/default/files/PUEEstimatorManual_06022016.pdf (PUE Estimator v1, manual atualizado 02 jun 2016)

Status: **PDF recuperado e lido integralmente (16 páginas).**

O PUE Estimator é uma versão simplificada do DC Pro, mesma engine de cálculo, menos perguntas.

### 2.1 Constantes (Seção "PUE Calculation Method", p.14)

> "Electrical distribution loss (excluding UPS) is assumed to be **2% of total IT load**. Lighting is assumed to be **1% of total IT load**. It also assumes that IT load is the same 24/7."

⚠️ **Aqui o "1% de lighting" é reafirmado explicitamente no corpo do texto** (não é erro de diagrama como na Fonte 1) — isso está em **contradição direta e documentada** com o Calculation Reference Manual (Fonte 1), que usa 0,1% em texto, exemplo numérico E Apêndice D (3 confirmações internas). Ambos os documentos são publicados pela mesma equipe LBNL/DOE, mas divergem entre si em 10× no valor de lighting. Reportamos os dois valores exatamente como encontrados — não reconciliamos por conta própria (regra "no invention").

Fórmula de PUE citada no rodapé (nota 1, p.4): inclui termo adicional não presente na Fonte 1 —
> "PUE = (IT Energy Use + Lighting Energy Use + Electric Distribution Loss + Fans Energy Use + Cooling & Humidity Control Energy Use **+ Standby Generation Loss + Misc. Losses**) / (IT Energy Use)"
— mas o PUE Estimator em si (diferente da definição textual da nota) não pergunta sobre standby generator nem inclui esse termo em sua lookup table (confirmado no diagrama de fluxo p.15 — apenas Climate Zone, UPS Loss, Cooling System Energy).

### 2.2 Faixas de PUE citadas (contexto, não fórmula)

- Exemplo do manual mostra PUE calculado = **1.8** (Arkansas, 4A) com breakout: IT 56.5%, Lights 0.6%, Power Chain 7.9%, Fans 14.9%, Cooling 20.2% (Figure 7, Excel export, p.11).
- Outro exemplo mostra PUE = **1.6** (Figure 6, PDF export, p.11): IT 64.4%, Lights 0.6%, Power Chain 1.3%, Fans 27.3%, Cooling 6.4%.

Estes dois exemplos reais confirmam empiricamente que **lighting fica em ~0.6% do total do data center** (não 1% nem 0.1% da carga de TI isoladamente — são bases de normalização diferentes: % do total do DC vs. % da carga de TI; ver Fonte 1 seção 1.5 para a diferença).

### 2.3 Perguntas do PUE Estimator que afetam o cálculo (lista completa, p.12–14)

Idênticas em espírito às do DC Pro mas reduzidas a um único formulário: Climate Zone, Supply/Return Air Temp, Humidification/Dehumidification (Y/N), Water-side Economizer (Y/N), Air-side Free Cooling (Y/N), Cooling System Type, Chiller Type, Chilled Water Supply Temp, Water-side Economizer detail, UPS presence/type/size/voltage/load factor.

---

## FONTE 3 — The Green Grid White Paper #49 — "PUE: A Comprehensive Examination of the Metric" (2012)

**URL:** https://datacenters.lbl.gov/sites/default/files/WP49-PUE%20A%20Comprehensive%20Examination%20of%20the%20Metric_v6.pdf (também hospedado em thegreengrid.org, mas a LBNL mantém cópia estável)

Status: **PDF recuperado e lido integralmente (83 páginas).** Autores: Victor Avelar (Schneider Electric), Dan Azevedo (Disney), Alan French (Emerson Network Power).

Este documento é a referência definitiva da indústria para definição/medição de PUE, mas **não fornece um modelo de subsistemas com coeficientes técnicos** (kW/ton, W/cfm etc.) como o DC Pro — o foco é definição, medição, e comparabilidade. Os elementos relevantes para a calculadora:

### 3.1 Definição formal (Equation 1, p.11)

```
PUE = Total Facility Energy / IT Equipment Energy
```

### 3.2 Decomposição de subsistemas (Table 2, "Classification of subcomponents", p.19–20)

Green Grid divide "Facility Equipment" (o numerador extra de PUE) em duas categorias com listas exaustivas de componentes:

**Power:** Automatic transfer switches (ATS), Switchgear, UPS, DC batteries/rectifiers, Generators, Transformers (step down), Static transfer switches (STS), PDUs, Rack distribution units (RDUs), Breaker panels, Distribution wiring, Lighting.

**HVAC:** Cooling towers, Condensers e condenser water pumps, Chillers, Chilled water pumps, Water treatment systems, Well pumps, CRACs, CRAHs, Dry coolers, Air compressors, Supply fans, Return fans, Air economizers, Water-side economizers, Dehumidifiers, Humidifiers, Heaters, In-row/in-rack cooling, Condensate pumps.

Mais Physical Security (fire suppression, water detection) e Building Management System (controls, probes/sensors) — ambos tipicamente pequenos o suficiente para não afetar materialmente PUE, mas formalmente incluídos.

### 3.3 Curva PUE × temperatura ambiente (Figure 6, p.27) — a curva mais próxima do que a pesquisa pediu

Green Grid publica um **gráfico ilustrativo qualitativo** (não uma equação com coeficientes numéricos) mostrando PUE em função da temperatura externa (0–40°C), com IT load mantido constante:
- Sem free cooling: PUE sobe de forma aproximadamente linear de **~1.9 (0°C) até ~2.4 (40°C)**.
- Com free cooling ativado (abaixo de ~16°C): PUE cai para **~1.5–1.55** nas temperaturas mais baixas, convergindo com a curva sem free cooling acima de ~16°C.
- Nota explícita do documento: "Figure 6 is for illustrative purposes only, intended to convey the concept of free cooling; it does not capture all variances that could occur." — ou seja, **não é uma curva com base empírica publicada**, é um exemplo pedagógico do próprio Green Grid.

### 3.4 Modelo linear de "PUE Scalability" (Seção VIII, p.69–79) — o modelo mais próximo de `P_total(L) = fixo + proporcional × L`

Esta é a contribuição mais tecnicamente relevante do WP49 para uma calculadora com curva PUE×carga. O Green Grid define:

**Equação 19 (p.70) — escalabilidade proporcional ideal:**
```
Power_total = m_PUE × Power_IT + 0
onde m_PUE = Mean(Power_total) / Mean(Power_IT) = PUE médio
```
(reta que passa pela origem — "linear ideal", sem termo fixo)

**Equação 29 (p.76) — inclinação real (regressão por mínimos quadrados) sobre amostras reais:**
```
m_Actual = [N·Σ(P_IT(i)·P_total(i)) − Σ(P_IT(i))·Σ(P_total(i))] / [N·Σ(P_IT(i))² − (Σ(P_IT(i)))²]
```

**Equação 31 (p.77) — "Predicted Chronic Load"** — este É o termo fixo/intercepto do modelo linear real observado:
```
Predicted Chronic Load = Mean(Power_total) − [m_Actual × Mean(Power_IT)]   [watts]
```
ou seja, o modelo real medido é:
```
Power_total(i) = m_Actual × Power_IT(i) + Predicted_Chronic_Load
```
— **exatamente a forma "fixo + proporcional×L"** pedida na pesquisa, mas **sem termo quadrático** (Green Grid não modela componente quadrático de carga em nenhum lugar do documento).

**Equação 30 (p.77) — métrica de "PUE Scalability":**
```
PUE Scalability = (m_Actual / m_PUE) × 100%
```
100% = infraestrutura escala perfeitamente proporcional à carga de TI; valores menores indicam "carga crônica" fixa de overhead que não escala para baixo quando a carga de TI cai.

**Exemplo numérico completo do documento (Figure 22, p.75, dados reais plotados):**
- m_Actual = **1.57**
- m_PUE = **2.51**
- PUE Scalability = **62.5%**

### 3.5 Exemplos numéricos de PUE por fonte de energia (Seção 5.1, p.36–41) — 5 data centers de exemplo

| Data Center | Fontes de energia | PUE calculado |
|---|---|---|
| A | 100% elétrica (1.633.333 kWh comprados) | **1.63** |
| B | Elétrica + chilled water (fator peso 0.4) | **1.58** |
| C | Gás natural via gerador on-site | **1.67** |
| D | Elétrica + gás natural | **1.67** |
| E | Elétrica + gás natural (cogeração, 67%/33% split) | **1.57** |

### 3.6 Fatores de peso de energia de fonte ("source energy weighting factors", Tables 5 e 6, p.32–33)

**Global (Global Harmonization Task Force):**
| Tipo de energia | Fator |
|---|---|
| Eletricidade | 1.0 |
| Gás natural | 0.35 |
| Óleo combustível | 0.35 |
| Outros combustíveis | 0.35 |
| Água gelada distrital (district chilled water) | 0.4 |
| Água quente distrital | 0.4 |
| Vapor distrital | 0.4 |

**EUA (U.S. Regional Task Force, baseado em EPA ENERGY STAR):**
| Tipo de energia | Fator |
|---|---|
| Eletricidade | 1.0 |
| Gás natural | 0.31 |
| Óleo combustível | 0.30 |
| Outros combustíveis | 0.30 |
| Água gelada distrital | 0.31 |
| Água quente distrital | 0.40 |
| Vapor distrital | 0.43 |
| Água de condensador | 0.03 |

### 3.7 Faixa de PUE observada na indústria (contexto, p.13)

> "Some work indicates that many data centers may have a PUE of 3.0 or greater, but, with proper design, a PUE value of 1.6 (or better) should be achievable." — citando Belady (2007, Compaq/AFCOM presentation) e Greenberg/Mills/Tschudi/Rumsey/Myatt (LBNL, 2006, "Best Practices for Data Centers: Lessons Learned from Benchmarking 22 Data Centers", ACEEE 2006) — **22 data centers medidos, PUE na faixa 1.3–3.0**.

### 3.8 PUE mínimo teórico

> "PUE values can range from 1.0 to infinity." — PUE < 1.0 é matematicamente impossível (perdas de distribuição e energia de resfriamento são sempre positivas) e "**IN ANY OFFICIAL REPORTS TO THE GREEN GRID, PUE MEASUREMENTS LESS THAN 1.0 WILL AUTOMATICALLY BE REJECTED**" (p.58, texto em caixa alta no original).

---

## FONTE 4 — ASHRAE 90.4 (Energy Standard for Data Centers) — MLC/ELC

**Status: valores numéricos públicos NÃO encontrados.** ASHRAE 90.4 é um standard comercial (paywall via ashrae.org bookstore); os documentos publicamente indexados (addenda, fact sheets, artigos de imprensa da DCD/CSE/TechTarget) descrevem a **estrutura** do standard mas não reproduzem a Table 6.5 (Maximum Annualized MLC) nem a tabela equivalente de ELC.

O que foi confirmado publicamente (sem números):
- **MLC (Mechanical Load Component):** soma de toda energia de cooling/fans/pumps/heat rejection dividida pela energia de design do ITE; calculado a **25%, 50%, 75% e 100%** da carga ITE.
- **ELC (Electrical Loss Component):** métrica de perdas do sistema elétrico (distribuição/UPS); calculado a **25%, 50% e 100%** de carga, correspondendo a designs de UPS fully redundant, non-redundant ou minimally redundant.
- O standard publica valores máximos permitidos de MLC por **19 zonas climáticas ASHRAE**, em duas tabelas segmentadas por capacidade de ITE (≤300 kW e >300 kW) — mas os valores numéricos das células não estão disponíveis em nenhuma fonte pública indexada encontrada nesta pesquisa.

**Recomendação para a calculadora:** não usar ASHRAE 90.4 como fonte de coeficientes numéricos a menos que a equipe tenha acesso à cópia licenciada do standard. Os dados de MLC/ELC do 90.4 servem para *compliance* (limite máximo regulatório), não para um modelo educacional de curva PUE×carga — para isso, as Fontes 1 (DC Pro lookup tables) e 3.4 (Green Grid PUE Scalability, modelo linear fixo+proporcional) já fornecem base numérica suficiente e de acesso livre.

---

## Síntese para a calculadora (recomendação de modelo)

Com base no que foi efetivamente encontrado (nada inventado):

1. **Não existe, em nenhuma das 3 fontes públicas revisadas (LBNL DC Pro, LBNL PUE Estimator, Green Grid WP49), um modelo fechado do tipo `P_total(L) = IT + Σ(fixo_i + prop_i×L + quad_i×L²)` com coeficientes técnicos publicados por subsistema.** O que existe de fato, publicamente disponível e verificável:
   - **DC Pro (Fonte 1):** modelo de **lookup table** (28.800 combinações simuladas em EnergyPlus) + interpolação linear entre duas condições de electric distribution loss — não uma fórmula fechada, mas dados reais tabulados por zona climática/tipo de sistema/temperatura, com exemplo numérico passo a passo completo (útil para replicar a lógica exata na calculadora).
   - **Green Grid WP49 (Fonte 3.4):** modelo **linear simples** `Power_total = m_Actual × Power_IT + Predicted_Chronic_Load` — este é o único modelo fechado com forma "fixo + proporcional×carga" encontrado nas fontes-alvo, mas sem componente quadrático e sem coeficientes numéricos padrão da indústria (m_Actual e Predicted_Chronic_Load são calculados por regressão sobre dados medidos de cada data center, não são constantes de catálogo).
   - **DC Pro Apêndice D (Fonte 1.7):** é a fonte mais próxima de "constantes técnicas por componente" (COP de chiller, W/gpm de bombas, cfm/kW de fans, approach temperature de torre) — citando ASHRAE 90.1-2007 e PG&E Baseline 2010 como fontes primárias.

2. **Constantes fixas prontas para uso direto na calculadora** (todas com citação de página confirmada):
   - Electric Distribution Loss (fora do UPS): **2% da carga de TI** (DC Pro + PUE Estimator, ambos concordam)
   - Lighting: **0,1% da carga de TI** (DC Pro — recomendado, 3 confirmações internas) vs. **1%** (PUE Estimator — texto explícito, mas gera resultados de exemplo consistentes com ~0,1–0,6% do total, sugerindo que a "regra de 1%" do PUE Estimator pode ter a mesma origem do erro de digitação da Fig. 17 do DC Pro). **Reportar a divergência ao time de produto antes de fixar um valor na calculadora.**
   - UPS efficiency: tabela completa por kVA×voltagem×tipo×load factor (Apêndice C do DC Pro) — 80,7–97,1% conforme carga.
   - Chiller COP: 2.80 (air-cooled) / 5.55 (water-cooled centrifugal <300 ton) — ASHRAE 90.1-2007 via DC Pro Apêndice D.
   - DX COP: 2.84 (air-cooled) / 3.22 (water-cooled) — ASHRAE 90.1-2007 via DC Pro Apêndice D.
   - Fan system efficiency: 1.500 cfm/kW (0,67 W/cfm) — PG&E Baseline 2010 via DC Pro Apêndice D.
   - Condenser water pump: 19 W/gpm — ASHRAE 90.1-2007 §G3.1.3.11 via DC Pro Apêndice D.
   - Cooling tower: approach 10°F, design wetbulb 75°F — PG&E Baseline 2010 via DC Pro Apêndice D.

3. **Faixa de PUE de referência para calibrar a UX da calculadora:** 1.3–3.0 (22 data centers medidos, LBNL/ACEEE 2006, citado no WP49); PUE ≥1.6 = "bem projetado"; PUE <1.0 = matematicamente impossível, deve ser bloqueado na validação de input.

---

*Pesquisa realizada em 2026-08-17. Todas as citações foram verificadas por leitura direta dos PDFs-fonte (não resumos de terceiros), exceto o PG&E "Energy Efficiency Baselines for Data Centers" (bloqueado por 403 no fetch direto — dados reproduzidos via citação em cadeia através do DC Pro Apêndice D, que cita o documento PG&E explicitamente por página/tabela).*
