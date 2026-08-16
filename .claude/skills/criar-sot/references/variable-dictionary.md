# Variable Dictionary — Template SOT de Arquitetura

> Dicionário de cada `{placeholder}` do `template-canonical.md`. Cada entrada: descrição, tipo,
> e exemplo real extraído de um dos 7 exemplares (com o código da fonte — ver section-matrix.md).
> Disciplina: todo exemplo traça a um SOT real; nenhum foi inventado.

## Frontmatter

| Placeholder | Descrição | Tipo | Exemplo real (fonte) |
|-------------|-----------|------|----------------------|
| `{nome-do-sistema}` | Nome canônico do sistema/serviço | string | "ACS — Allfluence Creative Studio" (ACS); "squad-engine" (SE) |
| `{subtítulo de escopo}` | Frase que delimita o que o SOT cobre | string | "Arquitetura, Funcionalidades & Operação" (ACS); "Arquitetura (Super-Doc)" (SE) |
| `{semver}` | Versão do documento | semver | `1.0.0` (ACS, CBQ, SE); `1.1.0` (WC, SH) |
| `{YYYY-MM-DD}` | Data do doc/última revisão | date | `2026-06-23` (ACS); `2026-06-18` (CBQ) |
| `{Status}` | Estado do doc | enum | `CANONICAL SOT` (ACS, CBQ, SE); `SKELETON` (SH); `CONGELADO` (WC); `DRAFT` (PRD); `COMPLETE` (SCP) |
| `{Owner}` | Responsável pelo doc | string | "Pedro Valério" (ACS, CBQ, WC); "@sinkra-architect" (DBE) |
| `{escopo}` | 1-3 linhas + branch/commit auditado | prose | "branch `acs-main` … commit `e60549e1a`" (ACS); "Stack WhatsApp omnichannel decodificado…" (CBQ) |
| `{fontes absorvidas}` | Docs consolidados/substituídos | list | "19 fontes (00-OVERVIEW, EVENT-SCHEMAS, …)" (SE); "SINKRA-HUB-ARCHITECTURE-V3 + …" (SH) |
| `{SOTs complementares}` | Docs irmãos referenciados (não duplicados) | list | "`SINKRA-HUB-ARCHITECTURE.md §5`" (SE); 7 rules + ADRs (WC) |
| `{path do cofre}` | Local dos segredos reais (gitignored) | path | `User/uazapi-private/credentials.md` (CBQ) |

## §1 Identidade & Tech Stack

| Placeholder | Descrição | Tipo | Exemplo real (fonte) |
|-------------|-----------|------|----------------------|
| `{URL/identificador}` | Endereço/ID público do sistema | string | `studio.allfluence.ai` (ACS); `@sinkra/squad-engine v3.0.0` (SE) |
| `{definição}` | 2-4 linhas: o que faz, p/ quem | prose | "plataforma interna de produção de criativos em escala" (ACS) |
| `{Natureza}` | Categoria do sistema | enum | "ferramenta de operação da equipe (não SaaS público)" (ACS); "serviço ONLINE" (SE) |
| `{Boundary}` | LOCAL ou ONLINE (ecossistema SINKRA) | enum | "ONLINE (produto deployado)" (SE); LOCAL (SCP) |
| `{tabela Tech Stack}` | Camada × Tecnologia × Versão/Papel | table | Framework=Next.js 16.1.6 (ACS); HTTP=Fastify 5 (SE); WhatsApp engine=uazapiGO (CBQ) |
| `{Números-Chave}` | Métricas que dimensionam o sistema | table | "API routes=57" (ACS); "Tabelas=49" (CBQ); "Containers=6+1+1" (CBQ) |

## §2 Topologia

| Placeholder | Descrição | Tipo | Exemplo real (fonte) |
|-------------|-----------|------|----------------------|
| `{diagrama Mermaid}` | graph TB/LR com subgraphs por fronteira | mermaid | BROWSER→NEXT→SUPA→EXT (ACS); EXT/CLOUD/UAZ/LOCAL (CBQ); PARENT/NYX/CHILD (WC) |
| `{Leitura}` | Parágrafo explicando o fluxo principal | prose | "o browser fala só com o Next.js (REST+SSE)…" (ACS) |

## §3-6 Domínio (por-tipo)

