# Section Matrix — SOT de Arquitetura (destilação R14)

> Matriz seção × exemplar. Fonte: 7 exemplares lidos (3 allfluence + 4 sinkra-hub canônicos),
> + 2 de borda (PRD, INDEX) lidos como taxonomia (não exemplares do tipo).
> Cobertura: 100% dos exemplares amostrados foram decompostos por header de nível 1-2.

## Exemplares (colunas)

| Cód | Exemplar | Tipo de sistema | Estilo |
|-----|----------|-----------------|--------|
| **ACS** | `docs/architecture/acs/SOT-ACS.md` | servico-api (Next.js/Supabase) | super-doc |
| **CBQ** | `docs/architecture/chat-bullq/SOT-CHAT-BULLQ.md` | servico-api + infra (NestJS/WhatsApp) | super-doc |
| **WC** | `docs/architecture/SOT-wave-conductor-system.md` | orquestrador | super-doc/sistema |
| **SE** | `…/sinkra-hub/SOT/SQUAD-ENGINE-ARCHITECTURE.md` | servico-api/orquestrador (Inngest) | super-doc |
| **SH** | `…/sinkra-hub/SOT/SINKRA-HUB-ARCHITECTURE.md` | framework/plataforma | super-doc |
| **CDE** | `…/sinkra-hub/SOT/CLICKUP-DOC-EDITOR-ARCHITECTURE.md` | reverse-eng (editor) | reverse-eng |
| **DBE** | `…/sinkra-hub/SOT/SOT-DB-ENTITY-STORAGE-MODEL.md` | modelo-dados (AOM) | model/reverse-eng |
| _SCP_ | `…/SOT/SQUAD-CREATOR-PRO-ARCHITECTURE.md` | reverse-eng (squad) | super-doc (frontmatter YAML) |
| _(PRD)_ | `…/SOT/SINKRA-HUB-PRD.md` | **borda** (PRD, não arquitetura) | product-doc |

> _SCP entra como exemplar parcial (frontmatter YAML em vez de blockquote). PRD é tipo-borda: documentado em findings, NÃO usado para destilar a estrutura núcleo._

## Matriz (✅ presente · — ausente · ~ variante/parcial)

