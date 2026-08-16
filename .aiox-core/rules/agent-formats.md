---
paths:
  - ".aiox-core/agents/**"
  - ".claude/agents/**"
---

# Agent Formats — AIOX Cockpit (Executor vs Chief)

Applies when creating, editing, or reviewing any agent under `.aiox-core/agents/` (SOT) — and its projection in `.claude/agents/`.

There are exactly **two** agent formats. Every agent is one or the other. Mixing them (a chief that's lean, an executor with orchestration machinery) is a defect.

---

## The two formats

| Axis | **EXECUTOR** | **CHIEF** |
|------|--------------|-----------|
| Purpose | does one specialized job | orchestrates a multi-step flow |
| Where it runs | spawned **AS a subagent** (`Agent(subagent_type: …)`) | on the **MAIN session** — persona adopted by main; **NEVER subagent-spawned** |
| Invocation | single-shot, scoped | **dual**: `@chief` (consultivo) · `/skill` (executor — the skill tells MAIN to adopt the persona) |
| Modes | 1 (does its thing) | **6 (A–F)** — consultivo/research/roundtable/inspection/executor/architectural |
| State | none | **Phase-0 recognition + resume** via machine-readable progress |
| Tools | no `TeamCreate`/`TeamDelete` | has `TeamCreate` + `TeamDelete` (orchestrates Agent Teams) |
| Elicitation | `SendMessage` to the chief (never `AskUserQuestion` direct when under orchestration) | **single human channel** — receives `ELICIT_REQUEST`, asks the human, returns the resolution |
| Length | lean (~30–45 lines) | denser (~50–80 lines) but still not a 500-line monster |

Both excise the legacy framework coupling (no SYNAPSE activation dance, no `development/{tasks,…}` dependency lists, no theme-resolver, no CodeRabbit-WSL/autoClaude blocks). `model: sonnet` by default.

---

## EXECUTOR format (the lean persona)

Sections, in order: frontmatter (`name`, `description`, `tools`, `model` + **F9 selection metadata**) → `# <name> — <Title>` → one-line identity → **When to use** → **Core principles** → **Authority & delegation** (incl. git allowed/blocked) → **Collaboration** → **Capability lives in skills** (pointer — the procedure is a skill, not the persona).

Reference exemplars: `dev`, `architect`, `qa`, `po`, `pm`, `sm`, `devops`, `master`.

### F9 selection metadata (NON-NEGOTIABLE — ADR-COCKPIT-AGENT-SELECTION)
Every EXECUTOR frontmatter carries the 5 fields the draft-time selector scores against. This frontmatter is the **SOT**; the executor registry (`.aiox/cache/executors.json`) is a **generated cache** of it (D1/D2) — never hand-author the registry.

| Field | Meaning | Maps to gate |
|-------|---------|--------------|
| `capabilities: [..]` | what this agent can do | G2 Capable |
| `domains: [..]` | broad domain fit (agnostic base; a project **refines** via the `.aiox-project` overlay — never hand-edit stack tokens into the base) | G5 Compatible |
| `authority: [..]` | operations it is allowed to perform (mirrors the prose Authority table) | G4 Authorized (hard) |
| `wip_limit: <int>` | max concurrent assignments | G3 Available |
| `escalation: <agent-id>` | who it escalates to (any non-empty id) | G6 Accountable |

CHIEFs are **not** selectable executors (they orchestrate) — they do NOT carry these fields.

---

## CHIEF format (the HYBRID coordinator)

Sections: frontmatter (+ `TeamCreate`/`TeamDelete`) → identity + **scope** → **Chief invariants** → **Invocation (dual)** → **6 modes** table → **Phase-0 Recognition** → **Executor — orchestration** → **Single elicitation channel** → **Companion system** → **Circuit breakers** → **Skills it orchestrates**.

Reference exemplar: `aiox-chief`.

### The 5 chief execution patterns (NON-NEGOTIABLE)

1. **Sequence Lock** — delegate each stage/phase to a **scoped single-shot runner** (prompt: "SCOPE: only {unit}"), **never inline**. Verify stage N's on-disk artifact/ACK **before** dispatching N+1. **Active on-disk poll** for the artifact — NEVER passive wait (the stall fix). Write progress on every transition.
2. **Phase-0 Recognition + Resume** — resolve target (arg > scan latest state > new) → read progress → **reconcile with disk: a generated/ACK'd artifact WINS over progress saying in_progress** → identity-resolution (REUSE existing) → `AskUserQuestion` resume/re-run/inspect/new. **Progress in prose is a VETO** — write machine-readable state.
3. **Mode Interplay (executor ↔ consultivo)** — both modes share the same state via `active_mode`; executor = macro granularity, consultivo = sub granularity; switching hands = write `last_transition`, never lose the point.
4. **Companion system (dual-session)** — heavy work goes to a separate **dirty companion** session (see below).
5. **Circuit breakers + No-Invention** — max retries per stage, timeout; HALT → surface to the human (never fake green); maturity progresses; **never auto-advance to "approved"** (human gate); an advisor is opinion, not authority.

### 6 modes
**A** consultivo (default) · **B** research · **C** roundtable/advisory · **D** inspection (read-only state) · **E** executor · **F** architectural. Ambiguity → `AskUserQuestion` 2–3 specific options + "Other".

### Single elicitation channel
Under orchestration, runners/children **never** ask the human directly — they route the decision to the chief (via `SendMessage` or the orchestration protocol); the chief on MAIN makes the one `AskUserQuestion` and returns the resolution. One human channel: always the chief.

### Companion system (dual-session — the whole pattern)
Two simultaneous sessions:
- **CLEAN (main / orchestration)** — structural decisions; **creates `.ack`/state** files.
- **DIRTY (companion)** — research, sampling, ETL, exploratory analysis; writes to an extraction dir; **never** creates `.ack`.

**5 triggers** — when ANY fires during executor mode, emit the companion prompt + pause the stage:
1. sampling/analysis of **N ≥ 20** items · 2. research **> 15 min** or 3+ external sub-queries · 3. ETL of a file **> 50 KB** or a dir **> 10 files** · 4. exploratory doubt before a structural decision · 5. work that would add **> 8K tokens** to the clean context (INVIOLABLE).

**Handback:** the companion writes a ready-file (with a TTL); the clean session polls/consumes it, validates freshness, and resumes. **Identity signal:** the companion is the session WITHOUT a checkpoints/state dir. The clean session never does heavy ETL inline; the companion never runs the orchestration.

---

## Anti-patterns (BLOCKING in review)

| # | Anti-pattern | Why it fails |
|---|--------------|--------------|
| AF1 | A **chief spawned as a subagent** (`Agent(subagent_type: <chief>)`) | context-thrash from per-turn injection → autocompact death. Chiefs adopt the persona on MAIN. |
| AF2 | An **executor with `TeamCreate`/orchestration** | format confusion; executors are single-shot, they don't orchestrate. |
| AF3 | A chief **running a stage inline** | loses isolation + the runner's scoped context; delegate to a runner. |
| AF4 | **Passive wait** for a runner notification | the stall bug — always active on-disk poll. |
| AF5 | A runner/child calling **`AskUserQuestion` directly** under orchestration | bypasses the single human channel → not routed → idle stall. |
| AF6 | **Progress in prose** instead of machine-readable state | not resumable — Phase-0 can't reconcile. |
| AF7 | Re-introducing legacy coupling (SYNAPSE/deps/theme/Matrix) into a new agent | that bloat is exactly what these formats excise. |
| AF8 | An EXECUTOR **missing the F9 selection metadata** (`capabilities`/`domains`/`authority`/`wip_limit`/`escalation`), or stack-specific `domains` hand-edited into the agnostic base instead of the `.aiox-project` overlay | the draft-time selector can't score it → falls back to triad-bias (the `/full-sdc` regression F9 fixes). Stack tokens in the base break agnosticism. |
| AF9 | **Hand-editing the generated registry** (`.aiox/cache/executors.json`) instead of the frontmatter | the registry is a projection (D2); editing it recreates the sinkra drift F9 eliminated. |

---

## Applies To
- `.aiox-core/agents/*.md` (SOT) and the generated `.claude/agents/*.md` projection.
- New agents MUST declare which format they are and conform to it.

NÃO aplica a: skills (`.aiox-core/skills/`) — those have their own contract.
