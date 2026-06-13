import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { start } from "workflow/api";
import { db } from "@/db";
import { assets, type Asset } from "@/db/schema";
import { putToStore, delFromStore, defaultStore } from "@/lib/blob";
import { shareOrSyncAssetWorkflow, unshareAssetWorkflow } from "@/workflows/asset-sync";

function privatePathFor(userId: string, assetId: string, name: string): string {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `private/${userId}/${assetId}/${safe}`;
}

export async function listAssets(userId: string): Promise<Asset[]> {
  return db
    .select()
    .from(assets)
    .where(eq(assets.userId, userId))
    .orderBy(desc(assets.createdAt));
}

export async function getAsset(userId: string, assetId: string): Promise<Asset | null> {
  const [row] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, assetId), eq(assets.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function createAsset(
  userId: string,
  input: { name: string; contentType: string; data: Buffer | Uint8Array },
): Promise<Asset> {
  const id = randomUUID();
  const pathname = privatePathFor(userId, id, input.name);
  const stored = await putToStore(defaultStore(), pathname, input.data, {
    contentType: input.contentType,
    allowOverwrite: true,
  });

  const [row] = await db
    .insert(assets)
    .values({
      id,
      userId,
      name: input.name,
      contentType: input.contentType,
      size: String(input.data.byteLength ?? input.data.length ?? 0),
      privatePathname: stored.pathname,
      privateUrl: stored.url,
    })
    .returning();
  return row!;
}

/** Replace the bytes of an existing private asset; re-sync the public mirror if shared. */
export async function updateAssetBytes(
  userId: string,
  assetId: string,
  data: Buffer | Uint8Array,
): Promise<Asset | null> {
  const asset = await getAsset(userId, assetId);
  if (!asset) return null;

  const stored = await putToStore(defaultStore(), asset.privatePathname, data, {
    contentType: asset.contentType,
    allowOverwrite: true,
  });
  await db
    .update(assets)
    .set({ privateUrl: stored.url, size: String(data.byteLength ?? data.length ?? 0), updatedAt: new Date() })
    .where(eq(assets.id, assetId));

  if (asset.shared) {
    const run = await start(shareOrSyncAssetWorkflow, [assetId]);
    await db.update(assets).set({ syncRunId: run.runId }).where(eq(assets.id, assetId));
  }
  return getAsset(userId, assetId);
}

/** Share: kick off a workflow that copies the private asset into the public store. */
export async function shareAsset(userId: string, assetId: string): Promise<string | null> {
  const asset = await getAsset(userId, assetId);
  if (!asset) return null;
  const run = await start(shareOrSyncAssetWorkflow, [assetId]);
  await db.update(assets).set({ syncRunId: run.runId }).where(eq(assets.id, assetId));
  return run.runId;
}

/** Unshare: workflow deletes the public copy and unlinks it. */
export async function unshareAsset(userId: string, assetId: string): Promise<string | null> {
  const asset = await getAsset(userId, assetId);
  if (!asset) return null;
  const run = await start(unshareAssetWorkflow, [assetId]);
  await db.update(assets).set({ syncRunId: run.runId }).where(eq(assets.id, assetId));
  return run.runId;
}

export async function deleteAsset(userId: string, assetId: string): Promise<void> {
  const asset = await getAsset(userId, assetId);
  if (!asset) return;
  await delFromStore(defaultStore(), asset.privatePathname).catch(() => {});
  if (asset.publicPathname) {
    await delFromStore("public", asset.publicPathname).catch(() => {});
  }
  await db.delete(assets).where(and(eq(assets.id, assetId), eq(assets.userId, userId)));
}
