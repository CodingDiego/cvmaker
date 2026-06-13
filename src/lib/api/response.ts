import "server-only";

/**
 * JSON responses for the read-only GET route handlers. Routes resolve the user
 * with `getCurrentUser()` (already React-`cache()`-deduped) and return 401
 * instead of redirecting — redirects are for page navigations, not data fetches.
 */
export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFoundJson() {
  return Response.json({ error: "Not found" }, { status: 404 });
}
