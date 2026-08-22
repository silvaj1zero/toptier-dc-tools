/**
 * Engine de planejamento de espaço e densidade — funções puras, sem estado.
 *
 * Transpilação 1:1 das planilhas do método Schneider/APC (White Paper #155,
 * "Calculating Space and Power Density Requirements for Data Centers"):
 *   - "Density spec room pt v5 m2.xlsx"     → calcularSala()
 *   - "Density spec facility v5 m2.xlsx"    → calcularInstalacao()
 *
 * O modelo é uma cascata hierárquica de "sistemas": Gabinete → Pod → Sala →
 * Instalação. Cada nível reserva espaço em unidades do nível inferior
 * (área da linha = unidades × área-por-unidade + extra em m²) e a densidade
 * resulta no fim (W/m² = 1000 × potência nominal / área total) — nunca é
 * um input, o que resolve a ambiguidade histórica do "W/m² de projeto".
 *
 * Dump célula a célula das planilhas (valores + fórmulas) em
 * docs/research/2026-08-22-densidade/fontes/. Os testes fixam os cenários
 * default das planilhas com igualdade a 1e-9.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Uma linha de reserva de espaço: unidades do nível inferior + extra fixo. */
export interface LinhaEspaco {
  /** Nº de unidades-equivalentes do nível inferior reservadas nesta linha. */
  unidades: number;
  /** Área adicional fixa (m²). */
  extraM2: number;
}

/** As 8 linhas de uso de espaço de um sistema (mesma ordem das planilhas). */
export interface EspacosSistema {
  /** Requisito de área para as unidades de TI (linha "cabinets/pods/rooms"). */
  unidades: LinhaEspaco;
  /** Espaço reservado para staging (montagem/testes). */
  staging: LinhaEspaco;
  /** Espaço reservado para incerteza de densidade. */
  incerteza: LinhaEspaco;
  /** Espaço reservado para energia (UPS, quadros, baterias). */
  energia: LinhaEspaco;
  /** Espaço reservado para climatização. */
  climatizacao: LinhaEspaco;
  /** Espaço reservado para sistemas auxiliares. */
  auxiliares: LinhaEspaco;
  /** Espaço reservado para storage (almoxarifado). */
  storage: LinhaEspaco;
  /** Espaço para saídas, rampas e colunas. */
  circulacao: LinhaEspaco;
}

/** Parâmetros do nível folha (gabinete de TI). */
export interface ParametrosGabinete {
  /** Potência média desejada (projeto) por gabinete (kW). */
  potenciaMediaKw: number;
  /** Potência de pico (máx.) por gabinete (kW). */
  potenciaPicoKw: number;
  /** Incerteza de potência do gabinete, fração ± (ex.: 0.2 = ±20%). */
  incerteza: number;
  /** Relação de potência gerenciada (TI): fração da nominal efetivamente usada. */
  relacaoGerenciada: number;
  /** Área ocupada por gabinete, incluindo corredores rateados (m²). */
  areaM2: number;
}

/** Um sistema (pod, sala ou instalação) agregando N unidades do nível abaixo. */
export interface SistemaInput {
  /** Nº de unidades do nível inferior no sistema (dimensiona a potência). */
  numUnidades: number;
  /** Potência de pico por unidade neste nível (kW) — informativa. */
  potenciaPicoUnidadeKw: number;
  /** Linhas de uso de espaço. */
  espacos: EspacosSistema;
}

/** Áreas resolvidas por linha (m²). */
export interface AreasSistema {
  unidades: number;
  staging: number;
  incerteza: number;
  energia: number;
  climatizacao: number;
  auxiliares: number;
  storage: number;
  circulacao: number;
}

/** Resultado de um sistema (equivale ao "Performance Summary" da planilha). */
export interface SistemaResult {
  numUnidades: number;
  /** Potência média por unidade herdada do nível inferior (kW). */
  potenciaMediaUnidadeKw: number;
  potenciaPicoUnidadeKw: number;
  /** Área por unidade herdada do nível inferior (m²). */
  areaPorUnidadeM2: number;
  /** Potência nominal do sistema (kW) = unidades × média. */
  potenciaNominalKw: number;
  /** Potência operacional de TI esperada (kW) = nominal × relação gerenciada. */
  potenciaOperacionalKw: number;
  /** Potência média esperada por unidade (kW) = média × relação gerenciada. */
  potenciaMediaEsperadaUnidadeKw: number;
  /** Áreas por linha (m²). */
  areas: AreasSistema;
  /** Tamanho do sistema (m²) — soma das linhas, exceto a sugestão. */
  areaTotalM2: number;
  /** Espaço sugerido para incerteza de densidade (m²) — recomendação, fora da soma. */
  sugestaoIncertezaM2: number;
  /** Fração do espaço não utilizado esperada = (staging + incerteza) / total. */
  espacoNaoUtilizado: number;
  /** Densidade de potência do sistema (W/m²) = 1000 × nominal / área total. */
  densidadeWm2: number;
  /** Nº esperado de gabinetes de TI (produto das linhas "unidades" da cascata). */
  gabinetesEsperados: number;
  /** Nº máximo de gabinetes (usa também staging + incerteza como expansão). */
  gabinetesMax: number;
}

