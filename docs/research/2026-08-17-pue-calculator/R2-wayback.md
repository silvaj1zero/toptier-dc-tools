# R2 — Arqueologia via Wayback Machine: "Data Center Efficiency and PUE Calculator" (Schneider Electric / APC TradeOff Tools)

Escopo desta rodada: recuperar as constantes internas da calculadora **especificamente via
web.archive.org** (Wayback Machine), conforme solicitado. Resultado honesto: **o serviço de
playback do Wayback Machine esteve indisponível (503 "Temporarily Offline") durante toda a
sessão de pesquisa**, apesar de múltiplas tentativas espaçadas ao longo de ~20 minutos. Nenhum
conteúdo de página arquivada foi recuperável por esta via nesta rodada. O inventário de
snapshots (metadados) foi recuperado com sucesso via API CDX, que é um serviço separado do
playback e continuou funcional. Para compensar, dados equivalentes/superiores foram obtidos por
canais não-Wayback (ver §4) — declarados aqui sem se apresentar como "resultado do Wayback".

---

## 1. Diagnóstico da indisponibilidade do Wayback (evidência, não suposição)

Testado ao longo da sessão (curl, várias janelas de tempo, `Mozilla/5.0` UA, http e https):

| Endpoint | Status | Interpretação |
|---|---|---|
| `https://archive.org` (home) | `200` | Infra geral do Internet Archive está de pé |
| `http://web.archive.org/cdx/search/cdx?...` | `200` | **API CDX funcional** — só devolve metadados (timestamp/url/status/digest), não o conteúdo da página |
| `https://web.archive.org/web/{timestamp}/{url}` | `503` — corpo: `"Internet Archive: Temporarily Offline"` | **Playback fora do ar** — é isto que serviria o HTML/JS arquivado real |
| `https://web.archive.org` (raiz) | `503` | Confirma que é o subdomínio de playback inteiro, não uma URL específica |
| `https://archive.org/wayback/available?...` | `502` | API "availability" (usada por bots/extensões) também fora do ar |
| `http://timetravel.mementoweb.org/api/json/...` | timeout / sem resposta | Agregador de mementos de terceiros também não respondeu |

Retentativas feitas: 3 rodadas espaçadas (imediata, +15s, +30s, +90s adicionais, total ~6
tentativas em URLs diferentes) — **100% dos hits em `/web/` retornaram 503**, enquanto CDX e a
home do archive.org responderam `200` consistentemente. Isto descarta bloqueio por bot/rate-limit
específico do nosso lado (User-Agent, IP, headers) — é uma indisponibilidade real e ampla do
subsistema de playback do Internet Archive no momento da pesquisa (2026-08-17). Esse tipo de
degradação é consistente com o histórico de instabilidade do IA desde os ataques DDoS de
outubro/2024, que seguem causando quedas intermitentes do playback em 2025-2026.

**Conclusão:** "não recuperável via Wayback nesta sessão" é o resultado honesto — não é
ausência de esforço nem bloqueio por bot (diferente do live site da SE, que de fato bloqueia
scraping, conforme o brief antecipava).

---

## 2. O que a API CDX confirmou (metadados apenas — sem conteúdo)

Mesmo sem conseguir renderizar o conteúdo, a CDX API confirma que a ferramenta **existiu, foi
crawleada extensivamente, e tem snapshots com HTTP 200 (sucesso) em pontos específicos**:

### 2.1 `apc.com` / `www.apc.com` — página índice das TradeOff Tools

| URL original | Timestamp | Status | Tamanho | Observação |
|---|---|---|---|---|
| `http://www.apc.com/tool/?` | `20100527072851` | **200** | 4.066 bytes | Página índice do launcher `/tool/` (2010) |
| `http://www.apc.com/tool/index.cfm?` | `20130620193231` | **200** | 7.223 bytes | Página índice equivalente, versão ColdFusion (2013) |
| `https://www.apc.com/tool/index.cfm?tt=6&cc=EN` | `20221113040052` | 302 (redirect) | 1.134 bytes | `tt=6` é o parâmetro que a busca web (ver §3) associa à "Data Center Efficiency Calculator" — já redirecionando em 2022, sinal de descontinuação em curso |
| `http://tools.apc.com:80/` | `20080905203543` | 302 (redirect) | — | Primeiro snapshot do subdomínio `tools.apc.com`, já era redirect na origem (2008) |
| `http://tools.apc.com/corporate/index.cfm` | `20090105183006` | **200** | 6.495 bytes | Único snapshot 200 encontrado sob `tools.apc.com/corporate/` |

### 2.2 `it-resource.schneider-electric.com` (candidato a host do iframe moderno)

CDX devolveu ~80 entradas, mas **nenhuma correspondia à página da calculadora** — o domínio
está atualmente coberto por proteção de bot Akamai (`/akam/13/*`), e todas as entradas
relevantes crawleadas são 404 do challenge JS do Akamai, não conteúdo real. Nenhum snapshot de
uma página tipo `wp-XXX-...-pue-calculator` foi localizado neste subdomínio dentro do que a CDX
devolveu.

