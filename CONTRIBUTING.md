# Contributing to CVMaker

Thanks for your interest in contributing! This guide covers how to get set up, the
conventions we follow, and how to get a change merged.

## Code of Conduct

Be respectful and constructive. Harassment, discrimination, or hostile behavior are not
tolerated in issues, pull requests, or any project space.

## Ways to contribute

- **Report bugs** — open an issue with reproduction steps, expected vs. actual behavior,
  and your environment.
- **Suggest features** — open an issue describing the use case before building, so we can
  agree on direction.
- **Improve docs** — typo fixes and clarifications are always welcome.
- **Submit code** — bug fixes, new free templates, i18n translations, accessibility
  improvements.

For anything non-trivial, **open an issue first** to discuss the approach before you
invest time in a PR.

## Development setup

See the [README](README.md#getting-started) for full setup. Short version:

```bash
bun install
cp .env.example .env.local      # fill in DATABASE_URL + the three AUTH_* secrets
bun run db:migrate
bun run dev
```

Only `DATABASE_URL` and the `AUTH_*` secrets are required — Redis, Blob, Resend and Polar
degrade gracefully in dev, so you can work on most of the app without them.

> ⚠️ **Read before writing framework code.** This repo runs a build of Next.js with
> breaking changes vs. older releases. Consult `node_modules/next/dist/docs/` and the
> notes in [`AGENTS.md`](AGENTS.md) before touching routing, caching, server actions, or
> config. Patterns from older Next.js may not apply.

## Before you open a PR

Run these locally and make sure they pass:

```bash
bun run lint        # ESLint
bun test            # unit tests
bun run build       # full production build (catches type + prerender errors)
```

- Add or update tests for behavior you change (`*.test.ts`, run with `bun:test`).
- If you changed the database schema, generate a migration:
  ```bash
  bun run db:generate
  ```
  Commit the generated SQL in `drizzle/` — never hand-edit applied migrations.
- If you added or changed user-facing strings, update **all three** dictionaries
  (`src/i18n/dictionaries/{en,es,pt}.json`). Keep keys in sync across locales.

## Coding conventions

- **TypeScript** everywhere; avoid `any`.
- **Match the surrounding code** — naming, file layout, comment density, and idioms.
  Mirror how the neighboring files are written rather than introducing a new style.
- **Server vs. client** — keep secrets and DB access server-only (`server-only` import,
  server actions, route handlers). Don't leak env vars to client components.
- **Env access** goes through [`src/lib/env.ts`](src/lib/env.ts), not raw `process.env`.
- **Validation** with Zod for any external input (forms, request bodies, webhooks).
- **UI** — reuse the primitives in `src/components/ui` and Base UI; follow the existing
  Tailwind token conventions. Keep components accessible (labels, roles, focus states).
- **Templates** — add free templates as token objects in
  [`src/templates/registry.ts`](src/templates/registry.ts); don't fork renderer code.
  Premium designs are out of scope for this repo (private overlay).

## Commit & PR guidelines

- Use clear, imperative commit messages (e.g. `fix: refresh token rotation race`).
  Conventional-commit prefixes (`feat:`, `fix:`, `docs:`, `chore:`…) are appreciated.
- Keep PRs focused — one logical change per PR is much easier to review.
- In the PR description: what changed, why, how you tested it, and link any related issue.
- Include screenshots or a short clip for UI changes.

## Security

**Do not open public issues for security vulnerabilities.** See
[SECURITY.md](SECURITY.md) (or email the maintainer) to report privately. Never commit
secrets, real credentials, or `.env*` files — all `.env*` files are gitignored on
purpose.

## License

By contributing, you agree that your contributions will be licensed under the project's
[LICENSE](LICENSE).
