# Extração fiel — Parte III - MBA em Infraestrutura de Ambientes Críticos - Planejamento de Espaços Densidade e Crescimento R5 26072024 - Final.pptx

> Fonte: PPTX, 40 slides. Extração mecânica (XML interno), sem edição de conteúdo.


## Slide 1

1


## Slide 2

2


## Slide 3

Prof.s: José Roberto da Silva, DCEP, CEA, CEM, CEE, CET, CEFA
	 Luís V. R. Dória , DCEP, CEA, CEM, CEE, CET, CEFA
Data:   
• 29 e 30 de jago de 2025 (Turma 13).
Módulo:
• Projetos de Ambientes Críticos.
Objetivo:
• Apresentar os princípios básicos sobre projetos de ambientes críticos.
Ementa:
• Métodos de projeto;
• Normas e padrões de projeto de ambientes críticos;
• Subsistemas de uma instalação de missão crítica;
• Planejamento dos espaços.

3


## Slide 4

Importância do Planejamento de Espaços

•	Eficiência Operacional: Um planejamento adequado maximiza a utilização do espaço e dos recursos, reduzindo custos operacionais.

•	Flexibilidade: Permite adaptações futuras para novas tecnologias e demandas de capacidade.

•	Segurança e Confiabilidade: Um layout bem projetado minimiza riscos de falhas e facilita a manutenção.

Planejamento de Espaços em Data Centers

4


## Slide 5

Dois parâmetros principais de design para um data center são a classificação de carga de TI em kW e o tamanho físico das salas de TI e equipamentos. 
Em princípio, estes estão relacionados com o conceito de densidade de energia, que vagamente relaciona o tamanho do edifício à carga de TI. 

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

5


## Slide 6

Limitações da Abordagem Histórica
Ambiguidade nas Definições: A abordagem histórica frequentemente não define claramente o que está incluído nas medições de área e potência, levando a confusões.
Exemplo: A especificação de "1,5 kW/m²" não esclarece se é um pico, média ou outro valor, dificultando o planejamento.
Subutilização de Recursos: A falta de clareza pode resultar em equipamentos de energia e resfriamento subutilizados, aumentando custos operacionais.
Exemplo: Um data center projetado para 4 kW por gabinete pode ter gabinetes com cargas de 6 kW, levando a ineficiências.
Inflexibilidade para Crescimento: A abordagem histórica não considera adequadamente a modularidade e o crescimento ao longo do tempo, limitando a adaptabilidade do data center.
Exemplo: Um data center que não planeja espaço extra pode enfrentar 
dificuldades ao tentar acomodar novos equipamentos.

Análise da Abordagem Histórica vs NOVA ABORDAGEM em Data Centers

“O Data Center deverá ter 1000m2 de piso elevado e uma densidade de 1,5kW por m2....”

6


### Notas

Limitações da Abordagem Histórica
Ambiguidade nas Definições: A abordagem histórica frequentemente não define claramente o que está incluído nas medições de área e potência, levando a confusões.
Exemplo: A especificação de "1,5 KW/m²" não esclarece se é um pico, média ou outro valor, dificultando o planejamento.
Subutilização de Recursos: A falta de clareza pode resultar em equipamentos de energia e resfriamento subutilizados, aumentando custos operacionais.
Exemplo: Um data center projetado para 4 kW por gabinete pode ter gabinetes com cargas de 6 kW, levando a ineficiências.
Inflexibilidade para Crescimento: A abordagem histórica não considera adequadamente a modularidade e o crescimento ao longo do tempo, limitando a adaptabilidade do data center.
Exemplo: Um data center que não planeja espaço extra pode enfrentar dificuldades ao tentar acomodar novos equipamentos.


## Slide 7

Consideremos um caso de um data center que tenha a especificação típica de 1,3 kW/m2

Análise da Abordagem Histórica vs NOVA ABORDAGEM em Data Centers

Para entender o que isso significa, essa especificação de densidade deve ser traduzida para o nível do gabinete, onde, dependendo de suposições (como o espaço consumido por gabinete), equivale a algo entre 3 e 5 kW por gabinete. O meio desta faixa, ou 4 kW por gabinete, pode parecer razoável, mas...

