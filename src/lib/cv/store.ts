"use client";

import { create } from "zustand";
import type { ResumeData } from "./types";

export interface CvMeta {
  cvId: string;
  title: string;
  templateId: string;
  accentColor: string;
  fontFamily: string;
}

interface CvState extends CvMeta {
  data: ResumeData;
  /** Monotonic counter bumped on every change — drives debounced autosave. */
  revision: number;
  init: (payload: CvMeta & { data: ResumeData }) => void;
  /** Immer-style mutation without the dependency, via structuredClone. */
  mutate: (recipe: (draft: ResumeData) => void) => void;
  setMeta: (meta: Partial<CvMeta>) => void;
}

export const useCvStore = create<CvState>((set) => ({
  cvId: "",
  title: "",
  templateId: "classic",
  accentColor: "#2563eb",
  fontFamily: "inter",
  data: {} as ResumeData,
  revision: 0,
  init: (payload) =>
    set({
      cvId: payload.cvId,
      title: payload.title,
      templateId: payload.templateId,
      accentColor: payload.accentColor,
      fontFamily: payload.fontFamily,
      data: payload.data,
      revision: 0,
    }),
  mutate: (recipe) =>
    set((state) => {
      const draft = structuredClone(state.data);
      recipe(draft);
      return { data: draft, revision: state.revision + 1 };
    }),
  setMeta: (meta) => set((state) => ({ ...state, ...meta, revision: state.revision + 1 })),
}));

/** Stable id generator for new list items (no Math.random at module load). */
let idCounter = 0;
export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}
