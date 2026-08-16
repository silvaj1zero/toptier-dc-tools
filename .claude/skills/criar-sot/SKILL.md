---
name: criar-sot
description: "Gera um SOT (Source of Truth de arquitetura) agnóstico a partir do contexto que a pessoa passar — um app, serviço, workflow, framework, sistema de orquestração ou modelo de dados. Detecta o tipo de sistema, lê o código real (reverse-engineering), elicita o design (greenfield), OU consome os artefatos observados de uma plataforma viva de terceiro sem código (blackbox-observed — output humano-legível da /platform-anatomist), e preenche o template canônico destilado com disciplina No-Invention. Use quando precisar documentar a verdade arquitetural de um sistema num único doc canônico."
version: "1.1.0"
owner_squad: sinkra-squad
sinkra_tier: Tier2
context: inline
agent: general-purpose
user-invocable: true
argument-hint: "[o que documentar: nome + paths do código-fonte; ou descrição se for design novo]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, AskUserQuestion, Agent
---

# /criar-sot — Gerador Agnóstico de SOT

Transforma **qualquer sistema** (app, serviço, workflow, framework, orquestrador, modelo de dados) num **SOT** — o documento que é a *fonte de verdade arquitetural* daquele sistema. Funciona em três modos:

- **Reverse-engineering** — há código/configs reais → a skill lê e fotografa a verdade.
- **Greenfield / design** — não há código ainda → a skill elicita o desenho do sistema.
- **Blackbox-observed** — plataforma de TERCEIRO sem código (observada viva pela `/platform-anatomist`) → a skill preenche o SOT a partir dos artefatos CAPTURADOS (stack-report/api-map/client-behavior-map/inferred-data-model), com a convenção de confiança estendida `[OBSERVED]`/`[PROBED]`. É o output humano-legível do decode black-box.

O template, a matriz de seções e o dicionário de variáveis vivem nesta skill (auto-contida):

| Recurso | Path | Para quê |
|---------|------|----------|
| Template canônico | `assets/template-sot-canonical.md` | O esqueleto preenchível (14 seções, destilado de 7 SOTs reais via R14) |
| Detecção de tipo | `references/type-detection.md` | Classificar o sistema → decidir quais seções ativar |
| Matriz de seções | `references/section-matrix.md` | Quais seções são universais / condicionais / por-tipo |
| Dicionário de variáveis | `references/variable-dictionary.md` | O que cada `{placeholder}` significa |

---

## Princípios NON-NEGOTIABLE

1. **No-Invention** (Constitution Art. IV / `epistemic-standards.md`) — todo claim do SOT traça a uma fonte real citada inline. O que não há evidência vira `*Informação faltante*`. **Nunca preencha com suposição apresentada como fato.**
2. **Convenção de confiança** — marque `[CONFIRMADO]` (observado no código/config) vs `[INFERIDO]` (deduzido, não medido) vs `*Informação faltante*`. Obrigatória em modo reverse-engineering. **Modo blackbox-observed** estende: `[OBSERVED]` (capturado empiricamente em HAR/DOM da plataforma viva — equivale a CONFIRMADO sem acesso ao código) · `[PROBED]` (hipótese testada via probe in-session — mais forte que INFERIDO) · `*Informação faltante*` (server-side inobservável).
3. **Segredos nunca em claro** — env vars secretas são mascaradas; o SOT aponta para o cofre (gitignored), nunca contém o valor.
4. **PT-BR com acentuação correta** em todo o conteúdo gerado.
5. **Agnóstico de sistema** (PV_KE_122) — UM template serve todos os tipos via seções condicionais; nunca crie variantes paralelas do SOT.

---

## Fluxo

### Fase 0 — Capturar alvo + fontes

Identifique (ou elicite, se o usuário não forneceu):

- **O quê:** nome do sistema + natureza em uma frase.
- **Fontes de verdade:** paths de código, repos, migrations, configs, docs existentes — OU, se greenfield, a descrição/desenho do sistema.

Se faltar contexto, pergunte via `AskUserQuestion` (mencione explicitamente a opção **"Outro — eu defino"** para resposta livre). Não prossiga sem saber o que documentar e de onde tirar a verdade.

### Fase 1 — Classificar o tipo (decide as seções)

Leia `references/type-detection.md` e classifique o sistema em um ou mais de:

`servico-api` · `framework` · `orquestrador` · `modelo-dados` · `reverse-eng` · `frontend-app` · `workflow` · `blackbox-observed`

A classificação é frequentemente **híbrida** (ex.: um serviço FastAPI com fila = `servico-api` + `orquestrador`). O tipo determina quais seções **por-tipo** (§3, §4, §12) e **condicionais** (§6, §9) entram. Consulte `references/section-matrix.md`.

### Fase 2 — Coletar evidência (No-Invention)

**Modo reverse-engineering (há código):**
- Detecte a stack (`package.json` / `pyproject.toml` / `requirements.txt` / `go.mod`...).
- Mapeie: rotas/endpoints, migrations/schema, status machines, env vars, deploy/CI, integrações externas, estrutura de pastas.
- **Codebase grande?** Delegue o sampling pesado a subagents (`Explore` ou `general-purpose`) em paralelo, cada um mapeando uma dimensão, devolvendo resumo estruturado — isso isola a leitura pesada do contexto principal (padrão R16). Consolide os retornos.
- Marque cada achado `[CONFIRMADO]` (visto no arquivo X linha Y) vs `[INFERIDO]`.

