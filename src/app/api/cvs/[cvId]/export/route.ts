import { getCurrentUser } from "@/lib/auth/session";
import { notFoundJson, unauthorized } from "@/lib/api/response";
import { renderCvExport } from "@/lib/cv/export-service";
import type { ExportFormat } from "@/workflows/export-cv";

const FORMATS = new Set<ExportFormat>(["pdf", "docx", "zip"]);

function contentDisposition(filename: string) {
  const safeName = filename.replace(/["\r\n]/g, "");
  return `attachment; filename="${safeName}"`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cvId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const formatParam = new URL(request.url).searchParams.get("format") ?? "pdf";
  if (!FORMATS.has(formatParam as ExportFormat)) {
    return Response.json({ error: "Unsupported export format" }, { status: 400 });
  }

  const { cvId } = await params;

  try {
    const file = await renderCvExport(user.id, cvId, formatParam as ExportFormat);
    const body = file.buffer.buffer.slice(
      file.buffer.byteOffset,
      file.buffer.byteOffset + file.buffer.byteLength,
    ) as ArrayBuffer;

    return new Response(body, {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": contentDisposition(file.filename),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CV not found") {
      return notFoundJson();
    }
    throw error;
  }
}
