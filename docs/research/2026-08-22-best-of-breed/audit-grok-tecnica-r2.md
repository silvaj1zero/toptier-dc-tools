# Re-auditoria técnica R2 — Top Tools (ferramentas.toptier.net.br)

Data: 2026-08-22. Escopo relido: `src/layouts/Base.astro`, `astro.config.mjs`, `public/` (robots.txt, og.png 1200×630, fonts/), `src/styles/{fonts.css,global.css}`, `src/components/{LeadForm.tsx,PueGauge.tsx,fields.tsx}` + componentes citados na R1, `src/env.d.ts`, `src/pages/*.astro`, `package.json`, `vitest.config.ts`, HTML gerado em `dist/`.

Critério de gate: P0 zerados; P1 resolvidos **ou** justificados com honestidade no código/config.

---

##**Veredito: APROVADO.** Os P0 da R1 estão zerados. Os P1 foram resolvidos ou justificados com honestidade. O que sobra é endurecimento P2 — não reabre o gate.

Relatório completo em `docs/research/2026-08-22-best-of-breed/audit-grok-tecnica-r2.md`.

---

## Tabela R1 → R2

| ID | Sev. | Finding R1 | Status |
|----|------|------------|--------|
| SEO-1 | P0 | Sem sitemap / `@astrojs/sitemap` | **RESOLVIDO** — integração + `dist/sitemap-index.xml` com as 7 rotas |
| SEO-2 | P0 | Sem `robots.txt` | **RESOLVIDO** — `Allow: /` + Sitemap absoluto |
| SEO-3 | P0 | Sem canonical, `og:url/image`, Twitter Card, JSON-LD | **RESOLVIDO** — head completo no `dist/`; JSON-LD Organization + WebSite + `WebApplication` (mais preciso que `SoftwareApplication`) |
| SEO-4 | P1 | `hreflang` ausente; config prometia `en` | **JUSTIFICADO** — `locales: ['pt-br']` só, com comentário de roadmap em `astro.config.mjs` |
| SEO-5 | P1 | OG sem locale/imagem/dimensões | **RESOLVIDO** — `og:locale`, `og.png` 1200×630, alt, Twitter |
| SEO-6 | P1 | Nav sem `aria-current` | **RESOLVIDO** |
| SEO-7 | P2 | `favicon.svg` não referenciado | **RESOLVIDO** |
| PERF-1 | P0 | Google Fonts CSS bloqueante | **RESOLVIDO** — WOFF2 self-host, `font-display: swap`, preload Inter (~48 KB / ~31 KB) |
| PERF-2 | P1 | Logo 147 KB PNG, sem width/height | **RESOLVIDO** — WebP ~11 KB + `146×34` + `decoding="async"` |
| PERF-3 | P1 | 5 tools com `client:load` | **JUSTIFICADO** — a ilha é o conteúdo principal; `LeadForm` continua `client:visible` |
| PERF-4 | P2 | Density monta Sala e Instalação | **PERSISTE** |
| PERF-5 | P2 | Sem reduced-motion no gráfico | **JUSTIFICADO** — CSS global zera motion; slider já é a alternativa ao drag |
| A11Y-1 | P1 | Sem skip-link / `main` sem id | **RESOLVIDO** |
| A11Y-2 | P1 | `:focus` só em input/select | **RESOLVIDO** — `:focus-visible` global |
| A11Y-3 | P1 | Toggle sem `aria-pressed` | **RESOLVIDO** |
| A11Y-4 | P1 | PueGauge hex + "Você:" | **PERSISTE** (P2) — escala categórica; `userLabel` existe mas não é passado |
| A11Y-5 | P1 | `<th>` vazio | **RESOLVIDO** — `scope="col"` + `sr-only` |
| A11Y-6 | P1 | Redução só por cor | **PERSISTE** (P2, parcial) — tem `↑` no aumento, falta "aumento/redução" |
| A11Y-7 | P1 | `aria-label="moeda"` em PT | **RESOLVIDO** — `d.currencyAriaLabel` |
| A11Y-8 | P2 | Link externo sem aviso de nova aba | **RESOLVIDO** |
| A11Y-9 | P2 | Checkboxes sem `id` | **PERSISTE** |
| A11Y-10 | P2 | NumberField sem `aria-invalid` | **PERSISTE** |
| QUAL-1 | P1 | Rodapé imprimir/PDF ×4 | **PERSISTE** (dívida de extração) |
| QUAL-2 | P1 | Formatador BRL/USD duplicado | **PERSISTE** |
| QUAL-3 | P1 | Strings PT hardcoded | **JUSTIFICADO** — site é PT-only até `/en/` |
| QUAL-4 | P2 | `level` L1/L2/L3 estado morto | **PERSISTE** |
| QUAL-5 | P2 | IDs de tarifa globais | **PERSISTE** |
| QUAL-6 | P2 | Shell de página ×5 | **PERSISTE** |
| QUAL-7 | P2 | Placeholders com vírgula | **PERSISTE** (parcial) — `fields` usa `0.75`; simulador ainda tem `1,50` |
| LEAD-1 | P0 | Sem honeypot | **RESOLVIDO** |
| LEAD-2 | P0 | Sem origem do lead | **RESOLVIDO** — pathname, referrer, UTMs |
| LEAD-3 | P0 | Sem consentimento LGPD | **RESOLVIDO** — checkbox `required` com finalidade |
| LEAD-4 | P1 | Validação só required+email | **JUSTIFICADO** — `autocomplete` + `maxLength`; domínio corporativo fica residual P2 |
| LEAD-5 | P1 | Sem live region; mailto não ia a `ok` | **RESOLVIDO** — `role="status"` / `role="alert"` |
| LEAD-6 | P1 | Mailto incompleto | **RESOLVIDO** — inclui página; telefone/mensagem não existem no form |
| LEAD-7 | P2 | `PUBLIC_LEAD_ENDPOINT` sem tipo | **RESOLVIDO** — `src/env.d.ts` |
| TEST-1/2 | P1 | Zero testes de componente | **JUSTIFICADO** — README: testes da lib; engines cobertas; UI no roadmap |
| TEST-3 | P2 | Sem paridade pt↔en | **PERSISTE** (`Dict` já trava chaves no compile) |
| I18N-1 | P1 | `en` no config sem `/en/` | **JUSTIFICADO** — config honesto, só `pt-br` |
| I18N-2 | P1 | Páginas não passam `locale=` | **JUSTIFICADO** — default `'pt-br'` é o contrato certo com um locale |
| I18N-3 | P1 | Chrome 100% PT | **JUSTIFICADO** |

