# Security Policy

CVMaker handles account credentials, session cookies, CV content, uploaded assets,
exported documents, public share links, payment state, and third-party service
credentials. Please report security issues privately so they can be fixed before
details are made public.

## Supported Versions

This project is 1.0. Security fixes are accepted for the current `main` branch
and the version deployed at [free-cv.com](https://free-cv.com). Older commits,
forks, private deployments, and local development environments are not supported
unless a maintainer explicitly says otherwise.

## Reporting a Vulnerability

Do not open a public issue, discussion, or pull request for a vulnerability.

Use one of these private channels instead:

- Preferred: open a private GitHub Security Advisory for this repository:
  [github.com/CodingDiego/cvmaker/security/advisories/new](https://github.com/CodingDiego/cvmaker/security/advisories/new)
- If GitHub Security Advisories are unavailable, contact the maintainer privately.
  If you run a public fork, replace this line with a dedicated security email.

Please include as much of the following as you safely can:

- Affected area, route, endpoint, server action, or file.
- Impact and what data or capability may be exposed.
- Reproduction steps against your own account or a local/test deployment.
- Relevant request/response details with cookies, tokens, secrets, CV contents,
  email addresses, and payment identifiers redacted.
- Whether the issue affects production, preview, or local-only behavior.
- Any dependency, browser, OS, or deployment-specific detail needed to reproduce.

## Scope

Reports are most useful when they involve one of these areas:

- Authentication, registration, login, password reset, email verification, TOTP
  two-factor auth, backup codes, active-session management, JWTs, refresh-token
  rotation, or cookie handling.
- Authorization boundaries for CVs, dashboard data, exports, uploaded assets,
  account settings, billing pages, and API routes.
- Private vs. public data boundaries, including public CV share links, public
  asset mirrors, Vercel Blob storage paths, and exported PDF/DOCX/ZIP files.
- Webhook, cron, or machine-to-machine authentication, especially Polar webhooks,
  checkout success handling, billing reconciliation, and `CRON_SECRET` usage.
- Sensitive environment variables and service credentials, including Neon,
  Upstash Redis, Vercel Blob, Resend, Polar, auth secrets, and TOTP encryption.
- Injection, XSS, SSRF, path traversal, unsafe file handling, cache poisoning,
  token replay, privilege escalation, or data leakage with a concrete exploit path.
- Dependency vulnerabilities that are reachable in this app and have a practical
  impact on confidentiality, integrity, or availability.

## Out of Scope

The following are usually out of scope unless you can show a concrete security
impact:

- Vulnerabilities that only affect your own fork, local machine, test database,
  or intentionally weakened configuration.
- Publicly shared CV content or assets that the account owner explicitly chose
  to publish.
- Missing security headers with no demonstrated exploit path.
- Self-XSS or attacks that require pasting code into developer tools.
- Social engineering, phishing, spam, or attacks against third-party accounts.
- Denial-of-service by high-volume traffic, load testing, or automated scanners.
- Reports generated only by dependency scanners without evidence that the issue
  is reachable from CVMaker.
- Disclosure of sample values from `.env.example` or other non-secret examples.

## Research Rules

When testing, please:

- Use your own account, local environment, or a deployment you control.
- Do not access, modify, export, delete, or share data that belongs to another user.
- Do not exfiltrate secrets, tokens, cookies, CV contents, uploaded files, or
  payment identifiers.
- Do not run destructive tests, high-volume scans, credential stuffing, spam, or
  tests that degrade service availability.
- Stop testing and report promptly if you gain access to data or capabilities
  beyond your own account.

Good-faith research that follows these rules will not be treated as hostile.

## Project Security Notes

- Server-side environment access is centralized in `src/lib/env.ts`.
- Auth cookies are HTTP-only, use `SameSite=Lax`, and are marked `Secure` in
  production.
- Passwords are hashed with Argon2; refresh tokens and one-time email tokens are
  stored as hashes.
- TOTP secrets are encrypted before storage, and backup codes are single-use.
- Auth-sensitive actions use validation and rate limiting when Redis is
  configured; local development may use in-memory or no-op fallbacks.
- BotID protects selected browser-initiated auth/account actions in deployed
  environments.
- CVs, assets, exports, and billing records are scoped to the authenticated user
  unless the user explicitly enables public sharing.
- Polar webhooks and Vercel cron routes are machine-to-machine endpoints and
  must remain protected by their configured secrets/signatures.

These notes describe intended defenses, not guarantees. If implementation and
documentation disagree, report the implementation behavior.

## Response Process

Maintainers will aim to:

1. Acknowledge the report within 7 days.
2. Triage severity, affected versions, and whether production is affected.
3. Coordinate a fix privately when the issue is valid.
4. Rotate exposed credentials or invalidate sessions when needed.
5. Publish an advisory or public issue after a fix is available, when disclosure
   is appropriate.

Please do not publicly disclose details until maintainers have had a reasonable
opportunity to investigate and release a fix.
