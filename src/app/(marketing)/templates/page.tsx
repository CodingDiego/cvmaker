import type { Metadata } from "next";
import { TEMPLATES } from "@/templates/registry";
import { sampleResume } from "@/lib/cv/types";
import { PreviewThumbnail } from "@/components/templates/preview-thumbnail";
import { UseTemplateButton } from "@/components/templates/template-card";

export const metadata: Metadata = {
  title: "Templates",
  description: "10 ATS-friendly resume templates to choose from.",
};

export default function TemplatesPage() {
  const sample = sampleResume();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Choose a template</h1>
        <p className="mt-2 text-muted-foreground">
          All 10 designs are ATS-friendly. Pick one to start — you can switch any time.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
        {TEMPLATES.map((tokens) => (
          <div
            key={tokens.id}
            className="flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
          >
            <div className="flex justify-center overflow-hidden border-b bg-muted/30 p-4">
              <div className="overflow-hidden rounded-md shadow-sm ring-1 ring-black/5">
                <PreviewThumbnail data={sample} tokens={tokens} width={260} />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex-1">
                <h3 className="font-semibold">{tokens.label}</h3>
                <p className="text-sm text-muted-foreground">{tokens.description}</p>
              </div>
              <UseTemplateButton templateId={tokens.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
