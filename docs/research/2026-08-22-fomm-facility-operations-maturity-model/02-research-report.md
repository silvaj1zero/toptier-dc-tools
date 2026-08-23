# Relatório: FOMM — Facility Operations Maturity Model para data centers

Pesquisa com fontes primárias. O que não está no documento público está marcado **verificar**.

---

## 1. Fonte primária — confirmada

**Sim.** A fonte primária do FOMM de *facility operations* para data centers é:

| Campo | Valor verificado |
|---|---|
| Título | *Facility Operations Maturity Model for Data Centers* |
| Documento | Schneider Electric **White Paper 197** |
| Revisão | **Revision 1** (todas as páginas do PDF: “Rev 1”) |
| Autores | **Jennifer Schafer** e **Patrick Donovan** |
| Unidade | Data Center Science Center, Schneider Electric |
| Nº de catálogo | `SPD_PDON-96KPLV_EN` / ficheiro `WP197R1.pdf` |
| Copyright no PDF | **© 2014** Schneider Electric (rodapé da p. 9) |
| Data no catálogo SE | **22 Jul 2020**, Type: White Paper, Version: V1 |
| Anúncio público | Blog Schneider, 5 Mar 2014 — “white paper 197” |

**Como ler as duas datas.** O modelo foi publicado em **2014** (Rev 1). A data **2020** no catálogo SE é relistagem/republicação do mesmo Rev 1 — **não** há evidência pública de Rev 2. **Verificar** se existe revisão interna posterior não publicada.

**Genealogia.** O FOMM “tem forma e função baseadas na estrutura de maturity model do **IT Governance Institute**” (ITGI; hoje ISACA/COBIT). É um CMM 1–5 aplicado a O&M de facility, não um inventário de topologia.

**Companion obrigatório.** O próprio WP 197 aponta o **White Paper 196**, *Essential Elements of Data Center Facility Operations* (Robert Woolley e Patrick Donovan, Rev 1) como a descrição dos **12 elementos essenciais** de um programa O&M. O 197 é o *framework de avaliação*; o 196 é o *o quê*.

**O que o WP 197 NÃO contém.** O modelo completo (~80 páginas, ~80 sub-elementos) está **embutido** na página Resources (“Double click icon to access PDF”). O WP público tem **9 páginas**. Um apresentador Schneider (vídeo 2020) confirma: *“we cover almost 80 different sub elements”*. A lista nominal dos ~80 **não** está no PDF público.

**Não confundir com outro “FOMM”.** O ICOR (build-resilience.org) tem um *Facility Operations Maturity Model* com reconhecimento 1/2/3 estrelas (ex.: Santander DC). É **outro** instrumento de resiliência organizacional, não o WP 197.

---

## 2. Estrutura completa (o que é público)

### 2.1 Cinco níveis de maturidade

Escala **1 a 5** em **cada sub-elemento**. Nomes oficiais do WP 197, Figura 3:

| Nível | Nome | Características (síntese do paper) |
|---|---|---|
| **1** | **Initial / ad hoc** | Sem consciência, sem documentação, sem monitoring, sem melhoria, sem treino. Abordagens caso-a-caso. |
| **2** | **Repeatable but intuitive** | Alguma consciência. Procedimentos similares seguidos por pessoas diferentes. Sem processo standardizado de treino. Alta dependência de indivíduos (erros). Sem documentação formal, sem monitoring. |
| **3** | **Defined process** | Processos standardizados e documentados, comunicados por treino. Pessoal treinado nos meios e objetivos. Sem mechanism fiável para detetar desvios. Sem monitoring / sem melhoria contínua. Formalização de práticas existentes. |
| **4** | **Managed and measurable** | Gestão monitora cumprimento; age onde a melhoria é possível. Monitoring + melhoria constante. Treino formal rotineiro e rastreado. Automação/tools **limitada e fragmentada**. |
| **5** | **Optimized** | Prática refinada, processos baseados em melhoria contínua. IT integrada para automatizar o workflow. Tools integradas para qualidade e eficácia. |

