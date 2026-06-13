/**
 * Centralized `use cache` tag factory.
 *
 * Tags are attached to cached reads via `cacheTag(...)` (see the `*-reads.ts`
 * modules) and invalidated from Server Actions via `updateTag(...)` for
 * read-your-own-writes. Keeping every tag string in one place guarantees the
 * read side and the write side can never drift apart.
 *
 * Per-user tags take the `userId` so one user's mutation never busts another
 * user's cached list.
 */
export const tags = {
  /** A user's full CV list (dashboard). */
  cvList: (userId: string) => `cvs:list:${userId}`,
  /** A single CV document (editor detail). */
  cv: (cvId: string) => `cv:${cvId}`,
  /** A CV's public-share state (share dialog). */
  shareInfo: (cvId: string) => `cv:share:${cvId}`,
  /** A user's asset list. */
  assetList: (userId: string) => `assets:list:${userId}`,
  /** A user's active session list. */
  sessionList: (userId: string) => `sessions:list:${userId}`,
} as const;
