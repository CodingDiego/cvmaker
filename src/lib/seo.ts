import "server-only";
import type { Metadata } from "next";
import type {
  EducationalOrganization,
  BreadcrumbList,
  CollectionPage,
  FAQPage,
  ItemList,
  Organization,
  Person,
  SoftwareApplication,
  WebPage,
  WebSite,
  WithContext,
} from "schema-dts";
import { env } from "@/lib/env";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { TEMPLATES } from "@/templates/registry";
import type { ResumeData } from "@/lib/cv/types";

/** OpenGraph locale tags for each supported app locale. */
const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  pt: "pt_BR",
};

/**
 * Shared social-card image. Root-relative so `metadataBase` resolves it to an
 * absolute URL. MUST be repeated on every route that sets its own `openGraph`:
 * Next does not inherit `openGraph.images` from a parent once a page defines its
 * own `openGraph` object, so omitting it here silently drops the card image.
 */
export const OG_IMAGE = {
  url: "/opengraph.png",
  width: 1731,
  height: 909,
  alt: "CVMaker - Free ATS-friendly resume builder",
} as const;

/**
 * Absolute URL for a locale + path, built on the locale's subdomain. The locale
 * lives in the host now (`en|es|pt.<root>`), so `localeUrl("es", "/templates")`
 * → `https://es.free-cv.com/templates`. `siteConfig.url` is the default-locale
 * origin (`https://en.free-cv.com`); we swap its locale subdomain for `lang`.
 */
export function localeUrl(lang: Locale, path = ""): string {
  const root = new URL(siteConfig.url);
  const bareHost = root.host.replace(/^(?:en|es|pt)\./, "");
  const seg = path === "/" ? "" : path;
  return `${root.protocol}//${lang}.${bareHost}${seg}`;
}

/**
 * Per-route `alternates` with a localized canonical + full hreflang set. The
 * canonical points at the CURRENT locale's subdomain URL (e.g.
 * `https://es.free-cv.com/templates`); the `languages` map advertises every
 * locale plus an `x-default` (English). All URLs are absolute per-subdomain.
 */
export function localeAlternates(path: string, lang: Locale): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = localeUrl(l, path);
  languages["x-default"] = localeUrl(defaultLocale, path);
  return { canonical: localeUrl(lang, path), languages };
}

/**
 * Build a route's `Metadata` from localized copy: localized title/description,
 * a localized canonical + hreflang set, and matching OpenGraph/Twitter cards.
 * `absoluteTitle` opts out of the `%s · CVMaker` layout template (used by the
 * home page); `index: false` marks private/transactional routes noindex.
 */
export function pageMetadata(opts: {
  lang: Locale;
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  index?: boolean;
}): Metadata {
  const { lang, path, title, description, absoluteTitle, index = true } = opts;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: localeAlternates(path, lang),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: localeUrl(lang, path),
      locale: OG_LOCALE[lang],
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}

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

/**
 * FAQPage structured data for the home FAQ. The same Q&As are rendered visibly
 * on the page (a hard requirement for Google's FAQ markup). Note: FAQ rich
 * results are now largely restricted to authoritative gov/health sites, so this
 * mainly aids entity understanding rather than guaranteeing a rich snippet.
 */
export function faqPageLd(
  items: ReadonlyArray<{ q: string; a: string }>,
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function webPageLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): WithContext<WebPage> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function templatesCollectionPageLd(): WithContext<CollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Resume templates",
    description: "Browse ATS-friendly free and premium resume templates for CVMaker.",
    url: absoluteUrl("templates"),
    mainEntity: templatesItemListLd(),
  };
}

export function breadcrumbLd(
  items: Array<{ name: string; path: string }>,
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
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
  const skills = data.skills.flatMap((s) => s.items.map((i) => i.name)).filter(Boolean).slice(0, 40);
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
