# Arquitetura Didática — Deck novo "Planejamento de Espaços, Densidade e Crescimento"

> Reestruturação do deck R5 (40 slides) para **41 slides** em 6 blocos + abertura/fechamento, com
> **6 exercícios** na ferramenta online **Planejador de Espaço e Densidade**
> (`https://ferramentas.toptier.net.br/planejador-densidade/`, modos Sala e Instalação,
> cascata Gabinete→Pod→Sala→Instalação — mesmos parâmetros das planilhas v5 m²).
>
> Convenções: cada bloco declara objetivo **verificável**; cada slide cita a fonte que o sustenta;
> todo número de exercício é reproduzível na ferramenta (regra editorial do mapa `01-mapa-conteudo.md` §4).
> Fontes abreviadas como no mapa: WP155, WP144, XLS-Sala, XLS-Inst, R5 S{n}, DOCX.

---

## 1. MOC do módulo (hub de navegação — estilo LYT)

Slide 2 do deck; também serve de índice da apostila revisada.

```
PLANEJAMENTO DE ESPAÇOS, DENSIDADE E CRESCIMENTO
│
├── FUNDAMENTOS ─── por que o W/m² único falha e o que o substitui
│     ├── B1  O problema do número único ............... slides 3–7  · Exercício 1
│     └── B2  A nova abordagem (gabinete, hierarquia,
│              5 parâmetros) ........................... slides 8–14 · Exercício 2
│
├── PRÁTICA ─────── como escolher valores e escalar a especificação
│     ├── B3  Escolhendo os valores dos parâmetros ..... slides 15–21 · Exercício 3
│     ├── B4  Da sala à instalação (2 MW) .............. slides 22–28 · Exercício 4
│     └── B5  Do papel ao piso: floor plan ............. slides 29–35 · Exercício 5
│
├── OPERAÇÃO ────── manter o desempenho previsível no tempo
│     └── B6  Políticas de densidade e crescimento
│              faseado ................................. slides 36–39 · Exercício 6
│
└── EVIDÊNCIA ───── síntese, glossário e fontes
      └── Fechamento ................................... slides 40–41
```

**Fio narrativo do módulo** (1 frase, repetida no início de cada bloco):
*"A área de piso não é uma entrada do projeto — é uma SAÍDA calculada a partir da potência por gabinete e das reservas de espaço."* (WP155 §6, característica 1; §6.3.)

---

## 2. Blocos

### Slide 1 — Capa
Título do módulo, professores, MBA em Infraestrutura de Ambientes Críticos. *(R5 S1–S3, atualizado; sem a ementa do módulo-pai.)*

### Slide 2 — MOC + objetivos do módulo
O hub acima + os 6 objetivos verificáveis (um por bloco, listados abaixo). **Fonte:** estrutura própria; objetivos derivados de WP155 §2 e WP144 §2.

---

### BLOCO 1 — O problema do número único (Fundamentos)

**Objetivo verificável:** *Ao final deste bloco você consegue explicar por que uma especificação como "1.000 W/m²" é ambígua (os 4 problemas), e justificar com a curva de custo por que se projeta para uma densidade MENOR que a média esperada.*

| # | Slide | Conteúdo-resumo | Fonte |
|---|-------|-----------------|-------|
| 3 | "O data center deverá ter 1.000 m² a 1.000 W/m²…" | Frase típica de especificação histórica; os 4 problemas do número único: (1) área indefinida, (2) potência indefinida, (3) nada sobre variação (pico? média? no tempo?), (4) nada sobre crescimento/modularidade. Os problemas 3 e 4 não se resolvem com definições melhores. | WP155 §3, §4.1; R5 S5–S6 condensados |
| 4 | Traduzindo para o gabinete: e agora? | Especificação típica ≈1,3 kW/m² (120 W/ft²) → 3 a 5 kW/gabinete; adotando 4 kW/gab, as 4 perguntas sem resposta (gabinete de 6/12/20 kW? capacidade sobrando migra? espaço vazio ao redor? juntos ou espalhados?). | WP155 §4.2; R5 S7 |
| 5 | Superdimensionar não resolve | "Então especifico 30 kW/gab (10,7 kW/m²)": custa ≈8× por m²; operando a ~1 kW/m² o PUE vai a 3–5; o espaço acaba antes da potência → capacidade encalhada (stranded). Síntese: baixa demais = imprevisível; alta demais = capital e OPEX desperdiçados. | WP155 §4.3; R5 S8–S9 |
| 6 | O custo de errar a densidade (Figura 1) | Curva custo efetivo ($/W utilizável) × densidade real, mínimo na densidade de projeto (5 kW/gab); esquerda (real < projeto) sobe rápido — potência/refrigeração encalhadas; direita sobe pouco — só espaço subutilizado. Motivo: espaço custa muito menos que potência+refrigeração por unidade de TI. | WP155 §5 + Fig. 1; R5 S10–S12 |
| 7 | Duas conclusões contraintuitivas | (1) Densidade incerta → construir para densidade de projeto MENOR que a média esperada. (2) Um data center bem projetado, cheio de potência e refrigeração, DEVE ter espaço de TI sobrando — é o seguro contra encalhe; quanto maior a incerteza, maior a sobra. | WP155 §5 (destaques); R5 S12–S13 |

