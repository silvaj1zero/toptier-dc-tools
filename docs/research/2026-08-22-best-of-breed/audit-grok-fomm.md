Vou auditar a ferramenta FOMM contra os claims de compliance, o engine, a11y, UX e fidelidade ao WP #197. Começo pelos arquivos que você listou e pelo contexto das 7 disciplinas.Os arquivos principais estão lidos. Agora cruzo i18n, WP #197, CSS/a11y e as páginas que citam a ferramenta.Vou cruzar o WP #197 (7 disciplinas / 26 elementos), o CSS de a11y e o fluxo do LeadForm.**Veredito: REPROVADO.**

Não há P0 (a ferramenta não se declara certificação, a escala visível é 1–5 e o CTA pedido existe). O gate cai por P1 de claims (índice geral publicado cedo, convenção só no `<details>`), P1 de a11y do questionário e P1 de serialização no fallback do lead.

Critério usado: P0 = claim falso ou motor errado; P1 = quebra o gate de claims, a11y do fluxo ou o contrato 18→resultado→CTA; P2 = endurecimento.

---

## Gate de claims (o que passa)

| Regra | Resultado |
|---|---|
| Não se apresentar como certificação | **Passa.** Copy fala em pré-diagnóstico / auto-declarado. `methodNote` e `metodologia.astro` dizem que não emite certificação. |
| Escala 1–5, nunca 0–5 | **Passa no texto e no input.** Radios, legendas, i18n e `RangeError` rejeitam 0 e 6. |
| Média declarada como convenção (WP #197 não define índice) | **Falha parcial (P1).** O texto existe, mas não está ao lado do número. |
| CTA = «diagnóstico de prontidão FOMM» | **Passa.** `ctaButton` PT/EN bate com o gate. |

---

## Findings

### P1 — bloqueiam este gate

**C1 — O «nível geral» aparece como índice sem a convenção visível, e ainda por cima com quiz incompleto**

`FommAssessment.tsx:197–206` publica o stat destacado `Nível geral indicativo` + `score X / 5` a partir da 1ª resposta. A frase que o WP #197 **não** define índice, e que a média é convenção desta ferramenta, está só em `pt.ts:354–355` / `en.ts:351–352`, dentro de `<details>` recolhido (`FommAssessment.tsx:286–289`).

`calcularFomm` (`fomm.ts:131–132`) média **só as disciplinas já respondidas**. Uma disciplina em 5 vira «5 · Otimizado» com 16 perguntas em branco. Isso é o anti-padrão que o relatório do WP #197 chama de inventar «nível FOMM 3.2».

O rótulo «indicativo» não substitui a declaração de convenção ao lado do número.

**C2 — O texto cita a matriz impacto × facilidade do WP; o motor não a implementa**

`pt.ts:334–335` / `en.ts:333–334`: *«o próprio WP #197 recomenda priorizar por impacto × facilidade»*. O paper de fato tem essa matriz (Figura 6). O engine faz outra coisa: `fomm.ts:133,139` ordena por score crescente e corta 3. Priorizar por menor nota ≠ priorizar por impacto × facilidade. Claim de fonte sem fidelidade de método.

**U1 — Fluxo 18 → resultado → CTA está invertido**

O resultado (radar, tabela, gaps, «nível geral») monta em `FommAssessment.tsx:197` sempre que `result` é não-nulo, ou seja, após 1 resposta (`fomm.ts:129`). O CTA/lead só entra com `result.completo` (`:269–274`, `:294`) — essa metade está certa. A metade do resultado não: o utilizador vê um perfil a meio do questionário.

**A1 — Contraste dos rótulos da escala**

`.fomm-opt .t` é `font-size: 0.7rem` + `color: var(--tt-gray-500)` (`global.css:825–827`). `#6b7280` sobre branco ≈ **4,05:1**, abaixo de WCAG AA 4,5:1 para texto pequeno. São os nomes «Ad hoc / Repetível / …» em cada radio.

**A2 — `aria-live` no bloco inteiro de resultados**

`FommAssessment.tsx:197–198`: `<section className="results" aria-live="polite">` envolve stats, SVG, tabela e gaps. Cada radio reanuncia o bloco todo. O progresso já tem `role="status"` (`:192`). Live region deve ser uma frase curta, não a secção.

**A3 — Radios visivelmente ocultos, padrão frágil**

`global.css:812–816`: `position: absolute; opacity: 0; pointer-events: none` sem `clip`/`sr-only`. `.fomm-opt` (`:793`) **não** é `position: relative`, então o input absoluto pode sair do rótulo. Clique ainda funciona via `<label>`, e `:has(input:focus-visible)` (`:844–846`) pinta o cartão — mas o alvo de foco real pode não coincidir com o controlo visível.

O `role="radiogroup"` (`FommAssessment.tsx:164`) usa `aria-label` duplicando o `<p>` visível, em vez de `aria-labelledby`. Falta `for`/`id` por opção.

**L1 — Fallback mailto do lead descarta o perfil FOMM**

`fommParaLead` (`fomm.ts:148–156`) serializa nível, 7 disciplinas e gaps. O `LeadForm` copia isso para o `FormData` quando há endpoint (`LeadForm.tsx:43–45`). Sem `PUBLIC_LEAD_ENDPOINT`, o `mailto:` (`:52–56`) manda só nome, e-mail, empresa e URL. O contrato «serialização para lead» quebra no caminho degradado — o mesmo que a R2 já tinha marcado como resolvido só para a página de origem.

---

### P2 — não reabrem o gate sozinhos

| ID | Onde | Finding |
|---|---|---|
| **C3** | `pt.ts:352`, `maturidade-operacional.astro:27–29` | «auditoria FOMM completa» pode soar a selo Schneider. O paper não certifica; recomenda terceiro independente. Residual, não é a ferramenta a certificar. |
| **C4** | `maturidade-operacional.astro:36–37` | «Compare o seu perfil com o benchmark do setor» — o WP #197 não publica benchmark setorial; a UI não mostra nenhum. |
| **C5** | `maturidade-operacional.astro:13` | «~70% das interrupções… erro humano» é cifra Uptime TCOS, não do WP #197, e está sem fonte. |
| **E1** | `fomm.ts:117,121` | Disciplina sem resposta fica `score: 0` e `nivel: 1` por baixo. A tabela esconde com «—»; o radar plota no centro (`FommAssessment.tsx:30`, `Math.max(score, 0.35)`), eixo visual 0–5. |
| **E2** | `fomm.ts:140` | Empate: `maisForte` é o último do sort estável (qualidade se todos iguais). «Disciplina mais madura» mente no empate. |
| **E3** | `fomm.test.ts` | Falta trava de: média **por disciplina** (não por pergunta), `nivelDe(3.5)`, chave i18n para cada `PERGUNTAS[].id`, `fomm_*` das 7 disciplinas, mailto. |
| **A4** | `FommAssessment.tsx:40–45, 224–225` | SVG `role="img"` + `aria-label={d.radarTitle}` não inclui os 7 scores. A tabela abaixo (`:227–256`) é alternativa textual, mas não está ligada (`aria-describedby`). |
| **A5** | `FommAssessment.tsx:84–107` | Rótulos do radar em 10,5px; nomes longos («Preparação e Resposta a Emergências») apertam o `viewBox`. |
| **U2** | `FommAssessment.tsx:153–190` | Questionário não colapsa nem move o foco para o resultado quando `completo`. |
| **U3** | `FommAssessment.tsx:206, 219` | «score» hardcoded em inglês na UI PT. |
| **U4** | `FommAssessment.tsx:245` | Badges `good/ok/warn` em 3,5 / 2,5 — limiares inventados, não do WP. |
| **F1** | `pt.ts:306–325` vs WP Fig. 2 | Ver fidelidade abaixo. |
| **F2** | `pt.ts:269–274` | Níveis oficiais Fig. 3: *Initial/ad hoc · Repeatable but intuitive · Defined process · Managed and measurable · Optimized*. A UI encurta para Ad hoc / Repetível / Definido / Gerenciado / Otimizado. A descrição cobre o conteúdo; o nome oficial não. |
| **D1** | `pt.ts:10–11` via `FommAssessment.tsx:290` | Disclaimer genérico de calculadora («medição em campo / parecer de engenharia»), não o disclaimer FOMM (não-certificação / terceiro independente). |

---

## (2) Engine — o que está certo

`calcularFomm` faz o que o comentário promete:

- 18 perguntas, 2–3 por disciplina, ids únicos (`fomm.test.ts:16–27`).
- Média aritmética **por disciplina**, disciplinas com peso igual (`fomm.ts:112–117, 131–132`) — convenção correta (não média das 18 perguntas).
- `completo` só com 18/18 (`:128`).
- Gaps = 3 menores (`:133,139`); teste de ordem emergência < qualidade (`fomm.test.ts:45–56`).
- Rejeita 0, 6 e id desconhecido (`:107–109`, teste `:69–74`).
- `fommParaLead` emite `fomm_nivel_geral`, `fomm_{disciplina}`, `fomm_gaps` (`:148–156`).

A pesquisa em `02-research-report.md:301` sugeria **mediana**. A implementação usa **média** e declara isso. Para *este* gate («média por disciplina») está alinhado. Não é defeito.

---

## (3) a11y — o que está certo

- `fieldset` + `legend` por disciplina (`FommAssessment.tsx:158–159`).
- Radios nativos com o mesmo `name={q.id}` (setas do teclado funcionam).
- Escala visível 1–5 com número + rótulo.
- `:focus-visible` no cartão (`global.css:844–846`).
- Progresso `role="status"`.
- Tabela com `scope="col"` / `scope="row"`.
- Radar com `role="img"` + `<title>` (filhos viram presentacionais).
- Skip-link e `aria-current` vêm do `Base.astro` (já fechados na R2).

---

## (4) UX do fluxo

O desenho *pretendido* (18 → perfil → CTA «diagnóstico de prontidão FOMM») está no copy, não no estado da UI.

| Etapa | Comportamento real |
|---|---|
| 18 perguntas agrupadas nas 7 disciplinas | Sim |
| Resultado só no fim | **Não** — perfil parcial imediato |
| CTA só no fim | Sim (`completo`) |
| Lead com título certo | Sim (`title={d.ctaButton}`) |
| Imprimir / método / disclaimer | Sim, depois do resultado |

O botão do form continua «Enviar» (`LeadForm.tsx:108–109`); o CTA pedido é o `<h3>` do cartão. Aceitável.

---

## (5) Fidelidade das 18 perguntas ao WP #197

Banco recomendado na pesquisa (`02-research-report.md:264–299`) vs. `pt.ts:306–325` / `PERGUNTAS`:

| Disciplina WP Fig. 2 | Elementos (26) | Perguntas | Cobertura |
|---|---|---|---|
| EHS | Injury prevention; Statutory compliance | `ehs1`, `ehs2` | 2/2. Caiu a Q3 da pesquisa (hazard analysis **antes de cada** procedimento). |
| Emergência | EOPs; Scenario drills; Incident mgmt | `eme1–3` | 3/3, quase verbatim. |
| Manutenção | Asset; WO; CMMS; Vendor; Spares | `man1–3` | 5 em 3. Compressão correta. |
| Site | Infra; Site ops; Efficiency; Condition | `sit1–2` | Infra + capacity + PUE + housekeeping. **Site Operations** (turno, handover, rounds) quase ausente. |
| Operações | Personnel; Performance; Risk; Financial; Reporting | `ope1–3` | Pessoas, KPIs, budget. **Risk Management** (elem. 17) e **Reporting** (elem. 19) sem pergunta própria. |
| Mudanças | Risk analysis; Procedure review; Change control | `mud1–2` | MOP + revisão SOP/MOP/EOP. CAB / emergency change (elem. 22) só implícito. |
| Qualidade | Docs; Training; Inspections; CI | `qua1–3` | Melhor que o banco de 2 Q da pesquisa (treino e auditoria/CI separados). |

Contagem 18, 7/7 disciplinas, 2–3 por disciplina: **fiel ao recorte público**. Não é o modelo embutido (~80 sub-elementos) — e o código não finge que é.

Troca consciente vs. banco da pesquisa: 1 pergunta saiu de EHS e entrou em Qualidade. Qualidade ficou mais honesta; EHS perdeu o gate operacional de hazard analysis.

---

## Mapa rápido P0 / P1 / P2

| Sev. | Qtd | IDs |
|---|---|---|
| P0 | **0** | — |
| P1 | **7** | C1, C2, U1, A1, A2, A3, L1 |
| P2 | **14** | C3–C5, E1–E3, A4–A5, U2–U4, F1–F2, D1 |

---

## O que precisa mudar para APROVADO

1. **Não emitir nível geral até `completo === true`.** Até lá, só progresso `n/18` (e, no máximo, marcas por disciplina sem média global).
2. **Ao lado do número**, não no `<details>`: *«média simples das 7 disciplinas — convenção desta ferramenta; o WP #197 não define índice.»*
3. **Corrigir C2:** ou implementar impacto × facilidade, ou tirar a atribuição ao WP e dizer «três disciplinas com menor score».
4. **a11y:** contraste AA nos rótulos; `position: relative` + `sr-only` nos radios; `aria-labelledby` no radiogroup; live region só no progresso.
5. **Mailto:** incluir as chaves de `fommParaLead` no corpo.

Com isso o motor, o CTA, a escala 1–5 e a não-certificação já sustentam o gate.
