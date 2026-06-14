export const EMAIL_VERIFICATION_POLL_INTERVAL_MS = 2000;
export const EMAIL_VERIFICATION_MAX_POLLS = 60;

export type VerificationStatus = {
  authenticated: boolean;
  emailVerified: boolean;
};

export type VerificationPollDecision = {
  shouldContinue: boolean;
  shouldRefresh: boolean;
  delayMs: number;
};

export function buildVerificationStatus(
  user: { emailVerified: boolean } | null,
): VerificationStatus {
  return {
    authenticated: Boolean(user),
    emailVerified: Boolean(user?.emailVerified),
  };
}

export function getVerificationPollDecision(
  status: VerificationStatus,
  options: { attempts: number; maxAttempts: number },
): VerificationPollDecision {
  if (status.emailVerified) {
    return { shouldContinue: false, shouldRefresh: true, delayMs: 0 };
  }

  if (!status.authenticated || options.attempts >= options.maxAttempts) {
    return { shouldContinue: false, shouldRefresh: false, delayMs: 0 };
  }

  return {
    shouldContinue: true,
    shouldRefresh: false,
    delayMs: EMAIL_VERIFICATION_POLL_INTERVAL_MS,
  };
}
