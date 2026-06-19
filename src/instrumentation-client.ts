import { initBotId } from "botid/client/core";

// BotID client instrumentation. Runs in the browser before hydration and patches
// `fetch`/`XMLHttpRequest` so any request to a protected path below carries the
// challenge headers that `checkBotId()` reads on the server. Without this, the
// server-side `checkBotId()` gate can never see a human signal.
//
// IMPORTANT: this file MUST live at `src/instrumentation-client.ts` (Next.js
// convention — root or `src/`, hyphenated). A misnamed/misplaced file is simply
// never loaded, silently disabling all protection.
//
// The protected paths are the *page routes* our server actions POST to (App
// Router posts a server action to the pathname of the page that rendered it).
// The locale now lives in the HOST (subdomain), so the *visible* pathname the
// browser fetches/POSTs is BARE (`/login`, not `/es/login`) — the `[lang]`
// segment is injected internally by the next.config rewrite, AFTER BotID's
// client patch has already matched the visible URL. So these patterns must be
// bare; a `/*/login`-style pattern would no longer match anything.
initBotId({
  protect: [
    // Public GET pages.
    { path: "/", method: "GET" },
    { path: "/templates", method: "GET" },
    { path: "/privacy", method: "GET" },
    { path: "/terms", method: "GET" },
    { path: "/success", method: "GET" },
    { path: "/return", method: "GET" },
    { path: "/share", method: "GET" },
    { path: "/login", method: "GET" },
    { path: "/register", method: "GET" },
    { path: "/reset", method: "GET" },
    { path: "/verify", method: "GET" },
    // Auth forms — the unauthenticated, bot-prone surface.
    { path: "/login", method: "POST" }, // sign in + 2FA verify
    { path: "/register", method: "POST" }, // account creation
    { path: "/reset", method: "POST" }, // password reset request + perform
    // Authenticated account forms (defense in depth).
    { path: "/dashboard/account", method: "POST" }, // profile update
    { path: "/dashboard/security", method: "POST" }, // 2FA enrollment
  ],
});
