# CVMaker

Free, open-source CV/resume builder. Pick a template, fill in your details with a
live preview, and export to PDF or DOCX. Multi-language (English / Español / Português),
ATS-friendly designs, account-based storage and sharing.

Production: **[free-cv.com](https://free-cv.com)**

---

## Features

- **Live editor** — autosaving form with a real-time preview of the rendered resume.
- **10 free ATS-friendly templates** — distinct silhouettes (sidebars, side-labels,
  two-column bodies, accent bands), all driven by design tokens so renderers stay DRY.
- **PDF & DOCX export** — server-rendered via `@react-pdf/renderer` and `docx`, run as
  durable background jobs (Vercel Workflow).
- **Accounts & security** — email/password auth (Argon2), email verification, password
  reset, optional TOTP two-factor, active-session management with refresh-token rotation.
- **Sharing** — public read-only share links for a CV.
- **i18n** — sub-path routing (`/en`, `/es`, `/pt`) with a custom dictionary system.
- **Billing** — optional Pro plan via [Polar](https://polar.sh) (premium templates live in
  a private overlay; the open-source build ships free templates only).
- **Bot protection** — Vercel BotID gating on sensitive auth/account actions.

## Tech stack

| Area            | Choice                                                              |
| --------------- | ------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, React 19, React Compiler, Cache Components) |
| Language        | TypeScript                                                          |
| UI              | Base UI + shadcn-style components, Tailwind CSS v4                  |
| Data layer      | Drizzle ORM + Neon (serverless Postgres)                            |
| Cache / rate limit | Upstash Redis (`@upstash/ratelimit`)                            |
| File storage    | Vercel Blob (private store for user data, public store for shares)  |
| Background jobs | Vercel Workflow (`workflow`)                                        |
| Email           | Resend + React Email                                                |
| Payments        | Polar                                                               |
| Auth crypto     | `@node-rs/argon2`, `jose` (JWT), `otplib` (TOTP)                    |
| Client state    | TanStack Query, Zustand, nuqs                                       |
| Package manager / test runner | Bun                                                   |

> ⚠️ **This is not the Next.js you may know.** This repo runs a build of Next.js with
> breaking changes vs. older releases. Read the guides in `node_modules/next/dist/docs/`
> before writing framework-level code, and heed deprecation notices. See
> [`AGENTS.md`](AGENTS.md).

## Project structure

```
src/
  app/[lang]/            Localized routes
    (marketing)/         Landing, templates, legal, checkout return
    (auth)/              Login, register, reset, verify
    (app)/               Dashboard + editor (authenticated)
    (public)/            Public share view
  app/api/               Route handlers (cvs, auth, exports, webhooks, cron…)
  components/            UI primitives + feature components
  lib/
    auth/                Sessions, JWT, password, TOTP, cookies, server actions
    cv/                  CV CRUD, store, autosave, sharing, exports
    billing/             Entitlements + Polar checkout
    assets/              User asset uploads (Blob)
    query/               TanStack Query setup
  templates/             Template registry + PDF/DOCX/preview renderers
  i18n/                  Locale config + en/es/pt dictionaries
  workflows/             Durable background jobs
  db/                    Drizzle schema + client
  proxy.ts               Session + locale request handling
drizzle/                 SQL migrations + snapshots
scripts/                 Smoke / preload scripts
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (package manager + test runner; npm/pnpm also work for installing)
- A Postgres database — a [Neon](https://neon.tech) free project is the easiest.

The app **degrades gracefully in development**: Redis, Blob, Resend and Polar are all
optional. Without them, rate-limiting uses an in-memory shim, verification/reset links are
logged to the console instead of emailed, and payment routes stay inert. Only
`DATABASE_URL` and the three `AUTH_*` secrets are strictly required to boot.

### 1. Install

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in at least:

```bash
DATABASE_URL=...                  # Neon connection string
AUTH_JWT_SECRET=...               # openssl rand -base64 32
AUTH_REFRESH_PEPPER=...           # openssl rand -base64 32
AUTH_TOTP_ENCRYPTION_KEY=...      # openssl rand -base64 32
```

See [`.env.example`](.env.example) for the full list (Redis, Blob, Resend, Polar, cron).

### 3. Set up the database

```bash
bun run db:migrate     # apply migrations
# or, for quick local iteration:
bun run db:push        # push schema without a migration
bun run db:studio      # open Drizzle Studio
```

### 4. Run the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                | What it does                                  |
| --------------------- | --------------------------------------------- |
| `bun run dev`         | Start the dev server                          |
| `bun run build`       | Production build                              |
| `bun run start`       | Serve the production build                    |
| `bun run lint`        | ESLint                                        |
| `bun test`            | Run unit tests (`*.test.ts`)                  |
| `bun run db:generate` | Generate a migration from schema changes      |
| `bun run db:migrate`  | Apply migrations                              |
| `bun run db:push`     | Push schema directly (dev only)               |
| `bun run db:studio`   | Open Drizzle Studio                           |
| `bun run debug-pr`    | `next build --debug-prerender`                |

## Adding a template

All free templates are plain token objects in
[`src/templates/registry.ts`](src/templates/registry.ts) — no per-template renderer code.
Add an entry to `FREE_TEMPLATE_DEFS` describing layout, accent, font, density, etc.; the
shared preview/PDF/DOCX renderers pick it up automatically. Aim for a silhouette that
reads as distinct even at thumbnail scale, and keep it ATS-parseable.

> Premium (`access: "pro"`) designs are **not** in this repo — they live in a private
> `/.premium` overlay merged via the `@premium` alias and resolve to an empty stub in the
> open-source build.

## Deployment

Built for [Vercel](https://vercel.com): Next.js, Vercel Blob, Vercel Workflow, BotID and
a cron job (`/api/cron/reconcile-billing`) are all platform-native. Bring your own Neon,
Upstash, Resend and Polar accounts and set the matching environment variables. Project
config lives in [`vercel.ts`](vercel.ts).

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

See [LICENSE](LICENSE). _(Add a license file before publishing — see CONTRIBUTING.)_
