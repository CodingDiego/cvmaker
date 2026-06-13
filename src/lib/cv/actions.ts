"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { isCvLimitError } from "@/lib/billing/entitlements";
import { tags } from "@/lib/cache-tags";
import { resumeSchema, type ResumeData } from "./types";
import {
  createCv,
  deleteCv,
  updateCvData,
  updateCvMeta,
} from "./service";
import { unshareCv } from "./share-service";

export async function createCvAction(templateId?: string) {
  const user = await requireUser();
  let cvId: string;
  try {
    const cv = await createCv(user.id, { templateId });
    cvId = cv.id;
  } catch (error) {
    if (isCvLimitError(error)) {
      return { ok: false, reason: error.reason, error: error.message };
    }
    throw error;
  }

  // RYOW: expire the list cache before navigating so the dashboard (if revisited)
  // and any client refetch see the new CV immediately.
  updateTag(tags.cvList(user.id));
  redirect(`/editor/${cvId}`);
}

export async function deleteCvAction(cvId: string) {
  const user = await requireUser();
  // Remove any public blob copies first so deleting a shared CV doesn't orphan
  // files in the public store (best-effort — never blocks the delete).
  try {
    await unshareCv(user.id, cvId);
  } catch {
    // ignore cleanup failures
  }
  await deleteCv(user.id, cvId);
  updateTag(tags.cvList(user.id));
  updateTag(tags.cv(cvId));
  return { ok: true };
}

export async function renameCvAction(cvId: string, title: string) {
  const user = await requireUser();
  await updateCvMeta(user.id, cvId, { title: title.trim() || "Untitled CV" });
  updateTag(tags.cv(cvId));
  updateTag(tags.cvList(user.id));
  return { ok: true };
}

/** Autosave: persist the full resume document. Validated server-side. */
export async function saveCvDataAction(cvId: string, data: ResumeData) {
  const user = await requireUser();
  const parsed = resumeSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Invalid resume data" };
  await updateCvData(user.id, cvId, parsed.data);
  // The dashboard card renders a preview from `data` and shows updatedAt, so the
  // list tag is invalidated alongside the detail tag.
  updateTag(tags.cv(cvId));
  updateTag(tags.cvList(user.id));
  return { ok: true };
}

export async function updateCvMetaAction(
  cvId: string,
  meta: { title?: string; templateId?: string; accentColor?: string; fontFamily?: string },
) {
  const user = await requireUser();
  try {
    await updateCvMeta(user.id, cvId, meta);
  } catch (error) {
    if (isCvLimitError(error)) {
      return { ok: false, reason: error.reason, error: error.message };
    }
    throw error;
  }
  updateTag(tags.cv(cvId));
  updateTag(tags.cvList(user.id));
  return { ok: true };
}
