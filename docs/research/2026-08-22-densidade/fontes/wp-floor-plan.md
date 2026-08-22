# Data Center Projects: Establishing a Floor Plan — Extração Estruturada

## 1. Metadados

| Campo | Valor |
|---|---|
| Título | Data Center Projects: Establishing a Floor Plan |
| Código | White Paper 144 (VAVR-6KYMZ7) |
| Revisão | Revision 2 (R2) |
| Autores | Neil Rasmussen e Wendy Torell |
| Editora | Schneider Electric — Data Center Science Center (originalmente APC; "APC white papers are now part of the Schneider Electric white paper library") |
| Contato | DCSC@Schneider-Electric.com |
| Extensão | 21 páginas |
| Papers relacionados | WP 140 (Standardized Process), WP 141 (Project Management), WP 142 (System Planning), WP 143 (Growth Plan), WP 120 (Guidelines for Specification of Data Center Power Density) |

---

## 2. Sumário executivo (Executive summary)

O floor plan afeta fortemente a capacidade de densidade de potência (power density capability) e a eficiência elétrica de um data center. Apesar desse papel crítico no projeto, muitos floor plans são estabelecidos por implantação incremental (incremental deployment), sem um plano central. Uma vez implantado um floor plan ruim, frequentemente é difícil ou impossível recuperar a perda de desempenho resultante. O paper fornece diretrizes estruturadas de floor plan para definir layouts de sala (room layouts) e para estabelecer layouts de equipamentos de TI dentro de salas existentes.

---

## 3. Introdução

Um floor plan de data center inclui o layout dos limites da sala (ou salas) e o layout dos equipamentos de TI dentro dela. A maioria dos usuários não entende quão crítico o layout do piso é para o desempenho do data center — ou só entende depois que um layout ruim comprometeu a implantação. O floor plan determina ou afeta fortemente:

- O número de posições de rack (rack locations) possíveis na sala
- A densidade de potência alcançável (achievable power density)
- A complexidade dos sistemas de distribuição de energia e refrigeração
- A previsibilidade da distribuição de temperatura na sala
- O consumo de energia elétrica do data center

Muitos usuários não percebem esses efeitos durante o planejamento e não estabelecem o layout cedo o suficiente; como resultado, muitos data centers entregam desempenho subótimo desnecessariamente. O propósito do paper é explicar como floor plans afetam essas características e prescrever um método efetivo para desenvolver uma especificação de layout de piso.

### Papel do floor plan na sequência de planejamento do sistema

O floor plan deve ser desenvolvido no ponto correto do processo de projeto. Considerá-lo na fase de projeto detalhado (detailed design) é típico, mas simplesmente **tarde demais**. O floor plan deve fazer parte da **especificação preliminar** e ser determinado ANTES do início do projeto detalhado. O floor plan é criado após o desenvolvimento do conceito de sistema (system concept) e torna-se um input para os requisitos do usuário (Figura 1; a sequência é detalhada no White Paper 142).

Não é necessário que o layout compreenda a localização exata de dispositivos de TI específicos: floor plans efetivos só precisam considerar a localização de racks (ou outros gabinetes) e as densidades-alvo (target power densities). Para a maioria dos usuários é fútil tentar especificar localizações de equipamentos de TI específicos antecipadamente — os racks podem acabar abrigando equipamentos que nem existem no mercado no momento do projeto.

Razões pelas quais o floor plan deve ser considerado cedo (na especificação preliminar):

- **Densidade é melhor especificada no nível de fileira (row level)** — as fileiras precisam ser identificadas antes que uma especificação de densidade possa ser criada (ver WP 120).
- **Planos de faseamento (phasing plans)** são melhor especificados usando fileiras ou grupos de fileiras — as fileiras precisam ser identificadas antes de um plano de faseamento efetivo.
- **O grid do piso elevado (raised floor) e o grid do forro suspenso (suspended ceiling) devem ser alinhados aos racks** — as fileiras precisam ser identificadas antes de posicionar esses grids.
- **Criticidade/disponibilidade** pode (opcionalmente) ser especificada de forma diferente por zonas — as fileiras precisam ser identificadas antes de um plano multi-tier de criticidade.

Densidade e faseamento são parte-chave de qualquer especificação de projeto de data center, e ambos exigem um layout de fileiras. O projeto detalhado só pode começar depois que densidade, faseamento e criticidade forem especificados. **Portanto: o floor plan deve ser estabelecido cedo na fase de especificação, após o SYSTEM CONCEPT, mas bem antes do DETAILED DESIGN.**

---

## 4. Conceitos de floor planning (Floor planning concepts)

Um floor plan tem dois componentes: o **layout estrutural** (structural layout) da sala vazia e o **layout de equipamentos** (equipment layout) do que irá na sala. Em muitos projetos a sala é pré-existente e a única opção é dispor os equipamentos dentro dela. Regra-chave: há uma vantagem potencialmente enorme em eficiência e capacidade de densidade se os planejadores puderem definir os limites da sala desde o início — sempre que possível, deve-se tentar influenciar o layout estrutural usando os princípios do paper.

### Layout estrutural (Structural layout)

Inclui a localização de paredes, portas, colunas de sustentação (support columns), janelas, janelas de observação (viewing windows) e conexões-chave de utilidades. Se a sala tem piso elevado: a altura do piso elevado e a localização de rampas de acesso ou elevadores também fazem parte. Se há piso elevado ou forro suspenso: os pontos de índice (index points) do grid do piso/forro são variáveis críticas de projeto e devem estar no layout estrutural. **Unidade de medida do paper: tiles (placas), onde a largura de um tile = 2 pés (600 mm) = uma largura de rack padrão.**

