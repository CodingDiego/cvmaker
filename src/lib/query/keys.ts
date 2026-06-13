/**
 * Hierarchical React Query key factory.
 *
 * The same keys are used for server prefetch (`prefetchQuery`/`setQueryData`),
 * client reads (`useQuery`) and post-mutation invalidation
 * (`invalidateQueries`) — so they must come from one place. Keys are nested
 * (`entity -> kind -> id`) so a broad invalidation (e.g. `queryKeys.cvs.all`)
 * can clear everything under an entity when needed.
 */
export const queryKeys = {
  cvs: {
    all: ["cvs"] as const,
    list: () => ["cvs", "list"] as const,
    detail: (cvId: string) => ["cvs", "detail", cvId] as const,
    share: (cvId: string) => ["cvs", "share", cvId] as const,
  },
  assets: {
    all: ["assets"] as const,
    list: () => ["assets", "list"] as const,
  },
  sessions: {
    all: ["sessions"] as const,
    list: () => ["sessions", "list"] as const,
  },
  exports: {
    all: ["exports"] as const,
    detail: (exportId: string) => ["exports", exportId] as const,
  },
} as const;
