"use client";

import { Download, FileText, FileType, Package } from "lucide-react";
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
import type { ExportFormat } from "@/workflows/export-cv";

function exportHref(cvId: string, format: ExportFormat) {
  return `/api/cvs/${encodeURIComponent(cvId)}/export?format=${format}`;
}

export function ExportMenu({ cvId }: { cvId: string }) {
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
          <DropdownMenuItem render={<a href={exportHref(cvId, "pdf")} download />}>
            <FileText className="size-4" /> PDF
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href={exportHref(cvId, "docx")} download />}>
            <FileType className="size-4" /> Word (DOCX)
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href={exportHref(cvId, "zip")} download />}>
            <Package className="size-4" /> All formats (ZIP)
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
