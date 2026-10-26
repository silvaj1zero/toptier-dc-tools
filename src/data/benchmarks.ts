/**
 * Referências de PUE por classe, régua de classificação e limiares regulatórios.
 *
 * PUE não tem referência única: o valor muda com a classe do data center e com o TIPO de
 * média (por site × ponderada por capacidade × autodeclarada do operador × modelo). Por isso
 * cada referência carrega faixa, tipo de média, ano, amostra (quando há), fonte e URL, e um
 * flag de confirmação (primária = fonte lida; secundária = valor via terceiros, "a confirmar").
 *
 * Fonte de verdade desta tabela: pesquisa "Referências de PUE" de 26/10/2026 (§2).
 * Atualizar anualmente (Uptime Global Data Center Survey, LBNL, relatórios da UE e dos operadores).
 */

export type PueReferenceKind = 'class' | 'average' | 'operator';

/** Tipo de média / escopo do número — sempre exibido junto do valor. */
export type PueAverageType =
  | 'per-site-self-reported'
  | 'capacity-weighted'
  | 'operator-self-reported'
  | 'lbnl-model'
  | 'model-and-report'
  | 'weighted-report';

export const PUE_AVERAGE_TYPE_LABEL: Record<PueAverageType, { pt: string; en: string }> = {
  'per-site-self-reported': { pt: 'média por site, autodeclarada', en: 'per-site average, self-reported' },
  'capacity-weighted': { pt: 'média ponderada por capacidade', en: 'capacity-weighted average' },
  'operator-self-reported': { pt: 'autodeclarado do operador', en: 'operator self-reported' },
  'lbnl-model': { pt: 'modelo LBNL', en: 'LBNL model' },
  'model-and-report': { pt: 'modelo LBNL e reporte UE', en: 'LBNL model and EU reporting' },
  'weighted-report': { pt: 'reporte ponderado (UE)', en: 'weighted reporting (EU)' },
};

export interface PueReference {
  /** Identificador estável (R-A…R-I conforme a pesquisa; R-C/R-D/R-E são as médias). */
  id: string;
  kind: PueReferenceKind;
  labelPt: string;
  labelEn: string;
  /** Rótulo curto para o gauge. */
  shortPt: string;
  shortEn: string;
  /** Faixa da referência (mín–máx). Para médias, a série/intervalo publicado. */
  min: number;
  max: number;
  /** Valor típico; `null` quando a fonte dá só intervalo (R-H). */
  typical: number | null;
  averageType: PueAverageType;
  year: number;
  /** Nº de respondentes/sites, quando a fonte informa. */
  sample?: number;
  /** Fonte legível (autor, relatório, ano). */
  source: string;
  /** URL da fonte principal. */
  url: string;
  /** Uso interno (não exibido na interface): primary = fonte primária lida; secondary = via terceiros, a confirmar. */
  confirmation: 'primary' | 'secondary';
  /** Aparece no seletor de classe da calculadora (classes comparáveis a um DC do leitor). */
  selectable: boolean;
  notePt?: string;
  noteEn?: string;
}

const LBNL_2024 =
  'https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report_1.pdf';
const EU_EED =
  'https://op.europa.eu/en/publication-detail/-/publication/83be4c3e-5c79-11f0-a9d0-01aa75ed71a1/language-en';
const UPTIME_2026 =
  'https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/UptimeInstitute.GlobalDataCenterSurvey.2026.pdf';