### Layout de equipamentos (Equipment layout)

Mostra o footprint dos equipamentos de TI e o footprint dos equipamentos de energia e refrigeração. O equipamento de TI geralmente pode ser definido como posições de rack sem se preocupar com os dispositivos específicos, mas equipamentos como bibliotecas de fita (tape libraries) ou grandes servidores enterprise podem ter form factors diferentes de racks típicos e devem ser explicitados. O equipamento de TI deve ser caracterizado pelo seu **caminho de fluxo de ar (airflow path)**: em racks típicos, o fluxo é frente-para-trás (front-to-back), mas alguns dispositivos têm outros padrões, como frente-para-cima (front-to-top). Equipamentos de energia e refrigeração também devem ser contabilizados; muitos dispositivos novos são montáveis em rack ou projetados para integrar fileiras (row-oriented), o que simplifica o layout.

---

## 5. Efeitos do floor plan no desempenho do data center

### Número de posições de rack

O layout pode ter efeito dramático no número de posições de rack possíveis. Em média, o número de posições pode ser estimado dividindo a área da sala por **28 sq ft/rack (2,6 m²/rack)** (fonte: WP 120), mas o número real para um data center específico pode variar muito desse valor típico. O princípio básico do floor planning é **maximizar o número de posições de rack**. Pequenas variações na localização de paredes, dispositivos de TI existentes, ar-condicionados e PDUs (power distribution units) podem ter impacto surpreendentemente grande — efeito amplificado quando altas densidades são requeridas.

### Densidade de potência alcançável

Com certas arquiteturas de refrigeração, um layout ruim pode reduzir a potência permissível de um rack em **mais de 50%**. Usuários podem querer estabelecer zonas de densidades diferentes (density zones), definidas pelo layout de equipamentos — o floor plan é, portanto, ferramenta crítica para descrever e especificar densidade.

### Complexidade dos sistemas de distribuição

Em geral, fileiras mais longas, dispostas nos padrões descritos no paper, simplificam os problemas de distribuição de energia e refrigeração, reduzem custos e aumentam a confiabilidade.

### Previsibilidade do desempenho de refrigeração

É best practice saber antecipadamente qual capacidade de densidade está disponível em cada posição de rack — e não simplesmente implantar equipamento e "torcer pelo melhor" (hope for the best), prática comum. Um floor plan efetivo combinado com tecnologias de refrigeração orientadas a fileira (row-oriented cooling) permite predição simples e confiável da capacidade de refrigeração. Ferramentas como o InfraStruXure Designer automatizam o processo no ciclo de projeto; com layouts padronizados, softwares como o InfraStruXure Manager permitem monitorar capacidades de energia e refrigeração em tempo real.

### Eficiência elétrica

O consumo elétrico do data center é fortemente afetado pelo layout de equipamentos, porque o layout impacta a efetividade do sistema de distribuição de refrigeração — especialmente em técnicas tradicionais de refrigeração perimetral (perimeter cooling). Para uma mesma carga de TI, o layout pode reduzir significativamente o consumo elétrico ao afetar a eficiência do sistema de ar-condicionado:

- O layout afeta a **temperatura de retorno (return temperature) às unidades CRAC** — layout ruim → retorno mais frio → menor eficiência dos CRACs.
- O layout afeta a **temperatura de insuflamento requerida (air delivery temperature)** — layout ruim exige suprimento mais frio para a mesma carga de TI; suprimento mais frio reduz a eficiência dos CRACs e os faz desumidificar o ar, o que aumenta a necessidade de umidificação (que consome energia).
- O layout afeta a **quantidade de vazão de ar dos CRACs gasta em "mistura" (mixing)** do ar da sala para equalizar temperatura — layout ruim exige potência adicional de ventiladores de mistura, reduz eficiência e pode exigir CRACs adicionais, que consomem ainda mais energia.

Estimativa conservadora do paper: **bilhões de kilowatt-horas de eletricidade já foram desperdiçados por floor plans ruins** — perda quase completamente evitável.

---

## 6. Princípios básicos do layout de equipamentos (Basic principles of equipment layout)

O rack como bloco de construção primário permite uma abordagem padronizada. Princípios:

1. Controlar o fluxo de ar usando layout de racks hot-aisle/cold-aisle
2. Prover vias de acesso (access ways) seguras e convenientes
3. Alinhar os sistemas de placas de piso/forro (floor/ceiling tiles) com os equipamentos
4. Minimizar dispositivos de TI isolados e maximizar comprimentos de fileira
5. Planejar o layout completo antecipadamente, mesmo que planos futuros não estejam definidos

### 6.1 Controle de fluxo de ar com hot-aisle/cold-aisle

Método bem conhecido (referências: ASHRAE TC9.9 Mission Critical Facilities, "Thermal Guidelines for Data Processing Environments" 2004; white paper do Uptime Institute "Alternating Cold and Hot Aisles Provides More Reliable Cooling for Server Farms"). Princípio: **maximizar a separação entre o ar de exaustão e o ar de admissão** dos equipamentos de TI, estabelecendo corredores frios (cold aisles) onde só há admissões e corredores quentes (hot aisles) onde só há exaustão quente. Objetivo: reduzir a quantidade de ar quente de exaustão que é puxada de volta para as admissões. As fileiras adjacentes ficam costas com costas (back to back), formando os hot aisles.

Os benefícios tornam-se dramáticos com o aumento da densidade: comparado a arranjos aleatórios ou com todos os racks na mesma direção, o hot-aisle/cold-aisle permite **aumento de densidade de potência de até 100% ou mais, sem hot spots**, se o arranjo apropriado de CRACs for usado. Como todas as arquiteturas de refrigeração (exceto refrigeração totalmente enclausurada baseada em rack — fully enclosed rack-based cooling) se beneficiam dramaticamente, este método é estratégia principal de projeto para qualquer layout.

