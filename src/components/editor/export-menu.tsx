"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { startExportAction, getExportStatusAction } from "@/lib/cv/export-actions";
import type { ExportFormat } from "@/workflows/export-cv";

const FORMAT_LABEL: Record<ExportFormat, string> = {
  pdf: "PDF",
  docx: "Word (DOCX)",
  zip: "All formats (ZIP)",
};

export function ExportMenu({ cvId }: { cvId: string }) {
  const [exportId, setExportId] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null);

  const startMutation = useMutation({
    mutationFn: (format: ExportFormat) => startExportAction(cvId, format),
    onSuccess: ({ exportId }) => setExportId(exportId),
    onError: () => {
      toast.error("Couldn't start export", { description: "Blob storage may not be configured yet." });
      setActiveFormat(null);
    },
  });

  const { data: status } = useQuery({
    queryKey: ["export", exportId],
    queryFn: () => getExportStatusAction(exportId!),
    enabled: !!exportId,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "done" || s === "error" ? false : 1000;
    },
  });

  // Toast once per terminal poll result. Only side effects here (no setState) —
  // the download UI is derived from `status` directly, avoiding popup-blocked
  // auto-opens and cascading re-renders.
  const toastedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!status || !exportId || toastedRef.current === exportId) return;
    if (status.status === "done" && status.url) {
      toastedRef.current = exportId;
      toast.success("Export ready", { description: `Your ${FORMAT_LABEL[activeFormat ?? "pdf"]} is ready to download.` });
    } else if (status.status === "error") {
      toastedRef.current = exportId;
      toast.error("Export failed", { description: status.error ?? undefined });
    }
  }, [status, exportId, activeFormat]);

  const done = status?.status === "done" || status?.status === "error";
  const busy = startMutation.isPending || (!!exportId && !done);
  const readyUrl = status?.status === "done" ? status.url : null;

  function run(format: ExportFormat) {
    toastedRef.current = null;
    setActiveFormat(format);
    startMutation.mutate(format);
    toast.info(`Generating ${FORMAT_LABEL[format]}…`);
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
          {busy ? `Exporting ${activeFormat ? FORMAT_LABEL[activeFormat] : ""}…` : "Export"}
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
