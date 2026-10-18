import { AREA_IDS, QUESTION_DEFS, type Area, type Question } from "../lib/questions";
import { en } from "./en";
import { pl } from "./pl";
import { LANGS, type Lang, type Messages } from "./types";

export { LANGS, type Lang, type Messages, type ThemeChoice } from "./types";

export const DEFAULT_LANG: Lang = "en";

const catalogs: Record<Lang, Messages> = { en, pl };

/** A language's messages together with the neutral question structure joined to its wording. */
export interface Locale {
  lang: Lang;
  m: Messages;
  areas: Area[];
  questions: Question[];
}

const cache = new Map<Lang, Locale>();

export function getLocale(lang: Lang): Locale {
  let locale = cache.get(lang);
  if (!locale) {
    const m = catalogs[lang];
    locale = {
      lang,
      m,
      areas: AREA_IDS.map((id) => ({ id, ...m.areas[id] })),
      questions: QUESTION_DEFS.map((def) => ({ ...def, ...m.questions[def.id] })),
    };
    cache.set(lang, locale);
  }
  return locale;
}

export const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

/** English lives at the site root; every other language under its own prefix. */
export const langPath = (lang: Lang): string => (lang === DEFAULT_LANG ? "/" : `/${lang}/`);
