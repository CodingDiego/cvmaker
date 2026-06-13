import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { readAuthCookies } from "./cookies";
import { verifyAccessToken } from "./jwt";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  sessionId: string;
}

/**
 * Resolve the current user from the access-token cookie. Token rotation happens
 * in the proxy/refresh endpoint, so here we simply trust a valid access token.
 * Wrapped in React `cache` to dedupe DB reads within a single render pass.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const { accessToken } = await readAuthCookies();
  if (!accessToken) return null;

  const claims = await verifyAccessToken(accessToken);
  if (!claims?.sub) return null;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      emailVerified: users.emailVerified,
      twoFactorEnabled: users.twoFactorEnabled,
    })
    .from(users)
    .where(eq(users.id, claims.sub))
    .limit(1);

  if (!user) return null;
  return { ...user, sessionId: claims.sid };
});

/** Require an authenticated user or redirect to /login. */
export async function requireUser(returnTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login");
  }
  return user;
}

/** Require a verified user (gate features that need a confirmed email). */
export async function requireVerifiedUser(returnTo?: string): Promise<CurrentUser> {
  const user = await requireUser(returnTo);
  if (!user.emailVerified) redirect("/verify");
  return user;
}
