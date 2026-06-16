/**
 * Validate a post-auth `?next=` redirect target. Only same-origin, absolute app
 * paths are allowed — anything else (protocol-relative `//evil.com`, absolute
 * URLs, or empty) falls back to the dashboard. Shared by every auth form so the
 * "use this template" intent survives login ⇄ register switching without ever
 * becoming an open redirect.
 */
export const DEFAULT_NEXT = "/dashboard";

export function safeNext(value: string | null | undefined): string {
  if (!value) return DEFAULT_NEXT;
  // Must be an absolute path, and must NOT be protocol-relative ("//host") or a
  // full URL ("https://", "javascript:").
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_NEXT;
  if (value.includes("://") || value.includes("\\")) return DEFAULT_NEXT;
  return value;
}

/** Build a sibling auth link that carries the current `next` only when it's a
 * real intent (not the default), keeping URLs clean for plain visits. */
export function withNext(path: string, next: string): string {
  return next === DEFAULT_NEXT ? path : `${path}?next=${encodeURIComponent(next)}`;
}
