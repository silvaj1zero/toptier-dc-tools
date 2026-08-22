# Calculating Space and Power Density Requirements for Data Centers

> Extração estruturada e fiel do whitepaper Schneider Electric, em português, com termos técnicos originais em inglês entre parênteses. Fonte: PDF `Calculating Space and Power Density NRAN-8FL6LW_R0_EN.pdf` (19 páginas). Regra No-Invention: todo o conteúdo abaixo deriva exclusivamente do paper.

---

## 1. Metadados

| Campo | Valor |
|---|---|
| Título | Calculating Space and Power Density Requirements for Data Centers |
| Código de documento | NRAN-8FL6LW |
| White Paper | nº 155 |
| Revisão | Revision 0 (Rev 0) |
| Autor | Neil Rasmussen (Senior VP of Innovation, Schneider Electric) |
| Editora | Schneider Electric — Data Center Science Center (DCSC@Schneider-Electric.com) |
| Copyright | © 2013 Schneider Electric |
| Recursos vinculados | White Paper 142 (Data Center Projects: System Planning); White Paper 160 (Specification of Modular Data Center Architecture); planilhas "Space & Density Worksheet" (Small Server Room e Large Data Center) embutidas no PDF |

---

## 2. Sumário executivo (Executive summary)

O método histórico de especificar densidade de potência de data center por um único número de watts por pé quadrado (watts per square foot) ou watts por metro quadrado é uma prática infeliz que causou confusão desnecessária, além de desperdício de energia e de dinheiro. O paper demonstra como os métodos típicos usados para selecionar e especificar densidade de potência são falhos, e fornece uma abordagem aprimorada para estabelecer requisitos de espaço, incluindo especificações de densidade recomendadas para situações típicas.

---

## 3. Introdução (Introduction)

Dois parâmetros-chave de projeto de um data center são a capacidade de carga de TI (IT load rating) em kW e o tamanho físico das salas de TI e de equipamentos. Em princípio, eles se relacionam pelo conceito de densidade de potência (power density), que vagamente vincula o tamanho do prédio à carga de TI. Historicamente é comum descrever data centers com frases como "2.000 metros quadrados a 1.000 watts por metro quadrado". Essa terminologia gera confusão e ambiguidade na especificação e, além disso, frequentemente resulta em equipamentos de potência e refrigeração subutilizados, o que reduz a eficiência elétrica e eleva o custo inicial (first-time cost).

O paper descreve um método aprimorado para especificar densidade de potência e faz recomendações específicas de densidade para novos data centers, baseadas em poucas características simples do data center.

---

## 4. Por que a abordagem antiga não funciona (Why the past approach does not work)

### 4.1 Os quatro problemas do W/ft² (W/m²)

Há quatro problemas principais na prática histórica de descrever densidade em watts por pé quadrado ou watts por metro quadrado:

1. **Área indefinida** — não se define o que está incluído no cálculo de área, nem como ela se relaciona com o número de gabinetes (IT cabinets) ou dispositivos de TI.
2. **Potência indefinida** — não se define o que está incluído no cálculo de potência.
3. **Sem informação de variação** — o número único não informa nada sobre a variação de potência através de uma população de gabinetes: é um pico (peak)? Uma média sobre a área? Uma média no tempo? Outro valor?
4. **Sem tratamento de crescimento/modularidade** — não fica claro como o número é usado em um data center com plano de crescimento variável, modular ou construído em fases (built out over time).

Os dois primeiros problemas poderiam, em princípio, ser mitigados por definições padronizadas de potência e área. Mas o terceiro e o quarto são muito importantes e **não** podem ser resolvidos melhorando definições. Uma abordagem melhor de especificação de densidade precisa considerar que a potência de TI **varia entre gabinetes e ao longo do tempo**, e compreender as questões de modularidade e crescimento.

### 4.2 Exemplo da ambiguidade: 120 W/ft²

Considere um data center com a especificação típica de **120 W/ft² (1.292 W/m²)**. Para entender o que isso significa para um gabinete de servidor, é preciso traduzir a densidade para o nível do gabinete, onde — dependendo de premissas como o espaço consumido por gabinete — equivale a **algo entre 3 e 5 kW por gabinete**. O meio dessa faixa, **4 kW por gabinete**, pode parecer razoável por ser uma densidade típica medida em data centers existentes. Mas ficam variáveis indefinidas significativas:

- Se o data center é construído para 4 kW/gabinete, o que acontece quando um gabinete isolado tem carga de 6 kW, 12 kW ou 20 kW?
- Se alguns gabinetes têm menos de 4 kW instalados, a capacidade de potência e refrigeração não usada fica disponível em outros gabinetes? Se sim, em quais?
- Se alguns gabinetes passam de 4 kW, é preciso deixar espaço vago ao redor deles?
- Se alguns gabinetes passam de 4 kW, podem ficar próximos entre si ou devem ser espalhados?

Com a crescente funcionalidade de gestão de energia de servidores (server power management), que faz as cargas variarem no tempo, uma especificação vaga de densidade tem implicações ainda maiores. Uma especificação eficaz precisa conseguir responder às perguntas acima.

### 4.3 Por que "superdimensionar" (overkill) também não resolve

Poderia parecer que basta especificar uma densidade muito alta, como 30 kW por gabinete ou **1.000 W/ft² (10.764 W/m²)**. Esse "overkill" eliminaria a maioria dos problemas descritos, mas cria problemas novos, muito caros e desperdiçadores:

- Um data center de 1.000 W/ft² (10.764 W/m²) custa **cerca de 8 vezes** o custo de um data center de 100 W/ft², **por unidade de área de piso**. Se a capacidade de densidade não for usada, há desperdício massivo de capital.
- Se um data center de 1.000 W/ft² acabar operando a **100 W/ft² (1.076 W/m²), ou 3 kW/gabinete**, seu PUE operacional provavelmente ficará na faixa de **3 a 5** — desperdício tremendo de energia.
- Se um data center de 1.000 W/ft² for populado com TI a densidade menor, o espaço físico acaba antes da capacidade de potência e refrigeração, de modo que muita capacidade fica **encalhada (stranded)** ou inutilizável.

**Síntese do paper:**

> Especifique uma densidade baixa demais e o desempenho torna-se imprevisível, com problemas de sobrecarga (overload) e superaquecimento (overheating); especifique uma densidade alta demais e o custo inicial (first cost) e as despesas operacionais aumentam desnecessariamente.

Para resolver esse problema de planejamento, é preciso uma forma melhor de especificar densidade — e orientação sobre como escolher a especificação mais adequada, mesmo quando a densidade futura é incerta.

---

## 5. O custo dos erros de especificação de densidade (The cost of density specification errors)

Todo data center tem uma **densidade média de projeto (design target average density)**. Um data center também tem uma capacidade de potência de carga de TI e uma capacidade de refrigeração (idealmente iguais), e uma capacidade de espaço de TI (gabinetes ou pés quadrados). **A razão entre a capacidade em watts e o espaço é a densidade de projeto (design density)** — assumindo, nesta discussão, potência, refrigeração e espaço construídos até a capacidade máxima de projeto. Exemplo de densidade global de projeto: **5 kW por gabinete, aproximadamente equivalente a 160 W/ft² (1.722 W/m²)**.