| Placeholder | Descrição | Tipo | Exemplo real (fonte) |
|-------------|-----------|------|----------------------|
| `{tabela de tabelas}` | Tabela × Propósito × Colunas-chave | table | `projects` / "Entidade central" / "user_id, package_type…" (ACS) |
| `{enums}` | Enums nativos × valores | table | `copy_document_status` = `draft, in_review, …, final` (ACS) |
| `{status machine}` | Entidade.status → estados | transition | `projects.status` = `setup → generation → review → … → discarded` (ACS) |
| `{modelo de autorização}` | RLS/policies/ownership | prose | "RLS habilitado em todas as tabelas; helper `user_owns_project(uuid)`" (ACS) |
| `{ERD}` | Árvore ASCII ou mermaid de relações | tree | `auth.users → profiles(1:1) → projects → products → …` (ACS) |
| `{tabela de endpoints}` | Endpoint × Métodos × Função × Toca | table | `/api/projects` / GET,POST / "lista/cria projeto" (ACS) |
| `{cadeia de eventos}` | Evento Inngest × input/output × steps | table | `process/start`, `wave/execute`, `agent/task.execute` (SE) |
| `{padrões transversais}` | Auth/erros/correlação repetidos | list | "Auth 51/57 com 401; symphony_task_id = chave de correlação" (ACS) |

## §5 Integrações

| Placeholder | Descrição | Tipo | Exemplo real (fonte) |
|-------------|-----------|------|----------------------|
| `{tabela-mestre integrações}` | Serviço×Propósito×EnvVars×Chamada×Auth×Sínc | table | N8N/Symphony, Cloudinary, Drive, ClickUp, Ollama (ACS); GeeLark, uazapi (CBQ) |
| `{pipeline E2E}` | Trace passo-a-passo de um fluxo | sequence | I2V: upload→Cloudinary→enqueue→submit→poll→approve→Drive (ACS); inbound/outbound WhatsApp (CBQ) |

## §7-9 Auth / Config / Runbook

| Placeholder | Descrição | Tipo | Exemplo real (fonte) |
|-------------|-----------|------|----------------------|
| `{mecanismo de auth}` | Login/guard/sessão | prose | "Supabase Auth email+senha (signInWithPassword)" (ACS) |
| `{camada primária}` | Onde a autorização REALMENTE ocorre | prose | "Camada primária = RLS. Frontend/route são UX" (ACS) |
| `{catálogo env vars}` | Variável × Propósito × Exposição | table | `SUPABASE_SERVICE_ROLE_KEY` / "Bypass RLS" / Secreta (ACS) |
| `{mapa de portas}` | Serviço × Porta host→interna | table | `db` 5437→5432, `api` 3007→3001 (CBQ) |
| `{deploy/CI}` | Plataforma + pipeline + gotchas | prose | "Vercel zero-config → studio.allfluence.ai" (ACS); "GHCR → deploy by digest" (SE) |
| `{comandos runbook}` | Bash reproduzível comentado | bash | `supabase start` + `npm run dev` (ACS); `docker compose up -d` (CBQ) |
| `{gotchas}` | Sintoma × Causa × Ação | table | "Mensagem não aparece sem refresh / socket morto / F5" (CBQ); migration `handle_updated_at` (ACS) |

## §10-14 Fechamento

| Placeholder | Descrição | Tipo | Exemplo real (fonte) |
|-------------|-----------|------|----------------------|
| `{glossário}` | Termo × Significado | table | "Symphony = TikTok Symphony API…" (ACS); "Projector = padrão SINKRA listen-only" (CBQ) |
| `{riscos}` | R1..Rn × Item × Severidade × Nota | table | "R1 Migration quebrada / alta" (ACS); "R1 tools Projector são stubs / alta" (CBQ) |
| `{anti-patterns}` | Prática × Por quê × Detecção | table | "sendText-nudge BANIDO" (WC); "depth-3 skill silently invisible" (forge canon) |
| `{referências}` | Código/skills/rules/research/cross-refs | list | paths de `services/mux-adapter/` etc. (WC); `[[project-chat-bullq-stack]]` (CBQ) |
| `{change log}` | Data × Versão × Mudança | table | "2026-06-23 / 1.0.0 / Criação do SOT…" (ACS) |
| `{linha de nota de rodapé}` | Divergências + política de segredos | string | "Este doc nunca contém tokens/segredos em claro." (ACS, CBQ) |