Se o data center for construído a 4 kW por gabinete, o que acontece quando um gabinete isolado tem uma carga de 6 kW, 12 kW ou 20 kW? 

Se alguns gabinetes que têm menos do que a carga de 4 kW instalada, a capacidade de alimentação e refrigeração subutilizada ficará disponível para outros gabinetes? 

Se sim, em quais? Se alguns gabinetes são maiores que 4 kW, eu preciso deixar espaço não ocupado ao redor deles? Se alguns gabinetes são maiores que 4 kW, eles podem estar localizados próximos 
uns aos outros ou devem ser espalhados?

7


### Notas

Um data center que tenha a especificação típica de 1,3 kW/m2 >> equivale a algo entre 3 e 5 kW por gabinete. O meio desta faixa, ou 4 kW por gabinete, pode parecer razoável, mas...


## Slide 8

À primeira vista, deve-se questionar por que isso não pode ser resolvido simplesmente especificando uma densidade de energia muito grande para um data center, como 30 kW por gabinete (10.7 kW/m2).

Análise da Abordagem Histórica vs NOVA ABORDAGEM em Data Centers

No entanto, isso cria novos problemas que são muito caros e, claro, desperdiçadores,
 incluindo:
Um data center de 10,7 kW/m2 custa cerca de 8 vezes o valor de um data center de 1,3 kW/m2 (por unidade de área do piso).  Portanto, se toda essa capacidade de densidade não for usada, haverá um enorme desperdício de investimento de capital.
Se um data center de 10,7 kW/m2 na realidade acabar operando a 1 kW/m2 (3 kW/gabinete), então seu valor de PUE operacional provavelmente estará na faixa de 3 a 5, o que reflete um tremendo desperdício de energia.
Se um data center de 10,7 kW/m2 for realmente preenchido com equipamentos de TI de menor densidade, o data center ficará sem espaço físico antes que fique sem energia e capacidade de refrigeração, tanto que grande parte da capacidade do data 
center pode ser encalhada ou inutilizável.

8


### Notas

10,7 kW/m2 custa cerca de 8 vezes o valor de um data center de 1,3 kW/m2 
10,7 kW/m2 na realidade acabar operando a 1 kW/m2 (3 kW/gabinete), então seu valor de PUE operacional provavelmente estará na faixa de 3 a 5
Terminará espaço físico, antes das capacidades de energia e refrigeração >> enorme desperdício


## Slide 9

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Especifique uma densidade e de energia muito baixa e a performace torna-se imprevisível com ocorrencia de vários problemas de limitação de energia e superaquecimento.

Especificar uma densidade de energia muito alta e as despesas com custo inical e operacional serão desnecessariamente aumentadas.

9


## Slide 10

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Se o equipamento de TI for implantado de forma a utilizar completamente toda a energia, refrigeração  e espaço em um Data Center, então nenhuma infraestrutura é subutilizada. 

Este é o caso ideal de 100% de aproveitamento.  No entanto, esse ideal é quase impossível de alcançar, pois o uso real de energia de gabinetes individuais de TI geralmente não é conhecido com antecedência.  

Se a densidade operacional real de um Data Center e o valor de projeto para densidade não corresponder, algum recurso, seja energia, refrigeração ou espaço, pode não ser totalmente utilizado. Essa infraestrutura desperdiçada aumenta efetivamente o custo do data center, uma vez que o recurso é pago, mas não é usado.

10


### Notas

Muito difícil de dimensionar com 100% de todos recursos, energia – refrigeração e espaço físico, veja porque...


## Slide 11

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Variação do custo efetivo como a densidade real de energia varia da densidade de design de 
5 kW/ gabinete

Espaço todo usado Energia e a refrigeração ocioso

Energia e refrigeração todo usado e o espaço subutilizado

11


## Slide 12

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Pela figura acima observamos que é muito mais caro implantar a TI abaixo da densidade de design do data center, do que implantar acima da densidade de design.

