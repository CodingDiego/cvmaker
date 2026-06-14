/**
 * Vercel project configuration (read natively by Vercel — supports dynamic TS
 * expressions, unlike static vercel.json).
 */
type Cron = { path: string; schedule: string };

type VercelConfig = {
  crons?: Cron[];
};

const config: VercelConfig = {
  crons: [
    // Daily billing reconciliation against Polar (06:00 UTC).
    { path: "/api/cron/reconcile-billing", schedule: "0 6 * * *" },
  ],
};

export default config;
