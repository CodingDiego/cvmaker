"use server";

import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { requireUser } from "./session";
import {
  generateTotpSecret,
  totpAuthUrl,
  verifyTotp,
  enableTwoFactor,
  disableTwoFactor,
  regenerateBackupCodes,
} from "./totp";
import { kv } from "@/lib/redis";

const SETUP_TTL = 10 * 60;

export interface SetupData {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
}

/** Begin 2FA enrollment: generate a secret + QR and stash it briefly in Redis. */
export async function startTwoFactorSetupAction(): Promise<SetupData> {
  const user = await requireUser();
  const secret = generateTotpSecret();
  const otpauthUrl = totpAuthUrl(user.email, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 });
  await kv().set(`2fa-setup:${user.id}`, secret, { ex: SETUP_TTL });
  return { secret, otpauthUrl, qrDataUrl };
}

export type TwoFaResult =
  | { ok: true; backupCodes?: string[] }
  | { ok: false; error: string };

/** Confirm enrollment with a valid TOTP code → enable 2FA + return backup codes. */
export async function confirmTwoFactorSetupAction(code: string): Promise<TwoFaResult> {
  const user = await requireUser();
  const secret = await kv().get<string>(`2fa-setup:${user.id}`);
  if (!secret) return { ok: false, error: "Setup expired. Start again." };

  const valid = await verifyTotp(secret, code.replace(/\s/g, ""));
  if (!valid) return { ok: false, error: "Invalid code. Try again." };

  const backupCodes = await enableTwoFactor(user.id, secret);
  await kv().del(`2fa-setup:${user.id}`);
  revalidatePath("/dashboard/security");
  return { ok: true, backupCodes };
}

export async function disableTwoFactorAction(): Promise<TwoFaResult> {
  const user = await requireUser();
  await disableTwoFactor(user.id);
  revalidatePath("/dashboard/security");
  return { ok: true };
}

export async function regenerateBackupCodesAction(): Promise<TwoFaResult> {
  const user = await requireUser();
  const backupCodes = await regenerateBackupCodes(user.id);
  revalidatePath("/dashboard/security");
  return { ok: true, backupCodes };
}
