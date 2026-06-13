"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "./session";

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  await db.update(users).set({ name: name || null, updatedAt: new Date() }).where(eq(users.id, user.id));
  revalidatePath("/dashboard/account");
}
