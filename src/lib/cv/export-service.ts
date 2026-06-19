import "server-only";
import { and, eq } from "drizzle-orm";
import JSZip from "jszip";
import { start } from "workflow/api";
import { db } from "@/db";
import { cvs, exports } from "@/db/schema";
import { resumeSchema } from "./types";
import { renderPdf } from "@/templates/render/pdf";
import { renderDocx } from "@/templates/render/docx";
import { uploadExport } from "@/lib/blob";
import { requireTemplateAccess } from "@/lib/billing/entitlements";
import { getUserPlan } from "@/lib/billing/entitlements-server";
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

const CONTENT_TYPES: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  zip: "application/zip",
};

export interface CvExportFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

async function loadCvContext(userId: string, cvId: string): Promise<CvContext | null> {
  const [row] = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .limit(1);
  if (!row) return null;
  return {
    // Normalize legacy/partial documents (e.g. string[] skills) before render.
    data: resumeSchema.parse(row.data),
    templateId: row.templateId,
    accentColor: row.accentColor,
    fontFamily: row.fontFamily,
    title: row.title,
  };
}

async function renderPdfFile(ctx: CvContext): Promise<CvExportFile> {
  const buffer = await renderPdf(ctx.data, ctx);
  return {
    buffer,
    filename: `${slug(ctx.title)}.pdf`,
    contentType: CONTENT_TYPES.pdf,
  };
}

async function renderDocxFile(ctx: CvContext): Promise<CvExportFile> {
  const buffer = await renderDocx(ctx.data, ctx);
  return {
    buffer,
    filename: `${slug(ctx.title)}.docx`,
    contentType: CONTENT_TYPES.docx,
  };
}

async function renderZipFile(ctx: CvContext): Promise<CvExportFile> {
  const [pdf, docx] = await Promise.all([renderPdfFile(ctx), renderDocxFile(ctx)]);
  const zip = new JSZip();
  const base = slug(ctx.title);
  zip.file(pdf.filename, pdf.buffer);
  zip.file(docx.filename, docx.buffer);
  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return {
    buffer,
    filename: `${base}.zip`,
    contentType: CONTENT_TYPES.zip,
  };
}

export async function renderCvExport(
  userId: string,
  cvId: string,
  format: ExportFormat,
): Promise<CvExportFile> {
  const ctx = await loadCvContext(userId, cvId);
  if (!ctx) throw new Error("CV not found");
  // Re-validate entitlement at export time: a CV created under Pro must not be
  // exportable once the plan lapses to free. Create/update gate the same way.
  requireTemplateAccess(await getUserPlan(userId), ctx.templateId);
  if (format === "pdf") return renderPdfFile(ctx);
  if (format === "docx") return renderDocxFile(ctx);
  return renderZipFile(ctx);
}

export async function exportCvNow(
  userId: string,
  cvId: string,
  format: ExportFormat,
): Promise<string> {
  const file = await renderCvExport(userId, cvId, format);
  return uploadExport(`exports/${userId}/${file.filename}`, file.buffer, file.contentType);
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
