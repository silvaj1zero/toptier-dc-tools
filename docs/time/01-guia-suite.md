# Top Tools — Guia da Suíte

> Material de referência para o time. Explica o que é a suíte, o que cada ferramenta faz,
> em que base metodológica se apoia e como funciona o padrão único de captação de leads.
>
> **Produção:** https://ferramentas.toptier.net.br · **Repo:** `silvaj1zero/toptier-dc-tools`

---

## 1. O que é a suíte

O **Top Tools** é o conjunto de ferramentas abertas de eficiência para data centers da
**Top Tier Infrastructure®**. Ele existe para uma função comercial clara: ser o **teaser
público de geração de leads** dos serviços e treinamentos da Top Tier.

O posicionamento é "metodologia aberta": **toda fórmula, fator e fonte está exposta** —
diferente das calculadoras clássicas do mercado (tarifas de 2010, benchmarks obsoletos,
fatores ocultos). A régua de comparação é a de 2025, não a de 2010.

Três provas sustentam a autoridade:

1. **Metodologia aberta** — nenhum número sem fonte, nenhuma fórmula oculta (página `/metodologia/`).
2. **Engines validados** — réplicas transpiladas e testadas (610/610 pontos exatos no Modelador de PUE contra a ferramenta original da Schneider).
3. **Benchmarks atuais** — Uptime Institute 2025, ISO/IEC 30134, dados brasileiros ANEEL/MCTI.

## 2. As ferramentas (6 + metodologia)

### 2.1 Calculadora de PUE — `/calculadora-pue/`
- **O que faz:** calcula PUE e DCiE conforme ISO/IEC 30134-2 e The Green Grid; compara com benchmarks 2025 (média global 1,54 — Uptime Institute); estima custo anual em reais com bandeira tarifária; WUE e CUE opcionais.
- **Diferencial:** leitura regulatória incluída (lei alemã EnEfG e diretiva europeia EED) e contexto tarifário brasileiro.
- **Para quem:** porta de entrada — qualquer gestor de infraestrutura que queira saber "quão eficiente é meu data center".

### 2.2 Simulador de Economia de Energia — `/simulador-economia/`
- **O que faz:** projeta a economia em kWh, reais e toneladas de CO₂e ao reduzir o PUE, em horizontes de 1, 5 e 10 anos, com fatores de emissão do grid brasileiro.
- **Diferencial:** sugere medidas típicas para cada faixa de ganho — transforma métrica em plano.
- **Para quem:** quem precisa justificar investimento em eficiência para a diretoria (business case em R$).

### 2.3 Calculadora de Virtualização — `/calculadora-virtualizacao/`
- **O que faz:** simula consolidação de servidores e o efeito no PUE e na conta anual — incluindo o **paradoxo do PUE** (consolidar sem right-sizing piora a métrica).
- **Base:** reconstrução com metodologia aberta do TradeOff Tool descontinuado da Schneider (White Paper 118), com curve fit publicado, curvas LBNL como bounds e validação empírica em 311 instalações (CoC/JRC + LBNL).
- **Para quem:** times de infraestrutura planejando consolidação/virtualização.

### 2.4 Modelador de PUE de Projeto — `/modelador-pue/`
- **O que faz:** estima o PUE a partir das decisões de arquitetura — UPS, redundância, água gelada vs. DX, economizador e 13 detalhes de projeto — com curva PUE × carga, alocação de energia por subsistema e comparação de até 4 cenários.
- **Base:** réplica **exata** da SE Data Center Efficiency and PUE Calculator (planilha Xcelsius transpilada célula a célula); validação massiva de **610/610 pontos exatos** (1e-6) contra a ferramenta original, auditada por dois revisores externos.
- **Para quem:** projetos novos e retrofits — fase de decisão de arquitetura.

### 2.5 Planejador de Espaço e Densidade — `/planejador-densidade/`
- **O que faz:** especifica espaço e densidade sem o "W/m² solto" que gera capacidade encalhada: declara gabinetes, potência média e pico, incerteza e reservas — e devolve área, densidade e capacidade na cascata **gabinete → pod → sala → instalação**.
- **Base:** transpilação 1:1 das planilhas do método Schneider White Paper #155, com cenários das planilhas originais fixados em teste.
- **Para quem:** planejamento de capacidade e expansão.

