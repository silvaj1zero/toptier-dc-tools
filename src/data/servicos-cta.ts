/**
 * CTA de serviço do tema PUE: aponta para os serviços TOP SITE e TOP PRACTICES do site institucional.
 * Sem parâmetros UTM: o repo não tem padrão de UTM em links de saída (lead.ts só LÊ utm_* de entrada).
 */
export const SERVICE_CTA = {
  introPt: 'Medir PUE do jeito certo é prática de operação.',
  introEn: 'Measuring PUE the right way is an operating practice.',
  links: [
    {
      id: 'top-site',
      name: 'TOP SITE',
      descPt: 'avaliação de facilities e medição de parâmetros de desempenho',
      descEn: 'facilities assessment and performance-parameter measurement',
      url: 'https://toptier.net.br/servicos#top-site',
    },
    {
      id: 'top-practices',
      name: 'TOP PRACTICES',
      descPt: 'avaliação e qualificação do método de operação',
      descEn: 'assessment and qualification of the operating method',
      url: 'https://toptier.net.br/servicos#top-practices',
    },
  ],
} as const;
