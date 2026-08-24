# HANDOFF — toptier-dc-tools (sessão 2026-08-23)

> Leia isto primeiro ao retomar. Estado consolidado, decisões vivas e pendências.

## Sessão 2026-08-23 (parte 2) — Deploy, ADR da fronteira FOMM e página /como-usar/

- **Deploy de produção executado e verificado:** `npx vercel --prod` rodado nesta sessão (deployment `hw4cxlie3`, aliasado para ferramentas.toptier.net.br) — home nova confirmada no ar via curl (HTTP 200, marcadores presentes). Pendência de deploy da parte 1 fechada. **Atenção: este lote (ADR + /como-usar/) ainda precisa de novo deploy após o push.**
- **ADR-FOMM-FRONTEIRA aprovado** (`docs/architecture/ADR-FOMM-FRONTEIRA.md`): decisão do founder = Opção A + extra B. Descoberta-chave do parecer do @architect: a colisão é entre **3 superfícies** (suíte × site institucional × TierScope) — a "calculadora 0–1229" do ADR-SITE-TECH-FOUNDATION pertence ao protótipo TierScope (W3), não ao site; o site novo hoje não tem calculadora nenhuma. FOMM interativo fica exclusivo da suíte; site linka; TierScope herda o score completo após ADR próprio de marca/domínio. Invariantes fixados: gate de claims literal (I-1), ownership do texto FOMM = este repo (I-2), canonical funcional×informacional (I-3), dois canais de lead mantidos com costura `tool-lead.ts` opcional pós-cutover (I-4), verde `#00a651` da suíte é hex desatualizado vs. `#00923F` do logo oficial — rebrand é backlog deliberado (I-5). Follow-ups F-1..F-4 executam no repo TTI-Web-Renew-2026 (auditar servicos.astro + PDF legado "CERTIFICAÇÃO FOMM" contra o gate, CTA para o Pré-Diagnóstico).
- **Nova página `/como-usar/`** — guia público de marketing da suíte: 3 roteiros por objetivo (custo da ineficiência ~10min · projeto/expansão ~20min · maturidade ~10min), tour ferramenta a ferramenta (você informa/você recebe/dica), 4 boas práticas e LeadForm "Quer ajuda para interpretar seus resultados?". Entrada "Como usar" na NAV global + card na home. Gate de claims verificado no HTML gerado (grep limpo). Destino natural de links do LinkedIn (adianta a Fase 3).
- Gates: `tsc` 0 · **72/72** testes · build **9 páginas** + sitemap (como-usar incluída).

## Sessão 2026-08-23 — Padrão único de captação + materiais do time

- **Captação padronizada em TODAS as ferramentas:** `LeadForm` agora segue o padrão do gate FOMM — WhatsApp opcional (com aviso de finalidade) e campo `origem` automático (slug da página) em todo lead; mailto fallback inclui WhatsApp. Strings novas em pt/en (`whatsappLabel`, `whatsappHelp`). Todo lead (LeadForm ou gate FOMM) chega ao Formspree com o mesmo esquema: origem + pagina + referrer + UTMs + LGPD.
- **Materiais do time em `docs/time/`:** `01-guia-suite.md` (explica cada ferramenta, padrão de captação, gate de claims), `02-status-time.md` (o que temos pronto), `diagrama-ecossistema.html` (SVG autocontido para envio separado — validado visualmente no Chrome) e `index.html` (página de introdução reunindo tudo, DS Silent Precision, tema claro fixo).
- **Home reescrita como página de marketing** (`src/pages/index.astro`): hero de liderança em missão crítica, credenciais (stat-grid: 25+ anos · Zero Outage IBM · DCEP/US DOE · FOMM·ICOR), **diagrama público da jornada** em 4 passos (SVG inline theme-aware com tokens `var(--tt-*)` — versão pública SEM detalhes internos de funil/Formspree), grid das 6 ferramentas com CTAs, pilares liderança/capacitação/expertise, seção "para quem" (operadores, empresas de missão crítica, engenharia) e LeadForm "Fale com um especialista em missão crítica". Gate de claims e zero-MBA respeitados.
- Gates: `tsc` 0 · **72/72** testes · build **8 páginas**. Screenshots do Chrome funcionaram no início da sessão e depois quebraram de novo (timeout de injeção; headless CLI também travou) — validação da home via read_page (a11y tree), padrão da sessão 2026-08-22.
- Pendência mantida: deploy manual `npx vercel --prod` pelo operador após push.

## Sessão 2026-08-22 (parte 2) — Goal-loop Best-of-Breed + FOMM

