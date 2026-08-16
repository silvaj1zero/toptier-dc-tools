import { describe, expect, it } from 'vitest';
import {
  SEM_MELHORIAS,
  TODAS_MELHORIAS,
  potenciaHostKw,
  racksNecessarios,
  virtualizationSavings,
  type VirtualizationInput,
} from '@/lib/virtualization';

/**
 * REGRESSION TEST da engine (item 4 do plano de certificação):
 * o caso de referência do APC/SE White Paper 118 fica TRAVADO aqui.
 * Valores publicados no diálogo de origem (validação do artefato):
 * 1.000 kW capacidade · 500 kW TI · 750 servidores · 50% virtualizáveis ·
 * 10:1 · todas as melhorias → 750→413 servidores, 250→~156 kW,
 * TI 500→~406 kW, PUE 2,28→~1,72, conta ~$1,2M→~$735k (US$ 0,12/kWh).
 */
const CASO_REFERENCIA: VirtualizationInput = {
  capacidadeKw: 1000,
  cargaTiKw: 500,
  pctServidores: 50,
  numServidores: 750,
  ocupacaoRackPct: 70,
  precoKwh: 0.12,
  infraId: 'n_cw',
  pctVirtualizavel: 50,
  razaoConsolidacao: 10,
  melhorias: TODAS_MELHORIAS,
};

/** Tolerância relativa (o diálogo validou o caso de referência com erro < 2%). */
function expectProximo(atual: number, esperado: number, tolerancia = 0.02): void {
  expect(Math.abs(atual - esperado) / esperado).toBeLessThanOrEqual(tolerancia);
}

describe('caso de referência WP 118 (regression lock)', () => {
  const r = virtualizationSavings(CASO_REFERENCIA);

  it('cenário pré: PUE 2,28 exato e decomposição da infraestrutura', () => {
    expect(r.pre.servidores).toBe(750);
    expect(r.pre.potenciaServidoresKw).toBeCloseTo(250, 6);
    expect(r.pre.cargaTiKw).toBe(500);
    // n_cw sem melhorias: elétrica 0,06×1000 + 0,10×500 = 110; climatização
    // 0,30×1000 + 0,40×500 = 500; auxiliares 0,03×1000 = 30 → total 640.
    expect(r.pre.infra.eletricaKw).toBeCloseTo(110, 6);
    expect(r.pre.infra.climatizacaoKw).toBeCloseTo(500, 6);
    expect(r.pre.infra.auxiliaresKw).toBeCloseTo(30, 6);
    expect(r.pre.totalKw).toBeCloseTo(1140, 6);
    expect(r.pre.pue).toBeCloseTo(2.28, 6);
  });

  it('cenário pós: 413 servidores, ~156 kW de servidores, TI ~406 kW, PUE ~1,72', () => {
    expect(r.pos.servidores).toBe(413);
    expectProximo(r.pos.potenciaServidoresKw, 156, 0.01);
    expectProximo(r.pos.cargaTiKw, 406, 0.01);
    expectProximo(r.pos.pue, 1.72, 0.02);
  });

  it('conta anual: ~$1,2M → ~$735k', () => {
    // Exato por construção: 1.140 kW × 8.760 h × $0,12 = $1.198.368.
    expect(r.pre.custoAnual).toBeCloseTo(1_198_368, 0);
    expectProximo(r.pos.custoAnual, 735_000, 0.02);
    expect(r.economiaAnual).toBeCloseTo(r.pre.custoAnual - r.pos.custoAnual, 6);
    expect(r.economiaAnualKwh).toBeCloseTo(r.pre.energiaAnualKwh - r.pos.energiaAnualKwh, 6);
  });

  it('racks: 52 → 29 (2U/42U com 70% de ocupação)', () => {
    expect(r.pre.racks).toBe(52);
    expect(r.pos.racks).toBe(29);
  });
});

