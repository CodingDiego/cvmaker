import { describe, expect, test } from "bun:test";
import {
  EmailDeliveryError,
  assertEmailRuntime,
  assertResendSendResult,
  isAppSenderDomain,
  senderDomain,
  shouldLogEmailToConsole,
} from "./email-delivery";

describe("email delivery configuration", () => {
  test("extracts sender domains from display-name and plain addresses", () => {
    expect(senderDomain("CVMaker <noreply@free-cv.com>")).toBe("free-cv.com");
    expect(senderDomain("hello@send.free-cv.com")).toBe("send.free-cv.com");
  });

  test("accepts the app domain and its subdomains", () => {
    expect(isAppSenderDomain("free-cv.com")).toBe(true);
    expect(isAppSenderDomain("send.free-cv.com")).toBe(true);
    expect(isAppSenderDomain("resend.dev")).toBe(false);
  });

  test("logs to console only when no API key is configured outside production", () => {
    expect(
      shouldLogEmailToConsole({
        from: "CVMaker <noreply@free-cv.com>",
        nodeEnv: "development",
      }),
    ).toBe(true);
    expect(
      shouldLogEmailToConsole({
        from: "CVMaker <noreply@free-cv.com>",
        nodeEnv: "production",
      }),
    ).toBe(false);
  });

  test("requires RESEND_API_KEY in production", () => {
    expect(() =>
      assertEmailRuntime({
        from: "CVMaker <noreply@free-cv.com>",
        nodeEnv: "production",
      }),
    ).toThrow(EmailDeliveryError);
  });

  test("rejects onboarding sender domains in production", () => {
    expect(() =>
      assertEmailRuntime({
        apiKey: "re_test",
        from: "CVMaker <onboarding@resend.dev>",
        nodeEnv: "production",
      }),
    ).toThrow("RESEND_FROM_EMAIL must use free-cv.com");
  });
});

describe("Resend send response handling", () => {
  test("throws when Resend returns an error payload", () => {
    expect(() =>
      assertResendSendResult(
        { data: null, error: { message: "Domain is not verified" } },
        { to: "user@example.com", subject: "Verify your Free CV email" },
      ),
    ).toThrow("Domain is not verified");
  });

  test("throws when Resend returns no data and no error", () => {
    expect(() =>
      assertResendSendResult(
        { data: null, error: null },
        { to: "user@example.com", subject: "Verify your Free CV email" },
      ),
    ).toThrow("empty response");
  });

  test("accepts successful send responses", () => {
    expect(() =>
      assertResendSendResult(
        { data: { id: "email_123" }, error: null },
        { to: "user@example.com", subject: "Verify your Free CV email" },
      ),
    ).not.toThrow();
  });
});