- **Goal-loop multi-LLM concluído com duplo APROVADO** (grok técnico R2 + gemini visual R2; codex fora — limite até 28/08). R1 reprovou ambos; lote de correções fechou todos os P0 (SEO: sitemap/robots/canonical/OG+og.png/JSON-LD; fontes self-host WOFF2; logo WebP + variante dark; LeadForm v2: honeypot/origem+UTM/LGPD; a11y: skip-link/focus-visible/aria-*) e P1 (resolvidos ou won't-fix justificado). Backlog P2 no relatório.
- **Nova ferramenta `/maturidade-operacional/`** — Pré-Diagnóstico FOMM (WP #197 Schneider: 7 disciplinas, 18 perguntas, escala 1-5, radar, gaps, CTA "diagnóstico de prontidão"). Engine `src/lib/fomm.ts` + 9 testes. **Gate de claims respeitado** (nunca "certificação"/"1.229"/"0-5" — ver 03-integracao).
- **Pesquisa versionada** em `docs/research/2026-08-22-best-of-breed/`: benchmark de mercado (grok — "a suíte que não existe" é a nossa), fontes FOMM verificadas, 5 auditorias, plano de integração com toptier.net.br (03) e relatório final com gaps/sugestões (04).
- **Pendências quentes:** (1) operador configurar `PUBLIC_LEAD_ENDPOINT` na Vercel — sem isso lead cai em mailto; (2) ADR da fronteira FOMM suíte × site novo (colide com ADR-SITE-TECH-FOUNDATION do TTI-Web-Renew); (3) deploy manual `npx vercel --prod` após push.
- **Ajuste do founder (23/08):** bloco de autoridade comercial no FOMM — metodologia exclusiva com score/software proprietários (TierScope), 10+ anos em clientes líderes, Zero Outage (IBM), certificações FOMM via ICOR Internacional; `Top Tier Infrastructure®` nas superfícies de marca. A ferramenta segue sem emitir certificação (gate de claims preservado).
- **FOMM v2 (23/08, testado pelo operador em produção):** ícone "i" com critérios por nível (WP #197 Fig. 3), **gate de registro** (resultado/folder exigem nome+e-mail; WhatsApp opcional; contato só com check de autorização — lead vai ao Formspree com perfil fomm_* completo), folder "Auditoria e Certificação FOMM" R9 em `/downloads/`, credencial ISO/IEC 17021-1. **Funil fechado:** `PUBLIC_LEAD_ENDPOINT` configurada na Vercel (Formspree `xwlezdjg`) — leads não caem mais em mailto.
- Gates finais: `tsc` 0 · **72/72** testes · build **8 páginas** + sitemap.
- Commits da rodada: `23a1890` (best-of-breed) · `bd116e9` (FOMM) · `a1c26de` (docs) · `23054f5` (autoridade/marca) · `daaab79` (gate+folder+critérios).

## Estado anterior (parte 1 da sessão)

- **Produção:** https://ferramentas.toptier.net.br — 6 páginas: `/calculadora-pue/`, `/simulador-economia/`, `/calculadora-virtualizacao/`, `/modelador-pue/`, `/planejador-densidade/` (**nova, ainda não deployada** — pendente `npx vercel --prod` pelo operador), `/metodologia/`. **Deploy é MANUAL**: `npx vercel --prod` (rodado pelo operador — o classifier bloqueia o agente). Push para `main` NÃO dispara build (verificado 2026-08-18; projeto Vercel `caos-off/toptier-dc-tools` sem integração Git). Origin: `silvaj1zero/toptier-dc-tools`, repo do operador — regras multi-tenant NÃO se aplicam.
- **Gates (2026-08-22):** `npm test` (61/61), `npx tsc --noEmit` (0 erros), `npx astro build` (7 páginas).

## Sessão 2026-08-22 — Planejador de Espaço e Densidade + Deck R6 do módulo

1. **Planejador de Espaço e Densidade** (`/planejador-densidade/`) — transpilação 1:1 das planilhas
   do método Schneider WP#155 ("Density spec room pt v5 m2" e "Density spec facility v5 m2"):
   `src/lib/density.ts` (cascata Gabinete→Pod→Sala→Instalação) + `density.test.ts` fixando os
   cenários default das planilhas (39,7 m²/1.209 W/m²; 1.986 m²/806-1.232-2.049 W/m²; 360/432 gab).
   UI `DensityPlanner.tsx` com modos Sala e Instalação. QA multi-engine: codex (1 HIGH + 9 MEDIUM)
   e gemini (3 LOW) — todos corrigidos (validação finita/inteira, área de TI > 0 obrigatória,
   aria-describedby no NumberField, th scope, aria-pressed nas abas, contraste dark via classes DS).
2. **Deck R6 do módulo "Planejamento de Espaços, Densidade e Crescimento"** (MBA Parte III) —
   didática reestruturada a partir dos WPs #155 e #144 (não da ordem do R5): 54 telas (41 slides de
   conteúdo + 6 divisores + 6 exercícios na ferramenta + fechamento), HTML+PDF no padrão do deck R4.
   Workspace: `clients/mba-brpos/08-planejamento-espacos/01-deck-r6/` + `02-guia/notas-instrutor-gabarito.md`.
   PDF também em `~/Downloads/aula-espacos-densidade-r6.pdf`.
3. **Pesquisa versionada:** `docs/research/2026-08-22-densidade/` — 00-missao, extrações fiéis das
   6 fontes (PPTX R5, DOCX, 2 WPs, 2 XLSX com fórmulas), 01-mapa-conteudo (diagnóstico do R5) e
   02-arquitetura-didatica (blueprint dos 6 blocos/41 slides/6 exercícios).
4. **Gotcha novo:** screenshots do Chrome via extensão estavam quebrados nesta sessão (3 erros CDP
   distintos); validação visual feita por read_page (a11y tree) + render de PDF via PyMuPDF (instalado).

---

# HANDOFF anterior — sessão 2026-08-16/17

- **Git:** `main` = `d40e8c0`. Gates da época: 50/50, tsc 0, build 6 páginas.
- **Posicionamento:** ferramentas são teaser público de lead-gen dos serviços/treinamentos Top Tier — **zero menções a "MBA" no site** (rebranding 2026-08-17). Material do MBA continua no workspace do cliente (ver abaixo).

## O que foi entregue nesta sessão (cronológico)

1. **Fase 2 MBA** — `workspace/businesses/tti-agency/clients/mba-brpos/07-eficiencia-energetica/`: deck hands-on **R4** (HTML+PDF, rig de apresentação, notas do instrutor com gabarito), Estudo de Caso **R4** (Parte II migrada p/ ferramenta própria), guia do aluno, gabarito determinístico. PDF também em `~/Downloads/aula-hands-on-r4.pdf`.
2. **Calculadora de Virtualização** (réplica do TradeOff descontinuado, WP 118) — V1–V7 completos: engine + testes + UI + certificação (curvas LBNL como bounds, DC Pro PASS ±20%, validação empírica 311 instalações CoC/JRC+LBNL). Plano: `docs/research/2026-08-16-virtualizacao/00-plano.md` (V4b re-baseline = major, opcional).
3. **Modelador de PUE de Projeto** (réplica EXATA da SE Data Center Efficiency and PUE Calculator) — planilha Xcelsius do dashboard **transpilada célula a célula** (`src/lib/pue-model/`, gerada por `docs/research/2026-08-17-pue-calculator/fonte-xcelsius/gerar-ts.py`). UI multi-cenário (até 4), curva PUE×carga com **marcador arrastável**, alocações, assumptions. QA loop multi-engine (codex+gemini findings corrigidos; re-verify codex+grok limpos).
4. **Goal-loop de validação massiva** — 122 cenários × 5 cargas = **610/610 pontos exatos (1e-6)** vs. ferramenta original viva; auditado por codex e gemini (APROVADO×2). Relatório: `docs/research/2026-08-17-pue-calculator/05-goal-loop-validacao.md`; protocolo em `goal-loop/`.

## Conhecimento operacional crítico (gotchas)

- **Canal de validação contra a SE viva:** a ferramenta é Xcelsius HTML5; no browser, `xcelsius.runtime.RuntimeAPI._registeredRt[0]._doc` expõe as células. Escrever: `cell.value(v)` + `doc.CalculateAllDirtyCells()`. **Economizador**: escrever a fração em `Crystal Interface r25c1` (r26c1 tem listener lazy; `PM r7c1`=23 é constante interna — NÃO tocar). Mapa completo UI→célula em `04-transpilacao-validacao.md`.
- **Chrome congela abas em background** (timers throttled, renderer freeze): processar em fatias síncronas por chamada JS, nunca runner com setTimeout; abas descartadas mudam de tabId.
- **CLIs multi-LLM instaladas na máquina:** `codex exec --sandbox read-only` · `gemini -p` (requer `GEMINI_CLI_TRUST_WORKSPACE=true`) · `grok -p`. Usadas como revisores/auditores externos.
- **tsc é gate real** (0 erros) — o bug histórico do `Dict` i18n foi corrigido (sem `as const` no pt.ts; `src/env.d.ts` existe).
- Workflow do operador: entrega por lote → pedir push 1×; commits Conventional com trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`; nunca `git add -A`.

## Pendências / próximas frentes candidatas (nenhuma bloqueante)

1. **Integração com o site principal** toptier.net.br (visual/links) + régua de e-mails para leads do formulário (`PUBLIC_LEAD_ENDPOINT` na Vercel — conferir se está configurada).
2. **Estudo de Caso R5**: migrar a Parte I (Schneider PUE Calculator) para o Modelador próprio → módulo 100% Top Tier com gabarito determinístico completo.
3. **Refresh da validação empírica** quando o JRC publicar consolidado da base EED (ciclos 2024+).
4. **V4b (opcional, major):** re-baseline da Calculadora de Virtualização com curvas LBNL como base (invalida gabarito R4 — decisão do professor).
5. Fase 3 do plano original (SEO/lançamento LinkedIn) — nunca iniciada.

## Mapa de pesquisa (tudo versionado)

`docs/research/2026-08-15-benchmark/` (origem do produto) · `2026-08-16-virtualizacao/` (WP118, certificação V1-V7) · `2026-08-17-pue-calculator/` (00-missao, R1-R3, 04-transpilação+mapa de células, 05-goal-loop, fonte-xcelsius/ com captura e scripts, goal-loop/ com protocolo e auditorias).
