/**
 * Dados de energia do Brasil: tarifas, bandeiras tarifárias, fator de emissão do SIN
 * e fatores de equivalência para comunicação.
 *
 * REGRA: nenhum valor sem fonte + ano. Valores marcados PENDENTE_VERIFICACAO
 * ainda não foram confirmados contra a fonte primária e NÃO são exibidos como
 * preset na UI (o usuário informa a própria tarifa) até a verificação.
 */

export interface DistribuidoraTarifa {
  name: string;
  uf: string;
  /** Tarifa média em R$/kWh (com tributos, salvo indicação em contrário). */
  tarifaRsKwh: number;
  classe: string;
  ano: number;
  fonte: string;
}

/**
 * Presets por distribuidora — preenchidos a partir de dados ANEEL verificados.
 * Enquanto vazio, a UI exibe apenas o campo de tarifa manual.
 */
export const DISTRIBUIDORAS: DistribuidoraTarifa[] = [];

/** Bandeiras tarifárias ANEEL — adicional em R$ por 100 kWh. */
export interface BandeiraTarifaria {
  id: 'verde' | 'amarela' | 'vermelha1' | 'vermelha2';
  labelPt: string;
  adicionalRsPor100Kwh: number;
  ano: number;
  fonte: string;
}

export const BANDEIRAS: BandeiraTarifaria[] = [
  {
    id: 'verde',
    labelPt: 'Verde (sem adicional)',
    adicionalRsPor100Kwh: 0,
    ano: 2026,
    fonte: 'ANEEL — sistema de bandeiras tarifárias',
  },
  {
    id: 'amarela',
    labelPt: 'Amarela',
    adicionalRsPor100Kwh: 1.885,
    ano: 2026,
    fonte: 'ANEEL — bandeira vigente em mai/2026 (R$ 1,885/100 kWh)',
  },
  // Patamares vermelhos serão adicionados após verificação na fonte ANEEL.
];

/**
 * Fator médio anual de emissão de CO2 do SIN (tCO2/MWh) — MCTI.
 * Usado para converter kWh economizado em tCO2e evitado e para derivar CUE
 * (CUE = fator de emissão × PUE, método indireto do The Green Grid).
 */
export interface FatorEmissaoSin {
  ano: number;
  tco2PorMwh: number;
  fonte: string;
}

export const FATORES_SIN: FatorEmissaoSin[] = [];

/** Fator default utilizado quando o usuário não escolhe um ano específico. */
export const FATOR_SIN_DEFAULT: FatorEmissaoSin | null = null;

/** Fatores de equivalência para comunicação de resultados. */
export interface FatorEquivalencia {
  id: string;
  labelPt: string;
  /** Valor por unidade (ver unidade em `unit`). */
  value: number;
  unit: string;
  fonte: string;
  ano: number;
}

export const EQUIVALENCIAS: FatorEquivalencia[] = [];

/**
 * Tarifa média de referência dos EUA (comparativo didático com a 42U, que usa
 * tarifa DOE/EIA de 2010). Preenchido após verificação EIA.
 */
export const TARIFA_EUA_REFERENCIA: { centsKwh: number; ano: number; fonte: string } | null = null;
