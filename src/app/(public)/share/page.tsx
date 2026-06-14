import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { shareSearchParamsCache } from "@/lib/cv/share-search-params";
import { getPublicCv } from "@/lib/cv/share-service";
import { getTemplate } from "@/templates/registry";
import { ShareView } from "./share-view";
import { ShareUnavailable } from "./share-unavailable";

type PageProps = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { u: userId, c: cvId } = await shareSearchParamsCache.parse(searchParams);

  // Keep personal resumes out of search indexes regardless of outcome.
  const base: Metadata = { robots: { index: false, follow: true } };

  if (!userId || !cvId) return { ...base, title: "Shared resume" };

  const cv = await getPublicCv(userId, cvId);
  if (!cv) return { ...base, title: "Resume not found" };

  const name = cv.data.header?.fullName || cv.title || "Resume";
  const role = cv.data.header?.title;
  const title = role ? `${name} - ${role}` : name;
  const description =
    cv.data.summary?.trim() ||
    `${name}'s resume${role ? `, ${role}` : ""} - built with CVMaker.`;

  return {
    ...base,
    title,
    description,
    openGraph: { type: "profile", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedCvPage({ searchParams }: PageProps) {
  const { u: userId, c: cvId } = await shareSearchParamsCache.parse(searchParams);

  if (!userId || !cvId) return <ShareUnavailable reason="missing-params" />;

  // getPublicCv only returns the row when (userId, cvId) match AND the CV is
  // public, so a wrong/swapped id can never expose someone else's private CV.
  const cv = await getPublicCv(userId, cvId);
  if (!cv) return <ShareUnavailable reason="not-public" />;

  const tokens = getTemplate(cv.templateId);

  return <ShareView userId={userId} cvId={cvId} cv={cv} tokens={tokens} />;
}
