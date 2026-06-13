---
name: integrate-polar
description: Integrate Polar.sh payments into this Next.js app — add checkout, subscriptions, the customer portal, and signature-verified webhooks using the @polar-sh/nextjs route-handler adapters. Use when asked to add payments, billing, checkout, subscriptions, a pricing page, a customer/billing portal, or Polar webhooks.
---

# Integrate Polar.sh payments

Polar is the merchant-of-record billing layer. This app wires it through the
**`@polar-sh/nextjs` adapters** — three App-Router route handlers that the
adapters generate for you (`Checkout`, `CustomerPortal`, `Webhooks`). Direct API
calls (list products, read orders) go through the `@polar-sh/sdk` client in
`src/lib/polar.ts`.

The integration is already wired into this repo. Drive it with the smoke driver
at `.claude/skills/integrate-polar/smoke.mjs`, which boots `next dev` and hits
the three live routes. **Paths below are relative to the project root.**

## The files (already created)

| File | Purpose |
|---|---|
| `src/lib/polar.ts` | `Polar` SDK client + `POLAR_PRODUCTS` plan→product-id map |
| `src/app/api/checkout/route.ts` | `GET` → redirects to Polar checkout; stamps `customerExternalId = user.id` |
| `src/app/api/portal/route.ts` | `GET` → redirects to the customer portal via `getExternalCustomerId` |
| `src/app/api/webhooks/polar/route.ts` | `POST` → signature-verified event handlers |
| `src/lib/env.ts` | `polarAccessToken()`, `polarWebhookSecret()`, `polarServer()`, `hasPolar()` |

The linchpin is **`customerExternalId`**: checkout stamps it with our `user.id`,
the webhook reads it back as `payload.data.customer.externalId`, and the portal
resolves the customer by it — so we never have to store Polar's customer id.

## Prerequisites

```bash
bun add @polar-sh/nextjs @polar-sh/sdk
```

(Installed `@polar-sh/nextjs@0.9.6` + `@polar-sh/sdk@0.48.1` in this repo.)

## Run the smoke driver (agent path)

**Stop any running `next dev` first** — Next 16 allows only one dev server per
project directory and the driver starts its own on port 3999.

```bash
node .claude/skills/integrate-polar/smoke.mjs
```

It boots `next dev` with dummy env and asserts the three routes end-to-end. The
webhook signature is produced exactly how Polar does it (base64 the secret, then
standard-webhooks HMAC), so the 403/accept checks exercise the real verification
path. Expected output:

```
▶ booting next dev on :3999 (first compile is slow)…
✅ checkout: missing products -> 400 — status=400 body={"error":"Missing products in query params"}
✅ portal: anonymous -> 307 /login — status=307 location=/login?next=/dashboard/billing
✅ webhook: bad signature -> 403 — status=403
✅ webhook: valid signature accepted (past 403 gate) — status=500 (200=signature OK but synthetic body)
4/4 checks passed
```

The webhook "accepted" check returns **500, not 200, on purpose**: a forged
signature is rejected at the 403 gate, while a *correctly signed* request gets
past it and only then fails Polar's strict zod schema (the smoke body is
synthetic). Real Polar deliveries are complete payloads and return 200.

Typecheck the integration against the real SDK types:

```bash
bunx tsc --noEmit
```

## Environment variables

Add to `.env.local` (get the token + secret from the Polar dashboard → Settings):

```bash
POLAR_ACCESS_TOKEN="polar_oat_..."   # Organization Access Token
POLAR_WEBHOOK_SECRET="..."           # from the webhook endpoint you create
POLAR_SERVER="sandbox"               # "sandbox" for testing, "production" to go live
POLAR_PRODUCT_PRO="<product-uuid>"   # optional: your plan→product map
```

`env.ts` treats all of these as **optional** — the payment routes return errors
(not crashes) until they're set, so the rest of the app runs without Polar
configured.

## Go-live checklist

