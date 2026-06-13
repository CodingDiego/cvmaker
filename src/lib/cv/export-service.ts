import "server-only";
import { and, eq } from "drizzle-orm";
import { start } from "workflow/api";
import { db } from "@/db";
import { exports } from "@/db/schema";
import { exportCvWorkflow, type ExportFormat } from "@/workflows/export-cv";

export async function startExport(
  userId: string,
  cvId: string,
  format: ExportFormat,
): Promise<string> {
  const [row] = await db
    .insert(exports)
    .values({ cvId, userId, format, status: "pending" })
    .returning({ id: exports.id });

  const exportId = row!.id;
  const run = await start(exportCvWorkflow, [exportId, cvId, userId, format]);
  await db
    .update(exports)
    .set({ status: "running", workflowRunId: run.runId })
    .where(eq(exports.id, exportId));

  return exportId;
}

export interface ExportStatus {
  status: "pending" | "running" | "done" | "error";
  url: string | null;
  error: string | null;
}

export async function getExportStatus(
  userId: string,
  exportId: string,
): Promise<ExportStatus | null> {
  const [row] = await db
    .select()
    .from(exports)
    .where(and(eq(exports.id, exportId), eq(exports.userId, userId)))
    .limit(1);
  if (!row) return null;
  return { status: row.status, url: row.blobUrl, error: row.error };
}
