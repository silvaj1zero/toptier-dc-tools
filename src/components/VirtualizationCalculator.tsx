import { useMemo, useState } from 'react';
import { HOURS_PER_YEAR } from '@/data/benchmarks';
import { CONSOLIDACAO, INFRA_EVIDENCIA, INFRA_PRESETS, MELHORIAS } from '@/data/virtualizacao';
import { effectiveTariff, fmtCurrencyBRL, fmtEnergy, fmtNumber } from '@/lib/calc';
import {
  TODAS_MELHORIAS,
  virtualizationSavings,
  type Melhorias,
  type VirtualizationResult,
} from '@/lib/virtualization';
import { t, type Locale } from '@/i18n';
import { NumberField, TariffFields, initialTariff, tariffFromState, type TariffState } from './fields';

type Currency = 'brl' | 'usd';

function moneyFormatter(currency: Currency): (v: number) => string {
  if (currency === 'brl') return fmtCurrencyBRL;
  return (v: number) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function VirtualizationCalculator({ locale = 'pt-br' }: { locale?: Locale }) {
  const dict = t(locale);
  const d = dict.virtualization;

  // Cenário pré (placeholders = caso de referência do WP 118)
  const [capacidade, setCapacidade] = useState('');
  const [cargaTi, setCargaTi] = useState('');
  const [pctServ, setPctServ] = useState('');
  const [numServ, setNumServ] = useState('');
  const [ocupacao, setOcupacao] = useState('70');
  const [infraId, setInfraId] = useState(INFRA_PRESETS[0]!.id);
  const [currency, setCurrency] = useState<Currency>('brl');
  const [tariffState, setTariffState] = useState<TariffState>(initialTariff);
  const [priceUsd, setPriceUsd] = useState('');
  // Cenário pós
  const [pctVirt, setPctVirt] = useState(50);
  const [ratio, setRatio] = useState(10);
  const [melhorias, setMelhorias] = useState<Melhorias>(TODAS_MELHORIAS);

  const result = useMemo<{ r: VirtualizationResult; precoKwh: number } | null>(() => {
    const precoKwh =
      currency === 'brl'
        ? (() => {
            const tariff = tariffFromState(tariffState);
            return tariff ? effectiveTariff(tariff) : Number.NaN;
          })()
        : Number.parseFloat(priceUsd);
    const input = {
      capacidadeKw: Number.parseFloat(capacidade),
      cargaTiKw: Number.parseFloat(cargaTi),
      pctServidores: Number.parseFloat(pctServ),
      numServidores: Number.parseFloat(numServ),
      ocupacaoRackPct: Number.parseFloat(ocupacao),
      precoKwh,
      infraId,
      pctVirtualizavel: pctVirt,
      razaoConsolidacao: ratio,
      melhorias,
    };
    if (Object.values(input).some((v) => typeof v === 'number' && !Number.isFinite(v))) return null;
    try {
      return { r: virtualizationSavings(input), precoKwh };
    } catch {
      return null;
    }
  }, [capacidade, cargaTi, pctServ, numServ, ocupacao, infraId, currency, tariffState, priceUsd, pctVirt, ratio, melhorias]);

  const money = moneyFormatter(currency);
  const toggle = (key: keyof Melhorias) => setMelhorias((m) => ({ ...m, [key]: !m[key] }));

  const improvementList: Array<{ key: keyof Melhorias; label: string }> = [
    { key: 'rightsizeCracCrah', label: d.impRightsizeCrac },
    { key: 'rightsizeUpsPdu', label: d.impRightsizeUps },
    { key: 'upsAltaEficiencia', label: d.impUpsHighEff },
    { key: 'coolingEmFileira', label: d.impRowCooling },
    { key: 'placasCegas', label: d.impBlanking },
  ];

  const rows = result
    ? [
        { k: d.rowServers, pre: fmtNumber(result.r.pre.servidores, 0), pos: fmtNumber(result.r.pos.servidores, 0), red: 1 - result.r.pos.servidores / result.r.pre.servidores },
        { k: d.rowRacks, pre: fmtNumber(result.r.pre.racks, 0), pos: fmtNumber(result.r.pos.racks, 0), red: 1 - result.r.pos.racks / result.r.pre.racks },
        { k: d.rowServerPower, pre: `${fmtNumber(result.r.pre.potenciaServidoresKw, 0)} kW`, pos: `${fmtNumber(result.r.pos.potenciaServidoresKw, 0)} kW`, red: 1 - result.r.pos.potenciaServidoresKw / result.r.pre.potenciaServidoresKw },
        { k: d.rowItLoad, pre: `${fmtNumber(result.r.pre.cargaTiKw, 0)} kW`, pos: `${fmtNumber(result.r.pos.cargaTiKw, 0)} kW`, red: 1 - result.r.pos.cargaTiKw / result.r.pre.cargaTiKw },
        { k: d.rowInfra, pre: `${fmtNumber(result.r.pre.infra.totalKw, 0)} kW`, pos: `${fmtNumber(result.r.pos.infra.totalKw, 0)} kW`, red: 1 - result.r.pos.infra.totalKw / result.r.pre.infra.totalKw },
        { k: d.rowTotal, pre: `${fmtNumber(result.r.pre.totalKw, 0)} kW`, pos: `${fmtNumber(result.r.pos.totalKw, 0)} kW`, red: 1 - result.r.pos.totalKw / result.r.pre.totalKw },
        { k: d.rowPue, pre: fmtNumber(result.r.pre.pue), pos: fmtNumber(result.r.pos.pue), red: 1 - result.r.pos.pue / result.r.pre.pue },
        { k: d.rowAnnualEnergy, pre: fmtEnergy(result.r.pre.energiaAnualKwh), pos: fmtEnergy(result.r.pos.energiaAnualKwh), red: 1 - result.r.pos.energiaAnualKwh / result.r.pre.energiaAnualKwh },
        { k: d.rowAnnualCost, pre: money(result.r.pre.custoAnual), pos: money(result.r.pos.custoAnual), red: 1 - result.r.pos.custoAnual / result.r.pre.custoAnual },
      ]
    : [];

  const breakdown = result
    ? [
        { label: d.rowTotal, pre: result.r.pre.custoAnual, pos: result.r.pos.custoAnual },
        { label: d.rowInfra, pre: result.r.pre.infra.totalKw * HOURS_PER_YEAR * result.precoKwh, pos: result.r.pos.infra.totalKw * HOURS_PER_YEAR * result.precoKwh },
        { label: d.rowItLoad, pre: result.r.pre.cargaTiKw * HOURS_PER_YEAR * result.precoKwh, pos: result.r.pos.cargaTiKw * HOURS_PER_YEAR * result.precoKwh },
        { label: d.rowServerPower, pre: result.r.pre.potenciaServidoresKw * HOURS_PER_YEAR * result.precoKwh, pos: result.r.pos.potenciaServidoresKw * HOURS_PER_YEAR * result.precoKwh },
      ]
    : [];
  const breakdownMax = breakdown.length > 0 ? Math.max(...breakdown.map((b) => b.pre)) : 1;
  const paradoxo = result != null && result.r.pos.pue > result.r.pre.pue;

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>{d.preTitle}</legend>
          <div className="grid-2">
            <NumberField id="vz-cap" label={d.capacityLabel} value={capacidade} onChange={setCapacidade} help={d.capacityHelp} step={10} placeholder="1000" />
            <NumberField id="vz-it" label={d.itLoadLabel} value={cargaTi} onChange={setCargaTi} step={10} placeholder="500" />
            <NumberField id="vz-psrv" label={d.serverPctLabel} value={pctServ} onChange={setPctServ} help={d.serverPctHelp} min={1} step={1} placeholder="50" />
            <NumberField id="vz-nsrv" label={d.serverCountLabel} value={numServ} onChange={setNumServ} min={1} step={1} placeholder="750" />
            <NumberField id="vz-rack" label={d.rackOccupancyLabel} value={ocupacao} onChange={setOcupacao} min={10} step={5} />
            <div className="field">
              <label htmlFor="vz-infra">{d.infraLabel}</label>
              <select id="vz-infra" value={infraId} onChange={(e) => setInfraId(e.target.value as typeof infraId)}>
                {INFRA_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.labelPt}
                  </option>
                ))}
              </select>
              <p className="help">{d.infraHelp}</p>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>{dict.tariff.legend}</legend>
          <div className="field">
            <label htmlFor="vz-cur">{d.currencyLabel}</label>
            <select id="vz-cur" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
              <option value="brl">{d.currencyBrl}</option>
              <option value="usd">{d.currencyUsd}</option>
            </select>
          </div>
        </fieldset>
        {currency === 'brl' ? (
          <TariffFields t={dict} state={tariffState} onChange={setTariffState} />
        ) : (
          <fieldset>
            <div className="grid-2">
              <NumberField id="vz-usd" label={d.priceUsdLabel} value={priceUsd} onChange={setPriceUsd} step={0.01} placeholder="0,15" />
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend>{d.postTitle}</legend>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="vz-virt">
                {d.virtualizablePctLabel}: <strong>{pctVirt}%</strong>
              </label>
              <input id="vz-virt" type="range" min={0} max={100} step={5} value={pctVirt} onChange={(e) => setPctVirt(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div className="field">
              <label htmlFor="vz-ratio">
                {d.ratioLabel}: <strong>{ratio}:1</strong>
              </label>
              <input id="vz-ratio" type="range" min={2} max={30} step={1} value={ratio} onChange={(e) => setRatio(Number(e.target.value))} style={{ width: '100%' }} />
              <p className="help">{d.ratioHelp}</p>
            </div>
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--tt-gray-700)', marginBottom: '0.4rem' }}>{d.improvementsTitle}</p>
          <div className="grid-2">
            {improvementList.map((imp) => (
              <label key={imp.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 400 }}>
                <input type="checkbox" checked={melhorias[imp.key]} onChange={() => toggle(imp.key)} />
                {imp.label}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      {result ? (
        <section className="results" aria-live="polite">
          <div className="stat-grid">
            <div className="stat">
              <div className="label">{d.rowPue}</div>
              <div className="value">
                {fmtNumber(result.r.pre.pue)} → {fmtNumber(result.r.pos.pue)}
              </div>
            </div>
            <div className="stat highlight">
              <div className="label">{d.annualSavings}</div>
              <div className="value">{money(result.r.economiaAnual)}</div>
              <div className="note">{fmtEnergy(result.r.economiaAnualKwh)}/ano</div>
            </div>
            <div className="stat">
              <div className="label">{d.rowServers}</div>
              <div className="value">
                {fmtNumber(result.r.pre.servidores, 0)} → {fmtNumber(result.r.pos.servidores, 0)}
              </div>
            </div>
          </div>

          {paradoxo ? (
            <div className="card" style={{ background: 'var(--tt-amber-100)', borderColor: 'var(--tt-amber-600)' }}>
              <strong>{d.paradoxTitle}.</strong> {d.paradoxNote}
            </div>
          ) : null}

          <h3>{d.comparisonTitle}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>{d.colPre}</th>
                  <th>{d.colPos}</th>
                  <th>{d.colReduction}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.k}>
                    <td>{l.k}</td>
                    <td>{l.pre}</td>
                    <td>
                      <strong>{l.pos}</strong>
                    </td>
                    <td style={{ color: l.red >= 0 ? 'var(--tt-teal-600)' : 'var(--tt-red-600)', fontWeight: 600 }}>
                      {fmtNumber(Math.abs(l.red) * 100, 0)}%{l.red < 0 ? ' ↑' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>{d.breakdownTitle}</h3>
          <div>
            {breakdown.map((b) => (
              <div key={b.label} style={{ marginBottom: '0.7rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--tt-gray-700)', marginBottom: '0.15rem' }}>{b.label}</div>
                {[
                  { v: b.pre, cor: 'var(--tt-navy-500)', tag: d.colPre },
                  { v: b.pos, cor: 'var(--tt-teal-600)', tag: d.colPos },
                ].map((barra) => (
                  <div key={barra.tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.72rem', width: '2.2rem', color: 'var(--tt-gray-500)' }}>{barra.tag}</span>
                    <div
                      style={{
                        width: `${Math.max(1, (barra.v / breakdownMax) * 100)}%`,
                        maxWidth: 'calc(100% - 8rem)',
                        height: '14px',
                        borderRadius: '3px',
                        background: barra.cor,
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{money(barra.v)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

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
                <code>P_host = P_servidor × N_VMs^{CONSOLIDACAO.expoente}</code> — curve fit de consolidação ({CONSOLIDACAO.fonte}). Evidência: <strong>alta</strong>; limitação: fit de ~2010-13 — servidores modernos tendem a economizar menos.
              </li>
              <li>
                <code>P_infra = perdas fixas × capacidade + perdas proporcionais × carga de TI</code> (cadeia elétrica + climatização + auxiliares) — {INFRA_EVIDENCIA.fonte}. Evidência: <strong>média</strong> (calibração em 1 ponto de operação).
              </li>
              <li>
                Fatores das melhorias (UPS alta eficiência ×{MELHORIAS.fatores.upsAltaEfFixa}/{MELHORIAS.fatores.upsAltaEfProporcional}, cooling em fileira ×{MELHORIAS.fatores.coolingFileiraFixa}/{MELHORIAS.fatores.coolingFileiraProporcional}, placas cegas ×{MELHORIAS.fatores.placasCegas}) — {MELHORIAS.fonte}. Evidência: <strong>baixa</strong>.
              </li>
              <li>
                <code>Custo anual = potência total × 8.760 h × preço do kWh</code>
                {currency === 'brl' ? ' (tarifa efetiva = base + bandeira ÷ 100)' : ''}
              </li>
              <li>Racks: premissa didática de servidor 2U em rack de 42U, limitada pela ocupação informada.</li>
            </ul>
          </details>
          <p className="disclaimer">{dict.common.disclaimer}</p>
        </section>
      ) : null}
    </div>
  );
}
