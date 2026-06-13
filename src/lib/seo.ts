import "server-only";
import type {
  EducationalOrganization,
  ItemList,
  Organization,
  Person,
  SoftwareApplication,
  WebSite,
  WithContext,
} from "schema-dts";
import { env } from "@/lib/env";
import { TEMPLATES } from "@/templates/registry";
import type { ResumeData } from "@/lib/cv/types";

/**
 * Central SEO configuration + JSON-LD builders (typed with schema-dts). Server
 * only — it reads the app URL from the environment and is consumed by route
 * metadata, the sitemap/robots files and per-page structured data.
 */
export const siteConfig = {
  name: "CVMaker",
  description:
    "Create, edit and export ATS-friendly resumes. Start with 10 free templates, then unlock Pro CV designs, live preview, PDF and DOCX export.",
  url: env.appUrl().replace(/\/$/, ""),
} as const;

/** Resolve a path to an absolute URL using the configured app URL. */
export function absoluteUrl(path = ""): string {
  return path ? `${siteConfig.url}/${path.replace(/^\//, "")}` : siteConfig.url;
}

/** Normalize a bare domain (e.g. "linkedin.com/in/x") into an absolute href. */
function toHref(value: string): string {
  const v = value.trim();
  if (!v) return v;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export function organizationLd(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: absoluteUrl("icon.png"),
  };
}

export function websiteLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function softwareApplicationLd(): WithContext<SoftwareApplication> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: siteConfig.url,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

/** ItemList of every template for the gallery page. */
export function templatesItemListLd(): WithContext<ItemList> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Resume templates",
    numberOfItems: TEMPLATES.length,
    itemListElement: TEMPLATES.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.label,
      description: t.description,
      url: absoluteUrl(`templates#${t.id}`),
    })),
  };
}

/**
 * Person structured data for a publicly shared CV — the backbone of the future
 * talent-search story (job title, skills, employer, education are all machine
 * readable).
 */
export function personLd(data: ResumeData, opts: { url: string }): WithContext<Person> {
  const c = data.header.contact;
  const sameAs = [c.linkedin, c.github, c.website].filter(Boolean).map(toHref);
  const skills = data.skills.flatMap((s) => s.items).filter(Boolean).slice(0, 40);
  const currentJob = data.experience.find((e) => e.current) ?? data.experience[0];
  const alumniOf = data.education
    .filter((e) => e.institution)
    .map<EducationalOrganization>((e) => ({
      "@type": "EducationalOrganization",
      name: e.institution,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.header.fullName || "Resume",
    url: opts.url,
    ...(data.header.title ? { jobTitle: data.header.title } : {}),
    ...(data.summary ? { description: data.summary } : {}),
    ...(c.email ? { email: `mailto:${c.email}` } : {}),
    ...(c.location
      ? { address: { "@type": "PostalAddress", addressLocality: c.location } }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(skills.length ? { knowsAbout: skills } : {}),
    ...(currentJob?.company
      ? { worksFor: { "@type": "Organization", name: currentJob.company } }
      : {}),
    ...(alumniOf.length ? { alumniOf } : {}),
  };
}