Nota de nomenclatura (Figura 4 vs Figura 3): o exemplo de scorecard usa rótulos ligeiramente diferentes — *Non-existent/Initial · Reactive · Proactive · Managed & Measured · Optimized*. O paper **não** explica a equivalência 1-a-1. **Verificar** se “Reactive/Proactive” são aliases de campo dos níveis 2/3.

Definição de *formal training* (nota 2): materiais escritos + apresentação oral + demonstração prática ou hands-on + avaliação escrita.

### 2.2 Sete disciplinas e 26 elementos (lista completa — Figura 2)

O paper diz explicitamente: *“This image shows the 7 disciplines and their 26 elements only.”*

#### Disciplina 1 — Environmental Health & Safety Management
1. Illness & Injury Prevention  
2. Statutory Compliance  

#### Disciplina 2 — Emergency Preparedness & Response
3. Emergency Response Procedures & Drills  
4. Scenario Drills  
5. Incident Management  

#### Disciplina 3 — Maintenance Management
6. Asset Management  
7. Work Order Management  
8. Computerized Maintenance Management System  
9. Vendor Management  
10. Spare Parts Management  

#### Disciplina 4 — Site Management
11. Infrastructure Management  
12. Site Operations  
13. Efficiency & Optimization  
14. Site Condition  

#### Disciplina 5 — Operations Management
15. Personnel Management  
16. Performance Measurement  
17. Risk Management  
18. Financial Management  
19. Reporting  

#### Disciplina 6 — Change Management
20. Risk Analysis & Communication  
21. Operational Procedure Development & Review  
22. Change Control Practices  

#### Disciplina 7 — Quality Management
23. Document Management  
24. Training  
25. Inspections & Auditing  
26. Continuous Improvement  

### 2.3 Sub-elementos — o que é verificável vs. o que falta

**Único elemento com sub-elementos publicados** (Figura 4, *1.0 Illness & Injury Prevention*):

| ID | Sub-elemento |
|---|---|
| 1.1 | Program Structure |
| 1.2 | PPE |
| 1.3 | Training |
| 1.4 | LOTO (lockout/tagout) |
| 1.5 | Hazard Analysis |
| 1.6 | Hazardous Comms |
| 1.7 | Hazardous Materials |

**Resto (~73 sub-elementos): verificar.** Não estão no WP 197 público. Inferência a partir de companions (não substituem o modelo):

- **WP 196 — 12 essential elements:** environmental health and safety; personnel management; emergency preparedness and response; maintenance management; change management; documentation management; training; infrastructure management; quality management; energy management; financial management; performance monitoring and review.
- **WP Schneider de emergências** (7 elementos em 3 categorias): EOPs; Crisis Management Plan; emergency drills; incident management (log, report, failure analysis). Alinha com disciplina 2.
- Apresentação Schneider 2020 (transcrição): disciplina 2 inclui EOPs, crisis management plan, BCP/DR, drills (processo, calendário, execução), incident management (notify / identify / register / report / lessons learned).

**Conclusão estrutural:** 5 níveis × 7 disciplinas × 26 elementos × ~80 sub-elementos. A grelha de scoring por critério em cada um dos 5 níveis **existe no PDF embutido** e foi “tested and vetted with real data centers” — mas **não é reproduzível a partir do WP público**.

---

## 3. Como o modelo pontua

### O que o paper afirma (e o que recusa)

Citação-chave (secção *Scoring and goal setting*):

> *“The maturity model embedded in this paper **does not provide a form or describe a specific method for tallying and reporting the grading of all the sub-elements**.”*

Ou seja: **não há fórmula oficial de nível final, nem pesos oficiais**, no WP 197.

### Mecânica que *existe*

