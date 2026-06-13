import type { CSSProperties } from "react";
import type { ResumeData } from "@/lib/cv/types";
import { fontById } from "@/lib/font-config";
import { DENSITY_SPACING, type TemplateTokens } from "@/templates/types";

// A4 width at 96dpi. The editor scales this paper to fit its container.
export const PAGE_WIDTH = 794;

interface PreviewProps {
  data: ResumeData;
  tokens: TemplateTokens;
  accentColor?: string;
  fontFamily?: string;
}

function titleStyle(tokens: TemplateTokens, accent: string): CSSProperties {
  const base: CSSProperties = {
    fontSize: 12.5,
    fontWeight: 700,
    margin: 0,
    marginBottom: 6,
    color: tokens.accent === "heading" ? accent : "#111827",
  };
  switch (tokens.sectionTitle) {
    case "uppercase":
      return { ...base, textTransform: "uppercase", letterSpacing: 1 };
    case "smallcaps":
      return { ...base, fontVariant: "small-caps", letterSpacing: 0.5, fontSize: 14 };
    case "bar":
      return { ...base, textTransform: "uppercase", letterSpacing: 1, paddingLeft: 8, borderLeft: `3px solid ${accent}` };
    case "capitalize":
    default:
      return { ...base, textTransform: "capitalize" };
  }
}

