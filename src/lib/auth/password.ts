import "server-only";
import { hash, verify } from "@node-rs/argon2";

// Argon2id parameters — sensible defaults balancing security and serverless cost.
const OPTS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTS);
}

export async function verifyPassword(digest: string, password: string): Promise<boolean> {
  try {
    return await verify(digest, password, OPTS);
  } catch {
    return false;
  }
}