Isso é verdade porque o custo do espaço por unidade de TI é sempre muito menor do que o custo de energia e refrigeração por unidade de TI. Dado o fato de que a densidade real de equipamentos de TI em um data center é difícil de prever com antecedência, isso nos leva a uma conclusão fundamental:

Quando a densidade dos equipamentos de TI é incerta, um data center deve ser sempre construído para uma densidade de design menor do que o valor médio esperado da densidade de TI.

12


### Notas

Melhor sobrar espaço o custo do Data Center é bem melhor que o de Energia e Refrigeração.


## Slide 13

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Espera-se que um Data Center bem projetado, quando preenchido por energia e refrigeração, tenha espaço de TI sobressalente ou não utilizado.

Este é um resultado surpreendente que no início parece contra-intuitivo. O espaço sobressalente é fornecido para lidar com a incerteza atual ou futura em relação à densidade dos equipamentos de TI. 

Este espaço de TI não usado é um seguro para evitar o caro recurso não usado de energia e capacidade de refrigeração que pode resultar se a densidade real ficar abaixo do valor de projeto planejado.
 
Quanto mais incerteza houver sobre a densidade futura, maior é o espaço de TI sobressalente.

13


### Notas

Parece contra-intuitivo! Mas o  espaço sobressalente é fornecido para lidar com a incerteza atual ou futura em relação à densidade dos equipamentos de TI. 


## Slide 14

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

A nova abordagem para a especificação dos requisitos de espaço e densidade de energia tem quatro características principais:

A unidade de espaço físico na especificação de densidade é o gabinete de TI, NÃO área de piso. A área do piso é determinada durante o projeto como uma saída do processo usando por potência de gabinete e outros fatores.
A especificação é hierárquica e modular, de modo que diferentes salas e zonas podem ter diferentes requisitos de densidade. 
A especificação compreende que os gabinetes de TI dentro dos data centers têm diferentes requisitos de energia, e que esses requisitos podem não ser bem definidos com antecedência. 
A especificação compreende que os gabinetes de equipamentos de TI podem ter requisitos de energia que variam de acordo com o tempo.

14


## Slide 15

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Uso do gabinete como medida de espaço físico

Existem equipamentos que não utilizam gabinetes padrão como mainframes ou storages, mas esses normalmente tem seus requisitos de energia e refrigeração bem definidos.

Portanto, estabelecemos o gabinete como medida de implantação do espaço de TI, e usamos a potência por gabinete (kW/gabinete ou rack) como medida padrão de densidade.

Infelizmente, o espaço em edifícios é medido em área de piso metros quadrados (m2)
Em algum momento devemos ser capazes de converter o espaço do gabinete em espaço físico

15


### Notas

O gabinete como medida de implantação do espaço de TI, e usamos a potência por gabinete (kW/gabinete ou rack) como medida padrão de densidade. Infelizmente, o espaço em edifícios é medido em área de piso metros quadrados (m2). Em algum momento devemos ser capazes de converter o espaço do gabinete em espaço físico!


## Slide 16

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

O problema é que essa conversão de gabinetes para área de piso depende de uma série de fatores-chave que são independentes da potência por gabinete e devem ser especificados separadamente e explicitamente, incluindo:
Quantidade de locais de gabinete reservados, se houver, para encenação (staging) futura ou migração
Espaço necessário para dispositivos de infraestrutura de energia e refrigeração dentro da sala de TI, como PDUs, condicionadores de ar (CRACs) e UPSs
Espaço necessário para saídas, rampas de piso elevadas e colunas (se houverem)
Presença de partições físicas, como gaiolas (cages), subdividindo a área de TI
Quantidade de espaço reservado, se houver, para patch panels ou equipamentos de rede
Quantidade de espaço reservado, se houver, para equipamentos de storages   
Quantidade de espaço reservado, para permitir que a densidade real seja menor do que a especificação do design

16


### Notas

Conversão de gabinetes para área de piso depende de uma série de fatores-chave que são independentes da potência por gabinete e requerem espaço: 1. gabinete reservados, se houver, para encenação (staging); 2. Infraestrutura de energia e refrigeração; 3. Saídas, rampas de piso elevadas e colunas (se houverem); 4. Partições físicas, como gaiolas (cages); 5. Patch panels ou equipamentos de rede; 6. Equipamentos de storages; 7. Quantidade de espaço reservado, para permitir que a densidade real seja menor do que a especificação do design.


