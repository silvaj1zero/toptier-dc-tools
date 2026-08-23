import { useMemo, useState, type FormEvent } from 'react';
import { fmtNumber } from '@/lib/calc';
import {
  DISCIPLINAS,
  PERGUNTAS,
  calcularFomm,
  fommParaLead,
  type DisciplinaId,
  type FommResult,
  type NivelMaturidade,
  type RespostasFomm,
} from '@/lib/fomm';
import { t, type Dict, type Locale } from '@/i18n';

const FOLDER_URL = '/downloads/tti-fomm-certification-r9.pdf';

// ---------------------------------------------------------------------------
// Radar SVG (7 eixos, escala 1–5) — sem libs, cores do DS
// ---------------------------------------------------------------------------

function RadarFomm({ d, result }: { d: Dict['fomm']; result: FommResult }) {
  const CX = 210;
  const CY = 180;
  const R = 130;
  const n = DISCIPLINAS.length;
  const angulo = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const ponto = (i: number, r: number) => ({
    x: CX + Math.cos(angulo(i)) * r,
    y: CY + Math.sin(angulo(i)) * r,
  });
  const raio = (score: number) => (Math.max(score, 0.35) / 5) * R;

  const poligono = result.porDisciplina
    .map((disc, i) => {
      const p = ponto(i, raio(disc.score));
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 420 372"
      style={{ width: '100%', maxWidth: '440px', height: 'auto' }}
      role="img"
      aria-label={`${d.radarTitle}: ${result.porDisciplina
        .map((disc) => `${d.disciplines[disc.id].nome} ${disc.score.toFixed(1)}`)
        .join(', ')}`}
    >
      <title>{d.radarTitle}</title>
      {[1, 2, 3, 4, 5].map((nivel) => (
        <polygon
          key={nivel}
          points={Array.from({ length: n }, (_, i) => {
            const p = ponto(i, (nivel / 5) * R);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(' ')}
          fill="none"
          style={{ stroke: 'var(--tt-gray-300)' }}
          strokeWidth={nivel === 5 ? 1.5 : 0.75}
        />
      ))}
      {DISCIPLINAS.map((_, i) => {
        const p = ponto(i, R);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            style={{ stroke: 'var(--tt-gray-300)' }}
            strokeWidth={0.75}
          />
        );
      })}
      <polygon
        points={poligono}
        style={{ fill: 'var(--tt-teal-100)', stroke: 'var(--tt-teal-600)' }}
        strokeWidth={2}
      />
      {result.porDisciplina.map((disc, i) => {
        const p = ponto(i, raio(disc.score));
        return (
          <circle key={disc.id} cx={p.x} cy={p.y} r={4} style={{ fill: 'var(--tt-teal-600)' }} />
        );
      })}
      {DISCIPLINAS.map((id, i) => {
        const p = ponto(i, R + 22);
        const nome = d.disciplines[id].nome;
        // quebra rótulos longos em até 2 linhas
        const palavras = nome.split(' ');
        const meio = Math.ceil(palavras.length / 2);
        const linhas = palavras.length > 2 ? [palavras.slice(0, meio).join(' '), palavras.slice(meio).join(' ')] : [nome];
        return (
          <text
            key={id}
            x={p.x}
            y={p.y - (linhas.length - 1) * 6}
            textAnchor="middle"
            fontSize={10.5}
            fontWeight={600}
            style={{ fill: 'var(--tt-gray-700)' }}
          >
            {linhas.map((linha, li) => (
              <tspan key={li} x={p.x} dy={li === 0 ? 0 : 12}>
                {linha}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Quadro flutuante com os critérios de cada nível (WP #197, Figura 3)
// ---------------------------------------------------------------------------

function NiveisPopover({ d, onClose }: { d: Dict['fomm']; onClose: () => void }) {
  return (
    <div className="fomm-info-pop" role="dialog" aria-label={d.infoTitle}>
      <div className="fomm-info-head">
        <strong>{d.infoTitle}</strong>
        <button type="button" className="secondary fomm-info-close" onClick={onClose}>
          {d.infoClose}
        </button>
      </div>
      <ol>
        {([1, 2, 3, 4, 5] as const).map((nivel) => (
          <li key={nivel}>
            <strong>
              {nivel} · {d.levels[nivel].label}
            </strong>{' '}
            <em>({d.levels[nivel].official})</em>
            <p>{d.levels[nivel].criteria}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function FommAssessment({ locale = 'pt-br' }: { locale?: Locale }) {
  const dict = t(locale);
  const d = dict.fomm;
  const [respostas, setRespostas] = useState<RespostasFomm>({});
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [gateStatus, setGateStatus] = useState<'idle' | 'sending'>('idle');

  const result = useMemo(() => {
    try {
      return calcularFomm(respostas);
    } catch {
      return null;
    }
  }, [respostas]);

  const responder = (id: string, nivel: NivelMaturidade) =>
    setRespostas((r) => ({ ...r, [id]: nivel }));

  const nivelLabel = (nivel: NivelMaturidade) => d.levels[nivel].label;

  /**
   * Gate de registro: para VER e BAIXAR o resultado (e o folder), o prospect
   * registra nome + e-mail. Contato comercial só com o check de autorização;
   * WhatsApp é opcional. O registro nunca bloqueia o prospect: se o envio ao
   * endpoint falhar, o resultado é liberado mesmo assim.
   */
  async function onGateSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!result?.completo) return;
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: bots preenchem, humanos não veem.
    if (data.get('website')) {
      setUnlocked(true);
      return;
    }
    data.delete('website');

    data.set('origem', 'fomm-gate');
    data.set('autoriza_contato', data.get('autoriza_contato') ? 'sim' : 'nao');
    const url = new URL(window.location.href);
    data.set('pagina', url.pathname);
    if (document.referrer) data.set('referrer', document.referrer);
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
      const v = url.searchParams.get(k);
      if (v) data.set(k, v);
    }
    for (const [k, v] of Object.entries(fommParaLead(result))) data.set(k, v);

    const endpoint = import.meta.env.PUBLIC_LEAD_ENDPOINT;
    if (endpoint) {
      setGateStatus('sending');
      try {
        await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
      } catch {
        // registro é cortesia — nunca impede o prospect de ver o resultado
      }
    }
    setGateStatus('idle');
    setUnlocked(true);
  }

  return (
    <div>
      <section className="card soft">
        <h2 style={{ marginTop: 0 }}>{d.scaleTitle}</h2>
        <p>{d.scaleIntro}</p>
        <ol className="scale-legend">
          {([1, 2, 3, 4, 5] as const).map((nivel) => (
            <li key={nivel}>
              <strong>
                {nivel} · {d.levels[nivel].label}
              </strong>{' '}
              <em>({d.levels[nivel].official})</em> — {d.levels[nivel].desc}
            </li>
          ))}
        </ol>
      </section>

      <form onSubmit={(e) => e.preventDefault()}>
        {DISCIPLINAS.map((discId: DisciplinaId) => {
          const info = d.disciplines[discId];
          const qs = PERGUNTAS.filter((p) => p.disciplina === discId);
          return (
            <fieldset key={discId}>
              <legend>{info.nome}</legend>
              <p className="help" style={{ marginTop: 0 }}>
                {info.desc}
              </p>
              {qs.map((q) => (
                <div key={q.id} className="fomm-q" role="radiogroup" aria-labelledby={`fq-${q.id}`}>
                  <p className="fomm-q-text" id={`fq-${q.id}`}>
                    {d.q[q.id as keyof typeof d.q]}
                    <button
                      type="button"
                      className="fomm-info-btn"
                      aria-label={d.infoButton}
                      title={d.infoButton}
                      aria-expanded={openInfo === q.id}
                      onClick={() => setOpenInfo(openInfo === q.id ? null : q.id)}
                    >
                      i
                    </button>
                  </p>
                  {openInfo === q.id ? <NiveisPopover d={d} onClose={() => setOpenInfo(null)} /> : null}
                  <div className="fomm-scale">
                    {([1, 2, 3, 4, 5] as const).map((nivel) => (
                      <label
                        key={nivel}
                        className={`fomm-opt${respostas[q.id] === nivel ? ' on' : ''}`}
                        title={`${nivel} — ${nivelLabel(nivel)}: ${d.levels[nivel].criteria}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={nivel}
                          checked={respostas[q.id] === nivel}
                          onChange={() => responder(q.id, nivel)}
                        />
                        <span className="n">{nivel}</span>
                        <span className="t">{nivelLabel(nivel)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>
          );
        })}
      </form>

      <p className="help" role="status">
        {result ? result.respondidas : 0}/{PERGUNTAS.length} {d.progress}
        {result && !result.completo ? ` — ${d.incompleteNote}` : ''}
      </p>

      {/* Gate de registro: perfil pronto, resultado atrás de nome + e-mail. */}
      {result?.completo && !unlocked ? (
        <section className="card fomm-gate">
          <h2 style={{ marginTop: 0 }}>{d.gateTitle}</h2>
          <p>{d.gateIntro}</p>
          <form onSubmit={onGateSubmit}>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="fg-name">{dict.lead.nameLabel}</label>
                <input id="fg-name" name="name" type="text" required autoComplete="name" maxLength={120} />
              </div>
              <div className="field">
                <label htmlFor="fg-email">{dict.lead.emailLabel}</label>
                <input id="fg-email" name="email" type="email" required autoComplete="email" maxLength={160} />
              </div>
              <div className="field">
                <label htmlFor="fg-company">{dict.lead.companyLabel}</label>
                <input id="fg-company" name="company" type="text" autoComplete="organization" maxLength={160} />
              </div>
              <div className="field">
                <label htmlFor="fg-whats">{d.gateWhatsapp}</label>
                <input id="fg-whats" name="whatsapp" type="tel" autoComplete="tel" maxLength={24} placeholder="+55 11 9…" />
                <p className="help">{d.gateWhatsappHelp}</p>
              </div>
            </div>
            <div className="hp-field" aria-hidden="true">
              <label htmlFor="fg-website">Website</label>
              <input id="fg-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <label className="consent">
              <input type="checkbox" name="autoriza_contato" />
              <span>{d.gateAuthContact}</span>
            </label>
            <button type="submit" disabled={gateStatus === 'sending'}>
              {gateStatus === 'sending' ? d.gateSending : d.gateButton}
            </button>
            <p className="help">{d.gatePrivacy}</p>
          </form>
        </section>
      ) : null}

      {result?.completo && unlocked ? (
        <section className="results">
          <h2>{d.resultsTitle}</h2>
          <div className="stat-grid">
            <div className="stat highlight">
              <div className="label">{d.statGeral}</div>
              <div className="value">
                {result.nivelGeral} · {nivelLabel(result.nivelGeral)}
              </div>
              <div className="note">
                {d.scoreWord} {fmtNumber(result.scoreGeral, 1)} / 5 — {d.conventionNote}
              </div>
            </div>
            <div className="stat">
              <div className="label">{d.statForte}</div>
              <div className="value" style={{ fontSize: '1.15rem' }}>
                {d.disciplines[result.maisForte.id].nome}
              </div>
              <div className="note">{fmtNumber(result.maisForte.score, 1)} / 5</div>
            </div>
            <div className="stat">
              <div className="label">{d.statGap}</div>
              <div className="value" style={{ fontSize: '1.15rem' }}>
                {d.disciplines[result.gaps[0]!.id].nome}
              </div>
              <div className="note">{fmtNumber(result.gaps[0]!.score, 1)} / 5</div>
            </div>
          </div>

          <h3>{d.radarTitle}</h3>
          <RadarFomm d={d} result={result} />

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{d.tableCol.disciplina}</th>
                  <th scope="col">{d.tableCol.score}</th>
                  <th scope="col">{d.tableCol.nivel}</th>
                </tr>
              </thead>
              <tbody>
                {result.porDisciplina.map((disc) => (
                  <tr key={disc.id}>
                    <th scope="row" style={{ fontWeight: 400 }}>
                      {d.disciplines[disc.id].nome}
                    </th>
                    <td>{disc.respondidas > 0 ? fmtNumber(disc.score, 1) : '—'}</td>
                    <td>
                      {disc.respondidas > 0 ? (
                        <span className={`badge ${disc.score >= 3.5 ? 'good' : disc.score >= 2.5 ? 'ok' : 'warn'}`}>
                          {disc.nivel} · {nivelLabel(disc.nivel)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>{d.gapsTitle}</h3>
          <p>{d.gapsIntro}</p>
          <ol>
            {result.gaps.map((g) => (
              <li key={g.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{d.disciplines[g.id].nome}</strong> ({fmtNumber(g.score, 1)}/5) —{' '}
                {d.gapAction[g.id]}
              </li>
            ))}
          </ol>

          <div className="card" style={{ borderColor: 'var(--tt-teal-600)', borderWidth: '2px' }}>
            <h3 style={{ marginTop: 0 }}>{d.ctaTitle}</h3>
            <p>{d.ctaText}</p>
          </div>

          <div className="no-print" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => window.print()}>
              {dict.common.print}
            </button>
            <a className="btn-ghost" href={FOLDER_URL} download>
              {d.folderButton}
            </a>
          </div>
          <div className="print-only">
            <h2>{d.reportTitle}</h2>
            <p>{d.reportBy} — www.toptier.net.br</p>
          </div>

          <details className="method">
            <summary>{dict.common.formulasTitle}</summary>
            <p>{d.methodNote}</p>
          </details>
          <p className="disclaimer">{dict.common.disclaimer}</p>
        </section>
      ) : null}
    </div>
  );
}
