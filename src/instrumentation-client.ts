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
// Every page is locale-prefixed (`/en`, `/es`, `/pt`), so we match the locale
// segment with a leading `*` wildcard (`*` expands to `.*` in BotID's matcher).
initBotId({
  protect: [
    // Auth forms — the unauthenticated, bot-prone surface.
    { path: "/*/login", method: "POST" }, // sign in + 2FA verify
    { path: "/*/register", method: "POST" }, // account creation
    { path: "/*/reset", method: "POST" }, // password reset request + perform
    // Authenticated account forms (defense in depth).
    { path: "/*/dashboard/account", method: "POST" }, // profile update
    { path: "/*/dashboard/security", method: "POST" }, // 2FA enrollment
  ],
});
