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

function exportHref(cvId: string, format: ExportFormat) {
  return `/api/cvs/${encodeURIComponent(cvId)}/export?format=${format}`;
}

export function ExportMenu({ cvId }: { cvId: string }) {
  // Block export while any kept section is empty; flag them inline (via the
  // store) and tell the user which ones in a toast.
  function guard(e: React.MouseEvent) {
    const { data, setSectionErrors } = useCvStore.getState();
    const empty = validateResume(data);
    if (empty.length) {
      e.preventDefault();
      setSectionErrors(empty);
      const names = empty.map((k) => resolveSectionTitle(data, k)).join(", ");
      toast.error(`Empty section${empty.length > 1 ? "s" : ""}: ${names}. Add details or remove ${empty.length > 1 ? "them" : "it"} before exporting.`);
      return;
    }
    setSectionErrors([]);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="default" size="sm" className="h-9" />}>
        <Download className="size-4" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Download as</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<a href={exportHref(cvId, "pdf")} download onClick={guard} />}>
            <FileText className="size-4" /> PDF
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href={exportHref(cvId, "docx")} download onClick={guard} />}>
            <FileType className="size-4" /> Word (DOCX)
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href={exportHref(cvId, "zip")} download onClick={guard} />}>
            <Package className="size-4" /> All formats (ZIP)
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
