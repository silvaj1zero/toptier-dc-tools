import { PUE_BENCHMARKS } from '@/data/benchmarks';
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

/** Escala horizontal de PUE com faixas 2025, marcadores de benchmark e o valor do usuário. */
export function PueGauge({ value }: { value: number }) {
  const band = classifyPue(value);
  const segments = [
    { from: 1.0, to: 1.1, color: '#0e9f6e' },
    { from: 1.1, to: 1.25, color: '#34b284' },
    { from: 1.25, to: 1.4, color: '#7cc9a6' },
    { from: 1.4, to: 1.54, color: '#c8e6b0' },
    { from: 1.54, to: 1.8, color: '#f5d78e' },
    { from: 1.8, to: 2.2, color: '#f0a860' },
    { from: 2.2, to: 2.6, color: '#e06c5a' },
  ];

  return (
    <svg
      className="gauge"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`PUE ${fmtNumber(value)} — ${band.labelPt}`}
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
      {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6].map((tick) => (
        <g key={tick}>
          <line
            x1={x(tick)}
            y1={BAR_Y + BAR_H}
            x2={x(tick)}
            y2={BAR_Y + BAR_H + 6}
            stroke="#64748b"
            strokeWidth={1}
          />
          <text
            x={x(tick)}
            y={BAR_Y + BAR_H + 20}
            textAnchor="middle"
            fontSize={11}
            fill="#64748b"
          >
            {tick.toFixed(1)}
          </text>
        </g>
      ))}
      {PUE_BENCHMARKS.filter((b) => b.id !== 'enterprise-medio').map((b, i) => (
        <g key={b.id}>
          <line
            x1={x(b.value)}
            y1={BAR_Y - 14 - (i % 2) * 12}
            x2={x(b.value)}
            y2={BAR_Y}
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          <text
            x={x(b.value)}
            y={BAR_Y - 17 - (i % 2) * 12}
            textAnchor="middle"
            fontSize={9.5}
            fill="#64748b"
          >
            {b.label.split(' ')[0]} {fmtNumber(b.value)}
          </text>
        </g>
      ))}
      {/* marcador do usuário */}
      <polygon
        points={`${x(value)},${BAR_Y - 4} ${x(value) - 7},${BAR_Y - 16} ${x(value) + 7},${BAR_Y - 16}`}
        fill="#0b2239"
      />
      <text
        x={x(value)}
        y={H - 4}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="#0b2239"
      >
        Você: {fmtNumber(value)}
      </text>
    </svg>
  );
}