### 6.2 Vias de acesso seguras e convenientes

É exigência legal, e bom senso, prover vias de acesso apropriadas ao redor dos equipamentos. O sistema hot-aisle/cold-aisle cria corredores naturais bem definidos. É importante identificar e entender o impacto da **localização de colunas**:

- Uma coluna pode consumir **até 3 posições de rack** se cair dentro de uma fileira de racks;
- Pior: pode resultar na **eliminação de uma fileira completa** se obstruir um corredor.

Exemplo quantificado (Figuras 3 e 4; premissas: cold aisles de 4 pés, hot aisles de 3 pés, folga perimetral — perimeter clearance — de 4 pés):

| Cenário | Posições de rack | Observação |
|---|---|---|
| 3A — Sem coluna | 40 | Referência |
| 3B — Coluna alinhada com fileira de racks | 39 | Apenas 1 rack perdido neste exemplo; dependendo do tamanho e posição da coluna na fileira, até 3 posições podem ser eliminadas |
| 4A — Coluna obstrui parcialmente o corredor | 38 | Menor impacto em racks, mas a prática frequentemente não é aceita pelas AHJs (authority having jurisdiction) |
| 4B — Layout hot-aisle/cold-aisle comprometido | 34 | Eliminar racks no meio das fileiras cria ambiente com mistura de ar (air mixing); refrigeração menos previsível — má alternativa |
| 4C — Fileira inteira eliminada (fileiras deslocadas) | 29 | Queda de 40 → 29 = **mais de 25%** de perda |
| 4D — Rotação das fileiras em 90° para alinhar com a coluna | 35 | Mudança do "eixo" (axis) do layout de "east-west" para "north-south"; impacto menor que deslocar fileiras |

Ocasionalmente a coluna no corredor (4A) pode ser aceita como obstrução, se a AHJ local julgar que deslocar fileiras (eliminando posições) é acomodação não razoável segundo as leis de acessibilidade locais (disabilities acts — ex.: ADA nos EUA, DDA no Reino Unido e Austrália). Prática comum: ajustar o layout para colocar colunas **dentro das fileiras**, onde consomem posições de equipamento. Manter colunas fora dos corredores é restrição severa à maximização de posições. O deslocamento de fileiras para acomodar colunas pode causar a perda de uma fileira inteira quando ela fica "presa" (trapped) contra uma parede ou outro obstáculo. **A localização cuidadosa das fileiras em relação às colunas é preocupação primária do floor layout.**

### 6.3 Alinhar as placas de piso e/ou forro com os equipamentos

Em muitos data centers os sistemas de placas de piso e forro são parte do sistema de distribuição de ar. Em data center de piso elevado, é **essencial** que o grid do piso alinhe com os racks — sem alinhamento, o fluxo de ar pode ser significativamente comprometido. Também é benéfico alinhar o grid do forro com o grid do piso. Consequência: **o grid do piso não deve ser projetado ou instalado até que o layout de equipamentos esteja estabelecido**, e o grid deve ser alinhado/indexado ao layout de equipamentos.

Especificadores e projetistas frequentemente perdem essa otimização simples e sem custo. Resultado: (1) grid desalinhado com racks, com redução de eficiência e de capacidade de densidade; ou (2) racks alinhados ao grid, mas com layout subótimo, limitando o número de racks.

### 6.4 Pitch — a medida do espaçamento entre fileiras

O comprimento da fileira é ajustável em incrementos de largura de rack (grande flexibilidade), mas o espaçamento entre corredores tem muito menos flexibilidade e é a **restrição controladora** do layout. A medida do espaçamento fileira-a-fileira chama-se **pitch** (mesmo termo usado para espaçamento centro-a-centro repetitivo de roscas de parafuso, ondas sonoras ou montantes de parede). **O pitch de um layout de fileiras é a distância do meio de um cold aisle ao meio do próximo cold aisle** (mid-cold-aisle to mid-cold-aisle — Figura 5).

Existem **4 pitches padrão** (Figura 6), cada um definido em número de tiles (tile = 2 ft / 600 mm). Em todos os quatro, os racks são alinhados aos tiles nos cold aisles — porque, em ambiente de piso elevado com refrigeração perimetral, **tiles perfurados inteiros (full perforated tiles) são necessários nos cold aisles** para entrega de ar.

| Pitch | Nome | Largura total | Cold aisle | Hot aisle | Quando usar (Figura 7) |
|---|---|---|---|---|---|
| A | Compact (compacto) | 7 tiles (14 ft) | 4 ft | 3 ft | Geometria mais compacta do par de fileiras; "building block" mais comum de layouts |
| B | Wide cold-aisle (cold aisle largo) | 8 tiles (16 ft) | 6 ft | 3 ft | Piso elevado + alta densidade sem contenção; provê **50% mais capacidade de refrigeração pelo piso elevado** no cold aisle (tiles perfurados duplos) |
| C | Wide hot-aisle (hot aisle largo) | 8 tiles (16 ft) | 4 ft | 5 ft | Acessórios de refrigeração na traseira dos racks (plenums de refrigeração fixados atrás) |
| D | Wide hot & cold aisle (ambos largos) | 9 tiles (18 ft) | 6 ft | 5 ft | Combinação das necessidades de B e C |