1. **Unidade de scoring = sub-elemento**, escala ordinal **1–5**.
2. **Critérios específicos por nível** para cada sub-elemento (no modelo embutido).
3. Três *linhas de inquérito* para agregar risco (Figura 5):
   - Formal Process  
   - Awareness and Training  
   - Field Implementation  
4. Risco de disrupção de sistema em **0–100%** (100% = risco máximo), por disciplina, nessas três linhas. **Ação imediata** se risco **≥ 60%**.
5. Heatmap (Figura 4): score atual vs. *target* da organização, com cores *Not observed/N/A · Target · Partially achieved · Achieved*.
6. Matriz impacto vs. facilidade (Figura 6) para priorizar *quick wins*.
7. Cadência sugerida: 1.ª avaliação no commissioning (ou o mais cedo possível); depois **anual** ou após mudança major de pessoal/processo/orçamento/objetivos.
8. Assessor: o paper recomenda **terceiro independente** — o FOMM é auto-aplicável, mas enviesado.

### O que **não** se pode afirmar

- Média aritmética das 7 disciplinas → “nível FOMM 3.2” — **inventar**; o paper não o faz.
- Pesos (EHS > Change, etc.) — **não publicados**.
- Pass/fail com cutoff — **não** é o desenho do FOMM (é o do Uptime M&O).
- Estrelas 1/2/3 — isso é o FOMM do **ICOR**, não o da Schneider.

A leitura honesta: o FOMM é um **diagnóstico dimensional** (perfil 7×26), não um índice único. Qualquer “nível global” num quick assessment é uma **convenção do implementador** e deve ser declarada como tal.

---

## 4. Modelos concorrentes / alternativos

### 4.1 Uptime Institute — M&O Stamp of Approval

**O quê.** Certificação **pass/fail** de *site/portfólio*, não de pessoa. Independente de Tier topológico. Validade **2 anos**. +400 sites premiados. Baseada no *Tier Standard: Operational Sustainability*. Enhanced Nov 2024 + ferramenta **CCAM®** (competência individual).

**Duas gerações de categorias (não misturar):**

*Guideline clássico (5 categorias, ainda no site de critérios):*

1. Staffing and Organization — Staffing, Qualifications, Organization  
2. Maintenance — PM Program, Housekeeping, MMS, Vendor Support, Deferred Maintenance, Predictive Maintenance, Life-Cycle Planning, Failure Analysis Program  
3. Training — Data Center Staff, Vendors  
4. Planning, Coordination, and Management — Site Policies, Financial Process, Reference Library, Capacity Management  
5. Operating Conditions — Load Management, Operating Set Points  

*Programa enhanced (7 áreas + CCAM; >100 observation areas):*

1. Personnel Management  
2. Maintenance  
3. Facility Management & Optimization  
4. Health, Safety, and Security  
5. Emergency Preparedness and Response  
6. Planning, Coordination  
7. Quality Management  
(+ Staff Competency and Confidence / CCAM)

Datasheet MOSA também agrupa em **6** frentes (staffing; planning/quality; capacity/efficiency; maintenance; emergency; HSS). **Verificar** o mapa oficial 5 vs 6 vs 7 — Uptime mudou o produto e os materiais públicos não estão 100% alinhados.

**Scoring.** Uptime **não publica** pesos nem a fórmula. EPI (concorrente) afirma *“Pass/Fail (80 out of 100 points)”*. **Verificar** — não confirmado em material Uptime atual. Comportamento observado: pass/fail + relatório de gaps + reassess a 2 anos. Não há “nível 3 de 5”.

### 4.2 Uptime Institute — Tier Standard: Operational Sustainability (TCOS)

**Três elementos**, por ordem de impacto:

1. **Management & Operations** (maior impacto; ~70% dos outages AIR atribuídos a “human error” / falhas de gestão)  
2. **Building Characteristics**  
3. **Site Location**

Categorias M&O (espelham o guideline): Staffing and Organization; Maintenance; Training; Planning, Coordination, and Management; Operating Conditions. Building: Pre-Operational, Building Features, Infrastructure. Site: Natural Disaster Risk, Man-Made Disaster Risk.

