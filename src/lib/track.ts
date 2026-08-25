/**
 * Telemetria de uso das ferramentas (Umami).
 *
 * DUAS INVARIANTES, e as duas existem por um motivo concreto:
 *
 * 1. NUNCA quebra a ferramenta. O SDK do Umami pode não ter carregado (env
 *    ausente, bloqueador de anúncios, rede lenta). Toda chamada é guardada e
 *    engolida — uma falha de analytics não pode derrubar um cálculo.
 *
 * 2. NO MÁXIMO UM evento por nome por carregamento de página. As ferramentas
 *    recalculam via `useMemo` A CADA TECLA: um evento por cálculo geraria
 *    centenas de eventos numa única visita e estouraria a cota do plano
 *    (100 mil eventos/mês). O que interessa medir é "esta pessoa usou esta
 *    ferramenta", não quantas teclas ela digitou.
 *
 * O website do Umami é COMPARTILHADO com o site institucional (a conta tem
 * uma vaga só) — por isso os nomes de evento daqui são prefixados por
 * ferramenta e não colidem com os do site (`inscricao_enviada`, etc.).
 * Ver docs/HANDOFF.md, sessão 2026-08-24.
 */

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

/** Nomes emitidos por esta suíte. Lista fechada — evita typo virar métrica órfã. */
export type ToolEvent =
  | 'pue_calculado'
  | 'economia_simulada'
  | 'virtualizacao_calculada'
  | 'pue_projeto_modelado'
  | 'densidade_planejada'
  | 'fomm_respondido'
  | 'resultado_impresso'
  | 'lead_enviado'
  /** Lead que só chegou porque o canal novo recusou — sinal de transição
   *  incompleta, não de uso normal. Se aparecer no painel, investigar. */
  | 'lead_fallback';

const emitidos = new Set<string>();

/** Emite uma vez por carregamento de página. Repetições são ignoradas. */
export function trackOnce(event: ToolEvent, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || emitidos.has(event)) return;
  emitidos.add(event);
  try {
    window.umami?.track(event, data);
  } catch {
    // Analytics nunca afeta o fluxo da ferramenta.
  }
}

/**
 * Emite sempre que chamado (sem dedupe). Use SÓ para ações discretas e
 * deliberadas do usuário — clicar em imprimir, enviar um lead — nunca para
 * algo derivado de digitação.
 */
export function track(event: ToolEvent, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    window.umami?.track(event, data);
  } catch {
    // idem
  }
}
