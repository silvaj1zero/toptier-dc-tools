# User-Facing Decision Card — Phase 3 elicit contract (NON-NEGOTIABLE)

**When:** every discrete `D<n>` in Phase 3 (create, revise, or post-draft ratification).  
**Who:** MAIN session with `@architect` persona — sole human channel.  
**Why:** a technical ADR dump + “aprova D1–D9?” produces paper ratification, not a real decision. The human must feel **what changes in a real user’s day** before choosing.

This file is the **canonical presentation contract**. `playbook.md` Phase 3 names the rule; `SKILL.md` wires the mechanics; **this file is the shape of every elicit turn.**

---

## Hard rules

1. **One decision per turn.** State “D{n} de {total}” and **do not advance** until the human answers (`A`/`B`/`C`, free prose, or explicit park-for-research).
2. **Never bulk-ratify.** Forbidden openers (examples, not exhaustive):
   - “Gate GAPS aplicado… Decisões D1–D9: [bullet list]… você aprova o ADR D1–D9?”
   - “Responda `aprovar` / `ajustar` / `rejeitar`” for the whole document
   - A single menu that packages several controversial choices
3. **Draft may exist on disk; ratification still walks D1…Dn.** Writing `docs/architecture/ADR-*.md` early does **not** skip Phase 3. Status stays draft/proposed until every `D` is ratified (or explicitly parked → Phase 4).
4. **Language:** title + body of the card in **plain language** (PT-BR when the human works in PT-BR). Technical identifiers (crate names, protocol ops, CI images) may appear **once as a footnote**, never as the main explanation.
5. **Every card must include a real user scenario** — a concrete person doing a concrete job (publish, review, open cockpit, run a wave). Not “latency improves 12%” alone; not only code paths.
6. **Closed questions:** last option always visible **“Outro — escrevo livre”** (or equivalent). Never rely on an implicit free-text affordance.
7. **Recommendation allowed** — say “recomendada” with why — never present a fait accompli without alternatives when trade-offs exist.
8. **Tier 0 / auto-resolve (when classifier exists):** may skip the full card only for reversible + low-consequence + collapsible items; still log a one-line “assumed: …” for transparency. Non-collapsible categories **never** auto-resolve.

---

## Required shape (every D{n})

```text
## D{n} de {total} — {título humano, 1 linha, sem jargon}

{2–4 frases: o que está em jogo no dia a dia do usuário / produto.
 Sem stack dump. Se precisar de termo técnico, traduza na mesma frase.}

### Exemplo prático

{Persona não técnica ou operador real faz um pedido concreto.}

{O que acontece HOJE se a regra falhar ou for ambígua.}

{O que acontece se escolhermos a opção recomendada — frase que o
 produto/sistema diria ou o comportamento visível.}

### Opções

**A — {nome curto}** {opcional: — recomendada}
- {bullet de uso, não só implementação}
- …

**B — {nome curto}**
- …

**C — …** (se houver)
**Outro — escrevo livre** (sempre, se a UI for fechada)

{1 linha: “Minha recomendação é X porque …”}

Qual opção você escolhe para D{n}?
```

**Open-prosa variant** (security / schema / irreversible / cross-product / close-call): same title + context + practical example, then ask the human to write how-it-is / how-it-would-be / gain / loss / alternatives in their own words — **no** forced A/B/C menu (or menu only as optional scaffolding).

---

## Gold-standard exemplar (founder session, 2026-07-09)

Real turn that **is** the bar. Reuse the structure; adapt content per decision. Domain was “who is the executable authority” (Rust engine vs scripts vs agent instructions) — the **form** is portable.

```text
## D1 de 9 — Quem tem a palavra final?

Hoje as regras do AIOX aparecem em três lugares:

- No motor nativo do aplicativo.
- Nos scripts que descrevem e testam o processo.
- Nas instruções dadas aos agentes.

A decisão é: quando houver conflito ou falha, quem realmente manda?

### Exemplo prático

Uma pessoa não técnica pede:

> “Revise meu projeto e publique se estiver tudo certo.”

O agente afirma que chamou um revisor independente, mas esse revisor
estava desconectado ou sem créditos.

Com a opção recomendada, o próprio AIOX verifica isso. Se nenhuma
revisão independente aconteceu, ele bloqueia a publicação e mostra:

> “Não consegui obter uma segunda revisão. Seu projeto não foi publicado.”

A confiabilidade não depende de o modelo lembrar da regra ou interpretar
corretamente uma instrução.

### Opções

**A — Motor nativo como autoridade — recomendada**
- O aplicativo garante as regras críticas.
- Scripts descrevem, geram configurações e testam o comportamento.
- Agentes conduzem a conversa, mas não podem ignorar os bloqueios.
- Melhor para usuários não técnicos e operações de alto risco.

**B — Scripts como autoridade**
- Mais fácil alterar rapidamente os processos.
- Exige manter outro ambiente funcionando junto com o aplicativo.
- Uma incompatibilidade de versões pode impedir ou alterar a automação.

**C — Agentes/instruções como autoridade**
- Mais rápido e flexível no curto prazo.
- A segurança depende de o modelo interpretar e obedecer corretamente.
- Modelos diferentes podem executar a mesma regra de maneiras diferentes.

Minha recomendação é **A**: o agente decide e explica; o motor nativo garante.

Qual opção você escolhe para D1: `A`, `B` ou `C`?
```

### Anti-exemplar (same session — FORBIDDEN)

```text
Gate `GAPS` aplicado. O ADR proposto está pronto: [path]
Decisões D1–D9:
- Rust é a autoridade…
- CI passa a proteger…
- …
Gate ADR: você aprova o ADR D1–D9 como redigido?
Responda `aprovar`, `ajustar: ...` ou `rejeitar`.
```

Why it fails: bulk list, technical compression, no per-decision user scenario, single gate for nine choices, no “Outro” path per decision.

---

## Quick self-check before you send a card

- [ ] Only one `D{n}` in this message (no D{n+1} options yet)
- [ ] Title a non-engineer would understand
- [ ] Practical example with a person + a failure/success the user can picture
- [ ] Options describe **life outcomes**, not only repo layout
- [ ] “Outro” visible if closed UI
- [ ] You will wait for an answer before D{n+1}

---

## Provenance

- Founder mandate 2026-07-09 — standardize Phase 3 elicit UX after anti-exemplar (GAPS bulk approve) vs gold D1 card on ADR-COCKPIT-AGENTIC-CONTROL-PLANE-EXECUTABLE-TRUST walk.
- Backlog: `docs/backlog/adr-elicit-decisions-nontechnical-examples.md`
- ADR lifecycle: `ADR-COCKPIT-ADR-LIFECYCLE-SKILL` D3/D6