export const PUE_REFERENCES: PueReference[] = [
  {
    id: 'R-A',
    kind: 'class',
    labelPt: 'Sala ou data center pequeno (< 500 kW)',
    labelEn: 'Small room or data center (< 500 kW)',
    shortPt: 'Pequeno',
    shortEn: 'Small',
    min: 1.6,
    max: 2.1,
    typical: 1.9,
    averageType: 'model-and-report',
    year: 2024,
    source:
      'LBNL 2024 (classe "Small", mediana 1,91; 1,78–2,13) · Comissão Europeia, 1º relatório técnico EED (100–1.000 kW: 1,63–1,64)',
    url: LBNL_2024,
    confirmation: 'primary',
    selectable: true,
  },
  {
    id: 'R-B',
    kind: 'class',
    labelPt: 'Enterprise e colocation médio (0,5–10 MW)',
    labelEn: 'Enterprise and mid-size colocation (0.5–10 MW)',
    shortPt: 'Enterprise/colo',
    shortEn: 'Enterprise/colo',
    min: 1.45,
    max: 1.7,
    typical: 1.6,
    averageType: 'model-and-report',
    year: 2024,
    source:
      'LBNL 2024 (classe "Midsize/Colo", 1,68; 1,55–1,88) · Comissão Europeia, 1º relatório técnico EED (1–2 MW: 1,55; 2–10 MW: 1,47)',
    url: LBNL_2024,
    confirmation: 'primary',
    selectable: true,
  },
  {
    id: 'R-C',
    kind: 'average',
    labelPt: 'América Latina — média medida',
    labelEn: 'Latin America — measured average',
    shortPt: 'América Latina',
    shortEn: 'Latin America',
    min: 1.65,
    max: 1.76,
    typical: 1.65,
    averageType: 'per-site-self-reported',
    year: 2025,
    sample: 72,
    source:
      'Uptime Institute, 2025 (n=72: 1,65); 2024 (n=85: 1,76)',
    url: 'https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2025.Annual.Survey.Report.pdf',
    confirmation: 'secondary',
    selectable: false,
    notePt: 'Média autodeclarada pelos respondentes do survey do Uptime na região.',
    noteEn: 'Average self-reported by the Uptime survey respondents in the region.',
  },
  {
    id: 'R-D',
    kind: 'average',
    labelPt: 'Média global do setor, por site',
    labelEn: 'Global industry average, per site',
    shortPt: 'Global (por site)',
    shortEn: 'Global (per site)',
    min: 1.52,
    max: 1.59,
    typical: 1.52,
    averageType: 'per-site-self-reported',
    year: 2026,
    sample: 644,
    source: 'Uptime Institute, Global Data Center Survey 2026 (n=644); faixa 1,52–1,59 = série desde 2020',
    url: UPTIME_2026,
    confirmation: 'primary',
    selectable: false,
    notePt:
      'Série publicada pelo Uptime: 2022 1,55 · 2023 1,58 · 2024 1,56 · 2025 1,54 · 2026 1,52. A pergunta mudou: "maior DC" da organização em 2024/2025, "seu DC" em 2026.',
    noteEn:
      'Series published by Uptime: 2022 1.55 · 2023 1.58 · 2024 1.56 · 2025 1.54 · 2026 1.52. The question changed: organization\'s "largest DC" in 2024/2025, "your DC" in 2026.',
  },
  {
    id: 'R-E',
    kind: 'average',
    labelPt: 'Média global ponderada por capacidade',
    labelEn: 'Global capacity-weighted average',
    shortPt: 'Global (ponderada)',
    shortEn: 'Global (weighted)',
    min: 1.36,
    max: 1.36,
    typical: 1.36,
    averageType: 'capacity-weighted',
    year: 2026,
    source:
      'Uptime Institute, Global Data Center Survey 2026 (ponderado: 1,36). Referências próximas: UE (EED, dados 2024) 1,36 ponderado por energia; EUA 1,45 (LBNL, 2024)',
    url: 'https://intelligence.uptimeinstitute.com/resource/growing-pue-advantage-larger-data-centers',
    confirmation: 'primary',
    selectable: false,
    notePt: 'Pesa mais os sites grandes — por isso fica abaixo da média por site no mesmo relatório.',
    noteEn: 'Weights large sites more — hence it sits below the per-site average in the same report.',
  },
  {
    id: 'R-F',
    kind: 'operator',
    labelPt: 'Colocation de grande escala (frota)',
    labelEn: 'Large-scale colocation (fleet)',
    shortPt: 'Colo grande',
    shortEn: 'Large colo',
    min: 1.3,
    max: 1.45,
    typical: 1.38,
    averageType: 'operator-self-reported',
    year: 2025,
    source:
      'Equinix 1,37 (2025) · Digital Realty 1,38 (2025), relatórios dos operadores · Comissão Europeia, colocation 1,43',
    url: 'https://www.equinix.com/about/sustainability/environmental',
    confirmation: 'secondary',
    selectable: false,
    notePt: 'Autodeclaração anual de cada operador, com o escopo definido por ele.',
    noteEn: 'Annual self-report by each operator, with scope defined by the operator.',
  },
  {
    id: 'R-G',
    kind: 'class',
    labelPt: 'Grande e moderno (> 10 MW)',
    labelEn: 'Large and modern (> 10 MW)',
    shortPt: 'Grande moderno',
    shortEn: 'Large modern',
    min: 1.2,
    max: 1.3,
    typical: 1.21,
    averageType: 'weighted-report',
    year: 2024,
    source: 'Comissão Europeia, 1º relatório técnico EED (> 10 MW: 1,21)',
    url: EU_EED,
    confirmation: 'primary',
    selectable: true,
  },
  {
    id: 'R-H',
    kind: 'operator',
    labelPt: 'Hyperscale próprio',
    labelEn: 'Proprietary hyperscale',
    shortPt: 'Hyperscale',
    shortEn: 'Hyperscale',
    min: 1.08,
    max: 1.22,
    typical: null,
    averageType: 'operator-self-reported',
    year: 2025,
    source:
      'Google 1,09 (TTM) · Meta 1,08 · AWS 1,15 · Microsoft 1,16–1,17 (APAC 1,28), relatórios dos operadores (frota) · LBNL hyperscale 1,22 (modelo)',
    url: 'https://datacenters.google/efficiency',
    confirmation: 'secondary',
    selectable: false,
    notePt:
      'Típico ~1,1–1,17. Outra classe: não compare o seu PUE com hyperscale sem dizer que a escala, o projeto e a medição são outros.',
    noteEn:
      'Typical ~1.1–1.17. A different class: do not compare your PUE to hyperscale without noting that scale, design and measurement differ.',
  },
  {
    id: 'R-I',
    kind: 'class',
    labelPt: 'IA / refrigeração líquida',
    labelEn: 'AI / liquid cooling',
    shortPt: 'IA/líquido',
    shortEn: 'AI/liquid',
    min: 1.09,
    max: 1.18,
    typical: 1.14,
    averageType: 'lbnl-model',
    year: 2024,
    source: 'LBNL 2024 (classe "AI specialized": 1,14 em 2023; 1,145 em 2024)',
    url: LBNL_2024,
    confirmation: 'primary',
    selectable: false,
    notePt:
      'Na refrigeração líquida a carga de ventiladores sai da "TI" e esconde ganho — por isso existem ITUE/TUE como métricas complementares.',
    noteEn:
      'With liquid cooling, fan load leaves the "IT" load and hides gains — hence ITUE/TUE as complementary metrics.',
  },
];

