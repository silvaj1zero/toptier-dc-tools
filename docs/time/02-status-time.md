# Top Tools — O que temos pronto (para o time)

> Estado em 2026-08-23. Resumo executivo do que está **no ar, testado e gerando leads** —
> e do que falta. Use com o `01-guia-suite.md` (o que cada ferramenta faz) e o
> `diagrama-ecossistema.html` (mapa visual).

## TL;DR

A suíte está **100% no ar** em https://ferramentas.toptier.net.br: **6 ferramentas +
metodologia + home** (8 páginas). O **funil de leads está fechado** — todo formulário
e o gate FOMM entregam leads reais no Formspree, no mesmo padrão de campos, com origem
e campanha rastreadas. Qualidade auditada por revisores externos (duplo APROVADO).

## No ar hoje

| Ferramenta | URL | Status |
|---|---|---|
| Home (vitrine + lead) | `/` | ✅ no ar |
| Calculadora de PUE | `/calculadora-pue/` | ✅ no ar |
| Simulador de Economia | `/simulador-economia/` | ✅ no ar |
| Calculadora de Virtualização | `/calculadora-virtualizacao/` | ✅ no ar |
| Modelador de PUE de Projeto | `/modelador-pue/` | ✅ no ar |
| Planejador de Espaço e Densidade | `/planejador-densidade/` | ✅ no ar |
| Pré-Diagnóstico FOMM | `/maturidade-operacional/` | ✅ no ar (testado em produção pelo operador) |
| Metodologia aberta | `/metodologia/` | ✅ no ar |

## Qualidade (evidência, não alegação)

- **72/72 testes** automatizados passando · **TypeScript 0 erros** · build 8 páginas + sitemap.
- **Modelador de PUE:** validação massiva **610/610 pontos exatos** (tolerância 1e-6) contra a ferramenta original da Schneider — auditada por 2 revisores externos independentes (APROVADO ×2).
- **Goal-loop best-of-breed:** rodada de auditoria multi-revisor com duplo APROVADO (técnico + visual). Todos os P0 e P1 resolvidos: SEO completo (sitemap, robots, canonical, Open Graph, JSON-LD), fontes self-hosted, acessibilidade (skip-link, focus-visible, ARIA), LGPD no formulário.
- **Benchmark de mercado:** a pesquisa mapeou o cenário — *"a suíte que não existe"* no mercado é exatamente a nossa (ferramentas do gênero foram descontinuadas pelos fabricantes ou escondem a metodologia).

## Funil de leads — FECHADO e padronizado

- **Padrão único em todas as ferramentas:** nome + e-mail (obrigatórios), empresa e WhatsApp (opcionais), consentimento LGPD obrigatório, honeypot anti-spam.
- **Atribuição automática:** todo lead chega com `origem` (qual ferramenta), página, referrer e UTMs — dá para medir qual ferramenta e qual campanha geram leads.
- **FOMM com gate de registro:** resultado e folder só após nome + e-mail; contato comercial apenas com autorização explícita; o lead vem com o perfil de maturidade completo (as 7 disciplinas) — o lead mais qualificado do funil.
- **Folder comercial:** "Auditoria e Certificação FOMM" (PDF) disponível para download após o registro.
- **Destino:** Formspree (endpoint configurado na Vercel). Fallback: e-mail direto — o formulário nunca quebra.

## Marca e autoridade

- **Top Tier Infrastructure®** nas superfícies de marca.
- Bloco de autoridade comercial no FOMM: metodologia exclusiva com score e software proprietários (**TierScope**), 10+ anos em clientes líderes, Zero Outage (IBM), certificações FOMM via **ICOR Internacional** (ISO/IEC 17021-1).
- **Gate de claims respeitado:** a ferramenta não emite certificação; escala é 1–5; sem números de base não verificados. (Detalhe no §4 do guia.)

## O que ainda NÃO está feito (próximas frentes)

1. **Lançamento/divulgação (Fase 3):** SEO ativo + LinkedIn — nunca iniciada. O site está pronto para isso (SEO técnico completo).
2. **Régua de e-mails:** leads chegam ao Formspree, mas não há sequência automática de nutrição/resposta.
3. **Integração visual com o site principal** toptier.net.br (links cruzados) — há plano documentado; colide com a fronteira do site novo (pendente de decisão de arquitetura).
4. **Deploy é manual:** push no GitHub NÃO publica; o operador roda `npx vercel --prod`.

## Como falar disso para fora

- "Suíte aberta de ferramentas de eficiência para data centers — metodologia exposta, benchmarks 2025, validada ponto a ponto contra as ferramentas clássicas do mercado."
- Cada ferramenta é gratuita e sem cadastro para **usar**; o cadastro entra para **receber relatório/resultado** — o valor troca de mãos de forma justa.
- O destino comercial: diagnóstico de prontidão FOMM → auditoria e certificação (ICOR) → consultoria/treinamentos.

---

*Status para o time v1 — 2026-08-23.*
