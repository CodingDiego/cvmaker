"use client";

import { useRef } from "react";
import { Copy, Globe, Loader2, Lock, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { assetListOptions, type AssetView } from "@/lib/assets/asset-queries";
import { queryKeys } from "@/lib/query/keys";
import { useT } from "@/i18n/provider";
import type { Translator } from "@/i18n/translate";

function AssetRow({ asset, t }: { asset: AssetView; t: Translator }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.assets.list() });

  const toggleMutation = useMutation({
    mutationFn: (next: boolean) =>
      next ? shareAssetAction(asset.id) : unshareAssetAction(asset.id),
    onSuccess: (res, next) => {
      if (res.ok) {
        toast.message(next ? t("dashboard.assets.sharing") : t("dashboard.assets.unsharing"), {
          description: t("dashboard.assets.syncDesc"),
        });
      }
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAssetAction(asset.id),
    onSuccess: invalidate,
  });

  const pending = toggleMutation.isPending || deleteMutation.isPending;

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
              {asset.syncing && <Badge variant="secondary">{t("dashboard.assets.syncing")}</Badge>}
              {asset.shared && !asset.syncing && <Badge>{t("dashboard.assets.public")}</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">{asset.contentType}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {asset.shared && asset.publicUrl && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("dashboard.assets.copyUrlAria")}
              onClick={() => {
                navigator.clipboard.writeText(asset.publicUrl!);
                toast.success(t("dashboard.assets.copied"));
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
              onCheckedChange={(next) => toggleMutation.mutate(next)}
              aria-label={t("dashboard.assets.shareAria")}
            />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("dashboard.assets.deleteAria")}
            disabled={pending}
            onClick={() => deleteMutation.mutate()}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetManager() {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // While any asset has an in-flight sync, poll so the "Syncing…" badge clears
  // on its own once the background workflow finishes.
  const { data: assets = [] } = useQuery({
    ...assetListOptions(),
    refetchInterval: (q) => (q.state.data?.some((a) => a.syncing) ? 2000 : false),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.set("file", file);
      return uploadAssetAction(fd);
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(t("dashboard.assets.uploaded"));
        queryClient.invalidateQueries({ queryKey: queryKeys.assets.list() });
      } else {
        toast.error(res.error ?? t("dashboard.assets.uploadFailed"));
      }
    },
    onError: () => toast.error(t("dashboard.assets.uploadFailed")),
    onSettled: () => {
      if (inputRef.current) inputRef.current.value = "";
    },
  });

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <input ref={inputRef} type="file" hidden onChange={onUpload} />
        <Button onClick={() => inputRef.current?.click()} disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {t("dashboard.assets.upload")}
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          {t("dashboard.assets.empty")}
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map((a) => (
            <AssetRow key={a.id} asset={a} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
