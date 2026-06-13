import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getCv } from "@/lib/cv/service";
import { resumeSchema } from "@/lib/cv/types";
import { EditorShell } from "@/components/editor/editor-shell";

export const metadata: Metadata = { title: "Editor" };

export default async function EditorPage({ params }: { params: Promise<{ cvId: string }> }) {
  const { cvId } = await params;
  const user = await requireUser(`/editor/${cvId}`);
  const cv = await getCv(user.id, cvId);
  if (!cv) notFound();

  return (
    <EditorShell
      cv={{
        cvId: cv.id,
        title: cv.title,
        templateId: cv.templateId,
        accentColor: cv.accentColor,
        fontFamily: cv.fontFamily,
        // Normalize older/partial documents to the current schema shape.
        data: resumeSchema.parse(cv.data),
      }}
    />
  );
}
