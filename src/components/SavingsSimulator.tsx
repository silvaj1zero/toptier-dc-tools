import { useMemo, useState } from 'react';
import { EQUIVALENCIAS, FATOR_SIN_DEFAULT } from '@/data/energia-br';
import {
  effectiveTariff,
  fmtCurrencyBRL,
  fmtEnergy,
  fmtNumber,
  savings,
} from '@/lib/calc';
import { t, type Locale } from '@/i18n';
import { NumberField, TariffFields, initialTariff, tariffFromState, type TariffState } from './fields';

/** Medidas típicas por faixa de redução de PUE — conteúdo didático dos treinamentos Top Tier. */
const MEASURES: { maxDelta: number; items: string[] }[] = [
  {
    maxDelta: 0.15,
    items: [
      'Placas cegas em posições vazias de rack e vedação de aberturas de piso',
      'Gestão de fluxo de ar: corredores quente/frio bem separados',
      'Ajuste de setpoint de temperatura para o envelope ASHRAE vigente',
      'Desligamento de equipamentos "zumbis" e iluminação eficiente',
    ],
  },
  {
    maxDelta: 0.35,
    items: [
      'Confinamento de corredor (containment) quente ou frio',
      'Ventiladores com velocidade variável (VFD/EC) em CRAC/CRAH',
      'UPS de alta eficiência (modo eco/eConversion) e descomissionamento de redundância ociosa',
      'Consolidação e virtualização de servidores subutilizados',
    ],
  },
  {
    maxDelta: Infinity,
    items: [
      'Free cooling / economizador (viabilidade depende do clima local)',
      'Resfriamento líquido (direct-to-chip ou imersão) para altas densidades',
      'Redesenho da cadeia elétrica (distribuição em tensão mais alta, menos conversões)',
      'Revisão completa da arquitetura de climatização com apoio de especialista',
    ],
  },
];

