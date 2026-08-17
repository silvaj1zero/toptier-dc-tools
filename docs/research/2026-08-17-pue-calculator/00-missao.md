# Missão — Modelador de PUE de Projeto (réplica do SE TradeOff Tool)

> 2026-08-17. Diretriz do operador: explorar a "Data Center Efficiency and PUE Calculator" da Schneider (a ferramenta da Parte I do Estudo de Caso do MBA), criar uma versão modernizada e funcional com cenários, curva de PUE e alocação de energia com no mínimo o mesmo detalhe, validar contra a referência, com agentes dedicados de pesquisa, QA loop e orquestração multi-LLM (Fable + codex/gemini/grok).

## Artefatos

| Arquivo | Conteúdo |
|---|---|
| `R1-white-papers-se.md` (+ 4 PDFs WP113/154/158) | Modelo de perdas 3-componentes da SE, coeficientes públicos (agente de pesquisa 1) |
| `R2-wayback.md` | Arqueologia do tool (Wayback playback fora do ar; histórico confirmado) (agente 2) |
| `R3-referencias-tecnicas.md` | DC Pro Calculation Reference Manual completo (lookup tables UPS/cooling), Green Grid WP#49 (agente 3) |
| `fonte-xcelsius/` | Captura do app HTML5 (8 arquivos, 1,18 MB), extrator, transpilador, avaliador de pesquisa, planilha extraída por aba (`extraido/`) |
| `04-transpilacao-validacao.md` | O processo completo: estrutura, mapa UI→célula, validação |
| QA multi-engine | Findings de codex/gemini/grok no scratchpad da sessão; correções aplicadas no código |

## Produto

- `src/lib/pue-model/` — engine (modelo transpilado podado + avaliador + façade tipada)
- `src/lib/pue-model.test.ts` — locks de regressão + física
- `src/components/PueProjectModeler.tsx` + `src/pages/modelador-pue.astro` — UI multi-cenário