Cada comportamento é **aplicável por Tier I–IV** (tabelas de checkmarks). TCOS tem graus **Bronze / Silver / Gold** com validade 1 / 2 / 3 anos (fonte: overview Uptime). **Verificar** a tabela completa de componentes no PDF do standard (proprietário).

M&O Stamp = o mesmo *comportamento operacional* **sem** exigir Tier de design/construção.

### 4.3 EPI DCOS (Data Centre Operations Standard)

**Padrão aberto** (ISO/ANSI process), 2021 a edição vigente. Maturidade alinhada a **ISO/IEC 33004** / CMMI.

**5 níveis:**

| Nível | Nome operacional | Distinção-chave |
|---|---|---|
| DCOS-1 | Initial | Heroísmo individual; quase sem docs/treino/monitorização |
| DCOS-2 | Repeatable | Processo informal consistente; ainda people-dependent |
| DCOS-3 | Defined | Processos descritos e geridos de forma mais proactiva (alvo típico do 1.º audit) |
| DCOS-4 | Managed | Performance previsível + ciclo de melhoria |
| DCOS-5 | Optimized | **Todas as 11 disciplinas** integradas; só se atinge no conjunto |

**11 disciplinas:**

1. Service Level Management  
2. Organisation  
3. Safety Management  
4. Security Management  
5. Project Management  
6. Facilities Management  
7. Data Centre Operations  
8. Environment Sustainability  
9. Monitoring / Reporting / Control  
10. Organisational Resilience  
11. Governance, Risk & Compliance  

DCOS-1 a 4 aplicam-se **por disciplina**; DCOS-5 exige as 11. Auditoria parcial é permitida. Standard descarregável (pago ~USD 10 / leitura online). Melhor “lei escrita” do mercado para O&M.

### 4.4 The Green Grid DCMM (Data Center Maturity Model)

**Domínio errado para O&M de facility.** É um modelo de **eficiência energética e sustentabilidade**, não de operações/manutenção.

- WP 36 (modelo) + WP 56 Handbook (2014, editor Yoshihiro Fujie / IBM Japan); assessment tool online.  
- **Níveis 0–5:** 0 Minimal/No Progress · 1 Part Best Practice · 2 Best Practice · 3–4 passos intercalares · 5 Visionary (horizonte ~5 anos).  
- **8 categorias:** Power, Cooling, Other Facility, Management, Compute, Storage, Network, Other IT.  
- Subcategorias por componente (path efficiency, architecture, operations, generation no Power; PUE cooling, RCI, etc.).

Útil se o *quick assessment* for de *green/efficiency*. **Não** substitui FOMM/DCOS/M&O para risco operacional e erro humano.

### 4.5 Relacionado Schneider (não é FOMM)

**TIMS — Tiered Infrastructure Maintenance Standard** (WP Schneider de manutenção): TIMS-1 Run to Fail · TIMS-2 Unstructured · TIMS-3 Structured · TIMS-4 Facilitated. EPI mapeia isto como o “Schneider 1–4”. É um recorte de **manutenção**, não o FOMM 1–5.

### 4.6 Qual base para um *quick assessment* online de ~15–20 perguntas

| Critério | FOMM (WP 197) | DCOS | Uptime M&O / OS | Green Grid DCMM |
|---|---|---|---|---|
| Cabe em 15–20 Q? | **Sim** (2–3 Q × 7 disciplinas = 14–21) | Apertado (11 disciplinas → 1 Q cada, raso) | Não (100+ observations, pass/fail) | Sim, mas pergunta errada |
| Linguagem self-score | Excelente (CMMI 1–5) | Excelente (ISO 33004 1–5) | Fraca (comportamentos binários) | 0–5, mas energy |
| Escopo O&M facility | Forte (EHS, emergência, CMMS, change, quality) | Mais largo (SLM, security, GRC, sustainability) | Forte em staffing/maintenance; enhanced adiciona HSS/EPR/QM | Fraco |
| Licença / IP | Paper gratuito; grelha completa **embutida** | Standard aberto (barato) | Proprietário, auditor Uptime | Membership TGG |
| Risco jurídico de “certificar” | Alto se fingir selo Schneider | Alto se fingir DCOS-n | Alto se fingir Stamp | Médio |

