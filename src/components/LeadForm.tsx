import { useState, type FormEvent } from 'react';
import { t, type Locale } from '@/i18n';
import { track } from '@/lib/track';

/**
 * Captura de lead. O endpoint (Formspree ou similar) vem de PUBLIC_LEAD_ENDPOINT.
 * Sem endpoint configurado, degrada para mailto: — nunca quebra.
 *
 * Anti-spam: honeypot (campo "website" invisível; preenchido ⇒ finge sucesso e descarta).
 * Atribuição: envia página de origem, referrer e UTMs da sessão junto com o lead.
 * LGPD: consentimento explícito por checkbox obrigatório, com finalidade declarada.
 */
export default function LeadForm({
  locale = 'pt-br',
  context,
  title,
}: {
  locale?: Locale;
  /** Pares extras enviados como campos ocultos (ex.: perfil FOMM, ferramenta de origem). */
  context?: Record<string, string>;
  /** Título alternativo do cartão (default: dicionário). */
  title?: string;
}) {
  const dict = t(locale);
  const endpoint = import.meta.env.PUBLIC_LEAD_ENDPOINT;
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: humanos não veem nem preenchem este campo.
    if (data.get('website')) {
      setStatus('ok');
      form.reset();
      return;
    }
    data.delete('website');

    // Atribuição da origem (qual ferramenta gerou o lead).
    const url = new URL(window.location.href);
    data.set('pagina', url.pathname);
    data.set('origem', url.pathname.replaceAll('/', '') || 'home');
    if (context) {
      for (const [k, v] of Object.entries(context)) data.set(k, v);
    }
    if (document.referrer) data.set('referrer', document.referrer);
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
      const v = url.searchParams.get(k);
      if (v) data.set(k, v);
    }

    if (!endpoint) {
      const subject = encodeURIComponent('Contato — Ferramentas de Eficiência Top Tier');
      const extras = context
        ? '\n' +
          Object.entries(context)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n')
        : '';
      const whats = data.get('whatsapp');
      const body = encodeURIComponent(
        `Nome: ${data.get('name')}\nE-mail: ${data.get('email')}\nEmpresa: ${data.get('company')}${whats ? `\nWhatsApp: ${whats}` : ''}\nPágina: ${url.href}${extras}`,
      );
      window.location.href = `mailto:contato@toptier.net.br?subject=${subject}&body=${body}`;
      setStatus('ok');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      setStatus(res.ok ? 'ok' : 'error');
      if (res.ok) {
        form.reset();
        // Só o envio ACEITO conta como lead. A `origem` (slug da página) é a
        // mesma que vai ao endpoint — no painel dá para ver qual ferramenta
        // gerou o contato.
        track('lead_enviado', { origem: String(data.get('origem') ?? 'desconhecida') });
      }
    } catch {
      setStatus('error');
    }
  }

  const d = dict.lead;

  return (
    <div className="card soft no-print">
      <h3>{title ?? d.title}</h3>
      {status === 'ok' ? (
        <p role="status">{d.success}</p>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="lead-name">{d.nameLabel}</label>
              <input id="lead-name" name="name" type="text" required autoComplete="name" maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="lead-email">{d.emailLabel}</label>
              <input id="lead-email" name="email" type="email" required autoComplete="email" maxLength={160} />
            </div>
            <div className="field">
              <label htmlFor="lead-company">{d.companyLabel}</label>
              <input id="lead-company" name="company" type="text" autoComplete="organization" maxLength={160} />
            </div>
            <div className="field">
              <label htmlFor="lead-whatsapp">{d.whatsappLabel}</label>
              <input
                id="lead-whatsapp"
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                maxLength={24}
                placeholder="+55 11 9…"
                aria-describedby="lead-whatsapp-help"
              />
              <p className="help" id="lead-whatsapp-help">
                {d.whatsappHelp}
              </p>
            </div>
          </div>
          {/* Honeypot — invisível para humanos, irresistível para bots */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="lead-website">Website</label>
            <input id="lead-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <label className="consent">
            <input type="checkbox" name="consent" required />
            <span>{d.consentLabel}</span>
          </label>
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? d.sending : d.submit}
          </button>
          {status === 'error' ? (
            <p className="help" role="alert">
              {d.error}
            </p>
          ) : null}
          <p className="help">{d.privacy}</p>
        </form>
      )}
    </div>
  );
}
