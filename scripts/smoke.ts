import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateTotpSecret, verifyTotp } from "@/lib/auth/totp";
import { generateSync } from "otplib";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  // 1) Argon2 password hashing (native binary)
  const hash = await hashPassword("hunter2-secret");
  const ok = await verifyPassword(hash, "hunter2-secret");
  const bad = await verifyPassword(hash, "wrong");
  console.log("argon2 verify ok/bad:", ok, bad);
  if (!ok || bad) throw new Error("argon2 mismatch");

  // 2) TOTP roundtrip
  const secret = generateTotpSecret();
  const token = generateSync({ secret });
  const totpOk = await verifyTotp(secret, token);
  console.log("totp verify:", totpOk);
  if (!totpOk) throw new Error("totp mismatch");

  // 3) Neon DB connectivity: insert + select + delete a throwaway user
  const email = `smoke-${Date.now()}@example.com`;
  const [u] = await db.insert(users).values({ email, passwordHash: hash }).returning();
  const [found] = await db.select().from(users).where(eq(users.id, u!.id)).limit(1);
  console.log("db insert/select:", found?.email === email);
  await db.delete(users).where(eq(users.id, u!.id));
  console.log("db delete ok");

  console.log("\n✅ SMOKE TEST PASSED");
}

main().catch((e) => {
  console.error("❌ SMOKE FAILED:", e);
  process.exit(1);
});
