"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import { loginAction, verifyLoginTwoFactorAction, type ActionState } from "@/lib/auth/actions";

const initial: ActionState = { status: "idle" };

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [state, action] = useActionState(loginAction, initial);
  const [twoFaState, twoFaAction] = useActionState(verifyLoginTwoFactorAction, initial);

  useEffect(() => {
    if (state.status === "success" || twoFaState.status === "success") {
      router.push(next);
      router.refresh();
    }
  }, [state.status, twoFaState.status, next, router]);

  // Second factor step.
  if (state.status === "twofa") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app, or a backup code.
          </CardDescription>
        </CardHeader>
        <form action={twoFaAction}>
          <CardContent className="space-y-4">
            <input type="hidden" name="challengeId" value={state.challengeId} />
            <div className="space-y-2">
              <Label htmlFor="code">Authentication code</Label>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                placeholder="123456"
              />
            </div>
            {twoFaState.status === "error" && (
              <p className="text-sm text-destructive">{twoFaState.message}</p>
            )}
          </CardContent>
          <CardFooter className="mt-4">
            <SubmitButton>Verify</SubmitButton>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your CVMaker account.</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@email.com" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/reset" className="text-xs text-muted-foreground hover:text-foreground">
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state.status === "error" && <p className="text-sm text-destructive">{state.message}</p>}
        </CardContent>
        <CardFooter className="mt-4 flex-col gap-4">
          <SubmitButton>Sign in</SubmitButton>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="font-medium text-foreground hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
