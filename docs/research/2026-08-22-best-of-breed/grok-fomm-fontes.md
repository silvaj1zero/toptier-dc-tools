Vou tratar isto como pesquisa técnica com fontes primárias: primeiro confirmo o White Paper 197 da Schneider e, em paralelo, cruzo Uptime, EPI DCOS e Green Grid DCMM.A pergunta já está bem delimitada; vou extrair o White Paper 197 e as estruturas dos modelos concorrentes em paralelo.O WP 197 confirma 7 disciplinas e 26 elementos; o modelo completo está num PDF embutido — vou extraí-lo e cruzar Uptime, EPI e Green Grid.Tenho o WP 197 na íntegra. Vou consolidar a estrutura verificada, marcar o que não é público e gravar o relatório.**Sim: a fonte primária é o White Paper 197 da Schneider Electric.** O modelo completo de sub-elementos (~80) **não** está no PDF público de 9 páginas — está num anexo embutido. O paper **não** define fórmula nem pesos para um “nível FOMM global”.

Cópia do relatório em `docs/research/2026-08-22-fomm-facility-operations-maturity-model/`.

---

## 1. Fonte primária — confirmada

| Campo | Valor |
|---|---|
| Título | *Facility Operations Maturity Model for Data Centers* |
| Documento | Schneider Electric **White Paper 197** |
| Revisão | **Revision 1** (todas as páginas: “Rev 1”) |
| Autores | **Jennifer Schafer** e **Patrick Donovan** |
| Unidade | Data Center Science Center |
| Catálogo | `SPD_PDON-96KPLV_EN` / `WP197R1.pdf` |
| Copyright no PDF | **© 2014** (rodapé p. 9) |
| Data no catálogo SE | **22 Jul 2020**, Version V1 |
| Anúncio | Blog Schneider, **5 Mar 2014** |

**Como ler as duas datas.** Publicado em **2014** (Rev 1). 2020 no catálogo é relistagem do mesmo Rev 1. **Não há evidência pública de Rev 2.** **Verificar** se existe revisão interna não publicada.

O FOMM “tem forma e função baseadas na estrutura de maturity model do **IT Governance Institute**” (ITGI → ISACA/COBIT): CMM 1–5 aplicado a O&M de facility.

Companion: **White Paper 196**, *Essential Elements of Data Center Facility Operations* (Robert Woolley e Patrick Donovan, Rev 1) — os **12 elementos essenciais** do programa. O 196 descreve o *quê*; o 197 avalia o *a que ponto*.

O WP 197 tem 9 páginas. O modelo completo (~80 páginas; um apresentador Schneider em 2020 diz *“almost 80 different sub elements”*) está **embutido** na página Resources (“Double click icon to access PDF”). **Essa grelha não está no PDF público.**

Não confundir com o **FOMM do ICOR** (build-resilience.org, estrelas 1/2/3, ex. Santander) — é outro instrumento.

