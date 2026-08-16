---
paths:
  - "**"
---

# Agent Authority — AIOX Cockpit

Applies when any agent is activated.

## Exclusive Authorities

| Agent | Exclusive Rights | Others MUST Delegate |
|-------|------------------|----------------------|
| `@devops` | `git push`, `git tag`, PR creation, release, deploy/distribution (signing, notarization, installer publish) | All agents propose; `@devops` pushes |
| `@db-sage` | Schema changes, migrations, query optimization (when the product has a data layer) | `@dev` proposes, `@db-sage` executes |
| `@architect` | Architecture decisions, tech-stack changes | `@dev` proposes, `@architect` decides |
| `@qa` | Quality sign-off, test strategy | `@dev` writes tests, `@qa` validates |
| `@po` | Story validation | `@pm` creates, `@po` validates |
| `@sm` | Story creation, sprint management | Others request, `@sm` creates |

## Delegation Protocol

**Push code:** `@dev` finishes implementation → requests `@devops` via handoff → `@devops` validates and pushes. **Architecture change:** agent proposes to `@architect` → `@architect` decides → decision logged in an ADR. **Deploy/distribution:** `@dev`/`@architect` proposes and tests → `@devops` executes the release (EXCLUSIVE) → `@qa` or `@devops` verifies post-release.

## Non-Negotiable

**Only `@devops` pushes, opens PRs, tags, or releases.** Every other agent proposes and delegates. This is the single hard authority gate of the repo.
