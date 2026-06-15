"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

/**
 * Minimal shape of the non-standard `beforeinstallprompt` event. The browser
 * fires it only when the PWA is actually installable, so we stash it and use it
 * to drive a custom install button — the supported pattern documented by MDN:
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Unobtrusive "Install app" button. Renders nothing until the browser signals
 * the app is installable (and hides itself once installed or dismissed), so it
 * never shows up where it can't do anything.
 */
export function InstallPwaButton({ label }: { label: string }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      // Stop Chrome's default mini-infobar so we control the placement.
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!promptEvent) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        // The event can only be used once; drop it regardless of the choice.
        if (outcome) setPromptEvent(null);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
    >
      <Download className="size-4" />
      {label}
    </button>
  );
}
