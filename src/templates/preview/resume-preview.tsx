import type { CSSProperties, ReactNode } from "react";
import type { ResumeData } from "@/lib/cv/types";
import { resolveSectionOrder } from "@/lib/cv/types";
import { fontById } from "@/lib/font-config";
import { DENSITY_SPACING, type TemplateTokens } from "@/templates/types";

// A4 width at 96dpi. The editor scales this paper to fit its container.
export const PAGE_WIDTH = 794;

interface PreviewProps {
  data: ResumeData;
  tokens: TemplateTokens;
  accentColor?: string;
  fontFamily?: string;
  /**
   * When false, links render as plain styled text instead of <a> elements.
   * Used for static thumbnails that may sit inside an outer <a> (e.g. a card
   * Link), which would otherwise nest anchors and break hydration.
   */
  interactive?: boolean;
}

const INK = "#1f2937";
const SUBTLE = "#6b7280";
const FAINT = "#9ca3af";

/** Normalize a possibly-bare URL/handle into an href. */
function hrefFor(value: string, kind: "url" | "email" | "phone" = "url"): string {
  const v = value.trim();
  if (kind === "email") return `mailto:${v}`;
  if (kind === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export function ResumePreview({ data, tokens, accentColor, fontFamily, interactive = true }: PreviewProps) {
  const accent = accentColor || tokens.accentColor;
  const font = fontById(fontFamily ?? tokens.font);
  const sp = DENSITY_SPACING[tokens.density];
  const isTwoCol = tokens.layout === "two-column";
  const pad = tokens.density === "compact" ? 40 : tokens.density === "roomy" ? 56 : 48;
  const bullet = tokens.bullet ?? "disc";
  const onBand = tokens.headerStyle === "band";
  const centered = tokens.headerAlign === "center" && !isTwoCol;

  const page: CSSProperties = {
    width: PAGE_WIDTH,
    minHeight: PAGE_WIDTH * 1.414,
    background: "#ffffff",
    color: INK,
    fontFamily: font.cssVar,
    fontSize: 11,
    lineHeight: sp.line,
    padding: pad,
    boxSizing: "border-box",
  };

  function titleStyle(): CSSProperties {
    const base: CSSProperties = {
      fontSize: 12.5,
      fontWeight: 700,
      margin: 0,
      color: tokens.accent === "heading" && !tokens.accentChip ? accent : "#111827",
      display: "inline-block",
    };
    switch (tokens.sectionTitle) {
      case "uppercase":
        return { ...base, textTransform: "uppercase", letterSpacing: 1.2 };
      case "smallcaps":
        return { ...base, fontVariant: "small-caps", letterSpacing: 0.8, fontSize: 14 };
      case "bar":
        return { ...base, textTransform: "uppercase", letterSpacing: 1.2 };
      case "capitalize":
      default:
        return { ...base, textTransform: "capitalize" };
    }
  }

  const sectionTitleNode = (children: ReactNode) => {
    const isBar = tokens.sectionTitle === "bar";
    const chip = tokens.accentChip;
    return (
      <div
        style={{
          marginBottom: 6,
          ...(isBar ? { borderLeft: `3px solid ${accent}`, paddingLeft: 9 } : null),
          textAlign: centered ? "center" : "left",
        }}
      >
        <h2
          style={{
            ...titleStyle(),
            ...(chip ? { background: accent, color: "#fff", padding: "2px 8px", borderRadius: 4 } : null),
            ...(tokens.titleUnderline && !chip ? { borderBottom: `2px solid ${accent}`, paddingBottom: 2 } : null),
          }}
        >
          {children}
        </h2>
        {tokens.divider && !chip && (
          <div style={{ height: 1.5, marginTop: 4, background: tokens.accent === "rule" ? accent : "#d1d5db" }} />
        )}
      </div>
    );
  };

  const sectionNode = (title: string, children: ReactNode, key: string) => (
    <section key={key} style={{ marginBottom: sp.section }}>
      {sectionTitleNode(title)}
      <div>{children}</div>
    </section>
  );

  const markers: Record<string, string> = { disc: "•", dash: "–", square: "▪", none: "" };
  const bulletsNode = (items: string[]) => {
    const list = items.filter(Boolean);
    if (!list.length) return null;
    if (bullet === "none")
      return (
        <div style={{ margin: "4px 0 0" }}>
          {list.map((b, i) => (
            <p key={i} style={{ margin: "0 0 2px" }}>
              {b}
            </p>
          ))}
        </div>
      );
    return (
      <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none" }}>
        {list.map((b, i) => (
          <li key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
            <span style={{ color: accent, lineHeight: sp.line }}>{markers[bullet]}</span>
            <span style={{ flex: 1 }}>{b}</span>
          </li>
        ))}
      </ul>
    );
  };

  const linkNode = (value: string, children: ReactNode, kind?: "url" | "email" | "phone") =>
    interactive ? (
      <a href={hrefFor(value, kind)} target="_blank" rel="noreferrer noopener" style={{ color: accent, textDecoration: "none" }}>
        {children}
      </a>
    ) : (
      <span style={{ color: accent }}>{children}</span>
    );

  const dateRange = (a: string, b: string, current?: boolean) =>
    [a, current ? "Present" : b].filter(Boolean).join(" – ");

  // --- Built-in section renderers ---
  const renderers: Record<string, () => ReactNode> = {
    summary: () =>
      data.summary?.trim()
        ? sectionNode("Summary", <p style={{ margin: 0 }}>{data.summary}</p>, "summary")
        : null,

    experience: () =>
      data.experience.length
        ? sectionNode(
            "Experience",
            data.experience.map((e) => (
              <div key={e.id} style={{ marginBottom: sp.item }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong>{e.role}</strong>
                  <span style={{ whiteSpace: "nowrap", color: SUBTLE }}>{dateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                <div style={{ color: accent, fontWeight: 600 }}>{[e.company, e.location].filter(Boolean).join(" · ")}</div>
                {bulletsNode(e.bullets)}
              </div>
            )),
            "experience",
          )
        : null,

    education: () =>
      data.education.length
        ? sectionNode(
            "Education",
            data.education.map((e) => (
              <div key={e.id} style={{ marginBottom: sp.item }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong>{e.institution}</strong>
                  <span style={{ whiteSpace: "nowrap", color: SUBTLE }}>{dateRange(e.startDate, e.endDate)}</span>
                </div>
                <div style={{ color: "#374151" }}>
                  {[[e.degree, e.field].filter(Boolean).join(", "), e.location].filter(Boolean).join(" · ")}
                </div>
                {e.details && <div style={{ color: "#4b5563" }}>{e.details}</div>}
              </div>
            )),
            "education",
          )
        : null,

    skills: () =>
      data.skills.length
        ? sectionNode(
            "Skills",
            data.skills.map((g) => (
              <div key={g.id} style={{ marginBottom: 4 }}>
                {g.category && <strong>{g.category}: </strong>}
                <span>{g.items.filter(Boolean).join(", ")}</span>
              </div>
            )),
            "skills",
          )
        : null,

    projects: () =>
      data.projects.length
        ? sectionNode(
            "Projects",
            data.projects.map((p) => (
              <div key={p.id} style={{ marginBottom: sp.item }}>
                <div>
                  <strong>{p.name}</strong>
                  {p.link && <span style={{ marginLeft: 6 }}>{linkNode(p.link, p.link)}</span>}
                </div>
                {p.description && <div style={{ color: "#374151" }}>{p.description}</div>}
                {bulletsNode(p.bullets)}
              </div>
            )),
            "projects",
          )
        : null,

    certifications: () =>
      data.certifications.length
        ? sectionNode(
            "Certifications",
            data.certifications.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                <span>
                  {c.url ? linkNode(c.url, c.name || c.url) : <span>{c.name}</span>}
                  {c.issuer && <span style={{ color: "#374151" }}> — {c.issuer}</span>}
                </span>
                <span style={{ color: SUBTLE, whiteSpace: "nowrap" }}>{c.date}</span>
              </div>
            )),
            "certifications",
          )
        : null,

    languages: () =>
      data.languages.length
        ? sectionNode(
            "Languages",
            data.languages.map((l) => (
              <span key={l.id} style={{ marginRight: 12 }}>
                {l.name}
                {l.level && <span style={{ color: SUBTLE }}> ({l.level})</span>}
              </span>
            )),
            "languages",
          )
        : null,
  };

  const renderCustom = (id: string): ReactNode => {
    const c = data.custom.find((s) => s.id === id);
    if (!c || (!c.title && !c.items.length)) return null;
    return sectionNode(c.title || "Section", bulletsNode(c.items.map((i) => i.text)), `custom:${id}`);
  };

  const renderKey = (key: string): ReactNode =>
    key.startsWith("custom:") ? renderCustom(key.slice("custom:".length)) : renderers[key]?.() ?? null;

  // --- Header / contact ---
  const contact = data.header.contact;
  const contactEntries: { label: string; value: string; kind?: "url" | "email" | "phone" }[] = [
    contact.email && { label: contact.email, value: contact.email, kind: "email" as const },
    contact.phone && { label: contact.phone, value: contact.phone, kind: "phone" as const },
    contact.location && { label: contact.location, value: "" },
    contact.website && { label: contact.website, value: contact.website },
    contact.linkedin && { label: contact.linkedin, value: contact.linkedin },
    contact.github && { label: contact.github, value: contact.github },
  ].filter(Boolean) as { label: string; value: string; kind?: "url" | "email" | "phone" }[];

  const contactColor = onBand ? "rgba(255,255,255,0.85)" : SUBTLE;

  const contactNode = (e: (typeof contactEntries)[number]) =>
    e.value ? linkNode(e.value, e.label, e.kind) : <span>{e.label}</span>;

  const contactBlock = () => {
    if (!contactEntries.length) return null;
    if (tokens.contactStyle === "stacked") {
      return (
        <div style={{ fontSize: 10, color: contactColor, marginTop: 6, lineHeight: 1.6 }}>
          {contactEntries.map((e, i) => (
            <div key={i}>{contactNode(e)}</div>
          ))}
        </div>
      );
    }
    return (
      <div
        style={{
          fontSize: 10,
          color: contactColor,
          marginTop: 6,
          display: "flex",
          flexWrap: "wrap",
          gap: "2px 10px",
          justifyContent: centered ? "center" : "flex-start",
        }}
      >
        {contactEntries.map((e, i) => (
          <span key={i}>
            {i > 0 && <span style={{ color: onBand ? "rgba(255,255,255,0.5)" : FAINT, marginRight: 10 }}>•</span>}
            {contactNode(e)}
          </span>
        ))}
      </div>
    );
  };

  const nameStyle: CSSProperties = {
    fontSize: tokens.nameSize,
    margin: 0,
    fontWeight: 700,
    lineHeight: 1.05,
    color: onBand ? "#fff" : tokens.accent === "name" ? accent : "#111827",
    textTransform: tokens.uppercaseName ? "uppercase" : undefined,
    letterSpacing: tokens.letterSpacedName ? 2 : -0.2,
  };

  const textBlock = (
    <>
      <h1 style={nameStyle}>{data.header.fullName || "Your Name"}</h1>
      {data.header.title && (
        <div
          style={{
            fontSize: 13,
            color: onBand ? "rgba(255,255,255,0.9)" : tokens.accent === "name" ? "#4b5563" : accent,
            marginTop: 3,
            fontWeight: 600,
            letterSpacing: tokens.letterSpacedName ? 1 : undefined,
            textTransform: tokens.sectionTitle === "smallcaps" ? "uppercase" : undefined,
          }}
        >
          {data.header.title}
        </div>
      )}
      {contactBlock()}
    </>
  );

  // Optional profile photo positioned relative to the name/contact block.
  const photoPos = data.header.photoPosition ?? "left";
  const PHOTO_SIZE = 88;
  const photoEl = data.header.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={data.header.photo}
      alt=""
      style={{
        width: PHOTO_SIZE,
        height: PHOTO_SIZE,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        border: onBand ? "2px solid rgba(255,255,255,0.7)" : `2px solid ${accent}`,
      }}
    />
  ) : null;

  const headerInner = photoEl ? (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexDirection: photoPos === "center" ? "column" : photoPos === "right" ? "row-reverse" : "row",
        ...(photoPos === "center" ? { textAlign: "center" as const } : null),
      }}
    >
      {photoEl}
      <div style={{ minWidth: 0, flex: photoPos === "center" ? undefined : 1 }}>{textBlock}</div>
    </div>
  ) : (
    textBlock
  );

  let header: ReactNode;
  if (onBand) {
    header = (
      <header style={{ textAlign: "center", background: accent, margin: `${-pad}px ${-pad}px ${sp.section}px`, padding: `${pad * 0.7}px ${pad}px` }}>
        {headerInner}
      </header>
    );
  } else if (tokens.headerStyle === "boxed") {
    header = (
      <header style={{ textAlign: tokens.headerAlign, marginBottom: sp.section, border: `1.5px solid ${accent}`, borderRadius: 6, padding: 14 }}>
        {headerInner}
      </header>
    );
  } else if (tokens.headerStyle === "underline") {
    header = (
      <header style={{ textAlign: tokens.headerAlign, marginBottom: sp.section, borderBottom: `2px solid ${tokens.accent === "none" ? "#d1d5db" : accent}`, paddingBottom: 10 }}>
        {headerInner}
      </header>
    );
  } else {
    header = <header style={{ textAlign: tokens.headerAlign, marginBottom: sp.section }}>{headerInner}</header>;
  }

  const fullOrder = resolveSectionOrder(data);

  if (isTwoCol) {
    const sidebarKeys = new Set(["skills", "languages", "certifications"]);
    const mainKeys = fullOrder.filter((k) => !sidebarKeys.has(k));
    const sideKeys = fullOrder.filter((k) => sidebarKeys.has(k));
    return (
      <div style={page}>
        {header}
        <div style={{ display: "flex", gap: 22 }}>
          <div
            style={{
              flex: "0 0 33%",
              ...(tokens.sidebarTint
                ? { background: `color-mix(in srgb, ${accent} 8%, #ffffff)`, borderRadius: 6, padding: 14, marginTop: -2 }
                : null),
            }}
          >
            {sideKeys.map((k) => renderKey(k))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>{mainKeys.map((k) => renderKey(k))}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      {header}
      {fullOrder.map((k) => renderKey(k))}
    </div>
  );
}
