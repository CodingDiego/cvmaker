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
import { TEMPLATES, getTemplate } from "@/templates/registry";
import { ExportMenu } from "./export-menu";
import { ShareButton } from "./share-button";
import type { SaveStatus } from "@/lib/cv/use-autosave";
import { useT } from "@/i18n/provider";
import type { Translator } from "@/i18n/translate";

function SaveIndicator({ status, t }: { status: SaveStatus; t: Translator }) {
  if (status === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> {t("editor.saving")}
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-primary">
        <Check className="size-3.5" /> {t("editor.saved")}
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <CloudOff className="size-3.5" /> {t("editor.saveFailed")}
      </span>
    );
  return null;
}

const CONTROL = "h-9";

export function EditorToolbar({
  status,
  onShowErrors,
}: {
  status: SaveStatus;
  /** Called when an action (share/export) is blocked by empty sections, so the
   *  shell can reveal the form (and its inline highlights) on mobile. */
  onShowErrors?: () => void;
}) {
  const t = useT();
  const cvId = useCvStore((s) => s.cvId);
  const title = useCvStore((s) => s.title);
  const templateId = useCvStore((s) => s.templateId);
  const accentColor = useCvStore((s) => s.accentColor);
  const setMeta = useCvStore((s) => s.setMeta);

  return (
    <div className="flex flex-col gap-2 border-b bg-card/60 px-3 py-2 backdrop-blur sm:px-4 sm:py-2.5">
      {/* Row 1 — identity + primary actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className={`${CONTROL} shrink-0`}
          aria-label={t("editor.back")}
          render={<Link href="/dashboard" />}
        >
          <ArrowLeft className="size-4" />
        </Button>

        <Input
          value={title}
          onChange={(e) => setMeta({ title: e.target.value })}
          className={`${CONTROL} min-w-0 flex-1 font-medium sm:w-64 sm:flex-none`}
          aria-label={t("editor.titleAria")}
          placeholder={t("editor.titlePlaceholder")}
        />

        <div className="flex shrink-0 items-center gap-2 sm:ml-auto sm:gap-3">
          <ShareButton cvId={cvId} onShowErrors={onShowErrors} />
          <ExportMenu cvId={cvId} onShowErrors={onShowErrors} />
        </div>
      </div>

      {/* Row 2 — formatting controls + save status */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Select
          value={templateId}
          onValueChange={(v) => v && setMeta({ templateId: v, accentColor: getTemplate(v).accentColor })}
        >
          <SelectTrigger className={`${CONTROL} min-w-0 flex-1 sm:w-44 sm:flex-none`} aria-label={t("editor.templateAria")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATES.map((tpl) => (
              <SelectItem key={tpl.id} value={tpl.id}>
                {tpl.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label
          className={`${CONTROL} relative flex w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-input`}
          title={t("editor.accentColor")}
          style={{ background: accentColor }}
        >
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setMeta({ accentColor: e.target.value })}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={t("editor.accentColor")}
          />
        </label>

        <div className="ml-auto flex items-center">
          <SaveIndicator status={status} t={t} />
        </div>
      </div>
    </div>
  );
}
