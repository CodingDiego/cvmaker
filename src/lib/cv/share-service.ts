import "server-only";
import { cacheTag, cacheLife } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cvs, type Cv } from "@/db/schema";
import { tags } from "@/lib/cache-tags";
import { renderPdf } from "@/templates/render/pdf";
import { renderDocx } from "@/templates/render/docx";
import { putToStore, delFromStore } from "@/lib/blob";
import { serializeShareParams } from "@/lib/cv/share-search-params";
import { resumeSchema } from "@/lib/cv/types";
import { env } from "@/lib/env";

/**
 * Public CV sharing. A shared CV has its PDF + DOCX rendered into the PUBLIC
 * blob store and is viewable (and downloadable) by anyone at
 * /share?u=[userId]&c=[cvId]. Re-sharing re-renders so the public copy always
 * matches the latest content.
 */

function slug(title: string): string {
  return (title || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resume";
}

export interface ShareInfo {
  isPublic: boolean;
  shareUrl: string | null;
  pdfUrl: string | null;
  docxUrl: string | null;
}

export function shareUrlFor(userId: string, cvId: string): string {
  return `${env.appUrl()}${serializeShareParams("/share", { u: userId, c: cvId })}`;
}

export async function getShareInfo(userId: string, cvId: string): Promise<ShareInfo | null> {
  const [row] = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .limit(1);
  if (!row) return null;
  return {
    isPublic: row.isPublic,
    shareUrl: row.isPublic ? shareUrlFor(userId, cvId) : null,
    pdfUrl: row.publicPdfUrl,
    docxUrl: row.publicDocxUrl,
  };
}

async function safeDel(url: string | null) {
  if (!url) return;
  try {
    await delFromStore("public", url);
  } catch {
    // Best-effort cleanup of the previous public copy.
  }
}

/** Render the CV to the public store and mark it public. Idempotent (re-syncs). */
export async function shareCv(userId: string, cvId: string): Promise<ShareInfo> {
  if (!env.hasPublicBlob()) {
    throw new Error("Public Blob store is not configured (PUBLIC_READ_WRITE_TOKEN / PUBLIC_STORE_ID).");
  }
  const [row] = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .limit(1);
  if (!row) throw new Error("CV not found");

  const opts = { templateId: row.templateId, accentColor: row.accentColor, fontFamily: row.fontFamily };
  const data = resumeSchema.parse(row.data);
  const [pdf, docx] = await Promise.all([renderPdf(data, opts), renderDocx(data, opts)]);
  const base = `public/cv/${userId}/${cvId}/${slug(row.title)}`;

  // Drop any previous public copies before uploading fresh ones.
  await Promise.all([safeDel(row.publicPdfUrl), safeDel(row.publicDocxUrl)]);

  const [pdfBlob, docxBlob] = await Promise.all([
    putToStore("public", `${base}.pdf`, pdf, { contentType: "application/pdf", addRandomSuffix: true }),
    putToStore("public", `${base}.docx`, docx, {
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      addRandomSuffix: true,
    }),
  ]);

  await db
    .update(cvs)
    .set({
      isPublic: true,
      publicPdfUrl: pdfBlob.url,
      publicDocxUrl: docxBlob.url,
      sharedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)));

  return {
    isPublic: true,
    shareUrl: shareUrlFor(userId, cvId),
    pdfUrl: pdfBlob.url,
    docxUrl: docxBlob.url,
  };
}

/** Make a CV private again and remove its public copies. */
export async function unshareCv(userId: string, cvId: string): Promise<void> {
  const [row] = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .limit(1);
  if (!row) return;
  await Promise.all([safeDel(row.publicPdfUrl), safeDel(row.publicDocxUrl)]);
  await db
    .update(cvs)
    .set({ isPublic: false, publicPdfUrl: null, publicDocxUrl: null, sharedAt: null, updatedAt: new Date() })
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)));
}

/**
 * Public read used by the share page — only returns the CV if it's public.
 *
 * `use cache: remote` (not plain `use cache`): the share page is fully dynamic
 * (it reads the `u`/`c` searchParams), so this read runs at request time, where
 * an in-memory cache barely hits — every serverless instance has its own memory.
 * A remote cache is shared across all instances/regions, so a link that gets
 * traffic is served from one durable entry instead of hammering Postgres. The
 * content is public and identical for every viewer, and it's keyed only by
 * (userId, cvId) — few unique values per link — so utilization is high.
 *
 * Freshness is driven by the `cv:<id>` tag, not the TTL: editing, re-sharing and
 * unsharing all `updateTag(tags.cv(cvId))`, so an unshared/edited CV is evicted
 * immediately. Hence the long `cacheLife` — it maximizes DB offload safely.
 */
export async function getPublicCv(userId: string, cvId: string): Promise<Cv | null> {
  "use cache: remote";
  cacheTag(tags.cv(cvId));
  cacheLife("days");

  const [row] = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId), eq(cvs.isPublic, true)))
    .limit(1);
  if (!row) return null;
  // Normalize legacy/partial documents so the public preview renders correctly.
  return { ...row, data: resumeSchema.parse(row.data) };
}
