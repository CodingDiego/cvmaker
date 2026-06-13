import "server-only";
import {
  randomBytes,
  createHmac,
  createHash,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/lib/env";

/** URL-safe random token of `bytes` entropy. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Numeric OTP code, zero-padded to `digits`. */
export function randomOtp(digits = 6): string {
  const max = 10 ** digits;
  const n = randomBytes(4).readUInt32BE(0) % max;
  return n.toString().padStart(digits, "0");
}

/** Keyed (peppered) SHA-256 — used for refresh tokens & single-use tokens. */
export function hmac(value: string): string {
  return createHmac("sha256", env.refreshPepper()).update(value).digest("hex");
}

/** Plain SHA-256 hex (e.g. for backup codes / OTP at rest). */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// ---------------------------------------------------------------------------
// AES-256-GCM encryption for TOTP secrets at rest.
// ---------------------------------------------------------------------------
function aesKey(): Buffer {
  // Derive a fixed 32-byte key from the configured secret.
  return createHash("sha256").update(env.totpEncryptionKey()).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", aesKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(":");
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  const decipher = createDecipheriv("aes-256-gcm", aesKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
