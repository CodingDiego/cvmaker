import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listCvs } from "@/lib/cv/service";
import { Button } from "@/components/ui/button";
import { CvCard } from "@/components/dashboard/cv-card";

export const metadata: Metadata = { title: "My CVs" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const cvs = await listCvs(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My CVs</h1>
          <p className="text-sm text-muted-foreground">Create, edit and export your resumes.</p>
        </div>
        <Button render={<Link href="/templates" />}>
          <Plus className="size-4" /> New CV
        </Button>
      </div>

      {cvs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <p className="font-medium">No CVs yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Pick a template to start building your resume.
          </p>
          <Button render={<Link href="/templates" />}>
            <Plus className="size-4" /> Browse templates
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cvs.map((cv) => (
            <CvCard
              key={cv.id}
              id={cv.id}
              title={cv.title}
              templateId={cv.templateId}
              updatedAt={cv.updatedAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
