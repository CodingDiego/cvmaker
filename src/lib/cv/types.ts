import { z } from "zod";

/**
 * Structured, ATS-friendly resume document. Stored as JSONB in `cvs.data` and
 * consumed by all three renderers (HTML preview, react-pdf, docx).
 */

export const contactSchema = z.object({
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().default(""),
  role: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  details: z.string().default(""),
});

export const skillGroupSchema = z.object({
  id: z.string(),
  category: z.string().default(""),
  items: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  link: z.string().default(""),
  description: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
});

export const languageSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  level: z.string().default(""),
});

export const customSectionSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  items: z.array(z.object({ id: z.string(), text: z.string().default("") })).default([]),
});

export const resumeSchema = z.object({
  header: z.object({
    fullName: z.string().default(""),
    title: z.string().default(""),
    // Optional profile photo as a data URL (resized client-side before storing)
    // and where it sits relative to the name block.
    photo: z.string().default(""),
    photoPosition: z.enum(["left", "center", "right"]).default("left"),
    contact: contactSchema.default(() => contactSchema.parse({})),
  }),
  summary: z.string().default(""),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillGroupSchema).default([]),
  projects: z.array(projectSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  languages: z.array(languageSchema).default([]),
  custom: z.array(customSectionSchema).default([]),
  // User overrides for built-in section headings (e.g. rename "Education" to
  // "Studies"). Keyed by built-in section key; an empty/absent value falls back
  // to the default label in SECTION_LABELS. Custom sections carry their own title.
  sectionTitles: z.record(z.string(), z.string()).default({}),
  // Section render order. Built-in keys (see BUILT_IN_SECTIONS) plus custom
  // sections referenced as `custom:<id>`, so custom sections can be reordered
  // freely among the built-in ones.
  sectionOrder: z.array(z.string()).default([
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
  ]),
});

/** The fixed, built-in section keys in their default order. */
export const BUILT_IN_SECTIONS = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
] as const;

export const SECTION_LABELS: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};

/**
 * Display title for a section, honoring user renames of built-in headings and
 * each custom section's own title. Used by every renderer (preview, PDF, DOCX)
 * so a rename flows through to exports.
 */
export function resolveSectionTitle(data: ResumeData, key: string): string {
  if (key.startsWith("custom:")) {
    const c = data.custom.find((s) => `custom:${s.id}` === key);
    return c?.title?.trim() || "Section";
  }
  return data.sectionTitles?.[key]?.trim() || SECTION_LABELS[key] || key;
}

/** Whether a section currently holds any real (non-empty) content. */
export function sectionHasContent(data: ResumeData, key: string): boolean {
  switch (key) {
    case "summary":
      return !!data.summary.trim();
    case "experience":
      return data.experience.some(
        (e) => e.role || e.company || e.location || e.startDate || e.endDate || e.bullets.some(Boolean),
      );
    case "education":
      return data.education.some(
        (e) => e.institution || e.degree || e.field || e.location || e.details || e.startDate || e.endDate,
      );
    case "skills":
      return data.skills.some((g) => g.category || g.items.some(Boolean));
    case "projects":
      return data.projects.some((p) => p.name || p.description || p.link || p.bullets.some(Boolean));
    case "certifications":
      return data.certifications.some((c) => c.name || c.issuer || c.date || c.url);
    case "languages":
      return data.languages.some((l) => l.name || l.level);
    default:
      if (key.startsWith("custom:")) {
        const c = data.custom.find((s) => `custom:${s.id}` === key);
        return !!c && (!!c.title.trim() || c.items.some((i) => i.text.trim()));
      }
      return true;
  }
}

/** Number of item rows a built-in list section currently has. */
function sectionItemCount(data: ResumeData, key: string): number {
  switch (key) {
    case "experience":
      return data.experience.length;
    case "education":
      return data.education.length;
    case "skills":
      return data.skills.length;
    case "projects":
      return data.projects.length;
    case "certifications":
      return data.certifications.length;
    case "languages":
      return data.languages.length;
    default:
      return 0;
  }
}

/**
 * Keys of sections the user has *kept* but left without any real content — they
 * would render as empty blocks in the preview/exports. Surfaced on export so the
 * user fills them in or removes them. A section with zero rows is treated as
 * intentionally omitted (renderers skip it) and is not flagged; the optional
 * summary is likewise never flagged when blank.
 */
export function validateResume(data: ResumeData): string[] {
  const empty: string[] = [];
  for (const key of resolveSectionOrder(data)) {
    if (key === "summary") continue;
    if (sectionHasContent(data, key)) continue;
    if (key.startsWith("custom:")) {
      empty.push(key);
    } else if (sectionItemCount(data, key) > 0) {
      empty.push(key);
    }
  }
  return empty;
}

/** Build the resolved render order: stored order first, then any missing keys. */
export function resolveSectionOrder(data: ResumeData): string[] {
  const order = data.sectionOrder.filter(
    (k) =>
      BUILT_IN_SECTIONS.includes(k as (typeof BUILT_IN_SECTIONS)[number]) ||
      (k.startsWith("custom:") && data.custom.some((c) => `custom:${c.id}` === k)),
  );
  const missingBuiltIns = BUILT_IN_SECTIONS.filter((k) => !order.includes(k));
  const missingCustom = data.custom
    .map((c) => `custom:${c.id}`)
    .filter((k) => !order.includes(k));
  return [...order, ...missingBuiltIns, ...missingCustom];
}

