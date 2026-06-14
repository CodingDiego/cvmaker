import { createSearchParamsCache, createSerializer, parseAsString } from "nuqs/server";

/**
 * Query-param contract for the public share page (`/share`).
 *
 * A shared CV is addressed by `?u=<userId>&c=<cvId>` instead of dynamic path
 * segments. Both are required; `getPublicCv` enforces that the pair actually
 * matches a *public* CV owned by that user, so guessing/swapping ids only ever
 * resolves to a CV the owner has explicitly published.
 */
export const shareSearchParams = {
  u: parseAsString.withDefault(""),
  c: parseAsString.withDefault(""),
};

export const shareSearchParamsCache = createSearchParamsCache(shareSearchParams);

/** Build a `/share?u=…&c=…` URL (SSR-safe, no hooks). */
export const serializeShareParams = createSerializer(shareSearchParams);
