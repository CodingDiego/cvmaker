import "server-only";

/**
 * Centralized, lazily-validated access to server environment variables.
 * `typedEnv` (next.config) already types `process.env` from .env files, but we
 * add runtime guards + helpers so missing optional services degrade gracefully
 * in development instead of crashing the whole app.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to .env.local.`,
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  // Database (Neon) — required for the app to function.
  databaseUrl: () => required("DATABASE_URL"),
  databaseUrlUnpooled: () =>
    optional("DATABASE_URL_UNPOOLED") ?? required("DATABASE_URL"),

  // Upstash Redis — optional in dev (falls back to in-memory shim).
  redisUrl: () => optional("UPSTASH_REDIS_REST_URL"),
  redisToken: () => optional("UPSTASH_REDIS_REST_TOKEN"),
  hasRedis: () => Boolean(optional("UPSTASH_REDIS_REST_URL") && optional("UPSTASH_REDIS_REST_TOKEN")),

  // --- Vercel Blob: two stores (private = default for user data, public = shared) ---
  // Private store (user assets, exports). Falls back to the generic token names.
  privateBlobToken: () =>
    optional("PRIVATE_READ_WRITE_TOKEN") ?? optional("BLOB_READ_WRITE_TOKEN"),
  privateBlobStoreId: () => optional("PRIVATE_STORE_ID"),
  hasPrivateBlob: () =>
    Boolean(optional("PRIVATE_READ_WRITE_TOKEN") ?? optional("BLOB_READ_WRITE_TOKEN")),

  // Public store (assets the user explicitly shares).
  publicBlobToken: () =>
    optional("PUBLIC_READ_WRITE_TOKEN") ?? optional("BLOB_READ_WRITE_TOKEN"),
  publicBlobStoreId: () => optional("PUBLIC_STORE_ID"),
  hasPublicBlob: () =>
    Boolean(optional("PUBLIC_READ_WRITE_TOKEN") ?? optional("BLOB_READ_WRITE_TOKEN")),

  // Back-compat helpers (exports default to the private store).
  blobToken: () =>
    optional("PRIVATE_READ_WRITE_TOKEN") ??
    optional("BLOB_READ_WRITE_TOKEN") ??
    optional("PUBLIC_READ_WRITE_TOKEN"),
  hasBlob: () =>
    Boolean(
      optional("PRIVATE_READ_WRITE_TOKEN") ??
        optional("BLOB_READ_WRITE_TOKEN") ??
        optional("PUBLIC_READ_WRITE_TOKEN"),
    ),

  // Auth secrets.
  jwtSecret: () => required("AUTH_JWT_SECRET"),
  refreshPepper: () => required("AUTH_REFRESH_PEPPER"),
  totpEncryptionKey: () => required("AUTH_TOTP_ENCRYPTION_KEY"),

  // Email (Resend) — optional in dev (logs link to console instead).
  resendApiKey: () => optional("RESEND_API_KEY"),
  resendFrom: () => optional("RESEND_FROM_EMAIL") ?? "CVMaker <onboarding@resend.dev>",
  hasResend: () => Boolean(optional("RESEND_API_KEY")),

  // Polar payments — optional in dev (payment routes degrade until configured).
  polarAccessToken: () => optional("POLAR_ACCESS_TOKEN"),
  polarWebhookSecret: () => optional("POLAR_WEBHOOK_SECRET"),
  polarProductPro: () => optional("POLAR_PRODUCT_PRO"),
  polarSuccessUrl: () =>
    optional("POLAR_SUCCESS_URL") ?? `${env.appUrl()}/success?checkout_id={CHECKOUT_ID}`,
  polarReturnUrl: () => optional("POLAR_RETURN_URL") ?? `${env.appUrl()}/return`,
  // Legacy hosted checkout link. Kept only for backward compatibility.
  polarCheckoutLink: () => optional("POLAR_CHECKOUT_LINK"),
  // "sandbox" for test mode, "production" for live. Defaults to sandbox off prod.
  polarServer: (): "sandbox" | "production" =>
    optional("POLAR_SERVER") === "production" ? "production" : "sandbox",
  hasPolar: () => Boolean(optional("POLAR_ACCESS_TOKEN")),

  // Vercel Cron — shared secret sent as `Authorization: Bearer <CRON_SECRET>`.
  cronSecret: () => optional("CRON_SECRET"),

  // App URL.
  appUrl: () => optional("APP_URL") ?? "https://free-cv.com",

  // Deployment environment (Vercel).
  vercelEnv: () => optional("VERCEL_ENV"), // "production" | "preview" | "development"
  isProd: () => process.env.NODE_ENV === "production",
};
