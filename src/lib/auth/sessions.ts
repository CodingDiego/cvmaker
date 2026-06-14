import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type Session, type User } from "@/db/schema";
import { hmac, randomToken, safeEqualHex } from "./crypto";
import type { RequestContext } from "./device";

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
// After a rotation, the just-used token stays acceptable for this long so that
// concurrent in-flight requests (one access-token expiry fans out into many
// parallel proxy refreshes) are revalidated instead of being flagged as reuse.
const ROTATION_GRACE_MS = 60 * 1000; // 60 seconds

function buildToken(family: string): { token: string; hash: string } {
  const secret = randomToken(32);
  const token = `${family}.${secret}`;
  return { token, hash: hmac(token) };
}

function familyOf(token: string): string | null {
  const family = token.split(".")[0];
  return family && family.length > 0 ? family : null;
}

export interface IssuedSession {
  sessionId: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Create a session for a fresh login. For `local` (dev/localhost) requests we
 * reuse an existing local session for the same device instead of creating a new
 * row on every reload — keeping the sessions dashboard free of dev redundancy.
 */
export async function createSession(
  userId: string,
  ctx: RequestContext,
): Promise<IssuedSession> {
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

  if (ctx.environment === "local") {
    const [existing] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.environment, "local"),
          eq(sessions.deviceLabel, ctx.deviceLabel),
          isNull(sessions.revokedAt),
        ),
      )
      .limit(1);

    if (existing) {
      const { token, hash } = buildToken(existing.family);
      await db
        .update(sessions)
        .set({
          refreshTokenHash: hash,
          prevRefreshTokenHash: null,
          rotatedAt: null,
          ip: ctx.ip,
          userAgent: ctx.userAgent,
          lastActiveAt: new Date(),
          expiresAt,
        })
        .where(eq(sessions.id, existing.id));
      return { sessionId: existing.id, refreshToken: token, expiresAt };
    }
  }

  const family = randomUUID();
  const { token, hash } = buildToken(family);
  const [row] = await db
    .insert(sessions)
    .values({
      userId,
      family,
      refreshTokenHash: hash,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      deviceLabel: ctx.deviceLabel,
      environment: ctx.environment,
      expiresAt,
    })
    .returning({ id: sessions.id });

  return { sessionId: row!.id, refreshToken: token, expiresAt };
}

export interface RotateResult {
  session: Session;
  user: User;
  refreshToken: string;
}

/**
 * Validate + rotate a refresh token. Implements reuse detection: presenting an
 * already-rotated token revokes the whole family (all logins on that lineage).
 */
export async function rotateRefresh(
  presentedToken: string,
  ctx: RequestContext,
): Promise<RotateResult | null> {
  const family = familyOf(presentedToken);
  if (!family) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.family, family), isNull(sessions.revokedAt)))
    .orderBy(desc(sessions.createdAt))
    .limit(1);

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await revokeSessionById(session.id);
    return null;
  }

  const presentedHash = hmac(presentedToken);
  if (!safeEqualHex(presentedHash, session.refreshTokenHash)) {
    // Reuse of a stale token → compromise. Burn the whole family.
    await revokeFamily(family);
    return null;
  }

  // Valid → rotate in place.
  const { token, hash } = buildToken(family);
  await db
    .update(sessions)
    .set({
      refreshTokenHash: hash,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      lastActiveAt: new Date(),
    })
    .where(eq(sessions.id, session.id));

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return null;

  return { session, user, refreshToken: token };
}

export async function revokeSessionById(sessionId: string) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
}

export async function revokeFamily(family: string) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.family, family));
}

/** Revoke a session owned by a specific user (dashboard action). */
export async function revokeUserSession(userId: string, sessionId: string) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
}

export async function revokeOtherSessions(userId: string, keepSessionId: string) {
  const rows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
  await Promise.all(
    rows.filter((r) => r.id !== keepSessionId).map((r) => revokeSessionById(r.id)),
  );
}

export async function listActiveSessions(userId: string): Promise<Session[]> {
  return db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
    .orderBy(desc(sessions.lastActiveAt));
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const [row] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return row ?? null;
}
