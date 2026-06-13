"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, Lock, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  requestPasswordResetAction,
  performPasswordResetAction,
  type ActionState,
} from "@/lib/auth/actions";
import { AuthCard, FormError, IconField, PasswordField, SubmitButton } from "./auth-ui";

const initial: ActionState = { status: "idle" };

export function ResetRequestForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initial);

  if (state.status === "success") {
    return (
      <AuthCard
        icon={MailCheck}
        title="Check your email"
        description="If an account exists for that address, we've sent a reset link."
      >
        <Button variant="outline" className="h-11 w-full" render={<Link href="/login" />}>
          Back to sign in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={KeyRound}
      title="Reset your password"
      description="Enter your email and we'll send a reset link."
    >
      <form action={action} className="space-y-4">
        <IconField
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
          required
          placeholder="you@email.com"
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton>Send reset link</SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export function ResetPerformForm({ token }: { token: string }) {
  const [state, action] = useActionState(performPasswordResetAction, initial);

  if (state.status === "success") {
    return (
      <AuthCard
        icon={CheckCircle2}
        title="Password updated"
        description="You can now sign in with your new password."
      >
        <Button className="h-11 w-full" render={<Link href="/login" />}>
          Sign in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={Lock}
      title="Choose a new password"
      description="Enter a new password for your account."
    >
      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <PasswordField
          id="password"
          name="password"
          label="New password"
          icon={Lock}
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton>Update password</SubmitButton>
      </form>
    </AuthCard>
  );
}