**Recomendação:** usar **FOMM como espinha (7 disciplinas, escala 1–5)** para o quiz. Emprestar *wording* de maturidade do **DCOS** (mais limpo e alinhado ISO). **Não** copiar critérios proprietários Uptime. **Não** usar DCMM salvo se o produto for *efficiency*, não *operations*.

Justificativa: 15–20 perguntas dão **cobertura dimensional** (um perfil, não um selo). FOMM já pensa em “onde estou vs. target” e em três linhas (processo / treino / campo) — isso mapeia bem para Likert 1–5 online. DCOS-5 e M&O Stamp **não** são comprimíveis sem mentir sobre o que medem.

---

## 5. Banco de perguntas

### 5.1 Quiz rápido recomendado (18 perguntas = 7 disciplinas)

Escala sugerida (espelha WP 197 Fig. 3, **não** é a grelha embutida):  
1 ad hoc · 2 repetível/intuitivo · 3 definido · 4 medido · 5 otimizado.

**EHS (Q1–Q3)**
1. Existe um programa escrito de prevenção de lesões/doenças (PPE, LOTO, hazard analysis, comunicação de perigos) aplicado no chão, ou depende de indivíduos?  
2. O site consegue demonstrar cumprimento estatutário atual (elétrica, químico, fogo, ambiental) com evidência auditável?  
3. Hazard analysis é **obrigatório** antes de cada procedimento operacional, ou só em papel?

**Emergência (Q4–Q6)**
4. Há EOPs documentados para os modos de falha conhecidos (elétrico, cooling, incêndio, perda de redundância)?  
5. Drills de cenário são calendariados, executados e registados (não só “fizemos um tabletop há 3 anos”)?  
6. Incidentes são logged, analisados (root cause) e devolvem lições aos procedimentos?

**Manutenção (Q7–Q9)**
7. O inventário de ativos críticos no CMMS corresponde à realidade instalada (incl. firmware)?  
8. PM/PdM é executado no prazo, com work orders rastreados, e deferred maintenance é visível como risco?  
9. Peças críticas e vendor support (SLA, call-out, qualificações) estão contratados e testados?

**Site (Q10–Q11)**
10. Capacidade de espaço/power/cooling é gerida com dados (não com “achómetro”), incluindo set-points e load management?  
11. Housekeeping, condição física e otimização energética são programas, não campanhas pontuais?

**Operations (Q12–Q14)**
12. Staffing 24×7 (in-house e/ou vendor) está dimensionado, com org chart, qualificações por role e path de escalada?  
13. Há KPIs de O&M (incidentes, PM compliance, treino, orçamento) revistos pela gestão?  
14. Orçamento do DC está ligado a evidência de MMS/lifecycle, não só a corte anual de custos?

**Change (Q15–Q16)**
15. Trabalho em equipamento que pode afetar a carga crítica exige MOP com análise de risco, aprovação e back-out?  
16. SOPs/MOPs/EOPs são revistos quando o as-built ou o firmware muda?

**Quality (Q17–Q18)**
17. Documentação (as-builts, procedimentos, permissões) está sob controlo de versões e acessível no turno?  
18. Treino é formal (materiais + prática + avaliação) e há inspeções/auditorias internas com ações de melhoria?

*Scoring sugerido (convenção vossa, não Schneider):* mediana por disciplina; perfil radar 7 eixos; **não** emitir “FOMM Nível X” como certificado.

### 5.2 2–3 perguntas por cada um dos 26 elementos

