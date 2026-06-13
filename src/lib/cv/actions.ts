"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { resumeSchema, type ResumeData } from "./types";
import {
  createCv,
  deleteCv,
  updateCvData,
  updateCvMeta,
} from "./service";

export async function createCvAction(templateId?: string) {
  const user = await requireUser();
  const cv = await createCv(user.id, { templateId });
  redirect(`/editor/${cv.id}`);
}

export async function deleteCvAction(cvId: string) {
  const user = await requireUser();
  await deleteCv(user.id, cvId);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function renameCvAction(cvId: string, title: string) {
  const user = await requireUser();
  await updateCvMeta(user.id, cvId, { title: title.trim() || "Untitled CV" });
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Autosave: persist the full resume document. Validated server-side. */
export async function saveCvDataAction(cvId: string, data: ResumeData) {
  const user = await requireUser();
  const parsed = resumeSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Invalid resume data" };
  await updateCvData(user.id, cvId, parsed.data);
  return { ok: true };
}

export async function updateCvMetaAction(
  cvId: string,
  meta: { title?: string; templateId?: string; accentColor?: string; fontFamily?: string },
) {
  const user = await requireUser();
  await updateCvMeta(user.id, cvId, meta);
  return { ok: true };
}
