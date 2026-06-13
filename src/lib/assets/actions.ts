"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  createAsset,
  shareAsset,
  unshareAsset,
  deleteAsset,
} from "./service";

export async function uploadAssetAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };
  const data = Buffer.from(await file.arrayBuffer());
  await createAsset(user.id, {
    name: file.name,
    contentType: file.type || "application/octet-stream",
    data,
  });
  revalidatePath("/dashboard/assets");
  return { ok: true };
}

export async function shareAssetAction(assetId: string) {
  const user = await requireUser();
  const runId = await shareAsset(user.id, assetId);
  revalidatePath("/dashboard/assets");
  return { ok: Boolean(runId), runId };
}

export async function unshareAssetAction(assetId: string) {
  const user = await requireUser();
  const runId = await unshareAsset(user.id, assetId);
  revalidatePath("/dashboard/assets");
  return { ok: Boolean(runId), runId };
}

export async function deleteAssetAction(assetId: string) {
  const user = await requireUser();
  await deleteAsset(user.id, assetId);
  revalidatePath("/dashboard/assets");
  return { ok: true };
}