Para um assessment mais longo (~52–78 Q). Itens marcados **(inf.)** são inferidos do WP 196 / WP de emergências / prática de mission-critical, **não** do PDF embutido.

**1. Illness & Injury Prevention**  
- O programa tem dono, âmbito e estrutura escritos (1.1)?  
- PPE, LOTO, hazard analysis, hazcom e hazmat estão implementados no campo, não só na política (1.2–1.7)?  
- Treino de segurança é formal e rastreado?

**2. Statutory Compliance**  
- Há inventário vivo de códigos aplicáveis (OSHA/NFPA/local, ambiente, fogo)?  
- Auditorias de compliance têm findings fechados com prazo?  
- Permits e inspeções regulamentares estão em dia? **(inf.)**

**3. Emergency Response Procedures & Drills**  
- EOPs existem para os failure modes do site e estão no turno?  
- Há Crisis Management Plan com papéis e autoridade de isolar carga? **(inf.)**  
- Drills de procedimento (não só incêndio predial) são executados?

**4. Scenario Drills**  
- O calendário cobre black-start, failover de UPS/gerador, perda de chiller, incêndio no white space? **(inf.)**  
- Drills são observados, scored e geram CAPA?  
- Participam operações, segurança e (se colocation) o cliente?

**5. Incident Management**  
- Todo incidente/near-miss é registado?  
- Há failure analysis / RCA com dono?  
- Lições atualizam EOP/MOP e treino?

**6. Asset Management**  
- CMMS = realidade (tag, localização, criticidade, firmware)?  
- Lifecycle / replacement está planeado?  
- As-builts e DCIM batem com o chão? (WP 197 cita este gap)

**7. Work Order Management**  
- 100% do trabalho crítico passa por WO?  
- Prioridade, permissão e close-out com evidência?  
- Backlog é gerido como risco, não como lista?

**8. CMMS**  
- O CMMS é a fonte de verdade de PM, histórico e custo?  
- Integra (ainda que parcialmente) com DCIM/BMS/EPMS? **(inf.)**  
- Relatórios alimentam staffing e budget (pedido do Uptime OS)?

**9. Vendor Management**  
- Contratos com scope, qualificações, response time?  
- Vendors são treinados nas regras do site (não só na máquina)?  
- Escort vs. unescorted está definido?

**10. Spare Parts Management**  
- Lista de critical spares com min/max e localização?  
- Testes/rotação de spares com shelf-life (baterias, filtros)? **(inf.)**  
- Tempo de reposição conhecido para itens long-lead?

**11. Infrastructure Management**  
- DCIM/BMS/EPMS em produção, não em piloto eterno?  
- Capacity (kW, Q, m²) é um processo, não um Excel do “fulano”?  
- Redundância operacional (o que está em bypass) é visível?

**12. Site Operations**  
- Turnos com handover formal? **(inf.)**  
- SOPs para operação de rotina (rotação de equipamento, rounds)?  
- Load management e set-points documentados (Uptime Operating Conditions)?

**13. Efficiency & Optimization**  
- PUE/WUE (ou equivalente) medido e revisto?  
- Há programa de otimização (set-points, airflow) com dono?  
- Eficiência **não** compete com disponibilidade sem regra escrita?

**14. Site Condition**  
- Housekeeping (combustíveis, contaminantes) é PM?  
- Inspeção de condição (civil, containment, leaks) calendariada? **(inf.)**  
- Gaps de “as-built vs. realidade” têm plano de fecho?

**15. Personnel Management**  
- Headcount vs. criticidade do site (incl. 24×7)?  
- Qualificações por role documentadas + escalada?  
- Risco de pessoa-única (bus factor) identificado?

**16. Performance Measurement**  
- KPIs de O&M definidos (PM compliance, MTTR, incidentes, treino)?  
- Gestão revê e age?  
- Metas alinhadas ao objetivo de uptime do negócio?

**17. Risk Management**  
- Registo de riscos operacionais vivo (não só ERM corporativo)?  
- Mudanças e deferred maintenance entram no risk log?  
- Risk appetite do DC está escrito?

