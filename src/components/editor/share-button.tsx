"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Download, ExternalLink, Globe, Loader2, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  getShareInfoAction,
  shareCvAction,
  unshareCvAction,
} from "@/lib/cv/share-actions";
import type { ShareInfo } from "@/lib/cv/share-service";

export function ShareButton({ cvId }: { cvId: string }) {
  const [info, setInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  // Fetch current share state when the dialog opens (event-driven, not an effect).
  function handleOpenChange(open: boolean) {
    if (open && !info) {
      setLoading(true);
      getShareInfoAction(cvId)
        .then(setInfo)
        .finally(() => setLoading(false));
    }
  }

  function toggle(next: boolean) {
    startTransition(async () => {
      try {
        if (next) {
          const result = await shareCvAction(cvId);
          setInfo(result);
          toast.success("Your CV is now public", { description: "Anyone with the link can view and download it." });
        } else {
          await unshareCvAction(cvId);
          setInfo({ isPublic: false, shareUrl: null, pdfUrl: null, docxUrl: null });
          toast.success("Sharing disabled");
        }
      } catch (e) {
        toast.error("Couldn't update sharing", { description: e instanceof Error ? e.message : undefined });
      }
    });
  }

  function resync() {
    startTransition(async () => {
      try {
        const result = await shareCvAction(cvId);
        setInfo(result);
        toast.success("Public copy updated");
      } catch (e) {
        toast.error("Couldn't update", { description: e instanceof Error ? e.message : undefined });
      }
    });
  }

  function copy() {
    if (!info?.shareUrl) return;
    navigator.clipboard.writeText(info.shareUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  }

  const isPublic = info?.isPublic ?? false;

  return (
    <Dialog onOpenChange={handleOpenChange}>
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
          {loading ? (
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
              <Button size="sm" variant="ghost" className="ml-auto" disabled={pending} onClick={resync}>
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
