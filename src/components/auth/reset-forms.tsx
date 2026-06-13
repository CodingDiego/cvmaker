"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  requestPasswordResetAction,
  performPasswordResetAction,
  type ActionState,
} from "@/lib/auth/actions";

const initial: ActionState = { status: "idle" };

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function ResetRequestForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initial);

  if (state.status === "success") {
    return (
      <Card>
        <CardHeader>
          <MailCheck className="size-8 text-primary" />
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists for that address, we&apos;ve sent a reset link.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full" render={<Link href="/login" />}>
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send a reset link.</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@email.com" />
          </div>
          {state.status === "error" && <p className="text-sm text-destructive">{state.message}</p>}
        </CardContent>
        <CardFooter className="mt-4">
          <Submit>Send reset link</Submit>
        </CardFooter>
      </form>
    </Card>
  );
}

export function ResetPerformForm({ token }: { token: string }) {
  const [state, action] = useActionState(performPasswordResetAction, initial);

  if (state.status === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password updated</CardTitle>
          <CardDescription>You can now sign in with your new password.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" render={<Link href="/login" />}>
            Sign in
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>Enter a new password for your account.</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
          </div>
          {state.status === "error" && <p className="text-sm text-destructive">{state.message}</p>}
        </CardContent>
        <CardFooter className="mt-4">
          <Submit>Update password</Submit>
        </CardFooter>
      </form>
    </Card>
  );
}
