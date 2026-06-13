import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cvs, type Cv } from "@/db/schema";
import {
  requireDraftAllowance,
  requireTemplateAccess,
} from "@/lib/billing/entitlements";
import { getUserPlan } from "@/lib/billing/entitlements-server";
import { getTemplate } from "@/templates/registry";
import { sampleResume, type ResumeData } from "./types";

export async function listCvs(userId: string): Promise<Cv[]> {
  return db.select().from(cvs).where(eq(cvs.userId, userId)).orderBy(desc(cvs.updatedAt));
}

export async function getCv(userId: string, cvId: string): Promise<Cv | null> {
  const [row] = await db
    .select()
    .from(cvs)
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function createCv(
  userId: string,
  input: { title?: string; templateId?: string } = {},
): Promise<Cv> {
  const templateId = getTemplate(input.templateId || "classic").id;
  const plan = await getUserPlan(userId);
  requireTemplateAccess(plan, templateId);
  requireDraftAllowance(plan, (await listCvs(userId)).length);

  const [row] = await db
    .insert(cvs)
    .values({
      userId,
      title: input.title?.trim() || "Untitled CV",
      templateId,
      data: sampleResume(),
    })
    .returning();
  return row!;
}

export async function updateCvData(
  userId: string,
  cvId: string,
  data: ResumeData,
): Promise<void> {
  await db
    .update(cvs)
    .set({ data, updatedAt: new Date() })
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)));
}

export async function updateCvMeta(
  userId: string,
  cvId: string,
  meta: Partial<Pick<Cv, "title" | "templateId" | "accentColor" | "fontFamily">>,
): Promise<void> {
  const nextMeta = { ...meta };
  if (nextMeta.templateId) {
    const templateId = getTemplate(nextMeta.templateId).id;
    const plan = await getUserPlan(userId);
    requireTemplateAccess(plan, templateId);
    nextMeta.templateId = templateId;
  }

  await db
    .update(cvs)
    .set({ ...nextMeta, updatedAt: new Date() })
    .where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)));
}

export async function deleteCv(userId: string, cvId: string): Promise<void> {
  await db.delete(cvs).where(and(eq(cvs.id, cvId), eq(cvs.userId, userId)));
}
