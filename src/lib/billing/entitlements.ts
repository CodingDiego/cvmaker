import {
  FREE_DRAFT_LIMIT,
  getTemplateAccess,
  isProTemplate,
} from "@/templates/registry";

export type BillingPlan = "free" | "pro";
export type CvLimitReason = "draft_limit" | "template_requires_pro";

export class CvLimitError extends Error {
  constructor(
    public readonly reason: CvLimitReason,
    message: string,
  ) {
    super(message);
    this.name = "CvLimitError";
  }
}

export function isCvLimitError(error: unknown): error is CvLimitError {
  return error instanceof CvLimitError;
}

export async function getUserPlan(userId: string): Promise<BillingPlan> {
  void userId;
  // TODO: Read the persisted Polar subscription entitlement once webhooks store it.
  return "free";
}

export function canUseTemplate(plan: BillingPlan, templateId: string) {
  return plan === "pro" || !isProTemplate(templateId);
}

export function canCreateDraft(plan: BillingPlan, draftCount: number) {
  return plan === "pro" || draftCount < FREE_DRAFT_LIMIT;
}

export function requireTemplateAccess(plan: BillingPlan, templateId: string) {
  if (canUseTemplate(plan, templateId)) return;

  const access = getTemplateAccess(templateId);
  throw new CvLimitError(
    "template_requires_pro",
    access === "pro"
      ? "This template requires a Pro subscription."
      : "This template is not available on your plan.",
  );
}

export function requireDraftAllowance(plan: BillingPlan, draftCount: number) {
  if (canCreateDraft(plan, draftCount)) return;

  throw new CvLimitError(
    "draft_limit",
    `Free accounts can keep up to ${FREE_DRAFT_LIMIT} CV drafts.`,
  );
}

export { FREE_DRAFT_LIMIT };