/** Classe pré-selecionada na calculadora (enterprise/colocation médio, R-B). */
export const DEFAULT_PUE_CLASS_ID = 'R-B';

/** Referências de classe que o leitor pode escolher para o próprio data center. */
export const PUE_CLASS_OPTIONS: PueReference[] = PUE_REFERENCES.filter((r) => r.selectable);

/** Referência regional em DESTAQUE para o usuário brasileiro: América Latina (R-C). */
export const FEATURED_REGIONAL_ID = 'R-C';
/** Média global por site (R-D): continua exibida, com o rótulo "por site", sem destaque. */
export const GLOBAL_SITE_ID = 'R-D';

export function getPueReference(id: string): PueReference | undefined {
  return PUE_REFERENCES.find((r) => r.id === id);
}

/** Valor de comparação de uma referência: o típico, ou o ponto médio da faixa quando só há intervalo. */
export function referenceCenter(ref: PueReference): number {
  return ref.typical ?? (ref.min + ref.max) / 2;
}

/** Nota geral exibida junto da régua/tabela: natureza das referências. */
export const PUE_REFERENCES_DISCLAIMER = {
  pt: 'As referências de PUE vêm de pesquisas e de dados declarados por operadores e órgãos (autodeclaração). Servem como faixa de comparação, não como medição auditada.',
  en: 'The PUE references come from surveys and from data declared by operators and agencies (self-reported). They serve as a comparison range, not as audited measurement.',
} as const;

