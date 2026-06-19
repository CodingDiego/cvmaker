"use client";

import { useState } from "react";
import { Link } from "@/components/link";
import { Globe, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteCvAction, renameCvAction } from "@/lib/cv/actions";
import { queryKeys } from "@/lib/query/keys";
import { TEMPLATE_LABELS } from "@/templates/registry";
import { ResponsiveThumbnail } from "@/components/templates/responsive-thumbnail";
import { isResumeEmpty, sampleResume, type ResumeData } from "@/lib/cv/types";
import { useT } from "@/i18n/provider";

// A friendly sample document so a blank draft still previews the template design
// instead of rendering an empty page. Parsed once and shared across cards.
const SAMPLE = sampleResume();

export function CvCard({
  id,
  title,
  templateId,
  updatedAt,
  data,
  accentColor,
  fontFamily,
  isPublic,
}: {
  id: string;
  title: string;
  templateId: string;
  updatedAt: string;
  data: ResumeData;
  accentColor: string;
  fontFamily: string;
  isPublic: boolean;
}) {
  const t = useT();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(title);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const queryClient = useQueryClient();

  // A brand-new draft created from a template is blank, which renders as an empty
  // page. Fall back to dummy sample content so the card always shows what the
  // template actually looks like (flagged with a "Sample preview" badge).
  const isEmpty = isResumeEmpty(data);
  const previewData = isEmpty ? SAMPLE : data;

  // Mutations call the Server Action (which runs updateTag for read-your-own-
  // writes), then invalidate the list query so React Query refetches /api/cvs.
  const deleteMutation = useMutation({
    mutationFn: () => deleteCvAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cvs.list() });
      toast.success(t("dashboard.cvs.deleted"));
      setConfirmingDelete(false);
    },
    onError: () => {
      toast.error(t("dashboard.cvs.deleteError"));
      setConfirmingDelete(false);
    },
  });

  const renameMutation = useMutation({
    mutationFn: (next: string) => renameCvAction(id, next),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cvs.list() }),
  });

  const pending = deleteMutation.isPending || renameMutation.isPending;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/editor/${id}`} className="relative block overflow-hidden border-b bg-muted/30">
        <ResponsiveThumbnail
          data={previewData}
          templateId={templateId}
          accentColor={accentColor}
          fontFamily={fontFamily}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {isPublic && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[0.7rem] font-medium text-primary-foreground shadow">
            <Globe className="size-3" /> {t("dashboard.cvs.public")}
          </span>
        )}
        {isEmpty && (
          <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-background/85 px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground shadow-sm backdrop-blur">
            {t("dashboard.cvs.samplePreview")}
          </span>
        )}
      </Link>

      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0 flex-1">
          {renaming ? (
            <Input
              autoFocus
              value={name}
              className="h-8"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                setRenaming(false);
                if (name !== title) renameMutation.mutate(name);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
          ) : (
            <div className="truncate font-medium">{title}</div>
          )}
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{TEMPLATE_LABELS[templateId] ?? templateId}</span>
            <span aria-hidden>·</span>
            <span>{new Date(updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t("dashboard.cvs.moreActions")} />}>
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/editor/${id}`} />}>
              <Pencil className="size-4" /> {t("dashboard.cvs.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRenaming(true)}>
              <Pencil className="size-4" /> {t("dashboard.cvs.rename")}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              // Defer to the next tick so the click that closes the menu doesn't
              // also register as an outside-press that immediately dismisses the
              // just-opened confirmation dialog.
              onClick={() => setTimeout(() => setConfirmingDelete(true), 0)}
            >
              <Trash2 className="size-4" /> {t("dashboard.cvs.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.cvs.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {isPublic
                ? t("dashboard.cvs.deleteDescriptionPublic", { title })
                : t("dashboard.cvs.deleteDescription", { title })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={pending} onClick={() => setConfirmingDelete(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {t("dashboard.cvs.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
