---
paths:
  - ".aiox-core/skills/**"
  - ".aiox-core/agents/**"
---

# LAG Phase-0 Query — AIOX Cockpit

Applies when a skill or agent needs to recognize "what already exists / what's pending" at the start
of an execution (Phase-0 recognition) and wants to consult the Living Architecture Graph (`031.W4.1`)
instead of — or in addition to — its own ad-hoc filesystem heuristics.

## Background (D8, epic 031)

Before `031.W4.1`, Phase-0 recognition in this repo was implemented per-skill, ad-hoc: `/validate`
reads a story's `depends_on` and checks each dependency's `status` frontmatter by hand; `/develop`,
`/review`, `/close` each read the story's own `status` field directly off disk; `governance-pipeline`
resolved an ADR reference by globbing `<adr_dir>/ADR-*{slug}*.md`. None of these consulted a shared,
queryable source of architectural state — each skill re-derived its own answer from raw files.

`031.W4.1` shipped a headless MCP server (`aiox-core lag-mcp`) over the Living Architecture Graph, with
6 typed tools (`query_graph`/`list_adrs`/`read_adr`/`blast_radius`/`drift_check`/`entity_context`), all
scoped by `project_root` + optional `at:`. This rule generalizes the **point of consultation**: where a
skill today reads local files to infer "what already happened," it MAY additionally query the LAG as a
preferred/faster source for the same fact — never a replacement for the skill's own runtime state
(`.aiox/`/`.sinkra/state/`, which stays the source of truth for ephemeral execution state; the LAG is
about architecture/decisions/registrations, not in-flight process state).

## The shared mechanism (AC2)

`.aiox-core/skills/governance-pipeline/scripts/lag-query.mjs` — the ONE reusable client. Any skill can
import it (relative path, same discipline as `full-cycle-guard.mjs`'s "resolve relative to this loaded
SKILL.md"). It spawns the compiled `aiox-core` binary (`aiox-core lag-mcp`), speaks the same
line-delimited JSON-RPC 2.0 the server implements, and ALWAYS returns a structured, non-throwing
result:

```js
import { listAdrs, queryGraph, callLagTool, LagResult, LagUnavailable } from
  "<path-to>/.aiox-core/skills/governance-pipeline/scripts/lag-query.mjs";

const result = await listAdrs({ projectRoot: process.cwd() });
if (result.available) {
  // result.payload — the tool's parsed JSON response
} else {
  // result.reason — human-readable cause; degrade to the pre-LAG behavior (AC7)
}
```

Typed convenience wrappers exist for all 6 tools: `queryGraph`, `listAdrs`, `readAdr`, `blastRadius`,
`driftCheck`, `entityContext`. `callLagTool(name, args, opts)` is the generic escape hatch for any tool
by name.

## Rules (NON-NEGOTIABLE)

1. **AC7 — graceful fallback is mandatory, not optional.** Every call site MUST branch on
   `result.available` and have a real fallback path — never assume the LAG exists. A missing
   `aiox-core` binary (not built in this checkout) or a missing `.aiox/lag/lag.db` (project never
   projected) are BOTH normal, expected states, not errors. `lag-query.mjs` never throws for either
   case; it returns `LagUnavailable`.
2. **AC5 — opt-in, never a breaking migration.** A skill that has NOT been migrated to consult the LAG
   continues to work exactly as before. A migrated skill's LAG path is a *preferred fast lane* layered
   on top of the pre-existing mechanism — the old mechanism is never deleted as part of a migration,
   only demoted to "fallback branch."
3. **Never a second MCP client.** Do not spawn `aiox-core lag-mcp` directly from a new skill script —
   import `lag-query.mjs` (REUSE > ADAPT > CREATE). If its typed wrappers don't cover a needed shape,
   extend `lag-query.mjs` itself rather than duplicating the subprocess/JSON-RPC plumbing elsewhere.
4. **Timeouts are mandatory.** `callLagTool` defaults to a 5s timeout and never hangs the caller even if
   the subprocess wedges — do not raise it without a specific reason, and never remove it.
5. **Dot-dir discipline (unchanged, cross_epic_dependencies of epic 031).** Any skill/agent/rule edit
   that adopts this mechanism happens EXCLUSIVELY in `.aiox-core/**`; run
   `node .aiox-core/sync/sync.mjs` before considering the change complete. Never hand-edit `.claude/` or
   `.codex/`.
6. **AP5 evidence.** A migration that touches an orchestrator or atomic SDC skill (`/full-cycle`,
   `/validate`, `/develop`, `/review`, `/close`, `/deploy`, `/verify`, `/wave-execute`, etc.) still needs
   the standard skill-agnosticism proof (`.aiox-core/rules/skill-agnosticism.md`, AP5) — this rule does
   not relax that requirement. `governance-pipeline` (the `031.W4.3` proof-of-concept target) is not
   part of that SDC family's compatibility matrix, so its migration evidence is the test suite in
   `lag-query.test.mjs` plus the SKILL.md's documented fallback branch, not the 8-mode matrix.

## Known migrated call sites

| Skill | What migrated | Fallback when LAG absent |
|-------|---------------|---------------------------|
| `governance-pipeline` (Pre-flight, "ADR fuzzy-match" + "ADR cooldown") | ADR slug resolution + cooldown lookup now prefer `list_adrs` (single call gets `status`/`decisions[]`/`date` together) | Unchanged glob `<adr_dir>/ADR-*{slug}*.md` + direct frontmatter read |

Add a row here whenever another skill adopts this mechanism — this table is the living inventory that
`031.W4.3`'s AC1 started (do not let it drift from the skills that actually call `lag-query.mjs`).

## Candidates not yet migrated (backlog, not required by `031.W4.3`)

Identified during the `031.W4.3` inventory but explicitly out of this story's scope (the story ships the
mechanism + one proof-of-concept, not a full migration sweep):

- `/validate`'s `depends_on` check (reads each dependency story's `status` field by hand) — the LAG has
  no `story` node type yet (that's epic-031's explicit "out of scope" O6, a future git-native
  orchestration ADR), so this candidate is blocked on a future graph extension, not on this mechanism.
- `/develop`/`/review`/`/close`'s own `status` frontmatter reads — these read the CURRENT story being
  worked on, which is runtime/ephemeral state (`.aiox/`), not LAG territory (architecture/decisions) —
  likely never migrates, listed here only so the inventory is complete per AC1.

---

*LAG Phase-0 Query v1.0 — AIOX Cockpit*
*Source: Story 031.W4.3 (epic 031, Wave 4 — D8). Generalizes Phase-0 recognition to optionally consult
the Living Architecture Graph via `031.W4.1`'s headless MCP server.*
