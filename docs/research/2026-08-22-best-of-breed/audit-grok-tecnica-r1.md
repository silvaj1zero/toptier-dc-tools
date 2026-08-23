Vou auditar o código real desta suíte (Astro + React + TypeScript) nas sete dimensões pedidas, começando pelo layout, páginas, componentes, lib e config.Mapeei a árvore. Agora leio layout, config, páginas e os componentes de ferramenta em paralelo.Próximo bloco: os cinco componentes de ferramenta, LeadForm, fields, i18n e o que existe em `public/`.SEO já mostrou buracos (sem sitemap/robots/canonical). Agora leio os cinco componentes, testes e i18n de ponta a ponta.# Auditoria técnica — Top Tools (ferramentas.toptier.net.br)

Escopo lido: `src/layouts/Base.astro`, 7 páginas em `src/pages/`, 8 componentes em `src/components/`, `src/lib/*`, `src/i18n/*`, `astro.config.mjs`, `package.json`, `vitest.config.ts`, `public/`, e o HTML gerado em `dist/index.html`.

O que já está no padrão (não entra no veredito negativo): `site` canônico configurado; `title`/`description` únicos por página; `LeadForm` com `client:visible`; engines cobertas por testes (calc, virtualization, pue-model, density) com locks numéricos; `NumberField` com `htmlFor` + `aria-describedby`; resultados com `aria-live="polite"`; tema anti-FOUC.

---

## 1. SEO técnico

| Sev. | Finding | Onde | Recomendação |
|------|---------|------|----------------|
| **P0** | Sem `sitemap.xml` e sem `@astrojs/sitemap`, apesar de `site` definido. | `astro.config.mjs:5-7`, `package.json:14-18` | Adicionar `@astrojs/sitemap` e gerar sitemap na build. |
| **P0** | Sem `robots.txt` em `public/` nem no `dist/`. | `public/` (favicon + logo apenas) | Publicar `robots.txt` com `Sitemap: https://ferramentas.toptier.net.br/sitemap-index.xml`. |
| **P0** | Sem canonical, `og:url`, `og:image`, Twitter Card nem JSON-LD; o HTML de produção confirma o head incompleto. | `src/layouts/Base.astro:15-30`, `dist/index.html:1` | Completar head: canonical absoluto, `og:image` 1200×630, `og:url`, `twitter:card=summary_large_image`, JSON-LD `SoftwareApplication` + `Organization` + `BreadcrumbList`. |
| **P1** | `hreflang` ausente e `html lang` fixo em `pt-BR`, mesmo com i18n `en` no config. | `Base.astro:14`, `astro.config.mjs:8-14` | Emitir `link rel="alternate" hreflang="pt-BR"`/`en`/`x-default` e `lang` dinâmico. |
| **P1** | OG incompleto: tem `og:title/description/type/site_name`, falta locale e imagem — preview social vazio no LinkedIn/WhatsApp. | `Base.astro:21-24` | Incluir `og:locale`, `og:image:alt` e dimensões. |
| **P1** | Nav sem `aria-current="page"`; crawler e usuário não distinguem a página ativa. | `Base.astro:55-62` | Marcar o item da rota atual. |
| **P2** | `favicon.svg` existe e não é referenciado; só PNG. | `Base.astro:20`, `public/favicon.svg` | Adicionar `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`. |

---

## 2. Performance

| Sev. | Finding | Onde | Recomendação |
|------|---------|------|----------------|
| **P0** | Google Fonts via stylesheet bloqueante (Inter 400/600/700 + JetBrains 400/600), mesmo com `preconnect`. | `Base.astro:25-30` | Self-host WOFF2 com `font-display: swap` e unicode-range; remover o CSS da Google. |
| **P1** | Logo do header tem **147 KB** PNG para `height: 34px`; favicon PNG **47 KB**. Sem `width`/`height` no `<img>` → risco de CLS. | `Base.astro:52`, `public/logo-tti.png`, `global.css:185-187` | SVG ou WebP ~1–8 KB, `width`/`height` intrínsecos, `decoding="async"`. |
| **P1** | As 5 ferramentas hidratam com `client:load` + runtime React **~187 KB** (`dist/_astro/client.BlZe1zq3.js`); o modelador sozinho são **84 KB**. | `calculadora-pue.astro:19`, `simulador-economia.astro:18`, `calculadora-virtualizacao.astro:20`, `modelador-pue.astro:19`, `planejador-densidade.astro:21` | Manter `client:load` só se LCP/INP medir necessidade; senão `client:visible` (já usado no LeadForm). Code-split do `modelo-se.gen.ts` (73 KB fonte). |
| **P2** | `DensityPlanner` monta Sala **e** Instalação ao mesmo tempo (`display:none`). | `DensityPlanner.tsx:589-594` | Renderizar só o modo ativo para não calcular os dois engines. |
| **P2** | Sem `prefers-reduced-motion` (gráfico arrastável do modelador). | `PueProjectModeler.tsx:386-398` | Respeitar reduced-motion e oferecer só o slider. |

