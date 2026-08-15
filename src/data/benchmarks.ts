/**
 * Benchmarks de PUE e limiares regulatórios.
 * Todos os valores carregam fonte e ano — princípio de transparência metodológica.
 * Atualizar anualmente (Uptime Institute Global Data Center Survey + relatórios corporativos).
 */

export interface PueBenchmark {
  id: string;
  label: string;
  value: number;
  year: number;
  source: string;
  region: 'global' | 'brasil' | 'hyperscale';
}

export const PUE_BENCHMARKS: PueBenchmark[] = [
  {
    id: 'uptime-global-2025',
    label: 'Média global — Uptime Institute',
    value: 1.54,
    year: 2025,
    source: 'Uptime Institute Global Data Center Survey 2025',
    region: 'global',
  },
  {
    id: 'enterprise-medio',
    label: 'Data center enterprise típico',
    value: 1.58,
    year: 2025,
    source: 'Uptime Institute Global Data Center Survey 2025',
    region: 'global',
  },
  {
    id: 'meta-2024',
    label: 'Meta (frota global)',
    value: 1.08,
    year: 2024,
    source: 'Meta Sustainability Report 2024',
    region: 'hyperscale',
  },
  {
    id: 'google-2025',
    label: 'Google (frota, TTM)',
    value: 1.09,
    year: 2025,
    source: 'Google Data Centers — Efficiency (trailing twelve months)',
    region: 'hyperscale',
  },
  {
    id: 'aws-2024',
    label: 'AWS (global)',
    value: 1.15,
    year: 2024,
    source: 'AWS Sustainability Report 2024',
    region: 'hyperscale',
  },
  {
    id: 'ascenty',
    label: 'Ascenty (média reportada, Brasil)',
    value: 1.42,
    year: 2025,
    source: 'Ascenty — comunicação institucional',
    region: 'brasil',
  },
];

/** Faixas de classificação calibradas nos benchmarks 2025 (não na régua obsoleta de 2010 da 42U). */
export interface PueBand {
  max: number;
  labelPt: string;
  labelEn: string;
  tone: 'excellent' | 'good' | 'ok' | 'warn' | 'bad';
}

export const PUE_BANDS: PueBand[] = [
  { max: 1.1, labelPt: 'Classe hyperscale', labelEn: 'Hyperscale class', tone: 'excellent' },
  { max: 1.25, labelPt: 'Excelente', labelEn: 'Excellent', tone: 'excellent' },
  { max: 1.4, labelPt: 'Muito eficiente', labelEn: 'Very efficient', tone: 'good' },
  { max: 1.54, labelPt: 'Eficiente — melhor que a média global', labelEn: 'Efficient — better than global average', tone: 'good' },
  { max: 1.8, labelPt: 'Na média / abaixo da média global', labelEn: 'Average / below global average', tone: 'ok' },
  { max: 2.2, labelPt: 'Ineficiente', labelEn: 'Inefficient', tone: 'warn' },
  { max: Infinity, labelPt: 'Muito ineficiente', labelEn: 'Very inefficient', tone: 'bad' },
];

/**
 * Tabela histórica da 42U (~2010) — mantida SÓ para contraste didático na página de metodologia.
 * "Average = 2.0" era a régua de 2010; hoje a média global é 1,54.
 */
export const LEGACY_42U_TABLE = [
  { pue: 3.0, dcie: 0.33, label: 'Very Inefficient' },
  { pue: 2.5, dcie: 0.4, label: 'Inefficient' },
  { pue: 2.0, dcie: 0.5, label: 'Average' },
  { pue: 1.5, dcie: 0.67, label: 'Efficient' },
  { pue: 1.2, dcie: 0.83, label: 'Very Efficient' },
];

/** Limiares regulatórios (leitura informativa, não aconselhamento jurídico). */
export const REGULATORY = {
  /** Alemanha, EnEfG: novos data centers a partir de 01/07/2026. */
  enefgNew2026: 1.2,
  /** Alemanha, EnEfG: existentes a partir de 07/2027. */
  enefgExisting2027: 1.5,
  /** Alemanha, EnEfG: existentes a partir de 07/2030. */
  enefgExisting2030: 1.3,
  /** UE, EED Art. 12: reporting obrigatório para demanda de TI instalada >= 500 kW. */
  eedReportingItKw: 500,
  sources: {
    enefg: 'Energieeffizienzgesetz (EnEfG), Alemanha, 2023',
    eed: 'EU Energy Efficiency Directive, Art. 12 + Delegated Regulation (EU) 2024/1364',
  },
} as const;

export const HOURS_PER_YEAR = 8760;
