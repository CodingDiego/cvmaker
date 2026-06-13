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
import { TEMPLATE_LABELS, getTemplate } from "@/templates/registry";
import { PreviewThumbnail } from "@/components/templates/preview-thumbnail";
import type { ResumeData } from "@/lib/cv/types";

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
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(title);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const queryClient = useQueryClient();

  // Mutations call the Server Action (which runs updateTag for read-your-own-
  // writes), then invalidate the list query so React Query refetches /api/cvs.
  const deleteMutation = useMutation({
    mutationFn: () => deleteCvAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cvs.list() });
      toast.success("CV deleted");
      setConfirmingDelete(false);
    },
    onError: () => {
      toast.error("Couldn't delete this CV");
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
        <div className="flex h-[210px] justify-center overflow-hidden">
          <PreviewThumbnail
            data={data}
            tokens={getTemplate(templateId)}
            accentColor={accentColor}
            fontFamily={fontFamily}
            width={300}
            height={210}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {isPublic && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[0.7rem] font-medium text-primary-foreground shadow">
            <Globe className="size-3" /> Public
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
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="More actions" />}>
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/editor/${id}`} />}>
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setRenaming(true)}>
              <Pencil className="size-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              // Defer to the next tick so the click that closes the menu doesn't
              // also register as an outside-press that immediately dismisses the
              // just-opened confirmation dialog.
              onSelect={() => setTimeout(() => setConfirmingDelete(true), 0)}
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this CV?</DialogTitle>
            <DialogDescription>
              “{title}” will be permanently deleted{isPublic ? ", including its public share link" : ""}. This
              can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={pending} onClick={() => setConfirmingDelete(false)}>
              Cancel
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
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
