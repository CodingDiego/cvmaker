import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";
import { makeTranslator, type Translator } from "./translate";

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
