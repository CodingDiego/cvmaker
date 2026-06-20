import type { LinkProps } from "next/link";

export function resolveLinkPrefetch(
  prefetch: LinkProps["prefetch"],
): LinkProps["prefetch"] {
  return prefetch;
}
