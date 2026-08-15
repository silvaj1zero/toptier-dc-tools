import { pt, type Dict } from './pt';
import { en } from './en';

export type Locale = 'pt-br' | 'en';

export const dictionaries: Record<Locale, Dict> = {
  'pt-br': pt,
  en,
};

export function t(locale: Locale): Dict {
  return dictionaries[locale] ?? pt;
}

export type { Dict };
