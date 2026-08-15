/**
 * Dados de energia do Brasil: tarifas, bandeiras tarifárias, fator de emissão do SIN
 * e fatores de equivalência para comunicação.
 *
 * REGRA: nenhum valor sem fonte + ano. Pesquisa de origem em
 * docs/research/2026-08-15-benchmark/ (compilada 2026-08-15).
 * O que não foi encontrado em fonte verificável NÃO entra (ex.: equivalência em
 * "carros" exigiria empilhar 3 estimativas não oficiais — omitida de propósito).
 */

export interface DistribuidoraTarifa {
  name: string;
  uf: string;
  /** Tarifa média em R$/kWh (ver `classe` e `fonte` — valores SEM impostos). */
  tarifaRsKwh: number;
  classe: string;
  ano: number;
  fonte: string;
}

const CLASSE_CONVENCIONAL = 'Tarifa convencional (ranking ANEEL), sem impostos';
const FONTE_CONVENCIONAL = 'Ranking de tarifas ANEEL jan/2025 (via Clarke Energia)';

/**
 * Presets por distribuidora — ranking público ANEEL (tarifa convencional, sem impostos).
 * São ponto de partida didático: a tarifa real de um data center (Grupo A, TE+TUSD,
 * com impostos ou mercado livre) deve ser informada manualmente a partir da fatura.
 */
export const DISTRIBUIDORAS: DistribuidoraTarifa[] = [
  { name: 'Enel Rio de Janeiro', uf: 'RJ', tarifaRsKwh: 1.06, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Energisa Tocantins', uf: 'TO', tarifaRsKwh: 1.01, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Energisa Mato Grosso do Sul', uf: 'MS', tarifaRsKwh: 0.99, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Equatorial Pará', uf: 'PA', tarifaRsKwh: 0.98, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Equatorial Piauí', uf: 'PI', tarifaRsKwh: 0.95, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Energisa Mato Grosso', uf: 'MT', tarifaRsKwh: 0.9, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Equatorial Goiás', uf: 'GO', tarifaRsKwh: 0.89, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Light', uf: 'RJ', tarifaRsKwh: 0.88, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Neoenergia Coelba', uf: 'BA', tarifaRsKwh: 0.88, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Amazonas Energia', uf: 'AM', tarifaRsKwh: 0.88, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Cemig', uf: 'MG', tarifaRsKwh: 0.86, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'EDP Espírito Santo', uf: 'ES', tarifaRsKwh: 0.84, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Equatorial Maranhão', uf: 'MA', tarifaRsKwh: 0.84, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Neoenergia Pernambuco', uf: 'PE', tarifaRsKwh: 0.8, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Enel São Paulo', uf: 'SP', tarifaRsKwh: 0.79, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Copel', uf: 'PR', tarifaRsKwh: 0.77, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Enel Ceará', uf: 'CE', tarifaRsKwh: 0.75, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'CPFL Paulista', uf: 'SP', tarifaRsKwh: 0.74, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
  { name: 'Celesc', uf: 'SC', tarifaRsKwh: 0.7, classe: CLASSE_CONVENCIONAL, ano: 2025, fonte: FONTE_CONVENCIONAL },
];

/** Bandeiras tarifárias ANEEL — adicional em R$ por 100 kWh (vigência 2025/2026). */
export interface BandeiraTarifaria {
  id: 'verde' | 'amarela' | 'vermelha1' | 'vermelha2';
  labelPt: string;
  adicionalRsPor100Kwh: number;
  ano: number;
  fonte: string;
}

const FONTE_BANDEIRAS = 'ANEEL — sistema de bandeiras tarifárias (vigência 2025/2026)';

export const BANDEIRAS: BandeiraTarifaria[] = [
  { id: 'verde', labelPt: 'Verde (sem adicional)', adicionalRsPor100Kwh: 0, ano: 2026, fonte: FONTE_BANDEIRAS },
  { id: 'amarela', labelPt: 'Amarela', adicionalRsPor100Kwh: 1.885, ano: 2026, fonte: FONTE_BANDEIRAS },
  { id: 'vermelha1', labelPt: 'Vermelha — patamar 1', adicionalRsPor100Kwh: 4.46, ano: 2026, fonte: FONTE_BANDEIRAS },
  { id: 'vermelha2', labelPt: 'Vermelha — patamar 2', adicionalRsPor100Kwh: 7.87, ano: 2026, fonte: FONTE_BANDEIRAS },
];

/**
 * Fator médio anual de emissão de CO2 do SIN (tCO2/MWh) — MCTI/SIRENE.
 * Usado para converter kWh em tCO2e e derivar CUE (CUE = fator × PUE, método
 * indireto do The Green Grid). 2023 é o último ano FECHADO confirmado em fonte
 * pública aberta; a partir de 2025 o MCTI mudou a metodologia (inclusão de
 * renováveis na base), quebrando comparabilidade — atualizar quando o anual
 * consolidado for publicado.
 */
export interface FatorEmissaoSin {
  ano: number;
  tco2PorMwh: number;
  fonte: string;
}

export const FATORES_SIN: FatorEmissaoSin[] = [
  {
    ano: 2023,
    tco2PorMwh: 0.0385,
    fonte: 'MCTI/SIRENE — fator médio anual do SIN (menor em 12 anos)',
  },
];

/** Fator default utilizado quando o usuário não escolhe um ano específico. */
export const FATOR_SIN_DEFAULT: FatorEmissaoSin | null = FATORES_SIN[0] ?? null;

/** Fatores de equivalência para comunicação de resultados. */
export interface FatorEquivalencia {
  id: 'residencias' | 'arvores';
  labelPt: string;
  value: number;
  unit: string;
  fonte: string;
  ano: number;
  nota?: string;
}

export const EQUIVALENCIAS: FatorEquivalencia[] = [
  {
    id: 'residencias',
    labelPt: 'Residências brasileiras abastecidas por 1 ano',
    value: 179.1,
    unit: 'kWh/mês por residência',
    fonte: 'EPE — Anuário Estatístico de Energia Elétrica 2025',
    ano: 2025,
  },
  {
    id: 'arvores',
    labelPt: 'Árvores nativas equivalentes (absorção anual)',
    value: 8.15,
    unit: 'kg CO2/ano por árvore',
    fonte: 'SOS Mata Atlântica / ESALQ-USP (163 kg CO2 em 20 anos)',
    ano: 2023,
    nota: 'Faixa empírica 7–10 kg CO2/ano/árvore, varia por espécie, clima e idade.',
  },
];

/**
 * Tarifa média comercial dos EUA — contraste didático com a calculadora da 42U,
 * que ainda usa tarifa DOE/EIA de 2010.
 */
export const TARIFA_EUA_REFERENCIA = {
  centsKwh: 13.51,
  ano: 2026,
  fonte: 'EIA — Electric Power Monthly, setor comercial (abr/2026)',
} as const;
