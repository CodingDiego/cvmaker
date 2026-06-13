import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import type { Cv } from "@/db/schema";
import { resumeSchema } from "./types";
import { listCvs, getCv } from "./service";
import { getShareInfo, type ShareInfo } from "./share-service";
import type { CvDetail, CvListItem } from "./cv-queries";

/**
 * Cached read layer for the CV domain. These are the ONLY cached CV reads — the
 * low-level `service.ts` reads stay uncached because mutations call them right
 * after a write and must see fresh rows. Each function is keyed by its
 * serializable args (userId / cvId) and tagged so a Server Action's
 * `updateTag(...)` expires exactly the right entry.
 */

function toCvListItem(cv: Cv): CvListItem {
  return {
    id: cv.id,
    title: cv.title,
    templateId: cv.templateId,
    updatedAt: cv.updatedAt.toISOString(),
    data: cv.data,
    accentColor: cv.accentColor,
    fontFamily: cv.fontFamily,
    isPublic: cv.isPublic,
  };
}

function toCvDetail(cv: Cv): CvDetail {
  return {
    cvId: cv.id,
    title: cv.title,
    templateId: cv.templateId,
    accentColor: cv.accentColor,
    fontFamily: cv.fontFamily,
    // Normalize older/partial documents to the current schema shape.
    data: resumeSchema.parse(cv.data),
  };
}

export async function getCvListCached(userId: string): Promise<CvListItem[]> {
  "use cache";
  cacheTag(tags.cvList(userId));
  cacheLife("hours");
  const rows = await listCvs(userId);
  return rows.map(toCvListItem);
}

export async function getCvDetailCached(
  userId: string,
  cvId: string,
): Promise<CvDetail | null> {
  "use cache";
  cacheTag(tags.cv(cvId));
  cacheLife("hours");
  const cv = await getCv(userId, cvId);
  return cv ? toCvDetail(cv) : null;
}

export async function getShareInfoCached(
  userId: string,
  cvId: string,
): Promise<ShareInfo | null> {
  "use cache";
  cacheTag(tags.shareInfo(cvId));
  cacheLife("hours");
  return getShareInfo(userId, cvId);
}
