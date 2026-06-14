import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublicCv } from "@/lib/cv/share-service";
import { getTemplate } from "@/templates/registry";
import { ShareView } from "./share-view";

type Params = Promise<{ userId: string; cvId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { userId, cvId } = await params;
  const cv = await getPublicCv(userId, cvId);
  if (!cv) return {};

  const name = cv.data.header?.fullName || cv.title || "Resume";
  const role = cv.data.header?.title;
  const title = role ? `${name} - ${role}` : name;
  const description =
    cv.data.summary?.trim() ||
    `${name}'s resume${role ? `, ${role}` : ""} - built with CVMaker.`;
  const canonical = `/share/${userId}/${cvId}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    // Public, but a personal resume — keep it out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function SharedCvPage({ params }: { params: Params }) {
  // generateMetadata for this route reads `params` (runtime data), so under Cache
  // Components its metadata defers to request time. Opting the page into request-
  // time rendering too keeps the two consistent and avoids the build-time
  // next-prerender-dynamic-metadata mismatch.
  await connection();
  const { userId, cvId } = await params;
  const cv = await getPublicCv(userId, cvId);
  if (!cv) notFound();

  const tokens = getTemplate(cv.templateId);

  return <ShareView userId={userId} cvId={cvId} cv={cv} tokens={tokens} />;
}
