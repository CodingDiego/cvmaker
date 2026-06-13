"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowRight, FilePlus2, Loader2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCvAction } from "@/lib/cv/actions";

export interface TemplateDraft {
  id: string;
  title: string;
  updatedAt: string;
}

export function UseTemplateButton({
  templateId,
  draft,
}: {
  templateId: string;
  draft?: TemplateDraft | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function startNew() {
    start(() => createCvAction(templateId));
  }

  // No existing draft → straight to a new CV.
  if (!draft) {
    return (
      <Button size="sm" className="w-full" disabled={pending} onClick={startNew}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Use this template
      </Button>
    );
  }

  // A draft already uses this template → ask before creating another.
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" className="w-full" />}>
        <PencilLine className="size-4" /> Continue or start new
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You have a draft with this template</DialogTitle>
          <DialogDescription>
            “{draft.title}” already uses this template (edited{" "}
            {new Date(draft.updatedAt).toLocaleDateString()}). Continue editing it, or start a fresh
            CV — your existing draft is kept either way.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => router.push(`/editor/${draft.id}`)}>
            <PencilLine className="size-4" /> Continue draft
          </Button>
          <Button variant="outline" className="flex-1" disabled={pending} onClick={startNew}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <FilePlus2 className="size-4" />}
            Start new
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