**Exercício 1 (ferramenta, modo Sala — 5 min):** *"O prédio não muda, a planta elétrica sim."*
- Entradas: 12 gabinetes; área por gabinete 1,5 m²; reservas padrão da sala-exemplo (staging 2 posições; incerteza 2; energia 2; climatização 2; auxiliares 2; storage 3 m²; saídas/rampas/colunas 3,7 m²). Potência média 4 kW/gab, pico 8 kW, incerteza ±20%, relação gerenciada 70%. *(Todas as entradas = XLS-Sala.)*
- Ação: anotar "Tamanho da sala" e "Densidade de potência da sala"; depois dobrar a potência média para 8 kW e reobservar.
- O que observar: a área fica em **39,7 m²** nos dois cenários (o espaço sugerido para incerteza não depende do kW — fórmula G15 da planilha), mas a densidade salta de **1.209 W/m²** para ~2.418 W/m². Conclusão vivida: **W/m² é saída, não entrada** — quem dimensiona o prédio é o gabinete e as reservas.

**Notas do instrutor (B1):** reusar as notas boas do R5 — S8 ("10,7 kW/m² custa cerca de 8 vezes… terminará espaço físico antes das capacidades"), S12 ("Melhor sobrar espaço: o custo do espaço é bem melhor que o de energia e refrigeração"), S13 ("Parece contra-intuitivo! Mas o espaço sobressalente lida com a incerteza atual ou futura"). Enfatizar que a Figura 1 tem duas curvas (Tier 2 e Tier 4) — o formato assimétrico vale para ambas (WP155 §15, Fig. 1).

---

### BLOCO 2 — A nova abordagem (Fundamentos)

**Objetivo verificável:** *Ao final você consegue nomear os 5 parâmetros da especificação de densidade, dizer qual sistema cada um dimensiona, e explicar a hierarquia Gabinete→Pod→Sala→Instalação.*