Lógica do fluxograma de seleção (Figura 7): parte-se de "o data center terá piso elevado?"; depois, "o conceito de projeto requer acessórios de refrigeração na traseira dos racks?"; "suporta aplicações de alta densidade?"; "usa contenção de rack (rack containment)?"; "usa refrigeração in-row com contenção de hot aisle (hot aisle containment)?"; "requer tiles perfurados duplos (double perforated tiles) para densidade maior?". As respostas encaminham para A, B, C ou D.

#### Espaçamento especial para pisos rígidos (hard floor)

Pitches não padronizados, incrementalmente menores que os 4 padrão, podem ser vantajosos em instalações com piso rígido (não elevado) — a restrição de alinhar racks a tiles para entrega de ar desaparece. Exemplo do paper: cenário de alta densidade onde acessórios de refrigeração traseiros aumentam a profundidade do rack de **42 polegadas para 50 polegadas**; usando o espaçamento mínimo (hot aisle de 3 ft, cold aisle de 4 ft), o menor pitch permitido seria **15 pés e 4 polegadas** (acréscimo de 8 polegadas × 2 fileiras de racks). Quando um layout em piso rígido com os 4 pitches padrão é problema — i.e., você perde uma fileira adicional por uns poucos pés ou menos — o pitch pode ser comprimido, **desde que os corredores mantenham o mínimo de 3 ft (hot aisle) e 4 ft (cold aisle)**.

Um floor plan efetivo deve ser implantado em **pares de fileiras (row pairs)** usando os pitches básicos, embora barreiras e restrições possam interferir no layout ótimo.

### 6.5 Minimizar dispositivos isolados e maximizar comprimentos de fileira

O controle de fluxo de ar por separação quente/frio é comprometido na **extremidade da fileira (row end)**, onde o ar quente pode contornar a lateral do rack de ponta e retornar às admissões. O ideal teórico seria não ter extremidades — fileiras de comprimento infinito; o pior caso são fileiras de 1 rack — racks isolados. Além disso, a implementação efetiva de **redundância** melhora com fileiras mais longas. Objetivo: maximizar comprimento de fileira de forma consistente com vias de acesso seguras e convenientes. **Evitar fileiras curtas de 1–3 racks.**

#### Considerações especiais para racks largos (wide racks)

Racks de largura padrão (2 ft / 600 mm) alinham convenientemente com a largura dos tiles do piso elevado. Quando cabos sob o piso precisam chegar ao rack, abre-se um furo no tile diretamente abaixo; se o rack for realocado/removido, basta trocar o tile. Racks largos que não alinham com o tile padrão criam novo desafio: podem ocupar **2 ou até 3 tiles** — ao remover o rack, o tile não pode ser simplesmente trocado, pois fica parcialmente sob o rack vizinho. Esses problemas podem ser evitados por completo com **distribuição aérea (overhead) de energia e dados**.

### 6.6 Planejar o layout completo do piso antecipadamente

A primeira fase de implantação frequentemente restringe as implantações posteriores. Por isso é essencial planejar o layout completo antecipadamente.

---

## 7. Princípios básicos de layout estrutural da sala (Basic principles of structural room layouts)

Muitos data centers são fit-outs de espaço existente (layout estrutural fixo, não especificável). Em alguns casos, realocação de paredes é possível; em construção nova, há opções consideráveis. **Princípio básico e geralmente não apreciado: a capacidade de posicionar paredes pode melhorar muito o desempenho do data center.** Quando possível, os limites da sala devem ser escolhidos com base nos princípios desta seção (leitores sem flexibilidade de layout de sala podem pular a seção).

### 7.1 Dimensões padronizadas de sala (Standardized room dimensions)

Há dimensões preferidas de sala, baseadas no pitch escolhido. Para uma sala retangular, livre de restrições de colunas:

- **Uma dimensão da sala deve ser um múltiplo do pitch hot-aisle/cold-aisle, mais um espaçamento de via de acesso periférica de aproximadamente 2–4 tiles.**
- **A outra dimensão é flexível e impactará o comprimento das fileiras de racks.**

Quando uma das dimensões não é ótima, o desempenho da sala pode ser dramaticamente reduzido, particularmente em salas menores. Problema óbvio: menos racks que o esperado (espaço inutilizável). Problema menos óbvio: quando o layout ideal não pode ser alcançado, **densidade de potência e eficiência elétrica são reduzidas**.

Exemplo (Figura 8): sala com comprimento fixo de **28 pés** e largura variável → fileiras de **10 racks**, com **2 tiles (4 pés)** em cada extremidade de fileira para folga de acesso. O número de racks instaláveis **salta em certas dimensões** conforme novas fileiras cabem na sala (20 → 30 → 40 → 50 → 60 racks no exemplo). Certos números de racks são preferidos porque o **número par de fileiras** permite instalar um par hot-aisle/cold-aisle completo adicional. As larguras preferidas são indicadas para o pitch usado (pitch A, o mais compacto, no exemplo) e folgas perimetrais de 2 tiles.

### 7.2 Localização de colunas no layout dos limites da sala

Diretrizes quando há opção de localizar os limites da sala:

- Para **salas menores**: arranjar os limites, se possível, de modo que **nenhuma coluna fique na área de equipamentos**.
- **Salas devem ser retangulares** sempre que possível. Formatos incomuns, nichos e ângulos frequentemente não podem ser utilizados efetivamente e/ou criam redução de densidade de potência ou eficiência elétrica.
- Quando **colunas são inevitáveis mas os limites são flexíveis**: fazer o floor plan **como se não existissem colunas**, com base nas dimensões padronizadas e no(s) pitch(es) requerido(s); então **localizar as colunas diretamente sobre uma posição de rack específica, preferencialmente na extremidade de uma fileira (row end)**.
- Para **salas muito grandes**: a localização das paredes em relação às colunas é tipicamente inflexível.

