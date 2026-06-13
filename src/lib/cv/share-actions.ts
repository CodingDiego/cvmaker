"use server";

import { updateTag } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { tags } from "@/lib/cache-tags";
import { shareCv, unshareCv, type ShareInfo } from "./share-service";

// Note: the share-state READ now lives at GET /api/cvs/:cvId/share
// (getShareInfoCached). These actions only mutate, then invalidate the relevant
// tags for read-your-own-writes.

export async function shareCvAction(cvId: string): Promise<ShareInfo> {
  const user = await requireUser();
  const info = await shareCv(user.id, cvId);
  updateTag(tags.shareInfo(cvId));
  updateTag(tags.cv(cvId));
  updateTag(tags.cvList(user.id)); // card shows a "Public" badge
  return info;
}

export async function unshareCvAction(cvId: string): Promise<{ ok: true }> {
  const user = await requireUser();
  await unshareCv(user.id, cvId);
  updateTag(tags.shareInfo(cvId));
  updateTag(tags.cv(cvId));
  updateTag(tags.cvList(user.id));
  return { ok: true };
}
