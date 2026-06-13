"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { shareCv, unshareCv, getShareInfo, type ShareInfo } from "./share-service";

export async function getShareInfoAction(cvId: string): Promise<ShareInfo | null> {
  const user = await requireUser();
  return getShareInfo(user.id, cvId);
}

export async function shareCvAction(cvId: string): Promise<ShareInfo> {
  const user = await requireUser();
  const info = await shareCv(user.id, cvId);
  revalidatePath("/dashboard");
  return info;
}

export async function unshareCvAction(cvId: string): Promise<{ ok: true }> {
  const user = await requireUser();
  await unshareCv(user.id, cvId);
  revalidatePath("/dashboard");
  return { ok: true };
}