`LeadForm client:visible` está correto (abaixo da dobra).

---

## 3. Acessibilidade (5 ferramentas)

Padrão comum bom: `fieldset/legend`, labels, `aria-live="polite"` nos resultados, `NumberField` com help associado, gauge/curva com `role="img"`.

| Sev. | Finding | Onde | Recomendação |
|------|---------|------|----------------|
| **P1** | Sem skip-link; `main` sem `id`. | `Base.astro:48-111` | `<a href="#conteudo" class="skip-link">` + `id` no `<main>`. |
| **P1** | `:focus` só em `input`/`select` — links, botões, ranges e checkboxes ficam no outline nativo inconsistente. | `global.css:318-322` | `:focus-visible` global em `a, button, input, select, summary, [tabindex]`. |
| **P1** | Toggle de tema sem estado (`aria-pressed`/`aria-checked`). | `Base.astro:63-70` | Expor o tema atual no accessible name. |
| **P1** | `PueGauge` com cores hex hardcoded (não seguem o tema) e texto **"Você:"** fora do dicionário. | `PueGauge.tsx:20-27`, `PueGauge.tsx:103` | Tokens CSS + string i18n. |
| **P1** | Tabelas de comparação com `<th>`/`<td>` vazio (header sem nome). | `SavingsSimulator.tsx:139`, `VirtualizationCalculator.tsx:212`, `PueProjectModeler.tsx:432` | `<th scope="col">` com texto visível ou `sr-only`. |
| **P1** | Redução pré/pós só por cor (verde/vermelho). | `VirtualizationCalculator.tsx:226-227` | Não usar só cor; prefixar "+"/"−" já existe parcialmente — anunciar "aumento/redução". |
| **P1** | `aria-label="moeda"` hardcoded em PT. | `PueProjectModeler.tsx:295` | Usar `d.currencyLabel`. |
| **P2** | Link externo sem aviso de nova aba. | `Base.astro:62` | Completar accessible name ("abre em nova aba") + `rel="noopener noreferrer"`. |
| **P2** | Checkboxes do modelador/virtualização sem `id` próprio. | `PueProjectModeler.tsx:339-345`, `VirtualizationCalculator.tsx:170-173` | `id` estável + `htmlFor`. |
| **P2** | `NumberField` sem `aria-invalid` / mensagem de erro quando o parse falha. | `fields.tsx:16-46` | Superfície de erro associada ao input. |

Pontos positivos por ferramenta: Density usa `aria-pressed` nos modos e `aria-label` nas células; Modelador tem slider como alternativa ao drag e tabela como fallback do SVG.

---

## 4. Qualidade / duplicação

| Sev. | Finding | Onde | Recomendação |
|------|---------|------|----------------|
| **P1** | Bloco imprimir + relatório PDF copiado 4 vezes. | `SavingsSimulator.tsx:214-223`, `VirtualizationCalculator.tsx:262-271`, `DensityPlanner.tsx:529-540`, `PueProjectModeler.tsx:497-505` | Extrair `ToolReportFooter`. |
| **P1** | Formatador de moeda BRL/USD duplicado. | `VirtualizationCalculator.tsx:16-20`, `PueProjectModeler.tsx:24-29` | Um helper em `lib/calc.ts` (já tem `fmtCurrencyBRL`). |
| **P1** | Strings PT hardcoded nos componentes apesar de `en.ts`. | `PueCalculator.tsx:114`, `152`, `188-192`; `SavingsSimulator.tsx:14-42` (MEASURES); `PueProjectModeler.tsx:37` ("Cenário A") | Mover para o dicionário. |
| **P2** | `level` da calculadora PUE é estado morto (não entra no cálculo nem nas deps). | `PueCalculator.tsx:28`, `36-63` | Ou usar no resultado, ou marcar o campo como informativo (`disabled`/nota). |
| **P2** | IDs de tarifa globais (`tariff-dist`); hoje 1 instância/página, frágil. | `fields.tsx:89-121` | Prefixo por ferramenta (`idPrefix`). |
| **P2** | Shell de página (Base + intro + island + card + LeadForm) copiado 5×. | `src/pages/*.astro` | Layout `ToolPage.astro` com slots. |
| **P2** | Placeholders com vírgula (`1,80`, `0,75`) em `type="number"` (valor é ponto). | `SavingsSimulator.tsx:104,114`, `fields.tsx:115` | Placeholder `1.80` ou input `text` com parse BR. |

