import { describe, expect, it } from 'vitest';
import {
  INSTALACAO_DEFAULT,
  SALA_DEFAULT,
  calcularInstalacao,
  calcularSala,
  type SalaInput,
} from './density';

/**
 * Valores-alvo copiados literalmente do dump célula a célula das planilhas
 * originais (docs/research/2026-08-22-densidade/fontes/xlsx-*.md).
 * toBeCloseTo com 9+ dígitos: o engine é uma transpilação, não uma aproximação.
 */
describe('calcularSala — planilha "Density spec room pt v5 m2" (cenário default)', () => {
  const r = calcularSala(SALA_DEFAULT);

  it('reproduz as áreas por linha (G13..G21)', () => {
    expect(r.areas.unidades).toBeCloseTo(18, 9); // G13
    expect(r.areas.staging).toBeCloseTo(3, 9); // G14
    expect(r.areas.incerteza).toBeCloseTo(3, 9); // G16
    expect(r.areas.energia).toBeCloseTo(3, 9); // G17
    expect(r.areas.climatizacao).toBeCloseTo(3, 9); // G18
    expect(r.areas.auxiliares).toBeCloseTo(3, 9); // G19
    expect(r.areas.storage).toBeCloseTo(3, 9); // G20
    expect(r.areas.circulacao).toBeCloseTo(3.7, 9); // G21
  });

  it('reproduz o tamanho da sala (G22 = 39.7 m²)', () => {
    expect(r.areaTotalM2).toBeCloseTo(39.700000000000003, 9);
  });

  it('reproduz a sugestão de espaço para incerteza (G15 = 4.5 m²)', () => {
    // =E24*E11/E6*(E8/(1-E8)) = 48*1.5/4*(0.2/0.8)
    expect(r.sugestaoIncertezaM2).toBeCloseTo(4.5, 9);
  });

  it('reproduz o resumo de desempenho (E24..E31)', () => {
    expect(r.potenciaNominalKw).toBeCloseTo(48, 9); // E24
    expect(r.potenciaOperacionalKw).toBeCloseTo(33.599999999999994, 9); // E25
    expect(r.potenciaPicoUnidadeKw).toBe(8); // E26
    expect(r.potenciaMediaUnidadeKw).toBeCloseTo(4, 9); // E27
    expect(r.potenciaMediaEsperadaUnidadeKw).toBeCloseTo(2.8, 9); // E28
    expect(r.espacoNaoUtilizado).toBeCloseTo(0.15113350125944583, 12); // E30
    expect(r.densidadeWm2).toBeCloseTo(1209.0680100755667, 9); // E31
  });
});

describe('calcularInstalacao — planilha "Density spec facility v5 m2" (cenário default)', () => {
  const { pod, sala, instalacao } = calcularInstalacao(INSTALACAO_DEFAULT);

  it('reproduz o pod (colunas L/N)', () => {
    expect(pod.areas.unidades).toBeCloseTo(12, 9); // N15
    expect(pod.areaTotalM2).toBeCloseTo(24.402569999999997, 9); // N24
    expect(pod.sugestaoIncertezaM2).toBeCloseTo(2.1176470588235294, 12); // N17
    expect(pod.potenciaNominalKw).toBeCloseTo(50, 9); // L26
    expect(pod.potenciaOperacionalKw).toBeCloseTo(37.5, 9); // L29
    expect(pod.potenciaMediaEsperadaUnidadeKw).toBeCloseTo(3.75, 9); // L32
    expect(pod.gabinetesEsperados).toBe(10); // L27
    expect(pod.gabinetesMax).toBe(12); // L28
    expect(pod.espacoNaoUtilizado).toBeCloseTo(0.0983502967105514, 12); // L34
    expect(pod.densidadeWm2).toBeCloseTo(2048.9645148031541, 9); // L35
  });

  it('reproduz a sala (colunas H/J)', () => {
    expect(sala.areaPorUnidadeM2).toBeCloseTo(24.402569999999997, 9); // H13
    expect(sala.areas.unidades).toBeCloseTo(219.62312999999997, 9); // J15
    expect(sala.areaTotalM2).toBeCloseTo(324.62312999999995, 9); // J24
    expect(sala.sugestaoIncertezaM2).toBeCloseTo(14.928631058823528, 9); // J17
    expect(sala.potenciaMediaUnidadeKw).toBeCloseTo(50, 9); // H8
    expect(sala.potenciaNominalKw).toBeCloseTo(400, 9); // H26
    expect(sala.potenciaOperacionalKw).toBeCloseTo(300, 9); // H29
    expect(sala.gabinetesEsperados).toBe(90); // H27
    expect(sala.gabinetesMax).toBe(108); // H28
    expect(sala.espacoNaoUtilizado).toBeCloseTo(0, 12); // H34
    expect(sala.densidadeWm2).toBeCloseTo(1232.198087671695, 9); // H35
  });

  it('reproduz a instalação (colunas D/F)', () => {
    expect(instalacao.areaPorUnidadeM2).toBeCloseTo(324.62312999999995, 9); // D13
    expect(instalacao.areas.unidades).toBeCloseTo(1298.4925199999998, 9); // F15
    expect(instalacao.areaTotalM2).toBeCloseTo(1985.9750199999996, 9); // F24
    expect(instalacao.sugestaoIncertezaM2).toBeCloseTo(88.263543843137256, 9); // F17
    expect(instalacao.potenciaMediaUnidadeKw).toBeCloseTo(400, 9); // D8
    expect(instalacao.potenciaNominalKw).toBeCloseTo(1600, 9); // D26
    expect(instalacao.potenciaOperacionalKw).toBeCloseTo(1200, 9); // D29
    expect(instalacao.gabinetesEsperados).toBe(360); // D27
    expect(instalacao.gabinetesMax).toBe(432); // D28
    expect(instalacao.espacoNaoUtilizado).toBeCloseTo(0.023389770531957652, 12); // D34
    expect(instalacao.densidadeWm2).toBeCloseTo(805.64960983245419, 9); // D35
  });
});

