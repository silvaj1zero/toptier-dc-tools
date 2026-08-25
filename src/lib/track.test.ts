import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * O módulo guarda os eventos já emitidos em estado de módulo. Cada teste
 * precisa de uma instância limpa — daí o `resetModules` + import dinâmico.
 */
async function carregarModulo() {
  vi.resetModules();
  return import('./track');
}

describe('track', () => {
  let enviados: Array<{ event: string; data?: Record<string, unknown> }>;

  beforeEach(() => {
    enviados = [];
    vi.stubGlobal('window', {
      umami: {
        track: (event: string, data?: Record<string, unknown>) => {
          enviados.push({ event, data });
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('trackOnce emite o evento na primeira chamada', async () => {
    const { trackOnce } = await carregarModulo();
    trackOnce('pue_calculado');
    expect(enviados).toEqual([{ event: 'pue_calculado', data: undefined }]);
  });

  it('trackOnce NÃO repete o mesmo evento — é o que protege a cota', async () => {
    const { trackOnce } = await carregarModulo();
    // Simula o useMemo recalculando a cada tecla: 500 disparos, 1 evento.
    for (let i = 0; i < 500; i++) trackOnce('pue_calculado');
    expect(enviados).toHaveLength(1);
  });

  it('trackOnce dedupe é por nome de evento, não global', async () => {
    const { trackOnce } = await carregarModulo();
    trackOnce('pue_calculado');
    trackOnce('economia_simulada');
    trackOnce('pue_calculado');
    expect(enviados.map((e) => e.event)).toEqual(['pue_calculado', 'economia_simulada']);
  });

  it('track (sem dedupe) conta cada ação deliberada', async () => {
    const { track } = await carregarModulo();
    track('resultado_impresso', { ferramenta: 'simulador-economia' });
    track('resultado_impresso', { ferramenta: 'simulador-economia' });
    expect(enviados).toHaveLength(2);
    expect(enviados[0]?.data).toEqual({ ferramenta: 'simulador-economia' });
  });

  it('não quebra quando o SDK do Umami não carregou (env ausente, adblock)', async () => {
    vi.stubGlobal('window', {});
    const { track, trackOnce } = await carregarModulo();
    expect(() => trackOnce('pue_calculado')).not.toThrow();
    expect(() => track('lead_enviado')).not.toThrow();
  });

  it('não quebra quando o SDK lança — analytics nunca derruba a ferramenta', async () => {
    vi.stubGlobal('window', {
      umami: {
        track: () => {
          throw new Error('falha do SDK');
        },
      },
    });
    const { track, trackOnce } = await carregarModulo();
    expect(() => trackOnce('pue_calculado')).not.toThrow();
    expect(() => track('lead_enviado')).not.toThrow();
  });

  it('não quebra em SSR (sem window) — as páginas são pré-renderizadas', async () => {
    vi.stubGlobal('window', undefined);
    const { track, trackOnce } = await carregarModulo();
    expect(() => trackOnce('pue_calculado')).not.toThrow();
    expect(() => track('lead_enviado')).not.toThrow();
  });
});
