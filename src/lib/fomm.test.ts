import { describe, expect, it } from 'vitest';
import {
  DISCIPLINAS,
  PERGUNTAS,
  calcularFomm,
  fommParaLead,
  type NivelMaturidade,
  type RespostasFomm,
} from './fomm';
import { pt } from '@/i18n/pt';
import { en } from '@/i18n/en';

function todas(valor: NivelMaturidade): RespostasFomm {
  return Object.fromEntries(PERGUNTAS.map((p) => [p.id, valor]));
}

describe('taxonomia', () => {
  it('tem 18 perguntas cobrindo as 7 disciplinas do WP #197, com 2–3 por disciplina', () => {
    expect(PERGUNTAS).toHaveLength(18);
    for (const d of DISCIPLINAS) {
      const n = PERGUNTAS.filter((p) => p.disciplina === d).length;
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(3);
    }
  });

  it('ids de pergunta são únicos', () => {
    expect(new Set(PERGUNTAS.map((p) => p.id)).size).toBe(PERGUNTAS.length);
  });

  it('cada pergunta e disciplina tem texto não-vazio em pt e en', () => {
    for (const dict of [pt, en]) {
      for (const p of PERGUNTAS) {
        const texto = dict.fomm.q[p.id as keyof typeof dict.fomm.q];
        expect(texto, `${p.id} ausente`).toBeTruthy();
        expect(texto.length).toBeGreaterThan(10);
      }
      for (const d of DISCIPLINAS) {
        expect(dict.fomm.disciplines[d].nome).toBeTruthy();
        expect(dict.fomm.gapAction[d]).toBeTruthy();
      }
    }
  });
});

describe('calcularFomm', () => {
  it('tudo em 5 ⇒ perfil otimizado completo', () => {
    const r = calcularFomm(todas(5))!;
    expect(r.completo).toBe(true);
    expect(r.scoreGeral).toBeCloseTo(5, 10);
    expect(r.nivelGeral).toBe(5);
    for (const d of r.porDisciplina) expect(d.nivel).toBe(5);
  });

  it('tudo em 1 ⇒ ad hoc', () => {
    const r = calcularFomm(todas(1))!;
    expect(r.nivelGeral).toBe(1);
    expect(r.maisForte.score).toBeCloseTo(1, 10);
  });

  it('gaps ordenam da menor para a maior maturidade', () => {
    const respostas = todas(4);
    respostas.eme1 = 1;
    respostas.eme2 = 1;
    respostas.eme3 = 1;
    respostas.qua1 = 2;
    respostas.qua2 = 2;
    respostas.qua3 = 2;
    const r = calcularFomm(respostas)!;
    expect(r.gaps[0]!.id).toBe('emergencia');
    expect(r.gaps[1]!.id).toBe('qualidade');
    expect(r.maisForte.score).toBeCloseTo(4, 10);
  });

  it('parcial: calcula com o que há e marca incompleto', () => {
    const r = calcularFomm({ ehs1: 3, ehs2: 5 })!;
    expect(r.completo).toBe(false);
    expect(r.respondidas).toBe(2);
    const ehs = r.porDisciplina.find((d) => d.id === 'ehs')!;
    expect(ehs.score).toBeCloseTo(4, 10);
    // disciplinas sem resposta não entram na média geral
    expect(r.scoreGeral).toBeCloseTo(4, 10);
  });

  it('vazio retorna null; valores inválidos lançam RangeError', () => {
    expect(calcularFomm({})).toBeNull();
    expect(() => calcularFomm({ ehs1: 0 as never })).toThrow(RangeError);
    expect(() => calcularFomm({ ehs1: 6 as never })).toThrow(RangeError);
    expect(() => calcularFomm({ inexistente: 3 })).toThrow(RangeError);
  });

  it('arredondamento do nível: 3.5 → 4 (meio ponto sobe)', () => {
    const respostas = todas(3);
    respostas.ehs1 = 3;
    respostas.ehs2 = 4; // ehs = 3.5
    const r = calcularFomm(respostas)!;
    expect(r.porDisciplina.find((d) => d.id === 'ehs')!.nivel).toBe(4);
  });

  it('média por disciplina reflete respostas mistas', () => {
    const respostas = todas(3);
    respostas.man1 = 1;
    respostas.man2 = 3;
    respostas.man3 = 5;
    const r = calcularFomm(respostas)!;
    const man = r.porDisciplina.find((d) => d.id === 'manutencao')!;
    expect(man.score).toBeCloseTo(3, 10);
  });
});

describe('fommParaLead', () => {
  it('serializa nível geral, disciplinas e gaps', () => {
    const r = calcularFomm(todas(3))!;
    const lead = fommParaLead(r);
    expect(lead.fomm_nivel_geral).toBe('3 (3.0)');
    expect(lead.fomm_ehs).toBe('3.0');
    expect(lead.fomm_gaps!.split(',')).toHaveLength(3);
  });
});
