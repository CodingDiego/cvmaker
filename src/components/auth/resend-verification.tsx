"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/lib/auth/actions";

export function ResendVerification() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <Button
      variant="outline"
      className="h-11 w-full"
      disabled={pending || sent}
      onClick={() =>
        startTransition(async () => {
          await resendVerificationAction();
          setSent(true);
        })
      }
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {sent ? "Verification email sent" : "Resend verification email"}
    </Button>
  );
}
