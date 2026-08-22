import { useMemo, useState } from 'react';
import { fmtNumber } from '@/lib/calc';
import {
  INSTALACAO_DEFAULT,
  LINHAS_ESPACO,
  SALA_DEFAULT,
  calcularInstalacao,
  calcularSala,
  type EspacosSistema,
  type LinhaEspacoKey,
  type ParametrosGabinete,
  type SistemaResult,
} from '@/lib/density';
import { t, type Dict, type Locale } from '@/i18n';
import { NumberField } from './fields';

type Modo = 'sala' | 'instalacao';

// ---------------------------------------------------------------------------
// Estado em string (inputs livres) ⇄ tipos do engine
// ---------------------------------------------------------------------------

interface GabineteState {
  media: string;
  pico: string;
  incertezaPct: string;
  gerenciadaPct: string;
  area: string;
}

type EspacosState = Record<LinhaEspacoKey, { unidades: string; extra: string }>;

function gabineteToState(g: ParametrosGabinete): GabineteState {
  return {
    media: String(g.potenciaMediaKw),
    pico: String(g.potenciaPicoKw),
    incertezaPct: String(g.incerteza * 100),
    gerenciadaPct: String(g.relacaoGerenciada * 100),
    area: String(g.areaM2),
  };
}

function parseGabinete(s: GabineteState): ParametrosGabinete | null {
  const g: ParametrosGabinete = {
    potenciaMediaKw: Number.parseFloat(s.media),
    potenciaPicoKw: Number.parseFloat(s.pico),
    incerteza: Number.parseFloat(s.incertezaPct) / 100,
    relacaoGerenciada: Number.parseFloat(s.gerenciadaPct) / 100,
    areaM2: Number.parseFloat(s.area),
  };
  return Object.values(g).every((v) => Number.isFinite(v)) ? g : null;
}

function espacosToState(e: EspacosSistema): EspacosState {
  const out = {} as EspacosState;
  for (const k of LINHAS_ESPACO) {
    out[k] = { unidades: String(e[k].unidades), extra: String(e[k].extraM2) };
  }
  return out;
}

function parseEspacos(s: EspacosState): EspacosSistema | null {
  const out = {} as EspacosSistema;
  for (const k of LINHAS_ESPACO) {
    const unidades = Number.parseFloat(s[k].unidades);
    const extraM2 = Number.parseFloat(s[k].extra);
    if (!Number.isFinite(unidades) || !Number.isFinite(extraM2)) return null;
    out[k] = { unidades, extraM2 };
  }
  return out;
}

const fmtM2 = (v: number) => `${fmtNumber(v, 1)} m²`;
const fmtKw = (v: number) => `${fmtNumber(v, 1)} kW`;
const fmtPct = (v: number) => `${fmtNumber(v * 100, 1)}%`;

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------

function CabinetFields({
  d,
  idp,
  state,
  onChange,
}: {
  d: Dict['density'];
  idp: string;
  state: GabineteState;
  onChange: (s: GabineteState) => void;
}) {
  const set = (k: keyof GabineteState) => (v: string) => onChange({ ...state, [k]: v });
  return (
    <fieldset>
      <legend>{d.cabinetLegend}</legend>
      <div className="grid-2">
        <NumberField id={`${idp}-avg`} label={d.avgLabel} value={state.media} onChange={set('media')} help={d.avgHelp} step={0.5} />
        <NumberField id={`${idp}-peak`} label={d.peakLabel} value={state.pico} onChange={set('pico')} help={d.peakHelp} step={0.5} />
        <NumberField id={`${idp}-unc`} label={d.uncertaintyLabel} value={state.incertezaPct} onChange={set('incertezaPct')} help={d.uncertaintyHelp} step={5} />
        <NumberField id={`${idp}-man`} label={d.managedLabel} value={state.gerenciadaPct} onChange={set('gerenciadaPct')} help={d.managedHelp} step={5} />
        <NumberField id={`${idp}-area`} label={d.areaCabLabel} value={state.area} onChange={set('area')} help={d.areaCabHelp} step={0.1} />
      </div>
    </fieldset>
  );
}

