# Mapa de Conteúdo — Módulo "Planejamento de Espaços, Densidade e Crescimento"

> Diagnóstico cruzado das fontes para a reestruturação didática do deck R5.
> Regra No-Invention: toda afirmação abaixo é rastreável a uma fonte citada.
>
> **Fontes e abreviações usadas neste mapa:**
> - **R5 S{n}** — slide n do deck `pptx-r5-slides.md` (40 slides)
> - **WP155 §{n}** — seção da extração `wp-space-power-density.md` (Schneider WP #155, "Calculating Space and Power Density Requirements for Data Centers")
> - **WP144 §{n}** — seção da extração `wp-floor-plan.md` (APC/Schneider WP #144, "Establishing a Floor Plan")
> - **DOCX** — apostila `docx-planejamento-jul2024.md` (JUL 2024), referida por heading
> - **XLS-Sala** — dump `xlsx-room-pt-v5-m2.md` (Density spec room pt v5 m2)
> - **XLS-Inst** — dump `xlsx-facility-v5-m2.md` (Density spec facility v5 m2)

---

## 1. Matriz tema × fonte × natureza didática

Classificação: **C** = conceito, **M** = método (procedimento/regra), **P** = prática (número/exercício/exemplo).

| # | Tema | R5 (slides) | WP155 | WP144 | DOCX | Planilhas | Natureza |
|---|------|-------------|-------|-------|------|-----------|----------|
| 1 | Importância do planejamento de espaços (eficiência, flexibilidade, segurança) | S4 | — (implícito no §2) | — | §"1. Importância do Planejamento" (repetida 2×) | — | C |
| 2 | Dois parâmetros de projeto: carga de TI (kW) × tamanho físico; conceito de densidade | S5 | §3 | — | §"2. Definição de Densidade de Potência" | — | C |
| 3 | Os 4 problemas do W/m² (área indefinida, potência indefinida, sem variação, sem crescimento) | **ausente como lista** — S6 traz só 3 "limitações" reescritas | §4.1 | — | §"Análise da Abordagem Histórica" itens 1–3 | — | C |
| 4 | Exemplo da ambiguidade: 120 W/ft² (1.292 W/m²) → 3–5 kW/gab; as 4 perguntas sem resposta | S7 (adaptado para "1,3 kW/m²") | §4.2 | — | §"Limitações", exemplo "120 W/ft²" | — | C+P |
| 5 | Por que superdimensionar (overkill) não resolve: custo 8×, PUE 3–5, capacidade encalhada | S8, S9 | §4.3 | — | — | — | C+P |
| 6 | Custo dos erros de densidade: Figura 1, curva assimétrica, densidade real vs projeto | S10, S11, S12 | §5 + Fig. 1 | — | — | — | C+M |
| 7 | Conclusões-chave: projetar ABAIXO da média esperada; espaço sobrando = seguro contra encalhe | S12, S13 | §5 (2 destaques) | — | §"1. Importância" ("espaço não utilizado para acomodar incertezas") | — | C |
| 8 | As 4 características da nova abordagem | S14 | §6 | — | §"2. Vantagens da Nova Abordagem" | — | C |
| 9 | Gabinete como unidade de espaço; área de piso é SAÍDA, não entrada | S15 | §6.1 | — | — | ambas (estrutura entrada→saída) | C |
| 10 | Os 7 fatores de conversão gabinete→área (staging, infra, egress, cages, rede, storage, reserva) | S16 | §6.1 (lista) | — | — | XLS-Sala linhas 14–21 (materializa 7 fatores como linhas) | C+M |
| 11 | Hierarquia Instalação → Sala → Pod → Gabinete | S17 | §6.2 | — | §"Exemplo 2… Hierarquia" | XLS-Inst colunas Room/Pod/Cabinet | C |
| 12 | Definição de pod; par de fileiras com corredor quente; best practice p/ DCs maiores | S18 | §6.2 (sidebar) | — | §"Explique a definição de pods" | — | C |
| 13 | Estrutura e vantagens do pod (escalabilidade, eficiência, refrigeração); pods alta/baixa densidade | S19, S20 | — (só o sidebar) | — | §"Definição de Pods" (fonte real destes slides) | — | C (redundante c/ #12) |
| 14 | Tabela 1 — os 5 parâmetros de especificação (nº unidades, média-alvo, pico, incerteza, managed ratio) | S22, S23 | §6.3 + Tabela 1 | — | §"Tabela 1: Parâmetros…" | Ambas (células de entrada) | C+M |
| 15 | O que cada parâmetro dimensiona (média→planta de bloco; pico→distribuição; incerteza→espaço reservado; managed→ponto de operação/PUE) | **ausente** (diluído nas definições de S22–23) | §6.3, §16 itens 5–8 | — | §"Tabela 1", campo "Uso no Projeto" | — | M |
| 16 | Parâmetros de uso de espaço (ancilares, storage, egress/rampas/colunas, densidade/gab, espaço total) | S24, S25 | §6.1 + planilhas §7 | — | §"inco [sic] Parâmetros Chave" | Ambas (linhas de reserva) | M |
| 17 | Exemplo 1 — sala pequena 40 kW (12 gab × 4 kW) | S26, S27, S28 (S28 vazio = imagem da planilha) | §7.1 + Fig. 2 | — | — | **XLS-Sala** (versão m²: 39,7 m², 1.209 W/m²) | P |
| 18 | Procedimento de 5 passos para determinar os parâmetros (Ex. 1) | S27 | §7.1 ("Procedimento") | — | — | — | M |
| 19 | Exemplo 2 — instalação grande 2 MW; duas abordagens (bottom-up / top-down) | S29, **S30 (duplicata exata de S29)** | §7.2 | — | §"Exemplo 2: Grande Data Center" | **XLS-Inst** (versão m²) | P |
| 20 | Procedimento top-down de 7 passos | S31 | §7.2 (lista numerada) | — | §"Abordagens para Especificação" | — | M |
| 21 | Atributos do projeto 2 MW (pod 12+4 posições, 6×4 m, pico 12,5 kW, 2.352 m², 1.206 W/m², sobressalentes) | S32, S33–34 (vazios = imagens) | §7.2 ("Atributos") | — | — | XLS-Inst (com **valores divergentes** — ver §4 abaixo) | P |
| 22 | Densidade W/m² varia por nível hierárquico (facility ≠ sala ≠ pod) — prova de que o nº único engana | **ausente como ponto didático** | §7.2 Perf. Summary; §16 item 14 | — | — | XLS-Inst D35/H35/L35: 806 / 1.232 / 2.049 W/m² | C+P |
| 23 | Padronização de pods/salas; 3 pods padrão de mesmo footprint (baixa/alta/storage) | S35, S36 | §8 | — | §"2. Vantagens… pods padronizados" | — | C+M |
| 24 | **Escolha de valores: gabinetes por pod (8–24; ≥20 kW; ≤24 gab; 50–100 kW ≈ 100–200 servidores)** | **ausente** | §9.1 | — | §"Explicação do Trecho — Número de Unidades / Tamanho do Pod" | — | M |
| 25 | **Escolha da média-alvo (faixa real 2–30 kW; uso misto 4–8 kW; regra +50%; perigo de superespecificar)** | **ausente** | §9.2 | — | §"Potência Média de Design" | — | M |
| 26 | **Procedimento da incerteza (metade da diferença, 80% de confiança; exemplo 7,2 kW / ±22%)** | **ausente** | §9.3 + §16 itens 16–17 | — | §"Incerteza de Potência" (sem o exemplo numérico) | — | M+P |
| 27 | **Escolha do pico (faixa 50 W–30 kW = 60:1; razão pico/média ≥3× → 2 técnicas de otimização)** | **ausente** | §9.4 | — | §"Potência de Pico por Unidade" | — | M |
| 28 | **Managed power ratio: ~95% hoje → 40–80%; afeta PUE/eficiência, não a área** | **ausente** | §9.5 | — | §"Rácio de Potência Gerenciada" | — | M |
| 29 | **Apêndice 1 — valores típicos por aplicação (Small/Large enterprise, Colo, Cloud, HPC)** | **ausente** | §13 + Tabela A1 | — | — | — | M+P |
| 30 | **Políticas de densidade de TI (monitorar potência mín. E máx.; U space; limites por pod)** | **ausente** | §10 | — | §"Políticas de Densidade" | — | M |
| 31 | **Exemplo de política de densidade (blanking panels; 3 opções quando um gabinete excede o pico)** | **ausente** | §14 (Apêndice 2) | — | — | — | P |
| 32 | Aplicação a data centers modulares (WP160) | S38 (1 frase) | §11 | — | — | — | C |
| 33 | Conclusão: especificação → desempenho previsível | S37, S38 | §12 | §12 | §"Conclusão" (3×) | — | C |
| 34 | **Floor plan: por que vem cedo (antes do detailed design); densidade especificada no nível da fileira** | **ausente** | — | §3 + Fig. 1 | — | — | C+M |
| 35 | **5 efeitos do floor plan (posições de rack, densidade alcançável, complexidade, previsibilidade, consumo); bilhões de kWh desperdiçados** | **ausente** | — | §3, §5 | — | — | C |
| 36 | **Hot-aisle/cold-aisle: +100% de densidade sem hot spots** | **ausente** | — | §6.1 | §"2. Estruturas e Layout" (menção superficial a corredores frios/quentes) | — | C+M |
| 37 | **Pitch — os 4 padrões (A 7 tiles/14 ft, B 8/16, C 8/16, D 9/18); mínimos 3 ft hot / 4 ft cold** | **ausente** | — | §6.4 + Fig. 6/7 | — | — | M |
| 38 | **Colunas: até 3 posições perdidas; fileira inteira eliminada; cenário 40→29 racks (−25%); medir as-built** | **ausente** | — | §6.2 + Fig. 3/4, §9.2 | — | — | M+P |
| 39 | **Dimensões padronizadas de sala; regra ≈2,6 m²/rack (28 sq ft); saltos de 20→30→…→60 racks** | **ausente** | — | §7.1 + Fig. 8, §11 item 2 | — | — | M+P |
| 40 | **Sequência de floor planning em 8 passos (restrições→eixo→fileiras→índice do grid→densidade por fileira)** | **ausente** | — | §8 | — | — | M |
| 41 | **Erros comuns de floor plan (perda de 10–20% das posições; 20%+ de densidade); partições sem estudo (Fig. 9: −12%)** | **ausente** | — | §9 + Fig. 9 | — | — | C+P |
| 42 | **Crescimento/faseamento: partições de área; layout antecipado de fileiras futuras** | **ausente** | — | §7.3 | — | — | C+M |
| 43 | Temas genéricos da apostila fora do escopo dos WPs (resfriamento ar/líquido, PUE genérico, segurança lógica, criptografia) | — | — | — | §§4–6 (2×) | — | C (baixa densidade técnica; ver §5.3) |

---

## 2. Inventário slide a slide do deck R5 (o que cada slide é, de onde vem, e o problema)

| Slide | Conteúdo | Fonte real | Diagnóstico |
|-------|----------|-----------|-------------|
| S1–S2 | Capa/branding (vazios na extração) | — | OK |
| S3 | Ementa do módulo inteiro ("Projetos de Ambientes Críticos") | — | Objetivo declarado é **não verificável** ("Apresentar os princípios básicos…"). Data desatualizada ("29 e 30 de jago de 2025" — typo). Ementa é do módulo-pai, não deste bloco |
| S4 | Importância do planejamento | DOCX §1 | Genérico; funciona como abertura, mas não formula o problema |
| S5 | Dois parâmetros de design | WP155 §3 | OK como conceito, mas é texto corrido |
| S6 | Limitações da abordagem histórica | WP155 §4.1 via DOCX | **Wall of text** (3 limitações + 3 exemplos + citação). Perde os "4 problemas" estruturados do WP; mistura exemplo em kW/m² adaptado |
| S7 | Caso 1,3 kW/m² → 3–5 kW/gab + 4 perguntas | WP155 §4.2 | Bom conteúdo, mas texto corrido; **redundante com S6** (ambos são "abordagem histórica falha") |
| S8 | Overkill 30 kW/gab / 10,7 kW/m²: custo 8×, PUE 3–5, espaço acaba antes | WP155 §4.3 | Bom; nota do instrutor é boa (síntese em 3 linhas). Texto denso |
| S9 | Síntese: densidade baixa demais vs alta demais | WP155 §4.3 (destaque) | OK — é o único slide "respirável" da sequência |
| S10 | 100% de utilização é quase impossível | WP155 §5 | OK |
| S11 | Figura 1 (custo efetivo vs densidade real) | WP155 Fig. 1 | Slide de imagem; rótulos presentes. OK |
| S12 | Mais caro abaixo do que acima; conclusão-chave (projetar abaixo da média) | WP155 §5 | Conteúdo central do módulo. Nota do instrutor boa ("Melhor sobrar espaço…") |
| S13 | Espaço sobrando é seguro; contraintuitivo | WP155 §5 | Bom; nota do instrutor boa |
| S14 | 4 características da nova abordagem | WP155 §6 | OK — slide-pivô do deck |
| S15 | Gabinete como medida | WP155 §6.1 | OK; nota boa |
| S16 | 7 fatores de conversão gabinete→área | WP155 §6.1 | **Wall of text** (lista de 7 itens em parágrafos). Nota do instrutor já faz a versão enumerada — deveria SER o slide |
| S17 | Hierarquia instalação→sala→pod→gabinete | WP155 §6.2 | OK; bom uso de indentação |
| S18 | O que é um pod | WP155 §6.2 sidebar | OK, mas parágrafo único denso |
| S19 | Estrutura do pod + vantagens | DOCX §"Definição de Pods" | **Redundante com S18** — repete a definição com outras palavras |
| S20 | Pods alta/baixa densidade + síntese | DOCX §"Exemplos de Implementação" | **Terceiro slide seguido sobre "o que é pod"** — 3 slides para 1 conceito |
| S21 | Só o título da seção | — | Slide fantasma (provável imagem sem texto alternativo) |
| S22–S23 | Tabela 1: parâmetros 1–3 e 4–5 | WP155 Tabela 1 via DOCX | Conteúdo certo, formato errado: a **tabela** virou 2 slides de bullets. Não diz o essencial: qual sistema cada parâmetro dimensiona (WP155 §6.3) |
| S24 | Espaços reservados (ancilares/storage/egress) | DOCX §"inco Parâmetros" | Título herdado errado ("Espaço Reservado para Sistemas Ancilares" cobre só 1 dos 3 itens). Nota do instrutor de S24–25 é um **ensaio de 400+ palavras sobre serviços ancilares elétricos** — tangente que desvia do método |
| S25 | Densidade por gabinete + espaço total | DOCX §"inco Parâmetros" | **Título repetido de S24** (erro de cópia); mistura parâmetros de densidade com parâmetros de espaço |
| S26 | Exemplo 1: sala 40 kW | WP155 §7.1 | Texto com resquício de tradução ("Excel fornecido sq ft e m2"); depende de planilha externa |
| S27 | Procedimento 5 passos (Ex. 1) | WP155 §7.1 | Bom método, mas **wall of text**; diz "±15%" enquanto a planilha do curso usa ±20% (ver §4) |
| S28 | Vazio (imagem da planilha) | XLS-Sala | Sem legenda/leitura guiada — o aluno vê a planilha sem saber o que olhar |
| S29 | Exemplo 2: 2 MW, duas abordagens, hierarquia "9 Pods" | WP155 §7.2 | Diz **9 pods** (texto do WP), mas a planilha do curso usa **8** e a Fig. 3 do WP usa **10** (ver §4) |
| S30 | — | — | **Duplicata literal de S29** (mesmo texto, palavra por palavra) |
| S31 | Procedimento top-down 7 passos | WP155 §7.2 | Bom método; texto denso |
| S32 | Atributos do 2 MW | WP155 §7.2 | **Números do WP (12 gab+4, 12,5 kW pico, 2.352 m², 1.206 W/m²) que NÃO batem com a planilha do curso** (10 gab, 8 kW, 1.986 m², 806/1.232 W/m²). Aluno que confere na planilha encontra outros valores |
| S33–S34 | Vazios (imagens das planilhas) | XLS-Inst | Sem leitura guiada |
| S35–S36 | Padronização de pods/salas | WP155 §8 | OK; poderiam ser 1 slide |
| S37–S38 | Conclusão | WP155 §12 | 2 slides de parágrafos corridos para encerrar; sem síntese visual do método |
| S39 | Contatos | — | OK |
| S40 | Vazio | — | OK |

---

## 3. Redundâncias identificadas

1. **S29 ≡ S30** — duplicata literal (mesmo texto integral). 1 slide desperdiçado.
2. **S18 + S19 + S20** — três slides consecutivos definindo "pod" (WP sidebar + paráfrase do DOCX + variações alta/baixa densidade). Condensável em 1 slide + 1 nota de instrutor.
3. **S6 + S7** — ambos são "a abordagem histórica falha", com sobreposição do exemplo de densidade típica. O S6 lista limitações abstratas; o S7 as demonstra. Fundem-se em problema→demonstração.
4. **S24 + S25** — mesmo título, conteúdo contínuo fatiado sem lógica (S25 mistura de volta parâmetros de densidade).
5. **S35 + S36** — padronização, condensável em 1.
6. **S9 vs S12** — a síntese "baixa demais vs alta demais" (S9) reaparece implícita em S12; na nova ordem, uma única passagem basta.
7. **DOCX internamente** — a apostila repete seu bloco inicial inteiro duas vezes (linhas 5–137 ≈ 77–211 do dump) e a conclusão três vezes; além disso contém os **prompts de LLM usados para gerá-la** ("Descreva como um engenheiro especialista…"), que não são conteúdo didático. A apostila deve ser tratada como rascunho derivado, não como fonte de autoridade — a autoridade é o WP155.

## 4. Inconsistências numéricas entre fontes (corrigir na nova versão)

| Grandeza | R5 | WP155 | Planilha do curso (m²) | Decisão recomendada |
|---|---|---|---|---|
| Pods por sala (Ex. 2) | 9 (S29/S30) | texto diz 9; Fig. 3 usa 10 (nota de fidelidade da extração) | **8** (XLS-Inst H15) | Adotar **8** — é o que a ferramenta/planilha calcula; registrar em nota do instrutor que o WP oscila 9/10 |
| Pico por gabinete (Ex. 2) | 12,5 kW (S32) | 12,5 kW | **8 kW** (L9) | Adotar **8 kW** (coerente com a ferramenta); citar 12,5 kW como variante do WP |
| Managed power ratio (Ex. 2) | 80% (implícito via WP) | 80% | **75%** (L11) | Adotar **75%** |
| Área total (Ex. 2) | 2.352 m² (S32) | 25.320 ft² = 2.352 m² | **1.985,98 m²** (F24) | Adotar **1.986 m²** |
| Densidade no nível da sala (Ex. 2) | 1.206 W/m² (S32) | 112 W/ft² = 1.206 W/m² | **1.232 W/m²** (H35) | Adotar **1.232 W/m²** (e 806 facility / 2.049 pod) |
| Potência nominal da instalação | "2 MW" | 2.000 kW | **1.600 kW nominal** (D26); pico 4 × 500 kW = 2.000 kW (D9) | Apresentar como "instalação de 2 MW (pico) / 1.600 kW nominal" — os dois números saem da planilha |
| Incerteza do gabinete (Ex. 1) | ±15% (S27) | ±15% (Fig. 2) | **±20%** (XLS-Sala E8) | Adotar **±20%**; nota: WP usa 15% |
| Área por gabinete (Ex. 1) | — | 16 ft² (≈1,49 m²) | **1,5 m²** (E11) | 1,5 m² |
| Gabinetes por pod (Ex. 2, entrada) | 10 (S29) | 10 (Fig. 3) | **10** (L7) | Consistente ✓ |

**Regra editorial da nova versão:** todo número mostrado em slide deve ser reproduzível na ferramenta online (que herda as planilhas). Onde o WP divergir, o slide usa o número da ferramenta e a nota do instrutor explica a variante do WP.

## 5. Lacunas didáticas do deck atual

### 5.1 O método de ESCOLHA dos valores não existe no deck
O deck ensina a estrutura da especificação (Tabela 1, exemplos), mas **pula inteiramente o WP155 §9** — justamente a parte que transforma o aluno de "preenchedor de planilha" em projetista: como escolher gabinetes/pod (8–24), média-alvo (4–8 kW típico; regra dos +50%), incerteza (procedimento da metade da diferença com 80% de confiança, com o único exemplo numérico do paper: 7,2 kW / ±22%), pico (razão ≥3× e as 2 técnicas de mitigação) e managed ratio (95%→40–80%). A apostila DOCX cobre isso resumidamente (§"Explicação do Trecho"), sinal de que os professores conhecem e valorizam o conteúdo — mas ele nunca chegou aos slides. O **Apêndice 1** (valores típicos por aplicação) também está ausente e é a tabela mais "usável em prova/projeto" do paper.

### 5.2 WP144 (floor plan) está 100% ausente
O módulo se chama "Planejamento de **Espaços**, Densidade e **Crescimento**", mas o deck cobre apenas densidade (WP155). Nada de: floor plan na fase de especificação preliminar, hot-aisle/cold-aisle (+100% de densidade), pitch A–D, colunas (40→29 racks), regra dos 2,6 m²/rack, sequência de 8 passos, erros comuns (10–20% de posições perdidas), partições/faseamento (Fig. 9, −12%). "Crescimento" fica órfão: faseamento (WP144 §7.3) e políticas de densidade (WP155 §10 + Apêndice 2) não aparecem.

### 5.3 A apostila contém conteúdo genérico sem lastro nos WPs
Seções 4–6 do DOCX (tipos de resfriamento, PUE genérico, segurança física/lógica, "criptografia e autenticação") não derivam de nenhum dos dois WPs e diluem o foco. Recomendação: excluir do deck deste bloco (pertencem a outros módulos do MBA) — mantidas apenas onde o WP as sustenta (ex.: managed ratio → PUE).

### 5.4 Saltos conceituais na ordem atual
- S5→S6: o problema é declarado antes de o aluno ver um caso concreto; a sequência problema-abstrato → problema-concreto → custo funciona, mas está espremida em walls of text.
- S23→S24: salta dos 5 parâmetros de densidade para os parâmetros de espaço **sem explicar a fronteira** (densidade = entrada; área = saída; reservas = a ponte). A planilha faz essa ponte em 3 blocos visuais; o deck não.
- S28→S29: do exemplo da sala para a instalação sem consolidar a leitura do resultado da sala (o S28 é uma imagem muda).
- S32→S35: os resultados do 2 MW nunca são LIDOS (o insight "806 vs 1.232 vs 2.049 W/m² na mesma instalação" — a prova numérica de que o W/m² único engana — está disponível na planilha e não é explorado em slide algum).
- S36→S37: do método direto para a conclusão, sem bloco de operação (políticas) nem de crescimento.

### 5.5 Exercícios inexistentes como estrutura
Os "exercícios" atuais são imagens de planilha (S28, S33, S34) sem enunciado, sem entradas declaradas e sem "o que observar". Com a ferramenta online (Planejador de Espaço e Densidade, modos Sala e Instalação, cascata Gabinete→Pod→Sala→Instalação), cada bloco pode fechar com exercício executável de parâmetros reproduzíveis — arquitetura proposta no doc `02-arquitetura-didatica.md`.

### 5.6 Objetivos não verificáveis
Nenhum slide declara o que o aluno saberá FAZER. O S3 declara "Apresentar os princípios básicos" — objetivo do professor, não do aluno.

## 6. O que o deck R5 tem de BOM (preservar)

1. **Notas do instrutor de S8, S12, S13, S15, S16** — sínteses orais curtas e certeiras ("Melhor sobrar espaço…", "Parece contra-intuitivo!…", a lista numerada dos 7 fatores). Migram para as notas da nova versão.
2. **Sequência problema→custo→conclusão (S5–S13)** — o arco está correto; só precisa de ar (menos texto por slide) e de 1 exercício de fechamento.
3. **S17 (hierarquia com indentação)** — o melhor slide visual do deck; vira o template do conceito.
4. **A adaptação para unidades métricas** (kW/m² em vez de W/ft²) — decisão certa para o público; a nova versão a mantém e a torna consistente com as planilhas m².

---

*Elaborado a partir exclusivamente das 6 fontes extraídas em `docs/research/2026-08-22-densidade/fontes/`. Nenhum número foi criado fora delas.*
