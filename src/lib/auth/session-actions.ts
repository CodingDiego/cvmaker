"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "./session";
import { revokeUserSession, revokeOtherSessions } from "./sessions";

export async function revokeSessionAction(sessionId: string) {
  const user = await requireUser();
  await revokeUserSession(user.id, sessionId);
  revalidatePath("/dashboard/sessions");
  return { ok: true };
}

export async function revokeOtherSessionsAction() {
  const user = await requireUser();
  await revokeOtherSessions(user.id, user.sessionId);
  revalidatePath("/dashboard/sessions");
  return { ok: true };
}
