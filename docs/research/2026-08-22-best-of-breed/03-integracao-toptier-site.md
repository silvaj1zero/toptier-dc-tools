# Integração Top Tools ↔ toptier.net.br — teaser e captação (F4)

> Plano operacional. Fatos de negócio levantados no workspace em 2026-08-22 (agente Explore);
> paths citados são do MASTER/workspace do operador.

## Estado real hoje

| Peça | Estado |
|---|---|
| Site principal `toptier.net.br` | Ainda **Wix** (one-page). Site novo pronto em `repos/TTI-Web-Renew-2026` (Astro + Keystatic + Cloudflare Pages), cutover pendente |
| E-mail transacional do site novo | **Resend** aprovado (ADR-EMAIL-TRANSACIONAL-O9): `functions/api/contact.ts`, remetente `site@toptier.net.br` |
| CRM | `repos/tiercrm` (fork Atomic CRM, Supabase) — em rebrand Wave 1 |
| Régua de e-mails Top Tier | Escrita (D+0/3/5/7/10 em `L4-operational/content/email/top-tier/`), **não implementada**; e-mail #3 é literalmente "auditoria". ⚠️ remetente escrito como `contato@toptierinfra.com.br` — domínio errado, corrigir para `toptier.net.br` |
| Leads da suíte | `PUBLIC_LEAD_ENDPOINT` provavelmente **não configurada** na Vercel ⇒ fallback `mailto:`. LeadForm v2 já envia origem/UTM/consentimento |

## Decisões de integração (recomendadas)

1. **Curto prazo (antes do cutover do site):**
   - Configurar `PUBLIC_LEAD_ENDPOINT` na Vercel (Formspree ou endpoint próprio) — ação do operador; o formulário já manda `pagina`, `referrer`, UTMs, e o FOMM anexa o perfil de maturidade (`fomm_*`).
   - No Wix atual: adicionar bloco "Ferramentas gratuitas" com 2-3 cards (PUE, Densidade, **FOMM**) apontando para `ferramentas.toptier.net.br` com `?utm_source=site&utm_medium=teaser`.
2. **No cutover (TTI-Web-Renew-2026):**
   - Apontar `PUBLIC_LEAD_ENDPOINT` para um `functions/api/tool-lead.ts` (novo, ~30 linhas, mesmo `_shared.ts` do Resend) ⇒ lead da suíte cai no mesmo pipeline do site, com resposta automática e cópia para o CRM (tiercrm via Supabase).
   - Seção "Ferramentas" no site novo consumindo os mesmos cards (título/desc/URL) — conteúdo em Keystatic.
   - CTA cruzado: página de serviço "Avaliação/Assessoria em Missão Crítica" (TOP PRACTICES/FOMM) linka o **Pré-Diagnóstico** como primeiro passo; a ferramenta já faz o caminho inverso.
3. **Régua de e-mails:** ativar a sequência D+0/3/5/7/10 existente para leads da suíte (o e-mail #3 "auditoria" conversa direto com quem veio do FOMM). Corrigir o domínio do remetente antes.

## ⚠️ Colisão de governança a resolver (decisão do founder)

- **ADR-SITE-TECH-FOUNDATION** (site novo) nomeia "a calculadora FOMM 0–1229" como ilha interativa principal do toptier.net.br. O Pré-Diagnóstico da suíte foi deliberadamente posicionado como **outra coisa** (quick self-score de 18 perguntas, WP #197, sem certificação) — complementar, não substituto. Ainda assim, recomenda-se **ADR curto** ratificando: suíte = pré-diagnóstico educacional/lead-gen; site/TierScope = calculadora completa e jornada de auditoria. Nota: o próprio SOT do TierScope marca o número "1.229" como claim bloqueado.
- **Identidade visual:** a suíte usa o DS verde "Silent Precision"; o site novo migrou para o eixo PROTECTION (navy + `--signal #2273bf`). Ao integrar, decidir: (a) suíte adota `tokens.css` do site novo (rebrand da suíte), ou (b) convivem como sub-marcas (Top Tools verde "ferramentas", site navy "corporativo"). Não resolver isso por acidente.

## Gate de claims (obrigatório em qualquer superfície)

Nunca publicar: "certificação TopTier/TierScope", "FOMM proprietário da TopTier", "licença exclusiva LATAM", "1.229 pontos", escala "0–5", "ROI 150–300%". Taxonomia segura: 7 disciplinas · 26 elementos (WP #197 público) / 25 elementos · 78 subelementos (instrumento TTI R10, uso interno) · níveis 1–5 · "TopTier audita, ICOR reconhece (Merit/Leadership/Excellence)". CTA: **"Solicitar diagnóstico de prontidão FOMM"** (sem preço — ofertas "sob consulta" por decisão do founder, SLA de resposta ≤1 dia útil).
