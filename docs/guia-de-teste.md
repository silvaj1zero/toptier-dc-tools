# Guia rápido de teste — Top Tools (Top Tier)

**Site:** https://ferramentas.toptier.net.br
**Tempo estimado:** 20–30 minutos
**Objetivo:** navegar como um usuário real, conferir se os números batem com os valores esperados abaixo e anotar qualquer coisa estranha (cálculo, texto, layout, botão que não funciona).

## Como reportar um problema

Para cada problema encontrado, anote:

1. **Página** (ex.: Calculadora de PUE)
2. **O que você digitou/clicou**
3. **O que esperava ver**
4. **O que apareceu** (print da tela ajuda muito)

---

## 1. Página inicial (2 min)

- [ ] Abrir https://ferramentas.toptier.net.br
- [ ] Conferir a marca no topo: logomarca da Top Tier + nome **Top Tools**
- [ ] Clicar no ícone de lua/sol (canto direito do menu) para alternar entre tema claro e escuro — tudo deve continuar legível nos dois; a escolha deve ser lembrada ao navegar entre páginas
- [ ] Conferir se os 4 cards de ferramentas aparecem e os botões "Abrir..." levam à página certa
- [ ] Conferir o menu do topo: Calculadora PUE · Simulador de Economia · Virtualização · Modelador de PUE · Metodologia · toptier.net.br
- [ ] Ler os textos por alto: algum erro de português ou frase estranha?

## 2. Calculadora de PUE (5 min)

Abrir **/calculadora-pue/** e preencher:

| Campo | Valor |
|---|---|
| Carga de TI (kW) | 800 |
| Carga total da instalação (kW) | 1200 |
| Tarifa (R$/kWh) | 0,80 |
| Bandeira tarifária | Verde |

**Resultados esperados (devem bater exatamente):**

- [ ] PUE = **1,50**
- [ ] DCiE = **66,7%**
- [ ] Energia anual da instalação = **10.512.000 kWh** (10,5 GWh)
- [ ] Custo anual estimado = **R$ 8.409.600** (~R$ 8,4 milhões)
- [ ] Overhead (não-TI) = **3.504.000 kWh**

**Testes extras:**

- [ ] Trocar a bandeira para Vermelha — o custo anual deve **subir**
- [ ] Preencher "Água consumida no ano" = 5.000.000 litros → WUE deve dar **≈ 0,71 L/kWh**
- [ ] Bloco "Como você se compara": com PUE 1,50 deve indicar posição próxima da média global (1,54)
- [ ] Leitura regulatória: PUE 1,50 deve **atender** o limite alemão de 2027 (≤ 1,5) e **não atender** os limites de 1,2 e 1,3
- [ ] Teste de erro: colocar carga total **menor** que a de TI (ex.: total 500, TI 800) → deve aparecer mensagem de erro clara, não um número sem sentido
- [ ] Botão "Imprimir / salvar PDF" gera uma página imprimível decente?

## 3. Simulador de Economia de Energia (4 min)

Abrir **/simulador-economia/** e preencher:

| Campo | Valor |
|---|---|
| PUE atual | 1,8 |
| PUE alvo | 1,5 |
| Carga de TI (kW) | 500 |
| Tarifa (R$/kWh) | 0,80 |

**Resultados esperados:**

- [ ] Energia economizada em 1 ano = **1.314.000 kWh**
- [ ] Economia financeira em 1 ano = **R$ 1.051.200**
- [ ] 5 anos = exatamente 5× o valor de 1 ano; 10 anos = 10×
- [ ] Bloco de CO2e evitado e "Equivalências" aparecem e fazem sentido
- [ ] Lista "Medidas típicas para chegar lá" aparece

## 4. Calculadora de Virtualização (5 min)

Abrir **/calculadora-virtualizacao/**. Esta ferramenta demonstra o **"paradoxo do PUE"**: consolidar servidores reduz a conta de luz, mas pode piorar o PUE.

- [ ] Usar os valores que já vêm preenchidos e apenas clicar em Calcular (se necessário)
- [ ] Conferir a tabela "Comparação pré × pós": número de servidores e carga de TI devem **cair** no pós
- [ ] A **conta anual de energia deve cair** no pós (economia positiva)
- [ ] Se o PUE piorar, deve aparecer o aviso "Paradoxo do PUE em ação" explicando o porquê
- [ ] Marcar as melhorias "Right-size de CRAC/CRAH" e "Right-size de UPS/PDU" → o PUE pós deve **melhorar** em relação a antes de marcá-las
- [ ] Trocar a moeda para US$ e informar um valor → resultados mudam para dólar
- [ ] Gráfico "Custo anual de energia por bloco" aparece e os blocos somam algo coerente com o total

## 5. Modelador de PUE de Projeto (6 min)

Abrir **/modelador-pue/**. É a ferramenta mais completa — modela o PUE de um projeto a partir da arquitetura.

- [ ] Sem mexer em nada, posicionar a carga de TI em **50%** → PUE deve dar **2,18** (valor de referência validado contra a ferramenta original da Schneider Electric)
- [ ] **Arrastar o marcador** sobre a curva PUE × carga: os números devem acompanhar o arrasto de forma fluida
- [ ] Trocar "Sistema UPS" para **Alta eficiência** → o PUE deve **cair**
- [ ] Aumentar "Economizador water-side (horas/ano)" → o PUE deve **cair**
- [ ] Marcar detalhes de projeto (ex.: Placas cegas, Iluminação eficiente) → PUE cai um pouco
- [ ] Clicar em "Duplicar cenário", mudar algo no cenário 2 e conferir a **Comparação de cenários** lado a lado
- [ ] "Remover" cenário funciona
- [ ] Blocos "Alocação de energia", "Detalhe — cadeia elétrica" e "Detalhe — climatização" mostram números coerentes (a soma das partes ≈ total)

## 6. Metodologia (2 min)

- [ ] Abrir **/metodologia/** pelo menu
- [ ] Rolar a página: as seções cobrem as 4 ferramentas?
- [ ] Clicar em 2–3 links de fontes externas: abrem?

## 7. Formulário de contato/lead (2 min)

Nas páginas das ferramentas há um formulário "Receba o relatório completo".

- [ ] Preencher com dados de teste (ex.: nome "Teste Doria", seu e-mail) e enviar
- [ ] Anotar o que aparece: mensagem de sucesso ("Recebido!...") ou de erro
- [ ] **Importante:** anote o resultado mesmo se der erro — estamos validando justamente se o envio está configurado

## 8. Teste no celular (3 min)

- [ ] Abrir o site no celular
- [ ] Conferir as duas calculadoras principais (PUE e Modelador): campos utilizáveis, nada cortado, curva do Modelador visível e arrastável no toque

---

*Dúvidas ou achados: mandar prints e anotações para o Zero.*
