# Benchmark de mercado + Fundamentação técnica 2024-2026 + Código open-source

> Pesquisa 2026-08-15.

**TL;DR:** Não existe calculadora PUE robusta, gratuita, com marca brasileira e contexto local (ANEEL, bandeiras, mercado livre, ReData). As existentes são genéricas (EUA/global), mono-métrica (só PUE) e isca de lead B2B de fabricantes. No open-source o cenário é vazio (só um repo acadêmico Python/Jupyter). Espaço em branco real para a Top Tier.

## Parte 1 — Benchmark de mercado

| Ferramenta | Diferencial | Fraquezas |
|---|---|---|
| PUECalculator.com | Rating + comparação com benchmark global (~1,67); "AI-powered" | Raso (kWh mensal); "AI" é regra fixa; só EUA |
| Clear Decisions (clear-decisions.com/tools/pue-calculator) | Cita ISO/IEC 30134-2 e Uptime Survey 2024; honesto sobre boundaries | Moeda fixa £; lead-gen de consultoria |
| Schneider — Efficiency & PUE Calculator | Modela geografia/clima (economizer) | Gated por região; vende equipamento Schneider |
| Sunbird DCIM (Power IQ) | PUE Level 1/2/3 Green Grid, monitoramento contínuo | Exige sensores/PDUs; comercial, não standalone |
| Vertiv | Autoridade de marca | Sem calculadora própria |
| Uptime Institute | Autoridade de benchmark (Global Survey anual) | Não oferece calculadora |
| Google (datacenters.google/efficiency) | Padrão-ouro de report: PUE TTM fleet-wide, metodologia pública | Relatório corporativo, não ferramenta |
| EkkoSense (EkkoScore) | Métrica proprietária de cooling + AI real | SaaS caro, não aberto |
| Submer (SmartPUE) | Expõe gap PUE auto-relatado vs medido; imersão PUE <1,03 | Vendor-locked |
| CoolIT | Cases DLC (PUE 1,30 → 1,02) | Sem ferramenta interativa |
| Brasil (Ascenty, Schneider BR, Engetron, Jensys) | Ascenty publica PUE próprio 1,42 como prova social | **Nenhuma calculadora nativa brasileira — só conteúdo educacional. Gap mais claro.** |

Padrão: núcleo comum = Total Facility / IT (kW ou kWh) → PUE. Diferenças reais: granularidade temporal (instantâneo vs TTM — Google é padrão-ouro), cruzamento com tarifa, citação de benchmark formal, standalone vs DCIM. **Nenhuma cobre a família ISO/IEC 30134 completa (WUE, CUE, ERF, REF) numa calculadora integrada.**

## Parte 2 — Fundamentação técnica atualizada

### ISO/IEC 30134 (EN 50600-4 europeia é espelho)
- Parte 2 — **PUE** (30134-2:2026 revisada): 4 níveis conforme ponto de medição da potência de TI
- Parte 4 — ITEEsv · Parte 5 — ITEUsv · Parte 6 — **ERF** · Parte 7 — **CER** · Parte 8 — **CUE** · Parte 9 — **WUE**
- EN 50600-4: PUE, WUE, REF (Renewable Energy Factor), CER, CUE

### Outras normas
- **ASHRAE 90.4-2025** (substitui 90.4-2022): mínimos de eficiência p/ projeto/construção/operação; escopo ampliado (GEE, água); refinou cálculo de eficiência de UPS com redundância.
- **Green Grid TUE/ITUE**: ITUE = eficiência interna do TI (fans, PSUs, VRs); **TUE = ITUE × PUE** (utility → silício).

### Benchmarks de PUE (2024-2026)
- Uptime Global Survey 2025: média global **1,54** (6º ano estagnada)
- Google fleet TTM **1,09** · AWS **1,15** (melhores ~1,04) · Meta **1,08** (Luleå ~1,06)
- Hyperscale típico 1,05-1,25 vs enterprise ~1,58
- Brasil: Ascenty **1,42** · Scala **<1,4** com WUE zero em sites novos. Brasil = ~48% da capacidade LatAm, 71% da capacidade em construção.

### Regulação
- **EU EED Art. 12**: reporting anual obrigatório p/ DCs ≥500 kW de TI; 1º relatório 15/set/2024; prazo anual 15/mai (próximo: 15/mai/2026 sobre 2025). Métricas: PUE (EN 50600-4-2), WUE, ERF, REF — 24 indicadores (Delegated Regulation (EU) 2024/1364, Anexo II).
- **Alemanha EnEfG**: DCs que iniciarem operação ≥1/jul/2026 → **PUE ≤ 1,2**; existentes → ≤1,5 a partir de jul/2027 e ≤1,3 a partir de jul/2030. Emenda em discussão (abr/2026) pode relaxar novos p/ ≤1,3 — não finalizada.
- **Brasil ReData/PNDC**: PL 278/2026 aprovado na Câmara — regime especial de tributação (suspensão de II, PIS/Cofins, IPI por 5 anos), isenção estimada R$ 5,2 bi em 2026; contrapartidas: energia limpa + 2% em P&D&I nacional.
- **ANEEL/mercado 2026**: pedidos de acesso de DCs somam **38 GW**; R$ 500 bi projetados até 2030. PLD 2026: mín R$ 57,31/MWh, máx estrutural R$ 785,27/MWh, máx horário R$ 1.611,04/MWh. Bandeiras: calendário anual (mai/2026 = amarela, +R$1,885/100kWh). **Nenhuma calculadora internacional modela tarifa dinâmica/bandeira/mercado livre — diferencial BR.**

## Parte 3 — Código open-source

| Achado | Stack | Maturidade | Reaproveitamento |
|---|---|---|---|
| DC Pro Suite (LBNL/DOE, dcprotool.lbl.gov) | Web hospedada, não é repo público | Alta autoridade | **Metodologia/manual como spec funcional** (categorização de perdas: UPS, cooling, lighting, distribution) — não o código |
| nuoaleon/Data-center-PUE-prediction-tool | Python + Jupyter | 15 stars, acadêmico (paper Energy 2020) | Motor de predição física de PUE por arquitetura de cooling + clima + Sobol; exigiria reescrita p/ web |
| GitHub topics energy-calculator | HTML/JS | Baixa | Só padrão de UI |
| OpenEnergyDashboard/OED | Node.js, PostgreSQL, Plotly.js (MPL-2.0) | Alta (universidades) | Referência de arquitetura de dashboard de energia, não de fórmulas |

**Conclusão:** nada pronto para clonar com qualidade de produto → construir do zero, com spec vinda da documentação normativa (ISO/IEC 30134-2, manual DC Pro) — bom para diferenciação.

## Oportunidade de diferenciação Top Tier
**Calculadora multi-métrica (PUE + WUE + CUE + ERF), com contexto tarifário brasileiro nativo (ANEEL, bandeiras, mercado livre vs cativo, ReData) e em português.** Nenhum concorrente (nacional ou internacional) cobre essa combinação.
