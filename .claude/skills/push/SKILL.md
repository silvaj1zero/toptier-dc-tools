---
name: push
description: Push a story's code (or open a PR) and route the next step — deploy_type none → /close, else → /deploy → /verify → /close. @devops-exclusive. Explicit QA-gate verdict check, head-verified PR creation.
version: "1.0.0"
context: inline
agent: devops
user-invocable: true
argument-hint: "{story-path}"
status: active
allowed-tools: Read, Bash, Write, AskUserQuestion
---

# /push — Push Story

Push a reviewed story's code (direct or via PR) and route the correct next step. Replaces a manual push, which keeps dropping the post-push routing. **`@devops`-exclusive — no other agent runs push.**

**Input:** story path from `$ARGUMENTS` (ask if absent).

## Step 0 — Authority
If the executing role is not `@devops` → HALT ("push is @devops-exclusive; delegate"). Push/PR/merge authority + the escalation ceiling are unchanged (see `references/agent-authority.md`, `devops-escalation-ceiling.md`).

## Step 1 — Pre-requisites (HALT on any miss)
1. Status is `Ready for Review` (or `InReview`).
2. **QA gate verdict is explicitly PASS** (or WAIVED with a recorded sign-off) — check the verdict in the `## QA Results`, not just that a review ran. CONCERNS/FAIL without a WAIVED sign-off NEVER authorizes a push.
3. All tasks/subtasks `[x]`.

## Step 2 — Large-diff review gate
`git diff --stat`. If ≥10 files changed and a review tool is configured for the project, run it; CRITICAL findings → HALT, HIGH → WARN + continue. Under 10 files → optional.

## Step 3 — Stage + commit
Stage **only the story's files** (from the Dev Agent Record File List) — **never `git add -A`**, never silently include out-of-scope changes (ask: stash or include?). Conventional Commit referencing the story:
```
feat: {title} [Story {story-id}]

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Step 4 — Push / PR (head-verified)
- **Admin (direct):** `git push origin main`.
- **PR mode (NON-NEGOTIABLE — always explicit `--head`):** `gh pr create` derives `--head` from the **cwd's git branch** when omitted — NOT the branch you pushed. From a different checkout that lands the wrong commit. `git -C` is honored by git, NOT by gh.
  ```
  HEAD_BRANCH=$(git -C "$WORKTREE" rev-parse --abbrev-ref HEAD)
  git -C "$WORKTREE" push -u origin "$HEAD_BRANCH"
  gh pr create --repo {owner/repo} --base main --head "$HEAD_BRANCH" --title "…" --body "…"
  ```
  **Pre-merge head gate:** `gh pr view {N} --json headRefName,files` — if `headRefName` ≠ `$HEAD_BRANCH` or `files[]` lacks the work → **BOGUS PR, HALT, close it**. (See `references/pr-merge-strategy.md`.)
- Push/PR fails → report + HALT (do NOT route). Branch conflict → HALT, never resolve via force push.

## Step 5 — Intelligent post-push routing (the reason this skill exists — NEVER skip)
After a successful push:
- **`deploy_type == none`** → "Push complete. Next: `/close {story-path}`." Create a handoff to `@po`.
- **any other `deploy_type`** → "Push complete. Next: `/deploy` → `/verify` → `/close`." Create a handoff to self (`@devops`) for `/deploy`.

A failed push never routes. Never suggest `/close` directly when `deploy_type != none`.

## Step 6 — Summary
Story id · files committed · branch · mode (direct/PR #) · review gate · deploy needed? · next step.

## Decision points (interactive)
Out-of-scope changes (stash/include), force-push approval, missing story path → ask via `AskUserQuestion`. Standalone, ask directly; under an orchestrator, the decision routes through the conductor transport.

## Absolute rules
Push @devops-exclusive · post-push routing mandatory · failed push never routes · QA verdict PASS/WAIVED checked explicitly before push · never `git push --force` on shared branches without explicit approval · never include out-of-scope changes silently.
