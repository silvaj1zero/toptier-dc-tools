/**
 * Núcleo de cálculo — funções puras, sem estado, 100% testáveis.
 *
 * Fundamentação:
 * - PUE: ISO/IEC 30134-2 / The Green Grid — PUE = energia total da instalação ÷ energia de TI.
 * - DCiE (legado, descontinuado pelo Green Grid): DCiE = 1 ÷ PUE.
 * - CUE (ISO/IEC 30134-8): método indireto do Green Grid — CUE = fator de emissão do grid (kgCO2e/kWh) × PUE.
 * - WUE (ISO/IEC 30134-9): WUE = litros de água anuais ÷ kWh de TI anuais.
 * Todas as fórmulas são exibidas na UI — transparência metodológica é princípio do produto.
 */

import { HOURS_PER_YEAR, PUE_BANDS, REGULATORY, type PueBand } from '@/data/benchmarks';

// ---------------------------------------------------------------------------
// Métricas básicas
// ---------------------------------------------------------------------------

/** PUE = potência (ou energia) total da instalação ÷ potência (ou energia) de TI. */
export function pue(totalFacilityKw: number, itLoadKw: number): number {
  if (itLoadKw <= 0) throw new RangeError('Carga de TI deve ser maior que zero');
  if (totalFacilityKw < itLoadKw) {
    throw new RangeError('Carga total da instalação não pode ser menor que a carga de TI');
  }
  return totalFacilityKw / itLoadKw;
}

/** DCiE = 1 ÷ PUE (fração 0..1). Métrica legada — mantida por compatibilidade didática. */
export function dcie(pueValue: number): number {
  if (pueValue < 1) throw new RangeError('PUE não pode ser menor que 1');
  return 1 / pueValue;
}

/** Carga total implícita a partir de carga de TI e PUE (inverso da definição do PUE). */
export function facilityLoadFromPue(itLoadKw: number, pueValue: number): number {
  return itLoadKw * pueValue;
}

/** Energia anual (kWh) de uma carga contínua em kW (operação 24×7 → 8.760 h/ano). */
export function annualEnergyKwh(loadKw: number): number {
  return loadKw * HOURS_PER_YEAR;
}

// ---------------------------------------------------------------------------
// Tarifa
// ---------------------------------------------------------------------------

export interface Tariff {
  /** Tarifa base em R$/kWh. */
  baseRsKwh: number;
  /** Adicional de bandeira tarifária em R$ por 100 kWh (0 para bandeira verde). */
  bandeiraRsPor100Kwh?: number;
}

/** Tarifa efetiva em R$/kWh (base + bandeira). */
export function effectiveTariff(t: Tariff): number {
  return t.baseRsKwh + (t.bandeiraRsPor100Kwh ?? 0) / 100;
}

/** Custo anual em R$ de uma carga contínua em kW. */
export function annualCost(loadKw: number, tariff: Tariff): number {
  return annualEnergyKwh(loadKw) * effectiveTariff(tariff);
}

// ---------------------------------------------------------------------------
// Carbono e água
// ---------------------------------------------------------------------------

/** Toneladas de CO2e para um consumo em kWh, dado o fator do grid em tCO2/MWh. */
export function carbonTons(energyKwh: number, gridFactorTco2PerMwh: number): number {
  return (energyKwh / 1000) * gridFactorTco2PerMwh;
}

/**
 * CUE (kgCO2e por kWh de TI) — método indireto do The Green Grid:
 * CUE = fator de emissão do grid (kgCO2e/kWh) × PUE.
 */
export function cueFromGrid(pueValue: number, gridFactorTco2PerMwh: number): number {
  const kgPerKwh = gridFactorTco2PerMwh; // tCO2/MWh === kgCO2/kWh (mesma razão numérica)
  return kgPerKwh * pueValue;
}

/** WUE (L/kWh) = litros de água anuais ÷ kWh de TI anuais. */
export function wue(annualWaterLiters: number, annualItKwh: number): number {
  if (annualItKwh <= 0) throw new RangeError('Energia de TI deve ser maior que zero');
  return annualWaterLiters / annualItKwh;
}

