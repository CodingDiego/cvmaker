import { NextResponse } from "next/server";
import { updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserPlan } from "@/lib/billing/entitlements-server";
import { isCvLimitError } from "@/lib/billing/entitlements";
import { tags } from "@/lib/cache-tags";
import { createCv } from "@/lib/cv/service";
import { getTemplateAccess } from "@/templates/registry";

/**
 * `/start/<templateId>` — resolve a "use this template" intent.
 *
 * This is a GET route handler (not a page) on purpose: it has a side effect
 * (creating a CV) and route handlers are never invoked by `<Link>` prefetching,
 * so the CV is only created on a real navigation.
 *
 * Logged-out visitors are sent through auth with `?next=` pointing back here, so
 * after they sign up / sign in they land exactly where they intended: a fresh
 * editor for the chosen template. Plan/limit gating mirrors `UseTemplateButton`
 * so the server stays the source of truth.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ lang: string; templateId: string }> },
) {
  const { lang, templateId } = await params;
  const here = `/${lang}/start/${encodeURIComponent(templateId)}`;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL(`/${lang}/register?next=${encodeURIComponent(here)}`, req.url));
  }

  // Gate Pro templates behind a Pro plan.
  if (getTemplateAccess(templateId) === "pro") {
    const plan = await getUserPlan(user.id);
    if (plan !== "pro") {
      return NextResponse.redirect(new URL("/api/checkout", req.url));
    }
  }

  try {
    const cv = await createCv(user.id, { templateId });
    updateTag(tags.cvList(user.id));
    return NextResponse.redirect(new URL(`/${lang}/editor/${cv.id}`, req.url));
  } catch (error) {
    if (isCvLimitError(error)) {
      // Out of free drafts — nudge to upgrade rather than failing.
      return NextResponse.redirect(new URL("/api/checkout", req.url));
    }
    throw error;
  }
}
