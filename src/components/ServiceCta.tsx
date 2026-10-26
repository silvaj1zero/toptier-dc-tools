import { SERVICE_CTA } from '@/data/servicos-cta';
import type { Locale } from '@/i18n';

/** Linha sóbria de CTA para os serviços TOP SITE e TOP PRACTICES (tema PUE). */
export function ServiceCta({ locale = 'pt-br' }: { locale?: Locale }) {
  const en = locale === 'en';
  const [site, practices] = SERVICE_CTA.links;
  const newTab = en ? 'opens in a new tab' : 'abre em nova aba';
  return (
    <p className="help no-print">
      {en ? SERVICE_CTA.introEn : SERVICE_CTA.introPt}{' '}
      <a href={site.url} target="_blank" rel="noopener noreferrer">
        {site.name}
        <span className="sr-only"> ({newTab})</span>
      </a>{' '}
      — {en ? site.descEn : site.descPt}; {en ? 'and' : 'e'}{' '}
      <a href={practices.url} target="_blank" rel="noopener noreferrer">
        {practices.name}
        <span className="sr-only"> ({newTab})</span>
      </a>{' '}
      — {en ? practices.descEn : practices.descPt}.
    </p>
  );
}