PDF oficial: [catálogo Schneider WP 197](https://www.se.com/us/en/download/document/SPD_PDON-96KPLV_EN/).

---

## 2. Estrutura completa (o que é público)

### 2.1 Cinco níveis (Figura 3)

Cada **sub-elemento** é classificado de **1 a 5**:

| Nível | Nome oficial | O que o paper descreve |
|---|---|---|
| **1** | **Initial / ad hoc** | Sem consciência, docs, monitoring, melhoria ou treino. Caso-a-caso. |
| **2** | **Repeatable but intuitive** | Alguma consciência. Pessoas diferentes fazem de forma similar. Sem docs formais, sem monitoring. Alta dependência de indivíduos. |
| **3** | **Defined process** | Processos standardizados, documentados, comunicados por treino. Sem mecanismo fiável para detetar desvios. Sem monitoring/melhoria. |
| **4** | **Managed and measurable** | Gestão monitora cumprimento e age. Monitoring + melhoria constante. Treino formal rastreado. Automação **limitada/fragmentada**. |
| **5** | **Optimized** | Prática refinada, melhoria contínua. IT integrada no workflow. Tools integradas. |

A Figura 4 usa rótulos de campo ligeiramente diferentes (*Non-existent/Initial · Reactive · Proactive · Managed & Measured · Optimized*). O paper **não** declara a equivalência 1-a-1. **Verificar** se Reactive/Proactive = níveis 2/3 no anexo.

*Formal training* (nota 2): materiais escritos + oral + prática/hands-on + avaliação escrita.

### 2.2 Sete disciplinas e 26 elementos — lista completa (Figura 2)

O paper: *“This image shows the 7 disciplines and their 26 elements only.”*

**1. Environmental Health & Safety Management**
- Illness & Injury Prevention
- Statutory Compliance

**2. Emergency Preparedness & Response**
- Emergency Response Procedures & Drills
- Scenario Drills
- Incident Management

**3. Maintenance Management**
- Asset Management
- Work Order Management
- Computerized Maintenance Management System
- Vendor Management
- Spare Parts Management

**4. Site Management**
- Infrastructure Management
- Site Operations
- Efficiency & Optimization
- Site Condition

**5. Operations Management**
- Personnel Management
- Performance Measurement
- Risk Management
- Financial Management
- Reporting

**6. Change Management**
- Risk Analysis & Communication
- Operational Procedure Development & Review
- Change Control Practices

**7. Quality Management**
- Document Management
- Training
- Inspections & Auditing
- Continuous Improvement

### 2.3 Sub-elementos

**Único elemento com sub-elementos publicados** (Figura 4, *1.0 Illness & Injury Prevention*):

| ID | Sub-elemento |
|---|---|
| 1.1 | Program Structure |
| 1.2 | PPE |
| 1.3 | Training |
| 1.4 | LOTO |
| 1.5 | Hazard Analysis |
| 1.6 | Hazardous Comms |
| 1.7 | Hazardous Materials |

**Os restantes ~73: verificar.** Não estão no WP público.

O que se pode **inferir** (não substitui o anexo):

- WP 196 lista 12 essential elements: EHS, personnel, emergency, maintenance, change, documentation, training, infrastructure, quality, energy, financial, performance monitoring and review.
- WP Schneider de emergências: 7 elementos em 3 categorias — EOPs, Crisis Management Plan, drills, incident management (log, report, failure analysis).
- Vídeo Schneider 2020: disciplina 2 inclui EOPs, CMP, BCP/DR, drills (processo/calendário/execução), incidentes (notify / identify / register / report / lessons learned).

---

## 3. Pontuação

Citação-chave (*Scoring and goal setting*):

> *The maturity model embedded in this paper **does not provide a form or describe a specific method for tallying and reporting the grading of all the sub-elements**.*

**Não há fórmula oficial de nível final nem pesos.**

O que existe:

1. Unidade de score = **sub-elemento**, ordinal **1–5**, com critérios por nível no anexo.
2. Três *linhas de inquérito* (Figura 5): Formal Process · Awareness and Training · Field Implementation.
3. Risco de disrupção **0–100%** por disciplina nessas três linhas. **Ação imediata se ≥ 60%.**
4. Heatmap atual vs. *target* da organização (Figura 4).
5. Matriz impacto vs. facilidade para priorizar *quick wins* (Figura 6).
6. Cadência: 1.ª avaliação no commissioning (ou o mais cedo); depois **anual** ou após mudança major.
7. Assessor: o paper recomenda **terceiro independente**.

O que **não** se pode afirmar: média → “FOMM 3.2”; pesos EHS > Change; pass/fail; estrelas 1/2/3 (isso é o FOMM do ICOR).

Leitura correta: o FOMM é um **perfil dimensional** (7×26), não um índice único. Qualquer “nível global” num quiz online é **convenção de quem implementa**.

---

## 4. Concorrentes e base para um quiz de 15–20 perguntas

### Uptime Institute — M&O Stamp of Approval

Certificação **pass/fail** de site/portfólio (não de pessoa). Validade **2 anos**. Independente de Tier. Enhanced **7 Nov 2024** + **CCAM®** (competência individual). >100 observation areas. +400 sites.

**Guideline clássico — 5 categorias:**
- Staffing and Organization (Staffing, Qualifications, Organization)
- Maintenance (PM, Housekeeping, MMS, Vendor Support, Deferred, Predictive, Life-Cycle, Failure Analysis)
- Training (Staff, Vendors)
- Planning, Coordination, and Management (Site Policies, Financial Process, Reference Library, Capacity Management)
- Operating Conditions (Load Management, Operating Set Points)

**Programa enhanced — 7 áreas:** Personnel Management · Maintenance · Facility Management & Optimization · Health, Safety, and Security · Emergency Preparedness and Response · Planning, Coordination · Quality Management (+ CCAM).

Datasheet MOSA agrupa em **6**. **Verificar** o mapa oficial 5 vs 6 vs 7 — materiais públicos não estão alinhados.

**Scoring.** Uptime **não publica** pesos. EPI (concorrente) escreve *“Pass/Fail (80 out of 100 points)”*. **Verificar** — não confirmado em material Uptime atual.

### Uptime — Tier Standard: Operational Sustainability (TCOS)

Três elementos, por impacto: **Management & Operations** (maior; AIR ~70% “human error”) → **Building Characteristics** → **Site Location**.

M&O espelha as 5 categorias acima. Building: Pre-Operational, Building Features, Infrastructure. Site: Natural / Man-Made Disaster Risk. Comportamentos **aplicáveis por Tier I–IV**. TCOS Bronze/Silver/Gold, validade 1/2/3 anos. M&O Stamp = o mesmo comportamento operacional **sem** exigir Tier de design.

### EPI DCOS (2021)

Padrão **aberto**, maturidade **ISO/IEC 33004** / CMMI.

| Nível | Distinção |
|---|---|
| DCOS-1 Initial | Heroísmo individual |
| DCOS-2 Repeatable | Processo informal consistente, people-dependent |
| DCOS-3 Defined | Processos descritos (alvo típico do 1.º audit) |
| DCOS-4 Managed | Performance previsível + melhoria |
| DCOS-5 Optimized | **Todas as 11 disciplinas** integradas |

**11 disciplinas:** Service Level Management · Organisation · Safety · Security · Project · Facilities · Data Centre Operations · Environment Sustainability · Monitoring/Reporting/Control · Organisational Resilience · GRC.

DCOS-1–4 por disciplina; DCOS-5 exige as 11. Auditoria parcial permitida. Melhor “lei escrita” do mercado.

### Green Grid DCMM

**Domínio errado para O&M.** É **eficiência energética e sustentabilidade** (WP 36 + Handbook WP 56, 2014).

Níveis **0–5:** 0 No Progress · 1 Part Best Practice · 2 Best Practice · 3–4 intercalares · 5 Visionary (~5 anos).

**8 categorias:** Power, Cooling, Other Facility, Management, Compute, Storage, Network, Other IT.

### Relacionado Schneider, não é FOMM

**TIMS** (*Tiered Infrastructure Maintenance Standard*): TIMS-1 Run to Fail · 2 Unstructured · 3 Structured · 4 Facilitated. EPI mapeia isto como “Schneider 1–4”. É recorte de **manutenção**.

### Melhor base para 15–20 perguntas

| | FOMM | DCOS | Uptime M&O/OS | DCMM |
|---|---|---|---|---|
| Cabe em 15–20 Q? | **Sim** (2–3 × 7 = 14–21) | Apertado (11 Q rasas) | Não (100+ items, pass/fail) | Sim, pergunta errada |
| Self-score 1–5 | Excelente | Excelente (ISO) | Fraco (binário) | 0–5, energy |
| Escopo O&M | Forte | Mais largo (SLM, GRC, security) | Forte em staffing/PM | Fraco |
| IP | Paper grátis; grelha embutida | Standard aberto | Proprietário | Membership TGG |

**Recomendação:** **FOMM como espinha (7 disciplinas, Likert 1–5)**. Emprestar o *wording* de maturidade do **DCOS** (mais limpo, ISO). Não copiar critérios Uptime. Não usar DCMM salvo se o produto for *efficiency*.

15–20 perguntas dão **perfil**, não selo. DCOS-5 e M&O Stamp não comprimem sem mentir.

---

## 5. Perguntas

Escala sugerida (espelha Fig. 3; **não** é a grelha embutida): 1 ad hoc · 2 repetível · 3 definido · 4 medido · 5 otimizado.

### Quiz rápido — 18 perguntas (2–3 por disciplina)

**EHS**
1. Existe programa escrito de prevenção de lesões (PPE, LOTO, hazard analysis, hazcom) **aplicado no chão**, ou depende de indivíduos?
2. O site demonstra cumprimento estatutário atual (elétrica, químico, fogo, ambiental) com evidência auditável?
3. Hazard analysis é obrigatório **antes** de cada procedimento, ou só em papel?

**Emergência**
4. Há EOPs para os modos de falha do site (elétrico, cooling, incêndio, perda de redundância)?
5. Drills de cenário são calendariados, executados e registados?
6. Incidentes são logged, com RCA, e devolvem lições aos procedimentos?

**Manutenção**
7. O inventário de ativos críticos no CMMS corresponde à realidade (incl. firmware)?
8. PM/PdM corre no prazo, com WO rastreados, e deferred maintenance é visível como risco?
9. Critical spares e vendor support (SLA, call-out, qualificações) estão contratados e testados?

**Site**
10. Capacidade espaço/power/cooling é gerida com dados, incluindo set-points e load management?
11. Housekeeping, condição física e otimização energética são programas, não campanhas?

**Operations**
12. Staffing 24×7 (in-house e/ou vendor) está dimensionado, com org chart, qualificações por role e escalada?
13. Há KPIs de O&M (incidentes, PM compliance, treino, orçamento) revistos pela gestão?
14. O budget está ligado a evidência de MMS/lifecycle, não só a corte anual?

**Change**
15. Trabalho que pode afetar a carga crítica exige MOP com análise de risco, aprovação e back-out?
16. SOP/MOP/EOP são revistos quando as-built ou firmware mudam?

**Quality**
17. Documentação (as-builts, procedimentos) está sob controlo de versões e acessível no turno?
18. Treino é formal (escrito + prática + avaliação) e há inspeções internas com CAPA?

Scoring sugerido (**convenção vossa, não Schneider**): mediana por disciplina; radar de 7 eixos; **não** emitir “FOMM Nível X” como certificado.

### Banco 2–3 por cada um dos 26 elementos

Itens **(inf.)** = inferidos do WP 196 / WP de emergências / prática mission-critical, **não** do anexo.

| Elemento | Perguntas |
|---|---|
| Illness & Injury Prevention | Programa tem dono e estrutura (1.1)? PPE/LOTO/HAZOP/hazcom/hazmat no campo (1.2–1.7)? Treino de segurança formal e rastreado? |
| Statutory Compliance | Inventário vivo de códigos? Findings de auditoria fechados? Permits em dia? **(inf.)** |
| Emergency Response Procedures & Drills | EOPs no turno? Crisis Management Plan com autoridade de isolar carga? **(inf.)** Drills de procedimento (não só incêndio predial)? |
| Scenario Drills | Calendário cobre black-start, failover UPS/gerador, perda de chiller, fogo no white space? **(inf.)** Drills observados/scored com CAPA? Ops + segurança (+ cliente, se colo) participam? |
| Incident Management | Near-miss também é registado? RCA com dono? Lições atualizam EOP/MOP e treino? |
| Asset Management | CMMS = realidade (tag, criticidade, firmware)? Lifecycle planeado? As-builts/DCIM batem com o chão? |
| Work Order Management | 100% do trabalho crítico passa por WO? Prioridade, permissão, close-out? Backlog gerido como risco? |
| CMMS | Fonte de verdade de PM/histórico/custo? Integra (ainda que parcialmente) DCIM/BMS/EPMS? **(inf.)** Relatórios alimentam staffing e budget? |
| Vendor Management | Contratos com scope, qualificações, response time? Vendors treinados nas regras do **site**? Escort vs. unescorted definido? |
| Spare Parts | Critical spares com min/max e localização? Rotação/shelf-life? **(inf.)** Lead time conhecido? |
| Infrastructure Management | DCIM/BMS/EPMS em produção? Capacity (kW, Q, m²) é processo? Redundância em bypass é visível? |
| Site Operations | Handover de turno formal? **(inf.)** SOPs de rotina (rounds, rotação)? Load management e set-points documentados? |
| Efficiency & Optimization | PUE/WUE medido e revisto? Programa de otimização com dono? Eficiência **não** compete com disponibilidade sem regra? |
| Site Condition | Housekeeping é PM? Inspeção de condição calendariada? **(inf.)** Gaps as-built vs. realidade têm plano? |
| Personnel Management | Headcount vs. criticidade (incl. 24×7)? Qualificações por role + escalada? Pessoa-única identificada? |
| Performance Measurement | KPIs definidos (PM compliance, MTTR, incidentes, treino)? Gestão revê e age? Metas alinhadas ao uptime do negócio? |
| Risk Management | Risk log operacional vivo? Deferred maintenance e mudanças entram nele? Risk appetite do DC escrito? |
| Financial Management | Budget cobre PM, spares, treino, lifecycle? MMS justifica o budget? Capex de substituição não é surpresa? |
| Reporting | Cadência e destinatário de relatórios de turno/KPI/incidente? Near-miss sobe? Chega a quem decide recurso? |
| Risk Analysis & Communication | Análise de risco **antes** de trabalho crítico? Stakeholders informados? Stop-the-job é autoridade real? |
| Operational Procedure Development | SOP/MOP/EOP com dono? Review cycle (anual + after-action)? Procedimento acompanha firmware/as-built? |
| Change Control Practices | CAB (ou equivalente) para mudanças que tocam carga crítica? Janela, back-out, evidência de teste? Emergency change tem path controlado? |
| Document Management | Controlo de versões? Biblioteca on-site acessível no incidente? Docs obsoletos retirados? |
| Training | Formal (definição Schneider)? Recertificação e drills no calendário? Vendors incluídos? |
| Inspections & Auditing | Inspeções internas com findings? Auditoria independente periódica? Findings com dono e prazo? |
| Continuous Improvement | CAPA de incidentes/drills/audits fecha o ciclo? Evidência de processo melhorado (não slide de “lições”)? Melhoria **medida** (nível 4–5)? |

---

## O que não é verificável

| Item | Estado |
|---|---|
| WP 197 Rev 1, autores, 7×26, níveis 1–5, ausência de fórmula | Verificado (PDF oficial) |
| Lista dos ~80 sub-elementos e rubricas 1–5 | **Não pública** — verificar no PDF embutido |
| Pesos / nível global FOMM | **Não existem** no paper |
| M&O “80/100 pontos” | **Verificar** (só EPI afirma) |
| Mapa 5 vs 6 vs 7 categorias M&O | **Verificar** no protocolo Uptime vigente (2024) |
| Tabelas OS componente × Tier | Standard proprietário |
| Subcategorias completas DCMM | WP 36/56 (login TGG); 8 categorias ok |
| FOMM ICOR 1–3 estrelas | Outro modelo |

**Fontes principais:** WP 197 (PDF SE); WP 196; blog SE 2014; Uptime M&O / OS / MOSA datasheet / press 2024; EPI DCOS 2021; Green Grid WP 36/56; Availability Digest (OS); vídeo Schneider 2020.
