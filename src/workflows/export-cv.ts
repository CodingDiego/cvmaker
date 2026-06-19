import { and, eq } from "drizzle-orm";
import JSZip from "jszip";
import { db } from "@/db";
import { cvs, exports } from "@/db/schema";
import { renderPdf } from "@/templates/render/pdf";
import { renderDocx } from "@/templates/render/docx";
import { uploadExport, getBytes, defaultStore } from "@/lib/blob";
import { resumeSchema, type ResumeData } from "@/lib/cv/types";

/**
 * CV export pipeline, orchestrated with the Workflow DevKit. Each render +
 * upload is a durable, retryable step; the workflow function only stitches
 * them together (and can fan PDF+DOCX out in parallel for the ZIP case).
 */

export type ExportFormat = "pdf" | "docx" | "zip";

interface CvContext {
  data: ResumeData;
  templateId: string;
  accentColor: string;
  fontFamily: string;
  title: string;
}

function slug(title: string): string {
  return (title || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resume";
}

// --- Steps (full Node.js access) ---

async function loadCv(cvId: string, userId: string): Promise<CvContext | null> {
  "use step";
  const [row] = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .limit(1);
  if (!row) return null;
  return {
    data: resumeSchema.parse(row.data),
    templateId: row.templateId,
    accentColor: row.accentColor,
    fontFamily: row.fontFamily,
    title: row.title,
  };
}

async function buildPdf(ctx: CvContext, userId: string): Promise<string> {
  "use step";
  const buffer = await renderPdf(ctx.data, ctx);
  return uploadExport(`exports/${userId}/${slug(ctx.title)}.pdf`, buffer, "application/pdf");
}

async function buildDocx(ctx: CvContext, userId: string): Promise<string> {
  "use step";
  const buffer = await renderDocx(ctx.data, ctx);
  return uploadExport(
    `exports/${userId}/${slug(ctx.title)}.docx`,
    buffer,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
}

async function zipFiles(userId: string, title: string, pdfUrl: string, docxUrl: string): Promise<string> {
  "use step";
  const store = defaultStore();
  const [pdf, docx] = await Promise.all([getBytes(store, pdfUrl), getBytes(store, docxUrl)]);
  const zip = new JSZip();
  const base = slug(title);
  zip.file(`${base}.pdf`, pdf);
  zip.file(`${base}.docx`, docx);
  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return uploadExport(`exports/${userId}/${base}.zip`, buffer, "application/zip");
}

async function markDone(exportId: string, url: string) {
  "use step";
  await db.update(exports).set({ status: "done", blobUrl: url }).where(eq(exports.id, exportId));
}

async function markError(exportId: string, error: string) {
  "use step";
  await db.update(exports).set({ status: "error", error }).where(eq(exports.id, exportId));
}

// --- Workflow (orchestration only) ---

export async function exportCvWorkflow(
  exportId: string,
  cvId: string,
  userId: string,
  format: ExportFormat,
) {
  "use workflow";
  const ctx = await loadCv(cvId, userId);
  if (!ctx) {
    await markError(exportId, "CV not found");
    return { ok: false };
  }

  try {
    let finalUrl: string;
    if (format === "pdf") {
      finalUrl = await buildPdf(ctx, userId);
    } else if (format === "docx") {
      finalUrl = await buildDocx(ctx, userId);
    } else {
      const [pdfUrl, docxUrl] = await Promise.all([buildPdf(ctx, userId), buildDocx(ctx, userId)]);
      finalUrl = await zipFiles(userId, ctx.title, pdfUrl, docxUrl);
    }
    await markDone(exportId, finalUrl);
    return { ok: true, url: finalUrl };
  } catch (e) {
    await markError(exportId, e instanceof Error ? e.message : String(e));
    return { ok: false };
  }
}
