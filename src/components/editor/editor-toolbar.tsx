"use client";

import { Link } from "@/components/link";
import { ArrowLeft, Check, CloudOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCvStore } from "@/lib/cv/store";
import { FREE_TEMPLATES } from "@/templates/registry";
import { FONT_OPTIONS } from "@/lib/font-config";
import { ExportMenu } from "./export-menu";
import { ShareButton } from "./share-button";
import type { SaveStatus } from "@/lib/cv/use-autosave";

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> Saving…
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-primary">
        <Check className="size-3.5" /> Saved
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <CloudOff className="size-3.5" /> Save failed
      </span>
    );
  return null;
}

const CONTROL = "h-9";

export function EditorToolbar({ status }: { status: SaveStatus }) {
  const cvId = useCvStore((s) => s.cvId);
  const title = useCvStore((s) => s.title);
  const templateId = useCvStore((s) => s.templateId);
  const fontFamily = useCvStore((s) => s.fontFamily);
  const accentColor = useCvStore((s) => s.accentColor);
  const setMeta = useCvStore((s) => s.setMeta);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-card/60 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className={CONTROL}
        aria-label="Back to dashboard"
        render={<Link href="/dashboard" />}
      >
        <ArrowLeft className="size-4" />
      </Button>

      <Input
        value={title}
        onChange={(e) => setMeta({ title: e.target.value })}
        className={`${CONTROL} w-40 font-medium sm:w-48`}
        aria-label="CV title"
        placeholder="Untitled CV"
      />

      <div className="flex items-center gap-2">
        <Select value={templateId} onValueChange={(v) => v && setMeta({ templateId: v })}>
          <SelectTrigger className={`${CONTROL} w-36`} aria-label="Template">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREE_TEMPLATES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fontFamily} onValueChange={(v) => v && setMeta({ fontFamily: v })}>
          <SelectTrigger className={`${CONTROL} w-32`} aria-label="Font">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label
          className={`${CONTROL} relative flex w-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-input`}
          title="Accent color"
          style={{ background: accentColor }}
        >
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setMeta({ accentColor: e.target.value })}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Accent color"
          />
        </label>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <SaveIndicator status={status} />
        <ShareButton cvId={cvId} />
        <ExportMenu cvId={cvId} />
      </div>
    </div>
  );
}