export function ResumePreview({ data, tokens, accentColor, fontFamily }: PreviewProps) {
  const accent = accentColor || tokens.accentColor;
  const font = fontById(fontFamily ?? tokens.font);
  const sp = DENSITY_SPACING[tokens.density];
  const isTwoCol = tokens.layout === "two-column";

  const page: CSSProperties = {
    width: PAGE_WIDTH,
    minHeight: PAGE_WIDTH * 1.414,
    background: "#ffffff",
    color: "#1f2937",
    fontFamily: font.cssVar,
    fontSize: 11,
    lineHeight: sp.line,
    padding: tokens.density === "compact" ? 40 : 48,
    boxSizing: "border-box",
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ marginBottom: 6 }}>
      <h2 style={titleStyle(tokens, accent)}>{children}</h2>
      {tokens.divider && (
        <div style={{ height: 1.5, background: tokens.accent === "rule" ? accent : "#d1d5db" }} />
      )}
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: sp.section }}>
      <SectionTitle>{title}</SectionTitle>
      <div>{children}</div>
    </section>
  );

  const Bullets = ({ items }: { items: string[] }) =>
    items.filter(Boolean).length ? (
      <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
        {items.filter(Boolean).map((b, i) => (
          <li key={i} style={{ marginBottom: 2 }}>
            {b}
          </li>
        ))}
      </ul>
    ) : null;

  const dateRange = (a: string, b: string, current?: boolean) =>
    [a, current ? "Present" : b].filter(Boolean).join(" – ");

  // --- Section renderers ---
  const renderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      data.summary?.trim() ? (
        <Section title="Summary" key="summary">
          <p style={{ margin: 0 }}>{data.summary}</p>
        </Section>
      ) : null,

    experience: () =>
      data.experience.length ? (
        <Section title="Experience" key="experience">
          {data.experience.map((e) => (
            <div key={e.id} style={{ marginBottom: sp.item }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong>{e.role}</strong>
                <span style={{ whiteSpace: "nowrap", color: "#6b7280" }}>
                  {dateRange(e.startDate, e.endDate, e.current)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "#374151" }}>
                <span>{[e.company, e.location].filter(Boolean).join(" · ")}</span>
              </div>
              <Bullets items={e.bullets} />
            </div>
          ))}
        </Section>
      ) : null,

    education: () =>
      data.education.length ? (
        <Section title="Education" key="education">
          {data.education.map((e) => (
            <div key={e.id} style={{ marginBottom: sp.item }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong>{e.institution}</strong>
                <span style={{ whiteSpace: "nowrap", color: "#6b7280" }}>
                  {dateRange(e.startDate, e.endDate)}
                </span>
              </div>
              <div style={{ color: "#374151" }}>
                {[[e.degree, e.field].filter(Boolean).join(", "), e.location].filter(Boolean).join(" · ")}
              </div>
              {e.details && <div style={{ color: "#4b5563" }}>{e.details}</div>}
            </div>
          ))}
        </Section>
      ) : null,

    skills: () =>
      data.skills.length ? (
        <Section title="Skills" key="skills">
          {data.skills.map((g) => (
            <div key={g.id} style={{ marginBottom: 3 }}>
              {g.category && <strong>{g.category}: </strong>}
              <span>{g.items.filter(Boolean).join(", ")}</span>
            </div>
          ))}
        </Section>
      ) : null,

    projects: () =>
      data.projects.length ? (
        <Section title="Projects" key="projects">
          {data.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: sp.item }}>
              <div>
                <strong>{p.name}</strong>
                {p.link && <span style={{ color: accent, marginLeft: 6 }}>{p.link}</span>}
              </div>
              {p.description && <div style={{ color: "#374151" }}>{p.description}</div>}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </Section>
      ) : null,

    certifications: () =>
      data.certifications.length ? (
        <Section title="Certifications" key="certifications">
          {data.certifications.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span>{[c.name, c.issuer].filter(Boolean).join(" — ")}</span>
              <span style={{ color: "#6b7280" }}>{c.date}</span>
            </div>
          ))}
        </Section>
      ) : null,

    languages: () =>
      data.languages.length ? (
        <Section title="Languages" key="languages">
          {data.languages.map((l) => (
            <span key={l.id} style={{ marginRight: 12 }}>
              {l.name}
              {l.level && <span style={{ color: "#6b7280" }}> ({l.level})</span>}
            </span>
          ))}
        </Section>
      ) : null,
  };

  const customSections = data.custom.map((c) =>
    c.title || c.items.length ? (
      <Section title={c.title || "Section"} key={c.id}>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {c.items.filter((i) => i.text).map((i) => (
            <li key={i.id}>{i.text}</li>
          ))}
        </ul>
      </Section>
    ) : null,
  );

  const contact = data.header.contact;
  const contactLine = [
    contact.email,
    contact.phone,
    contact.location,
    contact.website,
    contact.linkedin,
    contact.github,
  ]
    .filter(Boolean)
    .join("  •  ");

  const Header = (
    <header style={{ textAlign: tokens.headerAlign, marginBottom: sp.section }}>
      <h1
        style={{
          fontSize: tokens.nameSize,
          margin: 0,
          fontWeight: 700,
          color: tokens.accent === "name" ? accent : "#111827",
        }}
      >
        {data.header.fullName || "Your Name"}
      </h1>
      {data.header.title && (
        <div style={{ fontSize: 13, color: "#4b5563", marginTop: 2 }}>{data.header.title}</div>
      )}
      {contactLine && (
        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 6 }}>{contactLine}</div>
      )}
    </header>
  );

  // Sidebar sections for two-column layout.
  const sidebarKeys = new Set(["skills", "languages", "certifications"]);
  const order = data.sectionOrder.filter((k) => renderers[k]);
  const extraOrdered = ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
    .filter((k) => !order.includes(k));
  const fullOrder = [...order, ...extraOrdered];

  if (isTwoCol) {
    const mainKeys = fullOrder.filter((k) => !sidebarKeys.has(k));
    const sideKeys = fullOrder.filter((k) => sidebarKeys.has(k));
    return (
      <div style={page}>
        {Header}
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: "0 0 32%" }}>
            {sideKeys.map((k) => renderers[k]?.())}
            {customSections}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>{mainKeys.map((k) => renderers[k]?.())}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      {Header}
      {fullOrder.map((k) => renderers[k]?.())}
      {customSections}
    </div>
  );
}
