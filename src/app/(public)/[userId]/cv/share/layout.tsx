import type { Metadata } from "next";

// `use cache` marks the metadata as cacheable/prerenderable instead of letting
// Next treat it as request-time data on this dynamic `[userId]/[cvId]` route.
// It intentionally ignores params (the title is generic + noindex), so there's
// no runtime dependency to defer.
export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  return {
    title: "Shared CV",
    robots: { index: false },
  };
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
