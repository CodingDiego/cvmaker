"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, FileText, FileType, Loader2, Package } from "lucide-react";
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
import { exportCvAction } from "@/lib/cv/export-actions";
import type { ExportFormat } from "@/workflows/export-cv";

const FORMAT_LABEL: Record<ExportFormat, string> = {
  pdf: "PDF",
  docx: "Word (DOCX)",
  zip: "All formats (ZIP)",
};

export function ExportMenu({ cvId }: { cvId: string }) {
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);

  const exportMutation = useMutation({
    mutationFn: (format: ExportFormat) => exportCvAction(cvId, format),
    onSuccess: ({ url }) => {
      setReadyUrl(url);
      toast.success("Export ready", {
        description: `Your ${FORMAT_LABEL[activeFormat ?? "pdf"]} is ready to download.`,
      });
    },
    onError: (error) => {
      toast.error("Couldn't export CV", {
        description: error instanceof Error ? error.message : "Blob storage may not be configured yet.",
      });
      setActiveFormat(null);
    },
  });

  const busy = exportMutation.isPending;

  function run(format: ExportFormat) {
    setActiveFormat(format);
    setReadyUrl(null);
    exportMutation.mutate(format);
    toast.info(`Generating ${FORMAT_LABEL[format]}...`);
  }

  return (
    <div className="flex items-center gap-2">
      {readyUrl && (
        <Button
          size="sm"
          variant="outline"
          className="h-9 border-primary/40 text-primary"
          render={<a href={readyUrl} target="_blank" rel="noreferrer noopener" download />}
        >
          <Download className="size-4" /> Download {FORMAT_LABEL[activeFormat ?? "pdf"]}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="default" size="sm" className="h-9" disabled={busy} />}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? `Exporting ${activeFormat ? FORMAT_LABEL[activeFormat] : ""}...` : "Export"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Download as</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => run("pdf")}>
              <FileText className="size-4" /> PDF
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => run("docx")}>
              <FileType className="size-4" /> Word (DOCX)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => run("zip")}>
              <Package className="size-4" /> All formats (ZIP)
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
