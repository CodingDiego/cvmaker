"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { saveCvDataAction, updateCvMetaAction } from "./actions";
import { useCvStore } from "./store";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced autosave. Watches the store's revision counter and persists the
 * document (and meta) via server actions through a React Query mutation.
 */
export function useAutosave(): { status: SaveStatus } {
  const revision = useCvStore((s) => s.revision);
  const lastSaved = useRef(0);

  const mutation = useMutation({
    mutationFn: async () => {
      const { cvId, data, title, templateId, accentColor, fontFamily } = useCvStore.getState();
      await Promise.all([
        saveCvDataAction(cvId, data),
        updateCvMetaAction(cvId, { title, templateId, accentColor, fontFamily }),
      ]);
    },
  });

  useEffect(() => {
    if (revision === 0 || revision === lastSaved.current) return;
    const handle = setTimeout(() => {
      lastSaved.current = revision;
      mutation.mutate();
    }, 1000);
    return () => clearTimeout(handle);
  }, [revision, mutation]);

  const status: SaveStatus = mutation.isPending
    ? "saving"
    : mutation.isError
      ? "error"
      : mutation.isSuccess
        ? "saved"
        : "idle";

  return { status };
}
