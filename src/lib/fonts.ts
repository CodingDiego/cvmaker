import {
  Geist,
  Geist_Mono,
  Inter,
  Roboto,
  Lato,
  Source_Sans_3,
  Merriweather,
} from "next/font/google";

// App chrome fonts.
export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// ATS-safe resume fonts — optimized + self-hosted by next/font. Each exposes a
// CSS variable consumed by the on-screen CV preview. The matching @fontsource
// TTFs are registered with react-pdf for PDF export; docx references the family
// by standard name. Keeping a single allowlist keeps all outputs consistent.
export const inter = Inter({ variable: "--font-cv-inter", subsets: ["latin"], display: "swap" });
export const roboto = Roboto({
  variable: "--font-cv-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
export const lato = Lato({
  variable: "--font-cv-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});
export const sourceSans = Source_Sans_3({
  variable: "--font-cv-source",
  subsets: ["latin"],
  display: "swap",
});
export const merriweather = Merriweather({
  variable: "--font-cv-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/** Class names for all CV font variables — attach to <html>. */
export const cvFontVariables = [
  inter.variable,
  roboto.variable,
  lato.variable,
  sourceSans.variable,
  merriweather.variable,
].join(" ");

// Re-export the pure font config so existing imports keep working.
export { FONT_OPTIONS, fontById, type FontId } from "./font-config";
