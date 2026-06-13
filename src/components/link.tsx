"use client";

import NextLink, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback } from "react";
import { getQueryClient } from "@/lib/query/client";
import { prefetchForPath } from "@/lib/query/prefetch-registry";

/**
 * App-default Link.
 *
 * Wraps next/link with intent-based prefetching instead of eager viewport
 * prefetching:
 *  - `prefetch={false}` by default — nothing is fetched until the user shows
 *    intent (hover or keyboard focus).
 *  - On intent, warms BOTH the Next.js route and the React Query data for the
 *    destination (via the prefetch registry).
 *  - Deduplicates per URL so repeated hovers don't refetch.
 *
 * Prefer this over `next/link` for in-app navigation.
 */

const prefetched = new Set<string>();

type Props = Omit<LinkProps, "prefetch"> & {
  prefetch?: boolean;
  children?: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

export const Link = forwardRef<HTMLAnchorElement, Props>(function Link(
  { href, prefetch = false, onMouseEnter, onFocus, children, ...props },
  ref,
) {
  const router = useRouter();

  const warm = useCallback(() => {
    // Only string hrefs participate in registry prefetch; object hrefs still get
    // the default Next behavior.
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
    // Warm the destination's query data; failures are non-fatal.
    void prefetchForPath(getQueryClient(), path).catch(() => {});
  }, [href, router]);

  return (
    <NextLink
      ref={ref}
      href={href}
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
