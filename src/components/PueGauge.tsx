import { FEATURED_REGIONAL_ID, GLOBAL_SITE_ID, LBNL_RULER, getPueReference, type PueReference } from '@/data/benchmarks';
import { classifyPue, fmtNumber } from '@/lib/calc';

const MIN = 1.0;
const MAX = 2.6;
const W = 720;
const H = 120;
const BAR_Y = 58;
const BAR_H = 14;

function x(value: number): number {
  const clamped = Math.min(Math.max(value, MIN), MAX);
  return ((clamped - MIN) / (MAX - MIN)) * (W - 40) + 20;
}

/**
 * Escala horizontal de PUE com a régua LBNL (Better ≤ 1,1 · Good ≤ 1,4 · Standard ≤ 2,0), a faixa da
 * classe escolhida (moldura), a média da América Latina (marcador em destaque), a média global por site
 * e o valor do usuário.
 */
export function PueGauge({
  value,
  userLabel = 'Você',
  classRef,
  en = false,
}: {
  value: number;
  userLabel?: string;
  classRef?: PueReference;
  en?: boolean;
}) {
  const band = classifyPue(value);
  const segments = [
    { from: MIN, to: LBNL_RULER.better, color: '#0e9f6e' },
    { from: LBNL_RULER.better, to: LBNL_RULER.good, color: '#7cc9a6' },
    { from: LBNL_RULER.good, to: LBNL_RULER.standard, color: '#f5d78e' },
    { from: LBNL_RULER.standard, to: MAX, color: '#e06c5a' },
  ];
  const latam = getPueReference(FEATURED_REGIONAL_ID);
  const global = getPueReference(GLOBAL_SITE_ID);
  const markers = [
    global && { ref: global, featured: false, row: 0 },
    latam && { ref: latam, featured: true, row: 1 },
  ].filter(Boolean) as { ref: PueReference; featured: boolean; row: number }[];
  const short = (r: PueReference) => (en ? r.shortEn : r.shortPt);
  const classLabel = classRef ? (en ? classRef.labelEn : classRef.labelPt) : '';

  return (
    <svg
      className="gauge"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`PUE ${fmtNumber(value)} — ${en ? band.labelEn : band.labelPt}`}
    >
      {segments.map((s) => (
        <rect
          key={s.from}
          x={x(s.from)}
          y={BAR_Y}
          width={x(s.to) - x(s.from)}
          height={BAR_H}
          fill={s.color}
          rx={2}
        />
      ))}
      {classRef ? (
        <rect
          x={x(classRef.min)}
          y={BAR_Y - 3}
          width={x(classRef.max) - x(classRef.min)}
          height={BAR_H + 6}
          fill="none"
          style={{ stroke: 'var(--tt-navy-900)' }}
          strokeWidth={2}
          rx={3}
        >
          <title>{`${classLabel}: ${fmtNumber(classRef.min)}–${fmtNumber(classRef.max)}`}</title>
        </rect>
      ) : null}
      {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6].map((tick) => (
        <g key={tick} className={tick * 10 % 5 === 0 ? undefined : 'tick-minor'}>
          <line
            x1={x(tick)}
            y1={BAR_Y + BAR_H}
            x2={x(tick)}
            y2={BAR_Y + BAR_H + 6}
            style={{ stroke: 'var(--tt-gray-500)' }}
            strokeWidth={1}
          />
          <text
            x={x(tick)}
            y={BAR_Y + BAR_H + 20}
            textAnchor="middle"
            fontSize={11}
            style={{ fill: 'var(--tt-gray-500)' }}
          >
            {tick.toFixed(1)}
          </text>
        </g>
      ))}
      {markers.map(({ ref, featured, row }) => (
        <g key={ref.id}>
          <line
            x1={x(ref.typical ?? ref.min)}
            y1={BAR_Y - 14 - row * 12}
            x2={x(ref.typical ?? ref.min)}
            y2={BAR_Y}
            style={{ stroke: featured ? 'var(--tt-navy-900)' : 'var(--tt-gray-500)' }}
            strokeWidth={featured ? 2 : 1}
            strokeDasharray={featured ? undefined : '2 2'}
          />
          <text
            className={featured ? undefined : 'bench-label'}
            x={x(ref.typical ?? ref.min)}
            y={BAR_Y - 17 - row * 12}
            textAnchor="middle"
            fontSize={featured ? 11.5 : 9.5}
            fontWeight={featured ? 700 : 400}
            style={{ fill: featured ? 'var(--tt-navy-900)' : 'var(--tt-gray-500)' }}
          >
            {short(ref)} {fmtNumber(ref.typical ?? ref.min)}
          </text>
        </g>
      ))}
      {/* marcador do usuário */}
      <polygon
        points={`${x(value)},${BAR_Y - 4} ${x(value) - 7},${BAR_Y - 16} ${x(value) + 7},${BAR_Y - 16}`}
        style={{ fill: 'var(--tt-navy-900)' }}
      />
      <text
        x={x(value)}
        y={H - 4}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        style={{ fill: 'var(--tt-navy-900)' }}
      >
        {userLabel}: {fmtNumber(value)}
      </text>
    </svg>
  );
}
