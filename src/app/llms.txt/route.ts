import { absoluteUrl, siteConfig } from "@/lib/seo";
import { FREE_TEMPLATES } from "@/templates/registry";

/**
 * `/llms.txt` — a plain-text, Markdown-formatted map of the site for LLMs
 * (https://llmstxt.org). Built from the same SEO config and template registry
 * the rest of the app uses, so it stays in sync. No request-time data, so it is
 * served as a static asset.
 */

const pages: Array<{ path: string; label: string; note: string }> = [
  { path: "/", label: "Home", note: "What CVMaker is and how the build → switch → export flow works." },
  { path: "/templates", label: "Templates", note: "Browse every ATS-friendly resume template." },
  { path: "/register", label: "Sign up", note: "Create a free account to build and save CVs." },
  { path: "/login", label: "Log in", note: "Sign in to an existing account." },
  { path: "/privacy", label: "Privacy Policy", note: "How user data is handled." },
  { path: "/terms", label: "Terms of Service", note: "Terms of use." },
];

function buildLlmsTxt(): string {
  const lines: string[] = [];

  lines.push(`# ${siteConfig.name}`);
  lines.push("");
  lines.push(
    "> Free, ATS-friendly resume builder. Create and edit a CV once, switch between distinct templates, and export selectable-text PDF, editable DOCX or a ZIP of every format — no watermarks.",
  );
  lines.push("");
  lines.push(
    "CVMaker stores a resume as one structured draft and renders it through multiple ATS-safe layouts. Drafts stay private until the user publishes a shareable public link.",
  );
  lines.push("");

  lines.push("## Pages");
  for (const p of pages) {
    lines.push(`- [${p.label}](${absoluteUrl(p.path)}): ${p.note}`);
  }
  lines.push("");

  lines.push("## Templates");
  for (const t of FREE_TEMPLATES) {
    lines.push(`- [${t.label}](${absoluteUrl(`templates#${t.id}`)}): ${t.description}`);
  }
  lines.push("");

  lines.push("## Export formats");
  lines.push("- PDF — clean, selectable text that parses reliably in applicant tracking systems.");
  lines.push("- DOCX — fully editable Microsoft Word document.");
  lines.push("- ZIP — one download containing every available format.");
  lines.push("");

  return lines.join("\n");
}

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
