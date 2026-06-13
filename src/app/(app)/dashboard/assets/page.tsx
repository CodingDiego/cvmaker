import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { listAssets } from "@/lib/assets/service";
import { AssetManager, type AssetView } from "@/components/dashboard/asset-manager";

export const metadata: Metadata = { title: "Assets" };

export default async function AssetsPage() {
  const user = await requireUser("/dashboard/assets");
  const rows = await listAssets(user.id);

  const assets: AssetView[] = rows.map((a) => ({
    id: a.id,
    name: a.name,
    contentType: a.contentType,
    shared: a.shared,
    publicUrl: a.publicUrl,
    syncing: Boolean(a.syncRunId),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Assets</h1>
        <p className="text-sm text-muted-foreground">
          Files live in a private store. Toggle sharing to publish a synced copy to the public
          store; every update re-syncs automatically.
        </p>
      </div>
      <AssetManager assets={assets} />
    </div>
  );
}
