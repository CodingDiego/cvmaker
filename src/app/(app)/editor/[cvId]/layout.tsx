import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Editor",
    template: "%s · Editor",
  },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  // The page reads request data (`requireUser` → `cookies()`), which under Cache
  // Components defers it to request time. Without a Suspense boundary *inside*
  // this segment, that cookie read runs in the same pass that resolves this
  // segment's metadata and blocks it, so Next flags the metadata as dynamic and
  // fails the build (next-prerender-dynamic-metadata). Isolating the page behind
  // <Suspense> lets the static shell + metadata prerender while the page streams.
  return (
    <Suspense fallback={<div className="min-h-svh" aria-hidden />}>
      {children}
    </Suspense>
  );
}