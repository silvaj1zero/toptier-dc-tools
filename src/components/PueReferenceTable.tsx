import { PUE_AVERAGE_TYPE_LABEL, PUE_REFERENCES, type PueReference } from '@/data/benchmarks';
import { fmtNumber } from '@/lib/calc';
import { t, type Locale } from '@/i18n';

/** Faixa legível: "1,45–1,70", ou o valor único quando mín = máx. */
export function formatRange(ref: PueReference): string {
  return ref.min === ref.max ? fmtNumber(ref.min) : `${fmtNumber(ref.min)}–${fmtNumber(ref.max)}`;
}

/** Tabela estática (sem estado) de todas as referências de PUE — usada na calculadora e na metodologia. */
export function PueReferenceTable({
  refs = PUE_REFERENCES,
  locale = 'pt-br',
}: {
  refs?: PueReference[];
  locale?: Locale;
}) {
  const en = locale === 'en';
  const d = t(locale).pueCalc;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{d.positionColRef}</th>
            <th>{d.positionColValue}</th>
            <th>{d.positionColType}</th>
            <th>{d.refColYear}</th>
            <th>{d.refColSample}</th>
            <th>{d.refColSource}</th>
          </tr>
        </thead>
        <tbody>
          {refs.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{en ? r.labelEn : r.labelPt}</strong>
              </td>
              <td>
                {formatRange(r)}
                {r.typical != null && r.min !== r.max ? ` (${en ? 'typical' : 'típico'} ${fmtNumber(r.typical)})` : ''}
              </td>
              <td>{PUE_AVERAGE_TYPE_LABEL[r.averageType][en ? 'en' : 'pt']}</td>
              <td>{r.year}</td>
              <td>{r.sample != null ? `n=${r.sample}` : '—'}</td>
              <td>
                {r.source}{' '}
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {en ? 'source' : 'fonte'}
                  <span className="sr-only"> — {en ? r.labelEn : r.labelPt} ({d.sourceLinkSuffix})</span>
                </a>
                {(en ? r.noteEn : r.notePt) ? <div className="help">{en ? r.noteEn : r.notePt}</div> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
