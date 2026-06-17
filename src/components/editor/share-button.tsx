"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Download, ExternalLink, Globe, Loader2, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCvStore } from "@/lib/cv/store";
import { resolveSectionTitle, validateResume } from "@/lib/cv/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { shareCvAction, unshareCvAction } from "@/lib/cv/share-actions";
import { shareInfoOptions, type ShareInfo } from "@/lib/cv/cv-queries";
import { queryKeys } from "@/lib/query/keys";
import { useT } from "@/i18n/provider";

export function ShareButton({ cvId, onShowErrors }: { cvId: string; onShowErrors?: () => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  // A CV can only be shared once every kept section has content — an empty
  // section would render as a blank block in the public copy. Mirror the export
  // guard: flag the offending sections inline (via the store) and name them.
  const data = useCvStore((s) => s.data);
  const setSectionErrors = useCvStore((s) => s.setSectionErrors);
  const emptySections = useMemo(() => validateResume(data), [data]);
  const hasEmpty = emptySections.length > 0;

  function flagEmpty() {
    setSectionErrors(emptySections);
    onShowErrors?.();
    const names = emptySections.map((k) => resolveSectionTitle(data, k)).join(", ");
    toast.error(t("editor.share.emptyToast", { sections: names }));
  }

  // Share state is read from GET /api/cvs/:cvId/share, fetched lazily the first
  // time the dialog opens (and refetched after a mutation invalidates the tag).
  const { data: info, isLoading } = useQuery(shareInfoOptions(cvId, open));

  function writeShare(next: ShareInfo) {
    queryClient.setQueryData(queryKeys.cvs.share(cvId), next);
    // The dashboard card shows a "Public" badge — keep the list in sync.
    queryClient.invalidateQueries({ queryKey: queryKeys.cvs.list() });
  }

  const shareMutation = useMutation({
    mutationFn: (mode: "enable" | "resync") => shareCvAction(cvId).then((r) => ({ r, mode })),
    onSuccess: ({ r, mode }) => {
      writeShare(r);
      if (mode === "enable") {
        toast.success(t("editor.share.nowPublic"), {
          description: t("editor.share.nowPublicDesc"),
        });
      } else {
        toast.success(t("editor.share.copyUpdated"));
      }
    },
    onError: (e) =>
      toast.error(t("editor.share.updateError"), {
        description: e instanceof Error ? e.message : undefined,
      }),
  });

  const unshareMutation = useMutation({
    mutationFn: () => unshareCvAction(cvId),
    onSuccess: () => {
      writeShare({ isPublic: false, shareUrl: null, pdfUrl: null, docxUrl: null });
      toast.success(t("editor.share.sharingDisabled"));
    },
    onError: (e) =>
      toast.error(t("editor.share.updateError"), {
        description: e instanceof Error ? e.message : undefined,
      }),
  });

  const pending = shareMutation.isPending || unshareMutation.isPending;
  const isPublic = info?.isPublic ?? false;

  function toggle(next: boolean) {
    if (next) {
      if (hasEmpty) {
        flagEmpty();
        return;
      }
      shareMutation.mutate("enable");
    } else unshareMutation.mutate();
  }

  function resync() {
    if (hasEmpty) {
      flagEmpty();
      return;
    }
    shareMutation.mutate("resync");
  }

  function copy() {
    if (!info?.shareUrl) return;
    navigator.clipboard.writeText(info.shareUrl);
    setCopied(true);
    toast.success(t("editor.share.linkCopied"));
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="h-9" aria-label={t("editor.share.button")} />}>
        <Share2 className="size-4" /> <span className="hidden sm:inline">{t("editor.share.button")}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editor.share.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("editor.share.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        {hasEmpty && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">{t("editor.share.emptyTitle")}</p>
              <p className="text-xs text-destructive/90">
                {t("editor.share.emptyDescription", {
                  sections: emptySections.map((k) => resolveSectionTitle(data, k)).join(", "),
                })}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2.5">
            <Globe className="size-4 text-primary" />
            <div>
              <div className="text-sm font-medium">{t("editor.share.publicLink")}</div>
              <div className="text-xs text-muted-foreground">
                {isPublic ? t("editor.share.anyoneCanView") : t("editor.share.onlyYou")}
              </div>
            </div>
          </div>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Switch checked={isPublic} disabled={pending} onCheckedChange={toggle} />
          )}
        </div>

        {isPublic && info?.shareUrl && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input readOnly value={info.shareUrl} className="h-9 font-mono text-xs" />
              <Button size="icon" variant="outline" className="h-9 shrink-0" aria-label={t("editor.share.copyLinkAria")} onClick={copy}>
                {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-9 shrink-0"
                aria-label={t("editor.share.openLinkAria")}
                render={<a href={info.shareUrl} target="_blank" rel="noreferrer noopener" />}
              >
                <ExternalLink className="size-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {info.pdfUrl && (
                <Button size="sm" variant="ghost" render={<a href={info.pdfUrl} target="_blank" rel="noreferrer noopener" download />}>
                  <Download className="size-4" /> PDF
                </Button>
              )}
              {info.docxUrl && (
                <Button size="sm" variant="ghost" render={<a href={info.docxUrl} target="_blank" rel="noreferrer noopener" download />}>
                  <Download className="size-4" /> DOCX
                </Button>
              )}
              <Button size="sm" variant="ghost" className="ml-auto" disabled={pending} onClick={resync}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {t("editor.share.updateCopy")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("editor.share.updateHint")}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
