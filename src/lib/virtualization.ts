/**
 * Engine de economia de energia por virtualização — funções puras, sem estado.
 *
 * Pipeline determinístico (mesma arquitetura do TradeOff Tool original):
 *   Inputs → P_servidores → P_TI → P_infra (modelo de componentes) → P_total → custo/ano
 *
 * Cada checkbox de melhoria é um modificador dos coeficientes de infraestrutura.
 * O modelo reproduz o "paradoxo do PUE": consolidar TI sem right-sizing da
 * infraestrutura PIORA o PUE (as perdas fixas passam a pesar mais sobre uma
 * carga menor); as melhorias recompõem a economia.
 *
 * Fontes e níveis de evidência das constantes: src/data/virtualizacao.ts.
 * Decisões de engenharia: docs/research/2026-08-16-virtualizacao/00-plano.md.
 */

import { HOURS_PER_YEAR } from '@/data/benchmarks';
import {
  CONSOLIDACAO,
  INFRA_PRESETS,
  MELHORIAS,
  RACK_PREMISSAS,
  type InfraPreset,
} from '@/data/virtualizacao';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Melhorias {
  /** Right-size dos CRAC/CRAH: perdas fixas de climatização escalam pela razão de carga. */
  rightsizeCracCrah: boolean;
  /** Right-size de UPS/PDU: perdas fixas elétricas escalam pela razão de carga. */
  rightsizeUpsPdu: boolean;
  /** UPS de alta eficiência. */
  upsAltaEficiencia: boolean;
  /** Climatização em fileira (row-based cooling). */
  coolingEmFileira: boolean;
  /** Placas cegas (blanking panels). */
  placasCegas: boolean;
}

export const SEM_MELHORIAS: Melhorias = {
  rightsizeCracCrah: false,
  rightsizeUpsPdu: false,
  upsAltaEficiencia: false,
  coolingEmFileira: false,
  placasCegas: false,
};

export const TODAS_MELHORIAS: Melhorias = {
  rightsizeCracCrah: true,
  rightsizeUpsPdu: true,
  upsAltaEficiencia: true,
  coolingEmFileira: true,
  placasCegas: true,
};

export interface VirtualizationInput {
  /** Capacidade de TI instalada do data center (kW). */
  capacidadeKw: number;
  /** Carga de TI atual (kW). Se exceder a capacidade, é limitada a ela (comportamento do modelo original). */
  cargaTiKw: number;
  /** Percentual da carga de TI que é servidor (0–100). */
  pctServidores: number;
  /** Número total de servidores físicos. */
  numServidores: number;
  /** Ocupação de U por rack, em % (10–100). */
  ocupacaoRackPct: number;
  /** Preço efetivo da energia por kWh (na moeda que o chamador escolher). */
  precoKwh: number;
  /** Preset de arquitetura de infraestrutura. */
  infraId: InfraPreset['id'];
  /** Percentual dos servidores que pode ser virtualizado (0–100). */
  pctVirtualizavel: number;
  /** Razão de consolidação (VMs por host), >= 1. */
  razaoConsolidacao: number;
  /** Melhorias de infraestrutura aplicadas no cenário pós. */
  melhorias: Melhorias;
}

export interface InfraBreakdownKw {
  eletricaKw: number;
  climatizacaoKw: number;
  auxiliaresKw: number;
  totalKw: number;
}

export interface CenarioResult {
  servidores: number;
  racks: number;
  potenciaServidoresKw: number;
  cargaTiKw: number;
  infra: InfraBreakdownKw;
  totalKw: number;
  pue: number;
  energiaAnualKwh: number;
  custoAnual: number;
}

export interface VirtualizationResult {
  pre: CenarioResult;
  pos: CenarioResult;
  /** Razão entre a carga de TI pós e pré (usada pelos right-sizings). */
  razaoCarga: number;
  economiaAnual: number;
  economiaAnualKwh: number;
}

// ---------------------------------------------------------------------------
// Blocos do pipeline (exportados para teste e para a página de metodologia)
// ---------------------------------------------------------------------------

/**
 * Potência de um host consolidado (curve fit WP 118):
 * P_host = P_servidor × N_VMs^0.38837 — sublinear: 10 VMs ⇒ ~2,45×, não 10×.
 */
export function potenciaHostKw(potenciaServidorKw: number, vmsPorHost: number): number {
  if (vmsPorHost < 1) throw new RangeError('Razão de consolidação deve ser >= 1');
  return potenciaServidorKw * Math.pow(vmsPorHost, CONSOLIDACAO.expoente);
}

interface CoeficientesAplicados {
  pf: number;
  pp: number;
  cf: number;
  cp: number;
  lt: number;
  fatorPlacasCegas: number;
}

/** Aplica as melhorias selecionadas sobre os coeficientes-base do preset. */
export function aplicarMelhorias(
  base: InfraPreset,
  m: Melhorias,
  razaoCarga: number,
): CoeficientesAplicados {
  const f = MELHORIAS.fatores;
  let { pf, pp, cf, cp } = base;
  if (m.upsAltaEficiencia) {
    pf *= f.upsAltaEfFixa;
    pp *= f.upsAltaEfProporcional;
  }
  if (m.rightsizeUpsPdu) pf *= razaoCarga;
  if (m.coolingEmFileira) {
    cf *= f.coolingFileiraFixa;
    cp *= f.coolingFileiraProporcional;
  }
  if (m.rightsizeCracCrah) cf *= razaoCarga;
  return { pf, pp, cf, cp, lt: base.lt, fatorPlacasCegas: m.placasCegas ? f.placasCegas : 1 };
}