| Seção / bloco | ACS | CBQ | WC | SE | SH | CDE | DBE | % | Classificação |
|---------------|:---:|:---:|:--:|:--:|:--:|:---:|:---:|:--:|---------------|
| **Frontmatter metadados** (Versão/Data/Status/Owner/Escopo) | ✅ | ✅ | ✅~ | ✅ | ✅ | ✅~ | ✅~ | 100% | **universal** |
| ↳ estilo blockquote `>` | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | 86% | universal (default) |
| ↳ estilo tabela/YAML | — | — | ✅ | — | — | — | — | 14% | rara (variante) |
| **Consolida/Substitui fontes** | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | 71% | condicional: doc consolida |
| **Cofre de segredos** (mascarar) | — | ✅ | — | — | — | — | — | 14% | condicional: tem segredos |
| **Convenção de confiança** [CONFIRMADO]/[INFERIDO] | — | — | — | — | — | ✅ | ✅ | 29% | condicional: reverse-eng/inferência |
| **Regra de ouro** (No-Invention) | ~ | ~ | ✅ | ✅ | ✅ | ✅ | ✅ | 71% | universal (recomendado) |
| **Índice** numerado | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 100% | **universal** |
| **Como Ler Este Documento** (tabela intenção) | ✅ | ✅ | — | ✅ | ✅ | — | — | 57% | condicional: super-doc |
| **Cenário Recorrente** (fio condutor) | ✅ | ✅ | — | ✅ | — | — | — | 43% | condicional: super-doc didático |
| **Executive Summary** | — | — | ✅ | — | ~ | ✅ | ✅ | 43% | por-tipo: orquestrador/reverse-eng/modelo |
| **§1 Identidade & Tech Stack** | ✅ | ✅ | ✅~ | ✅ | ✅ | ✅~ | ✅~ | 100% | **universal** |
| ↳ Tabela Tech Stack | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | 86% | universal |
| ↳ Números-Chave | ✅ | ✅ | ~ | — | ~ | — | — | 43% | condicional: codebase auditado |
| **§2 Topologia (Top-View) + Mermaid** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 100% | **universal** |
| ↳ parágrafo "Leitura:" | ✅ | ✅ | ✅ | ✅ | ~ | — | — | 71% | universal |
| **Glossário** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 100% | **universal** |
| ↳ posição (cedo §2 vs tarde §10+) | tarde | tarde | cedo | tarde | tarde | cedo | cedo | — | nota: reverse-eng põe cedo |
| **Modelo de Dados / Schema** (tabelas+RLS+ERD) | ✅ | ~ | — | ✅ | ✅ | — | ✅ | 57% | por-tipo: servico-api/modelo-dados/framework |
| **Status Machines (lifecycle)** | ✅ | ✅ | — | ✅ | — | — | ✅ | 57% | condicional: entidades com lifecycle |
| **Camada de API (routes)** | ✅ | ~ | — | — | — | — | — | 29% | por-tipo: servico-api |
| **Cadeia de Eventos / DAG / Pipeline** | — | — | ✅ | ✅ | ~ | — | — | 43% | por-tipo: orquestrador |
| **Block Model / Catálogo (blots/comandos)** | — | — | — | — | — | ✅ | — | 14% | por-tipo: reverse-eng (editor) |
| **Integrações Externas & Pipelines** | ✅ | ✅ | ~ | ✅ | ✅ | — | — | 71% | universal (serviços) / condicional |
| ↳ Pipeline/Sequência E2E | ✅ | ✅ | ✅ | ✅ | — | — | — | 71% | condicional: fluxo assíncrono |
| **Frontend & Funcionalidades / Camada Agêntica** | ✅ | — | — | — | ✅ | ✅ | — | 43% | condicional: tem UI/agêntica |
| ↳ Jornadas E2E (J1, J2…) | ✅ | — | — | — | ~ | — | — | 29% | rara |
| **Realtime / WebSocket** | ~ | ✅ | — | ~ | ✅ | ~ | — | 43% | condicional: realtime |
| **Auth & Segurança** | ✅ | ✅ | ~ | ~ | ✅ | — | ✅ | 71% | universal (serviços) / condicional |
| **Config, Env Vars & Deploy / Infra** | ✅ | ✅ | ✅~ | ✅ | ✅ | — | ✅~ | 86% | **universal** |
| ↳ Mapa de Portas / Containers | — | ✅ | — | ~ | ✅ | — | — | 43% | condicional: stack docker |
| ↳ Estrutura de Pastas | ✅ | — | — | ~ | ✅ | — | — | 43% | condicional: codebase |
| **Setup Local & Runbook / Operação** | ✅ | ✅ | ✅ | ~ | ~ | — | — | 57% | condicional: operável |
| ↳ Gotchas recorrentes (sintoma/causa/ação) | ✅ | ✅ | ✅ | — | — | — | — | 43% | condicional: operável |
| **Telemetria / Eventos** | — | — | ✅ | ✅ | — | — | — | 29% | por-tipo: orquestrador |
| **Riscos, Gaps & Pendências** (R1..Rn + severidade) | ✅ | ✅ | ✅ | ~ | ✅ | ✅ | ✅ | 100% | **universal** |
| **Anti-patterns** | — | — | ✅ | — | ~ | ✅ | ✅ | 43% | por-tipo: reverse-eng/orquestrador/framework |
| **Decisões / Conformidade / Validação** | — | — | — | — | ✅ | — | ✅ | 29% | rara/por-tipo: modelo-dados/framework |
| **Histórico Evolutivo** (W10→W14 / waves) | — | — | ✅ | — | ~ | — | — | 29% | rara: sistema com evolução iterativa |
| **Referências** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 100% | **universal** |
| **Change Log** (tabela Data/Versão/Mudança) | ✅ | ✅ | ✅ | ~ | ✅ | ✅ | ✅ | 100% | **universal** |
| **Rodapé de assinatura** (`*Sistema SOT v… — org*`) | ✅ | ✅ | ✅ | ✅ | ~ | — | ~ | 71% | universal |

## Sumário de classificação

| Classe | Nº de seções/blocos | Exemplos |
|--------|---------------------|----------|
| **universal** (≥80%) | **11** | Frontmatter, Índice, §1 Tech Stack, §2 Topologia+Mermaid, Glossário, Config/Env/Deploy, Riscos/Gaps, Referências, Change Log, (Regra de ouro), (Rodapé) |
| **condicional** (gatilho) | **13** | Consolida/Substitui, Cofre segredos, Convenção confiança, Como Ler, Cenário Recorrente, Números-Chave, Status Machines, Integrações, Pipeline E2E, Frontend/Agêntica, Realtime, Auth, Portas/Pastas, Runbook/Gotchas |
| **por-tipo** (servico-api/orquestrador/framework/modelo-dados/reverse-eng) | **6** | Modelo de Dados, Camada de API, Cadeia de Eventos/DAG, Block Model, Telemetria, Anti-patterns |
| **rara** (1 exemplar) | **5** | Jornadas E2E, Histórico Evolutivo, Decisões/Validação, frontmatter YAML/tabela, Block Model |

> **Núcleo invariante (sempre presente):** Frontmatter → Índice → §1 Tech Stack → §2 Topologia(Mermaid) → [domínio por-tipo] → Glossário → Config/Deploy → Riscos/Gaps → Referências → Change Log. As 11 seções universais formam o esqueleto; condicionais/por-tipo preenchem o miolo conforme o sistema.
