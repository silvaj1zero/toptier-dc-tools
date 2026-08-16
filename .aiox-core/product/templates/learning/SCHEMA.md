# Learning Store — Channel 1 schema & layout (F3)

The **project-local** learning store (ADR-COCKPIT-LEARNING-TELEMETRY **Channel 1**). It stays
with the user and drives the project's own SDC loop — `/validate` reads it inbound (Phase 0a),
every skill writes to it (Phase 7), and promotion curates it (Phase 0b). It is **NOT** Channel 2
(product telemetry → origin); no framework-improvement metrics live here, and nothing here leaves
the machine.

> Channel 2 (product self-improvement telemetry) is a separate stream (`.aiox/telemetry/`, conductor-owned).

## Layout (under `aiox.config.json → learning.root`, default `.aiox/learning/`)

```
.aiox/learning/
├─ logs/<skill>/<skill>-<story-id>-<YYYYMMDD-HHmmss>.yaml   # Phase 7 — every execution, append-only
├─ entries/<skill>/<entry-id>.yaml                          # draft learnings (accumulate promotion_score)
├─ promoted/<heuristic-id>.yaml                             # Phase 0b promotion target (crossed threshold + human-approved)
└─ approved/<heuristic-id>.yaml                             # active KB read inbound (Phase 0a)
```

`.aiox/` is gitignored — the store is runtime project state, never committed.

## Lifecycle (the loop)

```
skill runs ──Phase 7──▶ logs/<skill>/…            (the raw record; epilogue: what_worked/what_failed/confidence)
                  │
                  └─────▶ entries/<skill>/…         (a candidate learning; promotion_score accumulates over runs)
                                  │
              Phase 0b (lazy, human-prompted, score ≥ threshold)
                                  ▼
                          promoted/…  ─────────────▶  ACTIVE KB
                                  ▲                        │
              projects/overlays may curate ──▶ approved/   │
                                                           │
skill runs ◀──Phase 0a (relevance-filter inbound)──────────┘
```

**Active KB = `promoted/` ∪ `approved/`** (synonyms by design — promotion = approval). The helper
reads both; new promotions land in `promoted/`; hand-curated or overlay heuristics may be dropped
in `approved/`. Phase 0a reads the union, relevance-filtered. (Resolving the two historical names
this way keeps every skill's path reference valid without editing prose.)

## Schemas

### Execution log — `logs/<skill>/<skill>-<story-id>-<ts>.yaml` (Phase 7)
```yaml
schema_version: "1.0"
skill_id: validate
story_id: "202.W3.2"
timestamp: "2026-06-30T12:00:00.000Z"
outcome: passed | failed | halted          # the ACK status
summary: {}                                # skill-specific counters (e.g. {checks_passed, auto_fixed})
enrichment_applied: true                   # validate-specific; omit when N/A
epilogue:                                  # floor-gated (close): non-empty what_worked/what_failed/confidence
  what_worked: ""
  what_failed: ""
  confidence: HIGH | MEDIUM | LOW
source_type: skill_execution
```

### Draft entry — `entries/<skill>/<entry-id>.yaml` (the promotion candidate)
```yaml
schema_version: "1.0"
entry_id: "validate-adapt-not-create-20260630"
skill_id: validate
type: pattern | anti-pattern | gotcha | heuristic
status: draft | promoted
created_at: "2026-06-30T12:00:00.000Z"
promotion_score: 1.0                       # accumulates; promoted when ≥ learning.promotion_thresholds[type]
context:                                   # relevance-filter keys (Phase 0a)
  task_mode: EXECUTAR                       # any of the canonical enum, or null
  entity_type: null
  deploy_type: none
tags: [validation, draft-to-ready]
statement: "the learning, one line"
recommended_fix: ""                        # for anti-pattern / gotcha
evidence:
  - { story_id: "202.W2.1", observation: "…" }
```

### Active-KB heuristic — `promoted/<id>.yaml` (and `approved/<id>.yaml`) (Phase 0a inbound)
```yaml
schema_version: "1.0"
heuristic_id: "validate-adapt-not-create"
type: pattern | anti-pattern | gotcha | heuristic
skill_scope: [validate, develop]           # which skills consume it (empty = all)
context: { task_mode: null, entity_type: null, deploy_type: null }
tags: [validation, adapt-not-create]
statement: "…"
recommended_fix: "…"
promoted_from: "validate-adapt-not-create-20260630"   # the source entry_id
promoted_at: "2026-06-30T12:00:00.000Z"
```

## Relevance filter (Phase 0a — deterministic)
A heuristic is relevant to a story when ANY matches: `context.task_mode` equals the story's `task_mode`;
`context.entity_type` equals the story's `entity_input.entity_type`; `context.deploy_type` equals the
story's `deploy_type`; or a `tags` cross-cut hits (the skill's domain tags, e.g. `validation`,
`draft-to-ready`, `quality-gate`). `null`/empty context fields are wildcards (always match). Injected
in-memory as a "Known Heuristics" block — **never written into the story file**.

## Promotion (Phase 0b — deterministic + human gate)
A draft entry is a **candidate** when `promotion_score ≥ learning.promotion_thresholds[type]` (config;
defaults: pattern 3.5 · anti-pattern 3.0 · gotcha 2.5 · heuristic 4.0). Candidates are presented to the
human (`y=all / n=skip / 1,2=select / d=defer`); approved ones are copied to `promoted/` (becoming an
active-KB heuristic) and the source entry is marked `status: promoted` — **never deleted** (audit trail).

## Helper
`@aiox/conductor` `learning-store.ts` provides the deterministic ops (path builders, relevance filter,
promotion candidates, promote, KB read) — code, not LLM reasoning, for the mechanical steps. The skills
remain the writers of domain content; the helper is the shared, testable substrate.

> **Overlay:** a project may bind a richer KB source/promotion target via `.aiox-project` (e.g. SINKRA's
> curated heuristic corpus / L2-L3 decision-cards). The agnostic core owns only this layout + mechanism.
