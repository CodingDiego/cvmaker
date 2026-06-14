/**
 * Vercel project configuration (read natively by Vercel — supports dynamic TS
 * expressions, unlike static vercel.json).
 */
import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  crons: [
    // Daily billing reconciliation against Polar (06:00 UTC).
    { path: "/api/cron/reconcile-billing", schedule: "0 6 * * *" },
  ],
};
