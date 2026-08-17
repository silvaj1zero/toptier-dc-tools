# HANDOFF — toptier-dc-tools (sessão 2026-08-16/17)

> Leia isto primeiro ao retomar. Estado consolidado, decisões vivas e pendências.

## Estado atual (tudo no ar e sincronizado)

- **Produção:** https://ferramentas.toptier.net.br — 5 páginas: `/calculadora-pue/`, `/simulador-economia/`, `/calculadora-virtualizacao/`, `/modelador-pue/`, `/metodologia/`. Deploy automático Vercel no push para `main` (origin: `silvaj1zero/toptier-dc-tools`, repo do operador — regras multi-tenant NÃO se aplicam).
- **Git:** `main` = `d40e8c0`, working tree limpo. Gates: `npm test` (50/50), `npx tsc --noEmit` (0 erros), `npx astro build` (6 páginas).
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