describe('paradoxo do PUE', () => {
  it('consolidar SEM right-sizing piora o PUE', () => {
    const r = virtualizationSavings({ ...CASO_REFERENCIA, melhorias: SEM_MELHORIAS });
    expect(r.pos.pue).toBeGreaterThan(r.pre.pue);
    // ... mas a conta de energia ainda cai (a carga total diminui).
    expect(r.pos.custoAnual).toBeLessThan(r.pre.custoAnual);
  });

  it('com right-sizing e melhorias o PUE melhora', () => {
    const r = virtualizationSavings(CASO_REFERENCIA);
    expect(r.pos.pue).toBeLessThan(r.pre.pue);
  });
});

describe('curve fit de consolidação', () => {
  it('é sublinear: host com 10 VMs consome ~2,45× um servidor, não 10×', () => {
    expectProximo(potenciaHostKw(1, 10), 2.4456, 0.001);
    expect(potenciaHostKw(1, 20)).toBeLessThan(20);
  });

  it('razão 1:1 não altera a potência', () => {
    expect(potenciaHostKw(0.333, 1)).toBeCloseTo(0.333, 9);
  });

  it('razão de consolidação maior reduz mais a carga de TI', () => {
    const r5 = virtualizationSavings({ ...CASO_REFERENCIA, razaoConsolidacao: 5 });
    const r25 = virtualizationSavings({ ...CASO_REFERENCIA, razaoConsolidacao: 25 });
    expect(r25.pos.cargaTiKw).toBeLessThan(r5.pos.cargaTiKw);
  });
});

describe('invariantes', () => {
  it('0% virtualizável sem melhorias ⇒ pós idêntico ao pré', () => {
    const r = virtualizationSavings({
      ...CASO_REFERENCIA,
      pctVirtualizavel: 0,
      melhorias: SEM_MELHORIAS,
    });
    expect(r.pos.servidores).toBe(r.pre.servidores);
    expect(r.pos.cargaTiKw).toBeCloseTo(r.pre.cargaTiKw, 9);
    expect(r.pos.pue).toBeCloseTo(r.pre.pue, 9);
    expect(r.pos.custoAnual).toBeCloseTo(r.pre.custoAnual, 6);
    expect(r.razaoCarga).toBeCloseTo(1, 9);
  });

  it('carga de TI acima da capacidade é limitada à capacidade (comportamento do original)', () => {
    const r = virtualizationSavings({ ...CASO_REFERENCIA, cargaTiKw: 1200 });
    expect(r.pre.cargaTiKw).toBe(1000);
  });

  it('racksNecessarios reproduz a premissa 2U/42U', () => {
    expect(racksNecessarios(750, 70)).toBe(52);
    expect(racksNecessarios(413, 70)).toBe(29);
    expect(racksNecessarios(1, 100)).toBe(1);
  });
});

describe('validação de entradas', () => {
  const casos: Array<[string, Partial<VirtualizationInput>]> = [
    ['capacidade zero', { capacidadeKw: 0 }],
    ['carga de TI zero', { cargaTiKw: 0 }],
    ['zero servidores', { numServidores: 0 }],
    ['percentual de servidores acima de 100', { pctServidores: 150 }],
    ['percentual virtualizável negativo', { pctVirtualizavel: -10 }],
    ['razão de consolidação menor que 1', { razaoConsolidacao: 0.5 }],
    ['ocupação de rack fora da faixa', { ocupacaoRackPct: 5 }],
    ['preço negativo', { precoKwh: -0.1 }],
  ];
  for (const [nome, patch] of casos) {
    it(`rejeita ${nome}`, () => {
      expect(() => virtualizationSavings({ ...CASO_REFERENCIA, ...patch })).toThrow(RangeError);
    });
  }

  it('rejeita preset de infraestrutura desconhecido', () => {
    expect(() =>
      virtualizationSavings({ ...CASO_REFERENCIA, infraId: 'inexistente' as never }),
    ).toThrow(RangeError);
  });
});
