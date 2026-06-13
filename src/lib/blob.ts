import "server-only";
import { put, get, del } from "@vercel/blob";
import { env } from "@/lib/env";

/**
 * Two Vercel Blob stores:
 *  - "private": default home for user data (CV exports, avatars, source assets).
 *  - "public":  copies of assets the user explicitly shares.
 *
 * Each store is addressed by its own read-write token (PRIVATE_/PUBLIC_), or a
 * storeId + OIDC token when tokens aren't provided.
 */
export type BlobStore = "private" | "public";

function storeAuth(store: BlobStore): { token?: string; storeId?: string } {
  if (store === "public") {
    return { token: env.publicBlobToken(), storeId: env.publicBlobStoreId() };
  }
  return { token: env.privateBlobToken(), storeId: env.privateBlobStoreId() };
}

function assertStore(store: BlobStore) {
  const configured = store === "public" ? env.hasPublicBlob() : env.hasPrivateBlob();
  if (!configured) {
    throw new Error(
      `The ${store} Vercel Blob store is not configured (missing ${
        store === "public" ? "PUBLIC_" : "PRIVATE_"
      }READ_WRITE_TOKEN / STORE_ID).`,
    );
  }
}

export interface PutOptions {
  contentType?: string;
  allowOverwrite?: boolean;
  addRandomSuffix?: boolean;
}

export interface StoredBlob {
  url: string;
  pathname: string;
}

export async function putToStore(
  store: BlobStore,
  pathname: string,
  data: Buffer | Uint8Array | string,
  opts: PutOptions = {},
): Promise<StoredBlob> {
  assertStore(store);
  const auth = storeAuth(store);
  const body = typeof data === "string" ? data : Buffer.from(data);
  const blob = await put(pathname, body, {
    access: store,
    contentType: opts.contentType,
    allowOverwrite: opts.allowOverwrite ?? false,
    addRandomSuffix: opts.addRandomSuffix ?? false,
    ...auth,
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function getBytes(store: BlobStore, urlOrPathname: string): Promise<Buffer> {
  assertStore(store);

  // Public blobs are served directly over HTTP — no token needed.
  if (store === "public" && /^https?:\/\//.test(urlOrPathname)) {
    const res = await fetch(urlOrPathname);
    if (!res.ok) throw new Error(`Failed to fetch public blob: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }

  // Private blobs: read through the SDK with the store's token.
  const auth = storeAuth(store);
  const result = await get(urlOrPathname, { access: store, useCache: false, ...auth });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error(`Blob not found in ${store} store: ${urlOrPathname}`);
  }
  const reader = result.stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function delFromStore(store: BlobStore, urlOrPathname: string): Promise<void> {
  assertStore(store);
  const auth = storeAuth(store);
  await del(urlOrPathname, auth);
}

/** The store exports/assets default to: private when configured, else public. */
export function defaultStore(): BlobStore {
  return env.hasPrivateBlob() ? "private" : "public";
}

/** Convenience for export files — lands in the private store (or public if that's all that's set up). */
export async function uploadExport(
  pathname: string,
  data: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const { url } = await putToStore(defaultStore(), pathname, data, {
    contentType,
    addRandomSuffix: true,
  });
  return url;
}
