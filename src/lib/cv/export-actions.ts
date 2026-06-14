"use server";

import { requireUser } from "@/lib/auth/session";
import { exportCvNow, startExport } from "./export-service";
import type { ExportFormat } from "@/workflows/export-cv";

// The status READ now lives at GET /api/exports/:exportId (see export-queries.ts).
// This action only kicks off the export workflow.
export async function startExportAction(
  cvId: string,
  format: ExportFormat,
): Promise<{ exportId: string }> {
  const user = await requireUser();
  const exportId = await startExport(user.id, cvId, format);
  return { exportId };
}

export async function exportCvAction(
  cvId: string,
  format: ExportFormat,
): Promise<{ url: string }> {
  const user = await requireUser();
  const url = await exportCvNow(user.id, cvId, format);
  return { url };
}