export interface SalaInput {
  gabinete: ParametrosGabinete;
  sala: SistemaInput;
}

export interface InstalacaoInput {
  gabinete: ParametrosGabinete;
  pod: SistemaInput;
  sala: SistemaInput;
  instalacao: SistemaInput;
}

export interface InstalacaoResult {
  pod: SistemaResult;
  sala: SistemaResult;
  instalacao: SistemaResult;
}

// ---------------------------------------------------------------------------
// Núcleo
// ---------------------------------------------------------------------------

/** O que um nível precisa saber sobre o nível imediatamente inferior. */
interface Filho {
  /** Potência que uma unidade deste nível representa (kW): média do gabinete ou nominal do sistema filho. */
  potenciaKw: number;
  /** Área que uma unidade deste nível ocupa (m²): área do gabinete ou área total do sistema filho. */
  areaM2: number;
  /** Gabinetes esperados dentro de uma unidade (1 para o gabinete). */
  gabinetesEsperados: number;
  /** Gabinetes máximos dentro de uma unidade (1 para o gabinete). */
  gabinetesMax: number;
  /** Sugestão de incerteza do filho (m²) — ausente quando o filho é o gabinete. */
  sugestaoIncertezaM2?: number;
  /** Área reservada para incerteza no filho (m²). */
  areaIncertezaM2?: number;
  /** Área da linha "unidades" no filho (m²). */
  areaUnidadesM2?: number;
  /** Incerteza da folha (só quando o filho é o gabinete). */
  incertezaFolha?: number;
}

/** Ordem canônica das linhas de espaço (mesma das planilhas) — usada pela UI. */
export const LINHAS_ESPACO = [
  'unidades',
  'staging',
  'incerteza',
  'energia',
  'climatizacao',
  'auxiliares',
  'storage',
  'circulacao',
] as const;

export type LinhaEspacoKey = (typeof LINHAS_ESPACO)[number];

const LINHAS = LINHAS_ESPACO;

function err(msg: string): never {
  throw new RangeError(msg);
}

function validarGabinete(g: ParametrosGabinete): void {
  for (const [campo, v] of Object.entries(g)) {
    if (!Number.isFinite(v)) err(`Parâmetro do gabinete "${campo}" deve ser um número finito`);
  }
  if (g.potenciaMediaKw <= 0) err('Potência média por gabinete deve ser maior que zero');
  if (g.potenciaPicoKw < g.potenciaMediaKw)
    err('Potência de pico deve ser maior ou igual à média');
  if (g.incerteza < 0 || g.incerteza >= 1) err('Incerteza deve estar entre 0 e 1 (exclusivo)');
  if (g.relacaoGerenciada <= 0 || g.relacaoGerenciada > 1)
    err('Relação de potência gerenciada deve estar entre 0 e 1');
  if (g.areaM2 <= 0) err('Área por gabinete deve ser maior que zero');
}

function validarSistema(s: SistemaInput, nome: string): void {
  if (!Number.isInteger(s.numUnidades) || s.numUnidades <= 0)
    err(`Número de unidades (${nome}) deve ser um inteiro maior que zero`);
  if (!Number.isFinite(s.potenciaPicoUnidadeKw) || s.potenciaPicoUnidadeKw < 0)
    err(`Potência de pico por unidade (${nome}) deve ser um número não negativo`);
  for (const linha of LINHAS) {
    const { unidades, extraM2 } = s.espacos[linha];
    if (unidades < 0 || !Number.isFinite(unidades))
      err(`Unidades da linha "${linha}" (${nome}) não podem ser negativas`);
    if (extraM2 < 0 || !Number.isFinite(extraM2))
      err(`Extra em m² da linha "${linha}" (${nome}) não pode ser negativo`);
  }
  // A área das unidades de TI é o denominador da cascata de sugestões (e um
  // sistema sem espaço de TI não é um sistema): rejeitar em vez de propagar 0.
  if (s.espacos.unidades.unidades <= 0 && s.espacos.unidades.extraM2 <= 0)
    err(`A linha "unidades" (${nome}) precisa reservar área maior que zero`);
}

