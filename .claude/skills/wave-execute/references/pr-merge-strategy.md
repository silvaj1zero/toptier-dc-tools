---
paths:
  - "**"
---

# PR Merge Strategy — AIOX Cockpit

Applies when `@devops` (the only agent authorized to merge — see `agent-authority.md`) is about to merge a Pull Request into `main`.

## Strategy by Criterion (NON-NEGOTIABLE)

| PR shape | Allowed strategy | Why |
|----------|------------------|-----|
| 1-3 commits AND <100 LOC added | **Squash OK** | simple PR, granular history adds nothing |
| 4+ commits OR >100 LOC added | **Rebase merge REQUIRED** | preserves intermediate commits; no squash-conflict drift |
| Multi-feature integration branch | **Merge commit REQUIRED** | the logical group stays visible in `git log --merges` |
| Force-push after review approval | **FORBIDDEN** | breaks the recorded review; approved commits stay immutable |

Most-restrictive criterion wins when two apply.

## Pre-Merge Head Verification (NON-NEGOTIABLE — anti-bogus-PR)

Before ANY merge, confirm the PR points at the intended branch + files:

```bash
gh pr view <N> --repo SynkraAI/aiox-cockpit --json headRefName,files | \
  jq '{head: .headRefName, files: [.files[].path]}'
```

- `headRefName` MUST be the work branch. An unexpected branch → **BOGUS PR → HALT → close it**.
- `files[]` MUST contain the actual work. Something else → **HALT**.

### Root cause (real incident)
`gh pr create` derives `--head` from the **git branch of the CWD** when `--head` is omitted — NOT from the branch you pushed. Creating a PR from a checkout whose current branch ≠ the work (e.g. operating from repo root while the work is in a worktree) produces a PR with the **wrong head**, and a squash-merge then lands the **wrong commit**. `git -C <path>` is honored by git, **NOT by gh**.

### Prevention (2 mechanical layers)
1. `gh pr create` ALWAYS with explicit `--head <branch> --repo SynkraAI/aiox-cockpit --base main` — never trust the cwd branch. Capture the work branch with `git -C <path> rev-parse --abbrev-ref HEAD`.
2. The pre-merge gate above (`gh pr view --json headRefName,files`) catches a bogus PR in one command.

## Pre-Merge Check

```bash
gh pr view <N> --json commits,additions,deletions,changedFiles | \
  jq '{count:(.commits|length), additions, deletions, files:.changedFiles}'
```

Apply the criterion table to those numbers. Canonical commands:
```bash
gh pr merge <N> --squash  --delete-branch   # 1-3 commits + <100 LOC
gh pr merge <N> --rebase  --delete-branch   # 4+ commits OR >100 LOC
gh pr merge <N> --merge   --delete-branch   # multi-feature integration branch
```

## Execução do ciclo (procedimento padrão — NON-NEGOTIABLE)

Como rodar commit→branch→PR→merge. Destilado de 4 abortos reais em 2026-07-28 (PRs #333, #337, #338) — **nenhum deles foi falha de CI ou de código**; todos foram o mecanismo de execução falhando de formas diferentes.

### 1. Worktree isolado, sempre
O checkout principal é **compartilhado** (várias sessões, o founder, panes do cockpit). Operar nele é a fonte de dois abortos:

```bash
git worktree add --detach "$WT" origin/main   # nasce já sobre o alvo do merge
cp/aplique a mudança · git add <paths> · git commit · git push
```
- `git rebase` **recusa rodar** com working tree sujo (`cannot rebase: You have unstaged changes`) — e ele estará sujo, com trabalho de terceiros.
- `--autostash` destrava, mas **só quando os commits novos não tocam os mesmos arquivos** do stash; quando tocam, o pop conflita no trabalho de outra sessão. Verifique antes: `git diff --name-only <base> origin/main | grep <arquivo-sujo>`.
- Nascer o commit sobre `origin/main` também evita diff falso: se o HEAD local está atrás, o commit registra mudanças que já existem no remoto e colide no rebase.
- **Cleanup do worktree só APÓS o merge confirmado.**

### 2. Gate no `ci-ok` — nunca `gh pr checks --watch` como condição de merge
`--watch` produz **falso negativo** de 2 formas conhecidas, e ambas já bloquearam merges legítimos:
- **race**: roda antes de o workflow registrar → `no checks reported` → exit ≠ 0 (PRs #333, #337, #338)
- **`skipping` legítimo**: PR só-de-config, o build é pulado pelo filtro de paths → contado como não-concluído

`ci-ok` é o **único** required check da proteção da `main`. É nele que se gateia:
```bash
gh pr checks <N> -R <repo> | grep -E "^ci-ok[[:space:]]+pass" || { echo "ABORT"; exit 1; }
```

### 3. Rodar em background
Timeout de foreground (10 min) < build Windows deste repo (~16 min). Foreground **vai** estourar.

### 4. Verificar por estado real, nunca por exit code
Exit code já reportou sucesso com a branch remota intacta (#338):
```bash
gh pr view <N> --json state -q .state            # MERGED?
git fetch origin --prune
git ls-remote --heads origin <branch>            # vazio = deletada de fato
```

### 5. Guardas antes de qualquer escrita
Staged set == esperado · nº de commits esperado na branch · JSON válido se tocar config · PR `MERGED` antes de deletar branch.

**Um guard mal formulado é pior que nenhum** — dá falsa confiança e some no ruído. Caso real: `git merge-base --is-ancestor <branch> origin/main` **nunca** passa depois de um `merge --rebase`, porque o hash é reescrito; o guard gritou "NÃO deletar" sobre uma branch perfeitamente mergeada. Verifique **conteúdo**, não hash. E **gate o comando no guard** (`&&`/`||`), não o deixe em linha separada.

### 6. Commits de outras sessões no caminho
Checkout compartilhado acumula commits locais alheios não-pushados. Para deixá-los fora do seu PR:
```bash
git rebase --onto origin/main <commit-alheio>    # reaplica só o que veio DEPOIS dele
git rev-list --count origin/main..HEAD           # guard: tem que ser o nº de commits SEUS
```
Nunca pushe o commit de outra sessão junto — pode não estar pronto para revisão.

## Anti-Patterns

| Anti-pattern | Consequence |
|--------------|-------------|
| Squash on a multi-feature integration branch | loses intermediate commits |
| Force-push on an approved PR | breaks review integrity |
| Merge without the pre-merge head check | wrong-commit landing (the `gh --head` trap) |
| Delegating push+PR to an agent whose cwd ≠ the work checkout | the exact vector of the bogus-PR bug — always pass `--head` explicitly |
| `gh pr checks --watch` como condição de merge | falso negativo por race ou por check `skipping` → merge legítimo bloqueado |
| Commit/rebase no checkout principal compartilhado | working tree sujo de terceiros aborta o rebase; risco de carregar trabalho alheio |
| Confiar no exit code para confirmar merge/deleção | já reportou sucesso com a branch remota intacta — confirme por `gh pr view`/`ls-remote` |
| Guard não gateado (impresso, mas não ligado ao comando por `&&`/`||`) | o comando roda mesmo com o guard dizendo para parar |

NÃO aplica a merges entre branches non-main (feature → integration) — esses seguem a convenção do orquestrador.
