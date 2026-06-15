"use client";

/**
 * Renders the current year on the client. Kept out of Server Components so the
 * statically prerendered marketing pages never read the clock during render
 * (which `cacheComponents` forbids — see next-prerender-current-time).
 */
export function CurrentYear() {
  return <>{new Date().getFullYear()}</>;
}
