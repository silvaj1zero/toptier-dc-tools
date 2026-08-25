/**
 * Turnstile em componente React — renderização EXPLÍCITA.
 *
 * Por que explícita e não o modo implícito (`class="cf-turnstile"`) que o site
 * institucional usa: lá o formulário já está no HTML quando o script da
 * Cloudflare carrega e varre o DOM. Aqui os formulários são React e só existem
 * depois da hidratação — a varredura acontece antes e o widget nunca apareceria.
 * Por isso o script é carregado com `?render=explicit` e o widget é criado à mão
 * quando o container já existe.
 *
 * O site key é PÚBLICO por natureza (fica visível no HTML de qualquer página que
 * use Turnstile). O que é secreto é a chave de validação, e ela vive só na Pages
 * Function do site — nunca neste bundle.
 */

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
      size?: 'normal' | 'compact' | 'flexible';
      action?: string;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Uma única promessa de carga por página — N formulários não baixam N scripts. */
let carregando: Promise<TurnstileApi | null> | null = null;

/**
 * Carrega o script da Cloudflare uma vez e resolve com a API.
 *
 * Resolve com `null` (nunca rejeita) quando o script não carrega — bloqueador,
 * rede caída, offline. Quem chama decide o que fazer; travar o formulário por
 * causa disso seria trocar um problema de anti-robô por um lead perdido.
 */
export function carregarTurnstile(): Promise<TurnstileApi | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (carregando) return carregando;

  carregando = new Promise<TurnstileApi | null>((resolve) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    const script = existente ?? document.createElement('script');

    const aoCarregar = () => resolve(window.turnstile ?? null);

    if (!existente) {
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', aoCarregar);
      script.addEventListener('error', () => resolve(null));
      document.head.appendChild(script);
    } else {
      // Script já injetado por outro formulário: pode ou não ter terminado.
      if (window.turnstile) resolve(window.turnstile);
      else {
        existente.addEventListener('load', aoCarregar);
        existente.addEventListener('error', () => resolve(null));
      }
    }
  });

  return carregando;
}

/**
 * Site key público, vindo do build. Ausente ⇒ sem anti-robô configurado.
 *
 * `.trim()` não é decoração: um valor colado com espaço ou salvo com quebra de
 * linha no painel de env chega aqui com o lixo junto, e o Turnstile recusa com
 * `Invalid input for parameter "sitekey"` — falha que só aparece no console do
 * navegador, em produção. Aconteceu em 25/08.
 */
export const TURNSTILE_SITE_KEY: string | undefined =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
