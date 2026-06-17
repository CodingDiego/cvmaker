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
import { useT } from "@/i18n/provider";

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
  isAuthed = true,
}: {
  templateId: string;
  draft?: TemplateDraft | null;
  access?: TemplateAccess;
  plan: BillingPlan;
  draftCount: number;
  isAuthed?: boolean;
}) {
  const t = useT();
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

  // Logged-out: carry the intent through sign-up. After auth, `/start/<id>`
  // creates the CV and drops the user straight into the editor.
  if (!isAuthed) {
    return (
      <Button
        size="sm"
        className="w-full"
        render={<Link href={`/register?next=${encodeURIComponent(`/start/${templateId}`)}`} />}
      >
        <ArrowRight className="size-4" /> {t("templates.useTemplate")}
      </Button>
    );
  }

  if (requiresUpgrade) {
    return (
      <Button size="sm" className="w-full" render={<Link href="/api/checkout" />}>
        <Crown className="size-4" /> {t("templates.upgradeToUse")}
      </Button>
    );
  }

  if (!draft && reachedDraftLimit) {
    return (
      <Button size="sm" variant="outline" className="w-full" render={<Link href="/api/checkout" />}>
        <Crown className="size-4" /> {t("templates.upgradeMoreDrafts")}
      </Button>
    );
  }

  if (!draft) {
    return (
      <div className="space-y-2">
        <Button size="sm" className="w-full" disabled={pending} onClick={startNew}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          {t("templates.useTemplate")}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" className="w-full" />}>
        <PencilLine className="size-4" /> {t("templates.continueOrNew")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("templates.draftDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("templates.draftDialogDescription", {
              title: draft.title,
              date: new Date(draft.updatedAt).toLocaleDateString(),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => router.push(`/editor/${draft.id}`)}>
            <PencilLine className="size-4" /> {t("templates.continueDraft")}
          </Button>
          {canStartNew ? (
            <Button variant="outline" className="flex-1" disabled={pending} onClick={startNew}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FilePlus2 className="size-4" />
              )}
              {t("templates.startNew")}
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" render={<Link href="/api/checkout" />}>
              <Crown className="size-4" /> {t("templates.upgrade")}
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
