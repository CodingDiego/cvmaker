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