Quando uma coluna fica sobre uma posição de rack, é importante **bloquear quaisquer aberturas entre a(s) coluna(s) e os racks vizinhos** com painel de fechamento (filler panel); sem isso, ocorre mistura das correntes de ar quente e frio e o desempenho de refrigeração é comprometido.

### 7.3 Implantações faseadas (Phased deployments)

Duas estratégias podem ser benéficas: **criar partições de área (area partitions)** e **layout antecipado de fileiras futuras (advance layout of future rows)**.

Quando uma fase futura tem incerteza muito grande, partições ou paredes que subdividem o data center em duas ou mais salas podem ser usadas. Benefícios:

- Capacidade de re-propositar (re-purpose) áreas no futuro
- Capacidade de realizar modificações radicais de infraestrutura em uma área sem interferir na operação de outra
- Capacidade de adiar a instalação de infraestrutura básica (tubulação, fiação) para data futura

O advento de arquiteturas modulares de energia e refrigeração orientadas a fileira reduziu a necessidade de modificações radicais em novas implantações e reduziu muito o custo/incerteza da infraestrutura-base de fiação e tubulação — logo, a necessidade imperiosa de particionar data centers foi dramaticamente reduzida. Ainda assim, manter opções como re-propositação futura é valioso para alguns usuários. **Chave do particionamento bem-sucedido: partições NUNCA devem ser posicionadas arbitrariamente sem antes realizar uma análise de cenários de layout de equipamentos** — o layout pode ser seriamente comprometido por má escolha da posição da partição.

Ao definir partições/paredes internas, aplicar os mesmos princípios usados nos limites perimetrais da sala. O espaçamento padrão de fileiras deve ser considerado. Exemplo de falha (Figura 9): um pequeno **deslocamento de parede (wall offset)** causou a perda da fileira 5 de um layout de 8 fileiras — **10 racks de um layout de 80 racks, ou 12% do total** — porque o espaçamento parede-a-parede não permite vias de acesso apropriadas com a fileira 5 incluída. Além disso, a via de acesso entre a fileira 6 e a parede tornou-se um **hot aisle**, o que reduz o efeito de confinamento do projeto hot-aisle/cold-aisle, resulta em **capacidade de potência reduzida para a fileira 6** e cria zona desconfortável para o pessoal (o caminho de acesso primário virou corredor quente).

---

## 8. Sequência de floor planning (Floor planning sequence) — método passo a passo

Usando o rack como bloco básico e o pitch do par de fileiras como template de espaçamento, partindo de um diagrama de planta da sala:

### Passo 1 — Identificar e localizar as restrições da sala

- **Colunas** — verificar as dimensões exatas as-built
- **Portas (doorways)**
- **Equipamentos fixos existentes** — painéis de disjuntores (breaker panels), conexões de tubulação, equipamentos de supressão de incêndio, equipamentos de refrigeração

### Passo 2 — Estabelecer opções-chave no nível da sala

- Identificar equipamentos adicionais (além do equipamento de TI ou de energia/refrigeração in-row) que serão colocados na sala: refrigeração adicional, supressão de incêndio, equipamentos de energia, estações de trabalho de usuários
- Se a sala usa piso elevado: determinar o(s) comprimento(s) da(s) rampa(s) de acesso e identificar todas as opções de localização das rampas

É crítico nesta etapa saber se a instalação terá piso elevado. **Muitos data centers novos de alta densidade não usam piso elevado — o piso elevado não deve ser assumido automaticamente.** Às vezes é até apropriado remover um piso elevado de um site existente para novas implantações.

### Passo 3 — Estabelecer o eixo primário do layout de TI (primary IT equipment layout axis)

Toda sala tem **dois eixos primários de layout** (direções de orientação das fileiras). A seleção do eixo é uma das decisões mais críticas do plano e tem grande impacto no desempenho e na economia. Usando o arranjo em pares hot-aisle/cold-aisle no pitch necessário/preferido, **testar os dois layouts de orientação** para verificar se algum tem vantagem óbvia. Nos layouts de teste, garantir que:

- Colunas não fiquem nas vias de acesso principais
- (Se não houver piso elevado) fileiras alinhadas ao grid do forro, de modo que os cold aisles contenham tiles completos
- Haja folga suficiente nas extremidades de fileiras e entre fileiras e paredes
- Haja folga/acesso suficiente ao redor de qualquer equipamento fixo
- Rampas de acesso, se requeridas, estejam presentes e otimamente localizadas
- Quaisquer áreas abertas ou de outro propósito **enfrentem um cold aisle, não um hot aisle**
- Tenham sido encontradas localizações para todos os equipamentos adicionais identificados no Passo 2
- Fileiras separadas por uma via de acesso **não invertam a direção que enfrentam**
- **Todas as fileiras alinhem com o mesmo eixo** (todas paralelas; nenhuma perpendicular)
- **A sala inteira seja disposta no floor plan**, mesmo sem planos imediatos para implantar algumas seções

Fatores para decidir o layout preferido:

- Qual eixo mantém mais efetivamente as colunas fora das vias de acesso principais?
- Qual eixo permite mais racks?
- Qual eixo funciona melhor com o pitch hot-aisle/cold-aisle preferido?
- Qual eixo fecha pares hot-aisle/cold-aisle sem terminar com número ímpar de fileiras?
- Qual eixo tem menos fileiras curtas ou racks isolados?
- Qual layout provê a estética desejada para visualização ou tours, se isso for consideração?

Usuários diferentes ponderam esses critérios diferentemente. É comum escolher o eixo por estética sem considerar o desempenho — e depois se arrepender. **Método preferido: testar os dois eixos durante o planejamento e decidir com entendimento das consequências.**

