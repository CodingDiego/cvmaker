import "server-only";
import { and, eq } from "drizzle-orm";
import JSZip from "jszip";
import { start } from "workflow/api";
import { db } from "@/db";
import { cvs, exports } from "@/db/schema";
import { renderPdf } from "@/templates/render/pdf";
import { renderDocx } from "@/templates/render/docx";
import { uploadExport, getBytes, defaultStore } from "@/lib/blob";
import { exportCvWorkflow, type ExportFormat } from "@/workflows/export-cv";

interface CvContext {
  data: typeof cvs.$inferSelect.data;
  templateId: string;
  accentColor: string;
  fontFamily: string;
  title: string;
}

function slug(title: string): string {
  return (title || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resume";
}

async function loadCvContext(userId: string, cvId: string): Promise<CvContext | null> {
  const [row] = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .limit(1);
  if (!row) return null;
  return {
    data: row.data,
    templateId: row.templateId,
    accentColor: row.accentColor,
    fontFamily: row.fontFamily,
    title: row.title,
  };
}

async function uploadPdf(ctx: CvContext, userId: string): Promise<string> {
  const buffer = await renderPdf(ctx.data, ctx);
  return uploadExport(`exports/${userId}/${slug(ctx.title)}.pdf`, buffer, "application/pdf");
}

async function uploadDocx(ctx: CvContext, userId: string): Promise<string> {
  const buffer = await renderDocx(ctx.data, ctx);
  return uploadExport(
    `exports/${userId}/${slug(ctx.title)}.docx`,
    buffer,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
}

async function uploadZip(userId: string, title: string, pdfUrl: string, docxUrl: string): Promise<string> {
  const store = defaultStore();
  const [pdf, docx] = await Promise.all([getBytes(store, pdfUrl), getBytes(store, docxUrl)]);
  const zip = new JSZip();
  const base = slug(title);
  zip.file(`${base}.pdf`, pdf);
  zip.file(`${base}.docx`, docx);
  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return uploadExport(`exports/${userId}/${base}.zip`, buffer, "application/zip");
}

export async function exportCvNow(
  userId: string,
  cvId: string,
  format: ExportFormat,
): Promise<string> {
  const ctx = await loadCvContext(userId, cvId);
  if (!ctx) throw new Error("CV not found");
  if (format === "pdf") return uploadPdf(ctx, userId);
  if (format === "docx") return uploadDocx(ctx, userId);

  const [pdfUrl, docxUrl] = await Promise.all([uploadPdf(ctx, userId), uploadDocx(ctx, userId)]);
  return uploadZip(userId, ctx.title, pdfUrl, docxUrl);
}

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
