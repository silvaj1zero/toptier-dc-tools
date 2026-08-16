/**
 * Constantes do modelo de economia de energia por virtualização.
 *
 * Reconstrução didática do TradeOff Tool descontinuado da Schneider Electric
 * ("Data Center Virtualization Energy Savings Calculator"), conforme
 * documentado publicamente. Pesquisa e decisões (mini-ADR D1–D5) em
 * docs/research/2026-08-16-virtualizacao/00-plano.md.
 *
 * REGRA da suíte estendida: além de fonte + ano, cada bloco declara o
 * NÍVEL DE EVIDÊNCIA (D5) — a UI e a metodologia devem exibi-lo:
 * - 'alta'  → rastreável a fonte primária publicada;
 * - 'media' → estrutura referenciada, valores calibrados em 1 ponto de operação;
 * - 'baixa' → premissa plausível declarada, não medida.
 */

export type NivelEvidencia = 'alta' | 'media' | 'baixa';

// ---------------------------------------------------------------------------
// Bloco 1 — Consolidação de servidores (evidência ALTA)
// ---------------------------------------------------------------------------

/**
 * Curve fit da potência do host consolidado: P_host = P_servidor × N_VMs^EXPOENTE.
 * Sublinear: um host com 10 VMs consome ~2,45× a potência de um servidor, não 10×.
 *
 * Limitação declarada: o fit é da era ~2010-2013 (servidores ineficientes em
 * idle). Servidores pós-2019 têm proporcionalidade energética melhor — a
 * economia por consolidação tende a ser MENOR que a estimada aqui.
 */
export const CONSOLIDACAO = {
  expoente: 0.38837,
  evidencia: 'alta' as NivelEvidencia,
  ano: 2013,
  fonte:
    'Schneider Electric — blog Data Center Science Center (Wendy Torell, 2013) e ' +
    'APC/SE White Paper 118; derivado de SPECpower (SPEC.org), Google "Power ' +
    'Provisioning for a Warehouse-sized Computer" e Sine Nomine Associates',
} as const;

// ---------------------------------------------------------------------------
// Bloco 2 — Infraestrutura física (evidência MÉDIA)
// ---------------------------------------------------------------------------

/**
 * Modelo de componentes: perdas FIXAS (fração × capacidade instalada) +
 * perdas PROPORCIONAIS (fração × carga de TI).
 * - pf/pp: cadeia elétrica (UPS, PDU, distribuição) — fixa/proporcional
 * - cf/cp: climatização — fixa/proporcional
 * - lt: iluminação e auxiliares (fixa)
 *
 * Estrutura conforme APC/SE White Paper 158 e modelo DOE. Os VALORES foram
 * calibrados para reproduzir o caso de referência do WP 118 (1 MW, 500 kW TI,
 * PUE 2,28 → ≈1,72 com todas as melhorias) com erro < 2% — acurácia fora
 * desse ponto não é garantida (roadmap de certificação: substituir pelas
 * curvas do LBNL Electrical Power Chain Tool).
 */
export interface InfraPreset {
  id: 'n_cw' | 'n1_cw' | 'dn_cw' | 'n_dx';
  labelPt: string;
  /** Perdas fixas da cadeia elétrica (fração da capacidade). */
  pf: number;
  /** Perdas proporcionais da cadeia elétrica (fração da carga de TI). */
  pp: number;
  /** Perdas fixas da climatização (fração da capacidade). */
  cf: number;
  /** Perdas proporcionais da climatização (fração da carga de TI). */
  cp: number;
  /** Iluminação/auxiliares (fração da capacidade). */
  lt: number;
}

export const INFRA_EVIDENCIA = {
  evidencia: 'media' as NivelEvidencia,
  fonte:
    'Estrutura: APC/SE White Paper 158 / modelo DOE. Valores: calibração para o ' +
    'caso de referência do WP 118 (erro < 2% no ponto de calibração)',
  ano: 2026,
} as const;

export const INFRA_PRESETS: InfraPreset[] = [
  { id: 'n_cw', labelPt: 'N energia, N climatização (água gelada)', pf: 0.06, pp: 0.1, cf: 0.3, cp: 0.4, lt: 0.03 },
  { id: 'n1_cw', labelPt: 'N+1 energia, N+1 climatização (água gelada)', pf: 0.075, pp: 0.11, cf: 0.34, cp: 0.42, lt: 0.03 },
  { id: 'dn_cw', labelPt: '2N energia, N+1 climatização (água gelada)', pf: 0.09, pp: 0.12, cf: 0.38, cp: 0.44, lt: 0.03 },
  { id: 'n_dx', labelPt: 'N energia, N climatização (expansão direta)', pf: 0.06, pp: 0.1, cf: 0.24, cp: 0.55, lt: 0.03 },
];

// ---------------------------------------------------------------------------
// Bloco 3 — Melhorias de infraestrutura e premissas de rack (evidência BAIXA)
// ---------------------------------------------------------------------------

/**
 * Fatores de cada melhoria (premissas do WP 118, valores calibrados —
 * plausíveis, não medidos; os mais fracos do modelo, por isso BAIXA):
 * - upsAltaEficiencia: perdas fixas ×0,42 e proporcionais ×0,40 da cadeia elétrica
 * - rightsizeUpsPdu: perdas fixas elétricas escalam pela razão carga pós/pré
 * - coolingEmFileira: perdas fixas ×0,57 e proporcionais ×0,625 da climatização
 * - rightsizeCracCrah: perdas fixas de climatização escalam pela razão pós/pré
 * - placasCegas: −5% no consumo total de climatização
 */
export const MELHORIAS = {
  evidencia: 'baixa' as NivelEvidencia,
  fonte: 'Premissas das melhorias do APC/SE White Paper 118; fatores calibrados',
  ano: 2026,
  fatores: {
    upsAltaEfFixa: 0.42,
    upsAltaEfProporcional: 0.4,
    coolingFileiraFixa: 0.57,
    coolingFileiraProporcional: 0.625,
    placasCegas: 0.95,
  },
} as const;

/** Premissas de espaço: servidor médio de 2U em racks de 42U. */
export const RACK_PREMISSAS = {
  uPorServidor: 2,
  uPorRack: 42,
  evidencia: 'baixa' as NivelEvidencia,
  fonte: 'Premissa didática do modelo original (servidor médio 2U, rack 42U)',
  ano: 2026,
} as const;
