/**
 * CTAs de serviço do tema PUE, apontando para o site institucional da Top Tier.
 * Sem parâmetros UTM: o repo não tem padrão de UTM em links de saída (lead.ts só LÊ utm_* de entrada).
 *
 * Papéis: TOP EFFICIENCY é o CTA principal (falar com especialistas); TOP SITE e TOP PRACTICES
 * acompanham a linha "Medir PUE do jeito certo é prática de operação".
 */
export const SERVICE_CTA = {
  introPt: 'Medir PUE do jeito certo é prática de operação.',
  introEn: 'Measuring PUE the right way is an operating practice.',
  efficiency: {
    id: 'top-efficiency',
    name: 'TOP EFFICIENCY',
    descPt: 'avaliar e recomendar melhorias de eficiência energética',
    descEn: 'assess and recommend energy-efficiency improvements',
    leadPt: 'Quer sair da faixa de comparação e saber o que melhorar no seu data center? Fale com os especialistas em',
    leadEn: 'Want to go beyond the comparison range and know what to improve in your data center? Talk to the specialists in',
    url: 'https://toptier.net.br/servicos#top-efficiency',
  },
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
