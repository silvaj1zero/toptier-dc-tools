Vou mapear o estado atual (2025–2026) das calculadoras gratuitas de data center, começando pelos fornecedores e institutos que você listou.Agora vou abrir as páginas canônicas dos fornecedores para confirmar o que ainda está no ar e como capturam lead.Faltam detalhes de lead capture, ABB, Sunbird, Iceotope e as independentes. Vou abrir as páginas de produto.Pesquisa com base no estado **público das páginas em agosto de 2026**. Onde o fetch não conseguiu executar o app (SPA/Flash/login), está marcado como **precisa verificação**.

---

# Ferramentas gratuitas de cálculo/avaliação para data centers (2025–2026)

Escopo: calculadoras e assessments **online e sem custo de licença**. Trials de software (DCIM) entram só quando o vendor os posiciona como substituto de calculadora. Serviços pagos (Tier Certification, Efficient IT, Sustainability Assessment) **não** são “ferramentas gratuitas”.

---

## 1. Schneider Electric — TradeOff Tools

| | |
|---|---|
| **Dono** | Schneider Electric (legado APC/Schneider Data Center Science Center) |
| **Hub** | [se.com/ww/en/.../trade-off-tools](https://www.se.com/ww/en/work/solutions/data-centers-and-networks/trade-off-tools/) |
| **O que calcula** | Suíte de **~30 ferramentas** de “what-if” (CapEx, PUE, CO₂e, TCO, cooling, UPS, DCIM ROI). Vídeo corporativo de **julho/2026** descreve “20+” / “more than 30” tools e relança o **Data Center Capital Cost Calculator** para densidades AI / liquid cooling. |
| **Lead capture** | Hub **aberto**. Cada ferramenta é um app no site SE. **Precisa verificação** se PDF/salvar cenário exige conta mySchneider. Uso pontual historicamente **não gated**; o funil é conteúdo + “Get a Quote”. |

### Inventário vivo no hub (agosto/2026)

Confirmados **listados e linkados** no hub global:

**Custo / TCO / ROI**
- Data center capital cost (CapEx) calculator — **atualizado 2026** (AI, liquid, densidade)
- Prefabricated vs. traditional cost calculator
- Traditional vs. OCP capital cost calculator
- Data center build vs. colocation TCO calculator
- Prefabricated data center service ROI calculator
- DCIM monitoring value calculator (distributed IT)
- DCIM planning and modeling value calculator
- Edge UPS fleet management calculator
- Single-phase Li-ion vs. VRLA UPS TCO
- Three-phase Li-ion vs. VRLA UPS battery TCO

**Eficiência / PUE / energia**
- Data center efficiency and PUE calculator
- Cooling economizer mode PUE calculator
- Data center electrical power sizing calculator (IT load × PUE; inclui **AI/HPC servers**)
- Data center capacity and growth planning calculator
- Three-phase UPS efficiency calculator
- Single-phase UPS efficiency calculator
- eConversion vs. double conversion calculator
- Three-phase UPS modernization calculator
- Rack power architecture efficiency calculator (12 V / 48 V)
- Data center AC vs. DC efficiency calculator
- Data center and edge global energy forecast

**Carbono**
- Data center lifecycle CO₂e calculator (Scopes 1–3; lançado 2023, ainda listado)
- Micro data center lifecycle CO₂e calculator
- Data center carbon footprint calculator
- Server carbon and energy allocation calculator
- Site electricity emission factor calculator
- Flywheel vs. battery carbon footprint calculator

**Cooling / espaço / pod**
- Data center cooling architecture calculator
- Data center InRow cooling containment selector
- InRow ancillary IT equipment cooling calculator
- Data center IT equipment pod sizing calculator
- Temperature rise after power loss calculator

**Pontos fortes:** maior suíte científica do mercado; white papers por trás de cada tool; atualização 2026 no CapEx para AI; cobertura rara (CO₂e de ciclo de vida, prefab vs stick-built, OCP vs tradicional, 48 V).  
**Pontos fracos:** fragmentação (30 silos, não um modelo único); UX corporativa SE (cookie walls, JS pesado); PUE calculator devolveu HTML quase vazio no fetch — **possível app legado/quebrado, precisa verificação ao vivo**; viés de produto (InRow, Galaxy UPS, EcoStruxure DCIM).

---

## 2. Vertiv

| | |
|---|---|
| **Dono** | Vertiv (legado Emerson Network Power / Liebert) |
| **Hub** | [vertiv.com/.../tools-applications](https://www.vertiv.com/en-us/support/tools-applications/) |
| **O que calcula** | Quase **não** há PUE/TCO de facility. O catálogo é **seletor de produto** + um economizer + um configurador modular. |
| **Lead capture** | Selectors e economizer: **abertos** (sem login no marketing). Modular Designer Lite (EMEA, 2024): Vertiv afirmou **sem login**. Versão US aponta `vertivmodulardesigner.vertiv.com/lite` — **precisa verificação** se o lite ainda é anônimo. |

**Ferramentas vivas**
- **Free Cooling Economizer Calculator** — horas de economização Liebert DSE por geografia/carga ([página](https://www.vertiv.com/en-us/support/tools-applications/free-cooling-economizer-calculator/)). Estimativa, não PUE de projeto.
- **UPS Selector / Channel Product Selector / Liebert APS Selector / rPDU Finder** — matching de SKU.
- **UPS Interactive Runtime Tools** — gráficos de autonomia (PSI5, GXT5, ITA2, EXS).
- **Vertiv Modular Designer Lite** — configurar SmartMod / SmartMod Max (PFM).
- **AI Reference Design Selector** — chat/selector de referência AI (`aihubChatInterfaceUSA.htm`).
- **TCO Li-ion UPS** (EMEA): [vertiv.com/en-emea/.../tco-calculator](https://www.vertiv.com/en-emea/support/tools-and-application/tco-calculator/) — TCO de bateria, **não** TCO de DC.
- **AI Load Simulator** — equipamento de lab (vídeo nov/2025), **não** é calculadora web pública.

**Pontos fortes:** configurador 3D de módulo (UX moderna); economizer geográfico; runtime UPS honesto.  
**Pontos fracos:** **lacuna enorme vs Schneider** em PUE/CapEx/carbono de facility; tools empurram SKU Vertiv; sem modelador de densidade/espaço genérico.

---

## 3. Eaton

| | |
|---|---|
| **Dono** | Eaton |
| **URLs** | TCO: [tco.eaton.com/.../index.html](https://tco.eaton.com/EatonTCOCalc/EatonTCOCalc_Client/app/index.html) · UPS Selector: [upsselector.eaton.com](https://upsselector.eaton.com/) · Sizing guide: [eaton.com/.../ups-sizing-guide](https://www.eaton.com/us/en-us/products/backup-power-ups-surge-it-power-distribution/backup-power-ups/ups-sizing-guide.html) |
| **O que calcula** | **TCO de UPS** (Eaton vs “other UPS”: perdas, serviço, baterias, gráfico). **UPS Selector / Load Calculator** (kVA + runtime). Guia de sizing (texto + 15% growth/5 anos). **Não** calcula PUE de sala, cooling, espaço ou TCO de data hall. |
| **Lead capture** | Apps web públicos. Fetch do TCO devolveu SPA vazia — **precisa verificação** se pede email para exportar. Selector historicamente aberto. |

**Pontos fortes:** TCO de UPS é o melhor do trio power (compara eficiência em carga parcial).  
**Pontos fracos:** escopo **só power chain de UPS**; zero cooling/PUE/espaço.

---

## 4. ABB

| | |
|---|---|
| **Dono** | ABB |
| **Achado** | **Não há calculadora pública de PUE/TCO/sizing de data center.** |
| **O que existe** | [Energy Savings Calculator](https://nema-energysave.us.abb.com/) de **motores/drives** (não DC). [Drive & Motor selector](https://selector.drivesmotors.abb.com/). Páginas de TCO de UPS modular são **marketing**, não app. Switchgear selectors (Emax 3). Calculadora CO₂e é **marine**, não DC. |
| **Lead capture** | Selectors de produto: tipicamente abertos ou quote-gated. |

**Pontos fortes:** ABB é relevante em MV/LV, drives de chiller, 800 V DC — mas isso **não está empacotado** como ferramenta DC.  
**Pontos fracos:** **buraco competitivo**. Quem procura “ABB data center calculator” cai em artigos de eficiência, não em tool.

---

## 5. Sunbird / dcTrack (Legrand)

| | |
|---|---|
| **Dono** | Sunbird Software (portfólio Legrand Data Center Solutions) |
| **URLs** | [sunbirddcim.com](https://www.sunbirddcim.com/) · Trial: [sunbirddcim.com/30-Day-Trial](https://www.sunbirddcim.com/30-Day-Trial) · Pricing: [sunbirddcim.com/pricing](https://www.sunbirddcim.com/pricing) |
| **O que calcula** | **Não é calculadora.** É DCIM: assets, capacidade (espaço/power/cooling/ports), change, energy. dcTrack 9.3.5 (jul/2026) ainda no ar. |
| **Lead capture** | **Gated.** “Free 30 Day Trial — With Your Own Data” pede **email\*** no hero. Também há demo online com credenciais. Preço público: PowerIQ ~US$ 5,50/node/mês; dcTrack Operations ~US$ 19,50/rack/mês (valores da página de pricing — confirmar no checkout). |

**Pontos fortes:** único player desta lista com **planejamento real de espaço/densidade** (floor + rack 2D/3D).  
**Pontos fracos:** não é self-serve calc; 30 dias + onboarding; não modela PUE de *projeto* (opera o que já existe).

---

## 6. Uptime Institute — o que é público vs pago

| | |
|---|---|
| **Dono** | Uptime Institute |
| **Hub de tools** | [uptimeinstitute.com/resources/tools](https://uptimeinstitute.com/resources/tools) |

**Público / self-service (agosto/2026)** — só **dois**:

1. **Cloud Carbon Explorer** — [página](https://uptimeinstitute.com/resources/tools/cloud-carbon-explorer). Mapas AWS / GCP / Azure: migrar workload entre regiões (carbono × custo × latência). **Aberto**, com form de contato Intelligence no rodapé (soft gate). **Não é PUE de facility.**
2. **Outage Severity Rating (OSR)** — [página](https://uptimeinstitute.com/resources/tools/outage-severity-rating). Framework qualitativo de gravidade de outage (não calcula kW).

**Não são ferramentas gratuitas** (profissional / certificatório):
- Tier Certification (Design / Constructed / Operations / Tier-Ready)
- **Efficient IT Assessment**
- **Sustainability Assessment** (lançado 2024)
- **Data Center Healthcheck**
- M&O Stamp, AI Infrastructure Advisory
- Global Data Center Survey 2025/2026 — **relatório**, tipicamente gated (email/Network)

**Pontos fortes:** autoridade de benchmark (PUE médio da industry no survey; 2025 citado ~**1.54**). Cloud Carbon Explorer é o único tool “de consultoria” realmente jogável.  
**Pontos fracos:** **não há calculadora PUE/TCO/sizing pública.** O Instituto monetiza assessment, não self-serve engineering.

---

## 7. 42U

| | |
|---|---|
| **Dono** | 42U (revenda/consultoria de infraestrutura) |
| **URL principal** | [42u.com/efficiency/energy-efficiency-calculator.htm](https://www.42u.com/efficiency/energy-efficiency-calculator.htm) |
| **O que calcula** | **PUE Energy Efficiency Savings:** PUE atual → PUE alvo, US$/kWh, IT load (kW) → facility load, economia 1/5/10 anos (kWh, US$, toneladas CO₂, “veículos”). Há fórmulas de heat load/BTU em páginas de rack (conteúdo **2014**). |
| **Lead capture** | Calculadora **aberta** (sliders). Form “Tell us about your project” no rodapé. Soft CTA para programa de eficiência. |

**Pontos fortes:** o simulador de economia PUE mais simples e didático da lista; escala “Very Inefficient → Very Efficient”.  
**Pontos fracos:** **preços de eletricidade EIA 2010**; média Uptime citada como PUE 2.5 (desatualizado vs 1.54 do survey 2025); sem modelagem de arquitetura; site visualmente datado; virtualização mencionada no texto **mas não calculada**.

---

## 8. Imersão / liquid: Submer, Iceotope, e o que realmente está vivo

### Submer

| | |
|---|---|
| **Dono** | Submer Group (Espanha) |
| **URL citada** | [submer.com/smart-tools](https://submer.com/smart-tools/) |
| **Estado 2026** | **Mortas.** Blog ainda aponta “Smart PUE Calculator”, mas a categoria Smart tools retorna **“Nothing found.”** Site atual repositionou para “connected intelligence / AI infrastructure”, sem calc visível. |
| **Lead capture** | N/A (tool down). Contact form institucional. |

**Precisa verificação** se a calc migrou para portal de cliente. No público, **não está viva**.

### Iceotope

| | |
|---|---|
| **Dono** | Iceotope (precision / chassis-level liquid cooling) |
| **URL citada em blogs 2024–2026** | `iceotope.com/roi-calculator` |
| **Estado 2026** | **404 Not Found.** Marketing cita −40% energia, −100% água, −84% cooling — **sem ferramenta**. |

### Substitutos de imersão que *estão* no ar

| Ferramenta | Dono | URL | O que calcula | Gate |
|---|---|---|---|---|
| **GRC TCO Calculator** | Green Revolution Cooling | [grcooling.com/grc-tco-calculator](https://www.grcooling.com/grc-tco-calculator/) | Savings vs air: W, U, servers, US$/kWh | Aberto (assumptions de média setorial) |
| **Midas TCO Calculator** | Midas Immersion Cooling | lançado **18/jul/2025** (PR Newswire); URL citada `midasimmersioncooling.com/financial-calculator/` | CapEx/OpEx: energia, floor-space, longevidade HW | **Precisa verificação** de email |
| **OCP Immersion TCO model v1.1** | Open Compute Project Foundation | release 2025 (workstream CE Immersion) | Modelo **aberto/peer-reviewed** ar vs liquid: energia, água, área, PUE/WUE/ERE | Planilha/comunidade, **não** web-app polido |

---

## 9. Calculadoras independentes (PUE / TCO / sizing)

### Lawrence Berkeley / DOE CoE — toolkit “oficial” de assessment

| | |
|---|---|
| **Dono** | LBNL Center of Expertise for Data Center Energy (DOE) |
| **URL** | [datacenters.lbl.gov/tools](https://datacenters.lbl.gov/tools) |
| **O que calcula** | **DC Pro + PUE Estimator** (profiling early-stage); **Air Management Tool/Estimator**; **Electrical Power Chain Tool** (UPS/PDU/transformer, ecomode, payback — v2.1 mar/2020); **IT Efficiency Tool**; worksheets de assessment. |
| **Lead capture** | **Aberto.** Downloads Excel/PDF. Sem cadastro. |

**Forte:** metodologia governamental, AM (air management) que vendors não dão de graça. **Fraco:** Excel 2014–2020, UI de engenheiro, pouco AI/liquid.

### Resistance Zero (independente, 2025–2026)

| | |
|---|---|
| **Dono** | Bagus Dwi Permana (engenheiro, CDFOM) — projeto educacional |
| **URL** | [resistancezero.com/datacenter-solutions.html](https://resistancezero.com/datacenter-solutions.html) |
| **O que calcula** | 12+ tools: PUE (clima + cooling type), TCO build vs colo vs cloud (12 mercados, 2025), CAPEX (14 componentes), OPEX (30+ países), ROI/NPV/IRR, carbon Scope 1/2/3, air vs liquid, CDU, fire suppression NFPA, TIA-942 checklist, Tier advisor. **Client-side, sem signup.** |
| **Lead capture** | **Aberto.** Declara AACE Class 4–5 (±30–50%). |

**Forte:** a suíte independente mais completa de 2026; PDF; Monte Carlo. **Fraco:** um autor, não institutos/OEM; precisão conceitual, não investment-grade; visual “dashboard hobbyist-pro”.

### AKCP

| | |
|---|---|
| **Dono** | AKCP (sensores ambientais, desde 1981) |
| **URLs** | [PUE & DCiE](https://www.akcp.com/pue-and-dcie-calculator/) · [Design Calculator](https://www.akcp.com/data-center-design-calculator/) |
| **O que calcula** | PUE/DCiE instantâneo (facility vs IT load) + custo anual + escala de eficiência + **free-cooling days** por localização. Design calc: IT MW, design PUE → potência/cooling. |
| **Lead capture** | Calc **aberta** (“Nothing you type leaves this page”). Soft gate: Calendly **PUE Health Check 15 min** + form. |

### puecalculator.com

| | |
|---|---|
| **Dono** | Independente (marca PUECalculator.com) |
| **URL** | [puecalculator.com](https://puecalculator.com/) |
| **O que calcula** | PUE a partir de **kWh mensal** facility vs IT (+ energy cost calc). |
| **Lead capture** | Aberto. Partnership CTA no rodapé. Analytics dashboard (possível cookie). |

**Fraco:** aritmética de 2 números; copy de SEO; média global citada 1.67 (conflita com Uptime 1.54).

### Outros (menor relevância)

- **TierPoint Data Center Pricing Calculator** — build vs colo (lead de colo).
- **WebWerks TCO** — Índia, captive vs colo.
- **toolgrit DC power & cooling** — racks × kW × tier × climate → IT load, tons, UPS, generator, PUE, CO₂. Independente; **precisa verificação** de qualidade do modelo.
- **Google datacenters.google/efficiency** — *não* é calc; publica PUE fleet **1.09 (2025)** como benchmark.

---

## (1) Tabela comparativa: quem tem o quê vs suíte hipotética

Legenda: **●** nativo e usável · **◐** parcial / enviesado / trial · **○** ausente · **✝** existiu e caiu

| Capacidade da suíte hipotética | Schneider | Vertiv | Eaton | ABB | Sunbird | Uptime | 42U | Submer | Iceotope | LBNL/DOE | Resist. Zero | AKCP | GRC/Midas |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Calculadora PUE** (medir/estimar) | ● eficiência + economizer | ○ | ○ | ○ | ○ | ○ (só survey) | ● simples | ✝ | ○ | ● DC Pro | ● | ● | ◐ (efeito no TCO) |
| **Simulador de economia** (ΔPUE → US$/CO₂) | ● vários (UPS, carbon, CapEx) | ◐ economizer hrs | ● TCO UPS | ◐ motors | ○ | ◐ Cloud Carbon | ● 1/5/10 anos | ✝ | ✝ ROI 404 | ● Power Chain payback | ● ROI/OPEX | ◐ custo anual | ● TCO imersão |
| **Virtualização / consolidação IT** | ○ (só carbon allocation de *server*) | ○ | ○ | ○ | ○ | ◐ Efficient IT **pago** | ○ (só copy) | ○ | ○ | ● IT Efficiency Tool (Excel) | ○ | ○ | ○ |
| **Modelador PUE de projeto** (arquitetura + clima + load) | ● cooling arch. + economizer + power sizing AI | ◐ DSE only | ○ | ○ | ○ | ○ | ○ | ✝ | ○ | ◐ DC Pro (existente, não greenfield AI) | ● cooling type + climate | ◐ design PUE input | ○ |
| **Planejador espaço / densidade** | ◐ pod sizing + InRow containment (não floorplan) | ◐ Modular Designer (só SmartMod) | ○ | ○ | ● dcTrack **trial 30d** | ○ | ○ | ○ | ○ | ○ | ◐ raised floor vs slab (texto/comparativo) | ○ | ◐ floor-space no TCO |

Leitura: **ninguém entrega a suíte inteira de graça.** Schneider cobre 4/5 no papel, mas em 30 apps desconectados e **sem virtualização nem floorplan**. Sunbird tem o 5º eixo e cobra trial. Vertiv/Eaton/ABB são seletores de SKU.

---

## (2) Top 5 lacunas — o que ninguém oferece *bem* de graça hoje

Oportunidades best-of-breed (não “mais um PUE = kW/kW”).

### 1. Virtualização × facility: o elo IT↔infra que todos citam e ninguém calcula
Nenhuma calc gratuita amarra **vCPU/VM consolidada → kW IT retirado → cooling desligado → CapEx evitado de novo hall**. LBNL tem Excel de IT efficiency (2010s). 42U *menciona* virtualização no texto e **não modela**. Uptime Efficient IT é serviço pago.  
**Produto:** “retirar 200 servidores @ 40% util → ΔPUE, ΔkW, Δracks, ΔUS$/10 anos, vs buy-new-GPU”.

### 2. Planejador de espaço/densidade self-serve (não DCIM)
Sunbird faz isso **dentro** de um DCIM com email + 30 dias. Schneider para no *pod sizing*. Não existe um **floor planner gratuito**: white space, hot/cold aisle, kW/rack misto (8 kW air + 80 kW DLC), restrição de piso, CDU/RDHx, “quantos racks cabem neste retângulo”.  
**Produto:** canvas 2D + heatmap de kW/m² + alerta de aisle pitch ASHRAE, export PDF. Sem asset database.

### 3. PUE de projeto para **AI/liquid** (PUE clássico é métrica errada)
Vertiv/NVIDIA (ASME InterPACK) documentaram: liquid muda **numerador e denominador**. Ninguém oferece de graça um modelador que saia **PUE + WUE + ERE + kWh/IT-work** (não só kWh/kWh) com split air / RDHx / DLC / imersão, clima TMY, e carga GPU 40–150 kW/rack. Schneider atualizou CapEx 2026, mas as tools de PUE continuam no paradigma ar. Submer/Iceotope **derrubaram** as próprias calcs. OCP v1.1 é planilha de comitê.  
**Produto:** “design PUE/WUE/ITE-productivity” com três arquiteturas lado a lado e disclaimer ISO 30134.

### 4. Simulador de economia **acionável** (não “se o PUE cair de 1.8 para 1.4”)
42U e AKCP fazem ΔPUE → dinheiro com 4 inputs. O que falta: **pacote de medidas** (containment, setpoint, economizer hours, UPS eco-mode, blanking, virtualização) com **interação** (as economias não somam), payback e risco. LBNL Power Chain + AM Tool fazem um pedaço em Excel de 2014–2020.  
**Produto:** wizard de 8 alavancas, waterfall de kWh, “não some 2× o mesmo kW”.

### 5. Assessment público de **maturidade operacional** (o Uptime não libera)
Uptime tem OSR + Cloud Carbon e **vende** Healthcheck / M&O / Sustainability. Não há self-score gratuito estilo: energia (ISO 50001 / PUE medido vs de placa), água, resiliência, densidade stranded, decommissioning. O “starter kit de decommissioning” do Uptime é PDF, não tool.  
**Produto:** 20 perguntas → score + gap list + “você está no PUE 1.54 (média 2025) ou no 1.09 (Google)”. Sem vender certificação.

**Menções honrosas** (quase-lacunas): heat-reuse/ERE web-app; CFD-lite de corredor (todo CFD é pago); grid interconnection / stranded MW; WUE+CUE no mesmo canvas que PUE.

---

## (3) Padrões de UX/visual das que *parecem* profissionais

O que separa “calculadora de blog 2010” de ferramenta que um diretor de facilities usa numa reunião.

### O ouro (Schneider TradeOff, vintage APC Science Center)
- **Um problema por tela**, não um ERP: 6–10 inputs, 1–3 gráficos.
- **Sliders + resultado ao vivo** (PUE, US$/ano, tCO₂) — o cérebro trata como instrumento, não formulário.
- **White paper atrás** (TT0 overview PDF): a UI é a ponta de um modelo publicado. Credibilidade > pixels.
- **Cenário A vs B** (Li-ion vs VRLA, prefab vs traditional, eConversion vs double conversion): o output é *tradeoff*, não um número órfão.
- Fraqueza visual 2026: chrome SE pesado, cookie consent, tools que parecem Flash portado.

### O moderno self-serve (Resistance Zero, AKCP, Vertiv Modular Designer Lite)
- **Zero signup no caminho crítico.** AKCP escreve na cara: “Nothing you type leaves this page.” Resistance Zero: 100% client-side. Vertiv Modular Designer: “no logins or downloads.” Confiança = não sequestrar o email antes do valor.
- **Escala visual de eficiência** (AKCP/42U): 1.2 / 1.5 / 2.0 / 2.5 / 3.0 como régua. O usuário se posiciona em 2 segundos.
- **Unidades e validação inline** (“facility load can’t be smaller than IT load”) — AKCP. Profissionalismo é impedir o PUE 0.7.
- **Export PDF / cenário** (Resistance Zero, Eaton TCO graph). Reunião exige artefato, não screenshot.
- **3D/configurador** (Vertiv Modular Designer): a única UX “produto” da lista. Arrastar módulos > preencher kVA.
- **Geografia como input de primeira classe** (Schneider economizer, Vertiv DSE, AKCP free-cooling days). PUE sem clima é fanfic.

### O que *não* parece profissional (e ainda está no ar)
- Preços de eletricidade **EIA 2010** (42U).
- SEO shell em volta de `PUE = A/B` (puecalculator.com).
- CTA de Calendly **antes** do resultado.
- Links mortos (Submer Smart Tools, Iceotope ROI) — pior sinal possível: o vendor não usa a própria ferramenta.
- Excel do DOE sem refresh 2020–2026 para AI/liquid.

### Padrão de funil das melhores
1. Valor **imediato** (número + gráfico) sem cadastro.  
2. Soft gate **depois**: white paper, “talk to an engineer”, trial DCIM.  
3. Nunca bloquear o primeiro what-if. Schneider e AKCP acertam; Sunbird e Uptime (surveys) erguem o muro cedo demais para *cálculo*.

---

## Síntese executiva

Em 2025–2026 o mapa é assim:

- **Schneider ainda é o padrão de ouro gratuito** (~30 TradeOff Tools; CapEx relançado jul/2026). Ninguém chegou perto em amplitude científica.
- **Vertiv, Eaton, ABB** recuaram para **product finders**. ABB praticamente **não joga**.
- **Uptime não oferece assessment de facility grátis** — só Cloud Carbon + OSR.
- **Sunbird** é o único planejador de espaço de verdade, e **não é calc**.
- **Imersão:** Submer e Iceotope **desligaram** as calcs; GRC/Midas/OCP preencheram o vazio.
- **Independentes** (LBNL, Resistance Zero, AKCP) cobrem PUE/economia melhor que Vertiv/Eaton, com UX mais honesta.

Uma suíte hipotética (PUE + economia + virtualização + PUE de projeto + espaço/densidade) **não existe**. O espaço vazio mais valioso não é “mais uma calculadora PUE”: é **(1) virtualização→facility, (2) floor/density planner sem DCIM, (3) PUE/WUE/ERE para AI-liquid, (4) economia por alavanca com interações, (5) maturidade operacional self-score**.

---

*Fontes primárias consultadas em 22/08/2026: hubs Schneider, Vertiv Tools, Eaton TCO/Selector, ABB, Sunbird trial/pricing, Uptime Tools, 42U, Submer smart-tools (vazio), Iceotope ROI (404), LBNL CoE, Resistance Zero, AKCP, puecalculator.com, GRC, Midas PR 18/07/2025. Itens SPA (Eaton TCO, Schneider PUE app, Vertiv Designer login US) marcados para verificação ao vivo no browser.*
