/**
 * Envio de leads da suíte — canal único.
 *
 * Todo lead (formulário das ferramentas e gate do FOMM) sai por aqui, para a
 * Pages Function `/api/tool-lead` do site institucional, que valida o Turnstile
 * e entrega via Resend na mesma caixa dos formulários do site. Antes disso a
 * suíte usava Formspree e o site usava Resend: dois canais desconectados, e
 * quem conferia lead precisava olhar dois lugares.
 * [F-4 do ADR-FOMM-FRONTEIRA]
 *
 * Sem `PUBLIC_TOOL_LEAD_ENDPOINT` configurada, degrada para `mailto:` — o mesmo
 * princípio de antes: o visitante nunca fica sem caminho.
 */

export interface LeadPayload {
  nome: string;
  email: string;
  /** Slug da ferramenta de origem — obrigatório do lado do servidor. */
  origem: string;
  empresa?: string;
  whatsapp?: string;
  mensagem?: string;
  lgpdConsent?: boolean;
  /** Contexto livre da ferramenta: score FOMM, PUE calculado, UTMs, referrer. */
  contexto?: Record<string, string>;
  turnstileToken: string;
}

export type ResultadoEnvio =
  | { ok: true; viaFallback?: boolean }
  | { ok: false; motivo: 'sem-endpoint' | 'anti-robo' | 'rede' | 'servidor' };

/** `.trim()` pelo mesmo motivo do site key — ver src/lib/turnstile.ts. */
export const LEAD_ENDPOINT: string | undefined =
  import.meta.env.PUBLIC_TOOL_LEAD_ENDPOINT?.trim() || undefined;

/**
 * Canal ANTIGO (Formspree), mantido como rede de segurança da transição.
 *
 * Por que ele ainda existe: a validação de hostname do Turnstile só acontece
 * no servidor, na hora de verificar o token — não dá para provar por teste
 * automatizado que um token emitido em `ferramentas.toptier.net.br` é aceito
 * (navegador automatizado não recebe token; é limitação conhecida, registrada
 * no handoff do site). Enquanto não houver uma confirmação humana de um envio
 * real, um lead que falhe no canal novo não pode simplesmente evaporar.
 *
 * REMOVER quando houver confirmação de envio real pelo canal novo. O evento
 * `lead_fallback` no painel mostra se este caminho está sendo usado — se ele
 * aparecer, o canal novo está recusando leads de gente de verdade.
 */
const FALLBACK_ENDPOINT: string | undefined =
  import.meta.env.PUBLIC_LEAD_ENDPOINT?.trim() || undefined;

/** Reenvia ao canal antigo no formato que ele espera (FormData). */
async function enviarPeloFallback(payload: LeadPayload): Promise<boolean> {
  if (!FALLBACK_ENDPOINT) return false;
  try {
    const data = new FormData();
    data.set('name', payload.nome);
    data.set('email', payload.email);
    data.set('origem', payload.origem);
    if (payload.empresa) data.set('company', payload.empresa);
    if (payload.whatsapp) data.set('whatsapp', payload.whatsapp);
    if (payload.mensagem) data.set('mensagem', payload.mensagem);
    data.set('autoriza_contato', payload.lgpdConsent ? 'sim' : 'nao');
    for (const [k, v] of Object.entries(payload.contexto ?? {})) data.set(k, v);
    // Marca explícita: no destino, dá para ver que este lead só chegou porque
    // o canal novo falhou.
    data.set('canal', 'fallback-formspree');

    const res = await fetch(FALLBACK_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Reúne os metadados de atribuição da sessão (página, referrer, UTMs).
 * Sempre strings — o servidor descarta o que não for escalar.
 */
export function contextoDaSessao(extra?: Record<string, string>): Record<string, string> {
  const contexto: Record<string, string> = { ...extra };
  if (typeof window === 'undefined') return contexto;

  const url = new URL(window.location.href);
  contexto['pagina'] = url.pathname;
  if (document.referrer) contexto['referrer'] = document.referrer;
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const v = url.searchParams.get(k);
    if (v) contexto[k] = v;
  }
  return contexto;
}

/** Slug da ferramenta a partir do caminho: `/calculadora-pue/` → `calculadora-pue`. */
export function origemDaPagina(): string {
  if (typeof window === 'undefined') return 'desconhecida';
  return window.location.pathname.replaceAll('/', '') || 'home';
}

/**
 * Envia o lead. Distingue os motivos de falha porque eles pedem mensagens
 * diferentes ao visitante: token recusado pede "recarregue e tente de novo",
 * falha de servidor pede "tente mais tarde ou escreva para a gente".
 */
export async function enviarLead(payload: LeadPayload): Promise<ResultadoEnvio> {
  if (!LEAD_ENDPOINT) {
    // Sem canal novo: tenta o antigo antes de desistir.
    if (await enviarPeloFallback(payload)) return { ok: true, viaFallback: true };
    return { ok: false, motivo: 'sem-endpoint' };
  }

  let motivo: 'anti-robo' | 'rede' | 'servidor';
  try {
    const res = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) return { ok: true };
    // 403 = token recusado ou ausente (o servidor não distingue de propósito).
    motivo = res.status === 403 ? 'anti-robo' : 'servidor';
  } catch {
    // Rede caída, CORS barrado, requisição abortada.
    motivo = 'rede';
  }

  // Canal novo recusou. Antes de mostrar erro a uma pessoa real, tenta o canal
  // antigo — perder o lead é pior que mantê-lo temporariamente em dois lugares.
  if (await enviarPeloFallback(payload)) return { ok: true, viaFallback: true };

  return { ok: false, motivo };
}

/** Fallback histórico: abre o cliente de e-mail com tudo preenchido. */
export function abrirMailto(payload: Omit<LeadPayload, 'turnstileToken'>): void {
  if (typeof window === 'undefined') return;
  const assunto = encodeURIComponent(`Contato — Top Tools (${payload.origem})`);
  const extras = Object.entries(payload.contexto ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const corpo = encodeURIComponent(
    [
      `Nome: ${payload.nome}`,
      `E-mail: ${payload.email}`,
      payload.empresa ? `Empresa: ${payload.empresa}` : '',
      payload.whatsapp ? `WhatsApp: ${payload.whatsapp}` : '',
      payload.mensagem ? `\nMensagem:\n${payload.mensagem}` : '',
      extras ? `\n${extras}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );
  window.location.href = `mailto:contato@toptier.net.br?subject=${assunto}&body=${corpo}`;
}
