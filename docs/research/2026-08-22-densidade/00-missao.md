# Missão — Planejador de Espaço e Densidade + Deck R6 (2026-08-22)

## Objetivo

1. **Ferramenta online** `/planejador-densidade/` substituindo as planilhas Excel do módulo
   "Planejamento de Espaços, Densidade e Crescimento" (Parte III do MBA) — mesma matemática,
   UI moderna da suíte Top Tools.
2. **Deck R6** do módulo com didática reestruturada a partir dos whitepapers (não da ordem
   histórica dos slides R5) — exercícios resolvidos na ferramenta online.

## Fontes primárias

| Fonte | Extração |
|---|---|
| PPTX R5 26/07/2024 (40 slides + notas) | `fontes/pptx-r5-slides.md` |
| Apostila "PLANEJAMENTO DE ESPAÇOS JUL 2024.docx" | `fontes/docx-planejamento-jul2024.md` |
| Schneider WP #155 — Calculating Space and Power Density (NRAN-8FL6LW) | `fontes/wp-space-power-density.md` |
| APC WP #144 — Establishing a Floor Plan (VAVR-6KYMZ7 R2) | `fontes/wp-floor-plan.md` |
| Density spec **room** pt v5 m2.xlsx | `fontes/xlsx-room-pt-v5-m2.md` (93 células, valores + fórmulas) |
| Density spec **facility** v5 m2.xlsx | `fontes/xlsx-facility-v5-m2.md` (239 células, valores + fórmulas) |

## Modelo (descoberta da transpilação)

Cascata hierárquica **Gabinete → Pod → Sala → Instalação**:

- Cada nível reserva espaço em unidades do nível inferior: `área da linha = unidades × área/unidade + extra (m²)`.
- 8 linhas de reserva: unidades de TI, staging, incerteza, energia, climatização, auxiliares, storage, circulação.
- Densidade é **saída**: `W/m² = 1000 × potência nominal ÷ área total`.
- Sugestão de incerteza (linha informativa, fora da soma): no nível folha
  `nominal × (área/unid ÷ média) × u/(1−u)`; acima, propaga a sugestão não coberta do filho:
  `(sugestão_filho − reservado_filho) × unidades × (área_total_filho ÷ área_unidades_filho)`.
- Gabinetes esperados = produto das linhas "unidades" da cascata; máx. usa também staging + incerteza.
- Nota de fidelidade: na planilha facility, H15=9 pods na linha de área com H7=8 pods na potência —
  o modelo permite (linha de unidades é input independente com default = contagem).

## Entregáveis

- `src/lib/density.ts` + `src/lib/density.test.ts` — engine transpilado, cenários default fixados 1:1.
- `src/components/DensityPlanner.tsx` + `src/pages/planejador-densidade.astro` — modos Sala e Instalação.
- `docs/research/2026-08-22-densidade/01-mapa-conteudo.md` — mapa cruzado slides×WPs×apostila.
- `02-arquitetura-didatica.md` — nova arquitetura: 6 blocos, 41 slides, 6 exercícios na ferramenta.
- Deck R6 (workspace do cliente): `clients/mba-brpos/08-planejamento-espacos/01-deck-r6/` (HTML+PDF) + `02-guia/notas-instrutor-gabarito.md`.

## Decisões

- Zero menção a MBA no site público (rebranding 2026-08-17) — material didático fica no workspace do cliente.
- Rota `/planejador-densidade/` autorizada pelo operador em 2026-08-22.
- Apostila DOCX rebaixada a rascunho derivado (contém prompts de LLM sem lastro nos WPs — ver 01-mapa-conteudo §5.3).
