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

/**
 * Outcome of presenting a refresh token:
 * - `rotated`     — the live token; a new refresh token was minted (set both cookies).
 * - `revalidated` — a recent predecessor presented inside the grace window by a
 *                   concurrent request; mint a fresh access token only, leave the
 *                   refresh cookie to the sibling request that won the rotation.
 * - `null`        — invalid / expired / reused → caller should clear cookies.
 */
export type RotateOutcome =
  | { kind: "rotated"; user: User; sessionId: string; refreshToken: string }
  | { kind: "revalidated"; user: User; sessionId: string }
  | null;

async function loadUser(userId: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}

/**
 * Validate + rotate a refresh token with reuse detection. Rotation is a
 * compare-and-swap (the UPDATE is guarded by the presented hash) so that out of
 * N concurrent requests exactly one wins the rotation; the losers fall into the
 * grace window and are revalidated. Presenting a token that is neither the live
 * one nor a recent predecessor is treated as compromise and burns the family.
 */
export async function rotateRefresh(
  presentedToken: string,
  ctx: RequestContext,
): Promise<RotateOutcome> {
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

  // Live token → attempt to rotate. The WHERE guard on the current hash makes
  // this atomic against siblings: only the first request flips the row.
  if (safeEqualHex(presentedHash, session.refreshTokenHash)) {
    const { token, hash } = buildToken(family);
    const won = await db
      .update(sessions)
      .set({
        refreshTokenHash: hash,
        prevRefreshTokenHash: presentedHash,
        rotatedAt: new Date(),
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        lastActiveAt: new Date(),
        // Slide the absolute expiry forward on every rotation so the 30-day
        // window is rolling (resets as you keep using the app), matching the
        // rotating cookie's maxAge — instead of a hard cap 30 days after the
        // original login.
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      })
      .where(and(eq(sessions.id, session.id), eq(sessions.refreshTokenHash, presentedHash)))
      .returning({ id: sessions.id });

    const user = await loadUser(session.userId);
    if (!user) return null;

    // Won the race → hand back the freshly minted refresh token.
    if (won.length > 0) {
      return { kind: "rotated", user, sessionId: session.id, refreshToken: token };
    }
    // A sibling rotated first; our token is now the predecessor → revalidate.
    return { kind: "revalidated", user, sessionId: session.id };
  }

  // Grace window: the immediately-previous token, presented by a straggler that
  // started before a sibling's rotation landed. Legitimate, not reuse.
  if (
    session.prevRefreshTokenHash &&
    session.rotatedAt &&
    Date.now() - session.rotatedAt.getTime() < ROTATION_GRACE_MS &&
    safeEqualHex(presentedHash, session.prevRefreshTokenHash)
  ) {
    const user = await loadUser(session.userId);
    if (!user) return null;
    return { kind: "revalidated", user, sessionId: session.id };
  }

  // Neither live nor a recent predecessor → stolen/replayed token. Burn family.
  await revokeFamily(family);
  return null;
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