## Slide 17

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Esses fatores, descritos acima, têm um grande impacto no espaço necessário e na densidade por unidade, E DEVEM SER EXPLICITADOS NO DESIGN JUNTAMENTE COM A DENSIDADE POR GABINETE.

Uma especificação de densidade modular e hierárquica 
Exigimos a capacidade de especificar a densidade de forma diferente para diferentes partes de um data center. No caso geral, um data center pode ser visualizado com a seguinte hierarquia:
 
	Instalação de um Data Center, composta por uma ou mais unidades de salas de TI,

		composta por uma ou mais unidades Pods de TI, 

			composto por uma ou mais unidades de gabinetes de TI

17


## Slide 18

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

O que é um “Pod"? 

Um Pod de data center é um conjunto de gabinetes de TI combinados com infraestrutura de energia e refrigeração que é implantada como uma unidade. As salas são planejadas com antecedência para uma série de pods, mas os pods podem ser implantadas separadamente ou atualizadas ao longo do tempo. Pods tipicamente montados no local em uma sala para um design padrão, mas podem ser parcial ou extensivamente pré-fabricados. Em sua forma mais comum, uma Pod é um par de fileiras de gabinetes compartilhando um corredor quente. O design baseado em pod é uma prática recomendada para data centers maiores.

Conceito de Pod: Um pod em um data center é uma unidade modular que consiste em um agrupamento de gabinetes de TI, juntamente com a infraestrutura necessária de energia e resfriamento, projetada para operar como um sistema coeso.

18


## Slide 19

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Estrutura do Pod: Normalmente, um pod é composto por:
Gabinetes de TI: Onde os servidores e equipamentos de rede são instalados.
Sistemas de Energia: Distribuição elétrica que suporta a carga dos equipamentos.
Sistemas de Resfriamento: Infraestrutura para manter a temperatura adequada, como unidades de ar condicionado ou refrigeração líquida.
Vantagens do Design em Pod:
Escalabilidade: Pods podem ser adicionados ou atualizados de forma independente, permitindo que o data center cresça conforme a demanda.
Eficiência Operacional: O design modular facilita a manutenção e a gestão de recursos, otimizando o uso de espaço e energia.
Melhorias na Refrigeração: A configuração de pods permite um controle mais eficaz do fluxo de ar e da temperatura, reduzindo hotspots e melhorando a eficiência energética.

19


### Notas

Conceito de Pod: Um pod em um data center é uma unidade modular que consiste em um agrupamento de gabinetes de TI, juntamente com a infraestrutura necessária de energia e resfriamento, projetada para operar como um sistema coeso. Composto por: Gabinetes de TI; Sistemas de Energia e Sistemas de Resfrigeração: Infraestrutura para manter a temperatura adequada, como unidades de ar condicionado ou resfriamento líquido. Vantagens: Escalabilidade, Eficiência Operacional e Melhorias na Refrigeração. 


## Slide 20

20

Pod de Alta Densidade: Para suportar cargas mais altas, com sistemas de resfriamento e energia adequados para gerenciar a demanda.
Pod de Baixa Densidade: Utilizado em ambientes onde a carga de TI é menor, permitindo uma configuração mais econômica.

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Os Pods são uma abordagem moderna e eficiente para o design de data centers, permitindo flexibilidade, escalabilidade e otimização de recursos. Essa estrutura modular é fundamental para atender às crescentes demandas de TI em ambientes críticos.


### Notas

Os Pods são uma abordagem moderna e eficiente para o design de data centers, permitindo flexibilidade, escalabilidade e otimização de recursos. Essa estrutura modular é fundamental para atender às crescentes demandas de TI em ambientes críticos. Pod de Alta Densidade: Para suportar cargas mais altas, com sistemas de resfriamento e energia adequados para gerenciar a demanda.
Pod de Baixa Densidade: Utilizado em ambientes onde a carga de TI é menor, permitindo uma configuração mais econômica.


## Slide 21

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

21


## Slide 22

