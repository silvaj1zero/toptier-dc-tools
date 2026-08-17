import { describe, expect, it } from 'vitest';
import { DEFAULT_DETAILS, DEFAULT_SCENARIO, runScenario } from '@/lib/pue-model';

/**
 * REGRESSION LOCKS da réplica do modelo SE PUE Calculator.
 * Valores de referência capturados da ferramenta VIVA em 2026-08-17
 * (se.com TradeOff Tool, estado default): "At 50% load (500 kW), your PUE is
 * 2.18, with an annual electricity cost of $ 1,140,000" + gráfico de alocação.
 * O modelo transpilado reproduz 2.1759… — o tool exibe arredondado (2 casas).
 */
describe('estado default (lock contra a ferramenta viva)', () => {
  const r = runScenario(DEFAULT_SCENARIO);
  const p = r.at(0.5);

  it('PUE @50% = 2,18 (2,1759 exato)', () => {
    expect(p.pue).toBeCloseTo(2.1759, 3);
    expect(Math.round(p.pue * 100) / 100).toBe(2.18);
  });

  it('custo anual @50% ≈ $1,14M', () => {
    expect(p.annualCost).toBeGreaterThan(1_100_000);
    expect(p.annualCost).toBeLessThan(1_190_000);
  });

  it('alocação de energia: Power 11,3% · Cooling 40,4% · IT 46,0% · Other 2,4%', () => {
    const by = Object.fromEntries(p.energyAllocation.map((s) => [s.label, s.fraction]));
    expect(by['Power']).toBeCloseTo(0.1126, 3);
    expect(by['Cooling']).toBeCloseTo(0.404, 3);
    expect(by['IT load']).toBeCloseTo(0.4596, 3);
    expect(by['Other']).toBeCloseTo(0.0238, 3);
    const total = p.energyAllocation.reduce((a, s) => a + s.fraction, 0);
    expect(total).toBeCloseTo(1, 6);
  });

  it('curva com 101 pontos, decrescente de ~46 (1%) a 1,735 (100%)', () => {
    expect(r.curve).toHaveLength(101);
    expect(r.curve[50]!.pue).toBeCloseTo(2.1759, 3);
    expect(r.curve[100]!.pue).toBeCloseTo(1.735, 2);
    for (let i = 5; i < 100; i++) {
      expect(r.curve[i + 1]!.pue).toBeLessThanOrEqual(r.curve[i]!.pue + 1e-9);
    }
  });

  it('assumptions expõem os coeficientes do modelo original (UPS legacy 1,4×/4%/4,5%/4%)', () => {
    const ups = r.assumptions.find((a) => a.subsystem === 'Legacy UPS')!;
    expect(ups.sizingPerPuIt).toBe(1.4);
    expect(ups.squareLoss).toBe(0.04);
    expect(ups.proportionalLoss).toBe(0.045);
    expect(ups.fixedLoss).toBe(0.04);
    expect(r.assumptions.length).toBeGreaterThanOrEqual(25);
  });
});

describe('física do modelo (direcionalidade)', () => {
  const pue = (patch: Partial<typeof DEFAULT_SCENARIO>) =>
    runScenario({ ...DEFAULT_SCENARIO, ...patch }).at(0.5).pue;
  const base = pue({});

  it('DX e air-cooled são menos eficientes que água gelada', () => {
    expect(pue({ coolingSystem: 'dxGlycol' })).toBeGreaterThan(base);
    expect(pue({ coolingSystem: 'airCooled' })).toBeGreaterThan(base);
  });

  it('UPS de alta eficiência melhora o PUE; sem UPS melhora ainda mais', () => {
    const hi = pue({ upsSystem: 'highEfficiency' });
    const none = pue({ upsSystem: 'none' });
    expect(hi).toBeLessThan(base);
    expect(none).toBeLessThan(hi);
  });

  it('redundância (dual power + 2N CRAC + dual heat rejection) piora o PUE', () => {
    expect(pue({ dualPowerPath: true, cracRedundancy: '2n', dualHeatRejection: true })).toBeGreaterThan(base);
  });

  it('economizador water-side reduz o PUE proporcionalmente às horas', () => {
    const e2000 = pue({ economizerHours: 2000 });
    const e6000 = pue({ economizerHours: 6000 });
    expect(e2000).toBeLessThan(base);
    expect(e6000).toBeLessThan(e2000);
  });

  it('todas as design details de eficiência juntas reduzem o PUE substancialmente', () => {
    const all = pue({
      designDetails: {
        ...DEFAULT_DETAILS,
        upsEcoMode: true,
        pdusWithoutTransformers: true,
        energyEfficientLighting: true,
        coordinatedCrac: true,
        vfdHeatRejectionPumps: true,
        vfdChilledWaterPumps: true,
        deepRaisedFloor: true,
        droppedCeilingReturn: true,
        optimizedRackLayout: true,
        optimizedTilePlacement: true,
        blankingPanels: true,
      },
    });
    expect(all).toBeLessThan(base - 0.3);
  });

  it('cada checkbox de eficiência, isolada, nunca piora o PUE', () => {
    const flags: Array<keyof typeof DEFAULT_DETAILS> = [
      'upsEcoMode',
      'pdusWithoutTransformers',
      'energyEfficientLighting',
      'coordinatedCrac',
      'vfdHeatRejectionPumps',
      'vfdChilledWaterPumps',
      'deepRaisedFloor',
      'droppedCeilingReturn',
      'optimizedRackLayout',
      'optimizedTilePlacement',
      'blankingPanels',
    ];
    for (const f of flags) {
      const v = pue({ designDetails: { ...DEFAULT_DETAILS, [f]: true } });
      expect(v, `flag ${f}`).toBeLessThanOrEqual(base + 1e-9);
    }
  });

  it('standby generator e CRAC-on-UPS adicionam carga (PUE não melhora)', () => {
    expect(pue({ designDetails: { ...DEFAULT_DETAILS, standbyGenerator: true } })).toBeGreaterThanOrEqual(base);
    expect(pue({ designDetails: { ...DEFAULT_DETAILS, cracOnUps: true } })).toBeGreaterThanOrEqual(base);
  });

  it('capacidade não altera o PUE (modelo normalizado), mas altera o custo', () => {
    const big = runScenario({ ...DEFAULT_SCENARIO, itCapacityKw: 2000 }).at(0.5);
    const small = runScenario({ ...DEFAULT_SCENARIO, itCapacityKw: 500 }).at(0.5);
    expect(big.pue).toBeCloseTo(small.pue, 6);
    expect(big.annualCost).toBeGreaterThan(small.annualCost * 3.9);
  });
});
