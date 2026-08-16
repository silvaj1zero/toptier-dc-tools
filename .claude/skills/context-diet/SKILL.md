---
name: context-diet
description: >-
  Reduz o footprint de contexto SEMPRE-CARREGADO de um projeto Claude Code
  (CLAUDE.md + .claude/rules/ + índice de memory) escopando rules via frontmatter
  `paths:`, movendo domain-rules nicho para on-demand e enxugando o CLAUDE.md.
  Use quando um projeto tem muitas .claude/rules/ carregando em toda sessão, o
  /context mostra "Memory files" alto (ex.: 100k+ tokens), subagents em worktree
  sofrem autocompact, ou para portar a redução ~180k→~30k feita no synkra-hub
  para outro repo (ex.: allfluence). Plan-first: audita → classifica → você aprova
  → aplica com verificação em disco → valida o diff. Agnóstico e cross-platform.
allowed-tools: Read, Edit, Write, Grep, Bash, AskUserQuestion
---

# context-diet — Dieta de Contexto para projetos Claude Code

Corta o **custo fixo de contexto** (tudo que entra em TODA sessão antes de você
pedir qualquer coisa) sem perder governança. A alavanca principal é o mecanismo
**nativo** do Claude Code: uma rule em `.claude/rules/*.md` **com frontmatter
`paths:`** só é injetada quando você toca um arquivo que casa com o glob; **sem
`paths:` ela carrega SEMPRE**. Migrar rules domain-specific de "sempre" para
"condicional" (ou on-demand) é o que leva ~100–180k → ~25–30k tokens.

Referência de metodologia completa: `references/methodology.md`. Formato exato do
frontmatter e armadilhas: `references/frontmatter-model.md`. Como mapear domínio →
globs: `references/domain-path-heuristics.md`. **Leia os três antes de aplicar.**

## Como funciona o loading (a base de tudo)

| Estado da rule | Quando carrega | Custo |
|---|---|---|
| `paths:` com globs de domínio | só ao tocar arquivo que casa | **condicional** ✅ |
| Sem frontmatter / sem `paths:` | toda sessão | **fixo** ❌ |
| `globs:` (chave ERRADA) | ignorado → toda sessão | fixo ❌ (FIX-KEY) |
| `paths: ["**"]` | casa tudo → toda sessão | fixo ❌ (armadilha) |
| Movida p/ `docs/reference/rules/` | só quando lida manualmente | **on-demand** ✅ |

> **Caveat worktree (importante):** dentro de `.claude/worktrees/story-*/` o harness
> **ignora `paths:`** e injeta TODAS as rules (pode passar de 400–500k). Para
> projetos que rodam waves/SDC em worktree, o único fix real é **mover** as
> domain-rules pesadas para `docs/reference/rules/` (ON-DEMAND), não só escopar.
> Priorize ON-DEMAND para as top-N rules mais pesadas nesses projetos.

## Invocação

```
/context-diet                     # audita o projeto atual (cwd)
/context-diet <caminho-do-projeto># audita/otimiza outro repo
```

Exemplo: `/context-diet "C:\path\to\project"`

Os scripts recebem `--project <dir>` e são **read-only na fase de auditoria**.

## Workflow (PLAN-FIRST — nunca aplica sem aprovação)

### Fase 0 — Segurança
1. Resolva a raiz do projeto (arg ou cwd). Confirme que existe `.claude/rules/`.
2. Verifique `git status` do projeto-alvo: se houver muita coisa uncommitted,
   avise — o rollback desta dieta é via git. Sugira commit/branch antes.
3. Nunca opere fora da raiz do projeto-alvo. Um projeto por execução.

### Fase 1 — AUDIT (medir o custo fixo)
```
node <skill>/scripts/audit-context.mjs --project <dir> --out <scratchpad>/baseline.json
```
Apresente ao usuário: custo fixo atual, nº de rules ALWAYS vs escopadas, os
maiores ofensores, e o **potencial pós-dieta** (%). Guarde `baseline.json`.

### Fase 2 — CLASSIFY (refinar a disposição por rule)
A auditoria já propõe uma disposição por rule (`SCOPE` / `KEEP-GLOBAL` /
`ON-DEMAND` / `FIX-KEY` / `REVIEW`). **Refine com julgamento** — a heurística é um
rascunho, não a verdade:
- **KEEP-GLOBAL** → rule cross-cutting que vale para TODO trabalho (autoridade de
  agente, resolução-de-findings, paths portáveis, governança de pre-push, lifecycle
  de task). Fica sem `paths:`. É o custo fixo legítimo (mire ≤ 5–7 rules).
- **SCOPE** → rule domain-specific. Leia a rule, confirme os diretórios que ela
  governa e **enxugue os globs sugeridos** (a heurística tende a sobrar globs).
  Use `references/domain-path-heuristics.md`.
- **ON-DEMAND** → rule nicho/histórica (sem domínio claro, ou consultada raramente,
  ou projeto roda worktree). Move p/ `docs/reference/rules/` + linha na tabela
  "Read when" do CLAUDE.md.
