import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { listActiveSessions } from "@/lib/auth/sessions";
import { SessionList, type SessionView } from "@/components/dashboard/session-list";

export const metadata: Metadata = { title: "Active sessions" };

export default async function SessionsPage() {
  const user = await requireUser("/dashboard/sessions");
  const rows = await listActiveSessions(user.id);

  const sessions: SessionView[] = rows.map((s) => ({
    id: s.id,
    deviceLabel: s.deviceLabel,
    ip: s.ip,
    environment: s.environment,
    lastActiveAt: s.lastActiveAt.toISOString(),
    current: s.id === user.sessionId,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Active sessions</h1>
        <p className="text-sm text-muted-foreground">
          Devices currently signed in to your account. Local/dev sessions are grouped to avoid
          clutter. Revoke any you don&apos;t recognize.
        </p>
      </div>
      <SessionList sessions={sessions} />
    </div>
  );
}
