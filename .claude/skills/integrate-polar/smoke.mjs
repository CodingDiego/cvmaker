#!/usr/bin/env node
// Smoke driver for the Polar payments integration.
//
// Boots `next dev` against THIS app and drives the three Polar route handlers
// end-to-end. Everything here is deterministic and offline — no Polar API call
// is made, because each assertion targets a branch the adapters resolve locally:
//
//   GET  /api/checkout        -> 307 -> checkout link       (route mounted, redirect built)
//   GET  /api/portal          -> 307 -> /login             (route mounted, anon redirect)
//   POST /api/webhooks/polar  -> 403  (bad signature)      (signature gate REJECTS)
//   POST /api/webhooks/polar  -> !403 (valid signature)    (signature gate ACCEPTS)
//
// The webhook signature is produced exactly the way Polar does it: the raw
// POLAR_WEBHOOK_SECRET is base64-encoded, then standard-webhooks signs the body.
// That is the real verification path the live route runs.
//
// Run from the project root:   node .claude/skills/integrate-polar/smoke.mjs
//
// Requires: standardwebhooks (already a transitive dep of @polar-sh/sdk) and a
// Node with global fetch (>=18).

import { spawn, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sw from "standardwebhooks";

const { Webhook } = sw;

const PORT = 3999;
const BASE = `http://localhost:${PORT}`;
const SECRET = "smoke_whsec_test_secret";
const CHECKOUT_LINK = "https://buy.polar.sh/polar_cl_smoke_test";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? ` — ${detail}` : ""}`);
}

// --- sign a webhook the way Polar's validateEvent expects ---------------------
function signedHeaders(body, { tamper = false } = {}) {
  const base64Secret = Buffer.from(SECRET, "utf-8").toString("base64");
  const wh = new Webhook(base64Secret);
  const id = "msg_smoke_0001";
  const ts = new Date();
  const signed = tamper ? body + " " : body; // sign different bytes than we send
  const signature = wh.sign(id, ts, signed);
  return {
    "webhook-id": id,
    "webhook-timestamp": String(Math.floor(ts.getTime() / 1000)),
    "webhook-signature": signature,
    "content-type": "application/json",
  };
}

async function waitForReady(timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/checkout`, { redirect: "manual" });
      if (res.status > 0) return true;
    } catch {
      /* server not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  console.log(`▶ booting next dev on :${PORT} (first compile is slow)…`);
  const child = spawn("bun", ["x", "next", "dev", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: ["ignore", "inherit", "inherit"],
    env: {
      ...process.env,
      // Dummy values so module init (env.ts) doesn't throw. The routes we hit
      // never make a real DB or Polar call on these paths.
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://u:p@localhost:5432/db",
      POLAR_ACCESS_TOKEN: "polar_pat_dummy",
      POLAR_WEBHOOK_SECRET: SECRET,
      POLAR_CHECKOUT_LINK: CHECKOUT_LINK,
      POLAR_SERVER: "sandbox",
      AUTH_JWT_SECRET: "x".repeat(32),
      AUTH_REFRESH_PEPPER: "x".repeat(32),
      AUTH_TOTP_ENCRYPTION_KEY: "x".repeat(32),
      APP_URL: BASE,
    },
  });

  try {
    if (!(await waitForReady())) throw new Error("dev server never became ready");

    // 1. Checkout route is mounted and redirects to the configured Checkout Link.
    const checkout = await fetch(`${BASE}/api/checkout`, { redirect: "manual" });
    const checkoutLoc = checkout.headers.get("location") ?? "";
    check(
      "checkout: anonymous -> 307 checkout link",
      checkout.status === 307 && checkoutLoc.startsWith(CHECKOUT_LINK),
      `status=${checkout.status} location=${checkoutLoc}`,
    );

    // 2. Portal route is mounted; anonymous visitor is redirected to login.
    const portal = await fetch(`${BASE}/api/portal`, { redirect: "manual" });
    const loc = portal.headers.get("location") ?? "";
    check(
      "portal: anonymous -> 307 /login",
      (portal.status === 307 || portal.status === 302) && loc.includes("/login"),
      `status=${portal.status} location=${loc}`,
    );

    // 3. Webhook rejects a forged signature.
    const body = JSON.stringify({ type: "order.paid", data: {} });
    const bad = await fetch(`${BASE}/api/webhooks/polar`, {
      method: "POST",
      headers: signedHeaders(body, { tamper: true }),
      body,
    });
    check("webhook: bad signature -> 403", bad.status === 403, `status=${bad.status}`);

    // 4. Webhook accepts a correctly-signed request (it gets PAST the 403 gate;
    //    a synthetic body then fails Polar's strict zod schema with a 500 — that
    //    500 is the proof the signature verified, not a failure of the route).
    const good = await fetch(`${BASE}/api/webhooks/polar`, {
      method: "POST",
      headers: signedHeaders(body),
      body,
    });
    check(
      "webhook: valid signature accepted (past 403 gate)",
      good.status !== 403 && good.status !== 404,
      `status=${good.status} (200=full payload handled, 500=signature OK but synthetic body)`,
    );
  } finally {
    // Kill the dev server and its child processes.
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /F /T /PID ${child.pid}`, { stdio: "ignore" });
      } else {
        child.kill("SIGTERM");
      }
    } catch {
      /* already gone */
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("smoke driver crashed:", err);
  process.exit(1);
});
