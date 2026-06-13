import "server-only";
import { generateSecret, generateURI, verify } from "otplib";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, twoFactorBackupCodes } from "@/db/schema";
import { encryptSecret, decryptSecret, sha256, safeEqualHex, randomToken } from "./crypto";

const ISSUER = "CVMaker";

export function generateTotpSecret(): string {
  return generateSecret();
}

export function totpAuthUrl(email: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: email, secret });
}

export async function verifyTotp(secret: string, token: string): Promise<boolean> {
  try {
    const result = await verify({ secret, token });
    return result.valid;
  } catch {
    return false;
  }
}

/** Verify a TOTP code for a user whose 2FA is already enabled. */
export async function verifyTotpForUser(userId: string, token: string): Promise<boolean> {
  const [user] = await db
    .select({ secret: users.totpSecret, enabled: users.twoFactorEnabled })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user?.enabled || !user.secret) return false;
  return await verifyTotp(decryptSecret(user.secret), token);
}

/** Generate fresh single-use backup codes, persist hashes, return plaintext. */
export async function regenerateBackupCodes(userId: string, count = 8): Promise<string[]> {
  await db.delete(twoFactorBackupCodes).where(eq(twoFactorBackupCodes.userId, userId));
  const codes = Array.from({ length: count }, () =>
    randomToken(5).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase(),
  );
  await db.insert(twoFactorBackupCodes).values(
    codes.map((code) => ({ userId, codeHash: sha256(code) })),
  );
  return codes;
}

/** Enable 2FA after the user has confirmed a valid TOTP code. */
export async function enableTwoFactor(userId: string, secret: string): Promise<string[]> {
  await db
    .update(users)
    .set({ twoFactorEnabled: true, totpSecret: encryptSecret(secret), updatedAt: new Date() })
    .where(eq(users.id, userId));
  return regenerateBackupCodes(userId);
}

export async function disableTwoFactor(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ twoFactorEnabled: false, totpSecret: null, updatedAt: new Date() })
    .where(eq(users.id, userId));
  await db.delete(twoFactorBackupCodes).where(eq(twoFactorBackupCodes.userId, userId));
}

/** Consume a single-use backup code. Returns true if one matched. */
export async function consumeBackupCode(userId: string, code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase();
  const target = sha256(normalized);
  const rows = await db
    .select()
    .from(twoFactorBackupCodes)
    .where(and(eq(twoFactorBackupCodes.userId, userId), isNull(twoFactorBackupCodes.usedAt)));

  const match = rows.find((r) => safeEqualHex(r.codeHash, target));
  if (!match) return false;
  await db
    .update(twoFactorBackupCodes)
    .set({ usedAt: new Date() })
    .where(eq(twoFactorBackupCodes.id, match.id));
  return true;
}