export default function SavingsSimulator({ locale = 'pt-br' }: { locale?: Locale }) {
  const dict = t(locale);
  const [itLoad, setItLoad] = useState('');
  const [currentPue, setCurrentPue] = useState('');
  const [targetPue, setTargetPue] = useState('');
  const [tariffState, setTariffState] = useState<TariffState>(initialTariff);

  const result = useMemo(() => {
    const it = Number.parseFloat(itLoad);
    const cur = Number.parseFloat(currentPue);
    const tgt = Number.parseFloat(targetPue);
    const tariff = tariffFromState(tariffState);
    if (
      !Number.isFinite(it) ||
      !Number.isFinite(cur) ||
      !Number.isFinite(tgt) ||
      it <= 0 ||
      cur < 1 ||
      tgt < 1 ||
      tgt > cur ||
      tariff == null
    ) {
      return null;
    }
    const res = savings({
      itLoadKw: it,
      currentPue: cur,
      targetPue: tgt,
      tariff,
      gridFactorTco2PerMwh: FATOR_SIN_DEFAULT?.tco2PorMwh,
    });
    return { res, tariff, delta: cur - tgt };
  }, [itLoad, currentPue, targetPue, tariffState]);

  const d = dict.savings;
  const measures = result
    ? MEASURES.find((m) => result.delta <= m.maxDelta)?.items ?? []
    : [];

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>{d.title}</legend>
          <div className="grid-2">
            <NumberField
              id="sv-it"
              label={d.itLoadLabel}
              value={itLoad}
              onChange={setItLoad}
              step={1}
              placeholder="500"
            />
            <NumberField
              id="sv-cur"
              label={d.currentPueLabel}
              value={currentPue}
              onChange={setCurrentPue}
              min={1}
              step={0.01}
              placeholder="1,80"
            />
            <NumberField
              id="sv-tgt"
              label={d.targetPueLabel}
              value={targetPue}
              onChange={setTargetPue}
              help={d.targetPueHelp}
              min={1}
              step={0.01}
              placeholder="1,50"
            />
          </div>
        </fieldset>
        <TariffFields t={dict} state={tariffState} onChange={setTariffState} />
      </form>

      {result ? (
        <section className="results" aria-live="polite">
          <div className="card soft">
            <p>
              Reduzir o PUE de <strong>{fmtNumber(Number.parseFloat(currentPue))}</strong> para{' '}
              <strong>{fmtNumber(Number.parseFloat(targetPue))}</strong> com{' '}
              <strong>{fmtNumber(Number.parseFloat(itLoad), 0)} kW</strong> de TI libera{' '}
              <strong>{fmtNumber(result.res.deltaKw, 0)} kW</strong> de demanda contínua (
              {fmtNumber(result.res.currentFacilityKw, 0)} kW → {fmtNumber(result.res.targetFacilityKw, 0)}{' '}
              kW na instalação).
            </p>
          </div>

          <h3>{d.horizonTitle}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>{d.year1}</th>
                  <th>{d.year5}</th>
                  <th>{d.year10}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{d.lessEnergy}</td>
                  {result.res.perYear.map((y) => (
                    <td key={y.years}>
                      <strong>{fmtEnergy(y.energyKwh)}</strong>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>{d.lessCost}</td>
                  {result.res.perYear.map((y) => (
                    <td key={y.years}>
                      <strong>{fmtCurrencyBRL(y.costRs)}</strong>
                    </td>
                  ))}
                </tr>
                {result.res.perYear[0]?.carbonTons != null ? (
                  <tr>
                    <td>{d.lessCarbon}</td>
                    {result.res.perYear.map((y) => (
                      <td key={y.years}>
                        <strong>{fmtNumber(y.carbonTons!, 1)} t</strong>
                      </td>
                    ))}
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {result.res.perYear[0] ? (
            <>
              <h3>{d.equivalencesTitle}</h3>
              <ul>
                {EQUIVALENCIAS.map((eq) => {
                  const y1 = result.res.perYear[0]!;
                  let computed: string | null = null;
                  if (eq.id === 'residencias') {
                    computed = `${fmtNumber(y1.energyKwh / (eq.value * 12), 0)} residências`;
                  } else if (eq.id === 'arvores' && y1.carbonTons != null) {
                    computed = `${fmtNumber((y1.carbonTons * 1000) / eq.value, 0)} árvores`;
                  }
                  if (computed == null) return null;
                  return (
                    <li key={eq.id}>
                      <strong>{computed}</strong> — {eq.labelPt}, por ano de economia
                      <br />
                      <small>
                        fator: {eq.value} {eq.unit} ({eq.fonte}, {eq.ano}){eq.nota ? ` — ${eq.nota}` : ''}
                      </small>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}

          {measures.length > 0 ? (
            <>
              <h3>{d.measuresTitle}</h3>
              <ul>
                {measures.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </>
          ) : null}

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
                <code>Δpotência = TI × (PUE_atual − PUE_alvo) = {fmtNumber(result.res.deltaKw, 0)} kW</code>
              </li>
              <li>
                <code>Economia anual = Δpotência × 8.760 h × R${' '}
                {fmtNumber(effectiveTariff(result.tariff), 4)}/kWh</code>
              </li>
              {FATOR_SIN_DEFAULT != null ? (
                <li>
                  <code>CO2e = MWh × {FATOR_SIN_DEFAULT.tco2PorMwh} tCO2/MWh</code> — fator médio do
                  SIN ({FATOR_SIN_DEFAULT.ano}), {FATOR_SIN_DEFAULT.fonte}
                </li>
              ) : (
                <li>Fator de carbono do SIN ainda não configurado — bloco de CO2 omitido.</li>
              )}
              <li>Projeção linear (carga de TI e tarifa constantes) — mesma janela 1/5/10 anos da
                calculadora clássica da 42U, com todos os fatores expostos.</li>
            </ul>
          </details>
          <p className="disclaimer">{dict.common.disclaimer}</p>
        </section>
      ) : null}
    </div>
  );
}
