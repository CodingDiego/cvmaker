import {
  Fraunces,
  Manrope,
  Geist_Mono,
  Inter,
  Roboto,
  Lato,
  Source_Sans_3,
  Merriweather,
  Arimo,
  Archivo,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  Cormorant_Garamond,
  EB_Garamond,
  Work_Sans,
  Libre_Franklin,
  Source_Serif_4,
} from "next/font/google";

// App chrome fonts — a distinctive editorial pairing (not Inter/Roboto):
// Fraunces (a characterful modern serif) for display/headings, Manrope (a clean
// geometric sans) for body/UI. These style the app only; the ATS-safe CV fonts
// below are separate.
export const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});
export const sans = Manrope({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
export const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

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

// Design-specific CV fonts — each new bespoke design ships with the typeface it
// was authored in (font is part of the design's identity, not user-selectable).
// All self-hosted by next/font so the strict `font-src 'self'` CSP holds.
export const arimo = Arimo({
  variable: "--font-cv-arimo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
export const archivo = Archivo({
  variable: "--font-cv-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
export const plexSans = IBM_Plex_Sans({
  variable: "--font-cv-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
export const plexMono = IBM_Plex_Mono({
  variable: "--font-cv-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
export const cormorant = Cormorant_Garamond({
  variable: "--font-cv-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
export const ebGaramond = EB_Garamond({
  variable: "--font-cv-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});
export const workSans = Work_Sans({
  variable: "--font-cv-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
export const libreFranklin = Libre_Franklin({
  variable: "--font-cv-libre-franklin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
export const sourceSerif = Source_Serif_4({
  variable: "--font-cv-source-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/** Class names for all CV font variables — attach to <html>. */
export const cvFontVariables = [
  inter.variable,
  roboto.variable,
  lato.variable,
  sourceSans.variable,
  merriweather.variable,
  arimo.variable,
  archivo.variable,
  plexSans.variable,
  plexMono.variable,
  cormorant.variable,
  ebGaramond.variable,
  workSans.variable,
  libreFranklin.variable,
  sourceSerif.variable,
].join(" ");

// Re-export the pure font config so existing imports keep working.
export { FONT_OPTIONS, fontById, type FontId } from "./font-config";