**Modo greenfield/design (sem código):**
- Elicite seção por seção. O que o usuário não souber/decidir ainda = `*Informação faltante*` (com nota de quando preencher).

**Modo blackbox-observed (plataforma de terceiro, sem código — fonte = `/platform-anatomist`):**
- A fonte de verdade são os **artefatos capturados** pelo decode black-box: `stack-report.yaml` (§1/§5), `api-map.yaml`/OpenAPI (§4), `client-behavior-map.yaml` (§6/§7 — transporte/realtime/sessão/SSR-CSR), `inferred-data-model.yaml` (§3), `reconstruction-manifest.yaml`/`confidence-ledger.yaml` (§2/§11). NÃO há código — nada é `[CONFIRMADO]`.
- Marque cada achado `[OBSERVED]` (capturado em HAR/DOM), `[INFERRED]` (deduzido do shape), `[PROBED]` (hipótese testada via probe in-session) ou `*Informação faltante*` (server-side inobservável: schema real do DB, joins, RLS, lógica server-side).
- **PII redigida** + **zero segredo/token em claro** (a plataforma é de terceiro). Coverage explícito (anti sampling-bias) na §11.
- Composição: a `/platform-anatomist` (stage `synthesis`) invoca esta skill em modo blackbox-observed passando os artefatos — REUSE > CREATE, não duplica o template.

### Fase 3 — Preencher o template

1. Carregue `assets/template-sot-canonical.md`.
2. **Pode** as seções: remova as condicionais cujo gatilho não dispara; para as por-tipo, mantenha a variante do(s) tipo(s) detectado(s).
3. Resolva todo `{placeholder}` (consulte `references/variable-dictionary.md`).
4. **Topologia (§2) é obrigatória:** gere um diagrama Mermaid real + o parágrafo "**Leitura:**".
5. Preencha: Riscos `R1..Rn` com Severidade (§11), Gotchas como tabela Sintoma×Causa×Ação (§9), Env Vars com coluna Pública/Secreta (§8).
6. Limpe os comentários de classificação (`<!-- [universal] -->`) e as instruções `> _Preencha:_` — elas são andaime, não saem no SOT final.

### Fase 4 — Escrever + validar

**Path de saída** (confirme com o usuário; default sensato):
- Sistema com pasta própria: `docs/architecture/{slug}/SOT-{SLUG}.md`
- Sistema único / transversal: `docs/architecture/SOT-{slug}.md`
- Fora do padrão allfluence: pergunte onde salvar.

**Self-check (Regra de Ouro)** antes de declarar pronto:
- [ ] Todo claim traça a uma fonte citada (ou está marcado `[INFERIDO]`/`*Informação faltante*`)?
- [ ] Zero segredos em claro? Env vars secretas mascaradas + cofre apontado?
- [ ] Seções por-tipo coerentes com o tipo detectado?
- [ ] Todo `{placeholder}` resolvido ou virou `*Informação faltante*`?
- [ ] Diagrama de topologia + "Leitura:" presentes?
- [ ] Riscos numerados com Severidade?
- [ ] PT-BR com acentuação correta?

Reporte os `*Informação faltante*` ao usuário (são o backlog de evidência a coletar).

### Fase 5 — (opcional) Indexar/registrar

- Se o repo mantém um `INDEX.md` de SOTs (padrão sinkra-hub), adicione a entry.
- Em repos com governança de registry, rode `registry-governance-check.js --mode advisory` se aplicável.

---

## Anti-patterns

| Anti-pattern | Por quê |
|--------------|---------|
| Inventar uma seção/dado sem fonte real | Viola No-Invention — use `*Informação faltante*` |
| Apresentar inferência como fato | Use `[INFERIDO]`; nunca disfarce de `[CONFIRMADO]` |
| Colar segredo/token em claro | Mascare sempre; aponte o cofre gitignored |
| Criar 2 SOTs (ex. um por tipo) em vez de 1 com seções condicionais | Viola PV_KE_122 (agnosticismo) |
| Ler codebase gigante inteiro no contexto principal | Delegue a subagents (R16) e consolide o resumo |
| Pular a detecção de tipo e despejar todas as seções | Gera SOT inchado com seções vazias |
| Documentar produto/negócio (Personas, Pricing, Roadmap) no SOT de arquitetura | Isso é PRD — outro tipo de doc |

---

## Exemplos de invocação

```
/criar-sot apps/gateway-ai — serviço Node.js, documentar a verdade arquitetural
/criar-sot tikguard-api (apps/tikguard-api) reverse-engineering completo
/criar-sot um workflow novo de onboarding de creators (greenfield, ainda só no desenho)
/criar-sot o framework de waves do wave-conductor — já existe código em services/mux-adapter
```

---

*criar-sot v1.1.0 — Sinkra Hub (portado de AllFluence) | template destilado via R14 de 7 SOTs reais | +modo blackbox-observed (output humano-legível da /platform-anatomist) | owner: sinkra-squad*