- **FIX-KEY** → tem `globs:`; converter para `paths:` (win imediato, baixo risco).
- **REVIEW** → ambíguo (governança + domínio). Decida caso a caso; na dúvida, SCOPE
  com o glob mais amplo do domínio.

Antes de escopar, **mapeie cross-refs**: `grep` por `.claude/rules/<nome>.md` no
repo (use `Bash ls`/`rg` escopado — Glob amplo dá timeout em repos grandes). Se a
rule é referenciada por CI/skills/hooks, prefira SCOPE in-place (não mova).

Detecte **DEDUP**: se o audit reportar duplicatas entre `.claude/rules/` e
`docs/reference/rules/`, reconcilie (mantenha a canônica onde os cross-refs
apontam, escope-a, delete a stale; faça merge manual se divergiram).

Produza um **change-spec** (tabela): `rule | tokens | disposição | paths novos |
por quê`. Este é o artefato de aprovação.

### Fase 3 — APPROVE (gate obrigatório)
Apresente o change-spec completo e o ganho projetado. **Pare e peça aprovação.**
Respeite a preferência do usuário de validar o change-spec antes de editar. Não
aplique nada sem OK explícito. Ofereça aprovar em lote ou por linha.

### Fase 4 — APPLY (escrita confiável)
Grave um `plan.json` `[{file, action, paths}]` no scratchpad e rode:
```
node <skill>/scripts/apply-scope.mjs plan --project <dir> --plan <scratchpad>/plan.json
```
O script escreve via `node fs`, faz **backup** em `<dir>/.context-diet-backup/`, e
**RE-LÊ do disco** para verificar cada mudança (o log da sessão não é fonte de
verdade — o disco é). Rules na lista GUARD (as 5 cross-cutting) só mudam com
`--force`. Reporte OK/XX por rule; se algum XX, investigue antes de seguir.

Ações individuais (quando preferir granular):
```
node <skill>/scripts/apply-scope.mjs set-paths --project <dir> --rule <nome> --paths "a/**,b/**"
node <skill>/scripts/apply-scope.mjs fix-key   --project <dir> --rule <nome>
node <skill>/scripts/apply-scope.mjs on-demand --project <dir> --rule <nome>
```

### Fase 5 — CLAUDE.md + memory (passada leve)
- **CLAUDE.md**: para cada rule movida p/ ON-DEMAND, adicione linha na tabela
  "Read when" (crie a seção se não existir). Corrija qualquer tabela on-demand que
  esteja mentindo (listando como on-demand rules que carregam sempre). Delegue
  detalhe para SOTs em vez de inline (padrão `→ .claude/rules/X.md`).
- **MEMORY.md**: confirme que é um **índice de 1 linha por memory** (`- [Título](arquivo.md) — gancho`).
  Se entradas estão inlineando conteúdo, mova o corpo para o arquivo individual e
  deixe só o ponteiro. Nunca apague `feedback_*.md` (são recall-only, não custo fixo).

### Fase 6 — VALIDATE (provar o ganho)
1. YAML sanity dos frontmatters editados (parse simples; sem erro).
2. Re-rode o audit contra o baseline:
   ```
   node <skill>/scripts/audit-context.mjs --project <dir> --baseline <scratchpad>/baseline.json
   ```
   Reporte o diff real (custo fixo antes → depois, redução %).
3. **Canary opcional (o teste definitivo):** peça ao usuário abrir uma sessão
   limpa no projeto FORA de qualquer path escopado e rodar `/context` — a categoria
   "Memory files" deve refletir o novo custo fixo, e as rules escopadas NÃO devem
   aparecer no bloco carregado. Só ao tocar um arquivo do domínio elas injetam.
4. Confirme que as 5 cross-cutting continuam globais e que nada de governança
   crítica virou condicional por engano.

## Regras invioláveis
- **Plan-first sempre.** Change-spec aprovado antes de qualquer escrita.
- **Escrita via `node fs` + verify-em-disco.** Nunca confie que Edit/Write built-in
  persistiu no Windows — o `apply-scope.mjs` já re-lê e valida.
- **Nunca escopar as cross-cutting** (autoridade/findings/paths/registry/lifecycle)
  sem decisão explícita. Custo fixo legítimo mira ≤ 5–7 rules.
- **Um projeto por execução**; rollback é git (+ `.context-diet-backup/`).
- **Resolução completa de findings:** toda rule ALWAYS do audit termina em UM
  estado (SCOPE aplicado / KEEP-GLOBAL justificado / ON-DEMAND movida). Nada de
  "escopar as fáceis e deixar o resto".
- **Não invente domínios.** Globs saem do que a rule realmente governa (referências
  no corpo + cross-refs reais), não de suposição.

## Números de referência (synkra-hub, EPIC-200)
~97–100k always-loaded → ~3–14k após escopar (−85% a −97%). Estado saudável final:
CLAUDE.md enxuto + 5 rules globais + resto escopado/on-demand + MEMORY.md como
índice. Medido: allfluence parte de ~108k de custo fixo com potencial ~78%.
