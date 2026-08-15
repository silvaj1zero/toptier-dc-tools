# Anatomia técnica — Calculadoras 42U (referência para as versões Top Tier)

> Pesquisa 2026-08-15. Ambas as páginas ativas (copyright "1995-2026 42U.com"). O cálculo roda client-side; JS não exposto nos snapshots. Fórmulas e defaults reconstruídos a partir do texto e da UI da própria página.

## 1. Energy Efficiency / Savings Calculator
`https://www.42u.com/efficiency/energy-efficiency-calculator.htm`

### Inputs
| Campo | Nome exato na UI | Unidade | Mecanismo | Observação |
|---|---|---|---|---|
| PUE atual | "Enter Current PUE" | adimensional | slider | ponto de partida |
| PUE desejado | "Enter Desired PUE" | adimensional | slider | meta |
| Custo de energia | "kW/h Cost" | USD $ | dropdown "Select your State" (tarifas 2010 DOE/EIA) ou "Override Value" | só tarifa EUA, só USD |
| Carga de TI | "Total IT Load" | kW | campo numérico | obtido de UPS/PDU |
| Carga total | "Total Facility Load" | kW | calculado | = IT Load / PUE |

### Fórmulas (reconstruídas)
- Carga total da instalação = Total IT Load ÷ PUE
- Economia (kWh) = (Carga_atual − Carga_desejada) × 8.760 h/ano, projetada em 1/5/10 anos
- Economia financeira = kWh × custo por kWh
- Carbono = média nacional EUA de emissões da geração (fator NÃO exposto)
- Equivalência em veículos (fator NÃO exposto)

### Outputs (4 blocos × 1/5/10 anos)
Less kW/h Use · Less Power Cost · Less Carbon Tons · Less Vehicles · + Total/Desired IT & Facility Load.

### Conteúdo editorial
- "PUE & DCiE are the most widely accepted, and adopted benchmarks for efficiency in data centers"
- Argumento de venda: "CAPEX costs savings ... as much as 5-6 times the OPEX savings"
- Tarifa: "2010 Average Retail Price of Electricity (DOE/EIA)" — **travada em 2010**.

### Lead-gen
Formulário "Tell us about your project" + "Send me a copy" → follow-up comercial. CTA "Start Saving Money Now!".

## 2. PUE/DCiE — página explicativa + calculadora
`https://www.42u.com/measurement/pue-dcie.htm`

### Inputs
"Enter Total IT Load" (kW) · "Enter Total Facility Load" (kW) · "Select Country" · "Select State" · "kW/h Cost" (USD).

### Fórmulas (literais na página)
- PUE = Total Facility Power / IT Equipment Power
- DCiE = IT Equipment Power / Total Facility Power
- Exemplo: 100.000 kW total, 80.000 kW TI → PUE 1.25, DCiE 0.8 (80%)

### Outputs
Current PUE · Current DCiE · Annual Power Use · Annual Power Cost · Annual Carbon Footprint.

### Tabela de benchmark (idêntica nas duas páginas)
| PUE | DCiE | Classificação |
|---|---|---|
| 3.0 | 33% | Very Inefficient |
| 2.5 | 40% | Inefficient |
| 2.0 | 50% | Average |
| 1.5 | 67% | Efficient |
| 1.2 | 83% | Very Efficient |

### Estrutura editorial
1. "You can't control or manage what you don't measure."
2. "What is PUE? What is DCiE?" (Green Grid)
3. "DCiE and PUE Wars and Green Washing" — a página já admite que o Green Grid não pretendia comparação cross-facility
4. "PUE and DCiE Benchmarking in Laymen's Terms"
5. "How to Calculate PUE and DCiE" — 6 passos: testing schedule → objectives → power components → Total Facility Power → Total IT Load → Meaningful Action
6. Componentes: Transformer, UPS, PDU, ATS/STS, BMS
7. Frequência (Green Grid): Basic = Monthly/Weekly · Intermediate = Daily · Advanced = Continuous
8. "As much as 50% of a data center's energy bill is from infrastructure."
9. "Uptime Institute approximates an industry average PUE of 2.5"; Google/Yahoo/Microsoft com 1.15–1.21 (sem ano)

## Fraquezas (cada uma vira diferencial Top Tier)
1. **Tarifa travada em 2010** (DOE/EIA) — 16 anos desatualizada; projeções em USD sistematicamente erradas.
2. **Só EUA/USD** — sem outras moedas/regiões; inconsistência entre as duas ferramentas (uma tem Country, outra não).
3. **Benchmarks obsoletos** — "average = 2.0/2.5" reflete ~2010-2012; Uptime hoje: ~1,5-1,6. A régua infla a sensação de eficiência.
4. **Sem métricas modernas** — nada de WUE, CUE, ERE/ERF, renováveis/PPA.
5. **Fator de carbono opaco** — sem expor kg CO2/kWh nem permitir ajuste por mix regional.
6. **Sem transparência de metodologia** — usuário não vê fatores nem degraus de cálculo.
7. **DCiE é métrica descontinuada** pelo próprio Green Grid — tratada como atual.
8. **UX ~2012-2015** — PNG genéricos, layout de tabela, sem mobile-first.
9. **Inputs rasos** — sem densidade de rack, free cooling, temperatura, eficiência de UPS, virtualização.
10. **Sem export/API/embed** — output é a tela + formulário de contato.

## Papel de marketing (42U)
- SEO topo de funil: "PUE calculator", "data center energy efficiency calculator".
- Funil: calculadora → economia projetada (USD, kWh, CO2, "carros") → CTA → formulário de lead.
- Cross-sell: "reduza seu PUE" empurra para Airflow/Containment/Cooling/Power que a 42U vende.
- Autoridade evergreen: conteúdo de ~2011-2013 ainda rankeia e recebe backlinks (TRG, Nlyte, Site24x7 citam equivalentes).
