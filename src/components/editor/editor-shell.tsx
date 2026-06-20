"use client";

import { Activity, useState } from "react";
import { Expand, Eye, Pencil } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { BillingPlan } from "@/lib/billing/entitlements";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCvStore } from "@/lib/cv/store";
import { useAutosave } from "@/lib/cv/use-autosave";
import { cvDetailOptions } from "@/lib/cv/cv-queries";
import { Button } from "@/components/ui/button";
import { EditorToolbar } from "./editor-toolbar";
import { EditorForm } from "./editor-form";
import { LivePreview } from "./live-preview";
import { FullscreenPreview } from "./fullscreen-preview";
import { useT } from "@/i18n/provider";

type EditorView = "edit" | "preview";

export function EditorShell({ cvId, plan }: { cvId: string; plan: BillingPlan }) {
  const t = useT();
  // The detail was server-prefetched into the cache, so this resolves
  // synchronously on first render (no loading state).
  const { data: cv } = useSuspenseQuery(cvDetailOptions(cvId));

  // One-time synchronous store hydration from the cached payload (runs once,
  // before children read the store).
  useState(() => {
    useCvStore.getState().init(cv);
    return null;
  });

  const [view, setView] = useState<EditorView>("edit");
  const [fullscreen, setFullscreen] = useState(false);
  const { status } = useAutosave();
  const isMobile = useIsMobile();

  // On desktop both panels are visible; on mobile one at a time. Activity keeps
  // the hidden panel mounted (preserving the expensive live-preview scale/DOM
  // and scroll position) while de-prioritizing its rendering.
  const formMode = !isMobile || view === "edit" ? "visible" : "hidden";
  const previewMode = !isMobile || view === "preview" ? "visible" : "hidden";

  return (
    <div className="flex h-svh flex-col">
      <EditorToolbar status={status} plan={plan} onShowErrors={() => setView("edit")} />

      {/* Mobile view switch */}
      <div className="flex gap-1 border-b bg-card/40 p-2 md:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium transition-colors",
              view === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {v === "edit" ? <Pencil className="size-3.5" /> : <Eye className="size-3.5" />}
            {t(`editor.${v}`)}
          </button>
        ))}
        <button
          onClick={() => setFullscreen(true)}
          aria-label={t("editor.fullscreenAria")}
          className="flex items-center justify-center rounded-lg px-3 text-muted-foreground transition-colors hover:bg-muted"
        >
          <Expand className="size-3.5" />
        </button>
      </div>

      <main id="main-content" className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" tabIndex={-1}>
        <Activity mode={formMode}>
          <div className="min-h-0 overflow-y-auto border-r p-4">
            <EditorForm />
          </div>
        </Activity>
        <Activity mode={previewMode}>
          <div className="relative min-h-0 bg-muted/30">
            {/* Pinned maximize control (desktop; mobile uses the tab-bar button). */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-3 right-3 z-10 hidden size-8 bg-background/80 backdrop-blur md:inline-flex"
              aria-label={t("editor.fullscreenAria")}
              onClick={() => setFullscreen(true)}
            >
              <Expand className="size-4" />
            </Button>
            <div className="h-full min-h-0 overflow-y-auto">
              <LivePreview />
            </div>
          </div>
        </Activity>
      </main>

      <FullscreenPreview open={fullscreen} onClose={() => setFullscreen(false)} />
    </div>
  );
}
