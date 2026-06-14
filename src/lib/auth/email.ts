import "server-only";
import { Resend } from "resend";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, emailTokens } from "@/db/schema";
import { env } from "@/lib/env";
import {
  assertEmailRuntime,
  assertResendSendResult,
  shouldLogEmailToConsole,
} from "./email-delivery";
import { hmac, randomToken } from "./crypto";
import { hashPassword } from "./password";
import { revokeOtherSessions } from "./sessions";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

let _resend: Resend | null = null;
let _resendApiKey: string | null = null;

function resend(apiKey: string): Resend {
  if (!_resend || _resendApiKey !== apiKey) {
    _resend = new Resend(apiKey);
    _resendApiKey = apiKey;
  }
  return _resend;
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function sendEmail({
  to,
  subject,
  html,
  idempotencyKey,
}: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
}) {
  const runtime = {
    apiKey: env.resendApiKey(),
    from: env.resendFrom(),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: env.vercelEnv(),
  };

  if (shouldLogEmailToConsole(runtime)) {
    console.info(`\n[email -> ${to}] ${subject}\n${htmlToText(html)}\n`);
    return;
  }

  const config = assertEmailRuntime(runtime);
  const result = await resend(config.apiKey!).emails.send(
    {
      from: config.from,
      to,
      subject,
      html,
      text: htmlToText(html),
    },
    { headers: { "Idempotency-Key": idempotencyKey } },
  );

  assertResendSendResult(result, { to, subject });
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
    <p style="color:#aaa;font-size:12px;margin-top:32px">Free CV - ATS-friendly resume builder</p>
  </div>`;
}

export async function sendVerificationEmail(userId: string, email: string) {
  const raw = randomToken(32);
  await db.insert(emailTokens).values({
    userId,
    type: "verify",
    tokenHash: hmac(raw),
    expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
  });

  const url = `${env.appUrl()}/verify?token=${raw}`;
  const tokenHash = hmac(raw);
  await sendEmail({
    to: email,
    subject: "Verify your Free CV email",
    html: layout(
      "Confirm your email",
      "Welcome to Free CV. Confirm your email address to unlock exports and keep your account secure.",
      { url, label: "Verify email" },
    ),
    idempotencyKey: `verify-${tokenHash.slice(0, 32)}`,
  });
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
  await db
    .update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, token.userId));
  return true;
}

export async function sendPasswordResetEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  if (!user) return;

  const raw = randomToken(32);
  await db.insert(emailTokens).values({
    userId: user.id,
    type: "reset",
    tokenHash: hmac(raw),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });

  const url = `${env.appUrl()}/reset?token=${raw}`;
  const tokenHash = hmac(raw);
  await sendEmail({
    to: normalized,
    subject: "Reset your Free CV password",
    html: layout(
      "Reset your password",
      "We received a request to reset your password. This link expires in 1 hour. If you did not request it, you can ignore this email.",
      { url, label: "Reset password" },
    ),
    idempotencyKey: `reset-${tokenHash.slice(0, 32)}`,
  });
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
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, token.userId));
  await db.update(emailTokens).set({ usedAt: new Date() }).where(eq(emailTokens.id, token.id));
  await revokeOtherSessions(token.userId, "");
  return true;
}
