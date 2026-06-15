"use client";

import NextLink, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, useCallback } from "react";
import { getQueryClient } from "@/lib/query/client";
import { prefetchForPath } from "@/lib/query/prefetch-registry";
import { defaultLocale, isLocale, localeFromPathname, type Locale } from "@/i18n/config";
import { useOptionalLocale } from "@/i18n/provider";

/**
 * App-default Link.
 *
 * Wraps next/link with two behaviors:
 *  - Locale prefixing: internal string hrefs ("/templates") are rewritten to the
 *    active locale ("/es/templates"), so in-app navigation keeps the user's
 *    language without relying on a proxy redirect hop. Already-localized,
 *    external, hash and mailto hrefs are left untouched.
 *  - Intent-based prefetching: nothing is fetched until hover/focus, then BOTH
 *    the Next.js route and the React Query data for the destination are warmed
 *    (the latter keyed on the locale-stripped path, see prefetch-registry).
 *
 * Prefer this over `next/link` for in-app navigation.
 */

const prefetched = new Set<string>();

function localizeHref(href: LinkProps["href"], locale: Locale): LinkProps["href"] {
  if (typeof href !== "string") return href;
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (localeFromPathname(href)) return href; // already has a locale prefix
  return `/${locale}${href === "/" ? "" : href}`;
}

/** Drop a leading locale segment so the prefetch registry matches its keys. */
function stripLocale(path: string): string {
  const seg = path.split("/")[1] ?? "";
  if (!isLocale(seg)) return path;
  const rest = "/" + path.split("/").slice(2).join("/");
  return rest === "/" ? "/" : rest.replace(/\/+$/, "");
}

type Props = Omit<LinkProps, "prefetch"> & {
  prefetch?: boolean;
  children?: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

export const Link = forwardRef<HTMLAnchorElement, Props>(function Link(
  { href, prefetch = false, onMouseEnter, onFocus, children, ...props },
  ref,
) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useOptionalLocale() ?? localeFromPathname(pathname) ?? defaultLocale;
  const localizedHref = localizeHref(href, locale);

  const warm = useCallback(() => {
    const path = typeof localizedHref === "string" ? localizedHref : null;
    if (!path || /^(https?:)?\/\//.test(path) || path.startsWith("#") || path.startsWith("mailto:")) {
      return;
    }
    if (prefetched.has(path)) return;
    prefetched.add(path);

    try {
      router.prefetch(path);
    } catch {
      // router.prefetch can throw on malformed paths — never block navigation.
    }
    // Warm the destination's query data (registry is keyed on unlocalized paths).
    void prefetchForPath(getQueryClient(), stripLocale(path)).catch(() => {});
  }, [localizedHref, router]);

  return (
    <NextLink
      ref={ref}
      href={localizedHref}
      prefetch={prefetch}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        warm();
      }}
      onFocus={(e) => {
        onFocus?.(e);
        warm();
      }}
      {...props}
    >
      {children}
    </NextLink>
  );
});
