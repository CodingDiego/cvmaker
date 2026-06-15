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

const HAS_EXTENSION = /\.[^/]+$/;

/**
 * Whether a path is a localizable page route — i.e. eligible for an
 * `/en|/es|/pt` prefix. API routes, Next internals, well-known endpoints and any
 * path with a file extension (metadata assets like `/manifest.webmanifest`,
 * `/opengraph.png`) are NOT: prefixing them produces a broken URL. Shared by the
 * proxy (redirect logic) and the app `Link` (href localization) so both agree on
 * what counts as a page.
 */
export function isLocalizablePath(pathname: string): boolean {
  return !(
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/.well-known") ||
    HAS_EXTENSION.test(pathname)
  );
}

/** The locale segment of a pathname, or null if it isn't locale-prefixed. */
export function localeFromPathname(pathname: string): Locale | null {
  const seg = pathname.split("/")[1] ?? "";
  return isLocale(seg) ? seg : null;
}