// ---------------------------------------------------------------------------
// Simulação de economia (substitui a calculadora de savings da 42U)
// ---------------------------------------------------------------------------

export interface SavingsInput {
  itLoadKw: number;
  currentPue: number;
  targetPue: number;
  tariff: Tariff;
  /** Fator do grid em tCO2/MWh (opcional — sem ele, o bloco de carbono não é calculado). */
  gridFactorTco2PerMwh?: number;
}

export interface SavingsYear {
  years: number;
  energyKwh: number;
  costRs: number;
  carbonTons: number | null;
}

export interface SavingsResult {
  currentFacilityKw: number;
  targetFacilityKw: number;
  deltaKw: number;
  perYear: SavingsYear[];
}

/**
 * Economia projetada ao reduzir o PUE com carga de TI constante.
 * Δpotência = TI × (PUE_atual − PUE_alvo); projeção linear em 1/5/10 anos
 * (mesma janela da 42U, com fatores expostos em vez de ocultos).
 */
export function savings(input: SavingsInput, horizons: number[] = [1, 5, 10]): SavingsResult {
  const { itLoadKw, currentPue, targetPue, tariff, gridFactorTco2PerMwh } = input;
  if (targetPue < 1) throw new RangeError('PUE alvo não pode ser menor que 1');
  if (targetPue > currentPue) {
    throw new RangeError('PUE alvo deve ser menor ou igual ao PUE atual');
  }
  const currentFacilityKw = facilityLoadFromPue(itLoadKw, currentPue);
  const targetFacilityKw = facilityLoadFromPue(itLoadKw, targetPue);
  const deltaKw = currentFacilityKw - targetFacilityKw;
  const annualKwh = annualEnergyKwh(deltaKw);
  const annualRs = annualKwh * effectiveTariff(tariff);

  const perYear: SavingsYear[] = horizons.map((years) => ({
    years,
    energyKwh: annualKwh * years,
    costRs: annualRs * years,
    carbonTons:
      gridFactorTco2PerMwh != null ? carbonTons(annualKwh * years, gridFactorTco2PerMwh) : null,
  }));

  return { currentFacilityKw, targetFacilityKw, deltaKw, perYear };
}

// ---------------------------------------------------------------------------
// Classificação e leitura regulatória
// ---------------------------------------------------------------------------

export function classifyPue(pueValue: number): PueBand {
  const band = PUE_BANDS.find((b) => pueValue <= b.max);
  return band ?? PUE_BANDS[PUE_BANDS.length - 1]!;
}

export interface RegulatoryRead {
  /** Atenderia ao limite alemão (EnEfG) para novos DCs a partir de 07/2026 (PUE ≤ 1,2)? */
  enefgNew2026: boolean;
  /** Atenderia ao limite para DCs existentes a partir de 07/2027 (PUE ≤ 1,5)? */
  enefgExisting2027: boolean;
  /** Atenderia ao limite para DCs existentes a partir de 07/2030 (PUE ≤ 1,3)? */
  enefgExisting2030: boolean;
  /** Estaria no escopo de reporting da EED europeia (TI instalada ≥ 500 kW)? */
  eedReportingScope: boolean;
}

export function regulatoryRead(pueValue: number, itLoadKw: number): RegulatoryRead {
  return {
    enefgNew2026: pueValue <= REGULATORY.enefgNew2026,
    enefgExisting2027: pueValue <= REGULATORY.enefgExisting2027,
    enefgExisting2030: pueValue <= REGULATORY.enefgExisting2030,
    eedReportingScope: itLoadKw >= REGULATORY.eedReportingItKw,
  };
}

// ---------------------------------------------------------------------------
// Formatação (pt-BR)
// ---------------------------------------------------------------------------

export function fmtNumber(value: number, digits = 2): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

export function fmtEnergy(kwh: number): string {
  if (kwh >= 1_000_000) return `${fmtNumber(kwh / 1_000_000)} GWh`;
  if (kwh >= 1_000) return `${fmtNumber(kwh / 1_000)} MWh`;
  return `${fmtNumber(kwh, 0)} kWh`;
}
