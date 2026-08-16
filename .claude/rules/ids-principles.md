---
paths:
  - "crates/**"
  - "services/**"
  - ".aiox-core/skills/**"
  - ".aiox-project/skills/**"
  - ".aiox-core/agents/**"
  - ".aiox-project/agents/**"
---

# IDS Principles — REUSE > ADAPT > CREATE

Applies when proposing new components, crates, services, skills, agents, or any reusable artifact.

## Hierarchy (GOVERNANCE PRINCIPLE — enforced by agent compliance)

| Prioridade | Ação | Descrição |
|-----------|------|-----------|
| **1. REUSE** | Usar existente sem modificação | O artefato já existe e atende 100% do requisito |
| **2. ADAPT** | Adaptar existente | Existe mas precisa de ajuste menor |
| **3. CREATE** | Criar do zero | Nada atende, mesmo adaptado — e você mediu isso |

## Consulta obrigatória ANTES de criar (as fontes reais deste repo)

1. **Crates:** `crates/` (6 — cockpit, core, conductor, git, gh, license) — a capacidade pode já existir como módulo/verbo CLI.
2. **Skills:** `.aiox-core/skills/` + `.aiox-project/skills/` (o inventário vivo; `skills-tiers.json` lista tudo).
3. **Serviços:** `services/` (ex.: clickup-core, clickup-bridge).
4. **Decisões:** `docs/architecture/ADR-*.md` com `status: APPROVED` — um ADR pode já ter decidido o mecanismo (não reinvente o que um `enforced_by` aponta).

## Gates de decisão

- **G1 Existe?** — grep/glob nas 4 fontes acima ANTES de propor. Zero matches é um achado (registre-o).
- **G2 Atende?** — se existe e cobre o requisito → REUSE (fim).
- **G3 Adaptável?** — mudança pequena, sem quebrar consumidores existentes → ADAPT (verifique consumidores por grep, não de memória).
- **G4 Autorizado?** — a criação respeita autoridades (@db-sage p/ schema, @devops p/ push/release) e ADRs vigentes.
- **G5 Compatível?** — com a stack real deste repo: Rust (Cargo workspace) no produto; Node só em `services/` e tooling do framework; skills em Markdown no SOT.
- **G6 Registrado?** — o criado entra no lugar canônico (crate no workspace, skill no SOT + `skills-tiers.json`, ADR se for decisão de arquitetura).

## Anti-patterns

- Criar uma skill/verbo novo para algo que um crate já expõe (ou vice-versa) sem citar por que REUSE/ADAPT falhou.
- Duplicar um caminho de código por variante em vez de parametrizar (a lição medida do dispatch: `wave.rs` × `companion.rs`, 11 defeitos — ADR-AIOX-UNIFIED-DISPATCH).
- "Consultei de memória" — consulta é grep/ls com resultado citável.

---

*IDS Principles v2.0 — AIOX Cockpit (reescrita context-diet fase 2, 2026-07-26; a v1.0 vinha do sinkra-hub com stack FastAPI/React/Supabase, registries squads//services/INDEX.json e globs mortos — substituídos pelas fontes reais deste repo; movida do overlay para o framework, é cross-cutting)*
