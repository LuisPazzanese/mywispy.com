import { en } from './en';
import { pt } from './pt';
import type { LangCode, Translations } from './types';

export { en, pt };
export type { LangCode, Translations };

export const translations: Record<LangCode, Translations> = { en, pt };

// Language the server renders into the static HTML (components import `en`).
// Crawlers and no-JS visitors see this; the client swaps to DEFAULT_LANG on load.
export const SSR_LANG: LangCode = 'en';

// Preference applied for first-time visitors with no stored choice.
export const DEFAULT_LANG: LangCode = 'pt';

export function isLangCode(value: unknown): value is LangCode {
  return value === 'en' || value === 'pt';
}
