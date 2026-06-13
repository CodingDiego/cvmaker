"use server";

import { updateTag } from "next/cache";
import { requireUser } from "./session";
import { tags } from "@/lib/cache-tags";
import { revokeUserSession, revokeOtherSessions } from "./sessions";

export async function revokeSessionAction(sessionId: string) {
  const user = await requireUser();
  await revokeUserSession(user.id, sessionId);
  updateTag(tags.sessionList(user.id));
  return { ok: true };
}

export async function revokeOtherSessionsAction() {
  const user = await requireUser();
  await revokeOtherSessions(user.id, user.sessionId);
  updateTag(tags.sessionList(user.id));
  return { ok: true };
}
