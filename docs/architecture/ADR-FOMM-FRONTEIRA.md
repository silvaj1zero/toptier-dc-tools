# ADR-FOMM-FRONTEIRA — Fronteira do conteúdo FOMM entre suíte, site institucional e TierScope

- **Status:** APPROVED (decisão do founder em 2026-08-23, via elicitação no project-master)
- **Contexto de origem:** pendência registrada em `docs/HANDOFF.md` (sessão 2026-08-22) — colisão
  apontada por `docs/research/2026-08-22-best-of-breed/03-integracao-toptier-site.md` com o
  ADR-SITE-TECH-FOUNDATION do repo TTI-Web-Renew-2026.
- **Fundamentação:** parecer do @architect (2026-08-23), leitura read-only dos dois repos.

## Contexto — são TRÊS superfícies, não duas

A colisão foi originalmente descrita como "suíte × site novo". A investigação mostrou que a
"calculadora FOMM 0–1229" citada no ADR-SITE-TECH-FOUNDATION (D2) **não pertence ao site
institucional**: ela é do protótipo **TierScope** (superfície W3 do ecossistema multi-marca), um
produto de software separado, ainda **sem ADR de marca/domínio** (pré-requisito registrado no
CLAIMS-COMPLIANCE do W3). Hoje não existe nenhuma calculadora FOMM implementada no código do
site institucional — apenas menções textuais herdadas do Wix.