function EspacoTable({
  d,
  idp,
  areaPorUnidade,
  state,
  onChange,
  sugestaoM2,
}: {
  d: Dict['density'];
  idp: string;
  areaPorUnidade: number | null;
  state: EspacosState;
  onChange: (s: EspacosState) => void;
  sugestaoM2: number | null;
}) {
  const labels: Record<LinhaEspacoKey, string> = {
    unidades: d.rowUnidades,
    staging: d.rowStaging,
    incerteza: d.rowIncerteza,
    energia: d.rowEnergia,
    climatizacao: d.rowClimatizacao,
    auxiliares: d.rowAuxiliares,
    storage: d.rowStorage,
    circulacao: d.rowCirculacao,
  };
  const set = (k: LinhaEspacoKey, campo: 'unidades' | 'extra') => (v: string) =>
    onChange({ ...state, [k]: { ...state[k], [campo]: v } });
  const cellInput = (k: LinhaEspacoKey, campo: 'unidades' | 'extra', step: number) => (
    <input
      id={`${idp}-${k}-${campo}`}
      type="number"
      inputMode="decimal"
      min={0}
      step={step}
      value={state[k][campo]}
      onChange={(e) => set(k, campo)(e.target.value)}
      aria-label={`${labels[k]} — ${campo === 'unidades' ? d.colUnits : d.colExtra}`}
      style={{ width: '5.5rem' }}
    />
  );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{d.colReserva}</th>
            <th>{d.colUnits}</th>
            <th>{d.colExtra}</th>
            <th>{d.colSubtotal}</th>
          </tr>
        </thead>
        <tbody>
          {LINHAS_ESPACO.map((k) => {
            const unidades = Number.parseFloat(state[k].unidades);
            const extra = Number.parseFloat(state[k].extra);
            const subtotal =
              areaPorUnidade != null && Number.isFinite(unidades) && Number.isFinite(extra)
                ? unidades * areaPorUnidade + extra
                : null;
            return (
              <tr key={k}>
                <td>{labels[k]}</td>
                <td>{cellInput(k, 'unidades', 1)}</td>
                <td>{cellInput(k, 'extra', 0.5)}</td>
                <td>{subtotal != null ? fmtNumber(subtotal, 1) : '—'}</td>
              </tr>
            );
          })}
          {sugestaoM2 != null ? (
            <tr>
              <td colSpan={3} style={{ color: 'var(--tt-gray-700)', fontStyle: 'italic' }}>
                {d.sugestaoLabel}
              </td>
              <td style={{ fontStyle: 'italic', color: 'var(--tt-teal-600)', fontWeight: 600 }}>
                {fmtNumber(sugestaoM2, 1)}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <p className="help">{d.sugestaoNote}</p>
    </div>
  );
}

function AreaBreakdown({ d, r }: { d: Dict['density']; r: SistemaResult }) {
  const labels: Record<LinhaEspacoKey, string> = {
    unidades: d.rowUnidades,
    staging: d.rowStaging,
    incerteza: d.rowIncerteza,
    energia: d.rowEnergia,
    climatizacao: d.rowClimatizacao,
    auxiliares: d.rowAuxiliares,
    storage: d.rowStorage,
    circulacao: d.rowCirculacao,
  };
  const max = Math.max(...LINHAS_ESPACO.map((k) => r.areas[k]), 1e-9);
  return (
    <div>
      {LINHAS_ESPACO.filter((k) => r.areas[k] > 0).map((k) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', flex: '0 0 min(14rem, 100%)', color: 'var(--tt-gray-700)' }}>
            {labels[k]}
          </span>
          <div
            style={{
              width: `${Math.max(1, (r.areas[k] / max) * 100)}%`,
              maxWidth: 'calc(100% - 8rem)',
              height: '14px',
              borderRadius: '3px',
              background: k === 'unidades' ? 'var(--tt-navy-500)' : 'var(--tt-teal-600)',
            }}
          />
          <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            {fmtM2(r.areas[k])} ({fmtNumber((r.areas[k] / r.areaTotalM2) * 100, 0)}%)
          </span>
        </div>
      ))}
    </div>
  );
}

interface LinhaResumo {
  id: string;
  k: string;
  fmt: (r: SistemaResult) => string;
}

