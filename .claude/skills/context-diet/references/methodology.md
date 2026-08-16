# Metodologia — Redução de Context-Footprint (reconstruída do synkra-hub / EPIC-200)

Este é o playbook destilado da redução real feita no `synkra-hub`, onde o custo
fixo de `.claude/rules/` caiu de **~97–100k tokens → ~3–14k** (−85% a −97%).

## Números de referência (documentados em `outputs/rules-audit/`)

| Marco | Rules always-loaded | Tokens basais |
|---|---|---|
| Pré-fix | 39 de 41 sempre carregadas; ~390–410KB | ~97–100k |
| Pós Fase 1 (FIX-KEY, 4 edits) | ~330KB | ~82k |
| Pós Fase 2 (SCOPE em 22 rules) | ~55KB (13 sem-frontmatter) | ~14k (−85%) |
| Estado final | **5 globais** (~13KB) | ~3k (−97%) |

As 3 maiores rules sozinhas = ~33k tokens: `orchestration-telemetry` (51KB),
`sinkra-pipeline-canon` (48KB), `conductor-decision-routing` (32KB). Escopar as
top-5 pesadas já entrega o grosso do ganho.

## Taxonomia de disposição (a decisão por rule)

| Disposição | Quando | Ação |
|---|---|---|
| **KEEP-GLOBAL** | Vale para TODO trabalho, independente de qual arquivo você toca (autoridade de agente, resolução de findings, paths portáveis, governança de pre-push, lifecycle de task) | Fica sem `paths:`. Mire ≤ 5–7 rules. |
| **SCOPE** | Domain-specific: governa um conjunto de diretórios | Adicionar `paths:` com os globs do domínio (in-place, não move) |
| **FIX-KEY** | Tem `globs:` (chave errada, ignorada pelo loader) | Converter `globs:` → `paths:` (win baixo-risco) |
| **ON-DEMAND** | Nicho/histórica, sem domínio claro, ou projeto roda worktree | `git mv` p/ `docs/reference/rules/` + linha na tabela "Read when" do CLAUDE.md |
| **DEDUP** | Existe em `.claude/rules/` E `docs/reference/rules/` (com drift) | Manter a canônica (onde cross-refs apontam), escopar, deletar a stale; merge manual se divergiram |
| **MERGE** | Várias rules do mesmo domínio | Consolidar (DEFERIDO no synkra-hub — exige grep-replace atômico de cross-refs; é higiene de contagem, não de tokens) |

## Catálogo de técnicas (ordem de execução)

**T0 — Entender o loader.** Nativo do Claude Code: respeita `paths:` (escopo por
path-match em runtime), **ignora `globs:`** (falha silenciosa → sempre carrega),
e sem frontmatter → sempre. Confirmar empiricamente (canary) antes do mass-apply.

**T1 — FIX-KEY.** Trocar `globs:` por `paths:` (lista YAML). Primeiro, porque é o
mais barato e sem risco.

**T2 — SCOPE (alavanca principal).** Prepend do bloco `paths:` nas rules
domain-specific. Suporta `**`, `*`, mid-segment (`sinkra-squad--*.md`),
`**/ADR-*.md`. NÃO mover/renomear → cross-refs `.claude/rules/X.md` intactos.
Responsável por ~97k → ~14k.

**T3 — Canary + validação empírica.** Antes do mass-apply, escopar 1 rule pesada,
abrir sessão limpa FORA dos paths dela, confirmar que sumiu do bloco carregado.
GO/NO-GO. Repetir no fim. É a fonte-de-verdade (não o log da sessão).

**T4 — DEDUP.** Reconciliar cópias divergentes entre `.claude/rules/` e
`docs/reference/rules/`. Manter canônica, escopar, deletar stale.

**T5 — TRIM-CLAUDEMD.** Corrigir tabelas "Read when"/"on-demand" que mentem
(listam como on-demand rules que carregam sempre). Reduzir duplicação de conteúdo
rule↔CLAUDE.md. Delegar para SOTs (`→ .claude/rules/X.md`) em vez de inline.

**T6 — ON-DEMAND move.** Rules nicho/histórico → `docs/reference/rules/` + ponteiro
no CLAUDE.md. **Obrigatório** para as rules pesadas quando o projeto roda waves/SDC
em worktree (o harness ignora `paths:` dentro de worktree e injeta tudo).

**T7 — MERGE por domínio.** Deferido. Só faça com grep-and-replace atômico de todos
os cross-refs. Não move a agulha de tokens.

## O que era manual e agora é automatizado por esta skill

1. **Medição de footprint** → `scripts/audit-context.mjs` (contagem always/scoped,
   tokens, ofensores, potencial). No synkra-hub foi um script throwaway já deletado.
2. **Auto-disposição por rule** → heurística no audit (domínio detectado → SCOPE;
   cross-cutting → KEEP-GLOBAL; sem domínio → ON-DEMAND).
3. **Escrita confiável** → `scripts/apply-scope.mjs` (node fs + backup + verify em
   disco, contornando o bug de persistência do Edit/Write no Windows/MSYS).
4. **Diff/validação** → audit `--baseline` (antes → depois, redução %).

Ainda exigem julgamento humano (por isso PLAN-FIRST): classificação final por rule,
enxugar globs sugeridos, mapear cross-refs, decidir SCOPE vs ON-DEMAND, e o canary.

## As 5 rules cross-cutting do synkra-hub (modelo de KEEP-GLOBAL)
`agent-authority`, `complete-findings-resolution`, `portable-paths`,
`registry-governance`, `task-lifecycle`. Todo o resto foi escopado ou movido.
Num projeto novo, a lista equivalente é: "quais rules eu quero em TODA sessão
independente do que estou editando?" — normalmente autoridade/governança pura.