/**
 * Calcula um sistema a partir do seu nível inferior. Reproduz uma coluna da
 * planilha de instalação (Cabinet→Pod, Pod→Room, Room→Facility); a planilha
 * de sala é o caso de um único sistema sobre o gabinete.
 */
function calcularSistema(
  filho: Filho,
  input: SistemaInput,
  relacaoGerenciada: number,
): SistemaResult {
  const areaPorUnidade = filho.areaM2;

  const areas = {} as AreasSistema;
  for (const linha of LINHAS) {
    const { unidades, extraM2 } = input.espacos[linha];
    areas[linha] = unidades * areaPorUnidade + extraM2;
  }
  const areaTotalM2 =
    areas.unidades +
    areas.staging +
    areas.incerteza +
    areas.energia +
    areas.climatizacao +
    areas.auxiliares +
    areas.storage +
    areas.circulacao;

  const potenciaNominalKw = input.numUnidades * filho.potenciaKw;

  // Sugestão de espaço para incerteza de densidade (linha informativa, fora da soma):
  //  - sobre o gabinete: nominal × área/unid ÷ potência média × (u / (1 − u))
  //  - sobre um sistema: (sugestão do filho − reservado no filho) × unidades ×
  //    (área total do filho ÷ área da linha "unidades" do filho)
  let sugestaoIncertezaM2: number;
  if (filho.incertezaFolha !== undefined) {
    const u = filho.incertezaFolha;
    sugestaoIncertezaM2 = ((potenciaNominalKw * areaPorUnidade) / filho.potenciaKw) * (u / (1 - u));
  } else {
    const naoAtendida = (filho.sugestaoIncertezaM2 ?? 0) - (filho.areaIncertezaM2 ?? 0);
    const areaUnidadesFilho = filho.areaUnidadesM2 ?? 0;
    sugestaoIncertezaM2 =
      areaUnidadesFilho > 0
        ? (naoAtendida * input.numUnidades * filho.areaM2) / areaUnidadesFilho
        : 0;
  }

  const somaExpansao =
    input.espacos.unidades.unidades +
    input.espacos.staging.unidades +
    input.espacos.incerteza.unidades;

  return {
    numUnidades: input.numUnidades,
    potenciaMediaUnidadeKw: filho.potenciaKw,
    potenciaPicoUnidadeKw: input.potenciaPicoUnidadeKw,
    areaPorUnidadeM2: areaPorUnidade,
    potenciaNominalKw,
    potenciaOperacionalKw: potenciaNominalKw * relacaoGerenciada,
    potenciaMediaEsperadaUnidadeKw: filho.potenciaKw * relacaoGerenciada,
    areas,
    areaTotalM2,
    sugestaoIncertezaM2,
    espacoNaoUtilizado: areaTotalM2 > 0 ? (areas.staging + areas.incerteza) / areaTotalM2 : 0,
    densidadeWm2: areaTotalM2 > 0 ? (1000 * potenciaNominalKw) / areaTotalM2 : 0,
    gabinetesEsperados: filho.gabinetesEsperados * input.espacos.unidades.unidades,
    gabinetesMax: filho.gabinetesMax * somaExpansao,
  };
}

function filhoDeGabinete(g: ParametrosGabinete): Filho {
  return {
    potenciaKw: g.potenciaMediaKw,
    areaM2: g.areaM2,
    gabinetesEsperados: 1,
    gabinetesMax: 1,
    incertezaFolha: g.incerteza,
  };
}