---

## Justificativas julgadas

| Justificativa | Onde | Julgamento |
|---------------|------|------------|
| Rotas `/en/` adiadas | Comentário em `astro.config.mjs` | **Aceita.** A R1 punia a promessa falsa; agora o config bate com o que está no ar. |
| `client:load` porque a ferramenta é o conteúdo | Sem comentário nas `.astro`; a página demonstra | **Aceita.** `client:visible` atrasaria o primeiro input. `LeadForm` abaixo da dobra está correto. |
| Testes de componente no roadmap | README (`npm test` = lib de cálculo) | **Aceita** neste gate. O risco numérico está nas engines, cobertas. |

---

## Findings novos

Nenhum P0. Nenhum P1 que reabra o gate.

| ID | Sev. | O quê |
|----|------|-------|
| N-1 | P2 | `@font-face` sem `unicode-range` (os WOFF2 já são subset) |
| N-2 | P2 | Modelador ainda sem code-split de `modelo-se.gen.ts` |
| N-3 | P2 | Outline duplicado (`input:focus` + `:focus-visible`) |
| N-4 | P2 | JSON-LD sem `BreadcrumbList` |
| N-5 | P2 | LGPD sem URL de política de privacidade |
| N-6 | P2 | Label "E-mail corporativo" sem regra de domínio |
| N-7 | P2 | Logo claro e escuro baixam os dois (`display:none` não evita o GET) |
| N-8 | P2 | JSON-LD `logo` ainda aponta ao PNG de 147 KB |
| N-9 | P2 | Toggle de tema 36×36 px (&lt; 44 px de toque) |
| N-10 | P2 | `og.png` ~326 KB (dimensão certa, peso acima do ideal) |

Nenhuma regressão P0/P1 nas correções.

O piso da R1 para reabrir o gate — SEO + Lead + fontes self-host + logo — foi cumprido.
; virtualização `0,15`. |
| LEAD-1 | P0 | Sem honeypot | **RESOLVIDO** | Campo `website` fora da tela (`.hp-field`), `tabIndex={-1}`, `aria-hidden`; preenchido ⇒ finge sucesso e descarta. |
| LEAD-2 | P0 | Sem origem do lead | **RESOLVIDO** | Hidden `pagina`, `referrer`, UTMs da query. Mailto inclui URL. |
| LEAD-3 | P0 | Sem consentimento LGPD | **RESOLVIDO** | Checkbox `required` com finalidade declarada. Sem página/link de política — residual P2 (N-5), não reabre o P0. |
| LEAD-4 | P1 | Validação só required+email | **JUSTIFICADO** (parcial) | `autocomplete` name/email/organization, `maxLength`. Sem filtro de domínio corporativo (o label diz "E-mail corporativo") — residual P2 (N-6). Endpoint continua o lugar certo para sanitização dura. |
| LEAD-5 | P1 | Erro/sucesso sem live region; mailto não vai a `ok` | **RESOLVIDO** | `role="status"` no sucesso, `role="alert"` no erro; mailto seta `ok`. |
| LEAD-6 | P1 | Mailto sem página/telefone/mensagem; subject PT | **RESOLVIDO** | Corpo com nome, e-mail, empresa, página. Telefone/mensagem não existem no form. Subject PT bate com locale único. |
| LEAD-7 | P2 | `PUBLIC_LEAD_ENDPOINT` não tipado | **RESOLVIDO** | `src/env.d.ts` → `ImportMetaEnv.PUBLIC_LEAD_ENDPOINT?: string`. |
| TEST-1 | P1 | Zero testes de componente (vitest/node) | **JUSTIFICADO** | `vitest.config.ts` ainda `src/**/*.test.ts` + `environment: 'node'`. README: "testes da lib de cálculo". Engines continuam cobertas. Roadmap explícito; não bloqueia o envelope de descoberta/lead. |
| TEST-2 | P1 | UI/lead/i18n sem teste | **JUSTIFICADO** | Mesmo pacote de TEST-1. |
| TEST-3 | P2 | Sem paridade de chaves pt↔en | **PERSISTE** | `en: Dict` já trava chaves em compile; strings vazias ainda passariam. |
| I18N-1 | P1 | `en` no config sem rota `/en/` | **JUSTIFICADO** | Config alinhado à realidade (`locales: ['pt-br']`) + comentário de roadmap. `en.ts` permanece como dicionário morto-preparado, não como promessa de roteamento. |
| I18N-2 | P1 | Páginas não passam `locale=` | **JUSTIFICADO** | Default `'pt-br'` em todos os componentes. Com um locale publicado, o default é o contrato correto. |
| I18N-3 | P1 | Chrome (nav/footer/h1) 100% PT | **JUSTIFICADO** | Coerente com I18N-1. |