/** Nota de atualização exibida onde as referências aparecem (metodologia e calculadora). */
export const PUE_BENCHMARK_UPDATE = {
  date: '2026-10-26',
  notePt:
    'Atualizado em 26/10/2026: a referência única de PUE ("a média global", antes 1,54 — Uptime 2025) deu lugar a uma régua de referências por classe, cada uma com faixa, tipo de média, ano e fonte. A classificação passou a usar uma régua única, a do LBNL (Standard 2,0 · Good 1,4 · Better 1,1), em vez de faixas derivadas da média global.',
  noteEn:
    'Updated on 2026-10-26: the single PUE reference ("the global average", previously 1.54 — Uptime 2025) was replaced by a ruler of per-class references, each with range, average type, year and source. Classification now uses a single ruler, LBNL\'s (Standard 2.0 · Good 1.4 · Better 1.1), instead of bands derived from the global average.',
} as const;

/**
 * Régua de classificação única: LBNL Data Center Benchmarking Guide (ecossistema DOE/DCEP) —
 * Standard 2,0 · Good 1,4 · Better 1,1. O PUE "atinge" o nível quando é menor ou igual ao limiar.
 */
export const LBNL_RULER = {
  standard: 2.0,
  good: 1.4,
  better: 1.1,
  source: 'LBNL, Data Center Benchmarking Guide',
  url: 'https://datacenters.lbl.gov/sites/default/files/datacenter-benchmarking-guide.pdf',
} as const;

/**
 * Régua da Comissão Europeia (1º relatório técnico EED, 2025) — SÓ referência textual, não classifica:
 * < 1,2 excelente · 1,2–1,5 bom · > 1,5 espaço para melhoria.
 */
export const EC_RULER_TEXT = {
  pt: 'Comissão Europeia (1º relatório técnico EED, 2025): < 1,2 excelente · 1,2–1,5 bom · > 1,5 espaço para melhoria.',
  en: 'European Commission (1st EED technical report, 2025): < 1.2 excellent · 1.2–1.5 good · > 1.5 room for improvement.',
  url: EU_EED,
} as const;

export interface PueBand {
  id: 'better' | 'good' | 'standard' | 'above-standard';
  /** Limite superior (inclusivo) da faixa. */
  max: number;
  labelPt: string;
  labelEn: string;
  tone: 'excellent' | 'good' | 'ok' | 'warn' | 'bad';
}

export const PUE_BANDS: PueBand[] = [
  { id: 'better', max: LBNL_RULER.better, labelPt: 'Better (≤ 1,1)', labelEn: 'Better (≤ 1.1)', tone: 'excellent' },
  { id: 'good', max: LBNL_RULER.good, labelPt: 'Good (≤ 1,4)', labelEn: 'Good (≤ 1.4)', tone: 'good' },
  { id: 'standard', max: LBNL_RULER.standard, labelPt: 'Standard (≤ 2,0)', labelEn: 'Standard (≤ 2.0)', tone: 'ok' },
  {
    id: 'above-standard',
    max: Infinity,
    labelPt: 'Acima do Standard (> 2,0)',
    labelEn: 'Above Standard (> 2.0)',
    tone: 'bad',
  },
];

/**
 * Tabela histórica da 42U (~2010) — mantida SÓ para contraste didático na página de metodologia.
 * "Average = 2.0" era a régua de 2010; hoje a média global por site é 1,52 (Uptime, 2026) e varia por classe.
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
