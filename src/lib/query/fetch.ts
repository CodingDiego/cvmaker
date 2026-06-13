/**
 * Tiny JSON fetcher shared by every client `queryOptions` queryFn. Throws on a
 * non-2xx response so React Query treats it as an error (and retries per the
 * client defaults). Reads always hit our own GET route handlers, so relative
 * URLs are fine.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`);
  }
  return (await res.json()) as T;
}
