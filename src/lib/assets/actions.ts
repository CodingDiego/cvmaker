"use server";

import { updateTag } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { tags } from "@/lib/cache-tags";
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
  updateTag(tags.assetList(user.id));
  return { ok: true };
}

export async function shareAssetAction(assetId: string) {
  const user = await requireUser();
  const runId = await shareAsset(user.id, assetId);
  updateTag(tags.assetList(user.id));
  return { ok: Boolean(runId), runId };
}

export async function unshareAssetAction(assetId: string) {
  const user = await requireUser();
  const runId = await unshareAsset(user.id, assetId);
  updateTag(tags.assetList(user.id));
  return { ok: Boolean(runId), runId };
}

export async function deleteAssetAction(assetId: string) {
  const user = await requireUser();
  await deleteAsset(user.id, assetId);
  updateTag(tags.assetList(user.id));
  return { ok: true };
}