- Se a TI for implantada de modo a utilizar completamente potência, refrigeração e espaço, nenhuma infraestrutura fica subutilizada — o caso ideal de **100% de utilização**, quase impossível de atingir porque o consumo real de cada gabinete geralmente não é conhecido com antecedência.
- Se a densidade real ≠ densidade de projeto, algum recurso (potência, refrigeração ou espaço) não pode ser totalmente usado. Essa infraestrutura desperdiçada aumenta efetivamente o custo do data center — o recurso é pago mas não usado.
- **Densidade real < densidade de projeto** → o espaço acaba antes da potência/refrigeração; parte da capacidade de potência/refrigeração fica encalhada (stranded).
- **Densidade real > densidade de projeto** → potência/refrigeração acabam antes do espaço; parte do espaço fica sem uso.

Para entender o efeito econômico, foi criado um modelo do custo da capacidade encalhada sobre o custo efetivo do data center (**capex em $ por watt de TI utilizável**) — resultado na Figura 1.

**Leitura da Figura 1:** o custo efetivo por watt é mínimo quando a densidade média real é igual à densidade de projeto. Quando a densidade real **cai abaixo** do valor de projeto, o custo efetivo **sobe rapidamente** — o data center fica limitado por espaço, encalhando capacidade de potência/refrigeração, cujo custo é rateado por uma carga de TI menor que a planejada. Quando a densidade real **sobe acima** do valor de projeto, o custo efetivo sobe apenas **levemente**, pelo custo do espaço que não pode ser usado.

**Achado importante:**

> É muito mais custoso implantar TI abaixo da densidade de projeto do que acima dela.

Isso vale porque o custo do espaço por unidade de TI é sempre muito menor que o custo da potência e refrigeração por unidade de TI. (Nota de rodapé 1 do paper: isso vale para as densidades típicas atuais; custos de espaço só se tornam comparáveis aos de potência/refrigeração para densidades bem abaixo de **1 kW por gabinete**.)

**Conclusão-chave:**

> Quando a densidade da TI é incerta, o data center deve sempre ser construído para uma densidade de projeto **menor** que o valor médio esperado da densidade de TI.

Assim o operador evita a curva de penalidade íngreme do lado esquerdo da Figura 1. Outro resultado-chave, que resolve um mal-entendido de longa data entre operadores e gestão organizacional:

> Um data center bem projetado, quando preenchido até a capacidade de potência e refrigeração, deve ter espaço de TI sobrando (spare or unutilized IT space).

Resultado surpreendente e contraintuitivo à primeira vista: o espaço sobressalente é um **seguro** contra o encalhe caro de capacidade de potência/refrigeração caso a densidade real fique abaixo do plano. **Quanto maior a incerteza sobre a densidade futura, maior o espaço de TI sobressalente necessário.**

---

## 6. A nova abordagem (A new approach)

A nova abordagem de especificação de espaço e densidade de potência tem **quatro características-chave**:

1. A unidade de espaço físico na especificação de densidade é o **gabinete de TI (IT cabinet), NÃO a área de piso (floor area)**. A área de piso é determinada durante o projeto como uma **saída** do processo, usando a potência por gabinete e outros fatores.
2. A especificação é **hierárquica e modular**, de modo que salas e zonas distintas possam ter requisitos de densidade distintos.
3. A especificação compreende que gabinetes de TI dentro do data center têm **requisitos de potência diferentes**, possivelmente mal-definidos com antecedência.
4. A especificação compreende que os gabinetes podem ter requisitos de potência que **variam no tempo**.

### 6.1 Uso do gabinete como medida de espaço físico (Use of cabinet as a measure of physical space)

A medida mais comum de implantação de espaço de TI é o gabinete (IT cabinet). Outros dispositivos, como storage arrays e mainframes, não são gabinetes, mas na maioria dos casos podem ser descritos como aproximadamente equivalentes a um ou mais gabinetes em tamanho. Estabelece-se, portanto, o gabinete como medida de implantação de espaço de TI e **a potência por gabinete (power per cabinet) como a medida padrão de densidade**.

Como o espaço em prédios é medido em área de piso (ft² ou m²), em algum momento é preciso converter espaço de gabinetes em espaço físico. O problema é que essa conversão depende de fatores-chave **independentes da potência por gabinete**, que devem ser especificados separada e explicitamente:

- Quantidade de posições de gabinete reservadas, se houver, para staging futuro ou migração;
- Espaço para dispositivos de infraestrutura de potência e refrigeração dentro da sala de TI (PDUs, ar-condicionados, UPSs);
- Espaço para saídas de emergência (egress), rampas de piso elevado (raised floor ramps) e colunas (se houver);
- Presença de partições físicas, como gaiolas (cages), subdividindo a área de TI;
- Espaço reservado, se houver, para patch panels ou equipamentos de rede;
- Espaço reservado, se houver, para gabinetes ou gaiolas de armazenamento de equipamentos;
- Espaço reservado, se houver, para acomodar a densidade real ficar abaixo da especificação de projeto.

Esses fatores têm grande impacto no espaço necessário e na densidade por unidade de área, **E DEVEM SER EXPLICITAMENTE DEFINIDOS NO PROJETO JUNTO COM A DENSIDADE POR GABINETE** (ênfase do original). Embora pareça mais complicado que fixar um "watt por pé quadrado", o paper mostra que esses fatores podem ser determinados muito rapidamente, melhorando muito a qualidade e a clareza da especificação.

### 6.2 Especificação de densidade modular e hierárquica (A modular, hierarchical density specification)

É preciso poder especificar densidade de forma diferente para partes diferentes do data center. No caso geral, o data center segue a hierarquia:

```
Instalação do data center (data center facility), composta de uma ou mais
  Salas de TI (IT rooms), compostas de uma ou mais
    Pods de TI (IT pods), compostos de uma ou mais
      Gabinetes de TI (IT cabinets)
```

Notas de rodapé do paper:
- (2) É uma hierarquia geral; em data centers menores nem todos os níveis se aplicam — numa sala de servidores pequena a "facility" pode ser uma única sala com um único pod, e a especificação fica simples.
- (3) Pods às vezes são chamados de zonas (zones), clusters ou fileiras (rows); esses termos alternativos têm significados variados em projeto de data center e **não são preferidos**. Data centers pequenos podem omitir esse nível e simplesmente implantar gabinetes em salas.

**Definição de pod (sidebar do paper):** um pod de data center é um agrupamento (cluster) de gabinetes de TI combinado com infraestrutura de potência e refrigeração, implantado como uma unidade. As salas são planejadas com antecedência para um número de pods, mas os pods podem ser implantados ou atualizados separadamente ao longo do tempo. Pods tipicamente são montados on-site em uma sala segundo um projeto padrão, mas podem ser parcial ou extensivamente pré-fabricados. Em sua forma mais comum, **um pod é um par de fileiras de gabinetes compartilhando um corredor quente (hot aisle)**. Projeto baseado em pods é uma best-practice recomendada para data centers maiores.

Como há atributos do data center afetados pela especificação de densidade em **cada** um desses níveis, **todos os quatro níveis devem ser especificados** para controlar o projeto e prever seu desempenho. Exemplo: a densidade de potência de um pod afeta as capacidades dos sub-alimentadores elétricos (power sub-feeds) do pod e o sistema de distribuição de ar (airflow distribution) do pod.

Será possível "consolidar" (roll up) as especificações das partes em um único valor de densidade da instalação (como watts por pé quadrado), mas esse número único **não é informação suficiente** para controlar o projeto e obter resultado previsível.

