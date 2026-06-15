/**
 * Locale configuration shared across server and client. Kept dependency-free so
 * it can be imported from the proxy, server components and client components
 * alike.
 */
export const locales = ["en", "es", "pt"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Human labels for the language switcher. */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** The locale segment of a pathname, or null if it isn't locale-prefixed. */
export function localeFromPathname(pathname: string): Locale | null {
  const seg = pathname.split("/")[1] ?? "";
  return isLocale(seg) ? seg : null;
}