`fields.tsx` (`NumberField` + `TariffFields`) já é a extração certa — seguir esse padrão.

---

## 5. Lead capture — `LeadForm.tsx`

| Sev. | Finding | Onde | Recomendação |
|------|---------|------|----------------|
| **P0** | Sem honeypot. | `LeadForm.tsx:49-69` | Campo oculto (`website`/`_gotcha`) e descartar se preenchido. |
| **P0** | Sem origem do lead (ferramenta/URL/UTM). | `LeadForm.tsx:13-38` | Hidden `page`, `tool`, `pathname` e `document.referrer`. |
| **P0** | Sem consentimento LGPD: só texto passivo, sem checkbox, sem política, sem base legal. | `LeadForm.tsx:68`, `src/i18n/pt.ts:271` | Checkbox obrigatório + link da política + registro da ciência. |
| **P1** | Validação só `required` + `type="email"`; sem domínio corporativo, sem sanitização, sem limite. | `LeadForm.tsx:53-61` | Validar no client e no endpoint; `autocomplete="name email organization"`. |
| **P1** | Estados `idle/sending/ok/error` existem, mas erro/sucesso sem `role="alert"`/`aria-live`; `mailto:` não transita para `ok`. | `LeadForm.tsx:11`, `18-24`, `45-67` | Anunciar status; no fallback mailto, setar `ok` ou instruir. |
| **P1** | Fallback mailto não inclui página, telefone nem mensagem; subject hardcoded PT. | `LeadForm.tsx:19-23` | Corpo com origem + locale. |
| **P2** | `PUBLIC_LEAD_ENDPOINT` não tipado em `env.d.ts`. | `LeadForm.tsx:10`, `src/env.d.ts:1` | Interface `ImportMetaEnv`. |

O degradê sem endpoint (não quebra) é o único ponto maduro do formulário.

---

## 6. Testes

| Sev. | Finding | Onde | Recomendação |
|------|---------|------|----------------|
| **P1** | Vitest só `src/**/*.test.ts` em `environment: 'node'` — **zero testes de componente**. | `vitest.config.ts:10-13` | `jsdom` + Testing Library para LeadForm, NumberField, hidratação dos 5 tools. |
| **P1** | Engines cobertas; UI/lead/i18n não. | `src/lib/calc.test.ts`, `density.test.ts`, `pue-model.test.ts`, `virtualization.test.ts` vs `src/components/*` | Pelo menos: submit LeadForm, honeypot, parse de tarifa, locale `en`. |
| **P2** | Sem teste de paridade de chaves `pt.ts` ↔ `en.ts`. | `src/i18n/` | Teste que `Dict` não tenha buraco (já é `typeof pt`, mas strings vazias passam). |

Engines: **cobertas**. Componentes: **não**.

---

## 7. i18n

| Sev. | Finding | Onde | Recomendação |
|------|---------|------|----------------|
| **P1** | `en.ts` existe e é completo; **não há rota `/en/`** (`src/pages/en` inexistente; `Test-Path` = false). | `src/i18n/en.ts:1-272`, `astro.config.mjs:8-14`, `src/pages/` | Criar `src/pages/en/*.astro` ou prefixo Astro i18n, **ou** remover `en` do config até existir. |
| **P1** | Componentes aceitam `locale` com default `'pt-br'`; **nenhuma página passa `locale=`**. | grep `locale=` em `src/` = 0 hits | Passar `Astro.currentLocale` para cada island. |
| **P1** | Chrome de UI (nav, footer, h1 das páginas `.astro`) 100% PT, independente do locale. | `Base.astro:55-62`, `114-124`, páginas | Nav/footer no dicionário ou layout por locale. |

Conclusão i18n: dicionário EN morto; config promete bilingue e entrega só PT-BR.

---

## Veredito: **REPROVADO**

O núcleo de cálculo (ISO/IEC, locks numéricos, metodologia aberta) está no nível best-of-breed; o envelope de **captação orgânica + lead + i18n** não. Falta o stack mínimo de descoberta (sitemap/robots/canonical/OG image/schema) num site que já declara `https://ferramentas.toptier.net.br`. O `LeadForm` não atribui origem, não tem honeypot e não coleta consentimento LGPD — inaceitável para produção BR cujo objetivo declarado é lead. i18n está pela metade (`en.ts` + `locales: ['en']` sem `/en/`) e a UI das ferramentas não tem um único teste.

Corrigir os **P0** de SEO e Lead (e self-host de fontes + logo) é o piso para reabrir o gate; o resto é P1 de endurecimento.