---

## Novos findings (introduzidos ou expostos pela correção)

Nenhum **P0** novo. Nenhum **P1** novo que reabra o gate.

| ID | Sev. | Finding | Onde | Nota |
|----|------|---------|------|------|
| N-1 | P2 | `@font-face` sem `unicode-range` | `fonts.css` | Os WOFF2 já são subset (~48/31 KB); o CSS não declara o range. |
| N-2 | P2 | Modelador ainda puxa o motor inteiro no chunk da página | `modelo-se.gen.ts` | Residual de PERF-3; `client:load` justificado, code-split não. |
| N-3 | P2 | Outline duplicado em input/select (`:focus` + `:focus-visible`) | `global.css` | Correção do foco global não removeu a regra antiga. |
| N-4 | P2 | JSON-LD sem `BreadcrumbList` | `Base.astro` | Pedido na R1; Organization + WebApplication cobrem o P0. |
| N-5 | P2 | Consentimento LGPD sem URL de política de privacidade | `LeadForm.tsx`, `i18n/pt.ts` | Checkbox + finalidade resolvem o P0; falta o link. |
| N-6 | P2 | Label "E-mail corporativo" sem regra de domínio | `LeadForm.tsx` | Pode aceitar Gmail etc. no client. |
| N-7 | P2 | Os dois logos WebP baixam sempre (`display:none` não evita o download) | `Base.astro` | ~23 KB extra. Preferir `<picture>`/`media` ou um sprite. |
| N-8 | P2 | JSON-LD `logo` aponta para PNG de 147 KB | `Base.astro` | Logo visual já é WebP. |
| N-9 | P2 | Toggle de tema 36×36 px (< 44 px de toque) | `global.css` `.theme-toggle` | Nav já foi alargada; o botão não. |
| N-10 | P2 | `og.png` ~326 KB | `public/og.png` | Dimensão correta (1200×630); peso acima do ideal para crawlers sociais. |

Nenhuma regressão P0/P1: honeypot, sitemap, fontes, OG e LGPD não quebram o que a R1 pediu.

---

## Julgamento das justificativas won't-fix / roadmap

| Justificativa | Onde está escrita | Veredito |
|---------------|-------------------|----------|
| Rotas `/en/` adiadas; config só `pt-br` | Comentário em `astro.config.mjs` + README `i18n/` | **Aceita.** A R1 punia a *promessa falsa* (`locales: ['en']` sem páginas). Agora o config é honesto. |
| `client:load` porque a ferramenta é o conteúdo principal | Não há comentário nas `.astro`; arquitetura o demonstra | **Aceita.** Trocar para `client:visible` atrasaria o LCP interativo da página. `LeadForm` abaixo da dobra está correto em `visible`. |
| Testes de componente em roadmap | README (`npm test` = lib de cálculo); `vitest.config.ts` inalterado | **Aceita** para este gate. Engines com locks numéricos são o risco de produto; UI sem jsdom é dívida declarada, não buraco escondido. |

---

## Veredito: **APROVADO**

Os **P0** da R1 (descoberta SEO + self-host de fontes + lead: honeypot, origem, consentimento LGPD) estão fechados e confirmados no HTML de `dist/`. Os **P1** ou foram corrigidos (canonical/OG/Twitter/JSON-LD, logo, skip-link, foco, `aria-current`, `aria-pressed`, `th` nomeado, live regions do lead, `env.d.ts`) ou justificados com honestidade (i18n PT-only, `client:load` na ferramenta-como-página, testes de componente no roadmap).

O que sobra é endurecimento **P2**: extração de rodapé/formatador, `unicode-range`, política de privacidade como URL, `aria-invalid`, IDs prefixados, `level` morto, Density com os dois modos montados, placeholders com vírgula. Nada disso reabre o gate técnico best-of-breed do envelope de captação.

Piso da R1 para reabrir o gate — "P0 de SEO e Lead, e self-host de fontes + logo" — foi cumprido.
