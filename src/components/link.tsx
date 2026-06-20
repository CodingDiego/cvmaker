"use client";

import NextLink, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback } from "react";
import { getQueryClient } from "@/lib/query/client";
import { prefetchForPath } from "@/lib/query/prefetch-registry";
import { resolveLinkPrefetch } from "./link-prefetch";

/**
 * App-default Link.
 *
 * Preserves Next.js automatic route prefetching and additionally warms React
 * Query data on hover/focus. Hrefs are bare (`/templates`) — the locale lives in
 * the host (subdomain), so no path prefixing is needed; the `app/[lang]` segment
 * is injected by the `next.config.ts` rewrite. Prefixing here would produce
 * `en.host/en/templates` → `/en/en/templates` → 404.
 *
 * Prefer this over `next/link` for in-app navigation.
 */

const prefetched = new Set<string>();

type Props = Omit<LinkProps, "prefetch"> & {
  prefetch?: LinkProps["prefetch"];
  children?: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

export const Link = forwardRef<HTMLAnchorElement, Props>(function Link(
  { href, prefetch, onMouseEnter, onFocus, children, ...props },
  ref,
) {
  const router = useRouter();

  const warm = useCallback(() => {
    const path = typeof href === "string" ? href : null;
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
    // Warm the destination's query data (registry is keyed on bare paths).
    void prefetchForPath(getQueryClient(), path).catch(() => {});
  }, [href, router]);

  return (
    <NextLink
      ref={ref}
      href={href}
      prefetch={resolveLinkPrefetch(prefetch)}
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
