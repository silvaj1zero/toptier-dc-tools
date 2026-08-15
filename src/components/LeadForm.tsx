import { useState, type FormEvent } from 'react';
import { t, type Locale } from '@/i18n';

/**
 * Captura de lead. O endpoint (Formspree ou similar) vem de PUBLIC_LEAD_ENDPOINT.
 * Sem endpoint configurado, degrada para mailto: — nunca quebra.
 */
export default function LeadForm({ locale = 'pt-br' }: { locale?: Locale }) {
  const dict = t(locale);
  const endpoint = import.meta.env.PUBLIC_LEAD_ENDPOINT as string | undefined;
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (!endpoint) {
      const subject = encodeURIComponent('Contato — Ferramentas de Eficiência Top Tier');
      const body = encodeURIComponent(
        `Nome: ${data.get('name')}\nE-mail: ${data.get('email')}\nEmpresa: ${data.get('company')}`,
      );
      window.location.href = `mailto:contato@toptier.net.br?subject=${subject}&body=${body}`;
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
      if (res.ok) form.reset();
    } catch {
      setStatus('error');
    }
  }

  const d = dict.lead;

  return (
    <div className="card soft no-print">
      <h3>{d.title}</h3>
      {status === 'ok' ? (
        <p>{d.success}</p>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="lead-name">{d.nameLabel}</label>
              <input id="lead-name" name="name" type="text" required />
            </div>
            <div className="field">
              <label htmlFor="lead-email">{d.emailLabel}</label>
              <input id="lead-email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="lead-company">{d.companyLabel}</label>
              <input id="lead-company" name="company" type="text" />
            </div>
          </div>
          <button type="submit" disabled={status === 'sending'}>
            {d.submit}
          </button>
          {status === 'error' ? <p className="help">{d.error}</p> : null}
          <p className="help">{d.privacy}</p>
        </form>
      )}
    </div>
  );
}
