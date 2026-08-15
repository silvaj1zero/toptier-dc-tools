# Inventário — LBL Center of Expertise + Schneider TradeOff Tools

> Pesquisa 2026-08-15. LBL via fetch direto; Schneider via browser real (se.com bloqueia fetch com 403/Akamai).

## 1. LBL — datacenters.lbl.gov/tools (12 ativos)

Kit de **auditor de campo** ligado ao programa DOE DCEP. Majoritariamente planilha/PDF; valor didático alto (rigor metodológico), UX datada.

| Ferramenta | O que faz | Formato | Viva? |
|---|---|---|---|
| DC Pro Tool | Profiling early-stage: PUE estimado + mapa de oportunidades | Web app | Ativa, datada |
| Energy Assessment Process Manual | Guia passo a passo de assessment | PDF | Legado |
| Energy Assessment Worksheet | Compila métricas/ações da auditoria | Excel | Legado |
| Master List of Efficiency Actions | Checklist de boas práticas (cooling, air mgmt) | PDF | Referência sólida |
| IT Efficiency Tool | Oportunidades de upgrade de TI | Excel | Legado |
| Air Management Tool | Avalia containment/hot-cold aisle → economia de chiller/fan | Web app | Ativa |
| Air Management Estimator | Versão simplificada | Web app | Ativa |
| Air Management Lookup Tables | Economia tabulada por cenário | PDF | Estática |
| Electrical Power Chain Tool | Transformador/gerador/UPS/PDU → economia + payback | Excel | Legado |
| Energy Assessment Report Template | Template de relatório | Word | Estática |
| Sample Assessment Report | Exemplo preenchido | PDF | Estática |
| Energy Assessment Kit Guide | Sensores wireless mesh p/ assessment expedito | PDF | Estática |

Externos linkados: EnergyPlus, Modelica Buildings Library.

## 2. Schneider Electric — 32 TradeOff Tools (todas web, ativas, lead-gen)

1. Data center capital cost (CapEx) calculator
2. Data center lifecycle CO₂e calculator
3. Micro data center lifecycle CO₂e calculator
4. Single-phase UPS efficiency calculator
5. Three-phase UPS efficiency calculator
6. eConversion vs. double conversion calculator
7. DCIM monitoring value calculator (distributed IT)
8. DCIM planning and modeling value calculator
9. Single-phase Li-ion vs. VRLA UPS TCO calculator
10. Three-phase Li-ion vs. VRLA UPS battery TCO calculator
11. Edge UPS fleet management calculator
12. Site electricity emission factor calculator
13. Prefabricated data center service ROI calculator
14. Prefabricated vs. traditional cost calculator
15. **Data center efficiency and PUE calculator** ← core copiado pelo mercado
16. Three-phase UPS modernization calculator
17. Data center electrical power sizing calculator
18. Data center carbon footprint calculator
19. Data center build vs. colocation TCO calculator
20. Data center and edge global energy forecast
21. Temperature rise after power loss calculator
22. Data center capacity and growth planning calculator
23. Data center InRow cooling containment selector
24. Server carbon and energy allocation calculator
25. Cooling economizer mode PUE calculator
26. Rack power architecture efficiency calculator
27. Data center IT equipment pod sizing calculator
28. Data center cooling architecture calculator
29. Traditional vs. OCP capital cost calculator
30. Flywheel vs. battery carbon footprint calculator
31. InRow ancillary IT equipment cooling calculator
32. Data center AC vs. DC efficiency calculator

## 3. Ranking — top 10 para a Top Tier replicar depois do MVP

Critérios: valor didático (MBA) · marketing/lead-gen · esforço.

| Rank | Ferramenta | Didático | Marketing | Esforço |
|---|---|---|---|---|
| 1 | Build vs. colocation TCO | Alto | Muito alto | Médio |
| 2 | CapEx calculator | Alto | Alto | Médio |
| 3 | Carbon footprint / lifecycle CO₂e (dados BR) | Alto | Muito alto (ESG) | Médio-alto |
| 4 | Electrical power sizing | Alto | Médio | Baixo-médio |
| 5 | Cooling economizer mode PUE (clima BR) | Alto | Médio-alto | Alto |
| 6 | Capacity and growth planning | Médio-alto | Alto | Médio |
| 7 | UPS efficiency (mono/tri unificado) | Médio | Médio | Baixo |
| 8 | Li-ion vs. VRLA TCO | Médio-alto | Alto | Médio |
| 9 | Air Management / containment (LBL + InRow selector) | Alto | Médio | Médio-alto |
| 10 | Traditional vs. OCP capital cost | Médio | Baixo-médio no BR | Alto |

### Observações estratégicas
- PUE/DCiE + savings (MVP) mapeiam aos itens #15/#16/#25 da Schneider — o "core" mais copiado do mercado.
- Não competir em paridade com 32 ferramentas: diferenciar em **dados brasileiros** (tarifa por distribuidora, fator de emissão SIN/MCTI, clima regional, CAPEX local).
- #1 + #2 = dupla de maior ROI de marketing (conversa de projeto real com lead qualificado).
- Carbono/ESG (#3) = maior diferenciação de curto prazo no Brasil.
- Simulação física pesada (CFD, pod sizing) → fase 2/3.
