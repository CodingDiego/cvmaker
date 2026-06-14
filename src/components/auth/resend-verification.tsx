"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/lib/auth/actions";

export function ResendVerification() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2" aria-live="polite">
      <Button
        variant="outline"
        className="h-11 w-full"
        disabled={pending || sent}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await resendVerificationAction();
            if (result.status === "error") {
              setError(result.message);
              return;
            }
            setSent(true);
          })
        }
      >
        {pending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
        {sent ? "Verification email sent" : "Resend verification email"}
      </Button>
      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
