# Heurísticas domínio → globs `paths:`

Ponto de partida para escopar uma rule. O `audit-context.mjs` já detecta
diretórios mencionados no corpo da rule e sugere globs ranqueados por frequência.
**Sempre enxugue** — melhor 1–2 globs certos que 5 largos.

## Por palavra-chave no nome/conteúdo da rule

| Sinal na rule | Glob(s) `paths:` sugerido(s) |
|---|---|
| supabase, migration, schema, RLS, DDL, drift | `supabase/**` |
| story, epic, sprint, backlog, authoring | `docs/stories/**` |
| ADR, architecture decision | `docs/**/ADR-*.md`, `docs/architecture/**` |
| skill, SKILL.md, skill-* | `.claude/skills/**` |
| agent, persona, handoff, subagent | `.claude/agents/**`, `.aiox-core/**/agents/**`, `*/handoffs/**` |
| squad, config.yaml, ecosystem | `squads/**` |
| service, adapter, ETL, integration | `services/**` |
| package, @scope/*, publishing | `packages/**` |
| workspace, business, L0-L4, BU | `workspace/**` |
| CI, workflow, gate, pipeline yml | `.github/workflows/**` |
| deploy, infra, coolify, vercel, railway | `infrastructure/**` |
| design, token, frontend, component, tsx/css | `apps/**/*.{tsx,jsx,css}`, `packages/**/components/**`, `squads/design-*/**` |
| clickup, tokenization, materialization | `services/**` OU **ON-DEMAND** se for API-guide de leitura rara |
| wave, SDC, full-cycle, conductor, worktree | `.claude/skills/{wave-*,full-*,*-full-cycle,*-wave-execute}/**`, `.claude/hooks/*conductor*` |
| package.json, IDS, dependency | `*/package.json`, `squads/*/config.yaml` |
| output, artifact, traceability | `outputs/**` |
| stories.tsx, fixtures, chromatic | `**/*.stories.tsx` |
| SSE, EventSource, session-stream | caminho do serviço específico (ex.: `services/session-stream/**`) |

## KEEP-GLOBAL (não escopar — vale para todo trabalho)
Autoridade de agente · resolução completa de findings · portable-paths · registry
governance de pre-push · task lifecycle · qualquer coisa marcada
"non-negotiable"/"applies when any agent"/"before every push". Mire ≤ 5–7 dessas.

## ON-DEMAND em vez de SCOPE quando…
- a rule é um GUIA de leitura (ClickUp API, MCP usage, desktop-commander, PDF
  pagination) consultado esporadicamente — não governa edição contínua de código;
- não há diretório de domínio detectável no corpo;
- o projeto roda waves/SDC em worktree (escopo é ignorado lá dentro → mova).

## Cross-refs antes de mover
Antes de `on-demand` numa rule, `grep` por `.claude/rules/<nome>.md` no repo (via
`Bash ls`/`rg` escopado — Glob amplo estoura timeout em monorepos). Se CI, skills
ou hooks referenciam o caminho `.claude/rules/...`, **escope in-place** (SCOPE) em
vez de mover, ou atualize todos os cross-refs no mesmo passo.

## Exemplo real (allfluence → mesma treatment do synkra-hub)
| Rule | tok | Disposição | paths |
|---|---|---|---|
| orchestration-telemetry | 12.4k | SCOPE | `.claude/skills/{sinkra-full-cycle,sinkra-wave-execute,full-sdc,full-tec,wave-execute,roundtable}/**` |
| sinkra-pipeline-canon | 11.7k | SCOPE | `.claude/skills/{sinkra-pipeline,S01,S02,S03,S04}/**`, `.claude/agents/sinkra-squad--*.md` |
| conductor-decision-routing | 5.7k | SCOPE | `.claude/skills/sinkra-*`, `.claude/hooks/conductor-*`, `services/mux-adapter/**` |
| clickup-organization | 0.9k | ON-DEMAND | → `docs/reference/rules/` (guia de API, leitura rara) |
| agent-authority | 0.9k | KEEP-GLOBAL | — (autoridade cross-cutting) |