1. Build products in the **sandbox** org first (`sandbox.polar.sh`), test with
   the test card, then recreate them in production and swap `POLAR_SERVER`.
2. Create a webhook endpoint in the Polar dashboard pointing at
   `https://<your-domain>/api/webhooks/polar`; copy its secret into
   `POLAR_WEBHOOK_SECRET`.
3. **Grant entitlement only from webhooks**, never from the checkout `successUrl`
   — a user can open the success URL without paying. The `onOrderPaid` /
   `onSubscriptionActive` / `onSubscriptionRevoked` callbacks in the webhook
   route are where the `// TODO` DB writes go (match the user by
   `customer.externalId`). Make them idempotent — Polar retries on any non-2xx.
4. Local webhook testing: `polar.sh` has a CLI/tunnel, or use ngrok to forward
   to `localhost:3000/api/webhooks/polar`.

## Verified API facts (don't trust the public docs verbatim)

These came from reading the installed `.d.ts` files, not the website:

- **`CustomerPortal` takes `getCustomerId` OR `getExternalCustomerId`**, each
  `(req) => Promise<string>` (async). The docs show a sync stub. `accessToken`
  is typed as a required `string` here — pass `env.polarAccessToken() ?? ""`.
- **`Checkout`** reads `products` from the query string (`?products=<id>`, repeatable),
  plus `customerExternalId`, `customerEmail`, `metadata` (URL-encoded JSON), etc.
  Missing `products` → 400 **before** any network call.
- **`validateEvent` base64-encodes the raw secret** before the HMAC. If you ever
  verify a signature by hand, you must `Buffer.from(secret).toString("base64")`
  first or every request 403s.
- Signature headers are `webhook-id`, `webhook-timestamp`, `webhook-signature`.
- Webhook callback names: `onOrderPaid`, `onOrderRefunded`, `onSubscriptionActive`,
  `onSubscriptionCanceled`, `onSubscriptionRevoked`, `onCustomerStateChanged`,
  `onPayload` (catch-all), … (full list in `@polar-sh/adapter-utils`).

## Gotchas

- **One dev server per project dir (Next 16).** Running the smoke while another
  `next dev` is up fails with *"Another next dev server is already running"*.
  Stop the other one first.
- **403 vs 500 on the webhook are different bugs.** 403 = signature/secret/header
  problem (verification failed). 500 = signature was fine but the body failed the
  zod schema (wrong/incomplete payload). The catch-all `onPayload` never logs on
  a 403.
- **Route handlers that import `@/db` crash at import if `DATABASE_URL` is unset**
  — `src/db/index.ts` calls `env.databaseUrl()` at module load. `checkout` and
  `portal` import the session (→ db), so they need `DATABASE_URL`; the webhook
  route deliberately imports **no** db, so it boots even with a bare env.
- **The webhook route must stay public.** `proxy.ts` only guards `/dashboard` and
  `/editor`, so `/api/*` is already outside auth — keep it that way, and let the
  adapter read the **raw** body (it does; don't add body parsing in front of it).
- Don't gate access on the checkout `successUrl`. Webhooks are the source of truth.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Another next dev server is already running. Run taskkill /PID <n> /F` | Stop the other dev server (`Stop-Process -Id <n> -Force`), then re-run the driver. |
| Every webhook returns 403 | Secret mismatch — confirm `POLAR_WEBHOOK_SECRET` matches the dashboard endpoint; remember `validateEvent` base64s it internally. Check the three `webhook-*` headers are present. |
| Webhook returns 500, callback never logs | Body failed the zod schema. Check the event `type` and shape; synthetic/partial payloads fail — real Polar deliveries pass. |
| `/api/checkout` or `/api/portal` → 500 at startup | Missing `DATABASE_URL` (db import) or `AUTH_*` secrets. Set them in `.env.local`. |
| Checkout → 400 "Missing products" | Pass `?products=<polar_product_id>` (that's expected with no param). |
```
