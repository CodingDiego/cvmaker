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

export function ExportMenu({ cvId }: { cvId: string }) {
  const [exportId, setExportId] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null);

  const startMutation = useMutation({
    mutationFn: (format: ExportFormat) => startExportAction(cvId, format),
    onSuccess: ({ exportId }) => setExportId(exportId),
    onError: () => {
      toast.error("Couldn't start export. Is Blob storage configured?");
      setActiveFormat(null);
    },
  });

  const { data: status } = useQuery({
    queryKey: ["export", exportId],
    queryFn: () => getExportStatusAction(exportId!),
    enabled: !!exportId,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "done" || s === "error" ? false : 1200;
    },
  });

  // Fire download / toast once per completed export (external side effects only).
  const handledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!status || !exportId || handledRef.current === exportId) return;
    if (status.status === "done" && status.url) {
      handledRef.current = exportId;
      toast.success("Export ready", { description: "Your download is starting." });
      window.open(status.url, "_blank");
    } else if (status.status === "error") {
      handledRef.current = exportId;
      toast.error("Export failed", { description: status.error ?? undefined });
    }
  }, [status, exportId]);

  const done = status?.status === "done" || status?.status === "error";
  const busy = startMutation.isPending || (!!exportId && !done);

  function run(format: ExportFormat) {
    setActiveFormat(format);
    startMutation.mutate(format);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="default" size="sm" disabled={busy} />}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        {busy ? `Exporting ${activeFormat ?? ""}…` : "Export"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
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
  );
}
