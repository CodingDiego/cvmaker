import { eq } from "drizzle-orm";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { getBytes, putToStore, delFromStore, defaultStore } from "@/lib/blob";

/**
 * Asset sharing, designed with the Workflow DevKit.
 *
 *  - shareOrSyncAssetWorkflow: ensure the public store holds an up-to-date copy
 *    of a private asset (used both on first share and on every later update).
 *  - unshareAssetWorkflow: delete the public copy and unlink it.
 *
 * The private store is the source of truth. Steps have full Node access; the
 * workflow function only orchestrates them so it stays sandbox-safe + durable.
 */

interface AssetSnapshot {
  id: string;
  userId: string;
  name: string;
  contentType: string;
  privateUrl: string;
  publicPathname: string | null;
}

// --- Steps (full Node.js access, retried + persisted) ---

async function loadAsset(assetId: string): Promise<AssetSnapshot | null> {
  "use step";
  const [row] = await db.select().from(assets).where(eq(assets.id, assetId)).limit(1);
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    contentType: row.contentType,
    privateUrl: row.privateUrl,
    publicPathname: row.publicPathname,
  };
}

function publicPathFor(snap: AssetSnapshot): string {
  // Deterministic path so updates overwrite the same public object.
  const safeName = snap.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `shared/${snap.userId}/${snap.id}-${safeName}`;
}

async function copyPrivateToPublic(snap: AssetSnapshot): Promise<{ url: string; pathname: string }> {
  "use step";
  const bytes = await getBytes(defaultStore(), snap.privateUrl);
  const pathname = snap.publicPathname ?? publicPathFor(snap);
  const stored = await putToStore("public", pathname, bytes, {
    contentType: snap.contentType,
    allowOverwrite: true,
    addRandomSuffix: true,
  });
  return { url: stored.url, pathname: stored.pathname };
}

async function markShared(assetId: string, publicUrl: string, publicPathname: string) {
  "use step";
  await db
    .update(assets)
    .set({ shared: true, publicUrl, publicPathname, syncRunId: null, updatedAt: new Date() })
    .where(eq(assets.id, assetId));
}

async function deletePublicCopy(publicPathname: string | null) {
  "use step";
  if (publicPathname) await delFromStore("public", publicPathname);
}

async function markUnshared(assetId: string) {
  "use step";
  await db
    .update(assets)
    .set({ shared: false, publicUrl: null, publicPathname: null, syncRunId: null, updatedAt: new Date() })
    .where(eq(assets.id, assetId));
}

// --- Workflows (orchestration only) ---

export async function shareOrSyncAssetWorkflow(assetId: string) {
  "use workflow";
  const snap = await loadAsset(assetId);
  if (!snap) return { ok: false, reason: "not_found" };

  const published = await copyPrivateToPublic(snap);
  await markShared(assetId, published.url, published.pathname);
  return { ok: true, publicUrl: published.url };
}

export async function unshareAssetWorkflow(assetId: string) {
  "use workflow";
  const snap = await loadAsset(assetId);
  if (!snap) return { ok: false, reason: "not_found" };

  await deletePublicCopy(snap.publicPathname);
  await markUnshared(assetId);
  return { ok: true };
}
