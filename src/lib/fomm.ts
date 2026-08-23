/**
 * Engine do Pré-Diagnóstico de Maturidade Operacional (FOMM) — funções puras.
 *
 * Base conceitual: Schneider Electric White Paper #197, "Facility Operations
 * Maturity Model for Data Centers" (Schafer & Donovan, Rev 1) — 7 disciplinas,
 * 26 elementos, escala de maturidade 1–5 (Initial/ad hoc → Optimized), herdada
 * do maturity model do IT Governance Institute (CMM).
 *
 * IMPORTANTE (fidelidade à fonte): o WP #197 NÃO define fórmula de índice único
 * nem pesos entre disciplinas. Este pré-diagnóstico entrega um PERFIL por
 * disciplina; o "nível geral indicativo" é convenção desta ferramenta (média
 * simples), declarada como tal na UI. Não emite certificação nem substitui a
 * avaliação formal por terceiro independente que o próprio paper recomenda.
 *
 * Pesquisa e decisões: docs/research/2026-08-22-best-of-breed/grok-fomm-fontes.md.
 */

// ---------------------------------------------------------------------------
// Tipos e taxonomia
// ---------------------------------------------------------------------------

export const DISCIPLINAS = [
  'ehs',
  'emergencia',
  'manutencao',
  'site',
  'operacoes',
  'mudancas',
  'qualidade',
] as const;

export type DisciplinaId = (typeof DISCIPLINAS)[number];

export type NivelMaturidade = 1 | 2 | 3 | 4 | 5;

export interface PerguntaFomm {
  id: string;
  disciplina: DisciplinaId;
}

/**
 * As 18 perguntas do pré-diagnóstico (2–3 por disciplina), derivadas dos
 * elementos publicados do WP #197 (Figura 2) e do WP #196 (elementos
 * essenciais). Os textos vivem no dicionário i18n (pt.fomm.q[id]).
 */
export const PERGUNTAS: readonly PerguntaFomm[] = [
  { id: 'ehs1', disciplina: 'ehs' },
  { id: 'ehs2', disciplina: 'ehs' },
  { id: 'eme1', disciplina: 'emergencia' },
  { id: 'eme2', disciplina: 'emergencia' },
  { id: 'eme3', disciplina: 'emergencia' },
  { id: 'man1', disciplina: 'manutencao' },
  { id: 'man2', disciplina: 'manutencao' },
  { id: 'man3', disciplina: 'manutencao' },
  { id: 'sit1', disciplina: 'site' },
  { id: 'sit2', disciplina: 'site' },
  { id: 'ope1', disciplina: 'operacoes' },
  { id: 'ope2', disciplina: 'operacoes' },
  { id: 'ope3', disciplina: 'operacoes' },
  { id: 'mud1', disciplina: 'mudancas' },
  { id: 'mud2', disciplina: 'mudancas' },
  { id: 'qua1', disciplina: 'qualidade' },
  { id: 'qua2', disciplina: 'qualidade' },
  { id: 'qua3', disciplina: 'qualidade' },
];

export type RespostasFomm = Partial<Record<string, NivelMaturidade>>;

export interface DisciplinaResult {
  id: DisciplinaId;
  /** Média das respostas da disciplina (1–5). */
  score: number;
  /** Nível dominante (score arredondado para o inteiro mais próximo). */
  nivel: NivelMaturidade;
  respondidas: number;
  total: number;
}

export interface FommResult {
  porDisciplina: DisciplinaResult[];
  /** Média simples das disciplinas — convenção desta ferramenta, não do WP #197. */
  scoreGeral: number;
  nivelGeral: NivelMaturidade;
  /** Disciplinas ordenadas da menor para a maior maturidade (gaps primeiro). */
  gaps: DisciplinaResult[];
  /** Disciplina mais madura. */
  maisForte: DisciplinaResult;
  respondidas: number;
  total: number;
  completo: boolean;
}

// ---------------------------------------------------------------------------
// Cálculo
// ---------------------------------------------------------------------------

function nivelDe(score: number): NivelMaturidade {
  return Math.min(5, Math.max(1, Math.round(score))) as NivelMaturidade;
}

export function calcularFomm(respostas: RespostasFomm): FommResult | null {
  for (const [id, v] of Object.entries(respostas)) {
    if (v === undefined) continue;
    if (!PERGUNTAS.some((p) => p.id === id)) {
      throw new RangeError(`Pergunta desconhecida: ${id}`);
    }
    if (!Number.isInteger(v) || v < 1 || v > 5) {
      throw new RangeError(`Resposta fora da escala 1–5 em ${id}`);
    }
  }

  const porDisciplina: DisciplinaResult[] = DISCIPLINAS.map((d) => {
    const qs = PERGUNTAS.filter((p) => p.disciplina === d);
    const valores = qs
      .map((q) => respostas[q.id])
      .filter((v): v is NivelMaturidade => v !== undefined);
    const score = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
    return {
      id: d,
      score,
      nivel: valores.length > 0 ? nivelDe(score) : 1,
      respondidas: valores.length,
      total: qs.length,
    };
  });

  const respondidas = porDisciplina.reduce((a, d) => a + d.respondidas, 0);
  const completo = respondidas === PERGUNTAS.length;
  if (respondidas === 0) return null;

  const avaliadas = porDisciplina.filter((d) => d.respondidas > 0);
  const scoreGeral = avaliadas.reduce((a, d) => a + d.score, 0) / avaliadas.length;
  const ordenadas = [...avaliadas].sort((a, b) => a.score - b.score);

  return {
    porDisciplina,
    scoreGeral,
    nivelGeral: nivelDe(scoreGeral),
    gaps: ordenadas.slice(0, 3),
    maisForte: ordenadas[ordenadas.length - 1]!,
    respondidas,
    total: PERGUNTAS.length,
    completo,
  };
}

/** Serializa o perfil para anexar ao lead (atribuição comercial). */
export function fommParaLead(r: FommResult): Record<string, string> {
  const out: Record<string, string> = {
    fomm_nivel_geral: `${r.nivelGeral} (${r.scoreGeral.toFixed(1)})`,
  };
  for (const d of r.porDisciplina) {
    out[`fomm_${d.id}`] = d.respondidas > 0 ? d.score.toFixed(1) : 'n/r';
  }
  out.fomm_gaps = r.gaps.map((g) => g.id).join(',');
  return out;
}
