import { QueryClient, defaultShouldDehydrateQuery, environmentManager } from "@tanstack/react-query";

/**
 * Singleton-aware QueryClient factory following TanStack's Next.js App Router
 * guidance: a fresh client per request on the server, a true singleton in the
 * browser (so it survives Suspense-driven re-renders / Fast Refresh).
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // Include pending queries so streamed Suspense data hydrates correctly.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) {
    // Server: always make a new client.
    return makeQueryClient();
  }
  // Browser: reuse the singleton.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
