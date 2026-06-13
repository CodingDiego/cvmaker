import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { signAccessToken } from "./jwt";
import { createSession, rotateRefresh, revokeSessionById } from "./sessions";
import { setAuthCookies, clearAuthCookies, readAuthCookies } from "./cookies";
import { randomToken } from "./crypto";
import { kv } from "@/lib/redis";
import type { RequestContext } from "./device";

export type AuthError =
  | "email_taken"
  | "invalid_credentials"
  | "rate_limited"
  | "not_found"
  | "weak_password";

export class AuthFailure extends Error {
  constructor(public code: AuthError) {
    super(code);
  }
}

const TWO_FA_TTL = 5 * 60; // seconds

/** Mint an access token + rotating refresh session and set both cookies. */
async function establishSession(user: User, ctx: RequestContext) {
  const { sessionId, refreshToken } = await createSession(user.id, ctx);
  const accessToken = await signAccessToken({
    userId: user.id,
    sessionId,
    email: user.email,
    name: user.name,
  });
  await setAuthCookies(accessToken, refreshToken);
  return { sessionId };
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export async function registerUser(
  input: { email: string; password: string; name?: string },
  ctx: RequestContext,
): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) throw new AuthFailure("email_taken");

  const passwordHash = await hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name: input.name?.trim() || null })
    .returning();

  await establishSession(user!, ctx);
  return user!;
}

// ---------------------------------------------------------------------------
// Login (with optional 2FA gate)
// ---------------------------------------------------------------------------
export type LoginResult =
  | { ok: true }
  | { ok: false; twoFactorRequired: true; challengeId: string };

export async function loginUser(
  input: { email: string; password: string },
  ctx: RequestContext,
): Promise<LoginResult> {
  const email = input.email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    // Mitigate user enumeration with a dummy verify.
    await verifyPassword("$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", input.password);
    throw new AuthFailure("invalid_credentials");
  }

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) throw new AuthFailure("invalid_credentials");

  if (user.twoFactorEnabled) {
    const challengeId = randomToken(24);
    await kv().set(`2fa:${challengeId}`, user.id, { ex: TWO_FA_TTL });
    return { ok: false, twoFactorRequired: true, challengeId };
  }

  await establishSession(user, ctx);
  return { ok: true };
}

/** Resolve a pending 2FA challenge → returns the userId or null if expired. */
export async function resolveTwoFactorChallenge(challengeId: string): Promise<string | null> {
  return kv().get<string>(`2fa:${challengeId}`);
}

/** Complete login after a successful 2FA verification. */
export async function completeTwoFactorLogin(
  challengeId: string,
  ctx: RequestContext,
): Promise<boolean> {
  const userId = await resolveTwoFactorChallenge(challengeId);
  if (!userId) return false;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return false;
  await kv().del(`2fa:${challengeId}`);
  await establishSession(user, ctx);
  return true;
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
export async function logout(sessionId?: string) {
  if (sessionId) await revokeSessionById(sessionId);
  await clearAuthCookies();
}

// ---------------------------------------------------------------------------
// Refresh — rotate the refresh token and mint a new access token.
// ---------------------------------------------------------------------------
export async function refreshSession(ctx: RequestContext): Promise<boolean> {
  const { refreshToken } = await readAuthCookies();
  if (!refreshToken) return false;

  const result = await rotateRefresh(refreshToken, ctx);
  if (!result) {
    await clearAuthCookies();
    return false;
  }

  const accessToken = await signAccessToken({
    userId: result.user.id,
    sessionId: result.session.id,
    email: result.user.email,
    name: result.user.name,
  });
  await setAuthCookies(accessToken, result.refreshToken);
  return true;
}
