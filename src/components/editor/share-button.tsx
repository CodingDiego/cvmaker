"use client";

import { useState } from "react";
import { Check, Copy, Download, ExternalLink, Globe, Loader2, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function ShareButton({ cvId }: { cvId: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

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
        toast.success("Your CV is now public", {
          description: "Anyone with the link can view and download it.",
        });
      } else {
        toast.success("Public copy updated");
      }
    },
    onError: (e) =>
      toast.error("Couldn't update sharing", {
        description: e instanceof Error ? e.message : undefined,
      }),
  });

  const unshareMutation = useMutation({
    mutationFn: () => unshareCvAction(cvId),
    onSuccess: () => {
      writeShare({ isPublic: false, shareUrl: null, pdfUrl: null, docxUrl: null });
      toast.success("Sharing disabled");
    },
    onError: (e) =>
      toast.error("Couldn't update sharing", {
        description: e instanceof Error ? e.message : undefined,
      }),
  });

  const pending = shareMutation.isPending || unshareMutation.isPending;
  const isPublic = info?.isPublic ?? false;

  function toggle(next: boolean) {
    if (next) shareMutation.mutate("enable");
    else unshareMutation.mutate();
  }

  function copy() {
    if (!info?.shareUrl) return;
    navigator.clipboard.writeText(info.shareUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="h-9" />}>
        <Share2 className="size-4" /> Share
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your CV</DialogTitle>
          <DialogDescription>
            Make this CV public to share it with a link. The public copy can be viewed and downloaded by anyone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2.5">
            <Globe className="size-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Public link</div>
              <div className="text-xs text-muted-foreground">
                {isPublic ? "Anyone with the link can view" : "Only you can see this CV"}
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
              <Button size="icon" variant="outline" className="h-9 shrink-0" aria-label="Copy link" onClick={copy}>
                {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-9 shrink-0"
                aria-label="Open link"
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
              <Button size="sm" variant="ghost" className="ml-auto" disabled={pending} onClick={() => shareMutation.mutate("resync")}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                Update public copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Edited your CV? Click “Update public copy” to re-publish the latest version.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
