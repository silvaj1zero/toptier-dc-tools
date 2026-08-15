import { useMemo, useState } from 'react';
import { PUE_BENCHMARKS, REGULATORY } from '@/data/benchmarks';
import { FATOR_SIN_DEFAULT } from '@/data/energia-br';
import {
  annualCost,
  annualEnergyKwh,
  classifyPue,
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
import { NumberField, TariffFields, initialTariff, tariffFromState, type TariffState } from './fields';
import { PueGauge } from './PueGauge';

const MEASUREMENT_LEVELS = ['level1', 'level2', 'level3'] as const;

export default function PueCalculator({ locale = 'pt-br' }: { locale?: Locale }) {
  const dict = t(locale);
  const [itLoad, setItLoad] = useState('');
  const [facilityLoad, setFacilityLoad] = useState('');
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

  const d = dict.pueCalc;

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>{d.title}</legend>
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
              <span className={`badge ${result.band.tone}`}>{result.band.labelPt}</span>
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
          <PueGauge value={result.pueValue} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Referência</th>
                  <th>PUE</th>
                  <th>Ano</th>
                  <th>Fonte</th>
                </tr>
              </thead>
              <tbody>
                {PUE_BENCHMARKS.map((b) => (
                  <tr key={b.id}>
                    <td>{b.label}</td>
                    <td>{fmtNumber(b.value)}</td>
                    <td>{b.year}</td>
                    <td>{b.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