### Passo 4 — Definir os limites das fileiras (row boundaries)

A seleção do eixo tipicamente já estabelece as localizações das fileiras com precisão. Estabelecer e validar os limites: extremidades de fileira e limites entre frentes/traseiras de fileiras versus outros equipamentos, colunas ou paredes. Diretrizes de acesso entre extremidades de fileira e obstruções:

- Para **paredes lisas (plain walls)**: mínimo de **2 tiles** é espaçamento aceitável de extremidade de fileira; data centers maiores frequentemente preferem **3 tiles** para melhor acessibilidade.
- Pode-se desejar terminar uma fileira **encostada na parede**; porém isso cria um **beco sem saída (dead-end alleyway)** que pode limitar o comprimento da fileira por exigências de código (code requirements).
- Para **fileiras longas com mais de 10 racks**, regulações locais podem exigir **quebras (breaks)** nas fileiras para passagem de pessoal — também preocupação prática para técnicos que precisam de acesso aos dois lados de um rack sem longa caminhada.
- O espaçamento entre a frente da fileira (cold aisle) ou a traseira (hot aisle) e outros equipamentos deve ser verificado para garantir vias de acesso suficientes e acesso para serviço/regulação conforme código.
- Verificar que qualquer outro equipamento posicionado no floor plan não esteja restringido por tubulação, conduítes ou restrições de acesso.

Essas restrições e limites devem ser **marcados no layout da sala antes** de confirmar a seleção de eixo e o layout de fileiras.

Para data centers pequenos (até 2 fileiras de racks), o processo pode ocorrer como estudo em papel (paper study). Com o crescimento da sala, ferramentas assistidas por computador (que garantem escala consistente) tornam-se necessárias. Idealmente, o layout de fileiras e as áreas de limite também devem ser **demarcados com fita adesiva colorida (colored masking tape) na instalação real** — passo bastante factível em fit-outs menores e retrofits, que frequentemente identifica restrições-surpresa não percebidas nos planos conceituais.

### Passo 5 — Especificar densidade por fileira/gabinete (row/cabinet density)

Com limites de fileiras e orientação do eixo estabelecidos, o layout de gabinetes pode ser realizado. Começa com o particionamento das fileiras por fase de buildout. Para cada fase, podem existir múltiplas zonas/áreas, cada uma com requisito único de densidade. O WP 120 fornece regras para o nível preferido e mais custo-efetivo de definição de requisitos de densidade e o incremento preferido de implantação.

### Passo 6 — Identificar pontos de índice (index points) — para sala nova

Se o data center tem piso elevado pré-existente, a localização do grid em relação à parede já está estabelecida (comprehendida em passo anterior). Para **salas novas**, a localização do grid do piso elevado é **controlada pelo floor layout**: um ponto de índice para o grid deve ser estabelecido no plano e **clara e permanentemente marcado na sala**. É **absolutamente essencial que o instalador do piso elevado alinhe o grid ao ponto de índice** — se não for feito, pode ser impossível deslocar o layout depois para alinhar ao grid devido às restrições de limites. Em projeto com piso elevado, isso pode resultar em **perda massiva de capacidade de densidade de potência e redução dramática de eficiência energética** — erro completamente evitável e "terrível", cometido comumente. Data centers com piso rígido não têm essa preocupação. Se houver forro suspenso para iluminação e/ou retorno de ar, alinhar o ponto de índice ao grid do forro também é altamente recomendado, embora menos crítico que o alinhamento com o grid do piso.

### Passo 7 — Minimizar dispositivos isolados e maximizar comprimentos de fileira

Quando comprimentos de fileira são de **3 racks ou menos**, a efetividade da distribuição de refrigeração é impactada — fileiras curtas significam mais oportunidade de mistura das correntes quente e fria. Por isso, **quando salas têm uma dimensão menor que 15–20 pés, é mais efetivo (em refrigeração) ter uma fileira longa do que várias fileiras muito curtas.**

### Passo 8 — Especificar o floor layout

Passo final: especificar o floor layout para as fases subsequentes de projeto e instalação. A especificação é documentada como **diagrama detalhado do layout do piso**, incluindo: todas as medidas da sala e obstruções, todas as posições de rack identificadas, todas as áreas inutilizáveis marcadas, e equipamentos de TI não baseados em rack (que requerem energia e refrigeração) anotados. Idealmente criado em ferramenta assistida por computador (ex.: InfraStruXure Designer), que subsequentemente permite o projeto completo da infraestrutura física até o nível do rack.

---

## 9. Erros comuns (Common errors)

### 9.1 Falha em planejar o layout inteiro antecipadamente

A maioria dos data centers começa a implantar equipamentos sem plano completo de implantação. Conforme a implantação se expande, emergem restrições severas:

- Grupos de equipamentos crescem um em direção ao outro e acabam frente-quente-com-frente-fria (hot-to-cold) em vez de hot-to-hot, com hot spots e perda de capacidade de densidade
- Implantações crescem em direção a uma parede e descobre-se que a última fileira não cabe — mas caberia se o layout tivesse sido planejado
- As fileiras têm certa orientação de eixo, e depois se determina que muito mais equipamento caberia se as fileiras estivessem giradas 90° — e é tarde demais para mudar
- Implantações crescem em direção a uma coluna, e descobre-se que a coluna cai numa via de acesso, limitando a implantação — mais equipamento caberia com planejamento antecipado
- Implantações "derivam" (drift) do espaçamento padrão dos tiles do piso e implantações posteriores de alta densidade ficam presas sem tiles completos nos cold aisles, com perda de capacidade de densidade

