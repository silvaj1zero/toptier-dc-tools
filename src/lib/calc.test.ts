import { describe, expect, it } from 'vitest';
import {
  annualCost,
  annualEnergyKwh,
  carbonTons,
  classifyPue,
  cueFromGrid,
  dcie,
  effectiveTariff,
  facilityLoadFromPue,
  pue,
  regulatoryRead,
  savings,
  wue,
} from './calc';

describe('pue / dcie', () => {
  it('reproduz o exemplo canônico da página da 42U (100.000 / 80.000)', () => {
    // Referência: 42u.com/measurement/pue-dcie.htm — PUE 1.25, DCiE 0.8 (80%)
    expect(pue(100_000, 80_000)).toBeCloseTo(1.25, 10);
    expect(dcie(1.25)).toBeCloseTo(0.8, 10);
  });

  it('rejeita entradas fisicamente impossíveis', () => {
    expect(() => pue(100, 0)).toThrow(RangeError);
    expect(() => pue(80, 100)).toThrow(RangeError); // facility < TI é impossível
    expect(() => dcie(0.9)).toThrow(RangeError);
  });

  it('facilityLoadFromPue é o inverso de pue', () => {
    const facility = facilityLoadFromPue(500, 1.6);
    expect(facility).toBeCloseTo(800, 10);
    expect(pue(facility, 500)).toBeCloseTo(1.6, 10);
  });
});

describe('energia e tarifa', () => {
  it('energia anual usa 8.760 horas', () => {
    expect(annualEnergyKwh(1)).toBe(8760);
    expect(annualEnergyKwh(100)).toBe(876_000);
  });

  it('tarifa efetiva soma bandeira por 100 kWh', () => {
    expect(effectiveTariff({ baseRsKwh: 0.8 })).toBeCloseTo(0.8, 10);
    // Bandeira amarela mai/2026: R$ 1,885 por 100 kWh → +R$ 0,01885/kWh
    expect(effectiveTariff({ baseRsKwh: 0.8, bandeiraRsPor100Kwh: 1.885 })).toBeCloseTo(0.81885, 10);
  });

  it('custo anual = kWh × tarifa efetiva', () => {
    expect(annualCost(100, { baseRsKwh: 0.5 })).toBeCloseTo(438_000, 5);
  });
});

describe('carbono e água', () => {
  it('converte kWh em tCO2e via fator do grid (tCO2/MWh)', () => {
    expect(carbonTons(1_000_000, 0.1)).toBeCloseTo(100, 10);
  });

  it('CUE indireto = fator do grid (kg/kWh) × PUE', () => {
    // The Green Grid: CUE = CEF × PUE
    expect(cueFromGrid(1.5, 0.1)).toBeCloseTo(0.15, 10);
  });

  it('WUE = litros anuais / kWh de TI anuais', () => {
    expect(wue(876_000, 8_760_000)).toBeCloseTo(0.1, 10);
    expect(() => wue(100, 0)).toThrow(RangeError);
  });
});

describe('savings', () => {
  it('reproduz a lógica da 42U com fatores expostos', () => {
    // TI = 1.000 kW, PUE 2,0 → 1,5: Δ = 1000×(2,0−1,5) = 500 kW
    const result = savings({
      itLoadKw: 1000,
      currentPue: 2.0,
      targetPue: 1.5,
      tariff: { baseRsKwh: 0.7 },
      gridFactorTco2PerMwh: 0.05,
    });
    expect(result.currentFacilityKw).toBeCloseTo(2000, 10);
    expect(result.targetFacilityKw).toBeCloseTo(1500, 10);
    expect(result.deltaKw).toBeCloseTo(500, 10);

    const y1 = result.perYear.find((y) => y.years === 1)!;
    expect(y1.energyKwh).toBeCloseTo(500 * 8760, 5); // 4.380.000 kWh
    expect(y1.costRs).toBeCloseTo(4_380_000 * 0.7, 5);
    expect(y1.carbonTons).toBeCloseTo(4380 * 0.05, 5); // 219 t

    const y10 = result.perYear.find((y) => y.years === 10)!;
    expect(y10.energyKwh).toBeCloseTo(43_800_000, 5);
  });

  it('sem fator de grid, carbono é null (nunca inventado)', () => {
    const result = savings({
      itLoadKw: 100,
      currentPue: 1.8,
      targetPue: 1.5,
      tariff: { baseRsKwh: 0.6 },
    });
    expect(result.perYear[0]!.carbonTons).toBeNull();
  });

  it('rejeita alvo maior que o atual', () => {
    expect(() =>
      savings({ itLoadKw: 100, currentPue: 1.5, targetPue: 1.8, tariff: { baseRsKwh: 0.6 } }),
    ).toThrow(RangeError);
  });
});

describe('classificação e regulação', () => {
  it('usa a régua 2025, não a de 2010', () => {
    expect(classifyPue(1.05).tone).toBe('excellent');
    expect(classifyPue(1.5).labelPt).toContain('média global');
    // PUE 2,0 era "Average" na régua 42U de 2010; hoje é ineficiente
    expect(classifyPue(2.0).tone).toBe('warn');
    expect(classifyPue(3.0).tone).toBe('bad');
  });

  it('leitura regulatória EnEfG/EED', () => {
    const read = regulatoryRead(1.15, 600);
    expect(read.enefgNew2026).toBe(true);
    expect(read.eedReportingScope).toBe(true);

    const read2 = regulatoryRead(1.45, 300);
    expect(read2.enefgNew2026).toBe(false);
    expect(read2.enefgExisting2027).toBe(true);
    expect(read2.enefgExisting2030).toBe(false);
    expect(read2.eedReportingScope).toBe(false);
  });
});