**18. Financial Management**  
- Budget cobre PM, spares, treino, lifecycle?  
- MMS justifica o budget?  
- Capex de substituição não é surpresa anual?

**19. Reporting**  
- Relatórios de turno/incidentes/KPIs com destinatário e cadência?  
- Near-miss sobe, não só o outage?  
- Reporting chega a quem decide recurso?

**20. Risk Analysis & Communication** *(Change)*  
- Análise de risco **antes** de trabalho crítico (MOP)?  
- Stakeholders (IT, cliente, segurança) são informados?  
- Stop-the-job é autoridade real?

**21. Operational Procedure Development & Review**  
- SOP / MOP / EOP existem e têm dono?  
- Review cycle (ex. anual + after-action)?  
- Procedimento acompanha firmware/as-built? (gap citado no WP 197)

**22. Change Control Practices**  
- CAB ou equivalente para mudanças que tocam carga crítica?  
- Janela, back-out, evidência de teste?  
- Emergency change tem path controlado (não “exceção eterna”)?

**23. Document Management**  
- Controlo de versões (CDMS)?  
- Biblioteca on-site acessível no incidente (Uptime reference library)?  
- Docs obsoletos são retirados?

**24. Training**  
- Treino formal (definição Schneider: escrito + oral + prática + teste)?  
- Recertificação e drills no calendário?  
- Vendors incluídos?

**25. Inspections & Auditing**  
- Inspeções internas com checklist e findings?  
- Auditoria independente periódica?  
- Findings viram ações com dono e prazo?

**26. Continuous Improvement**  
- CAPA de incidentes/drills/audits fecha o ciclo?  
- Há evidência de processo melhorado (não só “lições aprendidas” em slide)?  
- Melhoria é medida (nível 4–5), não proclamada?

---

## Limitações desta pesquisa

| Item | Estado |
|---|---|
| WP 197 Rev 1, autores, 7×26, níveis 1–5, ausência de fórmula | **Verificado** (PDF oficial) |
| Lista dos ~80 sub-elementos e rubricas 1–5 por sub-elemento | **Não pública** — verificar no PDF embutido / Mission Critical Services |
| Pesos / nível global FOMM | **Não existem** no paper |
| M&O “80/100 pontos” | **Verificar** (só EPI afirma) |
| Mapa 5 vs 6 vs 7 categorias M&O | **Verificar** no protocolo Uptime vigente (enhanced 2024) |
| Tabelas completas OS por componente × Tier | Standard proprietário; síntese pública apenas |
| DCMM subcategorias completas | WP 36/56 (login TGG); 8 categorias verificadas |
| ICOR FOMM 1–3 estrelas | Outro modelo; não usar |

## Fontes

1. Schneider Electric, White Paper 197, *Facility Operations Maturity Model for Data Centers*, Rev 1, Jennifer Schafer & Patrick Donovan. Catálogo `SPD_PDON-96KPLV_EN`. PDF oficial.  
2. Schneider Electric, White Paper 196, *Essential Elements of Data Center Facility Operations*, Rev 1, Robert Woolley & Patrick Donovan.  
3. Schneider Electric Data Center Science Center blog, 5 Mar 2014.  
4. Uptime Institute, M&O Stamp of Approval (páginas de produto, guideline, MOSA datasheet, press release 7 Nov 2024).  
5. Uptime Institute, *Tier Standard: Operational Sustainability* (síntese pública + PDF 00002A).  
6. EPI, DCOS® 2021 — 11 disciplinas e 5 níveis; página *5 Data Center Operations Maturity Levels*.  
7. The Green Grid, DCMM (WP 36 / WP 56 Handbook, 2014) e material SNIA/1E.  
8. Availability Digest, resumo do OS Standard.  
9. Vídeo Schneider *Understanding the Facility Operations Maturity Model* (2020) — “~80 sub-elements”.