A maioria dos data centers existentes tem um ou mais desses problemas. Em data centers típicos rotineiramente observados: **perda de posições de rack da ordem de 10–20% do total** e **perda de capacidade de densidade de potência comumente de 20% ou mais**. Perdas desnecessárias que representam prejuízos financeiros substanciais, evitáveis com planejamento simples.

### 9.2 Risco de ignorar colunas de sustentação no planejamento

As colunas devem ser **exatamente localizadas** em qualquer floor plan para evitar surpresas. Agravante: muitos desenhos de edifício (building drawings) **não mostram as dimensões corretas das colunas** — colunas reais frequentemente são construídas maiores que as dimensões originais, durante ou após a construção, para acomodar shafts de fios ou tubulação (wire or piping chases). Portanto, é essencial **verificar as dimensões reais das colunas por medição direta**, sem confiar nos desenhos arquitetônicos.

### 9.3 Adicionar partições sem estudar o efeito no layout de equipamentos

Muitos data centers são particionados (inclusive por faseamento), frequentemente com partições adicionadas tarde no processo e sem reflexão. Localizar partições para maximizar o desempenho é uma ciência que requer consideração e planejamento. **Colunas são um problema tão grande que frequentemente a melhor estratégia é posicionar a partição alinhada com o maior número possível de colunas.** Usar a orientação da seção "Phased deployments" evita que uma partição cause a perda de uma fileira inteira de equipamentos.

---

## 10. Figuras (descrições)

- **Figura 1 — O floor plan na sequência de planejamento do sistema.** Diagrama de sequência mostrando que o floor plan é criado após o desenvolvimento do system concept e torna-se input para os requisitos do usuário (user requirements), antes do detailed design. Ilustra a regra "especificação preliminar, não projeto detalhado" (referência: WP 142).
- **Figura 2 — Layout básico hot-aisle/cold-aisle.** Planta esquemática com fileiras de racks alternando cold aisles e hot aisles, com folga perimetral (perimeter clearance); fileiras adjacentes ficam costas com costas formando os hot aisles. Ilustra o princípio de separar exaustão e admissão de ar.
- **Figura 3 (3A/3B) — Impacto de colunas quando a coluna alinha com a fileira.** 3A: sala-exemplo sem colunas com 40 posições de rack (premissas: cold aisle 4 ft, hot aisle 3 ft, perímetro 4 ft). 3B: coluna alinhada com fileira de racks elimina 1 posição (39) — até 3 dependendo do tamanho/posição da coluna.
- **Figura 4 (4A–4D) — Impacto de colunas quando a coluna alinha com o corredor.** 4A: coluna obstruindo parcialmente o corredor (38 racks; menor impacto, mas frequentemente rejeitado pela AHJ). 4B: layout hot-aisle/cold-aisle comprometido (34 racks; cria mistura de ar). 4C: deslocamento de fileiras elimina fileira inteira (29 racks; queda >25%). 4D: rotação do eixo em 90° (35 racks; melhor alternativa que deslocar).
- **Figura 5 — Pitch de um layout de fileiras.** Esquema mostrando a definição de pitch como a distância do meio de um cold aisle ao meio do próximo cold aisle, através do par de fileiras e do hot aisle.
- **Figura 6 — Os quatro pitches padrão de layouts de fileiras.** Plantas dos pitches A (7 tiles), B (8 tiles), C (8 tiles) e D (9 tiles), mostrando que em todos os racks alinham com tiles inteiros nos cold aisles (para tiles perfurados de entrega de ar).
- **Figura 7 — Escolhendo o pitch fileira-a-fileira apropriado.** Fluxograma de decisão: piso elevado? → acessórios de refrigeração na traseira dos racks? → alta densidade? → rack containment? → in-row cooling com hot aisle containment? → tiles perfurados duplos? Conduz a Pitch A (COMPACT, 14 ft), B (WIDE COLD AISLE, 16 ft), C (WIDE HOT AISLE, 16 ft) ou D (WIDE HOT & COLD AISLE, 18 ft), com as larguras de corredor de cada um.
- **Figura 8 — Impacto da dimensão da sala no número de fileiras.** Série de plantas (20, 30, 40, 50, 60 racks) para sala de comprimento fixo de 28 ft e largura variável; mostra que o número de racks instaláveis salta em certas larguras conforme novas fileiras cabem, e que números pares de fileiras (pares hot/cold completos) são preferidos; setas indicam as larguras preferidas para pitch A e perímetro de 2 tiles.
- **Figura 9 — Impacto do posicionamento de partição no número de posições de rack.** Dois cenários de uma sala com 8 fileiras: no cenário inferior, um pequeno wall offset elimina a fileira 5 (10 racks de 80 = 12%) e transforma a via de acesso junto à fileira 6 em hot aisle, reduzindo a capacidade de potência da fileira 6.

*(Nota de fidelidade: o paper não contém elementos numerados como "Table"; os dados tabulares deste documento — cenários das Figuras 3/4 e os 4 pitches das Figuras 6/7 — foram transcritos das figuras e do texto para formato de tabela markdown.)*

---

## 11. Fórmulas e regras quantitativas (lista explícita)

