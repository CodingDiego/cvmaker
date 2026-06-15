import "server-only";
import { checkBotId } from "botid/server";

/**
 * BotID human-verification gate for server actions.
 *
 * Returns `true` when the caller looks like a real human, `false` for a bot.
 *
 * This relies on the client instrumentation in `src/instrumentation-client.ts`
 * having registered the action's page route under `initBotId({ protect })`: that
 * code patches `fetch`/`XMLHttpRequest` in the browser to attach the challenge
 * headers `checkBotId()` reads here. Because of that, the check ONLY works for
 * actions dispatched from the browser. A server action invoked purely
 * server-side (e.g. one action calling another, or any non-browser caller)
 * carries no challenge headers and would be flagged as a bot — so keep every
 * BotID-gated action wired to a client `onSubmit`/form dispatch.
 *
 * In local development `checkBotId()` always returns `{ isBot: false }`, so this
 * gate is a no-op until deployed. See https://vercel.com/docs/botid
 */
export async function isVerifiedHuman(): Promise<boolean> {
  const { isBot } = await checkBotId();
  return !isBot;
}