function linhasResumo(d: Dict['density']): LinhaResumo[] {
  return [
    { id: 'potNominal', k: d.rowPotNominal, fmt: (r) => fmtKw(r.potenciaNominalKw) },
    { id: 'cabsEsperados', k: d.rowCabsEsperados, fmt: (r) => fmtNumber(r.gabinetesEsperados, 0) },
    { id: 'cabsMax', k: d.rowCabsMax, fmt: (r) => fmtNumber(r.gabinetesMax, 0) },
    { id: 'potOperacional', k: d.rowPotOperacional, fmt: (r) => fmtKw(r.potenciaOperacionalKw) },
    { id: 'potPico', k: d.rowPotPico, fmt: (r) => fmtKw(r.potenciaPicoUnidadeKw) },
    { id: 'potMediaUnidade', k: d.rowPotMediaUnidade, fmt: (r) => fmtKw(r.potenciaMediaUnidadeKw) },
    { id: 'potMediaEsperada', k: d.rowPotMediaEsperada, fmt: (r) => fmtKw(r.potenciaMediaEsperadaUnidadeKw) },
    { id: 'areaTotal', k: d.rowAreaTotal, fmt: (r) => fmtM2(r.areaTotalM2) },
    { id: 'unused', k: d.rowUnused, fmt: (r) => fmtPct(r.espacoNaoUtilizado) },
    { id: 'densidade', k: d.rowDensidade, fmt: (r) => `${fmtNumber(r.densidadeWm2, 0)} W/m²` },
  ];
}