Parâmetros de Especificação Necessários para Estabelecer Espaço e Densidade

Número de Unidades (#): 
Definição: Refere-se ao total de gabinetes, pods ou salas dentro de uma instalação.
Uso no Projeto: Este parâmetro é crucial para calcular as necessidades totais de potência, resfriamento e espaço, permitindo uma visão geral da capacidade do data center.
Potência Média Alvo por Unidade (kW):
Definição: É a potência média esperada que cada unidade deve consumir quando operando em plena carga.
Uso no Projeto: Ajuda a dimensionar os sistemas de energia e resfriamento, garantindo que eles possam suportar a carga média esperada.
Potência de Pico por Unidade (kW):
Definição: Representa a potência máxima que um único equipamento pode consumir.
Uso no Projeto: Essencial para dimensionar os sistemas de distribuição de energia e resfriamento, prevenindo sobrecargas.

22


## Slide 23

Parâmetros de Especificação Necessários para Estabelecer Espaço e Densidade

4.  Incerteza de Potência por Unidade (%):
Definição: Indica a variação esperada entre a potência real e a potência média alvo.
Uso no Projeto: Permite que os projetistas reservem espaço adequado para evitar que a capacidade de energia e resfriamento fique subutilizada em caso de baixa densidade.
5.  Razão de Potência Gerenciada (%):
Definição: Refere-se à porcentagem de redução na potência média alvo devido a funções de gerenciamento de energia.
Uso no Projeto: Ajuda a definir os pontos de carga operacional, permitindo que os sistemas de energia e resfrigeração sejam otimizados para eficiência energética.

Esses parâmetros são fundamentais para o planejamento e design eficaz de data centers, permitindo a conversão de valores individuais em totais e garantindo que a infraestrutura atenda às necessidades operacionais e de eficiência.

23


## Slide 24

Espaço Reservado para Sistemas Ancilares

Definição: Percentual do espaço total reservado para sistemas auxiliares, como sistemas de energia, resfriamento e cabeamento.
Importância: Garante que haja espaço suficiente para a infraestrutura de suporte, evitando congestionamentos e facilitando a manutenção.
Espaço Reservado para Armazenamento:
Definição: Percentual do espaço total destinado ao armazenamento de equipamentos e suprimentos.
Importância: Permite que o data center mantenha um inventário adequado de peças de reposição e equipamentos, melhorando a eficiência operacional.
Espaço Reservado para Egressos, Rampas e Colunas:
Definição: Percentual do espaço total alocado para áreas de acesso, como saídas de emergência, rampas e colunas estruturais.
Importância: Essencial para garantir a segurança e a acessibilidade, além de atender a requisitos de construção e regulamentos.

24


### Notas

Os sistemas ancilares em data centers e pods referem-se a serviços e componentes que garantem a operação eficiente e estável desses ambientes, assim como os serviços ancilares no contexto elétrico. Aqui estão algumas considerações sobre o tema:

Definição de Sistemas Ancilares em Data Center

Nos data centers, os sistemas ancilares incluem todos os serviços e infraestruturas que suportam a operação principal dos servidores e armazenamento de dados. Isso abrange:

Resfrigeração: Sistemas de resfriamento são essenciais para controlar a temperatura, evitando o superaquecimento dos equipamentos, o que pode levar a falhas e interrupções. A eficiência energética é uma preocupação constante, e tecnologias modernas buscam otimizar o consumo de energia.

Energia: Sistemas de fornecimento de energia, incluindo fontes ininterruptas de energia (UPS) e geradores, são críticos para garantir que os data centers operem continuamente, mesmo em caso de falhas na rede elétrica.

Segurança Física e Lógica: Sistemas de segurança, como controle de acesso e monitoramento, são fundamentais para proteger a infraestrutura e os dados armazenados.

Redundância e Backup: Estruturas de redundância, como servidores em cluster e backups de dados, garantem que, em caso de falha de um componente, outros possam assumir suas funções sem interrupção.

Importância dos Sistemas Ancilares

Os sistemas ancilares são vitais para a operação de data centers, pois:Garantem a Continuidade do Serviço: Eles asseguram que os serviços de TI permaneçam disponíveis e funcionais, minimizando o tempo de inatividade.

Melhoram a Eficiência Operacional: A automação e a integração de sistemas ancilares podem otimizar processos, reduzindo custos operacionais e aumentando a eficiência.

Apoiam a Escalabilidade: À medida que as demandas aumentam, sistemas ancilares bem projetados permitem que os data centers escalem suas operações sem comprometer a performance.

Considerações Finais
A implementação de sistemas ancilares eficazes em data centers e pods é crucial para a manutenção de operações seguras e eficientes. Assim como os serviços ancilares no setor elétrico, que garantem a estabilidade e a segurança do fornecimento de energia, os sistemas ancilares em data centers desempenham um papel fundamental na proteção e na continuidade das operações de TI.


## Slide 25

Espaço Reservado para Sistemas Ancilares

Densidade de Potência por Gabinete:
Definição: Quantidade de potência (em kW) que cada gabinete pode suportar.
Importância: Fundamental para dimensionar adequadamente os sistemas de energia e resfriamento, evitando sobrecargas e garantindo a eficiência.
Espaço Total Disponível:
Definição: Área total do data center que pode ser utilizada para a instalação de equipamentos de TI.
Importância: Serve como base para calcular a densidade de potência e garantir que o espaço seja utilizado de forma eficiente.
Esses parâmetros são cruciais para o planejamento eficaz de data centers, pois ajudam a estabelecer especificações claras de espaço e densidade. A consideração cuidadosa de cada um deles contribui para a eficiência operacional, segurança e flexibilidade do ambiente de TI.

25


### Notas

Os sistemas ancilares em data centers e pods referem-se a serviços e componentes que garantem a operação eficiente e estável desses ambientes, assim como os serviços ancilares no contexto elétrico. Aqui estão algumas considerações sobre o tema:

Definição de Sistemas Ancilares em Data Center

Nos data centers, os sistemas ancilares incluem todos os serviços e infraestruturas que suportam a operação principal dos servidores e armazenamento de dados. Isso abrange:

Resfrigeração: Sistemas de resfriamento são essenciais para controlar a temperatura, evitando o superaquecimento dos equipamentos, o que pode levar a falhas e interrupções. A eficiência energética é uma preocupação constante, e tecnologias modernas buscam otimizar o consumo de energia.

Energia: Sistemas de fornecimento de energia, incluindo fontes ininterruptas de energia (UPS) e geradores, são críticos para garantir que os data centers operem continuamente, mesmo em caso de falhas na rede elétrica.

Segurança Física e Lógica: Sistemas de segurança, como controle de acesso e monitoramento, são fundamentais para proteger a infraestrutura e os dados armazenados.

Redundância e Backup: Estruturas de redundância, como servidores em cluster e backups de dados, garantem que, em caso de falha de um componente, outros possam assumir suas funções sem interrupção.

Importância dos Sistemas Ancilares

Os sistemas ancilares são vitais para a operação de data centers, pois:Garantem a Continuidade do Serviço: Eles asseguram que os serviços de TI permaneçam disponíveis e funcionais, minimizando o tempo de inatividade.

Melhoram a Eficiência Operacional: A automação e a integração de sistemas ancilares podem otimizar processos, reduzindo custos operacionais e aumentando a eficiência.

Apoiam a Escalabilidade: À medida que as demandas aumentam, sistemas ancilares bem projetados permitem que os data centers escalem suas operações sem comprometer a performance.

Considerações Finais
A implementação de sistemas ancilares eficazes em data centers e pods é crucial para a manutenção de operações seguras e eficientes. Assim como os serviços ancilares no setor elétrico, que garantem a estabilidade e a segurança do fornecimento de energia, os sistemas ancilares em data centers desempenham um papel fundamental na proteção e na continuidade das operações de TI.


## Slide 26

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Exemplo 1: Sala de servidores pequena
Uma pequena sala de servidor de 40 kW é um caso simples  escolhido porque a  instalação tem apenas uma  única sala de TI, com um  único  pod.  Neste  caso, o nível de  especificação é a sala, que também é  o  pod, e que  contém um grupo de gabinetes de TI.                                              
				 
A estrutura  da  especificação  é  simples  neste caso, e a  especificação completa  para  este desenho é mostrada na planilha abaixo.       (Excel fornecido sq ft e m2)
 
Esta especificação fornece orientação clara e  inequívoca  para o projeto. As  celulas  amarelas na tabela  são entradas do  usuário,  e o desempenho do resumo  é  calculado.

SALA            POD

26


## Slide 27

Os parâmetros de densidade na especificação são determinados usando o seguinte procedimento simples: 

O número de gabinetes é estabelecido pela exigência de TI. 
A potência média de meta de projeto por gabinete é determinada pelas especificações do fornecedor de TI ou escolhendo valores típicos de design médio para o aplicação. Neste caso, foi escolhido um valor típico para uma sala de servidor corporativo de 4 kW por gabinete. 
O potência máxima é escolhida estabelecendo a máxima potência esperada ou permitida do gabinete. Neste caso, especificamos uma capacidade máxima de 8 kW. 
A incerteza de potência do gabinete é estimada considerando diferentes cenários para implantações de TI ou escolhendo valores típicos de design para a aplicação. Neste exemplo, a densidade de implantação esperada foi definida para +/- 15% da média da meta de projeto de 4 kW. 
A relação de energia gerenciada é estimada com base na funcionalidade esperada de gerenciamento de energia da carga de TI. Neste exemplo, espera-se que as funções de gerenciamento de energia reduzam a potência média real das cargas de TI para 70% do valor médio da meta de design.

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

27


## Slide 28

28


## Slide 29

         Existem duas abordagens básicas para a especificação de um grande data center: 

Inicie a especificação no nível do gabinete ou do pod e construa a especificação da instalação 
Inicie a especificação no nível da instalação (site) e derive a especificação em salas, em seguida pods, em seguida especificações do gabinete

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Exemplo 2: Grande Data Center
	Neste exemplo de 2 MW, o data center é definido com a seguinte hierarquia:
 Instalação (site) de Data Center, composta por 4 salas de TI, 
		cada uma composta por: 9 Pods de TI, 
			compostas por: 10 gabinetes de TI

29


## Slide 30

         Existem duas abordagens básicas para a especificação de um grande data center: 

Inicie a especificação no nível do gabinete ou do pod e construa a especificação da instalação 
Inicie a especificação no nível da instalação (site) e derive a especificação em salas, em seguida pods, em seguida especificações do gabinete

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

Exemplo 2: Grande Data Center
	Neste exemplo de 2 MW, o data center é definido com a seguinte hierarquia:
 Instalação (site) de Data Center, composta por 4 salas de TI, 
		cada uma composta por: 9 Pods de TI, 
			compostas por: 10 gabinetes de TI

30


## Slide 31

Idealmente, essa primeira abordagem deve ser utilizada, porém, em muitos casos isso não é prático, pois as restrições de nível de instalação foram definidas primeiro, como a potência elétrica disponível, ou o tamanho físico do edifício. Dada uma exigência de energia de instalação conhecida, a especificação deve ser dividida em salas e Pods e, em seguida, revertê-las para o nível da instalação, usando o seguinte procedimento:

Determine o número de salas na instalação, estabelecendo a potência da sala
Determine o número de Pods em uma sala, estabelecendo o potência do Pod
Determine o número de gabinetes em um Pod, estabelecendo a potência do gabinete
Estabeleça os parâmetros de uso do espaço da instalação, pod e espaço da sala
Determinar parâmetros de densidade restantes
Elabore a especificação total e valide contra as restrições de design
Ajuste e repita até que o projeto atenda aos requisitos

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

31


## Slide 32

Os atributos do data center definidos a partir da planilha para este exemplo de 2 MW são:
Um Pod é composto por 12 gabinetes de TI mais 4 posições de gabinete dedicados ao distribuição de energia e refrigeração em linha, com uma pegada de Pod de 6 m x 4 m (20 pés por 14 pés).
A potência média de design por gabinete é de 5 kW.
A potência de pico permitida em qualquer gabinete é de 12,5 kW, desde que a potência do Pod não exceda 50 kW para todos os 12 gabinetes combinados.
O espaço interno total exigido por este projeto é de 2.352 m2 (25.320 pés2 ).
Usando métricas convencionais para W/m2 no nível da sala de TI, este Data Center tem uma densidade de 1.206 W/m2 (112 W/ft2).
Em cada Pod, foram fornecidos 2 posições de gabinete sobressalentes, para permitir que a potência do Pod e a refrigeração sejam utilizados no caso de a potência média implantada ser menor do que os 5 kW especificados por gabinete.
Em cada sala, 2 locais de Pods de reposição foram reservados, um é para o staging de novos Pods,  sem interromper um Pod existente e um para permitir que a potência da sala e a refrigeração sejam utilizados no caso de a potência média implantada ser inferior a 5 kW por gabinete.

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

32


## Slide 33

33


## Slide 34

34


## Slide 35

Idealmente, os projetos de Pods e Salas dentro de uma instalação (site) são uniformes e padronizados. Isso fornece uma série de benefícios para o projeto, incluindo: 
Simplicidade do escalonamento
Padronização de ferramentas, métodos e procedimentos de gestão
Simplicidade de planejamento e design

No entanto, isso nem sempre é apropriado ou mesmo viável, devido ao seguinte:
Diferentes tipos conhecidos de equipamentos de TI com requisitos muito diferentes serão implantados
As dimensões das salas já estão definidas e não podem ser padronizadas
Diferentes áreas possuem diferentes requisitos de disponibilidade que afetarão a quantidade de espaço tomado por equipamentos redundantes de energia e refrigeração

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

35


## Slide 36

Uma prática recomendada é definir um conjunto mínimo de gabinetes padrão, Pods padrão e em data centers muito grandes, salas padrão. 

Por exemplo, um grande Data Center pode definir três Pods padrão diferentes com a mesma pegada para baixa densidade, alta densidade e armazenamento. 

O data center seria projetado para uma combinação esperada desses Pods, mas a flexibilidade poderia ser mantida para ajustar a composição durante uma implantação de longo prazo.

CALCULANDO OS REQUISITOS DE ESPAÇO E DENSIDADE DE ENERGIA PARA DATA CENTERS

36


## Slide 37

Quando a densidade de energia de um data center é especificada por um único número, como W/ft2 ou W/m2, muitas características importantes de desempenho não são definidas. Isso pode levar a uma confusão considerável durante os processos de especificação, design e comissionamento, e deixa os operadores com uma compreensão limitada das capacidades do data center. 

Um data center deve ser especificado de forma a considerar as principais restrições de design, ao mesmo tempo em que fornece orientações inequívocas aos engenheiros e contratantes que detalham o projeto. A especificação deve fornecer claramente as informações que os operadores de data center precisam para estabelecer políticas e procedimentos operacionais e dar aos operadores a confiança de que o desempenho do data center será previsível. 

CONCLUSÃO

37


## Slide 38

Esta é uma abordagem lógica e rápida para documentar os requisitos de espaço e densidade do data center que fornece detalhes suficientes para garantir que o desempenho seja previsível e não seja deixado ao acaso. Quando um data center é especificado dessa forma, ele fornece orientação muito mais completa e clara para o design detalhado do data center do que é fornecido com os métodos históricos. 

Mesmo data centers com informações incompletas e planos incertos podem usar esse método. Para auxiliar os usuários que tentam definir uma especificação de densidade, foram fornecidos valores típicos de design. Prevê-se que Pods, salas e instalações padronizadas, pré-projetadas e modulares forneceriam especificações de densidade usando este método, simplificando o design do data center.

CONCLUSÃO

38


## Slide 39

OBRIGADO!

JOSÉ ROBERTO DA SILVA, DCEP, CEA, CEM, CEE, CET 
E-mail: zero@toptier.net.br
www.toptier.net.br 
Cel. 11-99114.8109

LUÍS V. R. DÓRIA, DCEP, CEA, CEM, CEE, CET 
E-mail: doria@toptier.net.br
www.toptier.net.br 
Cel. 11-9935.0049

39


## Slide 40

40
