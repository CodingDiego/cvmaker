"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EMAIL_VERIFICATION_MAX_POLLS,
  getVerificationPollDecision,
  type VerificationStatus,
} from "@/lib/auth/verification-status";

export function EmailVerificationPoller({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    if (!enabled || detected) return;

    let cancelled = false;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      attempts += 1;

      try {
        const response = await fetch("/api/auth/verification-status", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          scheduleNext({ authenticated: true, emailVerified: false });
          return;
        }

        const status = (await response.json()) as VerificationStatus;
        scheduleNext(status);
      } catch {
        scheduleNext({ authenticated: true, emailVerified: false });
      }
    }

    function scheduleNext(status: VerificationStatus) {
      if (cancelled) return;

      const decision = getVerificationPollDecision(status, {
        attempts,
        maxAttempts: EMAIL_VERIFICATION_MAX_POLLS,
      });

      if (decision.shouldRefresh) {
        setDetected(true);
        router.refresh();
        return;
      }

      if (decision.shouldContinue) {
        timeout = setTimeout(poll, decision.delayMs);
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [detected, enabled, router]);

  if (!enabled) return null;

  return (
    <p className="text-center text-sm text-muted-foreground" aria-live="polite">
      {detected
        ? "Email verified. Updating this page..."
        : "Waiting for the verification link to be opened..."}
    </p>
  );
}
