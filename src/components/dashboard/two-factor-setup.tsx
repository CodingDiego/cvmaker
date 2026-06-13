"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  startTwoFactorSetupAction,
  confirmTwoFactorSetupAction,
  disableTwoFactorAction,
  regenerateBackupCodesAction,
  type SetupData,
} from "@/lib/auth/twofa-actions";

function BackupCodes({ codes }: { codes: string[] }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <p className="mb-2 text-sm font-medium">Save your backup codes</p>
      <p className="mb-3 text-xs text-muted-foreground">
        Each code works once. Store them somewhere safe — they let you sign in if you lose your
        authenticator.
      </p>
      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
        {codes.map((c) => (
          <span key={c} className="rounded bg-background px-2 py-1 text-center">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [pending, start] = useTransition();

  function begin() {
    setError(null);
    start(async () => setSetup(await startTwoFactorSetupAction()));
  }

  function confirm() {
    setError(null);
    start(async () => {
      const res = await confirmTwoFactorSetupAction(code);
      if (!res.ok) return setError(res.error);
      setIsEnabled(true);
      setSetup(null);
      setBackupCodes(res.backupCodes ?? null);
      toast.success("Two-factor authentication enabled");
    });
  }

  function disable() {
    start(async () => {
      await disableTwoFactorAction();
      setIsEnabled(false);
      setBackupCodes(null);
      toast.success("Two-factor authentication disabled");
    });
  }

  function regen() {
    start(async () => {
      const res = await regenerateBackupCodesAction();
      if (res.ok) setBackupCodes(res.backupCodes ?? null);
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" /> Two-factor authentication
          </CardTitle>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <CardDescription>
          Add a second step at sign-in using an authenticator app (TOTP).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {backupCodes && <BackupCodes codes={backupCodes} />}

        {!isEnabled && !setup && (
          <Button onClick={begin} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Set up 2FA
          </Button>
        )}

        {setup && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
            </p>
            <Image
              src={setup.qrDataUrl}
              alt="2FA QR code"
              width={180}
              height={180}
              className="rounded-lg border bg-white p-2"
              unoptimized
            />
            <p className="text-xs text-muted-foreground">
              Or enter this key manually: <code className="font-mono">{setup.secret}</code>
            </p>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="totp">Verification code</Label>
                <Input
                  id="totp"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  placeholder="123456"
                  className="w-36"
                />
              </div>
              <Button onClick={confirm} disabled={pending || code.length < 6}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Confirm
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {isEnabled && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={regen} disabled={pending}>
              Regenerate backup codes
            </Button>
            <Button variant="destructive" onClick={disable} disabled={pending}>
              <ShieldOff className="size-4" /> Disable 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
