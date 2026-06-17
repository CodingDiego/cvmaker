"use client";

import { Download, FileText, FileType, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCvStore } from "@/lib/cv/store";
import { resolveSectionTitle, validateResume } from "@/lib/cv/types";
import type { ExportFormat } from "@/workflows/export-cv";
import { useT } from "@/i18n/provider";

function exportHref(cvId: string, format: ExportFormat) {
  return `/api/cvs/${encodeURIComponent(cvId)}/export?format=${format}`;
}

export function ExportMenu({ cvId, onShowErrors }: { cvId: string; onShowErrors?: () => void }) {
  const t = useT();
  // Block export while any kept section is empty; flag them inline (via the
  // store) and tell the user which ones in a toast.
  function guard(e: React.MouseEvent) {
    const { data, setSectionErrors } = useCvStore.getState();
    const empty = validateResume(data);
    if (empty.length) {
      e.preventDefault();
      setSectionErrors(empty);
      onShowErrors?.();
      const names = empty.map((k) => resolveSectionTitle(data, k)).join(", ");
      toast.error(t("editor.export.emptyToast", { sections: names }));
      return;
    }
    setSectionErrors([]);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="default" size="sm" className="h-9" aria-label={t("editor.export.button")} />}>
        <Download className="size-4" />
        <span className="hidden sm:inline">{t("editor.export.button")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("editor.export.downloadAs")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<a href={exportHref(cvId, "pdf")} download onClick={guard} />}>
            <FileText className="size-4" /> {t("editor.export.pdf")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href={exportHref(cvId, "docx")} download onClick={guard} />}>
            <FileType className="size-4" /> {t("editor.export.docx")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href={exportHref(cvId, "zip")} download onClick={guard} />}>
            <Package className="size-4" /> {t("editor.export.zip")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
