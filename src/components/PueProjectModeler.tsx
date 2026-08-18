import { useMemo, useRef, useState } from 'react';
import {
  DEFAULT_SCENARIO,
  runScenario,
  type Chiller,
  type CoolingSystem,
  type CracRedundancy,
  type DesignDetails,
  type ProjectScenario,
  type UpsSystem,
} from '@/lib/pue-model';
import { fmtNumber } from '@/lib/calc';
import { t, type Locale } from '@/i18n';

interface NamedScenario {
  name: string;
  scenario: ProjectScenario;
}

const CORES = ['var(--tt-cat-1)', 'var(--tt-cat-2)', 'var(--tt-cat-3)', 'var(--tt-cat-4)'];
const ECON_HOURS = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 8760];
const MAX_SCENARIOS = 4;

function money(v: number, currency: 'brl' | 'usd'): string {
  return v.toLocaleString(currency === 'brl' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: currency === 'brl' ? 'BRL' : 'USD',
    maximumFractionDigits: 0,
  });
}

export default function PueProjectModeler({ locale = 'pt-br' }: { locale?: Locale }) {
  const dict = t(locale);
  const d = dict.pueProject;

  const [scenarios, setScenarios] = useState<NamedScenario[]>([
    { name: 'Cenário A', scenario: { ...DEFAULT_SCENARIO, designDetails: { ...DEFAULT_SCENARIO.designDetails } } },
  ]);
  const [active, setActive] = useState(0);
  const [loadPct, setLoadPct] = useState(50);
  const [currency, setCurrency] = useState<'brl' | 'usd'>('usd');

  // Chave estável por parâmetros: renomear cenário não recalcula as curvas.
  const scenarioKey = JSON.stringify(scenarios.map((s) => s.scenario));
  const results = useMemo(
    () => scenarios.map((s) => runScenario(s.scenario)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenarioKey],
  );
  const points = useMemo(
    () => results.map((r) => r.at(loadPct / 100)),
    [results, loadPct],
  );

  const safeActive = Math.min(active, scenarios.length - 1);
  const cur = scenarios[safeActive] ?? scenarios[0]!;
  const curResult = results[safeActive] ?? results[0]!;
  const curPoint = points[safeActive] ?? points[0]!;

  const update = (patch: Partial<ProjectScenario>) => {
    setScenarios((list) =>
      list.map((s, i) => (i === safeActive ? { ...s, scenario: { ...s.scenario, ...patch } } : s)),
    );
  };
  const updateDetails = (key: keyof DesignDetails, value: boolean) => {
    update({ designDetails: { ...cur.scenario.designDetails, [key]: value } });
  };
  const rename = (name: string) => {
    setScenarios((list) => list.map((s, i) => (i === safeActive ? { ...s, name } : s)));
  };
  const duplicate = () => {
    if (scenarios.length >= MAX_SCENARIOS) return;
    const letra = String.fromCharCode(65 + scenarios.length);
    setScenarios((list) => [
      ...list,
      { name: `Cenário ${letra}`, scenario: { ...cur.scenario, designDetails: { ...cur.scenario.designDetails } } },
    ]);
    setActive(scenarios.length);
  };
  const remove = (i: number) => {
    if (scenarios.length <= 1) return;
    const novoTamanho = scenarios.length - 1;
    setScenarios((list) => list.filter((_, k) => k !== i));
    setActive((a) => Math.min(a > i ? a - 1 : a, novoTamanho - 1));
  };

  // ---- Curva SVG (multi-cenário) ----
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 640;
  const H = 260;
  const PAD = { l: 44, r: 12, t: 10, b: 28 };
  const puesValidos = results
    .map((r) => r.curve[5]!.pue)
    .filter((v) => Number.isFinite(v));
  const yMax = Math.min(6, Math.max(3, ...(puesValidos.length ? puesValidos : [3])));
  const sx = (load: number) => PAD.l + load * (W - PAD.l - PAD.r);
  const sy = (pue: number) => {
    const clamped = Math.min(yMax, Math.max(1, pue));
    return PAD.t + (1 - (clamped - 1) / (yMax - 1)) * (H - PAD.t - PAD.b);
  };
  const pathFor = (r: (typeof results)[number]) =>
    r.curve
      .filter((p) => p.load >= 0.05 && Number.isFinite(p.pue))
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.load).toFixed(1)},${sy(p.pue).toFixed(1)}`)
      .join(' ');

  // Marcador arrastável (como na ferramenta clássica): arrastar a linha/ponto no
  // gráfico move a carga de TI e recalcula os resultados. O slider continua
  // disponível como alternativa acessível por teclado.
  const dragToLoad = (clientX: number) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    const load = Math.round(((x - PAD.l) / (W - PAD.l - PAD.r)) * 100);
    setLoadPct(Math.min(100, Math.max(5, load)));
  };

  const selects: Array<{
    id: string;
    label: string;
    value: string;
    options: Array<[string, string]>;
    apply: (v: string) => void;
  }> = [
    {
      id: 'ups',
      label: d.upsLabel,
      value: cur.scenario.upsSystem,
      options: Object.entries(d.upsOptions),
      apply: (v) => update({ upsSystem: v as UpsSystem }),
    },
    {
      id: 'pwr',
      label: d.powerRedLabel,
      value: cur.scenario.dualPowerPath ? 'dual' : 'single',
      options: [
        ['single', d.powerRedSingle],
        ['dual', d.powerRedDual],
      ],
      apply: (v) => update({ dualPowerPath: v === 'dual' }),
    },
    {
      id: 'cool',
      label: d.coolingLabel,
      value: cur.scenario.coolingSystem,
      options: Object.entries(d.coolingOptions),
      apply: (v) => update({ coolingSystem: v as CoolingSystem }),
    },
    {
      id: 'chiller',
      label: d.chillerLabel,
      value: cur.scenario.chiller,
      options: Object.entries(d.chillerOptions),
      apply: (v) => update({ chiller: v as Chiller }),
    },
    {
      id: 'air',
      label: d.airDistLabel,
      value: cur.scenario.airDistribution,
      options: [
        ['perimeter', d.airDistPerimeter],
        ['closeCoupled', d.airDistClose],
      ],
      apply: (v) => update({ airDistribution: v as 'perimeter' | 'closeCoupled' }),
    },
    {
      id: 'cracRed',
      label: d.cracRedLabel,
      value: cur.scenario.cracRedundancy,
      options: Object.entries(d.cracRedOptions),
      apply: (v) => update({ cracRedundancy: v as CracRedundancy }),
    },
    {
      id: 'heatRej',
      label: d.heatRejLabel,
      value: cur.scenario.dualHeatRejection ? 'dual' : 'single',
      options: [
        ['single', d.heatRejSingle],
        ['dual', d.heatRejDual],
      ],
      apply: (v) => update({ dualHeatRejection: v === 'dual' }),
    },
    {
      id: 'econ',
      label: d.economizerLabel,
      value: String(cur.scenario.economizerHours),
      options: ECON_HOURS.map((h) => [String(h), fmtNumber(h, 0)]),
      apply: (v) => update({ economizerHours: Number(v) }),
    },
  ];

  const detKeys = Object.keys(d.det) as Array<keyof DesignDetails>;

  const barras = (slices: Array<{ label: string; fraction: number }>) => {
    const max = Math.max(...slices.map((s) => s.fraction), 0.001);
    return (
      <div>
        {slices.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
            <span style={{ fontSize: '0.78rem', width: '9.5rem', color: 'var(--tt-gray-700)' }}>{s.label}</span>
            <div
              style={{
                width: `${Math.max(1, (s.fraction / max) * 100)}%`,
                maxWidth: 'calc(100% - 13rem)',
                height: '12px',
                borderRadius: '3px',
                background: CORES[safeActive],
              }}
            />
            <span style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{(s.fraction * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* ===== Cenários ===== */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <strong style={{ color: 'var(--tt-navy-700)' }}>{d.scenariosTitle}:</strong>
        {scenarios.map((s, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === safeActive}
              style={{
                background: i === safeActive ? CORES[i] : 'transparent',
                color: i === safeActive ? '#fff' : 'var(--tt-gray-700)',
                border: `2px solid ${CORES[i]}`,
                padding: '0.3rem 0.9rem',
                borderRadius: '999px',
                fontSize: '0.9rem',
              }}
            >
              {s.name}
            </button>
            {scenarios.length > 1 && i === safeActive ? (
              <button
                type="button"
                aria-label={d.removeScenario}
                onClick={() => remove(i)}
                style={{ background: 'transparent', color: 'var(--tt-red-600)', border: 'none', padding: '0 0.25rem', fontSize: '1rem' }}
              >
                ×
              </button>
            ) : null}
          </span>
        ))}
        {scenarios.length < MAX_SCENARIOS ? (
          <button type="button" className="secondary" onClick={duplicate} style={{ padding: '0.3rem 0.9rem', fontSize: '0.9rem' }}>
            + {d.addScenario}
          </button>
        ) : null}
        <input
          aria-label={d.renamePlaceholder}
          value={cur.name}
          onChange={(e) => rename(e.target.value)}
          placeholder={d.renamePlaceholder}
          style={{ width: '11rem', marginLeft: 'auto' }}
        />
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '0 1.5rem' }}>
        {/* ===== Entradas ===== */}
        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>{d.architectureTitle}</legend>
            <div className="field">
              <label htmlFor="pp-cap">{d.capacityLabel}</label>
              <input
                id="pp-cap"
                key={`cap-${safeActive}`}
                type="number"
                min={10}
                step={10}
                defaultValue={cur.scenario.itCapacityKw}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  const v = Number.isFinite(n) && n >= 10 ? n : cur.scenario.itCapacityKw;
                  e.target.value = String(v);
                  update({ itCapacityKw: v });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="pp-cost">{d.costLabel}</label>
              <span style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  aria-label="moeda"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'brl' | 'usd')}
                  style={{ width: '6rem' }}
                >
                  <option value="usd">US$</option>
                  <option value="brl">R$</option>
                </select>
                <input
                  id="pp-cost"
                  key={`cost-${safeActive}`}
                  type="number"
                  min={0.01}
                  step={0.01}
                  defaultValue={cur.scenario.costPerKwh}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    const v = Number.isFinite(n) && n > 0 ? n : cur.scenario.costPerKwh;
                    e.target.value = String(v);
                    update({ costPerKwh: v });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                />
              </span>
            </div>
            {selects.map((s) => (
              <div className="field" key={s.id}>
                <label htmlFor={`pp-${s.id}`}>{s.label}</label>
                <select id={`pp-${s.id}`} value={s.value} onChange={(e) => s.apply(e.target.value)}>
                  {s.options.map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </fieldset>
          <fieldset>
            <legend>{d.detailsTitle}</legend>
            <div className="grid-2">
              {detKeys.map((k) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    checked={cur.scenario.designDetails[k]}
                    onChange={(e) => updateDetails(k, e.target.checked)}
                  />
                  {d.det[k]}
                </label>
              ))}
            </div>
          </fieldset>
        </form>

        {/* ===== Resultados ===== */}
        <section className="results" aria-live="polite" style={{ marginTop: 0 }}>
          <div className="stat-grid">
            <div className="stat highlight">
              <div className="label">{d.pueAtLoad} ({loadPct}%)</div>
              <div className="value">{Number.isFinite(curPoint.pue) ? fmtNumber(curPoint.pue) : '—'}</div>
            </div>
            <div className="stat">
              <div className="label">{d.totalPower}</div>
              <div className="value">{fmtNumber(curPoint.totalKw, 0)} kW</div>
            </div>
            <div className="stat">
              <div className="label">{d.annualCost}</div>
              <div className="value" style={{ fontSize: '1.15rem' }}>{money(curPoint.annualCost, currency)}</div>
            </div>
          </div>

          <div className="field" style={{ marginTop: '1rem' }}>
            <label htmlFor="pp-load">
              {d.loadLabel}: <strong>{loadPct}%</strong> ({fmtNumber((cur.scenario.itCapacityKw * loadPct) / 100, 0)} kW)
            </label>
            <input
              id="pp-load"
              type="range"
              min={5}
              max={100}
              step={1}
              value={loadPct}
              onChange={(e) => setLoadPct(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <h3>{d.curveTitle}</h3>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={d.curveTitle}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragToLoad(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.buttons & 1) dragToLoad(e.clientX);
            }}
            style={{ width: '100%', height: 'auto', background: 'var(--tt-bg-soft)', borderRadius: '8px', cursor: 'ew-resize', touchAction: 'none' }}
          >
            {[1, 2, 3, 4, 5, 6].filter((v) => v <= yMax).map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} stroke="var(--tt-gray-300)" strokeDasharray="3 4" />
                <text x={PAD.l - 6} y={sy(v) + 4} textAnchor="end" fontSize="11" fill="var(--tt-gray-500)">
                  {v.toFixed(0)}
                </text>
              </g>
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map((l) => (
              <text key={l} x={sx(l)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--tt-gray-500)">
                {(l * 100).toFixed(0)}%
              </text>
            ))}
            {results.map((r, i) => (
              <path key={i} d={pathFor(r)} fill="none" stroke={CORES[i]} strokeWidth={i === safeActive ? 3 : 1.8} opacity={i === safeActive ? 1 : 0.75} />
            ))}
            <line x1={sx(loadPct / 100)} x2={sx(loadPct / 100)} y1={PAD.t} y2={H - PAD.b} stroke="var(--tt-teal-600)" strokeWidth={2} strokeDasharray="4 3" />
            {/* alça invisível mais larga para facilitar o arrasto do marcador */}
            <rect x={sx(loadPct / 100) - 10} y={PAD.t} width={20} height={H - PAD.t - PAD.b} fill="transparent" />
            {points.map((p, i) => (
              Number.isFinite(p.pue) ? <circle key={i} cx={sx(loadPct / 100)} cy={sy(p.pue)} r={i === safeActive ? 6 : 4} fill={CORES[i]} stroke="var(--tt-card)" strokeWidth={1.5} /> : null
            ))}
          </svg>

          {/* Tabela sempre visível: é também a alternativa textual acessível do gráfico. */}
          {scenarios.length >= 1 ? (
            <>
              <h3>{d.compareTitle}</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>PUE @{loadPct}%</th>
                      <th>{d.totalPower}</th>
                      <th>{d.annualCost}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((s, i) => (
                      <tr key={i}>
                        <td>
                          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: CORES[i], marginRight: 6 }} />
                          {s.name}
                        </td>
                        <td><strong>{fmtNumber(points[i]!.pue)}</strong></td>
                        <td>{fmtNumber(points[i]!.totalKw, 0)} kW</td>
                        <td>{money(points[i]!.annualCost, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          <h3>{d.allocationTitle}</h3>
          {barras(curPoint.energyAllocation)}
          <details className="method" style={{ marginTop: '0.75rem' }}>
            <summary>{d.powerBreakdownTitle}</summary>
            {barras(curPoint.powerBreakdown)}
          </details>
          <details className="method">
            <summary>{d.coolingBreakdownTitle}</summary>
            {barras(curPoint.coolingBreakdown)}
          </details>
        </section>
      </div>

      <details className="method" style={{ marginTop: '1.25rem' }}>
        <summary>{d.assumptionsTitle}</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{d.assumptionsCols.subsystem}</th>
                <th>{d.assumptionsCols.sizing}</th>
                <th>{d.assumptionsCols.square}</th>
                <th>{d.assumptionsCols.proportional}</th>
                <th>{d.assumptionsCols.fixed}</th>
              </tr>
            </thead>
            <tbody>
              {curResult.assumptions.map((a) => (
                <tr key={a.subsystem}>
                  <td>{a.subsystem}</td>
                  <td>{fmtNumber(a.sizingPerPuIt, 2)}</td>
                  <td>{(a.squareLoss * 100).toFixed(2)}%</td>
                  <td>{(a.proportionalLoss * 100).toFixed(2)}%</td>
                  <td>{(a.fixedLoss * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="no-print" style={{ marginTop: '1.5rem' }}>
        <button type="button" onClick={() => window.print()}>
          {dict.common.print}
        </button>
      </div>
      <div className="print-only">
        <h2>{d.reportTitle}</h2>
        <p>{d.reportBy} — www.toptier.net.br</p>
      </div>

      <p className="disclaimer" style={{ marginTop: '1rem' }}>
        {d.provenance} {dict.common.disclaimer}
      </p>
    </div>
  );
}