1. **Tile padrão:** 1 tile = 2 ft (600 mm) = 1 largura de rack padrão.
2. **Estimativa de posições de rack:** nº de racks ≈ área da sala ÷ 28 sq ft/rack (2,6 m²/rack) — valor médio; o real varia muito.
3. **Perda de densidade por layout ruim:** com certas arquiteturas de refrigeração, um layout ruim pode reduzir a potência permissível por rack em >50%.
4. **Ganho do hot-aisle/cold-aisle:** aumento de densidade de potência de até 100% ou mais, sem hot spots, versus arranjos aleatórios ou unidirecionais (com arranjo apropriado de CRACs).
5. **Coluna dentro de fileira:** consome até 3 posições de rack; coluna em corredor pode eliminar uma fileira inteira.
6. **Exemplo Figuras 3/4** (premissas: cold aisle 4 ft, hot aisle 3 ft, perímetro 4 ft): 40 racks (sem coluna) → 39 (coluna na fileira) → 38 (coluna no corredor) → 34 (hot/cold aisle comprometido) → 29 (fileira eliminada; perda >25%) → 35 (eixo girado 90°).
7. **Pitch = distância mid-cold-aisle a mid-cold-aisle.**
8. **Pitch A (Compact):** 7 tiles = 14 ft; cold aisle 4 ft; hot aisle 3 ft.
9. **Pitch B (Wide cold-aisle):** 8 tiles = 16 ft; cold aisle 6 ft; hot aisle 3 ft; provê 50% mais capacidade de refrigeração pelo piso elevado no cold aisle.
10. **Pitch C (Wide hot-aisle):** 8 tiles = 16 ft; cold aisle 4 ft; hot aisle 5 ft.
11. **Pitch D (Wide hot & cold aisle):** 9 tiles = 18 ft; cold aisle 6 ft; hot aisle 5 ft.
12. **Larguras mínimas de corredor:** 3 ft para hot aisle e 4 ft para cold aisle (limite para compressão de pitch em piso rígido).
13. **Exemplo de pitch comprimido (hard floor):** racks com profundidade aumentada de 42 in para 50 in → menor pitch permitido = 15 ft 4 in (aumento de 8 in × 2 fileiras sobre o mínimo).
14. **Regra de dimensão de sala:** uma dimensão = múltiplo do pitch + folga periférica de ~2–4 tiles; a outra dimensão é flexível (define o comprimento das fileiras).
15. **Exemplo Figura 8:** sala de 28 ft de comprimento → fileiras de 10 racks, com 2 tiles (4 ft) de folga de acesso em cada extremidade de fileira; racks instaláveis saltam em degraus (20/30/40/50/60) conforme a largura; número par de fileiras é preferido (fecha par hot/cold).
16. **Folga em extremidade de fileira:** mínimo 2 tiles contra parede lisa; 3 tiles preferido em data centers maiores.
17. **Quebras em fileiras longas:** fileiras com mais de 10 racks podem exigir quebras para passagem de pessoal (regulação local).
18. **Fileiras curtas:** evitar fileiras de 1–3 racks (comprometem a separação de ar); com 3 racks ou menos, a efetividade da refrigeração é impactada.
19. **Sala estreita:** se uma dimensão da sala é < 15–20 ft, uma fileira longa é melhor (em refrigeração) que várias fileiras curtas.
20. **Racks largos:** podem ocupar 2 ou até 3 tiles (problema de substituição de tiles; evitável com distribuição overhead).
21. **Perdas típicas observadas por falta de planejamento:** 10–20% das posições de rack e 20% ou mais de capacidade de densidade de potência.
22. **Exemplo Figura 9 (partição mal posicionada):** perda de 10 racks em 80 = 12% do total, além de degradar a fileira adjacente (acesso vira hot aisle).
23. **Escopo de estudo em papel:** até 2 fileiras de racks; acima disso, ferramentas assistidas por computador com escala consistente.

---

## 12. Conclusão do paper

O floor layout é etapa crítica do processo de projeto para data centers grandes e pequenos. Quando floor plans não são considerados cedo no planejamento, o resultado pode ser comprometimentos **irreversíveis** ao desempenho final — incluindo redução da capacidade de equipamentos de TI, redução da capacidade de densidade de potência e aumento das contas de energia elétrica.

Muitos usuários assumem que não podem criar um floor plan cedo porque não sabem exatamente quais dispositivos de TI serão implantados. O paper mostra que **não é necessário identificar dispositivos de TI específicos antecipadamente** para a maioria dos projetos, porque a maior parte do benefício do floor planning é independente dos dispositivos específicos implantados.

Um floor plan adequado é a **fundação necessária de um plano efetivo de densidade e faseamento**. De fato, planos de densidade e faseamento sem um floor plan são tecnicamente ambíguos e incompletos. Ao incorporar o floor planning em uma metodologia de projeto padronizada, o projeto de data centers pode se tornar automatizado e previsível.

---

## Sobre os autores (conforme o paper)

- **Neil Rasmussen** — Senior VP of Innovation da Schneider Electric; define a direção tecnológica do maior orçamento mundial de P&D dedicado a infraestrutura de energia, refrigeração e racks para redes críticas. Detém 19 patentes; publicou mais de 50 white papers; arquiteto principal do sistema APC InfraStruXure. Fundou a APC em 1981; bacharel e mestre em engenharia elétrica pelo MIT (tese sobre análise de uma fonte de 200 MW para reator de fusão tokamak); trabalhou no MIT Lincoln Laboratories (1979–1981) com armazenamento de energia em flywheel e sistemas solares.
- **Wendy Torell** — Strategic Research Analyst na Schneider Electric (West Kingston, RI); consultora em abordagens de ciência de disponibilidade e práticas de projeto. Bacharel em Engenharia Mecânica (Union College, Schenectady, NY), MBA (University of Rhode Island); ASQ Certified Reliability Engineer.

---

*Fonte: extração fiel do PDF "Establishing a Floor Plan VAVR-6KYMZ7_R2_EN.pdf" (White Paper 144 Rev 2, Schneider Electric Data Center Science Center). Regra No-Invention aplicada: todo o conteúdo acima provém exclusivamente do paper.*
