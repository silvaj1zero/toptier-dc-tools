# Detecção de Tipo de Sistema — guia da skill /criar-sot

Classifica o sistema a documentar em um ou mais tipos. O tipo decide quais seções **por-tipo** e **condicionais** do template entram (ver `section-matrix.md`). A classificação é frequentemente **híbrida** — combine os tipos que se aplicam.

> Não force um único tipo. Um serviço FastAPI com fila Redis = `servico-api` + `orquestrador`. Um app Next.js com backend próprio = `frontend-app` + `servico-api`.

---

## Os 7 tipos + sinais de detecção

### `servico-api`
**Sinais:** expõe HTTP/REST/GraphQL; tem rotas/controllers/routers; framework de servidor (FastAPI, Express, Fastify, Next API routes). `package.json`/`pyproject` com web framework. Endpoints como superfície primária.
**Ativa:** §3 = "Modelo de Dados (Schema)" · §4 = "Camada de API (N Routes)" · §5 Integrações (universal) · §7 Auth & Segurança (forte) · §9 Runbook.
**Exemplares:** SOT-ACS, SOT-CHAT-BULLQ, SQUAD-ENGINE.

### `framework`
**Sinais:** biblioteca/plataforma consumida por OUTROS sistemas; publica pacotes; define contratos/extensões; pouca ou nenhuma UI própria. Foco em arquitetura em camadas e pontos de extensão.
**Ativa:** §3 = "Arquitetura em Camadas" · §4 = "Contratos / Pontos de Extensão" · §12 Anti-patterns (forte) · §7 mais leve.
**Exemplar:** SINKRA-HUB-ARCHITECTURE.

### `orquestrador`
**Sinais:** coordena execução assíncrona; tem DAG, eventos, filas, hooks, máquina de decisão; processos paralelos/sequenciais; webhooks/polling. A lógica é o *fluxo*, não o dado.
**Ativa:** §3 = "Conceitos Fundamentais / DAG" · §4 = "Cadeia de Eventos / Pipeline" · §5.2 catálogo de webhooks/eventos · §12 Anti-patterns.
**Exemplar:** SOT-wave-conductor-system.

### `modelo-dados`
**Sinais:** o artefato central é o *schema* — tabelas, relações, lifecycle de entidades, storage model. Pode não ter API própria. Migrations dominam.
**Ativa:** §3 = "Modelo de Dados" muito forte (tabelas + enums + status machines + RLS + ERD) · §4 mais leve ou ausente · §12 Anti-patterns de modelagem.
**Exemplar:** SOT-DB-ENTITY-STORAGE-MODEL.

### `reverse-eng`
**Sinais:** **modo de produção**, não um tipo de sistema — aplica-se sempre que você está fotografando um codebase/produto *existente* (vs. desenhar um novo). Convive com qualquer tipo acima.
**Ativa:** convenção de confiança `[CONFIRMADO]/[INFERIDO]` no frontmatter · Executive Summary + Glossário cedo · §12 Anti-patterns · §1.3 Números-Chave (métricas reais).
**Exemplares:** CLICKUP-DOC-EDITOR, DB-ENTITY (ambos reverse-eng de produto de terceiro).

### `frontend-app`
**Sinais:** SPA/app com UI como superfície primária (React, Next, Vue); rotas de tela, componentes, hooks, estado. Pode ter backend acoplado ou consumir API externa.
**Ativa:** §6 = "Frontend & Funcionalidades" forte (mapa de navegação + módulos + jornadas E2E) · §7 Auth (login/guard/sessão) · §3/§4 conforme tiver backend próprio.

### `workflow`
**Sinais:** um processo/fluxo operacional (humano + sistema), não um codebase. Tem etapas, gatilhos, responsáveis, artefatos de entrada/saída. Pode ser greenfield (só desenho) ou mapeado de uma operação real.
**Ativa:** §3 = "Conceitos / Etapas" · §4 = "Fluxo / Gatilhos & Transições" · §6 jornadas se houver atores · §9 Runbook operacional. Frequentemente `greenfield` (elicitação) em vez de reverse-eng.
**Nota:** se o workflow for um processo SINKRA a ser *executado por agentes*, considere `/sinkra-pipeline` (mapeamento) em vez de só um SOT.

---

## Procedimento de classificação

1. **Pergunte/observe a natureza:** é código que roda? UI? biblioteca? schema? processo operacional?
2. **Modo:** há código/config real para ler → ativa `reverse-eng`. Só desenho → `greenfield` (elicitação).
3. **Combine** os tipos que se aplicam (1 a 3 normalmente).
4. **Mapeie** para as seções via `section-matrix.md`:
   - §3 e §4 são **por-tipo** — escolha as variantes do(s) tipo(s).
   - §6, §9 são **condicionais** — ative se houver UI/agente (§6) ou se for operável/deployável (§9).
   - §1, §2, §5, §7, §8, §10, §11, §13, §14 são **universais** — quase sempre entram.
   - §12 Anti-patterns entra em `reverse-eng`/`framework`/`orquestrador`; omita em `servico-api` puro.
5. **Registre a decisão** no início do trabalho: "Tipo = X (+ Y); modo = reverse-eng/greenfield → seções ativadas: ...". Isso evita SOT inchado com seções vazias.

---

## Matriz rápida tipo → seção de domínio

| Tipo | §3 (domínio núcleo) | §4 (segundo domínio) | §12 Anti-patterns |
|------|---------------------|----------------------|-------------------|
| `servico-api` | Modelo de Dados (Schema) | Camada de API | omitir (ou leve) |
| `framework` | Arquitetura em Camadas | Contratos / Extensões | incluir |
| `orquestrador` | Conceitos / DAG | Cadeia de Eventos / Pipeline | incluir |
| `modelo-dados` | Modelo de Dados (forte) | leve/ausente | incluir (modelagem) |
| `frontend-app` | Modelo de Dados (se backend) | Camada de API (se backend) | omitir |
| `workflow` | Conceitos / Etapas | Fluxo / Gatilhos | conforme |
| `reverse-eng` | *(herda do tipo-base)* | *(herda do tipo-base)* | incluir |

---

*type-detection.md — skill criar-sot | tipos destilados dos 7 SOTs reais amostrados (R14, 2026-06-24)*