| Superfície | Papel | Estado |
|---|---|---|
| **Suíte** — `ferramentas.toptier.net.br` (este repo) | Pré-Diagnóstico FOMM educacional/lead-gen: 18 perguntas, 7 disciplinas, escala 1–5 (WP #197) | Vivo em produção; auditado em goal-loop multi-LLM contra o gate de claims (2026-08-22) |
| **Site institucional** — `toptier.net.br` (repo TTI-Web-Renew-2026) | Autoridade institucional: "o que é FOMM", serviços de avaliação/assessoria | Menções textuais a FOMM (`src/pages/servicos.astro`, `.mdoc` de serviço + PDF legado do Wix) — conteúdo NÃO auditado contra o gate de claims |
| **TierScope** (protótipo W3, sem repo de produção) | Dono natural do score 0–1229 e das faixas Merit/Leadership/Excellence | Protótipo; bloqueado por ADR de marca/domínio ainda não feito |

## Decisão — Opção A + extra B

1. **O FOMM interativo vive exclusivamente na suíte.** O Pré-Diagnóstico (quiz, engine
   `src/lib/fomm.ts`, gate de registro de leads) é da suíte e não será replicado nem migrado para o
   site institucional nesta fase.
2. **O site institucional trata FOMM apenas como conteúdo institucional e LINKA para a suíte.**
   Extra B (baixo custo, executado no repo TTI-Web-Renew-2026): a página de serviço
   "Avaliação/Assessoria em Missão Crítica" ganha CTA para o Pré-Diagnóstico
   (`https://ferramentas.toptier.net.br/maturidade-operacional/?utm_source=site&utm_medium=cta`)
   e seu texto é auditado contra o gate de claims (ver invariante I-1).
3. **A "calculadora completa" (score 0–1229) pertence ao TierScope**, que só a publicará após seu
   próprio ADR de marca/domínio. Nem a suíte nem o site institucional antecipam esse produto.
4. **Opção C (migrar o quiz para o site) foi rejeitada** nesta fase: o site ainda fecha débitos de
   EPIC-4/5, FOMM não consta no SOT/backlog dele, e a migração descartaria o motor testado e o
   histórico de auditoria de claims da suíte.

## Invariantes (valem para QUALQUER superfície, independentemente de evolução futura)

### I-1 — Gate de claims (texto literal, fonte única de verdade)

> Nunca publicar: "certificação TopTier/TierScope", "FOMM proprietário da TopTier", "licença
> exclusiva LATAM", "1.229 pontos", escala "0–5", "ROI 150–300%". Taxonomia segura: 7 disciplinas ·
> 26 elementos (WP #197 público) / 25 elementos · 78 subelementos (instrumento TTI R10, uso
> interno) · níveis 1–5 · "TopTier audita, ICOR reconhece (Merit/Leadership/Excellence)". CTA:
> **"Solicitar diagnóstico de prontidão FOMM"** (sem preço — ofertas "sob consulta" por decisão do
> founder, SLA de resposta ≤1 dia útil).

Complemento autorizado pelo founder (2026-08-23): bloco de autoridade comercial — metodologia
exclusiva com score/software proprietários (TierScope), 10+ anos em clientes líderes, Zero Outage
(IBM), "certificações FOMM via ICOR Internacional", `Top Tier Infrastructure®` nas superfícies de
marca. A ferramenta segue sem emitir certificação.

### I-2 — Ownership de conteúdo FOMM público

O SOT do texto/taxonomia FOMM pública é **este repo** (o único cujo conteúdo passou por auditoria
multi-LLM contra o gate). Alterações de vocabulário FOMM em outra superfície devem citar este ADR.

### I-3 — Canonical/SEO

- Suíte = autoridade canônica de **"faça o diagnóstico"** (intenção funcional).
- Site institucional = autoridade canônica de **"o que é FOMM / serviços"** (intenção informacional).
- Nenhuma das duas publica página que dispute a keyword da outra; sitemaps permanecem independentes
  (domínios distintos).

### I-4 — Funil de leads

Hoje há dois canais vivos e desconectados: Formspree (suíte, `PUBLIC_LEAD_ENDPOINT`) e
Resend (site, `functions/api/contact.ts`). **Decisão:** manter os dois canais por enquanto; a
costura `functions/api/tool-lead.ts` (desenhada em `03-integracao-toptier-site.md` §2) fica como
**opcional, pós-cutover**, a implementar no repo do site quando o CRM (tiercrm) estiver pronto para
receber. Nenhuma superfície cria um terceiro canal.

### I-5 — Token de marca (registro de fato, fora de escopo de execução)

O verde da suíte (`#00a651`, `src/styles/global.css`) é o hex **desatualizado** do BRAND_GUIDE; o
valor correto medido do logo oficial é `#00923F` (ADR-DS-V2-BRAND-SYSTEM do site novo). O rebrand
da suíte para o token correto é backlog deliberado — não é colisão irresolvida.

## Follow-ups (fora deste repo — executar no TTI-Web-Renew-2026)

| # | Ação | Onde |
|---|---|---|
| F-1 | Auditar `src/pages/servicos.astro` e o `.mdoc` "Avaliação/Assessoria" contra I-1 | TTI-Web-Renew-2026 |
| F-2 | Decidir o destino do PDF legado "VERIFICAÇÃO/CERTIFICAÇÃO DE OPERAÇÕES FOMM" (rehost do Wix, anterior ao gate): adequar, remover ou documentar como exceção com prazo | TTI-Web-Renew-2026 |
| F-3 | Adicionar CTA "Solicitar diagnóstico de prontidão FOMM" → Pré-Diagnóstico da suíte (com UTM) | TTI-Web-Renew-2026 |
| F-4 | (Opcional, pós-cutover) `functions/api/tool-lead.ts` unificando leads da suíte no pipeline Resend/CRM | TTI-Web-Renew-2026 |
| F-5 | ADR de marca/domínio do TierScope antes de qualquer publicação do score 0–1229 | TierScope (futuro) |

## Referências

- `docs/research/2026-08-22-best-of-breed/03-integracao-toptier-site.md` (plano de integração + gate)
- `docs/research/2026-08-22-best-of-breed/04-relatorio-final.md` (auditorias/goal-loop)
- TTI-Web-Renew-2026: `docs/architecture/ADR-SITE-TECH-FOUNDATION.md` (D2),
  `docs/architecture/ADR-EPIC4-CUTOVER-SEO.md` (D6), `docs/architecture/ADR-DS-V2-BRAND-SYSTEM.md` (D1),
  `evaluation/RUN-2026-07-23-TTI-MME-01/builders/builder-1/W3/CLAIMS-COMPLIANCE.md`
