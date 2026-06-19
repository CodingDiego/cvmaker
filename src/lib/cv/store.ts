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
  /** Section keys flagged empty on the last export attempt (cleared on edit). */
  sectionErrors: string[];
  init: (payload: CvMeta & { data: ResumeData }) => void;
  /** Immer-style mutation without the dependency, via structuredClone. */
  mutate: (recipe: (draft: ResumeData) => void) => void;
  setMeta: (meta: Partial<CvMeta>) => void;
  setSectionErrors: (keys: string[]) => void;
}

export const useCvStore = create<CvState>((set) => ({
  cvId: "",
  title: "",
  templateId: "clasico-ats",
  accentColor: "#1c1c1c",
  fontFamily: "inter",
  data: {} as ResumeData,
  revision: 0,
  sectionErrors: [],
  init: (payload) =>
    set({
      cvId: payload.cvId,
      title: payload.title,
      templateId: payload.templateId,
      accentColor: payload.accentColor,
      fontFamily: payload.fontFamily,
      data: payload.data,
      revision: 0,
      sectionErrors: [],
    }),
  mutate: (recipe) =>
    set((state) => {
      const draft = structuredClone(state.data);
      recipe(draft);
      return {
        data: draft,
        revision: state.revision + 1,
        // Any edit invalidates the last export-time validation.
        ...(state.sectionErrors.length ? { sectionErrors: [] } : null),
      };
    }),
  setMeta: (meta) => set((state) => ({ ...state, ...meta, revision: state.revision + 1 })),
  setSectionErrors: (keys) => set({ sectionErrors: keys }),
}));

/** Stable id generator for new list items (no Math.random at module load). */
let idCounter = 0;
export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}
