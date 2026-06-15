"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { profileSchema } from "@/lib/auth/auth-schemas";
import { isVerifiedHuman } from "@/lib/security/botid";
import { requireUser } from "./session";

export type AccountActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function updateProfileAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  if (!(await isVerifiedHuman())) {
    return { status: "error", message: "Automated request blocked. Please try again." };
  }
  const user = await requireUser();
  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const name = parsed.data.name.trim();
  await db.update(users).set({ name: name || null, updatedAt: new Date() }).where(eq(users.id, user.id));
  revalidatePath("/dashboard/account");
  return { status: "success" };
}
