import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shared CV",
  robots: { index: false },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}