"use server";

import { requireUser } from "@/lib/auth/session";
import { startExport, getExportStatus, type ExportStatus } from "./export-service";
import type { ExportFormat } from "@/workflows/export-cv";

export async function startExportAction(
  cvId: string,
  format: ExportFormat,
): Promise<{ exportId: string }> {
  const user = await requireUser();
  const exportId = await startExport(user.id, cvId, format);
  return { exportId };
}

export async function getExportStatusAction(exportId: string): Promise<ExportStatus | null> {
  const user = await requireUser();
  return getExportStatus(user.id, exportId);
}
