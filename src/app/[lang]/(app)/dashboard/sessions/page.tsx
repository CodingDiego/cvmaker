import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireUser } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getSessionList, withCurrent } from "@/lib/auth/session-reads";
import { SessionList } from "@/components/dashboard/session-list";

export default async function SessionsPage() {
  const user = await requireUser("/dashboard/sessions");

  // Prefetch with the per-request `current` flag already applied so hydration
  // matches what GET /api/sessions returns.
  const queryClient = getQueryClient();
  const rows = await getSessionList(user.id);
  queryClient.setQueryData(queryKeys.sessions.list(), withCurrent(rows, user.sessionId));

  return (
    <section aria-labelledby="sessions-title" className="space-y-6">
      <header>
        <h1 id="sessions-title" className="text-2xl font-semibold">Active sessions</h1>
        <p className="text-sm text-muted-foreground">
          Devices currently signed in to your account. Local/dev sessions are grouped to avoid
          clutter. Revoke any you don&apos;t recognize.
        </p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SessionList />
      </HydrationBoundary>
    </section>
  );
}
