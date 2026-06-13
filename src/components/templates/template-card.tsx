"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCvAction } from "@/lib/cv/actions";

export function UseTemplateButton({ templateId }: { templateId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      className="w-full"
      disabled={pending}
      onClick={() => start(() => createCvAction(templateId))}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      Use this template
    </Button>
  );
}
