import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireUser } from "@/lib/auth/session";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getCvDetailCached } from "@/lib/cv/cv-reads";
import { EditorShell } from "@/components/editor/editor-shell";

export default async function EditorPage({ params }: { params: Promise<{ cvId: string }> }) {
  const { cvId } = await params;
  const user = await requireUser(`/editor/${cvId}`);

  // Read through the cached layer (already normalized to the schema shape), 404
  // if missing, then seed React Query so the client store hydrates without a flash.
  const cv = await getCvDetailCached(user.id, cvId);
  if (!cv) notFound();

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.cvs.detail(cvId), cv);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditorShell cvId={cvId} />
    </HydrationBoundary>
  );
}
