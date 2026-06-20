import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireUser } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getCvDetailCached } from "@/lib/cv/cv-reads";
import { getUserPlan } from "@/lib/billing/entitlements-server";
import { EditorShell } from "@/components/editor/editor-shell";

// Auth-gated, per-user editor: inherently fully dynamic with no static shell.
// Opt out of instant/static-shell validation so the route builds under Cache
// Components (next-prerender-dynamic-metadata).
export const unstable_instant = false;

export default async function EditorPage({ params }: { params: Promise<{ cvId: string }> }) {
  const { cvId } = await params;
  if (!cvId) notFound();

  const user = await requireUser(`/editor/${cvId}`);

  // Read through the cached layer (already normalized to the schema shape), 404
  // if missing, then seed React Query so the client store hydrates without a flash.
  const [cv, plan] = await Promise.all([
    getCvDetailCached(user.id, cvId),
    getUserPlan(user.id),
  ]);
  if (!cv) notFound();

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.cvs.detail(cvId), cv);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditorShell cvId={cvId} plan={plan} />
    </HydrationBoundary>
  );
}
