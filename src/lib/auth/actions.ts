"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { describeRequest } from "./device";
import {
  registerUser,
  loginUser,
  logout,
  completeTwoFactorLogin,
  resolveTwoFactorChallenge,
  AuthFailure,
} from "./service";
import { verifyTotpForUser, consumeBackupCode } from "./totp";
import { sendVerificationEmail, sendPasswordResetEmail, resetPassword } from "./email";
import { getCurrentUser } from "./session";
import { limiters } from "@/lib/redis";

export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "twofa"; challengeId: string }
  | { status: "success" };

async function ctx() {
  return describeRequest(await headers());
}

const registerSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = await ctx();
  const { success } = await limiters.register.limit(c.ip);
  if (!success) return { status: "error", message: "Too many attempts. Try again later." };

  const parsed = registerSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const user = await registerUser(parsed.data, c);
    await sendVerificationEmail(user.id, user.email);
    return { status: "success" };
  } catch (e) {
    if (e instanceof AuthFailure && e.code === "email_taken") {
      return { status: "error", message: "An account with this email already exists." };
    }
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = await ctx();
  const { success } = await limiters.login.limit(c.ip);
  if (!success) return { status: "error", message: "Too many attempts. Try again later." };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const result = await loginUser(parsed.data, c);
    if (result.ok) return { status: "success" };
    return { status: "twofa", challengeId: result.challengeId };
  } catch {
    return { status: "error", message: "Invalid email or password." };
  }
}

const twoFaSchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().trim().min(6).max(12),
});

export async function verifyLoginTwoFactorAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = await ctx();
  const { success } = await limiters.otp.limit(c.ip);
  if (!success) return { status: "error", message: "Too many attempts. Try again later." };

  const parsed = twoFaSchema.safeParse({
    challengeId: formData.get("challengeId"),
    code: formData.get("code"),
  });
  if (!parsed.success) return { status: "error", message: "Enter the 6-digit code." };

  const userId = await resolveTwoFactorChallenge(parsed.data.challengeId);
  if (!userId) return { status: "error", message: "This login attempt expired. Start again." };

  const code = parsed.data.code.replace(/\s/g, "");
  const valid =
    (await verifyTotpForUser(userId, code)) || (await consumeBackupCode(userId, code));
  if (!valid) return { status: "error", message: "Invalid code. Try again." };

  const done = await completeTwoFactorLogin(parsed.data.challengeId, c);
  if (!done) return { status: "error", message: "This login attempt expired. Start again." };
  return { status: "success" };
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await logout(user?.sessionId);
}

// ---------------------------------------------------------------------------
// Password reset + email verification
// ---------------------------------------------------------------------------
export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = await ctx();
  const { success } = await limiters.reset.limit(c.ip);
  if (!success) return { status: "error", message: "Too many attempts. Try again later." };

  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) return { status: "error", message: "Enter a valid email." };

  await sendPasswordResetEmail(email.data);
  // Always report success to avoid user enumeration.
  return { status: "success" };
}

const performResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function performPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = await ctx();
  const { success } = await limiters.reset.limit(c.ip);
  if (!success) return { status: "error", message: "Too many attempts. Try again later." };

  const parsed = performResetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ok = await resetPassword(parsed.data.token, parsed.data.password);
  if (!ok) return { status: "error", message: "This reset link is invalid or expired." };
  return { status: "success" };
}

export async function resendVerificationAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "You must be signed in." };
  if (user.emailVerified) return { status: "success" };
  const { success } = await limiters.otp.limit(user.id);
  if (!success) return { status: "error", message: "Please wait before requesting another email." };
  await sendVerificationEmail(user.id, user.email);
  return { status: "success" };
}
