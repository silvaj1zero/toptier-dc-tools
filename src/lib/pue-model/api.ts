/**
 * Façade de domínio do Modelador de PUE de projeto — API tipada sobre o modelo
 * de células transpilado da SE PUE Calculator (TradeOff Tool).
 *
 * Mapa UI→célula derivado dos bindings do dashboard original e corroborado pela
 * semântica das fórmulas (docs/research/2026-08-17-pue-calculator/).
 */
import { ModeloCelulas } from './avaliador';

// Índices de aba (SHEETS do modelo gerado)
const TXT = 2;
const CI = 3;
const PM = 4;
const DL = 5;

export type UpsSystem = 'legacy' | 'typical' | 'highEfficiency' | 'none';
export type CoolingSystem = 'chilledWater' | 'dxGlycol' | 'airCooled';
export type Chiller =
  | 'towerChiller'
  | 'towerChillerVfd'
  | 'dryCoolerChiller'
  | 'dryCoolerChillerVfd'
  | 'packagedChiller';
export type AirDistribution = 'perimeter' | 'closeCoupled';
export type CracRedundancy = 'n' | 'n1' | '2n' | '2n1';

export interface DesignDetails {
  standbyGenerator: boolean;
  upsEcoMode: boolean;
  pdusWithoutTransformers: boolean;
  energyEfficientLighting: boolean;
  cracOnUps: boolean;
  coordinatedCrac: boolean;
  vfdHeatRejectionPumps: boolean;
  vfdChilledWaterPumps: boolean;
  deepRaisedFloor: boolean;
  droppedCeilingReturn: boolean;
  optimizedRackLayout: boolean;
  optimizedTilePlacement: boolean;
  blankingPanels: boolean;
}

export interface ProjectScenario {
  /** Capacidade de TI do data center (kW). */
  itCapacityKw: number;
  /** Custo da energia por kWh (moeda livre — usada só para custo). */
  costPerKwh: number;
  upsSystem: UpsSystem;
  dualPowerPath: boolean;
  coolingSystem: CoolingSystem;
  chiller: Chiller;
  airDistribution: AirDistribution;
  cracRedundancy: CracRedundancy;
  dualHeatRejection: boolean;
  /** Horas/ano de economizador water-side (0–8760). */
  economizerHours: number;
  designDetails: DesignDetails;
}

export interface AllocationSlice {
  label: string;
  fraction: number;
}

export interface LoadPointResult {
  load: number;
  pue: number;
  /** Potência total da instalação (kW) nesta carga. */
  totalKw: number;
  /** Custo anual de energia nesta carga (moeda do costPerKwh). */
  annualCost: number;
  /** Alocação de energia (frações do total) — Power/Cooling/IT/Other. */
  energyAllocation: AllocationSlice[];
  /** Breakdown do subsistema elétrico (fração do total). */
  powerBreakdown: AllocationSlice[];
  /** Breakdown do subsistema de climatização (fração do total). */
  coolingBreakdown: AllocationSlice[];
}

export interface SubsystemAssumption {
  subsystem: string;
  sizingPerPuIt: number;
  squareLoss: number;
  proportionalLoss: number;
  fixedLoss: number;
}

export interface ScenarioResult {
  /** Curva PUE(load) em 101 pontos: load 0,00–1,00 (passo 0,01). */
  curve: Array<{ load: number; pue: number }>;
  /** Avalia PUE, custo e alocações em uma carga específica. */
  at(load: number): LoadPointResult;
  /** Tabela de assumptions (dispositivos e coeficientes ativos). */
  assumptions: SubsystemAssumption[];
}

export const DEFAULT_DETAILS: DesignDetails = {
  standbyGenerator: false,
  upsEcoMode: false,
  pdusWithoutTransformers: false,
  energyEfficientLighting: false,
  cracOnUps: false,
  coordinatedCrac: false,
  vfdHeatRejectionPumps: false,
  vfdChilledWaterPumps: false,
  deepRaisedFloor: false,
  droppedCeilingReturn: false,
  optimizedRackLayout: false,
  optimizedTilePlacement: false,
  blankingPanels: false,
};

/** Cenário default idêntico ao da ferramenta de referência. */
export const DEFAULT_SCENARIO: ProjectScenario = {
  itCapacityKw: 1000,
  costPerKwh: 0.12,
  upsSystem: 'legacy',
  dualPowerPath: false,
  coolingSystem: 'chilledWater',
  chiller: 'towerChiller',
  airDistribution: 'perimeter',
  cracRedundancy: 'n',
  dualHeatRejection: false,
  economizerHours: 0,
  designDetails: { ...DEFAULT_DETAILS },
};

const UPS_INDEX: Record<UpsSystem, number> = { legacy: 1, typical: 2, highEfficiency: 3, none: 4 };
const COOLING_INDEX: Record<CoolingSystem, number> = { chilledWater: 1, dxGlycol: 2, airCooled: 3 };
const CHILLER_INDEX: Record<Chiller, number> = {
  towerChiller: 1,
  towerChillerVfd: 2,
  dryCoolerChiller: 3,
  dryCoolerChillerVfd: 4,
  packagedChiller: 5,
};
const CRAC_INDEX: Record<CracRedundancy, number> = { n: 1, n1: 2, '2n': 3, '2n1': 4 };

const yn = (b: boolean): string => (b ? 'Yes' : 'No');

