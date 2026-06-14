import { describe, expect, test } from "bun:test";
import {
  buildVerificationStatus,
  getVerificationPollDecision,
} from "./verification-status";

describe("buildVerificationStatus", () => {
  test("marks anonymous visitors as unauthenticated and unverified", () => {
    expect(buildVerificationStatus(null)).toEqual({
      authenticated: false,
      emailVerified: false,
    });
  });

  test("returns the signed-in user's verification flag", () => {
    expect(buildVerificationStatus({ emailVerified: true })).toEqual({
      authenticated: true,
      emailVerified: true,
    });
  });
});

describe("getVerificationPollDecision", () => {
  test("keeps polling while a signed-in user is still unverified", () => {
    expect(
      getVerificationPollDecision(
        { authenticated: true, emailVerified: false },
        { attempts: 3, maxAttempts: 60 },
      ),
    ).toEqual({ shouldContinue: true, shouldRefresh: false, delayMs: 2000 });
  });

  test("refreshes the route when the email becomes verified", () => {
    expect(
      getVerificationPollDecision(
        { authenticated: true, emailVerified: true },
        { attempts: 4, maxAttempts: 60 },
      ),
    ).toEqual({ shouldContinue: false, shouldRefresh: true, delayMs: 0 });
  });

  test("stops polling for anonymous visitors", () => {
    expect(
      getVerificationPollDecision(
        { authenticated: false, emailVerified: false },
        { attempts: 1, maxAttempts: 60 },
      ),
    ).toEqual({ shouldContinue: false, shouldRefresh: false, delayMs: 0 });
  });

  test("stops polling once the attempt budget is exhausted", () => {
    expect(
      getVerificationPollDecision(
        { authenticated: true, emailVerified: false },
        { attempts: 60, maxAttempts: 60 },
      ),
    ).toEqual({ shouldContinue: false, shouldRefresh: false, delayMs: 0 });
  });
});
