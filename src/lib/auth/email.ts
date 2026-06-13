import "server-only";
import { Resend } from "resend";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, emailTokens } from "@/db/schema";
import { env } from "@/lib/env";
import { hmac, randomToken } from "./crypto";
import { hashPassword } from "./password";
import { revokeOtherSessions } from "./sessions";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h

let _resend: Resend | null = null;
function resend(): Resend | null {
  if (!env.hasResend()) return null;
  if (!_resend) _resend = new Resend(env.resendApiKey()!);
  return _resend;
}

async function sendEmail(to: string, subject: string, html: string) {
  const client = resend();
  if (!client) {
    // Dev fallback: surface the email so flows are testable without Resend.
    console.info(`\n[email → ${to}] ${subject}\n${html.replace(/<[^>]+>/g, " ").trim()}\n`);
    return;
  }
  await client.emails.send({ from: env.resendFrom(), to, subject, html });
}

function layout(title: string, body: string, cta?: { url: string; label: string }) {
  return `
  <div style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
    <h1 style="font-size:20px;color:#111">${title}</h1>
    <p style="color:#444;line-height:1.6">${body}</p>
    ${
      cta
        ? `<p style="margin:24px 0"><a href="${cta.url}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${cta.label}</a></p>
           <p style="color:#888;font-size:13px;word-break:break-all">${cta.url}</p>`
        : ""
    }
    <p style="color:#aaa;font-size:12px;margin-top:32px">CVMaker — ATS-friendly resume builder</p>
  </div>`;
}

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------
export async function sendVerificationEmail(userId: string, email: string) {
  const raw = randomToken(32);
  await db.insert(emailTokens).values({
    userId,
    type: "verify",
    tokenHash: hmac(raw),
    expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
  });
  const url = `${env.appUrl()}/verify?token=${raw}`;
  await sendEmail(
    email,
    "Verify your CVMaker email",
    layout(
      "Confirm your email",
      "Welcome to CVMaker! Confirm your email address to unlock exports and keep your account secure.",
      { url, label: "Verify email" },
    ),
  );
}

export async function verifyEmailToken(raw: string): Promise<boolean> {
  const hash = hmac(raw);
  const [token] = await db
    .select()
    .from(emailTokens)
    .where(and(eq(emailTokens.tokenHash, hash), eq(emailTokens.type, "verify"), isNull(emailTokens.usedAt)))
    .limit(1);
  if (!token || token.expiresAt.getTime() < Date.now()) return false;

  await db.update(emailTokens).set({ usedAt: new Date() }).where(eq(emailTokens.id, token.id));
  await db.update(users).set({ emailVerified: true, updatedAt: new Date() }).where(eq(users.id, token.userId));
  return true;
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------
export async function sendPasswordResetEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  // Always behave the same to avoid user enumeration.
  if (!user) return;

  const raw = randomToken(32);
  await db.insert(emailTokens).values({
    userId: user.id,
    type: "reset",
    tokenHash: hmac(raw),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });
  const url = `${env.appUrl()}/reset?token=${raw}`;
  await sendEmail(
    normalized,
    "Reset your CVMaker password",
    layout(
      "Reset your password",
      "We received a request to reset your password. This link expires in 1 hour. If you didn't request it, you can ignore this email.",
      { url, label: "Reset password" },
    ),
  );
}

export async function resetPassword(raw: string, newPassword: string): Promise<boolean> {
  const hash = hmac(raw);
  const [token] = await db
    .select()
    .from(emailTokens)
    .where(and(eq(emailTokens.tokenHash, hash), eq(emailTokens.type, "reset"), isNull(emailTokens.usedAt)))
    .limit(1);
  if (!token || token.expiresAt.getTime() < Date.now()) return false;

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, token.userId));
  await db.update(emailTokens).set({ usedAt: new Date() }).where(eq(emailTokens.id, token.id));
  // Invalidate all existing sessions after a password reset.
  await revokeOtherSessions(token.userId, "");
  return true;
}
