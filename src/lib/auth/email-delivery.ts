export const DEFAULT_RESEND_FROM = "CVMaker <noreply@free-cv.com>";
const APP_DOMAIN = "free-cv.com";

type EmailRuntime = {
  apiKey?: string;
  from: string;
  nodeEnv?: string;
  vercelEnv?: string;
};

type ResendErrorLike = {
  name?: string;
  message?: string;
  statusCode?: number | null;
};

export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    public readonly code: "missing_api_key" | "invalid_sender" | "resend_error" | "empty_response",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

export function senderDomain(from: string): string | null {
  const bracketMatch = from.match(/<([^>]+)>/);
  const email = (bracketMatch?.[1] ?? from).trim();
  const domain = email.match(/@([^@\s>]+)$/)?.[1]?.toLowerCase();
  return domain ?? null;
}

export function isAppSenderDomain(domain: string | null): boolean {
  return Boolean(domain && (domain === APP_DOMAIN || domain.endsWith(`.${APP_DOMAIN}`)));
}

export function isProductionEmailRuntime(runtime: Pick<EmailRuntime, "nodeEnv" | "vercelEnv">) {
  return runtime.nodeEnv === "production" || runtime.vercelEnv === "production";
}

export function shouldLogEmailToConsole(runtime: EmailRuntime): boolean {
  return !runtime.apiKey && !isProductionEmailRuntime(runtime);
}

export function assertEmailRuntime(runtime: EmailRuntime) {
  const production = isProductionEmailRuntime(runtime);

  if (!runtime.apiKey && production) {
    throw new EmailDeliveryError(
      "RESEND_API_KEY is required to send transactional email in production.",
      "missing_api_key",
    );
  }

  const domain = senderDomain(runtime.from);
  if (runtime.apiKey && production && !isAppSenderDomain(domain)) {
    throw new EmailDeliveryError(
      `RESEND_FROM_EMAIL must use ${APP_DOMAIN} or one of its subdomains in production.`,
      "invalid_sender",
      { from: runtime.from, domain },
    );
  }

  return {
    apiKey: runtime.apiKey,
    from: runtime.from,
  };
}

export function assertResendSendResult(
  result: { data?: unknown | null; error?: ResendErrorLike | null },
  context: { to: string; subject: string },
) {
  if (result.error) {
    throw new EmailDeliveryError(
      result.error.message ?? `Resend rejected "${context.subject}" for ${context.to}.`,
      "resend_error",
      result.error,
    );
  }

  if (!result.data) {
    throw new EmailDeliveryError(
      `Resend returned an empty response for "${context.subject}" to ${context.to}.`,
      "empty_response",
    );
  }
}
