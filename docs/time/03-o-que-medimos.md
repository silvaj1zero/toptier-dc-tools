# Top Tools — O que passamos a medir (para o time comercial)

> Estado em 2026-08-25. Desde 24/08 a suíte não mede só *quantas pessoas entraram*:
> mede **o que elas fizeram lá dentro**. Este documento explica o que cada número
> significa comercialmente, como ler o painel e — igualmente importante — **o que
> ele não prova**. Use com o `01-guia-suite.md` (o que cada ferramenta faz) e o
> `02-status-time.md` (o que está no ar).

## TL;DR para quem vende

Antes, sabíamos que alguém abriu a Calculadora de PUE. Agora sabemos se **usou**.
São coisas diferentes: abrir é curiosidade, usar é um profissional com os números
da instalação dele na mão — muitas vezes no trabalho, resolvendo um problema real.

A pergunta que o painel passa a responder: **quais dores movem nosso público?**
Se o Simulador de Economia domina, o mercado está com dor de *custo*. Se é o
Pré-Diagnóstico FOMM, a dor é de *maturidade operacional* — e essa conversa
termina em auditoria e certificação.

## Os 8 sinais

| Sinal | O que significa | Leitura comercial |
|---|---|---|
| `pue_calculado` | Calculou o PUE de uma instalação real | Tem os dados em mãos — sabe o que mede |
| `economia_simulada` | Simulou economia em 1/5/10 anos | Está construindo um **business case** |
| `virtualizacao_calculada` | Calculou consolidação de servidores | Avaliando projeto de eficiência |
| `pue_projeto_modelado` | Modelou um projeto (arquitetura → curva PUE) | Provável **projeto novo ou expansão** |
| `densidade_planejada` | Dimensionou espaço e densidade | Planejando sala/instalação — obra à vista |
| `fomm_respondido` | Respondeu as **18 perguntas** do Pré-Diagnóstico | Sinal mais forte da suíte (ver abaixo) |
| `resultado_impresso` | Imprimiu ou salvou o resultado em PDF | Vai **levar para alguém** — chefe, cliente, reunião |
| `lead_enviado` | Deixou os dados de contato | Lead, com a ferramenta de origem identificada |

### Os dois sinais que valem uma ligação

**`fomm_respondido`** — responder 18 perguntas sobre a própria operação leva
tempo e exige conhecer a casa. Quem chega ao fim não está passeando: está se
avaliando. É a porta natural para a conversa de auditoria e certificação.

**`resultado_impresso`** — imprimir é intenção de **compartilhar**. O número saiu
da tela e virou documento que alguém vai defender numa reunião. Se veio junto com
lead, é prioridade de retorno.

## Como ler o painel

1. Entrar no Umami (mesma conta de sempre) → website **"TopTier — Produção"**
2. Aplicar o filtro **Hostname = `ferramentas.toptier.net.br`**
3. Abrir a aba **Events**

O passo 2 não é opcional: o painel é **compartilhado** entre o site institucional
e a suíte (decisão de custo — evita US$ 20/mês). **Sem o filtro, os números somam
os dois domínios.** Antes de comemorar "o tráfego dobrou", confira se o filtro está
aplicado.

Para atribuir campanha (LinkedIn, e-mail, evento), use links com UTM — a origem
chega junto no lead e aparece no painel.

## O que estes números NÃO provam

Vale dizer com todas as letras, porque a diferença já custou caro antes:

- **`lead_enviado` conta o envio aceito, não o e-mail recebido.** O formulário
  confirmou o envio; provar que a mensagem chegou é outra verificação.
- **Um evento por visita, não por cálculo.** Se a mesma pessoa recalcula 30 vezes
  ajustando o cenário, conta **1**. É proposital: mede *pessoas usando*, não
  teclas digitadas. Portanto o número é de **usuários**, nunca de "cálculos feitos".
- **Não sabemos quem é** — a medição é sem cookies e sem identificação pessoal
  (LGPD). Nome só existe quando a pessoa **entrega** pelo formulário ou pelo gate
  do FOMM. O painel mostra padrões de uso; o CRM mostra pessoas.
- **Bloqueadores de anúncio existem.** Parte do público não é contabilizada — os
  números são piso, não censo.

## Perguntas que o painel agora responde

- Qual ferramenta merece virar campanha, post ou webinar? → a mais usada
- Qual ferramenta atrai muita gente mas gera pouco lead? → problema de oferta, não de tráfego
- O link novo no site institucional está trazendo gente? → filtro de origem
- Qual dor domina o mercado neste trimestre? → ranking de eventos ao longo do tempo

## Canal de leads — unificado em 25/08

Os leads da suíte agora chegam na **mesma caixa** dos leads do site
(contato@toptier.net.br), pelo mesmo pipeline com anti-robô. Não é mais preciso
conferir dois lugares.

Durante a transição existe uma rede de segurança: se o canal novo recusar um
envio, o lead vai pelo canal antigo em vez de se perder. Enquanto ela estiver
ativa, **um lead ocasional ainda pode cair no Formspree** — vale uma olhada lá
até a confirmação final.