function ResultadoStats({ d, r }: { d: Dict['density']; r: SistemaResult }) {
  return (
    <div className="stat-grid">
      <div className="stat highlight">
        <div className="label">{d.statDensidade}</div>
        <div className="value">{fmtNumber(r.densidadeWm2, 0)} W/m²</div>
        <div className="note">{fmtNumber(r.densidadeWm2 / 1000, 2)} kW/m²</div>
      </div>
      <div className="stat">
        <div className="label">{d.statArea}</div>
        <div className="value">{fmtM2(r.areaTotalM2)}</div>
      </div>
      <div className="stat">
        <div className="label">{d.statPotencia}</div>
        <div className="value">{fmtKw(r.potenciaNominalKw)}</div>
      </div>
      <div className="stat">
        <div className="label">{d.statGabinetes}</div>
        <div className="value">
          {fmtNumber(r.gabinetesEsperados, 0)} / {fmtNumber(r.gabinetesMax, 0)}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modo Sala
// ---------------------------------------------------------------------------

function SalaPlanner({ d, dict }: { d: Dict['density']; dict: Dict }) {
  const [gab, setGab] = useState(() => gabineteToState(SALA_DEFAULT.gabinete));
  const [num, setNum] = useState(String(SALA_DEFAULT.sala.numUnidades));
  const [espacos, setEspacos] = useState(() => espacosToState(SALA_DEFAULT.sala.espacos));

  const result = useMemo(() => {
    const gabinete = parseGabinete(gab);
    const e = parseEspacos(espacos);
    const numUnidades = Number.parseFloat(num);
    if (!gabinete || !e || !Number.isFinite(numUnidades)) return null;
    try {
      return calcularSala({
        gabinete,
        sala: { numUnidades, potenciaPicoUnidadeKw: gabinete.potenciaPicoKw, espacos: e },
      });
    } catch {
      return null;
    }
  }, [gab, num, espacos]);

  const areaPorUnidade = Number.parseFloat(gab.area);
  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <CabinetFields d={d} idp="dp-s" state={gab} onChange={setGab} />
        <fieldset>
          <legend>{d.salaLegend}</legend>
          <div className="grid-2">
            <NumberField id="dp-s-num" label={d.unitsCabsInRoom} value={num} onChange={setNum} min={1} step={1} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--tt-gray-700)', marginBottom: '0.4rem' }}>
            {d.spaceTableTitle}
          </p>
          <EspacoTable
            d={d}
            idp="dp-s"
            areaPorUnidade={Number.isFinite(areaPorUnidade) ? areaPorUnidade : null}
            state={espacos}
            onChange={setEspacos}
            sugestaoM2={result ? result.sugestaoIncertezaM2 : null}
          />
        </fieldset>
      </form>

      {result ? (
        <section className="results" aria-live="polite">
          <ResultadoStats d={d} r={result} />
          <h3>{d.resultsTitle}</h3>
          <div className="table-wrap">
            <table>
              <tbody>
                {linhasResumo(d).map((l) => (
                  <tr key={l.id}>
                    <th scope="row" style={{ fontWeight: 400 }}>
                      {l.k}
                    </th>
                    <td>
                      <strong>{l.fmt(result)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>{d.breakdownTitle}</h3>
          <AreaBreakdown d={d} r={result} />
          <RodapeFerramenta d={d} dict={dict} />
        </section>
      ) : (
        <p className="help" role="status">
          {d.invalidNote}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modo Instalação
// ---------------------------------------------------------------------------

function InstalacaoPlanner({ d, dict }: { d: Dict['density']; dict: Dict }) {
  const [gab, setGab] = useState(() => gabineteToState(INSTALACAO_DEFAULT.gabinete));
  const [numPod, setNumPod] = useState(String(INSTALACAO_DEFAULT.pod.numUnidades));
  const [numSala, setNumSala] = useState(String(INSTALACAO_DEFAULT.sala.numUnidades));
  const [numInst, setNumInst] = useState(String(INSTALACAO_DEFAULT.instalacao.numUnidades));
  const [picoSala, setPicoSala] = useState(String(INSTALACAO_DEFAULT.sala.potenciaPicoUnidadeKw));
  const [picoInst, setPicoInst] = useState(
    String(INSTALACAO_DEFAULT.instalacao.potenciaPicoUnidadeKw),
  );
  const [espPod, setEspPod] = useState(() => espacosToState(INSTALACAO_DEFAULT.pod.espacos));
  const [espSala, setEspSala] = useState(() => espacosToState(INSTALACAO_DEFAULT.sala.espacos));
  const [espInst, setEspInst] = useState(() =>
    espacosToState(INSTALACAO_DEFAULT.instalacao.espacos),
  );

  const result = useMemo(() => {
    const gabinete = parseGabinete(gab);
    const ePod = parseEspacos(espPod);
    const eSala = parseEspacos(espSala);
    const eInst = parseEspacos(espInst);
    const nums = [numPod, numSala, numInst, picoSala, picoInst].map((v) => Number.parseFloat(v));
    if (!gabinete || !ePod || !eSala || !eInst || nums.some((v) => !Number.isFinite(v))) {
      return null;
    }
    try {
      return calcularInstalacao({
        gabinete,
        pod: { numUnidades: nums[0]!, potenciaPicoUnidadeKw: gabinete.potenciaPicoKw, espacos: ePod },
        sala: { numUnidades: nums[1]!, potenciaPicoUnidadeKw: nums[3]!, espacos: eSala },
        instalacao: { numUnidades: nums[2]!, potenciaPicoUnidadeKw: nums[4]!, espacos: eInst },
      });
    } catch {
      return null;
    }
  }, [gab, numPod, numSala, numInst, picoSala, picoInst, espPod, espSala, espInst]);

  const areaGab = Number.parseFloat(gab.area);
  const niveis = result
    ? [
        { id: 'pod', col: d.colPod, r: result.pod },
        { id: 'sala', col: d.colSala, r: result.sala },
        { id: 'instalacao', col: d.colInstalacao, r: result.instalacao },
      ]
    : [];

  const nivelFieldset = (
    legend: string,
    idp: string,
    numLabel: string,
    num: string,
    setNumFn: (v: string) => void,
    pico: [string, (v: string) => void] | null,
    areaPorUnidade: number | null,
    esp: EspacosState,
    setEsp: (s: EspacosState) => void,
    sugestao: number | null,
  ) => (
    <fieldset>
      <legend>{legend}</legend>
      <div className="grid-2">
        <NumberField id={`${idp}-num`} label={numLabel} value={num} onChange={setNumFn} min={1} step={1} />
        {pico ? (
          <NumberField id={`${idp}-pico`} label={d.levelPeakLabel} value={pico[0]} onChange={pico[1]} step={10} />
        ) : null}
      </div>
      {areaPorUnidade != null ? (
        <p className="help">
          {d.areaPorUnidadeInfo}: <strong>{fmtM2(areaPorUnidade)}</strong>
        </p>
      ) : null}
      <p style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--tt-gray-700)', marginBottom: '0.4rem' }}>
        {d.spaceTableTitle}
      </p>
      <EspacoTable d={d} idp={idp} areaPorUnidade={areaPorUnidade} state={esp} onChange={setEsp} sugestaoM2={sugestao} />
    </fieldset>
  );

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <CabinetFields d={d} idp="dp-f" state={gab} onChange={setGab} />
        {nivelFieldset(
          d.podLegend,
          'dp-f-pod',
          d.unitsCabsInPod,
          numPod,
          setNumPod,
          null,
          Number.isFinite(areaGab) ? areaGab : null,
          espPod,
          setEspPod,
          result ? result.pod.sugestaoIncertezaM2 : null,
        )}
        {nivelFieldset(
          d.salaLegend,
          'dp-f-sala',
          d.unitsPodsInRoom,
          numSala,
          setNumSala,
          [picoSala, setPicoSala],
          result ? result.pod.areaTotalM2 : null,
          espSala,
          setEspSala,
          result ? result.sala.sugestaoIncertezaM2 : null,
        )}
        {nivelFieldset(
          d.instalacaoLegend,
          'dp-f-inst',
          d.unitsRoomsInFacility,
          numInst,
          setNumInst,
          [picoInst, setPicoInst],
          result ? result.sala.areaTotalM2 : null,
          espInst,
          setEspInst,
          result ? result.instalacao.sugestaoIncertezaM2 : null,
        )}
      </form>

      {result ? (
        <section className="results" aria-live="polite">
          <ResultadoStats d={d} r={result.instalacao} />
          <h3>{d.resultsTitle}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <td></td>
                  {niveis.map((n) => (
                    <th key={n.id} scope="col">
                      {n.col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhasResumo(d).map((l) => (
                  <tr key={l.id}>
                    <th scope="row" style={{ fontWeight: 400 }}>
                      {l.k}
                    </th>
                    {niveis.map((n) => (
                      <td key={n.id}>{l.fmt(n.r)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>
            {d.breakdownTitle} — {d.colInstalacao}
          </h3>
          <AreaBreakdown d={d} r={result.instalacao} />
          <RodapeFerramenta d={d} dict={dict} />
        </section>
      ) : (
        <p className="help" role="status">
          {d.invalidNote}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rodapé comum (imprimir, proveniência, disclaimer)
// ---------------------------------------------------------------------------

function RodapeFerramenta({ d, dict }: { d: Dict['density']; dict: Dict }) {
  return (
    <>
      <div className="no-print" style={{ marginTop: '1.5rem' }}>
        <button type="button" onClick={() => window.print()}>
          {dict.common.print}
        </button>
      </div>
      <div className="print-only">
        <h2>{d.reportTitle}</h2>
        <p>{d.reportBy} — www.toptier.net.br</p>
      </div>
      <details className="method">
        <summary>{dict.common.formulasTitle}</summary>
        <ul>
          <li>
            <code>área da linha = unidades × área por unidade + extra (m²)</code> — cada reserva de
            espaço é expressa em unidades do nível inferior.
          </li>
          <li>
            <code>potência nominal = nº de unidades × potência média por unidade</code>;{' '}
            <code>potência operacional = nominal × relação gerenciada</code>.
          </li>
          <li>
            <code>densidade (W/m²) = 1000 × potência nominal ÷ área total</code> — a densidade é uma{' '}
            <strong>saída</strong> do método, nunca uma entrada.
          </li>
          <li>
            <code>sugestão de incerteza = nominal × (área/unid ÷ potência média) × u ÷ (1 − u)</code>{' '}
            — espaço para absorver o desvio de densidade com ~80% de confiança; nos níveis
            superiores, propaga a sugestão não coberta do nível inferior.
          </li>
        </ul>
        <p>{d.provenance}</p>
      </details>
      <p className="disclaimer">{dict.common.disclaimer}</p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function DensityPlanner({ locale = 'pt-br' }: { locale?: Locale }) {
  const dict = t(locale);
  const d = dict.density;
  const [modo, setModo] = useState<Modo>('sala');

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        <button type="button" className={modo === 'sala' ? undefined : 'secondary'} aria-pressed={modo === 'sala'} onClick={() => setModo('sala')}>
          {d.modeSala}
        </button>
        <button type="button" className={modo === 'instalacao' ? undefined : 'secondary'} aria-pressed={modo === 'instalacao'} onClick={() => setModo('instalacao')}>
          {d.modeInstalacao}
        </button>
      </div>
      <p className="help">{modo === 'sala' ? d.modeSalaNote : d.modeInstalacaoNote}</p>
      <div style={{ display: modo === 'sala' ? 'block' : 'none' }}>
        <SalaPlanner d={d} dict={dict} />
      </div>
      <div style={{ display: modo === 'instalacao' ? 'block' : 'none' }}>
        <InstalacaoPlanner d={d} dict={dict} />
      </div>
    </div>
  );
}
