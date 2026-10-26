import { useMemo, useState } from 'react';
import {
  DEFAULT_PUE_CLASS_ID,
  FEATURED_REGIONAL_ID,
  GLOBAL_SITE_ID,
  PUE_AVERAGE_TYPE_LABEL,
  PUE_BENCHMARK_UPDATE,
  PUE_CLASS_OPTIONS,
  PUE_REFERENCES,
  PUE_REFERENCES_DISCLAIMER,
  REGULATORY,
  getPueReference,
  type PueReference,
} from '@/data/benchmarks';
import { FATOR_SIN_DEFAULT } from '@/data/energia-br';
import {
  annualCost,
  annualEnergyKwh,
  classifyPue,
  comparePue,
  cueFromGrid,
  dcie,
  effectiveTariff,
  fmtCurrencyBRL,
  fmtEnergy,
  fmtNumber,
  pue,
  regulatoryRead,
  wue,
} from '@/lib/calc';
import { t, type Locale } from '@/i18n';
import { track, trackOnce } from '@/lib/track';
import { NumberField, TariffFields, initialTariff, tariffFromState, type TariffState } from './fields';
import { PueGauge } from './PueGauge';
import { PueReferenceTable, formatRange } from './PueReferenceTable';
import { EfficiencyCta, ServiceCta } from './ServiceCta';

const MEASUREMENT_LEVELS = ['level1', 'level2', 'level3'] as const;

