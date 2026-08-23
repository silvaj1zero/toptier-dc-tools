import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ferramentas.toptier.net.br',
  integrations: [react(), sitemap()],
  // i18n: dicionário EN existe em src/i18n/en.ts, mas as rotas /en/ ainda não foram
  // publicadas — o config declara só pt-br até lá (roadmap: relatório best-of-breed).
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