### 2.3 `se.com/ww/en/...trade-off-tools/...` (URL moderna citada no brief)

Consulta CDX por prefixo exato (`matchType=prefix`) **devolveu array vazio** — não há snapshot
arquivado dessa URL específica na estrutura atual do site `se.com`. Uma segunda consulta mais
ampla (`matchType=domain`, filtro `trade.?off`) sobre todo `se.com` **expirou (timeout) três
vezes** sem completar — o domínio `se.com` é grande demais para essa consulta de filtro no CDX
sem uma faixa de tempo, e não foi possível reduzir o escopo o bastante dentro do orçamento desta
rodada. **Não descarta a existência de snapshots** — apenas não foram localizados com o esforço
gasto.

### 2.4 `apc.com/tool/availability/*`, `www.apc.com/tools/*`

Múltiplas centenas de entradas — mas seu path (`/tools/availability/...`) e nomes de arquivo
indicam ser a "**Uptime/Availability Calculator**" (outra TradeOff Tool, não a de eficiência/PUE).
Não relevante para este pedido; registrado apenas para não confundir buscas futuras.

### 2.5 `tools.apc.com` — domínio hoje sequestrado por spam

A grande maioria dos ~9.000+ snapshots recentes (2022-2025) sob `tools.apc.com` são páginas de
spam/redirect com paths absurdos (`/%20%20%20...`, textos de copyright chineses/franceses
injetados) — evidência de que o domínio **expirou e foi re-registrado por terceiros** depois que
a Schneider Electric o abandonou. Isso é consistente com a ferramenta estar completamente
descontinuada da web viva, restando apenas os snapshots antigos (pré-abandono) como fonte
possível — e é exatamente esses snapshots antigos que o playback fora do ar impediu de ler nesta
rodada.

---

## 3. Corroboração via fontes secundárias (não-Wayback, mas achadas ao investigar o Wayback)

Enquanto o Wayback estava fora do ar, buscas web (WebSearch/WebFetch, não Wayback) confirmaram
fatos públicos sobre a ferramenta que ajudam a interpretar os metadados CDX acima:

- **Lançamento:** "APC Launches Data Center Planning Tools" (DatacenterKnowledge, 30 mai 2008)
  — suíte de 7 ferramentas em `tools.apc.com`, incluindo a "Energy Efficiency Calculator", que
  "profiles a data centre and calculates the resulting efficiency and electrical cost based on
  data centre characteristics" usando um **"tested and validated three-parameter efficiency
  model"** — confirmando textualmente que o motor da ferramenta é o modelo de 3 parâmetros
  (no-load / proportional / square-law) do White Paper 113 (ver §4).
- **`tt=6`** aparece em buscas como o parâmetro de query associado à "Data Center Efficiency
  Calculator" especificamente (`apc.com/tool/?tt=6`), dentro do launcher multi-tool
  `/tool/index.cfm?tt=N&cc=XX` — confirmado pelo próprio snapshot CDX (§2.1, linha 3).
- **Blog SE (abr/2012), "Data Center Efficiency Calculator – A Tool for Modeling Your Current
  and/or Future PUE"** — existe e tem esse título exato (confirmado via busca), mas o
  `blog.se.com` ao vivo devolveu `403 Forbidden` ao WebFetch direto (mesmo bloqueio de bot que o
  brief already antecipava para o site principal da SE) — não foi possível ler o conteúdo, nem
  ao vivo nem via Wayback (fora do ar). **Conteúdo do post não recuperado nesta rodada.**

---

## 4. O que FOI recuperado nesta pesquisa geral (mas não via Wayback — declarado com transparência)

Para não deixar a pergunta original sem resposta prática, dois canais **fora do escopo estrito
"Wayback"** desta tarefa já haviam sido explorados nesta mesma pasta de pesquisa (por esta sessão
e por trabalho anterior já presente no repositório) e devem ser citados para o time não duplicar
esforço:

1. **White Papers oficiais baixados diretamente e ao vivo** de
   `download.schneider-electric.com` (este host, diferente de `tools.apc.com`/`se.com`, não
   bloqueou o fetch): WP-113 "Electrical Efficiency Modeling for Data Centers" (Neil Rasmussen)
   e WP-154 "Electrical Efficiency Measurement for Data Centers". Estes descrevem o **modelo
   teórico** por trás do motor de cálculo da ferramenta (perdas no-load + proporcional +
   quadrática por componente — UPS 4%+5%, PDU 1.5%+1.5%, CRAC 9%+0%, Chiller plant 6%+26%, etc.)
   e confirmam explicitamente que "a computer model based on these principles has been
   implemented" na metodologia de TCO/PUE da APC/SE. Detalhamento completo já está em
   `R1-white-papers-se.md` nesta mesma pasta — não duplicado aqui.