### 6.3 Variação de densidade pelo data center (Variation of density across the data center)

A densidade pode variar entre grupos de gabinetes, entre pods, ou entre salas. A variação ocorre fisicamente (gabinete a gabinete, sala a sala) e também **no tempo**, porque dispositivos de TI são adicionados e removidos, e porque a potência consumida varia com a carga de trabalho (IT workload). A densidade operacional de cada gabinete pode ser diferente, e pode variar de momento a momento. Isso quase faz parecer fútil definir densidade — mas, como o objetivo de definir densidade é especificar um projeto que suporte uma **população** de equipamentos de TI, é possível identificar parâmetros **estatísticos** dessa população suficientes para formar uma especificação que lide com a variação.

Para um dado nível da hierarquia (ex.: sala composta de "unidades" pod, ou pod composto de "unidades" gabinete), a densidade é especificada com **cinco parâmetros-chave** (Tabela 1).

**A área de piso NÃO é parâmetro de entrada da especificação de densidade** — é uma **saída calculada** a partir desses parâmetros MAIS os fatores de uso de espaço da seção 6.1.

### Tabela 1 — Cinco parâmetros-chave para estabelecer especificações de espaço e densidade

| Parâmetro de especificação | Definição | Como é usado no projeto |
|---|---|---|
| Número de unidades (Number of units, #) | Número de gabinetes em um pod, pods em uma sala, ou salas em uma instalação | Converter os valores por unidade (por gabinete, por pod, por sala) de potência, refrigeração e espaço em valores totais |
| Potência média-alvo de projeto por unidade (Design target average power per unit, kW) | Potência de plena carga (rated) esperada por unidade, na média da população | Dimensionar os sistemas de potência e refrigeração de bloco (bulk) para o nível (pod, sala, instalação) |
| Potência de pico por unidade (Peak power per unit, kW) | Máxima potência esperada da unidade mais alta da população | Dimensionar os requisitos dos sistemas de distribuição de potência e de distribuição de refrigeração |
| Incerteza de potência por unidade (Unit power uncertainty, %) | Quantifica a incerteza esperada da potência real em relação à potência média-alvo de projeto | Determinar o espaço reservado necessário para garantir que implantação em baixa densidade não encalhe capacidade cara de potência e refrigeração |
| Razão de potência gerenciada (Managed power ratio, %) | Fator de redução de potência (% da média-alvo de projeto) devido a funções de gestão de energia (power management) na TI | Estabelecer os pontos de operação de carga dos sistemas de potência e refrigeração, para determinar eficiência e uso de energia |

Número de unidades e potência média-alvo são evidentemente necessários; **peak power, unit power uncertainty e managed power ratio são conceitos novos** introduzidos aqui. São necessários porque a potência média-alvo **não** fornece a informação para dimensionar os sistemas de **distribuição** de potência e refrigeração, nem para determinar os pontos de operação dos cálculos de eficiência.

---

## 7. Exemplos de especificação de densidade (Example density specification)

Dois exemplos demonstram o método: uma sala de servidores pequena de 40 kW e uma instalação multi-salas de 2 MW com plano de crescimento.

### 7.1 Exemplo 1 — Sala de servidores pequena (Small server room), 40 kW

Caso simples: a instalação tem uma única sala de TI com um único pod. O nível de especificação é a sala (= pod), contendo um grupo de gabinetes. A especificação completa está na planilha da Figura 2 (as caixas amarelas são entradas do usuário; o desempenho-resumo é calculado).

#### Planilha da Figura 2 — Parâmetros de densidade (Density Parameters)

| Parâmetro | Valor |
|---|---|
| Número de gabinetes (Number of cabinets) | 12 |
| Potência média-alvo de projeto por gabinete (Design target average power per cabinet) | 4 kW |
| Potência de pico do gabinete (Peak cabinet power) | 8 kW |
| Incerteza de potência do gabinete (Cabinet power uncertainty) ± | 15% (80% de confiança) |
| Razão de potência gerenciada (Managed power ratio) | 70% |
| Área por gabinete (Area per cabinet) | 16 ft² |

#### Planilha da Figura 2 — Parâmetros de uso de espaço (Space Use Parameters)

| Item de espaço | Gabinetes | ft² diretos | Total |
|---|---|---|---|
| Requisito de área dos gabinetes (Cabinet area requirement) | 12 | 0 | 192 ft² |
| Espaço reservado para staging (Space reserved for staging) | 2 | 0 | 32 ft² |
| Espaço sugerido para incerteza de densidade (Suggested space for density uncertainty) | — | — | 34 ft² (calculado) |
| Espaço para incerteza de densidade (Space for density uncertainty) | 2 | 0 | 32 ft² |
| Espaço reservado para potência (Space reserved for power) | 2 | 0 | 32 ft² |
| Espaço reservado para refrigeração (Space reserved for cooling) | 2 | 0 | 32 ft² |
| Espaço reservado para sistemas auxiliares (Space reserved for ancillary systems) | 2 | 0 | 32 ft² |
| Espaço reservado para armazenamento (Space reserved for storage) | 0 | 25 | 25 ft² |
| Espaço para egress, rampas e colunas (Space for egress, ramps, and columns) | 0 | 40 | 40 ft² |
| **Subtotal** | | | **417 ft²** |

#### Planilha da Figura 2 — Resumo de desempenho da sala (Room Performance Summary)

| Métrica | Valor |
|---|---|
| Potência nominal do sistema (Rated system power) | 48 kW |
| Potência de TI operacional esperada (Expected IT operating power) | 33,6 kW |
| Potência nominal de pico por gabinete (Peak rated power per cabinet) | 8,0 kW |
| Potência nominal por gabinete (Nominal power per cabinet) | 4,0 kW |
| Potência média esperada por gabinete (Average expected power per cabinet) | 2,8 kW |
| Tamanho da sala (Room size) | 417 ft² |
| Espaço de TI não utilizado esperado (Expected unused IT space) | 15% do espaço total |
| Densidade de potência da sala (Room power density) | 115 W por ft² |

#### Procedimento para determinar os parâmetros de densidade (Exemplo 1)

1. **Número de gabinetes** — estabelecido pelo requisito de TI.
2. **Potência média-alvo por gabinete** — por especificações dos fornecedores de TI ou escolhendo valores típicos de projeto para a aplicação. Aqui, valor típico de sala de servidores corporativa: **4 kW/gabinete**.
3. **Potência de pico** — estabelecendo a máxima potência de gabinete esperada ou permitida. Aqui, capacidade máxima de **8 kW**. (Nota de rodapé 4: a capacidade de pico existe para acomodar **alguns** racks no pico; a potência total de todos os racks não pode exceder a potência computada a partir do valor médio de projeto.)
4. **Incerteza de potência do gabinete** — estimada considerando cenários de implantação de TI ou valores típicos. Aqui, **±15%** em relação à média-alvo de 4 kW.
5. **Managed power ratio** — estimada pela funcionalidade de power management esperada da carga. Aqui, espera-se que reduza a potência média real para **70%** da média-alvo.

Para determinar o requisito de espaço da sala: primeiro define-se a área requerida pela TI (incluindo acesso frontal e traseiro do gabinete — nota de rodapé 5: é útil incluir o espaço de acesso frontal/traseiro como parte do footprint do gabinete, pois essas áreas de acesso/egress são automaticamente incluídas quando racks são adicionados ou removidos de um pod, dispensando cálculo separado da área de egress total); depois somam-se explicitamente os demais usos de espaço. Para cada uso não-TI, a planilha permite reservar espaço em **posições de gabinete OU em pés quadrados** — conveniente para dispositivos com form factor de gabinete (potência, refrigeração, patch panels). Um "espaço sugerido reservado para incerteza de densidade" é calculado a partir da incerteza informada; o usuário então reserva explicitamente ft² ou posições de gabinete para atender à sugestão. No exemplo, a reserva sugerida é **34 ft²** e o usuário quase a atinge reservando **2 posições de gabinete = 32 ft²**.

O especificador pode não ter todas essas informações (requisitos de TI vagos, configuração não finalizada) — por isso o Apêndice 1 traz valores típicos por aplicação. **Ideia-chave: a especificação NÃO precisa espelhar um plano de TI detalhado dispositivo-a-dispositivo (quase nunca conhecido de antemão); ela garante que o data center terá desempenho conhecido e previsível.**

**Interpretação do exemplo:** a especificação define explicitamente um projeto que suporta qualquer combinação de até 12 racks com média-alvo de 4 kW e pico de qualquer rack ≤ 8 kW. A potência média com power management é esperada em 70% de 4 kW por gabinete, ou **34 kW no total** (valor do texto; a planilha mostra 33,6 kW), e qualquer garantia de desempenho de eficiência da planta principal de potência e refrigeração deve ser feita **nessa** densidade de potência. Para garantir que o pico não seja excedido, o data center teria uma política de implantação de TI declarando o máximo de 8 kW por gabinete, com cargas maiores divididas entre gabinetes. O espaço reservado adicional garante que toda a potência e refrigeração possa ser utilizada se a densidade real de TI ficar até 15% abaixo dos 4 kW da média-alvo. **Nada dessa informação-chave é compreendida quando se especifica a clássica densidade em watt por pé quadrado.**

### 7.2 Exemplo 2 — Data center grande (Large data center), 2 MW

Hierarquia definida:

```
Instalação (facility), composta de
  4 salas de TI (IT rooms), cada uma composta de
    9 pods de TI, compostos de
      10 gabinetes de TI
```

*(Nota de fidelidade: o texto da hierarquia diz "9 IT pods", mas a planilha da Figura 3 usa 10 pods por sala — 4 salas × 10 pods × 10 gabinetes × 5 kW = 2.000 kW, consistente com os totais da planilha.)*

Duas abordagens básicas para especificar um data center grande:

1. Começar a especificação no nível do gabinete ou do pod e **construir para cima** (build up) a especificação da instalação;
2. Começar no nível da instalação e **fatiar** (cut up) em salas, depois pods, depois gabinetes.

Idealmente usa-se a primeira, mas muitas vezes não é prático, porque as restrições de nível de instalação já foram definidas primeiro (potência de rede disponível — available mains power — ou tamanho físico do prédio). Dado um requisito de potência conhecido da instalação, o procedimento é:

1. Determinar o número de salas na instalação, estabelecendo a potência da sala;
2. Determinar o número de pods em uma sala, estabelecendo a potência do pod;
3. Determinar o número de gabinetes em um pod, estabelecendo a potência do gabinete;
4. Estabelecer os parâmetros de uso de espaço da instalação, do pod e da sala;
5. Determinar os parâmetros de densidade restantes;
6. Consolidar (roll up) a especificação total e validar contra as restrições de projeto;
7. Ajustar e repetir até o projeto atender aos requisitos.

Para simplificação, o exemplo assume que todas as salas são iguais, todos os pods são iguais, e a variação existe apenas no nível do gabinete — premissa apropriada para muitos casos.

#### Planilha da Figura 3 — Parâmetros de densidade (2 MW)

| Parâmetro | Salas na instalação (Room Units in Facility System) | Pods na sala (Pod Units in Room System) | Gabinetes no pod (Cabinet Units in Pod System) |
|---|---|---|---|
| Número de unidades (Number of units) | 4 | 10 | 10 |
| Potência média-alvo por unidade (Design target average power per unit) | 500 kW | 50 kW | 5,0 kW |
| Potência de pico por unidade (Peak power per unit) | 500 kW | 50 kW | 12,5 kW |
| Incerteza de potência por unidade ± (Unit power uncertainty) | — (roll-up) | — (roll-up) | 24% |
| Razão de potência gerenciada (Managed power ratio) | 80% | 80% | 80% |
| Área por unidade (Area per unit) | 4.480 ft² | 280 ft² | 14 ft² |

#### Planilha da Figura 3 — Parâmetros de uso de espaço (2 MW)

Cada célula: nº de unidades reservadas / ft² diretos → total.

| Item de espaço | Instalação (em salas / ft²) | Sala (em pods / ft²) | Pod (em gabinetes / ft²) |
|---|---|---|---|
| Requisito de área das unidades (Area requirement for units) | 4 / 0 → 17.920 ft² | 10 / 0 → 2.800 ft² | 10 / 0 → 140 ft² |
| Espaço reservado para staging | 0 / 500 → 500 ft² | 1 / 0 → 280 ft² | 0 / 0 → 0 ft² |
| Espaço sugerido para incerteza de densidade (calculado) | 283 ft² | 324* ft² | 44 ft² |
| Espaço reservado para incerteza de densidade | 0 / 0 → 0 ft² | 1 / 0 → 280 ft² | 2 / 0 → 28 ft² |
| Espaço reservado para potência | 0 / 2.000 → 2.000 ft² | 0 / 80 → 80 ft² | 1 / 0 → 14 ft² |
| Espaço reservado para refrigeração | 0 / 2.000 → 2.000 ft² | 0 / 80 → 80 ft² | 3 / 0 → 42 ft² |
| Espaço reservado para sistemas auxiliares | 0 / 400 → 400 ft² | 0 / 80 → 80 ft² | 0 / 0 → 0 ft² |
| Espaço reservado para armazenamento | 0 / 500 → 500 ft² | 0 / 80 → 80 ft² | 0 / 0 → 0 ft² |
| Espaço para egress, rampas e colunas | 0 / 2.000 → 2.000 ft² | 0 / 800 → 800 ft² | 0 / 56 → 56 ft² |
| **Subtotal** | **25.320 ft²** | **4.480 ft²** | **280 ft²** |

\* Nota da planilha: esse campo precisa somar o espaço dos vários pods, se existir mais de um tipo de pod.

#### Planilha da Figura 3 — Resumo de desempenho (Performance Summary, 2 MW)

| Métrica | Instalação | Sala | Pod / Gabinete |
|---|---|---|---|
| Potência nominal do sistema (Rated system power) | 2.000 kW | 500 kW/sala | 50 kW/pod |
| Requisito esperado de gabinetes (Expected # IT cabinet requirement) | 400 gabinetes | 100 gabinetes/sala | 10 gabinetes/pod |
| Capacidade máxima de gabinetes (Max # IT cabinet capability) | 576 gabinetes | 144 gabinetes/sala | 12 gabinetes/pod |
| Potência de TI operacional esperada (Expected IT operating power) | 1.600 kW | 400 kW/sala | 40 kW/pod |
| Potência nominal de pico por unidade (Peak rated power per unit) | 500 kW/sala | 50 kW/pod | 12,5 kW/gabinete |
| Potência nominal por unidade (Nominal rated power per unit) | 500 kW/sala | 50 kW/pod | 5,0 kW/gabinete |
| Potência média esperada por unidade (Average expected power per unit) | 400 kW/sala | 40 kW/pod | 4 kW/gabinete |
| Tamanho do sistema (System size) | 25.320 ft² | 4.480 ft²/sala | 280 ft²/pod |
| Espaço de unidade não usado esperado (Expected unused unit space) | 2% da instalação | 13% da sala | 10% do pod |
| Densidade de potência do sistema (System power density) | 79 W/ft² (instalação) | 112 W/ft² (sala) | 179 W/ft² (pod) |

#### Atributos do projeto definidos pela planilha (2 MW)

- Um pod é composto de **12 gabinetes de TI mais 4 posições de gabinete dedicadas à distribuição de potência e refrigeração em fileira (in-row cooling)**, com footprint de pod de **20 ft × 14 ft (6 m × 4 m)**.
- A potência média-alvo por gabinete é **5 kW**.
- A potência de pico permitida em qualquer gabinete é **12,5 kW**, desde que a potência do pod não exceda **50 kW** para os 12 gabinetes combinados.
- O espaço interno total requerido é **25.320 ft² (2.352 m²)**.
- Em métricas convencionais de W/ft² no nível da sala de TI, este data center tem densidade de **112 W/ft² (1.206 W/m²)**.
- Em cada pod, **2 posições sobressalentes de gabinete** foram providas, para permitir utilizar a potência e refrigeração do pod caso a média implantada fique abaixo dos 5 kW/gabinete especificados.
- Em cada sala, **2 posições sobressalentes de pod** foram reservadas: uma para staging de novos pods sem perturbar um pod existente, e uma para permitir utilizar a potência e refrigeração da sala caso a média implantada fique abaixo de 5 kW/gabinete.

A planilha é mais sofisticada que a do Exemplo 1 no rastreio do espaço reservado para incerteza: **a incerteza é capturada no nível de TI, nos gabinetes individuais** — o usuário não precisa inserir incerteza nos níveis de pod ou sala; esses níveis são roll-ups computados do nível inferior. Porém o usuário **pode reservar espaço para incerteza em qualquer nível**: espaço extra no pod para mais gabinetes, na sala para mais pods, na instalação para mais salas, ou combinação dos três. O método preferido de reserva é frequentemente controlado pela geometria da sala ou outros fatores. A planilha rastreia o requisito total de espaço e permite reservar com qualquer combinação de gabinetes, pods ou salas extras.

---

## 8. Estendendo a abordagem a data centers com variações de pod e sala (Extending the approach to data centers with pod and room variations)

Idealmente, os projetos de pod e sala dentro de uma instalação são **uniformes e padronizados**, o que traz:

- Simplicidade de escalonamento (scaling);
- Padronização de ferramentas, métodos e procedimentos de gestão;
- Simplicidade de planejamento e projeto.

Nem sempre isso é apropriado ou viável, devido a:

- Tipos conhecidos de TI com requisitos muito distintos que serão implantados;
- Dimensões de sala já definidas que não podem ser padronizadas;
- Áreas com requisitos de disponibilidade (availability) diferentes, o que afeta o espaço tomado por equipamentos redundantes de potência e refrigeração.

**Best-practice recomendada:** definir um conjunto mínimo de gabinetes padrão, pods padrão e, em data centers muito grandes, salas padrão. Exemplo: um data center grande pode definir três pods padrão com o **mesmo footprint** para baixa densidade, alta densidade e storage; o projeto assume uma mistura esperada desses pods, mantendo flexibilidade para ajustar a mistura durante a implantação de longo prazo.

A planilha da Figura 3 usa um gabinete estatisticamente médio, implantado em pod padrão, em salas padrão. Para usar o método com uma mistura prática de tipos pré-definidos de pod ou sala, a planilha deve ser estendida.

---

## 9. Escolhendo valores dos parâmetros de densidade (Choosing density parameter values)

Como os parâmetros de densidade podem gerar custos significativos, esta seção orienta a seleção de valores. O Apêndice 1 fornece valores sugeridos para aplicações comuns — excelente ponto de partida, usável "como está" ou ajustado.

### 9.1 Número de unidades (Number of units)

Para um data center pequeno e simples, o número de "unidades" é o número de gabinetes na sala. Para um grande, assume três valores: gabinetes por pod, pods por sala e salas por instalação. A maioria é estabelecida por restrições da instalação. O valor-chave de projeto é o **número de gabinetes por pod**, que afeta muitos aspectos do projeto. Diretrizes quantitativas do paper:

- Como um pod tipicamente inclui sistemas de distribuição de potência e refrigeração, torna-se **impraticável implantar um pod com menos de ~20 kW**, o que se traduz em **2 a 6 gabinetes**, dependendo da densidade.
- Como um pod é um grupo contíguo de gabinetes e egress de pessoal legalmente exigido ao redor dos pods é geralmente requerido, o **máximo é cerca de 24 gabinetes**, o que se traduz em **75 a 500 kW**, dependendo da densidade.
- Fator-chave no tamanho do pod: a best-practice de refresh/aposentadoria **pod a pod** (em vez de gabinete a gabinete). Pods menores permitem refreshes de menor escala.
- Um **pod de 500 kW ≈ 1.000 servidores** — apropriado apenas para grandes provedores de cloud. Para muitos clientes, um pod de **50–100 kW, correspondendo a 100–200 servidores**, é mais prático.

> **Recomendação:** número de gabinetes por pod entre **8 e 24**. Data centers grandes e baixa densidade sugerem número maior; data centers menores e alta densidade sugerem número menor.

### 9.2 Potência média-alvo de projeto por unidade (Design target average power per unit)

Escolher a média-alvo por gabinete é confuso e controverso: tem efeito muito grande sobre projeto e custo, e a literatura traz recomendações conflitantes — em geral **sem separar corretamente as ideias de incerteza (uncertainty) e valores de pico (peak)**, que são importantes para a especificação.

- A média-alvo é a potência (rated) média do gabinete, na média da população. **Se a média-alvo é 5 kW, gabinetes de 20 kW ainda podem existir no pod**, desde que a especificação de pico os acomode.
- Há uma tendência de **superespecificar** a média-alvo por gabinete, para acomodar TI futura (que se diz amplamente estar aumentando de potência) ou por aparente margem de segurança. Escolher um número alto parece prudente — mas **NÃO é**: especificar um valor maior do que o realmente implantado move o data center para o lado esquerdo da curva da Figura 1, resultando em desperdício e ineficiência extremos. Muitos operadores chegaram a essa condição infeliz achando que projetavam para necessidades futuras.
- **Abordagem melhor:** escolher a potência total em kW do data center e então uma melhor estimativa (best guess) da potência esperada por gabinete. Densidades futuras diferentes do valor de projeto são tratadas com os parâmetros de **incerteza** e **pico**.
- Faixas reais: a potência por gabinete em data centers atuais vai de **2 kW a 30 kW por gabinete**. Médias acima de **12 kW** são bem raras, atingidas principalmente em HPC (high performance computing) ou cloud de alta densidade. A vasta maioria dos data centers de uso misto em organizações exibe médias de **4 a 8 kW por gabinete**.
- As médias existentes **não** são bom preditor dos valores futuros: consolidação, padronização, novas tecnologias de servidor e virtualização estão elevando as densidades por gabinete.

> **Regra geral:** novos data centers para uso misto de TI devem ser especificados com potência média-alvo por gabinete **pelo menos 50% maior** do que a organização opera atualmente.

### 9.3 Incerteza de potência por unidade (Unit power uncertainty)

Uma especificação eficaz quase sempre terá incerteza **não nula**. Única exceção: casos como HPC, em que a instalação é construída para uma implantação padrão muito específica com requisitos de potência exatamente conhecidos.

A incerteza descreve como a **densidade média implantada através de todos os gabinetes** deve variar em relação à média-alvo de projeto. Esse número **NÃO** trata variações entre unidades individuais (entre gabinetes, salas etc.).

**Exemplo numérico do paper:**
- Se sabe-se com antecedência que a carga será 80% gabinetes de 4 kW e 20% gabinetes de 20 kW, então sabe-se com certeza que a média-alvo será **7,2 kW/gabinete (média ponderada: 0,80×4 + 0,20×20)**. Mesmo com mistura de racks de 4 a 20 kW, a **incerteza é zero** para essa população.
- Se, em vez disso, a fração de gabinetes de 4 kW não é definitivamente 80%, mas está **entre 70% e 90%** (restante a 20 kW), a incerteza passa a ser **±1,6 kW, ou 22%**.

**Procedimento para estabelecer a incerteza:** assumir o data center totalmente populado; tomar as premissas de implantação de TI que levam à **menor** potência média por gabinete e as que levam à **maior**; usar **metade da diferença** entre essas cifras. Como projetar para incerteza tem custo, é boa prática **não** usar premissas de pior caso absoluto de densidade alta ou baixa, mas sim as premissas que estabelecem a faixa de densidade com **80% de confiança**.

### 9.4 Potência de pico por unidade (Peak power per unit)

Quase todo data center tem variação de potência entre gabinetes. É comum encontrar gabinetes operando de **50 watts** (um switch de rede com patch panels) até **30 kW** (blade servers de alto desempenho totalmente carregados) — uma faixa de **60:1** em consumo.

Se o data center precisa lidar com variação entre gabinetes, os sistemas de **distribuição** de potência e refrigeração devem prover os valores de pico dos gabinetes individuais — logo, a distribuição deve ser dimensionada maior do que a média-alvo sugeriria. **Relação estrutural do paper: a potência média-alvo por gabinete dimensiona as capacidades da planta de potência e refrigeração de bloco (bulk power and cooling plant ratings); a potência de pico por gabinete dimensiona as capacidades de distribuição de potência e refrigeração (power and cooling distribution ratings).** Sobredimensionar a distribuição tem custo, mas dá capacidade de lidar com variações.

Quando a razão **pico/média-alvo é 3× ou mais**, pode ser desejável gerenciar o custo tentando reduzir essa razão. Duas técnicas de otimização:

1. **Agrupar gabinetes de potência similar em pods**, definindo pods para densidades diferentes. A média-alvo por gabinete diferirá entre pods, mas a razão pico/média de cada pod cairá.
2. **Controlar por política a potência máxima por gabinete.** Exigir que implantações acima de certa densidade dividam o equipamento entre gabinetes. Ao limitar o pico, não é necessário provisionar distribuição extrema de potência/refrigeração — muito eficaz quando o data center terá pequena fração de gabinetes de blade servers.

O Apêndice 1 fornece valores típicos de pico por aplicação.

### 9.5 Razão de potência gerenciada (Managed power ratio)

As funções de power management dos sistemas de TI modernos fazem a potência média no tempo ser menor que a de plena carga computacional. Para fins de **capacidade**, potência e refrigeração devem ser projetadas para a potência de TI em plena carga computacional. Para **eficiência elétrica**, a potência média é o número mais importante, pois estabelece o nível médio de operação dos sistemas de potência e refrigeração.

- Quanto menor a razão, mais os sistemas operam em condição de carga leve (light load), onde a eficiência é tipicamente reduzida.
- A managed power ratio é de aproximadamente **95%** em data centers típicos hoje, mas é projetada para cair para **entre 40% e 80%** em muitas aplicações nos próximos anos.
- A managed power ratio **não** modifica a área do data center nem as capacidades dos sistemas de bloco ou de distribuição. Porém **impacta fortemente a eficiência ou PUE**, o que deve influenciar a escolha da arquitetura do sistema. Valores baixos sugerem projetos **modulares e escaláveis**, ou com excelente eficiência em carga leve, gerando grande economia de energia no ciclo de vida.
- Uma projeção de eficiência energética modelada/calculada **sem** considerar a managed power ratio resultará em cálculos superotimistas e suspeitos.

---

## 10. Políticas de densidade de TI (IT density policies)

Em muitos casos o operador tem escolhas sobre densidade do gabinete: com rack mount servers, a densidade pode ser limitada deixando espaços vazios no gabinete; o operador pode misturar dispositivos de alta e baixa densidade num gabinete para controlar os watts por gabinete. Essas decisões podem ser do operador ou estar sob controle de usuários/terceiros.

**Todo data center deve ter políticas sobre densidade.** A potência de pico do gabinete não deve ser estabelecida chutando o pior caso de dispositivos futuros, e sim estabelecendo um **limite razoável e forçando as implantações a permanecer dentro dele**. Data centers com ampla faixa projetada de potência por gabinete se beneficiam de limites de potência **por pod**, estabelecendo pods específicos para alta ou baixa densidade e políticas por tipo de pod.

Problema comum em data centers existentes: parte ou a maior parte da implantação está em densidade média ou de pico **além** das capacidades do data center → sobrecargas e superaquecimento conforme as capacidades de distribuição são estressadas, podendo esgotar a capacidade de potência ou refrigeração de bloco. Esses são os casos óbvios. Mas a implantação em **baixa** densidade também é problema, pois pode encalhar capacidade de potência/refrigeração à medida que o data center enche. **Má utilização desnecessária de espaço em U (U space) nos gabinetes é um contribuinte comum para baixa densidade.** Portanto, **tanto a potência mínima quanto a máxima de implantação por gabinete devem ser monitoradas e sujeitas a política.** Uma política exemplo está no Apêndice 2.

---

## 11. Aplicação ao projeto de data center modular (Application to modular data center design)

As técnicas descritas aplicam-se a qualquer projeto único de data center, mas também se prestam à especificação de densidade de **data centers modulares padrão**. Módulos padrão pré-engenheirados ou reference designs de pods, salas e instalações podem e devem ter especificações de densidade nesta abordagem, simplificando bastante o projeto. Para discussão adicional de arquitetura modular, consultar o **White Paper 160, Specification of Modular Data Center Architecture**.

---

## 12. Conclusão (Conclusion)

Quando a densidade de potência de um data center é especificada por um único número (W/ft² ou W/m²), muitas características importantes de desempenho ficam indefinidas, gerando confusão considerável nos processos de especificação, projeto e comissionamento, e deixando os operadores com entendimento limitado das capacidades do data center.

Um data center deve ser especificado de forma que permita considerar as restrições-chave de projeto, fornecendo orientação inequívoca aos engenheiros e contratados que detalham o projeto. A especificação deve prover claramente a informação que os operadores precisam para estabelecer políticas e procedimentos operacionais, e dar-lhes confiança de que o desempenho será previsível.

O paper introduziu uma abordagem lógica e rápida para documentar requisitos de espaço e densidade com detalhe suficiente para assegurar desempenho previsível, não deixado ao acaso. Especificado assim, o data center recebe orientação muito mais completa e clara para o projeto detalhado do que com os métodos históricos. Mesmo data centers com informação incompleta e planos incertos podem usar o método — valores típicos de projeto foram fornecidos para auxiliar. Prevê-se que pods, salas e instalações padronizados, pré-engenheirados e modulares forneçam especificações de densidade por este método, simplificando o projeto de data centers.

---

## 13. Apêndice 1 — Parâmetros típicos de especificação de densidade por aplicação (Appendix 1: Typical density specification parameters by application)

A Tabela A1 fornece valores típicos de ponto de partida para calcular espaço e densidade. Alguns valores não podem ser generalizados porque dependem do projeto ou modelo de negócio e devem ser determinados por projeto específico.

### Tabela A1 — Valores típicos por aplicação

| Parâmetro de especificação | Pequena empresa (Small enterprise) | Grande empresa (Large enterprise) | Colocation | Cloud | HPC |
|---|---|---|---|---|---|
| Número de gabinetes por pod (#) | 4–10 | 10–14 | 6–14 | 10–20 | 10–20 |
| Potência média-alvo por gabinete (kW) — potência de plena carga do gabinete médio | 4 kW | 6 kW | 4 kW | 12 kW | 16 kW |
| Potência de pico por unidade (kW) — potência máxima do gabinete de maior potência | 8 kW | 12 kW | 12 kW | 25 kW | 25 kW |
| Incerteza de potência por unidade (%) — incerteza da estimativa da média-alvo | 50% | 30% | 50% | 30% | 50% |
| Razão de potência gerenciada (%) — média da potência real consumida sobre a potência de plena carga dos gabinetes | 90% | 80% | 90% | 70% | 90% |
| Tipo de espaço reservado para staging | Posições de gabinete (Cabinet Locations) | Posições de pod (Pod Locations) | Posições de pod e sala (Pod & Room Locations) | Posições de pod e sala | Posições de pod e sala |
| Quantidade de espaço reservado para staging | 5–10% do total de gabinetes | 1 pod por sala | Depende do modelo de negócio | 1 pod por sala | 1 pod por sala |
| Espaço reservado para potência e refrigeração | Dependente do projeto (Design dependent) | Dependente do projeto | Dependente do projeto | Dependente do projeto | Dependente do projeto |
| Espaço reservado para sistemas auxiliares (ancillary systems) | 5% da sala | 5% da sala | 10% da sala | 5% da sala | 5% da sala |
| Espaço reservado para armazenamento (storage) | 10% da sala | 5% da sala | nenhum | nenhum | nenhum |
| Espaço reservado para egress, rampas e colunas | 50% da sala | 30% da sala | Dependente do projeto | 20% da sala | 20% da sala |

---

## 14. Apêndice 2 — Exemplo de declaração de política de densidade (Appendix 2: Sample density policy statement)

Para assegurar desempenho previsível e confiável do data center, as seguintes políticas orientam a instalação de equipamentos de TI (o paper apresenta o texto como modelo, com valores "xx" a preencher):

**POLÍTICA DE DENSIDADE (DENSITY POLICY)**

- Este pod é projetado para uma potência média por gabinete de xx kW e um pico de xx kW.
- **Todas as posições U de todos os rack enclosures devem estar ocupadas com equipamento de TI ou painel de fechamento (blanking panel)**, para maximizar a eficiência e reduzir pontos quentes (hot spots).
- Gabinetes individuais não podem ser configurados acima da capacidade de pico, porque a distribuição de potência não é dimensionada para cargas maiores que o pico, e o gabinete pode não receber fluxo de ar adequado. Se um gabinete excede o limite de pico, aplica-se uma das opções:
  - Remover algumas cargas de TI e espalhá-las para outros gabinetes disponíveis que não estejam no limite;
  - Solicitar uma acomodação especial ao departamento de engenharia do data center, o que pode exigir re-cabeamento e/ou limitações no uso de gabinetes adjacentes;
  - Encontrar ou comissionar um pod alternativo com maior capacidade de pico por gabinete.
- Se gabinetes forem configurados com dispositivos de baixa densidade (patch panels, switches, storage ou outros de baixa potência), procurar garantir que a potência média por gabinete no pod se mantenha próxima da capacidade média. Instalação excessiva de equipamento de baixa densidade pode resultar em capacidade de potência e refrigeração encalhada e inutilizável. Se a potência média está abaixo da capacidade do pod, recomenda-se uma das ações:
  - Revisar a montagem física dos dispositivos para garantir arranjo que minimize espaço U não usado;
  - Considerar montagem traseira (rear mounting) de alguns dispositivos de baixa densidade para reduzir uso de espaço U;
  - Usar patch panels de maior densidade, se viável.
- Para determinar o consumo de potência de gabinetes existentes, de equipamento em mãos destinado à instalação, ou de equipamento proposto, consultar o departamento de engenharia do data center.

---

## 15. Figuras — descrição

| Figura | Descrição |
|---|---|
| **Figura 1** | Gráfico "Variation of effective cost as the actual power density varies from the design density of 5 kW/cabinet": custo efetivo do data center ($ por watt de TI utilizável) no eixo Y versus densidade média real de potência (kW/gabinete) no eixo X, com duas curvas — Tier 2 (inferior, custo menor) e Tier 4 (superior). Ambas têm mínimo na densidade de projeto (5 kW/gabinete); à esquerda ("Space all used / Power and cooling stranded") o custo sobe rapidamente; à direita ("Power and cooling all used / Space underutilized") sobe levemente. |
| **Figura 2** | Planilha (worksheet) que organiza os parâmetros-chave para estabelecer especificações de espaço e densidade da sala de servidores de 40 kW: três blocos — Density Parameters (entradas em amarelo), Space Use Parameters (reservas em posições de gabinete ou ft², com subtotal 417 ft²) e Room Performance Summary (valores calculados). Transcrita integralmente na seção 7.1. |
| **Figura 3** | Planilha exemplo para o data center de 2 MW: três colunas de entrada (salas na instalação, pods na sala, gabinetes no pod) com Density Parameters, Space Use Parameters e Performance Summary por nível hierárquico. Transcrita integralmente na seção 7.2. |

---

## 16. Fórmulas e relações quantitativas explícitas do paper

Todas com unidades; derivadas diretamente do texto e das planilhas.

### Definições e conversões
1. **Densidade de projeto (design density)** = capacidade em watts [W] ÷ espaço [gabinetes ou ft²] — assumindo potência, refrigeração e espaço construídos à capacidade máxima de projeto.
2. **Equivalências de densidade citadas:**
   - 120 W/ft² = 1.292 W/m² ≈ **3 a 5 kW/gabinete** (dependendo do espaço consumido por gabinete; valor médio 4 kW/gabinete);
   - 5 kW/gabinete ≈ **160 W/ft² (1.722 W/m²)**;
   - 100 W/ft² = 1.076 W/m² ≈ **3 kW/gabinete**;
   - 1.000 W/ft² = **10.764 W/m²**;
   - Conversão implícita usada no paper: 1 W/ft² ≈ 10,764 W/m².
3. **Custo relativo por densidade:** data center de 1.000 W/ft² custa ≈ **8×** o de 100 W/ft², por unidade de área de piso [$ / ft²].
4. **PUE de operação subutilizada:** data center de 1.000 W/ft² operando a 100 W/ft² → PUE provável na faixa de **3–5**.

### Relações estruturais de dimensionamento
5. **Potência média-alvo (design target average power) [kW/unidade]** → dimensiona planta de bloco (bulk power and cooling plant).
6. **Potência de pico (peak power) [kW/unidade]** → dimensiona distribuição de potência e refrigeração (power and cooling distribution).
7. **Managed power ratio [%]** → define ponto de operação para cálculos de eficiência/PUE (não altera área nem ratings).
8. **Unit power uncertainty [%]** → dimensiona o espaço reservado contra encalhe (stranding) de capacidade.

### Fórmulas das planilhas (verificáveis nos exemplos)
9. **Potência nominal do sistema [kW]** = nº de unidades × potência média-alvo por unidade. Ex. 1: 12 × 4 kW = **48 kW**. Ex. 2: 4 × 500 kW = **2.000 kW** (facility); 10 × 50 kW = 500 kW (sala); 10 × 5 kW = 50 kW (pod).
10. **Potência de TI operacional esperada [kW]** = potência nominal × managed power ratio. Ex. 1: 48 × 70% = **33,6 kW**. Ex. 2: 2.000 × 80% = **1.600 kW**.
11. **Potência média esperada por gabinete [kW]** = média-alvo × managed power ratio. Ex. 1: 4 × 70% = **2,8 kW**. Ex. 2: 5 × 80% = **4 kW**.
12. **Requisito de área de gabinetes [ft²]** = nº de gabinetes × área por gabinete. Ex. 1: 12 × 16 ft² = **192 ft²**. Ex. 2 (pod): 10 × 14 ft² = **140 ft²**. (A área por gabinete inclui o espaço de acesso frontal e traseiro — nota 5.)
13. **Área total [ft²]** = área de gabinetes + Σ (reservas explícitas: staging + incerteza de densidade + potência + refrigeração + auxiliares + storage + egress/rampas/colunas), cada reserva expressa em posições de unidade × área por unidade OU em ft² diretos. Ex. 1: 192+32+32+32+32+32+25+40 = **417 ft²**. Ex. 2: subtotais 280 ft²/pod, 4.480 ft²/sala, 25.320 ft²/facility.
14. **Densidade de potência convencional resultante [W/ft²]** = potência nominal ÷ área total. Ex. 1: 48.000 W ÷ 417 ft² = **115 W/ft²**. Ex. 2: **79 W/ft²** (facility = 2.000.000/25.320), **112 W/ft²** (sala = 500.000/4.480), **179 W/ft²** (pod = 50.000/280). Nota: a densidade em W/ft² **varia conforme o nível hierárquico** considerado — mais uma razão pela qual o número único é ambíguo.
15. **Espaço sugerido para incerteza de densidade [ft²]** — calculado pela planilha a partir da incerteza de potência informada pelo usuário. Ex. 1: incerteza ±15% → sugestão **34 ft²** (usuário reserva 2 posições de gabinete = 32 ft²). Ex. 2: 44 ft²/pod, 324 ft²/sala, 283 ft²/facility (incerteza ±24% no nível do gabinete; níveis superiores são roll-ups).
16. **Incerteza de potência por unidade [% ou kW]** = metade da diferença entre a maior e a menor potência média por gabinete resultantes das premissas de implantação (com o data center totalmente populado), usando faixa com **80% de confiança** (não pior caso absoluto).
17. **Exemplo de média ponderada e incerteza:** 80% de gabinetes a 4 kW + 20% a 20 kW → média certa = **7,2 kW/gabinete**, incerteza **0%**. Se a fração de 4 kW varia entre 70% e 90% → incerteza = **±1,6 kW = 22%**. (Verificação: a 70% → média 8,8 kW; a 90% → média 5,6 kW; metade da diferença = 1,6 kW sobre a média 7,2 kW ≈ 22%.)
18. **Capacidade máxima de gabinetes** (planilha Ex. 2) = gabinetes esperados + posições sobressalentes em todos os níveis: **576/facility, 144/sala, 12/pod** versus requisito esperado de **400/facility, 100/sala, 10/pod**.
19. **Espaço não usado esperado [%]**: Ex. 1: **15%** do espaço total; Ex. 2: **2%** da facility, **13%** da sala, **10%** do pod.
20. **Restrição de pico com média (Ex. 2):** pico permitido por gabinete = 12,5 kW **desde que** Σ potências dos 12 gabinetes do pod ≤ 50 kW. (Ex. 1, nota 4: alguns racks podem estar no pico, mas a soma de todos não pode exceder nº de racks × média-alvo.)

### Faixas e limiares numéricos de orientação
21. Pod mínimo prático: **≥ ~20 kW** → 2–6 gabinetes conforme densidade.
22. Pod máximo: **~24 gabinetes** → 75–500 kW conforme densidade.
23. Pod de **500 kW ≈ 1.000 servidores** (só grandes clouds); pod de **50–100 kW ≈ 100–200 servidores** (mais prático para a maioria).
24. Recomendação de gabinetes por pod: **8 a 24**.
25. Faixa real de potência por gabinete: **2–30 kW**; médias > **12 kW** raras (HPC/cloud denso); uso misto típico: **4–8 kW/gabinete**.
26. Regra de projeção: novo data center de uso misto → média-alvo **≥ 150%** (pelo menos 50% maior) da média atual da organização.
27. Faixa de variação entre gabinetes observada: **50 W a 30 kW = 60:1**.
28. Limiar de otimização: razão pico/média-alvo **≥ 3×** → considerar técnicas de redução (pods por densidade; limite de pico por política).
29. Managed power ratio: **~95%** típico hoje; projeção de **40–80%** para muitas aplicações nos próximos anos.
30. Espaço vs. potência/refrigeração: custo de espaço só se compara ao de potência/refrigeração para densidades **bem abaixo de 1 kW/gabinete** (nota 1).
31. Footprint de pod do Ex. 2: **20 ft × 14 ft (6 m × 4 m)** = 280 ft², para 12 gabinetes de TI + 4 posições de infraestrutura (distribuição elétrica + in-row cooling).

---

## 17. Sobre o autor (About the author)

Neil Rasmussen é Senior VP of Innovation da Schneider Electric; estabelece a direção tecnológica do maior orçamento mundial de P&D dedicado a infraestrutura de potência, refrigeração e racks para redes críticas. Detém 25 patentes relacionadas a infraestrutura de potência e refrigeração de data centers de alta eficiência e alta densidade, e publicou mais de 50 white papers sobre sistemas de potência e refrigeração. É arquiteto principal do sistema APC InfraStruXure. Antes de fundar a APC em 1981, obteve bacharelado e mestrado em engenharia elétrica no MIT, com tese sobre a análise de uma fonte de 200 MW para um reator de fusão tokamak; de 1979 a 1981 trabalhou no MIT Lincoln Laboratories com armazenamento de energia em flywheel e sistemas de energia solar elétrica.

## 18. Recursos (Resources)

- White Paper 142 — *Data Center Projects: System Planning*
- White Paper 160 — *Specification of Modular Data Center Architecture*
- Space & Density Worksheet: Small Server Room Specification (planilha embutida no PDF)
- Space & Density Worksheet: Large Data Center Specification (planilha embutida no PDF)
- whitepapers.apc.com · tools.apc.com (TradeOff Tools™)