| # | Slide | Conteúdo-resumo | Fonte |
|---|-------|-----------------|-------|
| 8 | As 4 características da nova abordagem | (1) unidade de espaço = gabinete de TI (IT cabinet), não m² — a área de piso é SAÍDA do projeto; (2) hierárquica e modular; (3) reconhece que gabinetes têm potências diferentes e mal definidas; (4) reconhece variação no tempo. | WP155 §6; R5 S14 |
| 9 | O gabinete como régua | Potência por gabinete (kW/gabinete) = medida padrão de densidade; mainframes/storage ≈ equivalentes a N gabinetes; em algum momento converte-se gabinetes → m². | WP155 §6.1; R5 S15 |
| 10 | Os 7 fatores da conversão gabinete→m² (checklist) | Staging/migração · infra de energia e refrigeração na sala (PDU, CRAC, UPS) · saídas/rampas/colunas · partições (cages) · patch panels/rede · storage · reserva para densidade real < projeto. Devem ser explicitados JUNTO com a densidade por gabinete. Visual: os 7 itens como as 7 linhas de reserva da ferramenta. | WP155 §6.1; R5 S16 (nota do instrutor vira o slide); XLS-Sala linhas 14–21 |
| 11 | A hierarquia | Instalação (facility) ⊃ Salas de TI ⊃ Pods ⊃ Gabinetes; todos os níveis precisam de especificação (a densidade do pod dimensiona sub-alimentadores e distribuição de ar do pod); o roll-up para um W/m² único é possível mas insuficiente. | WP155 §6.2; R5 S17 (manter o visual indentado) |
| 12 | O que é um pod | Cluster de gabinetes + infra de energia/refrigeração implantado como unidade; forma mais comum: par de fileiras compartilhando corredor quente (hot aisle); implantável/atualizável separadamente; best practice para DCs maiores. Variantes: pod de alta e de baixa densidade. Termos "zona/cluster/fileira" existem mas não são preferidos. | WP155 §6.2 sidebar + nota 3; R5 S18–S20 condensados em 1 |
| 13 | Tabela 1 — os 5 parâmetros | Em formato de tabela (não bullets): nº de unidades (#) · potência média-alvo por unidade (kW) · potência de pico por unidade (kW) · incerteza de potência (±%) · razão de potência gerenciada (%). Peak, incerteza e managed ratio são os conceitos NOVOS. | WP155 §6.3 + Tabela 1; R5 S22–S23 fundidos |
| 14 | O que cada parâmetro dimensiona | Mapa parâmetro→sistema: média-alvo → planta de bloco (bulk) de potência/refrigeração · pico → sistemas de DISTRIBUIÇÃO · incerteza → espaço reservado (anti-encalhe) · managed ratio → ponto de operação/eficiência/PUE (não muda área nem ratings) · nº de unidades → totais. | WP155 §6.3, §16 itens 5–8 (lacuna do R5 corrigida) |

**Exercício 2 (ferramenta, modo Sala — 15 min):** *Especificação completa da sala de 40 kW.*
- Entradas (idênticas ao Exercício 1, agora preenchidas passo a passo seguindo o procedimento): 12 gabinetes × 4 kW média × 8 kW pico × ±20% × 70% gerenciada × 1,5 m²/gab + as 7 reservas (staging 2 posições→3 m²; incerteza 2→3 m²; energia 2→3 m²; climatização 2→3 m²; auxiliares 2→3 m²; storage 3 m² diretos; saídas/rampas 3,7 m² diretos). *(XLS-Sala, células E5–E9, E11, E13–G21.)*
- O que observar no resultado: **Tamanho da sala 39,7 m²** · **densidade 1.209 W/m²** · potência nominal **48 kW** (12×4) · potência operacional esperada **33,6 kW** (48×70%) · potência média esperada por gabinete **2,8 kW** (4×70%) · espaço de TI não utilizado **15%** · espaço sugerido para incerteza **4,5 m²** vs reservado 3 m². Perguntas de verificação: por que a potência esperada (33,6 kW) é menor que a nominal (48 kW)? Que política falta para garantir o pico de 8 kW? (gancho para o Bloco 6).

**Notas do instrutor (B2):** nota do R5 S15 ("o gabinete como medida… em algum momento devemos converter para m²") e S16 (lista numerada dos 7 fatores). No slide 13, avisar que a planilha/ferramenta usa exatamente esses 5 campos amarelos — o aluno reverá cada um no exercício. No slide 12, mencionar que salas pequenas podem omitir o nível pod (WP155 nota 2: sala = pod no exemplo de 40 kW).

---

### BLOCO 3 — Escolhendo os valores dos parâmetros (Prática)

**Objetivo verificável:** *Ao final você consegue propor valores justificados dos 5 parâmetros para uma aplicação dada (enterprise, colocation, cloud, HPC), usando as faixas do WP155 e a tabela do Apêndice 1.*

*(Bloco inteiramente novo — corrige a maior lacuna do R5; ver mapa §5.1.)*

| # | Slide | Conteúdo-resumo | Fonte |
|---|-------|-----------------|-------|
| 15 | De onde vêm os números? | Abertura do método: parâmetros mal escolhidos geram custo real (Figura 1); o Apêndice 1 do WP dá pontos de partida por aplicação — usável "como está" ou ajustado. | WP155 §9 (abertura) |
| 16 | Quantos gabinetes por pod? | Regras: pod < ~20 kW é impraticável (infra própria) → mínimo 2–6 gab conforme densidade; máximo ~24 gab (egress legal) → 75–500 kW; refresh é pod-a-pod (pods menores = refresh menor); 500 kW ≈ 1.000 servidores (só cloud gigante); 50–100 kW ≈ 100–200 servidores é o prático. **Recomendação: 8 a 24 gabinetes/pod.** | WP155 §9.1 |
| 17 | A média-alvo: o erro de "pensar grande" | Faixa real: 2–30 kW/gab; médias >12 kW raras (HPC/cloud denso); uso misto típico: 4–8 kW. Superespecificar a média move o projeto para o lado caro da Figura 1. Melhor: fixar o kW total e estimar a média por gabinete; futuro se trata com incerteza+pico. **Regra: uso misto novo → média-alvo ≥ 150% da média atual da organização.** | WP155 §9.2 |
| 18 | Quantificando a incerteza | Procedimento: DC totalmente populado → premissas que dão a MENOR e a MAIOR média por gabinete → incerteza = metade da diferença; usar faixa com 80% de confiança, não pior caso. Exemplo do WP: 80% gab de 4 kW + 20% de 20 kW → média certa 7,2 kW, incerteza 0%; se a fração varia 70–90% → ±1,6 kW = 22%. | WP155 §9.3, §16 itens 16–17 |
| 19 | O pico e como domá-lo | Gabinetes reais: 50 W a 30 kW (60:1). Pico dimensiona a DISTRIBUIÇÃO (mais cara se sobredimensionada). Se pico/média ≥ 3×: (1) agrupar gabinetes de potência similar em pods por densidade; (2) limitar pico por política, dividindo cargas grandes entre gabinetes. | WP155 §9.4 |
| 20 | Razão de potência gerenciada | ~95% hoje → 40–80% projetado; capacidade se dimensiona pela plena carga, eficiência pela média; ratio baixa → sistemas operando em carga leve (eficiência cai) → preferir arquitetura modular/escalável; projeção de PUE sem managed ratio = superotimista. | WP155 §9.5 |
| 21 | Apêndice 1 — valores típicos por aplicação | Tabela A1 resumida: gab/pod (4–10 / 10–14 / 6–14 / 10–20 / 10–20), média (4/6/4/12/16 kW), pico (8/12/12/25/25 kW), incerteza (50/30/50/30/50%), managed (90/80/90/70/90%), staging/ancilares/storage/egress por aplicação — Small/Large enterprise, Colo, Cloud, HPC. | WP155 §13, Tabela A1 |

**Exercício 3 (ferramenta, modo Sala — 10 min):** *A mesma sala, outra aplicação.*
- Ponto de partida: sala do Exercício 2 (12 gab, 1,5 m²/gab, mesmas reservas).
- Ação: re-especificar como **Cloud** usando o Apêndice 1: média **12 kW**, pico **25 kW**, incerteza **±30%**, managed **70%**. *(Valores da Tabela A1, coluna Cloud — WP155 §13.)*
- O que observar: potência nominal salta de 48 kW para **144 kW** (12×12) e a densidade aproximadamente triplica (~3× de 1.209 W/m², pois a área muda pouco), enquanto a área continua na casa dos ~40 m² — evidência de que a aplicação define a planta elétrica/térmica, não o tamanho da sala; o espaço sugerido para incerteza cresce com ±30% (fórmula da planilha usa incerteza/(1−incerteza)). Discutir: que mudanças NÃO aparecem na ferramenta (distribuição para pico de 25 kW, refrigeração)?

**Notas do instrutor (B3):** no slide 17, contar o caso clássico do operador que "projetou para o futuro" com média alta e encalhou capacidade (WP155 §9.2: "muitos operadores chegaram a essa condição infeliz"). No slide 18, fazer a conta do exemplo 7,2 kW no quadro (0,8×4 + 0,2×20). No slide 21, avisar que a tabela A1 é o "gabarito de partida" para o trabalho final do módulo.

---

### BLOCO 4 — Da sala à instalação: o exemplo de 2 MW (Prática)

**Objetivo verificável:** *Ao final você consegue montar no modo Instalação a especificação hierárquica completa de uma instalação de 2 MW (pico) e explicar por que a densidade em W/m² muda conforme o nível (pod, sala, instalação).*

| # | Slide | Conteúdo-resumo | Fonte |
|---|-------|-----------------|-------|
| 22 | Duas rotas de especificação | Bottom-up (gabinete/pod → instalação; ideal) vs top-down (instalação → salas → pods → gabinetes; necessário quando potência da rede ou prédio já estão fixos). | WP155 §7.2; R5 S29 (sem a duplicata S30) |
| 23 | O procedimento top-down (7 passos) | 1 nº de salas (fixando kW/sala) → 2 nº de pods (kW/pod) → 3 nº de gabinetes (kW/gab) → 4 parâmetros de uso de espaço → 5 demais parâmetros de densidade → 6 roll-up e validação contra restrições → 7 ajustar e repetir. | WP155 §7.2; R5 S31 |
| 24 | O caso: instalação de 2 MW (pico) | Hierarquia da ferramenta: **4 salas × 8 pods × 10 gabinetes de 5 kW**; pico por gabinete 8 kW; incerteza ±15% (nível gabinete; salas/pods são roll-up); managed 75%; área por gabinete 1,2 m²; nominal 1.600 kW, pico 4×500 kW = 2.000 kW. | XLS-Inst (D7, H7, L7–L11, D9); WP155 §7.2 (estrutura) |
| 25 | Lendo o resultado | Área total **1.986 m²** (sala 324,6 m²; pod 24,4 m²); gabinetes esperados **360** / capacidade máxima **432** (12/pod com as sobras); potência operacional esperada 1.200 kW (1.600×75%); média esperada por gabinete 3,75 kW. | XLS-Inst F24/J24/N24, D27–D29, L32 |
| 26 | A mesma instalação, três densidades | **806 W/m² (instalação) · 1.232 W/m² (sala) · 2.049 W/m² (pod)** — o mesmo projeto "é" três números diferentes conforme onde se mede. Prova numérica final de que o W/m² único é ambíguo (fecha o ciclo aberto no slide 3). | XLS-Inst D35/H35/L35; WP155 §16 item 14 |
| 27 | Reservas por nível | No pod: posições sobressalentes de gabinete (anti-encalhe se a média real < 5 kW). Na sala: pods de staging (implantar sem perturbar os existentes) e de reserva. A ferramenta permite reservar incerteza em qualquer nível (gabinetes extras no pod, pods extras na sala, salas extras na instalação) — a geometria da sala costuma decidir. | WP155 §7.2 (atributos + parágrafo final); R5 S32 corrigido para os números da ferramenta (mapa §4) |
| 28 | Padronizar pods e salas | Benefícios (escala, ferramentas, gestão) e limites (TI heterogênea, salas pré-definidas, disponibilidade distinta). Best practice: conjunto mínimo de padrões — ex.: 3 pods de MESMO footprint para baixa densidade, alta densidade e storage, com mistura ajustável ao longo do buildout. | WP155 §8; R5 S35–S36 fundidos |

**Exercício 4 (ferramenta, modo Instalação — 20 min):** *Montar e sensibilizar o 2 MW.*
- Entradas: 4 salas; 8 pods/sala; 10 gabinetes/pod; média 5 kW/gab; pico do gabinete 8 kW; incerteza ±15%; managed 75%; área por gabinete 1,2 m²; reservas conforme a planilha (pod: 1 posição staging + 1 incerteza + 2 energia + 2 climatização + egress 5,2 m²; sala: energia/climatização/auxiliares/storage 10 m² cada + egress 65 m²; instalação: staging 46,5 m², energia 185,8 m², climatização 185,8 m², auxiliares 37,2 m², storage 46,5 m², egress 185,8 m²). *(XLS-Inst, todas as células de entrada.)*
- Conferir: **1.986 m²** · **806/1.232/2.049 W/m²** · **360 esperados / 432 máx** · 1.600 kW nominal / 1.200 kW esperados.
- Sensibilidade: subir a incerteza do gabinete de 15% → 30% e observar o crescimento do "espaço sugerido para incerteza" em cascata (pod → sala → instalação). Relacionar com a conclusão do Bloco 1: mais incerteza ⇒ mais espaço-seguro.

**Notas do instrutor (B4):** registrar a variante do WP: o texto do paper usa 9 pods/sala e a Figura 3 usa 10, com pico de 12,5 kW e 2.352 m² — a ferramenta do curso usa 8 pods e pico 8 kW; os métodos são idênticos, os valores de entrada diferem (mapa `01` §4). No slide 26, pedir aos alunos os três W/m² ANTES de revelar — é o "aha" do módulo.

---

### BLOCO 5 — Do papel ao piso: floor plan (Prática)

**Objetivo verificável:** *Ao final você consegue aplicar as regras quantitativas de layout (hot/cold aisle, pitch, colunas, extremidades de fileira) e estimar o número de posições de rack de uma sala, apontando onde um layout ruim perde 10–20% das posições.*

*(Bloco inteiramente novo — WP144 estava 100% ausente do R5; ver mapa §5.2.)*

| # | Slide | Conteúdo-resumo | Fonte |
|---|-------|-----------------|-------|
| 29 | O floor plan vem CEDO | Floor plan ∈ especificação preliminar, após o system concept e ANTES do detailed design; densidade se especifica no nível da FILEIRA; não é preciso conhecer os dispositivos de TI — só posições de rack e densidades-alvo. | WP144 §3 + Fig. 1 |
| 30 | O que o layout determina | 5 efeitos: nº de posições de rack; densidade alcançável (layout ruim pode cortar >50% da potência permissível por rack); complexidade da distribuição; previsibilidade térmica; consumo elétrico (retorno frio aos CRACs, insuflamento mais frio, ventilação de mistura). Estimativa do paper: bilhões de kWh já desperdiçados por floor plans ruins. | WP144 §3, §5 |
| 31 | Hot aisle / cold aisle | Separar exaustão de admissão: corredores frios só com admissões, quentes só com exaustões, fileiras costas-com-costas; ganho de até **+100% de densidade sem hot spots** vs arranjos aleatórios/unidirecionais. Estratégia base de qualquer layout (exceto rack totalmente enclausurado). | WP144 §6.1 |
| 32 | Pitch — o espaçamento que governa a sala | Pitch = distância meio-corredor-frio a meio-corredor-frio; tile = 600 mm = 1 largura de rack; 4 padrões: **A Compact 7 tiles/14 ft (frio 4 ft, quente 3 ft)** · **B cold largo 8/16 (6+3; +50% refrigeração pelo piso)** · **C hot largo 8/16 (4+5)** · **D ambos largos 9/18 (6+5)**; mínimos absolutos: 3 ft quente / 4 ft frio; piso rígido permite pitch comprimido. | WP144 §6.4 + Fig. 6/7 |
| 33 | Colunas: o inimigo nº 1 | Coluna na fileira: até 3 posições perdidas; coluna no corredor: pode eliminar uma fileira. Cenários da sala de 40 racks: 39 (na fileira) → 38 (no corredor; AHJ costuma vetar) → 34 (quebra o hot/cold) → **29 (fileira eliminada, −25%)** → 35 (girar o eixo 90°). Medir colunas as-built — desenhos mentem. | WP144 §6.2 + Fig. 3/4, §9.2 |
| 34 | Dimensões de sala e estimativa rápida | Regra: uma dimensão = múltiplo do pitch + 2–4 tiles de perímetro; a outra define o comprimento das fileiras; nº de racks "salta" em degraus (20→30→40→50→60 no exemplo); nº par de fileiras fecha pares hot/cold. Estimativa média: **1 rack ≈ 2,6 m² (28 sq ft) de sala**. Fileiras: evitar 1–3 racks; >10 racks podem exigir quebras; fim de fileira ≥2 tiles da parede (3 preferido). | WP144 §7.1 + Fig. 8, §11 itens 2, 16–19 |
| 35 | Os erros que não têm conserto | Implantação incremental sem plano: grupos crescem frente-quente-com-frente-fria; a última fileira não cabe; eixo errado descoberto tarde; deriva do grid dos tiles. Perdas típicas observadas: **10–20% das posições e ≥20% da densidade**. Sequência correta em 8 passos (restrições → equipamentos da sala → eixo → fileiras → densidade por fileira → ponto de índice do grid → maximizar fileiras → especificar o diagrama). | WP144 §9.1, §8 |

**Exercício 5 (manual + ferramenta — 15 min):** *Quantos racks cabem na sala que você especificou?*
- Passo 1 (regra de bolso): pegar o "Tamanho da sala" do Exercício 2 (**39,7 m²**) e estimar posições pela regra do WP144: 39,7 ÷ 2,6 ≈ **15 posições**. *(WP144 §11 item 2.)*
- Passo 2 (comparação): a ferramenta aloca 12 gabinetes de TI + 2 staging + 2 incerteza + 2 energia + 2 climatização + 2 auxiliares = 22 posições-equivalentes em 39,7 m² — mais que a regra média, porque a sala-exemplo reserva pouco egress (3,7 m²) comparado aos 30–50% típicos do Apêndice 1. *(XLS-Sala; WP155 Tabela A1, linha egress.)*
- Passo 3 (esboço): desenhar a sala com pitch A (2 fileiras de 6, par hot/cold) e marcar onde uma coluna hipotética faria perder posições.
- O que observar: a regra de 2,6 m²/rack é média de salas completas (com egress típico); reservas explícitas ≠ regra de bolso — e é exatamente por isso que o WP155 manda declarar as reservas em vez de confiar em médias.

**Notas do instrutor (B5):** conectar os dois papers explicitamente: o WP155 responde "quantos m²?"; o WP144 responde "esses m² funcionam?" — mesma sala de 39,7 m² pode render 12 gabinetes a 4 kW ou virar um desastre térmico com o mesmo total de m², dependendo do layout (WP144 §5: layout ruim corta >50% da potência permissível). No slide 33, contar a pegadinha das colunas maiores que o desenho (shafts adicionados na obra — WP144 §9.2). No slide 35, citar o erro "terrível e comum" do grid do piso elevado instalado sem ponto de índice (WP144 §8 passo 6).

---

### BLOCO 6 — Operação e crescimento (Operação)

**Objetivo verificável:** *Ao final você consegue redigir uma política de densidade para um pod (média, pico, blanking panels, o que fazer quando um gabinete excede o limite) e explicar como faseamento e partições preservam — ou destroem — o desempenho planejado.*

| # | Slide | Conteúdo-resumo | Fonte |
|---|-------|-----------------|-------|
| 36 | Sem política, a especificação morre em produção | Todo DC deve ter política de densidade; o pico não é chute do pior caso — é limite imposto às implantações. Sobrecarga (acima do projeto) dá superaquecimento; MAS baixa densidade também é falha (encalha capacidade; U space mal usado é causa comum) → monitorar potência mínima E máxima por gabinete. Pods por faixa de densidade com política por tipo de pod. | WP155 §10 |
| 37 | Anatomia de uma política (modelo do Apêndice 2) | "Este pod é projetado para média xx kW e pico xx kW"; todo U ocupado com equipamento ou blanking panel; gabinete acima do pico → (1) espalhar cargas, (2) acomodação especial da engenharia, (3) pod alternativo de maior pico; gabinete abaixo da média → compactar U space, montagem traseira, patch panels de maior densidade. | WP155 §14 (Apêndice 2) |
| 38 | Crescimento faseado sem se sabotar | Fasear por fileiras/grupos de fileiras; partições dão re-propósito e obras isoladas, mas NUNCA posicionar partição sem análise de cenários de layout — um deslocamento de parede custou 10 racks em 80 (−12%) e transformou via de acesso em hot aisle (Fig. 9). Alinhar partições com colunas. Arquiteturas modulares orientadas a fileira reduziram a necessidade de particionar. | WP144 §7.3 + Fig. 9, §9.3 |
| 39 | Modularidade: o método vira produto | Pods/salas/instalações padrão pré-engenheirados devem publicar suas especificações de densidade neste formato (5 parâmetros + reservas) — simplifica projeto e dá previsibilidade (ref. WP160). | WP155 §11; R5 S38 |

**Exercício 6 (integrador — ferramenta + redação, 20 min):** *A política do seu pod.*
- Base: pod do Exercício 4 (10 gabinetes, média 5 kW, pico 8 kW, pod de 50 kW nominal).
- Ação: redigir a política de densidade do pod preenchendo o modelo do Apêndice 2 com esses valores; validar na ferramenta a restrição estrutural: alguns gabinetes podem chegar a 8 kW, desde que a soma dos 10 não exceda 50 kW (nº de gabinetes × média-alvo — regra da nota 4 do WP155 §7.1).
- O que observar/discutir: quantos gabinetes de 8 kW cabem simultaneamente no pod sem estourar 50 kW? (50 − 8k ≥ 0 para os demais em que potência…: com 5 gabinetes a 8 kW já são 40 kW, restando 10 kW para 5 gabinetes). O que a política manda fazer com o 6º pedido de 8 kW? (as 3 opções do Apêndice 2).

**Notas do instrutor (B6):** enfatizar o par de vilões simétricos — o gabinete "bombado" que superaquece e o gabinete "vazio" que encalha capacidade (WP155 §10: ambos monitorados e sujeitos a política). No slide 38, retomar a Figura 9 do WP144 como a versão "operacional" do erro de floor plan do Bloco 5.

---

### FECHAMENTO (Evidência)

| # | Slide | Conteúdo-resumo | Fonte |
|---|-------|-----------------|-------|
| 40 | Síntese — o método em 1 tela | O MOC revisitado com os entregáveis: 5 parâmetros + 7 reservas → área como saída (B1–B2); valores por aplicação (B3); hierarquia e roll-up (B4); layout que preserva a densidade (B5); política que preserva no tempo (B6). Frase final do WP155: especificado assim, o desempenho é previsível e não deixado ao acaso; do WP144: floor plan é a fundação de qualquer plano de densidade e faseamento. | WP155 §12; WP144 §12 |
| 41 | Referências e contatos | WP155 (NRAN-8FL6LW, N. Rasmussen), WP144 R2 (VAVR-6KYMZ7, Rasmussen & Torell), WP120/142/160 citados; ferramenta `ferramentas.toptier.net.br/planejador-densidade/`; contatos dos professores. | Metadados das extrações; R5 S39 |

**Total: 41 slides** (2 abertura + 5+7+7+7+7+4 blocos + 2 fechamento) · **6 exercícios** na ferramenta.

---

## 3. Glossário do módulo (PT com termo EN na 1ª ocorrência)

Termos e definições derivados exclusivamente dos WPs; o deck usa SEMPRE o termo PT abaixo.

| Termo PT (padrão do deck) | EN | Definição-fonte |
|---|---|---|
| Gabinete de TI | IT cabinet / rack | Unidade padrão de implantação de espaço de TI; medida-base da densidade (WP155 §6.1) |
| Pod | pod (evitar "zona", "cluster", "fileira" como sinônimos) | Cluster de gabinetes + infra de energia/refrigeração implantado como unidade; forma comum: par de fileiras com corredor quente compartilhado (WP155 §6.2 sidebar, nota 3) |
| Sala de TI | IT room | Nível hierárquico entre pod e instalação (WP155 §6.2) |
| Instalação | facility / site | Nível superior da hierarquia (WP155 §6.2) |
| Densidade de projeto | design density | Capacidade em watts ÷ espaço, com potência/refrigeração/espaço na capacidade máxima de projeto (WP155 §5) |
| Potência média-alvo de projeto | design target average power | Potência de plena carga esperada por unidade, na média da população; dimensiona a planta de bloco (WP155 Tabela 1) |
| Potência de pico por unidade | peak power per unit | Máxima potência esperada da unidade mais alta; dimensiona a distribuição (WP155 Tabela 1) |
| Incerteza de potência | unit power uncertainty | Variação esperada da média implantada vs média-alvo (±%, 80% de confiança); dimensiona o espaço reservado (WP155 Tabela 1, §9.3) |
| Razão de potência gerenciada | managed power ratio | % da média-alvo efetivamente consumida devido ao power management; define ponto de operação/PUE (WP155 Tabela 1, §9.5) |
| Capacidade encalhada | stranded capacity | Potência/refrigeração/espaço pagos e inutilizáveis por descasamento densidade real × projeto (WP155 §4.3, §5) |
| Corredor frio / corredor quente | cold aisle / hot aisle | Corredores só de admissão / só de exaustão no layout alternado (WP144 §6.1) |
| Pitch | pitch | Distância do meio de um corredor frio ao meio do seguinte (WP144 §6.4) |
| Placa de piso | tile | 600 mm (2 ft) = 1 largura de rack padrão (WP144 §4) |
| Piso elevado | raised floor | Sistema de distribuição de ar; grid deve alinhar aos racks via ponto de índice (WP144 §6.3, §8 passo 6) |
| Ponto de índice | index point | Marco de alinhamento do grid do piso/forro com o layout (WP144 §8 passo 6) |
| Staging | staging | Posições reservadas para preparação/migração de equipamentos (WP155 §6.1) |
| Saídas de emergência | egress | Espaço legal de circulação/saída, com rampas e colunas (WP155 §6.1; WP144 §6.2) |
| Gaiola | cage | Partição física subdividindo a área de TI (WP155 §6.1) |
| Painel de fechamento | blanking panel | Fecha posições U vazias para evitar recirculação (WP155 Apêndice 2; WP144 §7.2 "filler panel") |
| Espaço U | U space | Posições verticais do gabinete; subutilização causa baixa densidade (WP155 §10) |
| Implantação faseada | phased deployment / buildout | Crescimento por fases/fileiras; partições de área (WP144 §7.3) |
| Contenção | containment (rack/hot aisle) | Enclausuramento de corredor ou rack; critério de escolha do pitch (WP144 §6.4/Fig. 7) |
| Refrigeração em fileira | in-row cooling | Unidades de refrigeração integradas à fileira/pod (WP155 §7.2; WP144 §4) |
| CRAC / PDU / UPS | computer room air conditioner / power distribution unit / uninterruptible power supply | Infra de sala que consome posições/área (WP155 §6.1) |
| PUE | Power Usage Effectiveness | Métrica de eficiência; degrada a 3–5 em superdimensionamento (WP155 §4.3, §9.5) |
| AHJ | authority having jurisdiction | Autoridade local que aprova obstruções/acessos (WP144 §6.2) |

---

## 4. Principais mudanças didáticas vs R5 (resumo executivo)

1. **Ordem de aprendizagem, não ordem do whitepaper:** problema → conceito → método → prática em cada bloco, com exercício executável fechando os 6 blocos (R5 tinha 0 exercícios enunciados).
2. **Dois blocos novos** que eram lacunas totais: B3 (escolha de valores, WP155 §9 + Apêndice 1) e B5 (floor plan, WP144 inteiro) — e B6 recupera políticas (§10/Ap. 2) e faseamento (WP144 §7.3), dando sentido ao "Crescimento" do título.
3. **Coerência numérica:** todos os números de slide reproduzíveis na ferramenta (planilhas v5 m²); divergências do WP viram notas de instrutor (mapa §4).
4. **Compressão das redundâncias:** S29≡S30 eliminada; 3 slides de pod → 1; S6+S7 → problema/demonstração; S22+S23 → 1 tabela; S35+S36 → 1; walls of text convertidos em checklists/tabelas (as notas do instrutor do R5 que já faziam isso viram os próprios slides).
5. **Objetivos verificáveis por bloco** ("ao final você consegue…") + MOC-hub navegável (Fundamentos → Prática → Operação → Evidência) + glossário único PT/EN.
