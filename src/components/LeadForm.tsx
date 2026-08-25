import { useEffect, useRef, useState, type FormEvent } from 'react';
import { t, type Locale } from '@/i18n';
import { track } from '@/lib/track';
import {
  abrirMailto,
  contextoDaSessao,
  enviarLead,
  origemDaPagina,
  LEAD_ENDPOINT,
} from '@/lib/lead';
import { carregarTurnstile, TURNSTILE_SITE_KEY } from '@/lib/turnstile';

/**
 * Captura de lead — canal único com o site institucional.
 *
 * Desde 2026-08-25 o lead vai para `/api/tool-lead` (Pages Function do site),
 * que valida o Turnstile e entrega via Resend na MESMA caixa dos formulários do
 * site. Antes ia para o Formspree, num canal separado. [F-4 ADR-FOMM-FRONTEIRA]
 *
 * Sem endpoint configurado, degrada para `mailto:` — nunca quebra.
 *
 * Anti-spam em duas camadas: honeypot (campo "website" invisível; preenchido ⇒
 * finge sucesso e descarta) e Turnstile. O honeypot continua porque é grátis e
 * pega o bot burro antes de qualquer chamada de rede.
 *
 * Atribuição: página de origem, referrer e UTMs viajam no `contexto`.
 * LGPD: consentimento explícito por checkbox obrigatório, com finalidade declarada.
 */
export default function LeadForm({
  locale = 'pt-br',
  context,
  title,
}: {
  locale?: Locale;
  /** Pares extras enviados junto ao lead (ex.: perfil FOMM, ferramenta de origem). */
  context?: Record<string, string>;
  /** Título alternativo do cartão (default: dicionário). */
  title?: string;
}) {
  const dict = t(locale);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [erroDetalhe, setErroDetalhe] = useState<string | null>(null);

  // --- Turnstile (renderização explícita — ver src/lib/turnstile.ts) ---
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef<string>('');

  useEffect(() => {
    // Sem site key não há anti-robô configurado: o formulário continua
    // funcionando (o servidor é quem decide recusar), e nada é renderizado.
    if (!TURNSTILE_SITE_KEY || !boxRef.current) return;
    // Cópia local: o guard acima não estreita o tipo dentro da closure do then.
    const sitekey = TURNSTILE_SITE_KEY;
    let vivo = true;

    carregarTurnstile().then((api) => {
      if (!vivo || !api || !boxRef.current || widgetId.current) return;
      widgetId.current = api.render(boxRef.current, {
        sitekey,
        size: 'flexible',
        action: 'tool-lead',
        callback: (t) => {
          token.current = t;
        },
        'error-callback': () => {
          token.current = '';
        },
        // Token do Turnstile expira: sem limpar, um formulário aberto há muito
        // tempo enviaria um token morto e o visitante veria erro sem entender.
        'expired-callback': () => {
          token.current = '';
          if (widgetId.current) api.reset(widgetId.current);
        },
      });
    });

    return () => {
      vivo = false;
    };
  }, []);

  function resetarWidget() {
    token.current = '';
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: humanos não veem nem preenchem este campo.
    if (data.get('website')) {
      setStatus('ok');
      form.reset();
      return;
    }

    const origem = origemDaPagina();
    const payloadBase = {
      nome: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      origem,
      empresa: String(data.get('company') ?? '').trim(),
      whatsapp: String(data.get('whatsapp') ?? '').trim(),
      lgpdConsent: data.get('consent') === 'on',
      contexto: contextoDaSessao(context),
    };

    // Sem endpoint: caminho do mailto, como sempre foi.
    if (!LEAD_ENDPOINT) {
      abrirMailto(payloadBase);
      setStatus('ok');
      return;
    }

    setStatus('sending');
    setErroDetalhe(null);

    const resultado = await enviarLead({ ...payloadBase, turnstileToken: token.current });

    if (resultado.ok) {
      setStatus('ok');
      form.reset();
      track('lead_enviado', { origem });
      return;
    }

    // Token é de uso único: qualquer falha exige um novo antes de tentar de novo.
    resetarWidget();
    setStatus('error');
    setErroDetalhe(
      resultado.motivo === 'anti-robo'
        ? d.errorAntiRobo
        : null,
    );
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
          {/* Widget do Turnstile — preenchido pelo efeito acima */}
          <div ref={boxRef} className="turnstile-box" />
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? d.sending : d.submit}
          </button>
          {status === 'error' ? (
            <p className="help" role="alert">
              {erroDetalhe ?? d.error}
            </p>
          ) : null}
          <p className="help">{d.privacy}</p>
        </form>
      )}
    </div>
  );
}