function filhoDeSistema(r: SistemaResult): Filho {
  return {
    potenciaKw: r.potenciaNominalKw,
    areaM2: r.areaTotalM2,
    gabinetesEsperados: r.gabinetesEsperados,
    gabinetesMax: r.gabinetesMax,
    sugestaoIncertezaM2: r.sugestaoIncertezaM2,
    areaIncertezaM2: r.areas.incerteza,
    areaUnidadesM2: r.areas.unidades,
  };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/** Especificação de sala (planilha "Density spec room"): um sistema sobre gabinetes. */
export function calcularSala(input: SalaInput): SistemaResult {
  validarGabinete(input.gabinete);
  validarSistema(input.sala, 'sala');
  return calcularSistema(
    filhoDeGabinete(input.gabinete),
    input.sala,
    input.gabinete.relacaoGerenciada,
  );
}

/**
 * Especificação de instalação (planilha "Density spec facility"):
 * cascata Gabinete → Pod → Sala → Instalação.
 */
export function calcularInstalacao(input: InstalacaoInput): InstalacaoResult {
  validarGabinete(input.gabinete);
  validarSistema(input.pod, 'pod');
  validarSistema(input.sala, 'sala');
  validarSistema(input.instalacao, 'instalação');
  const rg = input.gabinete.relacaoGerenciada;
  const pod = calcularSistema(filhoDeGabinete(input.gabinete), input.pod, rg);
  const sala = calcularSistema(filhoDeSistema(pod), input.sala, rg);
  const instalacao = calcularSistema(filhoDeSistema(sala), input.instalacao, rg);
  return { pod, sala, instalacao };
}

// ---------------------------------------------------------------------------
// Cenários default das planilhas (usados pela UI e pelos testes 1:1)
// ---------------------------------------------------------------------------

/** Defaults da planilha "Density spec room pt v5 m2.xlsx" (sala pequena, 12 gabinetes). */
export const SALA_DEFAULT: SalaInput = {
  gabinete: {
    potenciaMediaKw: 4,
    potenciaPicoKw: 8,
    incerteza: 0.2,
    relacaoGerenciada: 0.7,
    areaM2: 1.5,
  },
  sala: {
    numUnidades: 12,
    potenciaPicoUnidadeKw: 8,
    espacos: {
      unidades: { unidades: 12, extraM2: 0 },
      staging: { unidades: 2, extraM2: 0 },
      incerteza: { unidades: 2, extraM2: 0 },
      energia: { unidades: 2, extraM2: 0 },
      climatizacao: { unidades: 2, extraM2: 0 },
      auxiliares: { unidades: 2, extraM2: 0 },
      storage: { unidades: 0, extraM2: 3 },
      circulacao: { unidades: 0, extraM2: 3.7 },
    },
  },
};

/** Defaults da planilha "Density spec facility v5 m2.xlsx" (4 salas × 8 pods × 10 gabinetes). */
export const INSTALACAO_DEFAULT: InstalacaoInput = {
  gabinete: {
    potenciaMediaKw: 5,
    potenciaPicoKw: 8,
    incerteza: 0.15,
    relacaoGerenciada: 0.75,
    areaM2: 1.2,
  },
  pod: {
    numUnidades: 10,
    potenciaPicoUnidadeKw: 8,
    espacos: {
      unidades: { unidades: 10, extraM2: 0 },
      staging: { unidades: 1, extraM2: 0 },
      incerteza: { unidades: 1, extraM2: 0 },
      energia: { unidades: 2, extraM2: 0 },
      climatizacao: { unidades: 2, extraM2: 0 },
      auxiliares: { unidades: 0, extraM2: 0 },
      storage: { unidades: 0, extraM2: 0 },
      circulacao: { unidades: 0, extraM2: 5.20257 },
    },
  },
  sala: {
    numUnidades: 8,
    potenciaPicoUnidadeKw: 50,
    espacos: {
      unidades: { unidades: 9, extraM2: 0 },
      staging: { unidades: 0, extraM2: 0 },
      incerteza: { unidades: 0, extraM2: 0 },
      energia: { unidades: 0, extraM2: 10 },
      climatizacao: { unidades: 0, extraM2: 10 },
      auxiliares: { unidades: 0, extraM2: 10 },
      storage: { unidades: 0, extraM2: 10 },
      circulacao: { unidades: 0, extraM2: 65 },
    },
  },
  instalacao: {
    numUnidades: 4,
    potenciaPicoUnidadeKw: 500,
    espacos: {
      unidades: { unidades: 4, extraM2: 0 },
      staging: { unidades: 0, extraM2: 46.4515 },
      incerteza: { unidades: 0, extraM2: 0 },
      energia: { unidades: 0, extraM2: 185.8061 },
      climatizacao: { unidades: 0, extraM2: 185.8061 },
      auxiliares: { unidades: 0, extraM2: 37.1612 },
      storage: { unidades: 0, extraM2: 46.4515 },
      circulacao: { unidades: 0, extraM2: 185.8061 },
    },
  },
};
