# Top Tier DC Tools

Ferramentas web de eficiência energética para data centers — [Top Tier Infrastructure](https://www.toptier.net.br). Material hands-on oficial da disciplina de Eficiência Energética e Sustentabilidade do MBA em Infraestrutura de Ambientes Críticos.

**Produção:** https://ferramentas.toptier.net.br

## Ferramentas

| Ferramenta | Rota | Substitui |
|---|---|---|
| Calculadora de PUE (com DCiE legado, WUE/CUE opcionais, benchmarks 2025, leitura regulatória) | `/calculadora-pue/` | 42u.com/measurement/pue-dcie.htm |
| Simulador de Economia de Energia (1/5/10 anos, tarifas BR + bandeiras, CO2e via fator SIN) | `/simulador-economia/` | 42u.com/efficiency/energy-efficiency-calculator.htm |
| Calculadora de Virtualização (consolidação por curve fit WP 118, paradoxo do PUE, níveis de evidência declarados) | `/calculadora-virtualizacao/` | Schneider TradeOff — Virtualization Energy Savings Calculator (descontinuada) |
| Metodologia aberta (normas, benchmarks, fórmulas) | `/metodologia/` | — |

## Princípios

1. **Transparência metodológica total** — toda fórmula, fator e fonte exposta na tela.
2. **Fundamentação atualizada** — ISO/IEC 30134, EN 50600-4, ASHRAE 90.4-2025, The Green Grid, Uptime Institute Global Survey 2025.
3. **Contexto brasileiro** — tarifas ANEEL, bandeiras tarifárias, fator de emissão do SIN (MCTI), agenda ReData.
4. **Nada inventado** — dado sem fonte verificada não entra como preset (`src/data/*` documenta fonte e ano de cada valor).
5. **Client-side first** — todo cálculo roda no navegador; site estático, sem backend.

## Stack

Astro 5 + React 19 + TypeScript · testes com Vitest · deploy estático (Vercel).

```bash
npm install
npm run dev        # desenvolvimento
npm test           # testes da lib de cálculo
npm run build      # build de produção (dist/)
```

## Configuração

| Variável | Efeito |
|---|---|
| `PUBLIC_LEAD_ENDPOINT` | Endpoint do formulário de leads (ex.: Formspree `https://formspree.io/f/XXXX`). Sem ela, o formulário degrada para `mailto:contato@toptier.net.br`. |

## Estrutura

```
src/
  data/        # benchmarks e dados BR — cada valor com fonte + ano
  lib/         # calc.ts: funções puras de cálculo (100% testadas)
  i18n/        # pt.ts (padrão) + en.ts (mesma forma; rotas EN no roadmap)
  components/  # React: calculadoras, gauge, tarifas, lead form
  pages/       # Astro: home, calculadora-pue, simulador-economia, metodologia
```

## DNS (produção)

Apontar `ferramentas.toptier.net.br` via CNAME para o alias do projeto na Vercel (instruções no dashboard do projeto → Settings → Domains).

## Roadmap

Certificação da Calculadora de Virtualização (plano em `docs/research/2026-08-16-virtualizacao/00-plano.md`): curvas LBNL/DOE nos coeficientes elétricos · validação cruzada com DC Pro · validação empírica contra sites auditados (FOMM).

Próximas ferramentas (benchmark completo em `docs/research/2026-08-15-benchmark/`): TCO construir vs. colocation · CapEx calculator · pegada de carbono lifecycle com dados BR · dimensionamento elétrico · economizador/clima BR · eficiência de UPS · Li-ion vs. VRLA.

---

© Top Tier Infrastructure. Conteúdo educacional; resultados são estimativas e não substituem medição em campo nem parecer de engenharia.
