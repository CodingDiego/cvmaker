import { Suspense } from "react";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { shareSearchParamsCache } from "@/lib/cv/share-search-params";
import { getPublicCv } from "@/lib/cv/share-service";
import { getTemplate } from "@/templates/registry";
import { ShareView } from "./share-view";
import { ShareUnavailable } from "./share-unavailable";

type PageProps = { searchParams: Promise<SearchParams> };

// Keep personal resumes out of search indexes regardless of outcome.
const baseMetadata: Metadata = { robots: { index: false, follow: true } };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { u: userId, c: cvId } = await shareSearchParamsCache.parse(searchParams);
  if (!userId || !cvId) return { ...baseMetadata, title: "Shared resume" };

  const cv = await getPublicCv(userId, cvId);
  if (!cv) return { ...baseMetadata, title: "Resume not found" };

  const name = cv.data.header?.fullName || cv.title || "Resume";
  const role = cv.data.header?.title;
  const title = role ? `${name} - ${role}` : name;
  const description =
    cv.data.summary?.trim() ||
    `${name}'s resume${role ? `, ${role}` : ""} - built with CVMaker.`;

  return {
    ...baseMetadata,
    title,
    description,
    openGraph: { type: "profile", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function SharedCvPage({ searchParams }: PageProps) {
  // The resolved view depends on `searchParams` + a DB read, so it's dynamic.
  // Keeping that work inside <Suspense> is what opts the route into dynamic
  // rendering (Cache Components) and lets the dynamic `generateMetadata` stream
  // instead of failing the build (next-prerender-dynamic-metadata).
  return (
    <Suspense fallback={<div className="min-h-svh" aria-hidden />}>
      <ShareResolver searchParams={searchParams} />
    </Suspense>
  );
}

async function ShareResolver({ searchParams }: PageProps) {
  const { u: userId, c: cvId } = await shareSearchParamsCache.parse(searchParams);

  if (!userId || !cvId) return <ShareUnavailable reason="missing-params" />;

  // getPublicCv only returns the row when (userId, cvId) match AND the CV is
  // public, so a wrong/swapped id can never expose someone else's private CV.
  const cv = await getPublicCv(userId, cvId);
  if (!cv) return <ShareUnavailable reason="not-public" />;

  const tokens = getTemplate(cv.templateId);

  return <ShareView userId={userId} cvId={cvId} cv={cv} tokens={tokens} />;
}
