import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";
import { makeTranslator, type Translator } from "./translate";

/** Resolve the active locale from a route's `params`, defaulting to English when
 * the `lang` segment is missing or unsupported. */
export function localeFromParams(lang: string): Locale {
  return isLocale(lang) ? lang : defaultLocale;
}

/** Convenience: a translator built from a route's `{ lang }` params. */
export async function getTFromParams(params: Promise<{ lang: string }>): Promise<Translator> {
  const { lang } = await params;
  return getT(localeFromParams(lang));
}

/**
 * Locale from the `NEXT_LOCALE` cookie (set by the proxy). Use this only in
 * server components that don't receive the `lang` route param; prefer the param
 * when available, since reading cookies opts the component into dynamic
 * rendering.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("NEXT_LOCALE")?.value;
  return value && isLocale(value) ? value : defaultLocale;
}

/** A server-side translator for the given locale. */
export async function getT(locale: Locale): Promise<Translator> {
  return makeTranslator(await getDictionary(locale));
}
