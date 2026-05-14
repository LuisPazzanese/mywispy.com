import { en } from './en';
import { pt } from './pt';
import type { LangCode, Translations } from './types';

export { en, pt };
export type { LangCode, Translations };

export const translations: Record<LangCode, Translations> = { en, pt };

export const DEFAULT_LANG: LangCode = 'en';

export function isLangCode(value: unknown): value is LangCode {
  return value === 'en' || value === 'pt';
}