### 2.6 Pré-Diagnóstico de Maturidade Operacional (FOMM) — `/maturidade-operacional/`
- **O que faz:** em ~10 minutos, avalia a operação nas **7 disciplinas** do Facility Operations Maturity Model (Schneider WP #197): 18 perguntas, escala 1–5, radar de maturidade, critérios por nível (ícone "i") e os 3 gaps prioritários com recomendação.
- **Papel no funil:** é a ferramenta com o funil mais profundo — **gate de registro** (ver §3) e folder da **Auditoria e Certificação FOMM** para download.
- **Autoridade comercial:** metodologia exclusiva com score e software proprietários (**TierScope**), 10+ anos em clientes líderes, Zero Outage (IBM), certificações FOMM via **ICOR Internacional** (credencial ISO/IEC 17021-1).

### 2.7 Metodologia aberta — `/metodologia/`
Página que documenta normas, benchmarks e decisões metodológicas de todas as ferramentas.
É a prova pública do posicionamento — mostre-a quando o prospect duvidar de um número.

## 3. Padrão único de captação de leads

Todas as ferramentas captam leads no **mesmo padrão** (componente `LeadForm` + gate FOMM),
e todo lead chega ao mesmo destino com o mesmo esquema de campos.

### O formulário padrão (todas as páginas)
| Campo | Obrigatório? |
|---|---|
| Nome | Sim |
| E-mail corporativo | Sim |
| Empresa | Não |
| WhatsApp | Não (opcional, com aviso de finalidade) |
| Consentimento LGPD | Sim (checkbox com finalidade declarada) |

### O gate FOMM (só em `/maturidade-operacional/`)
Para **ver e baixar** o resultado e o folder, o prospect registra **nome + e-mail**
(WhatsApp opcional). Contato comercial **só** com o check de autorização marcado.
O registro nunca bloqueia: se o envio falhar, o prospect vê o resultado mesmo assim.
O lead FOMM chega com o **perfil completo por disciplina** (`fomm_*`).

### O que vai junto em todo lead (automático)
- `origem` — slug da ferramenta que gerou o lead (ex.: `calculadora-pue`, `fomm-gate`)
- `pagina` — path da página
- `referrer` + `utm_source/medium/campaign/term/content` — atribuição de campanha
- Anti-spam por honeypot (bots são descartados silenciosamente)

### Destino
Endpoint configurado na Vercel (`PUBLIC_LEAD_ENDPOINT` → **Formspree** `xwlezdjg`).
Sem endpoint configurado, o formulário degrada para `mailto:contato@toptier.net.br` — nunca quebra.

## 4. O que o time PODE e NÃO PODE dizer (gate de claims)

| ✅ Pode | ❌ Não pode |
|---|---|
| "Pré-diagnóstico auto-declarado, primeiro passo da jornada de auditoria" | "A ferramenta emite certificação" |
| "Escala 1–5 (WP #197)" | Escala "0–5" |
| "Certificações FOMM via ICOR Internacional (ISO/IEC 17021-1)" | Prometer certificação sem o processo de auditoria |
| "Score e software proprietários — TierScope" | Citar números de base de clientes não verificados (ex.: "1.229") |
| "Réplica aberta e validada do TradeOff Tool" | "Ferramenta oficial da Schneider" |
| **Zero menção a "MBA" no site público** (posicionamento desde 2026-08-17) | Ligar as ferramentas publicamente ao material de aula |

## 5. Jornada comercial (para onde o lead vai)

```
Ferramenta gratuita → lead qualificado (com origem + contexto de uso)
  → contato autorizado (LGPD)
    → Diagnóstico de prontidão FOMM (serviço)
      → Auditoria e Certificação FOMM (ICOR Internacional)
      → Consultoria e treinamentos Top Tier
```

O FOMM é o funil mais quente (o prospect declarou os próprios gaps). As calculadoras
são topo de funil: geram autoridade e capturam interesse com contexto da ferramenta usada.

---

*Guia da Suíte v1 — 2026-08-23. Complementos: `02-status-time.md` (estado atual),
`diagrama-ecossistema.html` (mapa visual), `index.html` (página de introdução).*
