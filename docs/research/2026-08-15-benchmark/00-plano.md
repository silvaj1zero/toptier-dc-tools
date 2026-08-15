# Plano — Top Tier DC Tools (v0, aguardando decisões)

> 2026-08-15. Suíte de ferramentas web de eficiência energética da Top Tier, substituindo as ferramentas de terceiros usadas no MBA de Infraestrutura de Ambientes Críticos (42U, Schneider, LBL) e servindo de lead-gen associado a www.toptier.net.br. Repo separado do site.

## Por que agora (síntese da pesquisa)
1. O deck hands-on do MBA depende 100% de ferramentas de terceiros, em inglês, com branding alheio (42U slides 9-10, LBL 6-8, Schneider 11-13).
2. As calculadoras 42U estão tecnicamente obsoletas: tarifa DOE/EIA de 2010, benchmark "average PUE 2.0/2.5" (hoje 1,54), DCiE descontinuado, fator de carbono opaco, sem WUE/CUE, UX ~2012.
3. Gap de mercado confirmado: nenhuma calculadora PUE nativa brasileira; nenhuma concorrente cobre a família ISO/IEC 30134 integrada; nada open-source maduro travando o espaço.
4. O deck teórico do curso (15/05/2026) já ensina exatamente a fundamentação que as ferramentas devem materializar: métricas holísticas, EED, EnEfG, CUE/WUE, matriz energética BR.

## Princípios de produto
- **Transparência metodológica total** — toda fórmula, fator e fonte exposta na tela (antítese da 42U).
- **Fundamentação normativa** — ISO/IEC 30134, EN 50600-4, ASHRAE 90.4-2025, Green Grid, Uptime 2025.
- **Contexto brasileiro nativo** — tarifas ANEEL por distribuidora, bandeiras, mercado livre vs cativo, fator de emissão SIN/MCTI, ReData.
- **Dupla função** — ferramenta didática do MBA (exercícios hands-on) e ativo de marketing/SEO/lead-gen da Top Tier.
- **Client-side first** — cálculo no navegador, sem backend no MVP (deploy estático barato e rápido).

## Fases

### Fase 0 — Fundação (decisões + scaffold)
- Repo separado (proposta: `toptier-dc-tools`), subdomínio (proposta: `ferramentas.toptier.net.br`), deploy estático (Vercel/Netlify/Pages).
- Stack proposta: Astro ou Next.js estático + TypeScript + React para os widgets de cálculo; i18n preparado (PT-BR primeiro).
- Identidade visual Top Tier (logo, cores, tipografia do site atual).
- Dataset local versionado: tarifas médias por distribuidora (ANEEL), fator de emissão mensal do SIN (MCTI), benchmarks Uptime/hyperscalers, fatores de equivalência BR.

### Fase 1 — MVP: as duas réplicas melhoradas
**Ferramenta 1 — Calculadora PUE (e DCiE legado)** [substitui 42u.com/measurement/pue-dcie.htm]
- Inputs: carga de TI (kW ou kWh/período), carga total, nível de medição (Green Grid/ISO L1 concessionária · L2 PDU · L3 equipamento), tarifa (preset distribuidora ANEEL + bandeira, ou valor custom, ou mercado livre), UF/região.
- Outputs: PUE com gauge vs benchmarks 2025 (global 1,54 · hyperscale 1,09-1,15 · Brasil 1,42), DCiE marcado como métrica legada (1/PUE), custo anual em R$, carbono via fator SIN real, leitura regulatória ("passaria no EnEfG ≤1,2?", "estaria no escopo da EED?").
- Opcionais: WUE (L/kWh) e CUE (kgCO₂e/kWh) se o usuário tiver os dados — nenhum concorrente integra.
- Página educacional acoplada em PT-BR: o que é PUE, os 4 níveis de medição, limitações, greenwashing (modernizando o conteúdo editorial da 42U).

**Ferramenta 2 — Simulador de Economia de Energia** [substitui 42u.com/efficiency/energy-efficiency-calculator.htm]
- Inputs: PUE atual → PUE alvo, carga de TI, tarifa (mesmo seletor BR), horizonte 1/5/10 anos.
- Outputs: kWh, R$, tCO₂e evitadas (fator SIN), equivalências brasileiras (residências atendidas/mês, árvores, carros) com fatores expostos.
- Extra vs 42U: sugestão de medidas típicas para cada faixa de ganho de PUE (containment, setpoint ASHRAE, placas cegas, VFD, free cooling) — conecta com o conteúdo do curso.
- Export PDF com marca Top Tier (relatório que o aluno/lead guarda e distribui).

### Fase 2 — Material didático de apoio
- Página "Metodologia" (fundamentação completa com referências — vira leitura obrigatória do módulo).
- Novo deck hands-on: substituir slides 6-13 por roteiro guiado nas ferramentas Top Tier, com dados brasileiros.
- Integração com o Estudo de Caso R2 existente (resolver o caso usando as ferramentas).
- Guia do aluno (PDF) + gabarito do professor.

### Fase 3 — Marketing
- SEO PT-BR: "calculadora PUE", "eficiência energética data center", "PUE data center Brasil" — espaço vazio confirmado.
- Lead-gen moderno: e-mail para receber o relatório PDF (sem dark pattern), funil → MBA, cursos, consultoria Top Tier.
- Selo "Ferramenta oficial do MBA de Infraestrutura de Ambientes Críticos".
- Conteúdo de lançamento: post/LinkedIn comparando benchmark 2010 vs 2025 (gancho: "sua calculadora de PUE está te enganando").

### Fase 4 — Roadmap da suíte (ranking da pesquisa)
1. TCO build vs. colocation · 2. CapEx calculator · 3. Pegada de carbono lifecycle com dados BR · 4. Power sizing · 5. Economizer/clima BR · 6. Capacity planning · 7. UPS efficiency · 8. Li-ion vs VRLA TCO · 9. Air management · 10. AC vs DC.

## Decisões em aberto (para o Zero)
1. Nome do repo e subdomínio; repo público ou privado.
2. Escopo do MVP: só PUE/savings ou já com WUE/CUE opcionais (recomendado: incluir).
3. Lead capture desde o v1 (precisa de serviço de forms/e-mail) ou v1 sem captura.
4. PT-BR only ou bilíngue desde o início.
5. Onde o repo vive: workspace/businesses/tti-agency/repos/ (padrão) + GitHub silvaj1zero.

## Pesquisa de base
- `01-anatomia-42u.md` — inputs, fórmulas, benchmarks e 10 fraquezas das duas calculadoras 42U
- `02-inventario-lbl-schneider.md` — 12 ativos LBL + 32 TradeOff Tools Schneider + ranking top 10
- `03-benchmark-metricas-oss.md` — mercado, ISO/IEC 30134, regulação (EED/EnEfG/ReData/ANEEL), open-source