function aplicarCenario(m: ModeloCelulas, input: ProjectScenario): void {
  const d = input.designDetails;
  m.set(PM, 1, 1, input.itCapacityKw);
  m.set(TXT, 44, 2, input.costPerKwh);
  // Horas de economizador water-side: binding oficial da UI → Crystal Interface r26c1
  // (PM r7c1/r32c1 são constantes internas do modelo — não tocar).
  m.set(CI, 26, 1, input.economizerHours);
  m.set(DL, 3, 19, UPS_INDEX[input.upsSystem]);
  m.set(DL, 3, 13, yn(input.dualPowerPath));
  m.set(DL, 5, 13, COOLING_INDEX[input.coolingSystem]);
  m.set(DL, 12, 13, CHILLER_INDEX[input.chiller]);
  m.set(DL, 7, 13, yn(input.airDistribution === 'closeCoupled'));
  m.set(DL, 6, 13, CRAC_INDEX[input.cracRedundancy]);
  m.set(DL, 9, 13, yn(input.dualHeatRejection));
  m.set(DL, 4, 13, yn(d.standbyGenerator));
  m.set(DL, 7, 19, yn(d.upsEcoMode));
  m.set(DL, 4, 19, yn(d.pdusWithoutTransformers));
  m.set(DL, 5, 19, d.energyEfficientLighting ? 2 : 1);
  m.set(DL, 9, 19, yn(d.cracOnUps));
  m.set(DL, 5, 25, yn(d.coordinatedCrac));
  m.set(DL, 10, 13, yn(d.vfdHeatRejectionPumps));
  m.set(DL, 8, 13, yn(d.vfdChilledWaterPumps));
  m.set(DL, 6, 25, yn(d.deepRaisedFloor));
  m.set(DL, 8, 25, yn(d.droppedCeilingReturn));
  m.set(DL, 7, 25, yn(d.optimizedRackLayout));
  m.set(DL, 3, 25, yn(d.optimizedTilePlacement));
  m.set(DL, 4, 25, yn(d.blankingPanels));
}

/** Carga mínima suportada (1%) — abaixo disso o PUE do modelo diverge (perdas fixas ÷ carga→0). */
export const MIN_LOAD = 0.01;

function validar(input: ProjectScenario): ProjectScenario {
  const fin = (v: number, min: number, max: number, fallback: number): number =>
    Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
  return {
    ...input,
    itCapacityKw: fin(input.itCapacityKw, 1, 1_000_000, DEFAULT_SCENARIO.itCapacityKw),
    costPerKwh: fin(input.costPerKwh, 0, 1000, DEFAULT_SCENARIO.costPerKwh),
    economizerHours: fin(input.economizerHours, 0, 8760, 0),
  };
}

export function runScenario(rawInput: ProjectScenario): ScenarioResult {
  const input = validar(rawInput);
  const m = new ModeloCelulas();
  aplicarCenario(m, input);

  const numAt = (s: number, r: number, c: number): number => {
    const v = m.get(s, r, c);
    return typeof v === 'number' && Number.isFinite(v) ? v : Number.NaN;
  };

  const curve: Array<{ load: number; pue: number }> = [];
  for (let i = 0; i <= 100; i++) curve.push({ load: i / 100, pue: numAt(CI, 3 + i, 42) });

  const slices = (rows: number[], valueCol: number): AllocationSlice[] =>
    rows
      .map((r) => ({
        label: String(m.get(CI, r, 0) ?? '').replace(/<[^>]+>/g, ''),
        fraction: numAt(CI, r, valueCol),
      }))
      .filter((s) => s.label !== '' && s.label !== 'null' && Number.isFinite(s.fraction));

  const at = (load: number): LoadPointResult => {
    const l = Math.min(1, Math.max(MIN_LOAD, Number.isFinite(load) ? load : MIN_LOAD));
    m.set(PM, 5, 1, l);
    // PUE na carga exata: interpolação linear entre os dois pontos da malha de 1%
    // (a malha é a mesma do tool original; a interpolação remove o degrau para cargas fracionárias).
    const x = l * 100;
    const i0 = Math.min(99, Math.floor(x));
    const frac = x - i0;
    const p0 = numAt(CI, 3 + i0, 42);
    const p1 = numAt(CI, 4 + i0, 42);
    const pue = frac > 0 && Number.isFinite(p1) ? p0 + (p1 - p0) * frac : p0;
    const totalKw = pue * input.itCapacityKw * l;
    return {
      load: l,
      pue,
      totalKw,
      annualCost: totalKw * 8760 * input.costPerKwh,
      energyAllocation: slices([100, 101, 102, 103], 1),
      powerBreakdown: slices([55, 56, 57, 58, 59], 1),
      coolingBreakdown: slices([60, 61, 62, 63, 64, 65], 1),
    };
  };

  const assumptions: SubsystemAssumption[] = [];
  for (let r = 75; r <= 103; r++) {
    const name = m.get(DL, r, 0);
    if (!name || typeof name !== 'string') continue;
    assumptions.push({
      subsystem: name.replace(/<[^>]+>/g, ''),
      sizingPerPuIt: numAt(DL, r, 1),
      squareLoss: numAt(DL, r, 2),
      proportionalLoss: numAt(DL, r, 3),
      fixedLoss: numAt(DL, r, 4),
    });
  }

  return { curve, at, assumptions };
}
