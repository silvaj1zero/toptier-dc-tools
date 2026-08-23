/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Endpoint de captura de leads (Formspree ou similar). Ausente ⇒ fallback mailto:. */
  readonly PUBLIC_LEAD_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
