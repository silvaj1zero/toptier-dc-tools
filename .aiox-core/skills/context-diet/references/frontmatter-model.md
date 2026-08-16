# Modelo de frontmatter `paths:` e armadilhas

## O formato que o loader NATIVO respeita

Bloco `paths:` no topo do arquivo, lista YAML de globs, **sem** `name`/`description`
(modelo canônico: `.claude/rules/design-absolute-bans.md` no synkra-hub):

```markdown
---
paths:
  - "apps/**/*.{tsx,jsx,html,css}"
  - "packages/**/components/**"
  - "squads/design-*/**"
---

# Nome da rule

conteúdo...
```

A rule só é injetada no contexto quando você toca (Read/Edit/Grep/Glob/Bash sobre)
um arquivo cujo path casa com QUALQUER glob da lista.

## Sintaxe de glob suportada
- `**` — qualquer profundidade de diretórios: `supabase/**`
- `*` — um segmento: `squads/*/config.yaml`
- mid-segment: `agents/sinkra-squad--*.md`
- extensões: `apps/**/*.{tsx,jsx}`
- por nome de arquivo em qualquer lugar: `**/ADR-*.md`

## Armadilhas (todas causam carregamento SEMPRE)

| Armadilha | Sintoma | Correção |
|---|---|---|
| `globs:` em vez de `paths:` | loader IGNORA a chave silenciosamente → carrega sempre | renomear para `paths:` (FIX-KEY) |
| `paths: ["**"]` | casa qualquer arquivo → de-facto always-load | restringir aos diretórios reais do domínio |
| Sem frontmatter | carrega sempre | adicionar bloco `paths:` (SCOPE) ou mover p/ on-demand |
| `paths:` como CSV numa linha | pode não parsear como lista | preferir block-list (`  - "glob"`) |
| Frontmatter com `name:`/`description:` extra | ruído; mantenha só `paths:` | remover chaves supérfluas |

## Caveat WORKTREE (crítico)
Quando `cwd` está dentro de `.claude/worktrees/story-*/`, o harness **ignora
`paths:`** e injeta CLAUDE.md + **TODAS** as `.claude/rules/*.md` (medido
~437KB/43 arquivos, chegando a ~500k), porque `.claude/` é git-tracked e herdado
por cada worktree. Isso enche o contexto em 2–3 turnos → autocompact → morte do
subagent. Para projetos que rodam waves/SDC em worktree, escopar não basta: **mova**
as domain-rules pesadas para `docs/reference/rules/` (ON-DEMAND). Foi a causa-raiz
(FA-11) que motivou o EPIC-200.

## Persistência confiável no Windows
Edit/Write built-in podem reportar sucesso **sem persistir** no disco (sandbox
overlay / MSYS). Por isso `apply-scope.mjs` escreve via `node fs`, faz backup e
**re-lê do disco** para verificar. Regra operacional: **a contagem de `paths:` em
disco é a fonte-de-verdade, não o log da sessão.** Se for editar à mão, re-leia o
arquivo (`head`/parse) e confirme o bloco antes de declarar feito.

## Padrão da tabela on-demand no CLAUDE.md
Rules movidas para `docs/reference/rules/` são sinalizadas por uma tabela:

```markdown
## Reference Rules (on-demand)
| Rule | Read when |
|------|-----------|
| `clickup-organization.md` | Working with ClickUp API/structures |
| `epistemic-standards.md`  | Making architectural claims |
```

O modelo lê o arquivo **só quando** entra naquele domínio — custo zero até lá.