2. **`fonte-xcelsius/` (já presente nesta pasta, extraído por rota independente do Wayback):**
   contém o runtime JS decompilado de um dashboard **SAP BusinessObjects Xcelsius** (a tecnologia
   Flash usada por muitas TradeOff Tools da era 2008-2014) — `cells_1.js`, `components_1.js`,
   `settings_1.js` etc. — e uma extração já processada em `fonte-xcelsius/extraido/*.md` com as
   abas da planilha interna da calculadora: `03-Crystal-Interface` (467 células — inclui os
   dropdowns Yes/No de arquitetura/redundância, moedas $/€/£/¥/Fr, textos de UI), `04-Power-Meters`
   (458 células), `05-Device-Losses` (422 células — os coeficientes reais por dispositivo, em
   fórmulas do tipo `this.If(this.equals([Device Losses!r7c19],"No"),0.045,0.005)`, isto é,
   valores condicionais por seleção de dropdown — ex.: UPS com/sem redundância trocando entre
   perda proporcional 4,5% vs 0,5%). **Esta é a fonte mais próxima possível da "planilha real"
   por trás da ferramenta** — mais granular que qualquer HTML estático que o Wayback teria
   servido, porque expõe as fórmulas-fonte, não apenas a UI renderizada. Como não foi obtida por
   esta sessão via Wayback (não há evidência de proveniência registrada nesta pasta para essa
   extração), **não reivindico crédito por ela aqui** — apenas sinalizo que ela já responde boa
   parte do pedido original (§ "O QUE EXTRAIR" itens 1-3 do brief) e deve ser a referência
   primária do time, não este documento.

---

## 5. Resposta direta às 3 perguntas do brief — status por item

| # | Pedido | Status nesta rodada (Wayback) | Onde procurar o que falta |
|---|---|---|---|
| 1 | Opções exatas de dropdown (arquitetura, cooling, design details) | **Não recuperado via Wayback** (playback fora do ar) | `fonte-xcelsius/extraido/03-Crystal-Interface.md` já tem os valores "Yes"/"No" e índices numéricos de seleção — não confirmado se é 100% completo, mas é a fonte mais rica disponível hoje no repo |
| 2 | Constantes/coeficientes numéricos do modelo | **Não recuperado via Wayback** | Confirmado teoricamente via WP-113 (`R1-white-papers-se.md`, Tabela 2); coeficientes **literais da planilha real** (com condicionais por dropdown) estão em `fonte-xcelsius/extraido/05-Device-Losses.md` |
| 3 | Defaults e caso de saída default (PUE ~2.28?) | **Não recuperado via Wayback** — não foi possível confirmar nem refutar o valor "~2,28" citado no brief | Não localizado em nenhuma fonte desta rodada (nem WP-113, que usa PUE=2.13 e PUE=2.33[implícito 100/30] como exemplos ilustrativos do paper, não da ferramenta). Verificar `fonte-xcelsius/extraido/04-Power-Meters.md` ou `02-Interface-TXT.md` para o valor de saída default real da calculadora — fora do escopo desta rodada de investigar a fundo |

---

## 6. Recomendação de próximos passos (se o time quiser insistir no Wayback)

1. **Tentar novamente mais tarde** — a indisponibilidade observada tem padrão de outage de
   infraestrutura, não de bloqueio permanente; historicamente esses períodos dos últimos anos
   dO Internet Archive costumam se resolver em horas a poucos dias.
2. Se/quando o playback voltar, os 3 snapshots de maior prioridade (já localizados via CDX,
   prontos para re-tentativa direta sem nova busca) são:
   - `https://web.archive.org/web/20130620193231/http://www.apc.com/tool/index.cfm?`
   - `https://web.archive.org/web/20100527072851/http://www.apc.com/tool/?`
   - Qualquer snapshot de `apc.com/tool/index.cfm?tt=6&cc=EN` **anterior** a 2022 (o único
     localizado, de 2022, já é um redirect — precisa buscar CDX por `tt=6` com timestamp `<2020`
     especificamente, não tentado nesta rodada por orçamento de tempo).
3. Dado que `fonte-xcelsius/` já contém a fonte mais primária possível (a planilha de fórmulas,
   não a UI renderizada), **o valor marginal de insistir no Wayback para este pedido específico
   é provavelmente baixo** — a prioridade deveria ser validar/documentar o conteúdo já extraído
   em `fonte-xcelsius/extraido/`, não re-tentar o Wayback.

---

## 7. Arquivos desta rodada

- `docs/research/2026-08-17-pue-calculator/R2-wayback.md` (este arquivo)

Nenhum novo PDF, HTML ou dado bruto foi salvo nesta rodada — não houve conteúdo recuperável para
salvar (apenas metadados CDX, reportados inline acima em tabela, sem necessidade de arquivo
bruto separado).

*Pesquisa realizada em 2026-08-17. Todas as tentativas de acesso ao Wayback Machine foram
verificadas por chamadas reais (curl com código de status HTTP), não por suposição. Onde um dado
não foi encontrado, isso é declarado explicitamente como "não recuperado" — nenhum valor foi
inventado ou extrapolado para preencher lacunas.*