/** Potência da infraestrutura física (perdas fixas × capacidade + proporcionais × carga). */
export function potenciaInfra(
  cargaTiKw: number,
  capacidadeKw: number,
  c: CoeficientesAplicados,
): InfraBreakdownKw {
  const eletricaKw = c.pf * capacidadeKw + c.pp * cargaTiKw;
  const climatizacaoKw = (c.cf * capacidadeKw + c.cp * cargaTiKw) * c.fatorPlacasCegas;
  const auxiliaresKw = c.lt * capacidadeKw;
  return { eletricaKw, climatizacaoKw, auxiliaresKw, totalKw: eletricaKw + climatizacaoKw + auxiliaresKw };
}

/** Racks necessários para N servidores (premissa 2U/42U, limitada pela ocupação informada). */
export function racksNecessarios(servidores: number, ocupacaoRackPct: number): number {
  const uUteisPorRack = RACK_PREMISSAS.uPorRack * (ocupacaoRackPct / 100);
  return Math.ceil((servidores * RACK_PREMISSAS.uPorServidor) / uUteisPorRack);
}

// ---------------------------------------------------------------------------
// Pipeline completo
// ---------------------------------------------------------------------------

function validar(input: VirtualizationInput): void {
  const err = (msg: string) => {
    throw new RangeError(msg);
  };
  if (input.capacidadeKw <= 0) err('Capacidade deve ser maior que zero');
  if (input.cargaTiKw <= 0) err('Carga de TI deve ser maior que zero');
  if (input.numServidores <= 0 || !Number.isFinite(input.numServidores))
    err('Número de servidores deve ser maior que zero');
  if (input.pctServidores <= 0 || input.pctServidores > 100)
    err('Percentual de servidores deve estar entre 0 e 100');
  if (input.pctVirtualizavel < 0 || input.pctVirtualizavel > 100)
    err('Percentual virtualizável deve estar entre 0 e 100');
  if (input.razaoConsolidacao < 1) err('Razão de consolidação deve ser >= 1');
  if (input.ocupacaoRackPct < 10 || input.ocupacaoRackPct > 100)
    err('Ocupação de rack deve estar entre 10 e 100%');
  if (input.precoKwh < 0) err('Preço do kWh não pode ser negativo');
}

function montarCenario(
  servidores: number,
  potenciaServidoresKw: number,
  cargaTiKw: number,
  input: VirtualizationInput,
  infra: InfraBreakdownKw,
): CenarioResult {
  const totalKw = cargaTiKw + infra.totalKw;
  const energiaAnualKwh = totalKw * HOURS_PER_YEAR;
  return {
    servidores,
    racks: racksNecessarios(servidores, input.ocupacaoRackPct),
    potenciaServidoresKw,
    cargaTiKw,
    infra,
    totalKw,
    pue: totalKw / cargaTiKw,
    energiaAnualKwh,
    custoAnual: energiaAnualKwh * input.precoKwh,
  };
}

/**
 * Simula os cenários pré e pós-virtualização.
 * A capacidade instalada NÃO muda com a virtualização — é isso que gera o
 * paradoxo do PUE quando não há right-sizing.
 */
export function virtualizationSavings(input: VirtualizationInput): VirtualizationResult {
  validar(input);
  const base = INFRA_PRESETS.find((p) => p.id === input.infraId);
  if (!base) throw new RangeError(`Preset de infraestrutura desconhecido: ${input.infraId}`);

  // Comportamento do modelo original: a carga de TI não excede a capacidade.
  const carga = Math.min(input.cargaTiKw, input.capacidadeKw);

  // --- Cenário pré ---
  const pServidoresPre = carga * (input.pctServidores / 100);
  const pNaoServidor = carga - pServidoresPre;
  const pPorServidor = pServidoresPre / input.numServidores;
  const infraPre = potenciaInfra(carga, input.capacidadeKw, aplicarMelhorias(base, SEM_MELHORIAS, 1));
  const pre = montarCenario(input.numServidores, pServidoresPre, carga, input, infraPre);

  // --- Consolidação (curve fit) ---
  const virtualizaveis = input.numServidores * (input.pctVirtualizavel / 100);
  const hosts = Math.ceil(virtualizaveis / input.razaoConsolidacao);
  const remanescentes = input.numServidores - virtualizaveis;
  const pPorHost = potenciaHostKw(pPorServidor, input.razaoConsolidacao);
  const pServidoresPos = remanescentes * pPorServidor + hosts * pPorHost;
  const servidoresPos = Math.round(remanescentes + hosts);
  const cargaPos = pNaoServidor + pServidoresPos;
  const razaoCarga = cargaPos / carga;

  // --- Cenário pós ---
  const infraPos = potenciaInfra(
    cargaPos,
    input.capacidadeKw,
    aplicarMelhorias(base, input.melhorias, razaoCarga),
  );
  const pos = montarCenario(servidoresPos, pServidoresPos, cargaPos, input, infraPos);

  return {
    pre,
    pos,
    razaoCarga,
    economiaAnual: pre.custoAnual - pos.custoAnual,
    economiaAnualKwh: pre.energiaAnualKwh - pos.energiaAnualKwh,
  };
}
