# Auditoria FOMM — R2 (verificação adversarial do lote de correção)

**Data:** 2026-08-22 · **Verificador:** independente (não autor do lote) · **Base:** `audit-grok-fomm.md` (R1)

**Veredito: APROVADO.**

Todos os 7 P1 da R1 (C1, C2, U1, A1, A2, A3, L1) e os itens P2 exigidos no escopo (U3, F2, A4, E3/T1) estão resolvidos com evidência no código atual. Testes e typecheck passam com saída real. Restam apenas resíduos P2 fora do escopo do lote (página `.astro`) e 2 inconsistências menores novas, nenhuma reabrindo o gate.

---

## Tabela finding → status

| ID | Finding R1 | Status | Evidência (arquivo:linha) |
|---|---|---|---|
| **C1/U1** | Nível geral publicado com quiz incompleto; convenção só no `<details>` | **RESOLVIDO** | `FommAssessment.tsx:203` — bloco `<section className="results">` só renderiza com `result?.completo`; até lá só o progresso `n/18` (`:196–199`). A convenção está na nota do stat principal: `:212–214` renderiza `d.scoreWord … — d.conventionNote`; `pt.ts:349–350`: «média simples das 7 disciplinas, convenção desta ferramenta (o WP #197 não define índice único)»; `en.ts:348–349` idem. Comentário-guarda no código (`:201–202`). LeadForm também gated (`:302`). |
| **C2** | gapsIntro atribuía impacto × facilidade ao método da ferramenta | **RESOLVIDO** | `pt.ts:357–358`: «As três disciplinas com menor maturidade auto-declarada aparecem primeiro. No plano de ação formal, o WP #197 prioriza pela matriz impacto × facilidade — o que este pré-diagnóstico **não substitui**». `en.ts:356–357` equivalente. A matriz agora é citada como o que a ferramenta NÃO faz. |
| **A1** | `.fomm-opt .t` em gray-500 (4,05:1, abaixo de AA) | **RESOLVIDO** | `global.css:830–833` — `color: var(--tt-gray-700)`. Light: `#374151` (`:22`) sobre card `#ffffff` ≈ **10,3:1**. Dark: `#c9d1d9` (`:58,83`) sobre `#161b22` ≈ 11:1. Estado selecionado `.on .t` = `--tt-teal-600` `#007a3d` sobre `--tt-teal-100` `#e5f5ec` ≈ **4,8:1** — também AA. |
| **A2** | `aria-live` no bloco inteiro de resultados | **RESOLVIDO** | `FommAssessment.tsx:204` — `<section className="results">` sem `aria-live`. Única live region é o progresso curto `role="status"` (`:196`). |
| **A3** | Radios ocultos frágeis; `aria-label` duplicado; sem relative | **RESOLVIDO** | `global.css:794` — `.fomm-opt { position: relative; }`; `:813–821` — input `position:absolute; inset:0; width/height:100%; opacity:0; cursor:pointer` (cobre o cartão; alvo de foco/click coincide; `pointer-events:none` removido). `:849–852` — `:has(input:focus-visible)` mantém anel visível. `FommAssessment.tsx:166–168` — `role="radiogroup" aria-labelledby={fq-${q.id}}` apontando para o `<p id="fq-…">`. Nome acessível de cada radio via `<label>` envolvente (associação implícita). |
| **L1** | Fallback mailto descartava o perfil FOMM | **RESOLVIDO** | `LeadForm.tsx:54–62` — sem endpoint, `extras` serializa `Object.entries(context)` (`fomm_nivel_geral`, `fomm_{disciplina}`, `fomm_gaps`) no corpo do mailto. Contexto vem de `fommParaLead` (`FommAssessment.tsx:136`, `fomm.ts:148–157`). |
| **U3** | «score» hardcoded em inglês na UI PT | **RESOLVIDO** | `FommAssessment.tsx:213` usa `d.scoreWord`; `pt.ts:348` = «pontuação», `en.ts:347` = «score». Resíduo aceitável: header da tabela PT usa «Score» (`pt.ts:355`), mas via dicionário — escolha editorial, não hardcode. |
| **F2** | Nomes oficiais dos níveis ausentes | **RESOLVIDO** | `pt.ts:269–295` / `en.ts:268–294` — campo `official` por nível («Initial / ad hoc», «Repeatable but intuitive», «Defined process», «Managed and measurable», «Optimized»). Renderizado na legenda em `FommAssessment.tsx:146–150` (`<em>({d.levels[nivel].official})</em>`). |
| **A4** | `aria-label` do radar sem os 7 scores | **RESOLVIDO** | `FommAssessment.tsx:43–46` — `aria-label` concatena as 7 disciplinas com `disc.score.toFixed(1)` (ex.: «… Gestão de Qualidade 4.3»). |
| **T1/E3** | Faltavam testes de paridade i18n e boundary 3.5 | **RESOLVIDO** | `fomm.test.ts:31–43` — loop sobre `[pt, en]` exigindo texto não-vazio (>10 chars) para as 18 perguntas + nome e gapAction das 7 disciplinas. `:92–98` — boundary `ehs = 3.5 → nivel 4`. Extras: `:100–108` média por disciplina mista; `:75–83` parcial não entra disciplinas vazias na média. |

## Itens P2 da R1 fora do escopo do lote (persistem — não bloqueiam)

| ID | Status | Evidência |
|---|---|---|
| C3 («auditoria FOMM completa») | PERSISTE | `pt.ts:375` / `en.ts:372` (ctaText). Mitigado: mesma frase declara «auto-declarado» e o methodNote nega certificação. |
| C4 (benchmark do setor) | PERSISTE | `maturidade-operacional.astro:36`. |
| C5 (~70% erro humano sem fonte) | PERSISTE | `maturidade-operacional.astro:13`. |
| E2 (empate em maisForte) | PERSISTE | `fomm.ts:133,140` — sort estável, último vence no empate. Cosmético. |
| U4 (limiares 3.5/2.5 dos badges) | PERSISTE | `FommAssessment.tsx:253`. Convenção visual, sem claim de fonte. |

## Problemas NOVOS encontrados no lote

1. **`incompleteNote` mente (menor, P2).** `pt.ts:379`: «…— parcial exibido abaixo.» e `en.ts:376`: «— partial view shown below.» — mas com o fix do C1/U1 **nada** é exibido abaixo até 18/18 (`FommAssessment.tsx:203`). O texto promete um parcial que não existe mais. Corrigir a string (remover a segunda oração).
2. **Guarda redundante (cosmético).** `FommAssessment.tsx:277` — `{result.completo ? <div…CTA…> : null}` dentro de bloco que já só renderiza com `completo`. Código morto, sem efeito.
3. Sem quebras de tipo, sem regressão de engine detectada. `calcularFomm` agora retorna `FommResult | null` (`fomm.ts:101,129`) e todos os call sites tratam null (`FommAssessment.tsx:124–130`, testes com `!`).

## Saída real dos comandos

```
> npx vitest run src/lib/fomm.test.ts
 ✓ src/lib/fomm.test.ts (11 tests) 11ms
 Test Files  1 passed (1)
      Tests  11 passed (11)

> npx tsc --noEmit
(sem saída — exit code 0)
```

## Veredito final

**APROVADO.** Os 7 P1 da R1 estão fechados com evidência em código, os itens exigidos do escopo estão implementados, 11/11 testes passam e o typecheck está limpo. Follow-ups não-bloqueantes: corrigir a string `incompleteNote` (promete parcial inexistente), remover a guarda redundante da linha 277, e endereçar os P2 residuais da página `maturidade-operacional.astro` (C4/C5) num lote de copy.
