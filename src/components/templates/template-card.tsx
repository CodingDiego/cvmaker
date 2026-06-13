"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Crown, FilePlus2, Loader2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCvAction } from "@/lib/cv/actions";
import type { BillingPlan } from "@/lib/billing/entitlements";
import { FREE_DRAFT_LIMIT } from "@/templates/registry";
import type { TemplateAccess } from "@/templates/types";

export interface TemplateDraft {
  id: string;
  title: string;
  updatedAt: string;
}

export function UseTemplateButton({
  templateId,
  draft,
  access = "free",
  plan,
  draftCount,
}: {
  templateId: string;
  draft?: TemplateDraft | null;
  access?: TemplateAccess;
  plan: BillingPlan;
  draftCount: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const requiresUpgrade = access === "pro" && plan !== "pro";
  const reachedDraftLimit = plan !== "pro" && draftCount >= FREE_DRAFT_LIMIT;
  const canStartNew = !requiresUpgrade && !reachedDraftLimit;

  function startNew() {
    setError(null);
    start(async () => {
      const result = await createCvAction(templateId);
      if (result?.ok === false) setError(result.error);
    });
  }

  if (requiresUpgrade) {
    return (
      <Button size="sm" className="w-full" render={<Link href="/api/checkout" />}>
        <Crown className="size-4" /> Upgrade to use
      </Button>
    );
  }

  if (!draft && reachedDraftLimit) {
    return (
      <Button size="sm" variant="outline" className="w-full" render={<Link href="/api/checkout" />}>
        <Crown className="size-4" /> Upgrade for more drafts
      </Button>
    );
  }

  if (!draft) {
    return (
      <div className="space-y-2">
        <Button size="sm" className="w-full" disabled={pending} onClick={startNew}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          Use this template
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" className="w-full" />}>
        <PencilLine className="size-4" /> Continue or start new
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You have a draft with this template</DialogTitle>
          <DialogDescription>
            &quot;{draft.title}&quot; already uses this template (edited{" "}
            {new Date(draft.updatedAt).toLocaleDateString()}). Continue editing it, or start a
            fresh CV. Your existing draft is kept either way.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => router.push(`/editor/${draft.id}`)}>
            <PencilLine className="size-4" /> Continue draft
          </Button>
          {canStartNew ? (
            <Button variant="outline" className="flex-1" disabled={pending} onClick={startNew}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FilePlus2 className="size-4" />
              )}
              Start new
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" render={<Link href="/api/checkout" />}>
              <Crown className="size-4" /> Upgrade
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
