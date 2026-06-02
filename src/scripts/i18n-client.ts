// Client-side language switching for mywispy.com.
//
// Markup contract:
//   <h2 data-i18n="sections.about">about</h2>
//     → element.textContent gets replaced.
//
//   <p data-i18n-html="about.body">...trusted markup...</p>
//     → element.innerHTML gets replaced. Only use for strings authored in
//       i18n/{en,pt}.ts (never user input).
//
//   <title data-i18n="meta.title">...</title>
//     → also covers <meta> tags via [data-i18n-attr="content"] below.
//
//   <meta name="description" data-i18n="meta.description" data-i18n-attr="content">
//     → element.setAttribute(attr, value) instead of textContent.
//
//   <button data-i18n-aria="meta.langToggleAria">
//     → element.setAttribute('aria-label', value).
//
// Adding a new key: extend the translations files, add data-i18n to the markup.

import { translations, isLangCode, DEFAULT_LANG, SSR_LANG, type LangCode } from '../data/i18n';

const STORAGE_KEY = 'mywispy-lang';
const SWITCH_CLASS = 'lang-switching';
const SWITCH_MS = 180;

function getValue(lang: LangCode, path: string): string | undefined {
  // Walk the dotted path against the translations tree. Returns undefined if
  // any segment is missing — caller skips the swap in that case so partial
  // translations never blank out the page.
  const segs = path.split('.');
  let node: unknown = translations[lang];
  for (const s of segs) {
    if (node && typeof node === 'object' && s in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[s];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

function applyLang(lang: LangCode): void {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  // textContent swaps
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const key = el.dataset.i18n;
    if (!key) continue;
    const value = getValue(lang, key);
    if (value === undefined) continue;
    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, value);
    } else if (el.tagName === 'TITLE') {
      document.title = value;
    } else {
      el.textContent = value;
    }
  }

  // innerHTML swaps (only for strings authored in our own i18n files)
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n-html]')) {
    const key = el.dataset.i18nHtml;
    if (!key) continue;
    const value = getValue(lang, key);
    if (value !== undefined) el.innerHTML = value;
  }

  // aria-label swaps
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n-aria]')) {
    const key = el.dataset.i18nAria;
    if (!key) continue;
    const value = getValue(lang, key);
    if (value !== undefined) el.setAttribute('aria-label', value);
  }

  // Update toggle button state
  for (const btn of document.querySelectorAll<HTMLButtonElement>('.lang__btn')) {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  }
}

function readStoredLang(): LangCode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLangCode(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function storeLang(lang: LangCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode / storage disabled — ignore, in-memory toggle still works */
  }
}

function switchTo(lang: LangCode, animate: boolean): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!animate || reduced) {
    applyLang(lang);
    storeLang(lang);
    return;
  }
  document.body.classList.add(SWITCH_CLASS);
  window.setTimeout(() => {
    applyLang(lang);
    storeLang(lang);
    // Force a paint while opacity is 0, then fade back in.
    requestAnimationFrame(() => {
      document.body.classList.remove(SWITCH_CLASS);
    });
  }, SWITCH_MS);
}

function init(): void {
  // The pre-paint inline script in <head> already set lang on <html>. We
  // re-apply here so all [data-i18n] nodes pick up the resolved choice.
  // The server renders SSR_LANG, so only swap when the target differs.
  const initial = readStoredLang();
  if (initial !== SSR_LANG) applyLang(initial);

  for (const btn of document.querySelectorAll<HTMLButtonElement>('.lang__btn')) {
    btn.addEventListener('click', () => {
      const target = btn.dataset.lang;
      if (!isLangCode(target)) return;
      const currentLang = document.documentElement.lang.startsWith('pt') ? 'pt' : 'en';
      if (target === currentLang) return;
      switchTo(target, true);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
