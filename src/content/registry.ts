import type { LanguagePack } from "./types.ts";
import { spanish } from "./es/index.ts";
import { english } from "./en/index.ts";
import { greek } from "./el/index.ts";

/**
 * Alle talen die de app kent. Eén regel erbij = één taal erbij; de engine
 * leest verder alleen wat er in het LanguagePack staat.
 */
export const LANGUAGES: Record<string, LanguagePack> = {
  es: spanish,
  en: english,
  el: greek,
};

export const DEFAULT_LANGUAGE = "es";

export function getLanguage(code: string): LanguagePack {
  return LANGUAGES[code] ?? LANGUAGES[DEFAULT_LANGUAGE];
}

export const languageList = () => Object.values(LANGUAGES);