export default function PueCalculator({ locale = 'pt-br' }: { locale?: Locale }) {
  const dict = t(locale);
  const [itLoad, setItLoad] = useState('500');
  const [facilityLoad, setFacilityLoad] = useState('800');
  const [classId, setClassId] = useState(DEFAULT_PUE_CLASS_ID);
  const [level, setLevel] = useState<(typeof MEASUREMENT_LEVELS)[number]>('level1');
  const [tariffState, setTariffState] = useState<TariffState>(initialTariff);
  const [waterLiters, setWaterLiters] = useState('');
  const [emissionsTons, setEmissionsTons] = useState('');

  const result = useMemo(() => {
    const it = Number.parseFloat(itLoad);
    const facility = Number.parseFloat(facilityLoad);
    if (!Number.isFinite(it) || !Number.isFinite(facility) || it <= 0 || facility < it) {
      return null;
    }
    const pueValue = pue(facility, it);
    const tariff = tariffFromState(tariffState);
    const annualItKwh = annualEnergyKwh(it);
    const annualFacilityKwh = annualEnergyKwh(facility);
    const water = Number.parseFloat(waterLiters);
    const emissions = Number.parseFloat(emissionsTons);
    return {
      it,
      facility,
      pueValue,
      dcieValue: dcie(pueValue),
      band: classifyPue(pueValue),
      annualItKwh,
      annualFacilityKwh,
      overheadKwh: annualFacilityKwh - annualItKwh,
      cost: tariff ? annualCost(facility, tariff) : null,
      tariffRs: tariff ? effectiveTariff(tariff) : null,
      cueEstimated:
        FATOR_SIN_DEFAULT != null ? cueFromGrid(pueValue, FATOR_SIN_DEFAULT.tco2PorMwh) : null,
      cueMeasured:
        Number.isFinite(emissions) && emissions > 0 ? (emissions * 1000) / annualItKwh : null,
      wueValue: Number.isFinite(water) && water > 0 ? wue(water, annualItKwh) : null,
      regulatory: regulatoryRead(pueValue, it),
    };
  }, [itLoad, facilityLoad, tariffState, waterLiters, emissionsTons]);

  /*
   * Esta ferramenta passou a NASCER com um caso de referência válido, como o
   * Modelador e o Planejador já faziam: abrir vazia obrigava o visitante a
   * trabalhar antes de receber qualquer coisa, e ferramenta técnica boa mostra
   * um resultado de cara para você conferir contra o seu caso.
   *
   * Consequência no rastreio: "primeiro resultado" virou eco do pageview, então
   * o sinal de uso passou para o `onInput` do formulário — o visitante MEXER é
   * o que indica uso real. Mesmo padrão do Planejador de Densidade; `trackOnce`
   * garante 1 evento por visita, não 1 por tecla. [Onda 1 2026-08-25]
   */

  const d = dict.pueCalc;
  const en = locale === 'en';
  const classRef = getPueReference(classId) ?? PUE_CLASS_OPTIONS[0]!;
  const latamRef = getPueReference(FEATURED_REGIONAL_ID);
  const globalRef = getPueReference(GLOBAL_SITE_ID);

  const refName = (r: PueReference) => (en ? r.labelEn : r.labelPt);
  const typeName = (r: PueReference) => PUE_AVERAGE_TYPE_LABEL[r.averageType][en ? 'en' : 'pt'];
  const sourceLine = (r: PueReference) =>
    `${typeName(r)} · ${r.year}${r.sample != null ? ` · n=${r.sample}` : ''}`;
  const rangeText = (r: PueReference) => formatRange(r);
  /** Posição frente a uma faixa (classe) ou a um valor médio — texto, nunca só cor. */
  const positionText = (pueValue: number, r: PueReference, asAverage: boolean) => {
    const c = comparePue(pueValue, r);
    const delta = `${c.delta > 0 ? '+' : ''}${fmtNumber(c.delta)}`;
    if (asAverage) {
      const word = c.delta < 0 ? d.positionBelowAvg : c.delta > 0 ? d.positionAboveAvg : d.positionEqualAvg;
      return `${word} (${delta} ${d.positionVsTypical})`;
    }
    const word =
      c.position === 'below' ? d.positionBelow : c.position === 'above' ? d.positionAbove : d.positionWithin;
    return r.typical != null ? `${word} (${delta} ${d.positionVsTypical})` : word;
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()} onInput={() => trackOnce('pue_calculado')}>
        <fieldset>
          {/* O texto repetia o <h1> da página a poucos pixels de distância. A
              legend continua no DOM porque é ela que rotula o fieldset para
              leitor de tela — some só da tela, não da árvore de acessibilidade. */}
          <legend className="sr-only">{d.title}</legend>
          <div className="grid-2">
            <NumberField
              id="pue-it"
              label={d.itLoadLabel}
              value={itLoad}
              onChange={setItLoad}
              help={d.itLoadHelp}
              step={1}
              placeholder="500"
            />
            <NumberField
              id="pue-facility"
              label={d.facilityLabel}
              value={facilityLoad}
              onChange={setFacilityLoad}
              help={d.facilityHelp}
              step={1}
              placeholder="800"
            />
          </div>
          <div className="field">
            <label htmlFor="pue-class">{d.classLabel}</label>
            <select id="pue-class" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {PUE_CLASS_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {refName(c)} — {formatRange(c)}
                </option>
              ))}
            </select>
            <p className="help">{d.classHelp}</p>
          </div>
          <div className="field">
            <label htmlFor="pue-level">{d.levelLabel}</label>
            <select
              id="pue-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof level)}
            >
              {MEASUREMENT_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {d[l]}
                </option>
              ))}
            </select>
            <p className="help">{d.levelHelp}</p>
          </div>
        </fieldset>

        <TariffFields t={dict} state={tariffState} onChange={setTariffState} />

        <fieldset>
          <legend>
            WUE / CUE ({dict.common.optional})
          </legend>
          <div className="grid-2">
            <NumberField
              id="pue-water"
              label={d.wueLabel}
              value={waterLiters}
              onChange={setWaterLiters}
              help={d.wueHelp}
              step={1000}
            />
            <NumberField
              id="pue-emissions"
              label={d.cueOverrideLabel}
              value={emissionsTons}
              onChange={setEmissionsTons}
              help={d.cueOverrideHelp}
              step={1}
            />
          </div>
        </fieldset>
      </form>

      {result ? (
        <section className="results" aria-live="polite">
          <div className="stat-grid">
            <div className="stat highlight">
              <div className="label">{d.resultPue}</div>
              <div className="value">{fmtNumber(result.pueValue)}</div>
              <span className={`badge ${result.band.tone}`}>{en ? result.band.labelEn : result.band.labelPt}</span>
            </div>
            <div className="stat">
              <div className="label">{d.resultDcie}</div>
              <div className="value">{fmtNumber(result.dcieValue * 100, 1)}%</div>
              <div className="note">{d.resultDcieNote}</div>
            </div>
            <div className="stat">
              <div className="label">{d.resultAnnualEnergy}</div>
              <div className="value">{fmtEnergy(result.annualFacilityKwh)}</div>
              <div className="note">{fmtEnergy(result.overheadKwh)} de overhead não-TI</div>
            </div>
            {result.cost != null ? (
              <div className="stat">
                <div className="label">{d.resultAnnualCost}</div>
                <div className="value">{fmtCurrencyBRL(result.cost)}</div>
                <div className="note">tarifa efetiva R$ {fmtNumber(result.tariffRs!, 4)}/kWh</div>
              </div>
            ) : null}
            {result.wueValue != null ? (
              <div className="stat">
                <div className="label">{d.resultWue}</div>
                <div className="value">{fmtNumber(result.wueValue)} L/kWh</div>
                <div className="note">ISO/IEC 30134-9</div>
              </div>
            ) : null}
            {result.cueMeasured != null ? (
              <div className="stat">
                <div className="label">{d.resultCueMeasured}</div>
                <div className="value">{fmtNumber(result.cueMeasured, 3)} kgCO2e/kWh</div>
                <div className="note">ISO/IEC 30134-8</div>
              </div>
            ) : result.cueEstimated != null ? (
              <div className="stat">
                <div className="label">{d.resultCue}</div>
                <div className="value">{fmtNumber(result.cueEstimated, 3)} kgCO2e/kWh</div>
                <div className="note">CUE = fator do grid × PUE (método indireto)</div>
              </div>
            ) : null}
          </div>

          <h3>{d.benchmarksTitle}</h3>
          <PueGauge value={result.pueValue} classRef={classRef} en={en} />

          {latamRef ? (
            <div className="stat highlight" style={{ marginBottom: '1rem' }}>
              <div className="label">{refName(latamRef)}</div>
              <div className="value">{fmtNumber(latamRef.typical ?? latamRef.min)}</div>
              <div className="note">
                {sourceLine(latamRef)} — {latamRef.source}{' '}
                <a href={latamRef.url} target="_blank" rel="noopener noreferrer">
                  {en ? 'source' : 'fonte'}
                  <span className="sr-only"> — {refName(latamRef)} ({d.sourceLinkSuffix})</span>
                </a>
              </div>
              <div className="note">
                <strong>
                  {en ? 'You' : 'Você'}: {fmtNumber(result.pueValue)} —{' '}
                  {positionText(result.pueValue, latamRef, true)}
                </strong>
              </div>
            </div>
          ) : null}

          <h4>{d.positionTitle}</h4>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{d.positionColRef}</th>
                  <th>{d.positionColValue}</th>
                  <th>{d.positionColType}</th>
                  <th>{d.positionColYou}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{refName(classRef)}</strong>
                  </td>
                  <td>{rangeText(classRef)}</td>
                  <td>{sourceLine(classRef)}</td>
                  <td>{positionText(result.pueValue, classRef, false)}</td>
                </tr>
                {globalRef ? (
                  <tr>
                    <td>{refName(globalRef)}</td>
                    <td>{fmtNumber(globalRef.typical ?? globalRef.min)}</td>
                    <td>{sourceLine(globalRef)}</td>
                    <td>{positionText(result.pueValue, globalRef, true)}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <p className="help" role="note">
            {d.rulerNote} {en ? PUE_REFERENCES_DISCLAIMER.en : PUE_REFERENCES_DISCLAIMER.pt}
          </p>

          <details className="method">
            <summary>{d.classAllRefsTitle}</summary>
            <PueReferenceTable refs={PUE_REFERENCES} locale={locale} />
          </details>
          <p className="help" role="note">
            {en ? PUE_BENCHMARK_UPDATE.noteEn : PUE_BENCHMARK_UPDATE.notePt}
          </p>
          <EfficiencyCta locale={locale} />
          <ServiceCta locale={locale} />

          <h3>{d.regulatoryTitle}</h3>
          <ul>
            <li>
              {d.regEnefgNew}:{' '}
              <strong>{result.regulatory.enefgNew2026 ? d.regMeets : d.regFails}</strong>
            </li>
            <li>
              {d.regEnefgExisting2027}:{' '}
              <strong>{result.regulatory.enefgExisting2027 ? d.regMeets : d.regFails}</strong>
            </li>
            <li>
              {d.regEnefgExisting2030}:{' '}
              <strong>{result.regulatory.enefgExisting2030 ? d.regMeets : d.regFails}</strong>
            </li>
            <li>
              {d.regEed}:{' '}
              <strong>{result.regulatory.eedReportingScope ? d.regInScope : d.regOutScope}</strong>
            </li>
          </ul>

          <div className="no-print" style={{ marginTop: '1.5rem' }}>
            {/* Ação deliberada (não derivada de digitação): `track` sem dedupe.
                Imprimir/salvar em PDF é sinal forte de intenção — vale contar
                cada vez. */}
            <button
              type="button"
              onClick={() => {
                track('resultado_impresso', { ferramenta: 'calculadora-pue' });
                window.print();
              }}
            >
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
                <code>PUE = carga total ÷ carga de TI = {fmtNumber(result.facility, 0)} ÷{' '}
                {fmtNumber(result.it, 0)} = {fmtNumber(result.pueValue)}</code>
              </li>
              <li>
                <code>DCiE = 1 ÷ PUE</code> (métrica legada do The Green Grid)
              </li>
              <li>
                <code>Energia anual = kW × 8.760 h</code>
              </li>
              {result.tariffRs != null ? (
                <li>
                  <code>Custo anual = energia anual × R$ {fmtNumber(result.tariffRs, 4)}/kWh</code>{' '}
                  (tarifa informada + bandeira)
                </li>
              ) : null}
              {result.cueEstimated != null && FATOR_SIN_DEFAULT != null ? (
                <li>
                  <code>CUE = fator SIN ({FATOR_SIN_DEFAULT.tco2PorMwh} tCO2/MWh,{' '}
                  {FATOR_SIN_DEFAULT.ano}) × PUE</code> — {FATOR_SIN_DEFAULT.fonte}
                </li>
              ) : null}
              <li>
                Limiares regulatórios: EnEfG ≤ {REGULATORY.enefgNew2026} (novos, 07/2026);
                ≤ {REGULATORY.enefgExisting2027} (existentes, 07/2027); ≤{' '}
                {REGULATORY.enefgExisting2030} (existentes, 07/2030); EED ≥{' '}
                {REGULATORY.eedReportingItKw} kW de TI.
              </li>
            </ul>
          </details>
          <p className="disclaimer">{dict.common.disclaimer}</p>
        </section>
      ) : null}
    </div>
  );
}
