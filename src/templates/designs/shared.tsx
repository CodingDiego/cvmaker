import type { ResumeData } from "@/lib/cv/types";

/**
 * Shared, client-safe helpers used by every design's on-screen preview. Keeps
 * the bespoke layouts DRY for the cross-cutting concerns (placeholder/faded
 * text, contact assembly, date ranges, skill flattening, accent tinting) while
 * each design owns its own structure and styling.
 */

/** Native design canvas — the mockups are authored at 760×1075 (A4 ratio). */
export const PAGE_W = 760;
export const PAGE_H = 1075;

/** A resolved text value plus whether it is faded placeholder text. */
export interface Val {
  t: string;
  faded: boolean;
}

/** Use the real value if present, else fall back to faded placeholder text. */
export function val(value: string | undefined, placeholder?: string): Val {
  const v = (value ?? "").trim();
  if (v) return { t: value as string, faded: false };
  return { t: placeholder ?? "", faded: !!(placeholder ?? "").trim() };
}

export function mapById<T extends { id: string }>(rows: T[] | undefined): Map<string, T> {
  return new Map((rows ?? []).map((r) => [r.id, r]));
}

/** Normalize a bare URL/handle into an href. */
export function hrefFor(value: string, kind: "url" | "email" | "phone" = "url"): string {
  const v = value.trim();
  if (kind === "email") return `mailto:${v}`;
  if (kind === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export type ContactKind = "url" | "email" | "phone" | "text";

export interface ContactEntry {
  key: string;
  label: string;
  kind: ContactKind;
}

/** Ordered, non-empty contact entries (real values; no placeholder fill). */
export function contactEntries(data: ResumeData): ContactEntry[] {
  const c = data.header.contact;
  const out: ContactEntry[] = [];
  if (c.location) out.push({ key: "location", label: c.location, kind: "text" });
  if (c.phone) out.push({ key: "phone", label: c.phone, kind: "phone" });
  if (c.email) out.push({ key: "email", label: c.email, kind: "email" });
  if (c.website) out.push({ key: "website", label: c.website, kind: "url" });
  if (c.linkedin) out.push({ key: "linkedin", label: c.linkedin, kind: "url" });
  if (c.github) out.push({ key: "github", label: c.github, kind: "url" });
  return out;
}

/** Contact entries with placeholder fallback, so a blank header still previews. */
export function contactEntriesWithPlaceholder(
  data: ResumeData,
  placeholder?: ResumeData,
): (ContactEntry & { faded: boolean })[] {
  const real = contactEntries(data);
  if (real.length) return real.map((e) => ({ ...e, faded: false }));
  if (!placeholder) return [];
  return contactEntries(placeholder).map((e) => ({ ...e, faded: true }));
}

export function dateRange(start: string, end: string, current?: boolean, present = "Present"): string {
  return [start, current ? present : end].filter(Boolean).join(" — ");
}

export interface FlatSkill {
  name: string;
  level?: number;
  faded: boolean;
}

/** All skills flattened across groups (for bar/chip designs), with placeholder fallback. */
export function flatSkills(data: ResumeData, placeholder?: ResumeData): FlatSkill[] {
  const real = data.skills.flatMap((g) => g.items).filter((it) => it.name.trim());
  if (real.length) return real.map((it) => ({ name: it.name, level: it.level, faded: false }));
  if (!placeholder) return [];
  return placeholder.skills
    .flatMap((g) => g.items)
    .filter((it) => it.name.trim())
    .map((it) => ({ name: it.name, level: it.level, faded: true }));
}

/** Skill groups with placeholder fallback, names only (for grouped/text designs). */
export function skillGroups(
  data: ResumeData,
  placeholder?: ResumeData,
): { id: string; category: string; items: FlatSkill[]; faded: boolean }[] {
  const hasReal = data.skills.some((g) => g.category || g.items.some((it) => it.name.trim()));
  const source = hasReal ? data.skills : (placeholder?.skills ?? []);
  const faded = !hasReal;
  return source
    .map((g) => ({
      id: g.id,
      category: g.category,
      items: g.items.filter((it) => it.name.trim()).map((it) => ({ name: it.name, level: it.level, faded })),
      faded,
    }))
    .filter((g) => g.category || g.items.length);
}

/* ----------------------------- color helpers ------------------------------ */

/** Mix `color` with another color (default white) by `pct`% — for tints/shades. */
export function mix(color: string, pct: number, other = "#ffffff"): string {
  return `color-mix(in srgb, ${color} ${pct}%, ${other})`;
}

/** A small accent palette derived from a single base accent color. */
export function tints(accent: string) {
  return {
    base: accent,
    /** very light wash (chips, tinted panels) */
    wash: mix(accent, 12),
    softer: mix(accent, 18),
    /** mid tint for hairlines */
    line: mix(accent, 35),
    /** readable accent text on white */
    text: mix(accent, 78, "#1b1f23"),
    /** dark accent (headers/bands) */
    dark: mix(accent, 82, "#0b0e12"),
  };
}

/* ----------------------- section content resolvers ------------------------ */
// These zip the live document with the placeholder sample (by item id), so a CV
// started from a template previews with faded example text until the user types.

export interface RExperience {
  id: string;
  role: Val;
  company: Val;
  location: Val;
  dates: Val;
  bullets: { t: string; faded: boolean }[];
}

export function resolveExperience(
  data: ResumeData,
  placeholder?: ResumeData,
  present = "Present",
): RExperience[] {
  const ph = mapById(placeholder?.experience);
  return data.experience.map((e) => {
    const p = ph.get(e.id);
    const bullets = (e.bullets.some((b) => b.trim()) ? e.bullets : p?.bullets ?? [])
      .filter((b) => b.trim());
    const faded = !e.bullets.some((b) => b.trim()) && !!p;
    return {
      id: e.id,
      role: val(e.role, p?.role),
      company: val(e.company, p?.company),
      location: val(e.location, p?.location),
      dates: (() => {
        const real = dateRange(e.startDate, e.endDate, e.current, present);
        if (real) return { t: real, faded: false };
        const phRange = p ? dateRange(p.startDate, p.endDate, p.current, present) : "";
        return { t: phRange, faded: !!phRange };
      })(),
      bullets: bullets.map((b) => ({ t: b, faded })),
    };
  });
}

export interface REducation {
  id: string;
  institution: Val;
  degree: Val;
  field: Val;
  location: Val;
  dates: Val;
  details: Val;
}

export function resolveEducation(data: ResumeData, placeholder?: ResumeData): REducation[] {
  const ph = mapById(placeholder?.education);
  return data.education.map((e) => {
    const p = ph.get(e.id);
    const real = [e.startDate, e.endDate].filter(Boolean).join(" — ");
    const phRange = p ? [p.startDate, p.endDate].filter(Boolean).join(" — ") : "";
    return {
      id: e.id,
      institution: val(e.institution, p?.institution),
      degree: val(e.degree, p?.degree),
      field: val(e.field, p?.field),
      location: val(e.location, p?.location),
      dates: real ? { t: real, faded: false } : { t: phRange, faded: !!phRange },
      details: val(e.details, p?.details),
    };
  });
}

export interface RProject {
  id: string;
  name: Val;
  link: Val;
  description: Val;
  bullets: { t: string; faded: boolean }[];
}

export function resolveProjects(data: ResumeData, placeholder?: ResumeData): RProject[] {
  const ph = mapById(placeholder?.projects);
  return data.projects.map((p) => {
    const x = ph.get(p.id);
    const bullets = (p.bullets.some((b) => b.trim()) ? p.bullets : x?.bullets ?? []).filter((b) => b.trim());
    const faded = !p.bullets.some((b) => b.trim()) && !!x;
    return {
      id: p.id,
      name: val(p.name, x?.name),
      link: val(p.link, x?.link),
      description: val(p.description, x?.description),
      bullets: bullets.map((b) => ({ t: b, faded })),
    };
  });
}

export interface RCertification {
  id: string;
  name: Val;
  issuer: Val;
  date: Val;
  url: string;
}

export function resolveCertifications(data: ResumeData, placeholder?: ResumeData): RCertification[] {
  const ph = mapById(placeholder?.certifications);
  return data.certifications.map((c) => {
    const p = ph.get(c.id);
    return {
      id: c.id,
      name: val(c.name, p?.name),
      issuer: val(c.issuer, p?.issuer),
      date: val(c.date, p?.date),
      url: c.url,
    };
  });
}

export interface RLanguage {
  id: string;
  name: Val;
  level: Val;
}

export function resolveLanguages(data: ResumeData, placeholder?: ResumeData): RLanguage[] {
  const ph = mapById(placeholder?.languages);
  return data.languages.map((l) => {
    const p = ph.get(l.id);
    return { id: l.id, name: val(l.name, p?.name), level: val(l.level, p?.level) };
  });
}

/** Header name/title with placeholder fallback. */
export function resolveHeader(data: ResumeData, placeholder?: ResumeData) {
  return {
    name: val(data.header.fullName, placeholder?.header.fullName),
    title: val(data.header.title, placeholder?.header.title),
    photo: data.header.photo || "",
    photoPosition: data.header.photoPosition,
  };
}

export { resolveSectionTitle, resolveSectionOrder, sectionHasContent } from "@/lib/cv/types";
