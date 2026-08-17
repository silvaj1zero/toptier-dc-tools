/**
 * Goal-loop GL2 — gera a amostra determinística de cenários e o gabarito da engine.
 * Uso: npx vite-node --config vitest.config.ts docs/research/2026-08-17-pue-calculator/goal-loop/gerar-amostra.ts
 * Saída: amostra.json { meta, cenarios: [{id, sets:[[sheet,r,c,v]], esperado:{l10,l25,l50,l75,l100}}] }
 * Comparabilidade: a curva é lida com o marker fixo em 50% nos dois lados.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_DETAILS,
  DEFAULT_SCENARIO,
  runScenario,
  type DesignDetails,
  type ProjectScenario,
} from '@/lib/pue-model';

// PRNG determinístico (mulberry32) — seed fixa para reprodutibilidade
let seed = 98211747;
const rnd = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T,>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)]!;

const UPS = ['legacy', 'typical', 'highEfficiency', 'none'] as const;
const COOL = ['chilledWater', 'dxGlycol', 'airCooled'] as const;
const CHILLER = ['towerChiller', 'towerChillerVfd', 'dryCoolerChiller', 'dryCoolerChillerVfd', 'packagedChiller'] as const;
const AIR = ['perimeter', 'closeCoupled'] as const;
const CRAC = ['n', 'n1', '2n', '2n1'] as const;
const ECON = [0, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 8760];
const DKEYS = Object.keys(DEFAULT_DETAILS) as Array<keyof DesignDetails>;

function cenarioAleatorio(): ProjectScenario {
  const det = { ...DEFAULT_DETAILS };
  for (const k of DKEYS) det[k] = rnd() < 0.5;
  return {
    ...DEFAULT_SCENARIO,
    upsSystem: pick(UPS),
    dualPowerPath: rnd() < 0.3,
    coolingSystem: pick(COOL),
    chiller: pick(CHILLER),
    airDistribution: pick(AIR),
    cracRedundancy: pick(CRAC),
    dualHeatRejection: rnd() < 0.3,
    economizerHours: pick(ECON),
    designDetails: det,
  };
}

const cenarios: Array<{ id: string; s: ProjectScenario }> = [];

// 1) Cantos estruturais: fatorial UPS × cooling × (detalhes off/on)
const detOn: DesignDetails = { ...DEFAULT_DETAILS };
for (const k of DKEYS) detOn[k] = true;
detOn.standbyGenerator = false; // adders puros ficam off no canto "eficiente"
detOn.cracOnUps = false;
for (const ups of UPS)
  for (const cool of COOL)
    for (const on of [false, true]) {
      cenarios.push({
        id: `canto-${ups}-${cool}-${on ? 'detON' : 'detoff'}`,
        s: { ...DEFAULT_SCENARIO, upsSystem: ups, coolingSystem: cool, designDetails: on ? { ...detOn } : { ...DEFAULT_DETAILS } },
      });
    }

// 2) Candidatas do Cenário B do print do operador (região PUE≈1,4747 @25%)
cenarios.push({
  id: 'printB-cand1',
  s: { ...DEFAULT_SCENARIO, costPerKwh: 0.15, upsSystem: 'none', airDistribution: 'closeCoupled', chiller: 'packagedChiller', economizerHours: 8000, designDetails: { ...DEFAULT_DETAILS, standbyGenerator: true, energyEfficientLighting: true, cracOnUps: true, vfdHeatRejectionPumps: true, droppedCeilingReturn: true, optimizedTilePlacement: true } },
});
cenarios.push({
  id: 'printB-cand3',
  s: { ...DEFAULT_SCENARIO, costPerKwh: 0.15, upsSystem: 'none', airDistribution: 'closeCoupled', chiller: 'towerChillerVfd', economizerHours: 5500, designDetails: { ...DEFAULT_DETAILS, standbyGenerator: true, upsEcoMode: true, pdusWithoutTransformers: true, coordinatedCrac: true, vfdHeatRejectionPumps: true, vfdChilledWaterPumps: true } },
});

// 3) Aleatórios com seed
for (let i = 0; i < 96; i++) cenarios.push({ id: `rnd-${String(i).padStart(2, '0')}`, s: cenarioAleatorio() });

// ---- Mapeamento cenário → escritas de célula (o contrato validado da API) ----
const UPS_I = { legacy: 1, typical: 2, highEfficiency: 3, none: 4 } as const;
const COOL_I = { chilledWater: 1, dxGlycol: 2, airCooled: 3 } as const;
const CH_I = { towerChiller: 1, towerChillerVfd: 2, dryCoolerChiller: 3, dryCoolerChillerVfd: 4, packagedChiller: 5 } as const;
const CRAC_I = { n: 1, n1: 2, '2n': 3, '2n1': 4 } as const;
const yn = (b: boolean) => (b ? 'Yes' : 'No');

function sets(s: ProjectScenario): Array<[string, number, number, number | string]> {
  const d = s.designDetails;
  return [
    ['Power Meters', 1, 1, s.itCapacityKw],
    ['Power Meters', 5, 1, 0.5], // marker fixo p/ comparabilidade da curva
    ['Crystal Interface', 25, 1, s.economizerHours / 8760], // fração direta (listener lazy de r26c1 no runtime)
    ['Device Losses', 3, 19, UPS_I[s.upsSystem]],
    ['Device Losses', 3, 13, yn(s.dualPowerPath)],
    ['Device Losses', 5, 13, COOL_I[s.coolingSystem]],
    ['Device Losses', 12, 13, CH_I[s.chiller]],
    ['Device Losses', 7, 13, yn(s.airDistribution === 'closeCoupled')],
    ['Device Losses', 6, 13, CRAC_I[s.cracRedundancy]],
    ['Device Losses', 9, 13, yn(s.dualHeatRejection)],
    ['Device Losses', 4, 13, yn(d.standbyGenerator)],
    ['Device Losses', 7, 19, yn(d.upsEcoMode)],
    ['Device Losses', 4, 19, yn(d.pdusWithoutTransformers)],
    ['Device Losses', 5, 19, d.energyEfficientLighting ? 2 : 1],
    ['Device Losses', 9, 19, yn(d.cracOnUps)],
    ['Device Losses', 5, 25, yn(d.coordinatedCrac)],
    ['Device Losses', 10, 13, yn(d.vfdHeatRejectionPumps)],
    ['Device Losses', 8, 13, yn(d.vfdChilledWaterPumps)],
    ['Device Losses', 6, 25, yn(d.deepRaisedFloor)],
    ['Device Losses', 8, 25, yn(d.droppedCeilingReturn)],
    ['Device Losses', 7, 25, yn(d.optimizedRackLayout)],
    ['Device Losses', 3, 25, yn(d.optimizedTilePlacement)],
    ['Device Losses', 4, 25, yn(d.blankingPanels)],
  ];
}

const LOADS = [10, 25, 50, 75, 100];
const out = cenarios.map(({ id, s }) => {
  const r = runScenario(s);
  const esperado: Record<string, number> = {};
  for (const l of LOADS) esperado[`l${l}`] = r.curve[l]!.pue;
  return { id, sets: sets(s), esperado };
});

const dir = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(dir, 'amostra.json'), JSON.stringify({ meta: { seed: 98211747, n: out.length, loads: LOADS, gerado: '2026-08-17' }, cenarios: out }));
console.log(`amostra: ${out.length} cenários × ${LOADS.length} cargas = ${out.length * LOADS.length} pontos`);