describe('propriedades do modelo', () => {
  it('densidade nunca é input: dobrar a área por gabinete derruba o W/m²', () => {
    const denso = calcularSala(SALA_DEFAULT);
    const esparso = calcularSala({
      ...SALA_DEFAULT,
      gabinete: { ...SALA_DEFAULT.gabinete, areaM2: 3 },
    } satisfies SalaInput);
    expect(esparso.densidadeWm2).toBeLessThan(denso.densidadeWm2);
    expect(esparso.potenciaNominalKw).toBeCloseTo(denso.potenciaNominalKw, 9);
  });

  it('a sugestão de incerteza cresce com a incerteza e zera quando u = 0', () => {
    const semIncerteza = calcularSala({
      ...SALA_DEFAULT,
      gabinete: { ...SALA_DEFAULT.gabinete, incerteza: 0 },
    });
    expect(semIncerteza.sugestaoIncertezaM2).toBe(0);
    const maisIncerto = calcularSala({
      ...SALA_DEFAULT,
      gabinete: { ...SALA_DEFAULT.gabinete, incerteza: 0.4 },
    });
    expect(maisIncerto.sugestaoIncertezaM2).toBeGreaterThan(4.5);
  });

  it('valida entradas fora de faixa', () => {
    expect(() =>
      calcularSala({ ...SALA_DEFAULT, gabinete: { ...SALA_DEFAULT.gabinete, incerteza: 1 } }),
    ).toThrow(RangeError);
    expect(() =>
      calcularSala({
        ...SALA_DEFAULT,
        gabinete: { ...SALA_DEFAULT.gabinete, potenciaMediaKw: 0 },
      }),
    ).toThrow(RangeError);
    expect(() =>
      calcularSala({ ...SALA_DEFAULT, sala: { ...SALA_DEFAULT.sala, numUnidades: 0 } }),
    ).toThrow(RangeError);
  });

  it('rejeita NaN/Infinity, contagens fracionárias e sistema sem área de TI', () => {
    expect(() =>
      calcularSala({
        ...SALA_DEFAULT,
        gabinete: { ...SALA_DEFAULT.gabinete, potenciaMediaKw: Number.NaN },
      }),
    ).toThrow(RangeError);
    expect(() =>
      calcularSala({
        ...SALA_DEFAULT,
        gabinete: { ...SALA_DEFAULT.gabinete, areaM2: Number.POSITIVE_INFINITY },
      }),
    ).toThrow(RangeError);
    expect(() =>
      calcularSala({ ...SALA_DEFAULT, sala: { ...SALA_DEFAULT.sala, numUnidades: 12.5 } }),
    ).toThrow(RangeError);
    // Reserva zero em todas as linhas de TI ⇒ divisão por zero na planilha; aqui, erro explícito.
    expect(() =>
      calcularSala({
        ...SALA_DEFAULT,
        sala: {
          ...SALA_DEFAULT.sala,
          espacos: {
            ...SALA_DEFAULT.sala.espacos,
            unidades: { unidades: 0, extraM2: 0 },
          },
        },
      }),
    ).toThrow(RangeError);
  });
});
