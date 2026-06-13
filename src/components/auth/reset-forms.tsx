"use client";

import { startTransition, useActionState, useRef } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound, Lock, Mail, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  requestPasswordResetAction,
  performPasswordResetAction,
  type ActionState,
} from "@/lib/auth/actions";
import {
  resetPerformSchema,
  resetRequestSchema,
  type ResetPerformValues,
  type ResetRequestValues,
} from "@/lib/auth/auth-schemas";
import { AuthCard, FormError, IconField, PasswordField, SubmitButton } from "./auth-ui";

const initial: ActionState = { status: "idle" };

export function ResetRequestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);
  const form = useForm<ResetRequestValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { email: "" },
  });

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
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(() => {
          const current = formRef.current;
          if (!current) return;
          startTransition(() => action(new FormData(current)));
        })}
        className="space-y-4"
        noValidate
      >
        <IconField
          id="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
          required
          placeholder="you@email.com"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton pending={pending}>Send reset link</SubmitButton>
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
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(performPasswordResetAction, initial);
  const form = useForm<ResetPerformValues>({
    resolver: zodResolver(resetPerformSchema),
    defaultValues: { password: "" },
  });

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
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(() => {
          const current = formRef.current;
          if (!current) return;
          startTransition(() => action(new FormData(current)));
        })}
        className="space-y-4"
        noValidate
      >
        <input type="hidden" name="token" value={token} />
        <PasswordField
          id="password"
          label="New password"
          icon={Lock}
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        {state.status === "error" && <FormError message={state.message} />}
        <SubmitButton pending={pending}>Update password</SubmitButton>
      </form>
    </AuthCard>
  );
}
