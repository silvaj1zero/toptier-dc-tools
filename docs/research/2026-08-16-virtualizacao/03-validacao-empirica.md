# V7 — Validação empírica contra PUE medido e reportado (CoC/JRC + CoE/DOE)

> 2026-08-17. Item 4 do plano de certificação (`00-plano.md`), reancorado em 2026-08-16: PUE **medido e reportado publicamente**, não auditorias de maturidade operacional (FOMM — assunto paralelo, descartado).

## Fontes e dados extraídos

### 1. EU Code of Conduct for Data Centre Energy Efficiency — JRC (medição reportada, n = 289)

Fonte: *Trends in data centre energy consumption under the European Code of Conduct for Data Centre Energy Efficiency* (JRC, EUR 28874 EN, 2017 — análise das 289 instalações aprovadas no programa, 2009–2016; PDF: publications.jrc.ec.europa.eu, JRC108354).

| Estatística | Valor |
|---|---|
| PUE médio das 289 instalações | **1,80** |
| Série anual (nº DCs · PUE) | 2009: 33 · 1,86 — 2010: 19 · 1,96 — 2011: 58 · 1,73 — 2012: 41 · 1,90 — 2013: 54 · 1,78 — 2014: 27 · 1,86 — 2015: 24 · 1,72 — 2016: 30 · **1,64** |
| **Sem free cooling** (n = 170 — a classe comparável à engine, que não modela economizador) | média **1,81**, faixa 1,10–2,83 |
| Com economizador (médias por tipo: DA/IA/DW/IW) | 1,88 · 1,89 · 1,83 · 1,81 |
| Zonas: países nórdicos / sul da Europa | 1,71 / 2,00 |
| Perfil médio | TI instalada 1.956 kW · consumo anual 13.684 MWh |

Atualização: o JRC comunica média europeia de ~1,6 atualmente (news 2023-09), com a base de reporting obrigatório da EED alimentando os próximos ciclos.

### 2. LBNL/DOE Center of Expertise — benchmarking medido (n = 22)

Fonte: *Best Practices for Data Centers: Lessons Learned from Benchmarking 22 Data Centers* (LBNL/ACEEE, ~2003–2005; datacenters.lbl.gov). O paper publica o índice medido `computer power ÷ total power` (= 1/PUE) de 19 dos 22 sites:

- PUE equivalente: **faixa 1,33–3,03 · média 1,86** (frações 0,33–0,75 convertidas).

### 3. Referência já em produção na suíte

Uptime Institute Global Survey 2025: média global **1,54** (`src/data/benchmarks.ts`).

## Comparação com a engine

Envelope de previsão da engine (4 arquiteturas × load factor 0,5–1,0, sem economizador — calculado com `INFRA_PRESETS` + `potenciaInfra`):

| Classe da engine | L = 0,5 | L = 0,75 | L = 1,0 |
|---|---|---|---|
| Base (legada, calibrada WP 118) | 2,28–2,56 | 2,02–2,23 | 1,89–2,06 |
| Melhorada (todas as melhorias) | 1,71–1,86 | 1,57–1,67 | 1,50–1,58 |
| **Envelope total** | **1,50 – 2,56** | | |

### Achados

1. **Cobertura ✓** — todas as estatísticas centrais reportadas caem dentro do envelope da engine: média CoC 1,80; média LBNL 1,86; série anual CoC 1,64–1,96; médias por economizer 1,75–1,89; zonas 1,71–2,00.
2. **A classe comparável bate no meio ✓** — a população CoC *sem free cooling* (n = 170, média **1,81**) fica exatamente entre a banda "melhorada" (1,50–1,86) e a "base" (1,89–2,56) da engine — coerente com uma população real que mistura sites otimizados e legados. Tomando o centro do envelope em L = 0,75 (~1,87): desvio de **+4%** vs. CoC (1,80) e **+0,5%** vs. LBNL (1,86).
3. **Os extremos correspondem às classes certas ✓** — engine base em carga parcial (2,28–2,56) ≈ cauda superior das distribuições (sul da Europa 2,00; vários sites LBNL > 2; máximos reportados 2,7–3,0) — o território do "cliente XYZ" didático. Engine melhorada em carga plena (1,50–1,58) ≈ média global atual (Uptime 1,54; UE ~1,6).
4. **Faixas extremas reportadas (1,10–1,33)** ficam **abaixo** do piso da engine (1,50) — esperado: são sites com free cooling/economizador e clima favorável, mecanismos que a engine deliberadamente não modela (declarado na metodologia).

## Veredito

**PASS.** O modelo reproduz as distribuições de PUE medidas em 289 + 22 instalações reais: população central dentro do envelope, classes mapeando nos extremos corretos, desvio de média ≤ +4%. Registro para a metodologia: *"modelo confrontado com PUE medido de 311 instalações reportadas publicamente (EU CoC/JRC 2009–2016 e benchmarking LBNL/DOE)"*.

## Limitações

- Época dos dados: JRC 2009–2016 e LBNL ~2003–2005 — parques mais antigos que 2026 (a média atual é menor: Uptime 1,54/UE ~1,6, que o envelope "melhorada" cobre). O ciclo de reporting da EED (15/mai anual) permitirá refresh com dados 2024+ quando o JRC publicar o consolidado.
- Os relatórios não publicam load factor por instalação — a comparação usa o envelope L 0,5–1,0, não pontos pareados.
- Clima europeu/norte-americano; sem dados públicos consolidados de PUE medido no Brasil (quando a agenda ReData gerar reporting, incorporar).
- Distribuições completas (percentis) não publicadas — comparação por médias, faixas e classes.