export type Contact = z.infer<typeof contactSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Language = z.infer<typeof languageSchema>;
export type CustomSection = z.infer<typeof customSectionSchema>;
export type ResumeData = z.infer<typeof resumeSchema>;

/** A starter document used when creating a new CV. */
export function emptyResume(): ResumeData {
  return resumeSchema.parse({
    header: { fullName: "", title: "", contact: {} },
  });
}

/**
 * The document a CV is seeded with when created from a template. It mirrors the
 * *structure* of {@link sampleResume} — same section items, same ids — but every
 * editable value is blank. The sample then doubles as the placeholder source
 * (`PLACEHOLDER_RESUME`), so the editor can show example text as a placeholder
 * (matched by id) that vanishes the moment the user types a real value, while
 * the stored/exported document only ever contains what the user actually wrote.
 */
export function templateStarter(): ResumeData {
  const s = sampleResume();
  return resumeSchema.parse({
    header: {
      fullName: "",
      title: "",
      photo: "",
      photoPosition: s.header.photoPosition,
      contact: {},
    },
    summary: "",
    experience: s.experience.map((e) => ({
      id: e.id,
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [],
    })),
    education: s.education.map((e) => ({
      id: e.id,
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      details: "",
    })),
    skills: s.skills.map((g) => ({ id: g.id, category: "", items: [] })),
    projects: s.projects.map((p) => ({ id: p.id, name: "", link: "", description: "", bullets: [] })),
    certifications: s.certifications.map((c) => ({ id: c.id, name: "", issuer: "", date: "", url: "" })),
    languages: s.languages.map((l) => ({ id: l.id, name: "", level: "" })),
    custom: [],
    sectionOrder: s.sectionOrder,
  });
}

/** A friendly sample document so a new CV isn't blank. */
export function sampleResume(): ResumeData {
  return resumeSchema.parse({
    header: {
      fullName: "Alex Morgan",
      title: "Senior Software Engineer",
      contact: {
        email: "alex.morgan@email.com",
        phone: "+1 (555) 012-3456",
        location: "San Francisco, CA",
        website: "alexmorgan.dev",
        linkedin: "linkedin.com/in/alexmorgan",
        github: "github.com/alexmorgan",
      },
    },
    summary:
      "Senior software engineer with 8+ years building scalable web platforms. Specialized in TypeScript, React, and distributed systems, with a track record of leading teams and shipping high-impact products.",
    experience: [
      {
        id: "exp-1",
        company: "TechCorp",
        role: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: "2021",
        endDate: "",
        current: true,
        bullets: [
          "Led migration of a monolith to a microservices architecture, reducing deploy time by 70%.",
          "Mentored 5 engineers and established frontend testing standards adopted org-wide.",
          "Built a real-time analytics dashboard serving 2M+ daily events.",
        ],
      },
      {
        id: "exp-2",
        company: "StartupXYZ",
        role: "Software Engineer",
        location: "Remote",
        startDate: "2018",
        endDate: "2021",
        current: false,
        bullets: [
          "Shipped the core billing system processing $10M+ in annual revenue.",
          "Improved API latency by 45% through query optimization and caching.",
        ],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "University of California, Berkeley",
        degree: "B.S.",
        field: "Computer Science",
        location: "Berkeley, CA",
        startDate: "2014",
        endDate: "2018",
        details: "",
      },
    ],
    skills: [
      { id: "sk-1", category: "Languages", items: ["TypeScript", "JavaScript", "Python", "Go"] },
      { id: "sk-2", category: "Frameworks", items: ["React", "Next.js", "Node.js"] },
      { id: "sk-3", category: "Tools", items: ["PostgreSQL", "Redis", "Docker", "AWS"] },
    ],
    projects: [
      {
        id: "prj-1",
        name: "OpenResume",
        link: "github.com/alexmorgan/openresume",
        description: "An open-source resume builder with 3k+ GitHub stars.",
        bullets: [],
      },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AWS Solutions Architect",
        issuer: "Amazon",
        date: "2022",
        url: "credly.com/badges/alexmorgan-aws",
      },
    ],
    languages: [
      { id: "lng-1", name: "English", level: "Native" },
      { id: "lng-2", name: "Spanish", level: "Professional" },
    ],
    custom: [],
  });
}

/**
 * Whether a resume carries no user-entered content yet — a fresh draft created
 * from a template (see {@link templateStarter}) before anything is typed. Used by
 * the dashboard to swap in sample content so a blank draft still previews the
 * template design instead of an empty page.
 */
export function isResumeEmpty(data: ResumeData): boolean {
  const h = data.header;
  const headerHasContent =
    !!h.fullName.trim() ||
    !!h.title.trim() ||
    !!h.photo ||
    Object.values(h.contact).some((v) => typeof v === "string" && v.trim().length > 0);
  if (headerHasContent) return false;

  const keys = [...BUILT_IN_SECTIONS, ...data.custom.map((c) => `custom:${c.id}`)];
  return !keys.some((key) => sectionHasContent(data, key));
}
