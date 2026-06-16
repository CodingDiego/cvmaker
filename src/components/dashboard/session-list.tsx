"use client";

import { Laptop, Loader2, MapPin, ShieldX } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { revokeSessionAction, revokeOtherSessionsAction } from "@/lib/auth/session-actions";
import { sessionListOptions } from "@/lib/auth/session-queries";
import { queryKeys } from "@/lib/query/keys";
import { useT } from "@/i18n/provider";
import type { Translator } from "@/i18n/translate";

function RevokeButton({ id, t }: { id: string; t: Translator }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => revokeSessionAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() }),
  });
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldX className="size-3.5" />}
      {t("dashboard.sessions.revoke")}
    </Button>
  );
}

export function SessionList() {
  const t = useT();
  const queryClient = useQueryClient();
  const { data: sessions = [] } = useQuery(sessionListOptions());

  const revokeOthers = useMutation({
    mutationFn: () => revokeOtherSessionsAction(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() }),
  });

  const hasOthers = sessions.some((s) => !s.current);

  return (
    <div className="space-y-3">
      {hasOthers && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={revokeOthers.isPending}
            onClick={() => revokeOthers.mutate()}
          >
            {revokeOthers.isPending && <Loader2 className="size-3.5 animate-spin" />}
            {t("dashboard.sessions.signOutOthers")}
          </Button>
        </div>
      )}
      {sessions.map((s) => (
        <Card key={s.id}>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Laptop className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{s.deviceLabel ?? t("dashboard.sessions.unknownDevice")}</span>
                  {s.current && <Badge>{t("dashboard.sessions.thisDevice")}</Badge>}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>{s.ip ?? t("dashboard.sessions.unknownIp")}</span>
                  <span>· {t("dashboard.sessions.active", { time: new Date(s.lastActiveAt).toLocaleString() })}</span>
                </div>
              </div>
            </div>
            {!s.current && <RevokeButton id={s.id} t={t} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
