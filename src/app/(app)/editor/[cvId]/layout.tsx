import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Editor",
    template: "%s · Editor",
  },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}