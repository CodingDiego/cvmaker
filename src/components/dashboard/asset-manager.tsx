"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Globe, Loader2, Lock, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  uploadAssetAction,
  shareAssetAction,
  unshareAssetAction,
  deleteAssetAction,
} from "@/lib/assets/actions";

export interface AssetView {
  id: string;
  name: string;
  contentType: string;
  shared: boolean;
  publicUrl: string | null;
  syncing: boolean;
}

function AssetRow({ asset }: { asset: AssetView }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function toggleShare(next: boolean) {
    start(async () => {
      const res = next ? await shareAssetAction(asset.id) : await unshareAssetAction(asset.id);
      if (res.ok) {
        toast.message(next ? "Sharing asset…" : "Unsharing asset…", {
          description: "The public copy is syncing in the background.",
        });
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            {asset.shared ? <Globe className="size-4" /> : <Lock className="size-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{asset.name}</span>
              {asset.syncing && <Badge variant="secondary">Syncing…</Badge>}
              {asset.shared && !asset.syncing && <Badge>Public</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">{asset.contentType}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {asset.shared && asset.publicUrl && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy public URL"
              onClick={() => {
                navigator.clipboard.writeText(asset.publicUrl!);
                toast.success("Public URL copied");
              }}
            >
              <Copy className="size-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            {pending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
            <Switch
              checked={asset.shared}
              disabled={pending}
              onCheckedChange={toggleShare}
              aria-label="Share publicly"
            />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete asset"
            disabled={pending}
            onClick={() => start(async () => {
              await deleteAssetAction(asset.id);
              router.refresh();
            })}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetManager({ assets }: { assets: AssetView[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    uploadAssetAction(fd)
      .then((res) => {
        if (res.ok) {
          toast.success("Asset uploaded");
          router.refresh();
        } else {
          toast.error(res.error ?? "Upload failed");
        }
      })
      .finally(() => {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <input ref={inputRef} type="file" hidden onChange={onUpload} />
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Upload asset
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No assets yet. Upload a file, then toggle sharing to publish a public copy.
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map((a) => (
            <AssetRow key={a.id} asset={a} />
          ))}
        </div>
      )}
    </div>
  );
}
