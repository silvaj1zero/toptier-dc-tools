import { SERVICE_CTA } from '@/data/servicos-cta';
import type { Locale } from '@/i18n';

function ExternalLink({ href, children, en }: { href: string; children: string; en: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> ({en ? 'opens in a new tab' : 'abre em nova aba'})</span>
    </a>
  );
}

/** CTA principal: falar com especialistas em TOP EFFICIENCY (logo após a régua/tabela de referências). */
export function EfficiencyCta({ locale = 'pt-br' }: { locale?: Locale }) {
  const en = locale === 'en';
  const e = SERVICE_CTA.efficiency;
  return (
    <p className="no-print" style={{ fontWeight: 600 }}>
      {en ? e.leadEn : e.leadPt}{' '}
      <ExternalLink href={e.url} en={en}>
        {e.name}
      </ExternalLink>{' '}
      — {en ? e.descEn : e.descPt}.
    </p>
  );
}

/** Linha sóbria para TOP SITE e TOP PRACTICES (tema PUE). */
export function ServiceCta({ locale = 'pt-br' }: { locale?: Locale }) {
  const en = locale === 'en';
  const [site, practices] = SERVICE_CTA.links;
  return (
    <p className="help no-print">
      {en ? SERVICE_CTA.introEn : SERVICE_CTA.introPt}{' '}
      <ExternalLink href={site.url} en={en}>
        {site.name}
      </ExternalLink>{' '}
      — {en ? site.descEn : site.descPt}; {en ? 'and' : 'e'}{' '}
      <ExternalLink href={practices.url} en={en}>
        {practices.name}
      </ExternalLink>{' '}
      — {en ? practices.descEn : practices.descPt}.
    </p>
  );
}
