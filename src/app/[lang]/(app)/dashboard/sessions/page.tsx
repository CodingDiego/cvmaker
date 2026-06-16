import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireUser } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getSessionList, withCurrent } from "@/lib/auth/session-reads";
import { SessionList } from "@/components/dashboard/session-list";
import { getTFromParams } from "@/i18n/server";

export default async function SessionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const [user, t] = await Promise.all([requireUser("/dashboard/sessions"), getTFromParams(params)]);

  // Prefetch with the per-request `current` flag already applied so hydration
  // matches what GET /api/sessions returns.
  const queryClient = getQueryClient();
  const rows = await getSessionList(user.id);
  queryClient.setQueryData(queryKeys.sessions.list(), withCurrent(rows, user.sessionId));

  return (
    <section aria-labelledby="sessions-title" className="space-y-6">
      <header>
        <h1 id="sessions-title" className="text-2xl font-semibold">{t("dashboard.sessions.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.sessions.subtitle")}</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SessionList />
      </HydrationBoundary>
    </section>
  );
}
