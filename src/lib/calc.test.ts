import { describe, expect, it } from 'vitest';
import {
  annualCost,
  annualEnergyKwh,
  carbonTons,
  classifyPue,
  comparePue,
  cueFromGrid,
  dcie,
  effectiveTariff,
  facilityLoadFromPue,
  pue,
  regulatoryRead,
  savings,
  wue,
} from './calc';
import {
  DEFAULT_PUE_CLASS_ID,
  FEATURED_REGIONAL_ID,
  GLOBAL_SITE_ID,
  LBNL_RULER,
  PUE_BANDS,
  PUE_BENCHMARK_UPDATE,
  PUE_CLASS_OPTIONS,
  PUE_REFERENCES,
  getPueReference,
  referenceCenter,
} from '@/data/benchmarks';

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
  it('usa a régua LBNL (Standard 2,0 · Good 1,4 · Better 1,1), não a régua de 2010', () => {
    expect(LBNL_RULER.standard).toBe(2.0);
    expect(LBNL_RULER.good).toBe(1.4);
    expect(LBNL_RULER.better).toBe(1.1);
    expect(classifyPue(1.05).id).toBe('better');
    expect(classifyPue(1.05).tone).toBe('excellent');
    expect(classifyPue(3.0).tone).toBe('bad');
  });

  it('bordas 1,1 / 1,4 / 2,0 pertencem ao nível que atingem; logo acima cai no seguinte', () => {
    expect(classifyPue(1.1).id).toBe('better');
    expect(classifyPue(1.11).id).toBe('good');
    expect(classifyPue(1.4).id).toBe('good');
    expect(classifyPue(1.41).id).toBe('standard');
    expect(classifyPue(2.0).id).toBe('standard');
    expect(classifyPue(2.01).id).toBe('above-standard');
    // ponto flutuante: 770/700 ≈ 1,1 não pode escapar do Better
    expect(classifyPue(770 / 700).id).toBe('better');
  });

  it('a classificação não depende mais da média global (1,52 não é limiar)', () => {
    expect(PUE_BANDS.map((b) => b.max)).toEqual([1.1, 1.4, 2.0, Infinity]);
    expect(classifyPue(1.52).id).toBe('standard');
    expect(classifyPue(1.54).id).toBe('standard');
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


describe('referências de PUE por classe', () => {
  it('ids únicos e dados completos (faixa coerente, fonte com URL, ano, tipo de média)', () => {
    const ids = PUE_REFERENCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of PUE_REFERENCES) {
      expect(r.min).toBeLessThanOrEqual(r.max);
      if (r.typical != null) {
        expect(r.typical).toBeGreaterThanOrEqual(r.min);
        expect(r.typical).toBeLessThanOrEqual(r.max);
      }
      expect(r.url).toMatch(/^https:\/\//);
      expect(r.source.length).toBeGreaterThan(5);
      expect(r.year).toBeGreaterThanOrEqual(2023);
      expect(r.labelPt && r.labelEn && r.averageType).toBeTruthy();
    }
  });

  it('médias de referência: global por site 1,52 (n=644), ponderada 1,36, América Latina 1,65 (n=72)', () => {
    const site = getPueReference(GLOBAL_SITE_ID)!;
    expect([site.typical, site.sample, site.year, site.averageType, site.confirmation]).toEqual([
      1.52, 644, 2026, 'per-site-self-reported', 'primary',
    ]);
    const weighted = getPueReference('R-E')!;
    expect([weighted.typical, weighted.averageType]).toEqual([1.36, 'capacity-weighted']);
    const latam = getPueReference(FEATURED_REGIONAL_ID)!;
    expect([latam.typical, latam.sample, latam.year]).toEqual([1.65, 72, 2025]);
    // não confirmada no original: tem que permanecer marcada como secundária
    expect(latam.confirmation).toBe('secondary');
  });

  it('classes R-A, R-B, R-G, R-H, R-I com as faixas da pesquisa; enterprise-medio (1,58) foi removido', () => {
    const r = (id: string) => {
      const x = getPueReference(id)!;
      return [x.min, x.max, x.typical];
    };
    expect(r('R-A')).toEqual([1.6, 2.1, 1.9]);
    expect(r('R-B')).toEqual([1.45, 1.7, 1.6]);
    expect(r('R-G')).toEqual([1.2, 1.3, 1.21]);
    expect(r('R-H')).toEqual([1.08, 1.22, null]);
    expect(r('R-I')).toEqual([1.09, 1.18, 1.14]);
    expect(PUE_REFERENCES.some((x) => x.id === 'enterprise-medio' || x.typical === 1.58)).toBe(false);
  });

  it('seletor de classe: A, B e G; default é R-B (enterprise/colo médio); hyperscale e IA não entram', () => {
    expect(PUE_CLASS_OPTIONS.map((c) => c.id)).toEqual(['R-A', 'R-B', 'R-G']);
    expect(DEFAULT_PUE_CLASS_ID).toBe('R-B');
    expect(PUE_CLASS_OPTIONS.some((c) => c.id === DEFAULT_PUE_CLASS_ID)).toBe(true);
  });

  it('referenceCenter usa o típico, ou o ponto médio quando só há intervalo', () => {
    expect(referenceCenter(getPueReference('R-B')!)).toBe(1.6);
    expect(referenceCenter(getPueReference('R-H')!)).toBeCloseTo(1.15, 10);
  });

  it('comparePue: abaixo / dentro / acima da faixa e delta vs típico', () => {
    const b = getPueReference('R-B')!; // 1,45–1,70, típico 1,60
    expect(comparePue(1.4, b)).toEqual({ position: 'below', delta: -0.2 });
    expect(comparePue(1.45, b).position).toBe('within');
    expect(comparePue(1.7, b).position).toBe('within');
    expect(comparePue(1.71, b).position).toBe('above');
    expect(comparePue(1.6, b).delta).toBe(0);
    const latam = getPueReference(FEATURED_REGIONAL_ID)!;
    expect(comparePue(1.5, latam).delta).toBe(-0.15);
  });

  it('nota de atualização explica a troca de referência única por régua', () => {
    expect(PUE_BENCHMARK_UPDATE.date).toBe('2026-10-26');
    expect(PUE_BENCHMARK_UPDATE.notePt).toContain('régua');
    expect(PUE_BENCHMARK_UPDATE.notePt).toContain('LBNL');
    expect(PUE_BENCHMARK_UPDATE.noteEn).toContain('ruler');
  });
});
