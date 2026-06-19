import "server-only";
import { headers } from "next/headers";
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
 * Locale from the request host's locale subdomain (`es.free-cv.com` → `es`).
 * Use this only in server components that don't receive the `lang` route param
 * (e.g. `not-found.tsx`, which gets no params); prefer the param when available,
 * since reading `headers()` opts the component into dynamic rendering.
 */
export async function getLocale(): Promise<Locale> {
  const host = (await headers()).get("host") ?? "";
  const sub = host.split(".")[0] ?? "";
  return isLocale(sub) ? sub : defaultLocale;
}

/** A server-side translator for the given locale. */
export async function getT(locale: Locale): Promise<Translator> {
  return makeTranslator(await getDictionary(locale));
}
