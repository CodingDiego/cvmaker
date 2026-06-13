import { describe, expect, test } from "bun:test";
import {
  canCreateDraft,
  canUseTemplate,
  FREE_DRAFT_LIMIT,
} from "@/lib/billing/entitlements";
import {
  FREE_TEMPLATES,
  PRO_TEMPLATES,
  TEMPLATES,
  getTemplateAccess,
} from "@/templates/registry";

describe("billing entitlements", () => {
  test("keeps exactly 10 free templates", () => {
    expect(FREE_TEMPLATES).toHaveLength(10);
    expect(FREE_TEMPLATES.every((template) => getTemplateAccess(template.id) === "free")).toBe(
      true,
    );
  });

  test("ships premium templates behind the pro plan", () => {
    expect(PRO_TEMPLATES.length).toBeGreaterThanOrEqual(10);
    expect(PRO_TEMPLATES.every((template) => !canUseTemplate("free", template.id))).toBe(true);
    expect(PRO_TEMPLATES.every((template) => canUseTemplate("pro", template.id))).toBe(true);
  });

  test("limits free users to five drafts", () => {
    expect(FREE_DRAFT_LIMIT).toBe(5);
    expect(canCreateDraft("free", 4)).toBe(true);
    expect(canCreateDraft("free", 5)).toBe(false);
    expect(canCreateDraft("pro", 99)).toBe(true);
  });

  test("template ids are unique", () => {
    const ids = TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
