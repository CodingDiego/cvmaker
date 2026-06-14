import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import type { ResumeData } from "@/lib/cv/types";
import { resolveSectionOrder } from "@/lib/cv/types";
import { fontById } from "@/lib/font-config";
import { DENSITY_SPACING, type TemplateTokens } from "@/templates/types";

// A4 width at 96dpi. The editor scales this paper to fit its container.
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = PAGE_WIDTH * 1.414;

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
  /**
   * Example content (matched to `data` by item id) shown as faded placeholder
   * text wherever a field is empty. Lets a CV started from a template look
   * populated while every blank field still reads as a placeholder that
   * disappears the instant the user types a real value. Only the live editor
   * preview passes this; thumbnails, exports and saved data are unaffected.
   */
  placeholder?: ResumeData;
}

const INK = "#1f2937";
const SUBTLE = "#6b7280";
const FAINT = "#9ca3af";

/** Section keys that live in the sidebar of two-column layouts. */
const SIDEBAR_KEYS = new Set(["skills", "languages", "certifications"]);

/** Normalize a possibly-bare URL/handle into an href. */
function hrefFor(value: string, kind: "url" | "email" | "phone" = "url"): string {
  const v = value.trim();
  if (kind === "email") return `mailto:${v}`;
  if (kind === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

/** Two-letter initials from a name, for the monogram block. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "CV";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function ResumePreview({ data, tokens, accentColor, fontFamily, interactive = true, placeholder }: PreviewProps) {
  const accent = accentColor || tokens.accentColor;
  const font = fontById(fontFamily ?? tokens.font);
  const sp = DENSITY_SPACING[tokens.density];
  const isTwoCol = tokens.layout === "two-column";
  const filledSidebar = isTwoCol && tokens.sidebarStyle === "filled";
  const sidebarSide = tokens.sidebarSide ?? "right";
  const sideLabel = !isTwoCol && tokens.sectionLayout === "side-label";
  const pad = tokens.density === "compact" ? 40 : tokens.density === "roomy" ? 56 : 48;
  const bullet = tokens.bullet ?? "disc";
  const onBand = tokens.headerStyle === "band";
  const centered = tokens.headerAlign === "center" && !isTwoCol;

  // --- Placeholder ("ghost") support -------------------------------------
  // When a placeholder document is supplied, empty fields fall back to faded
  // example text matched by item id. Maps are null (and `gv` is a no-op) for
  // thumbnails/exports that pass no placeholder, so their output is unchanged.
  const phExp = placeholder ? new Map(placeholder.experience.map((e) => [e.id, e])) : null;
  const phEdu = placeholder ? new Map(placeholder.education.map((e) => [e.id, e])) : null;
  const phSkill = placeholder ? new Map(placeholder.skills.map((g) => [g.id, g])) : null;
  const phProj = placeholder ? new Map(placeholder.projects.map((p) => [p.id, p])) : null;
  const phCert = placeholder ? new Map(placeholder.certifications.map((c) => [c.id, c])) : null;
  const phLang = placeholder ? new Map(placeholder.languages.map((l) => [l.id, l])) : null;
  const phContact = placeholder?.header.contact;
  const ghost = (text: string): ReactNode => <span style={{ opacity: 0.4 }}>{text}</span>;
  /** Real value if non-empty, else faded placeholder text (when one exists). */
  const gv = (real: string, fallback?: string): ReactNode => (real ? real : fallback ? ghost(fallback) : real);

  const page: CSSProperties = {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    minHeight: PAGE_HEIGHT,
    background: "#ffffff",
    color: INK,
    fontFamily: font.cssVar,
    fontSize: 11,
    lineHeight: sp.line,
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

  // A section. In side-label layouts the title sits in a narrow right-aligned
  // left gutter and content flows to its right; otherwise it stacks on top.
  const sectionNode = (title: string, children: ReactNode, key: string) => {
    if (sideLabel) {
      return (
        <section key={key} style={{ display: "flex", gap: 22, marginBottom: sp.section, breakInside: "avoid" }}>
          <div
            style={{
              flex: "0 0 104px",
              textAlign: "right",
              paddingTop: 1,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: tokens.accent === "none" ? SUBTLE : accent,
            }}
          >
            {title}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        </section>
      );
    }
    return (
      <section key={key} style={{ marginBottom: sp.section, breakInside: "avoid" }}>
        {sectionTitleNode(title)}
        <div>{children}</div>
      </section>
    );
  };

  const markers: Record<string, string> = { disc: "•", dash: "–", square: "▪", none: "" };
  const bulletsNode = (items: string[], phItems?: string[]) => {
    const real = items.filter(Boolean);
    const isGhost = real.length === 0 && !!phItems && phItems.filter(Boolean).length > 0;
    const list = isGhost ? phItems!.filter(Boolean) : real;
    if (!list.length) return null;
    if (bullet === "none")
      return (
        <div style={{ margin: "4px 0 0", ...(isGhost ? { opacity: 0.4 } : null) }}>
          {list.map((b, i) => (
            <p key={i} style={{ margin: "0 0 2px" }}>
              {b}
            </p>
          ))}
        </div>
      );
    return (
      <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none", ...(isGhost ? { opacity: 0.4 } : null) }}>
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

  // --- Built-in section renderers (main column) ---
  const renderers: Record<string, () => ReactNode> = {
    summary: () =>
      data.summary?.trim() || placeholder?.summary
        ? sectionNode("Summary", <p style={{ margin: 0 }}>{gv(data.summary, placeholder?.summary)}</p>, "summary")
        : null,

    experience: () =>
      data.experience.length
        ? sectionNode(
            "Experience",
            data.experience.map((e) => {
              const p = phExp?.get(e.id);
              const companyLine = [e.company, e.location].filter(Boolean).join(" · ");
              const phCompanyLine = p ? [p.company, p.location].filter(Boolean).join(" · ") : "";
              return (
                <div key={e.id} style={{ marginBottom: sp.item }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong>{gv(e.role, p?.role)}</strong>
                    <span style={{ whiteSpace: "nowrap", color: SUBTLE }}>
                      {gv(dateRange(e.startDate, e.endDate, e.current), p && dateRange(p.startDate, p.endDate, p.current))}
                    </span>
                  </div>
                  <div style={{ color: accent, fontWeight: 600 }}>{gv(companyLine, phCompanyLine)}</div>
                  {bulletsNode(e.bullets, p?.bullets)}
                </div>
              );
            }),
            "experience",
          )
        : null,

    education: () =>
      data.education.length
        ? sectionNode(
            "Education",
            data.education.map((e) => {
              const p = phEdu?.get(e.id);
              const degreeLine = [[e.degree, e.field].filter(Boolean).join(", "), e.location].filter(Boolean).join(" · ");
              const phDegreeLine = p ? [[p.degree, p.field].filter(Boolean).join(", "), p.location].filter(Boolean).join(" · ") : "";
              return (
                <div key={e.id} style={{ marginBottom: sp.item }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong>{gv(e.institution, p?.institution)}</strong>
                    <span style={{ whiteSpace: "nowrap", color: SUBTLE }}>
                      {gv(dateRange(e.startDate, e.endDate), p && dateRange(p.startDate, p.endDate))}
                    </span>
                  </div>
                  <div style={{ color: "#374151" }}>{gv(degreeLine, phDegreeLine)}</div>
                  {e.details ? (
                    <div style={{ color: "#4b5563" }}>{e.details}</div>
                  ) : p?.details ? (
                    <div style={{ color: "#4b5563" }}>{ghost(p.details)}</div>
                  ) : null}
                </div>
              );
            }),
            "education",
          )
        : null,

    skills: () =>
      data.skills.length
        ? sectionNode(
            "Skills",
            data.skills.map((g) => {
              const p = phSkill?.get(g.id);
              const items = g.items.filter(Boolean).join(", ");
              const phItems = p ? p.items.filter(Boolean).join(", ") : "";
              return (
                <div key={g.id} style={{ marginBottom: 4 }}>
                  {g.category ? (
                    <strong>{g.category}: </strong>
                  ) : p?.category ? (
                    <strong style={{ opacity: 0.4 }}>{p.category}: </strong>
                  ) : null}
                  <span>{gv(items, phItems)}</span>
                </div>
              );
            }),
            "skills",
          )
        : null,

    projects: () =>
      data.projects.length
        ? sectionNode(
            "Projects",
            data.projects.map((p) => {
              const x = phProj?.get(p.id);
              return (
                <div key={p.id} style={{ marginBottom: sp.item }}>
                  <div>
                    <strong>{gv(p.name, x?.name)}</strong>
                    {p.link ? (
                      <span style={{ marginLeft: 6 }}>{linkNode(p.link, p.link)}</span>
                    ) : x?.link ? (
                      <span style={{ marginLeft: 6, opacity: 0.4, color: accent }}>{x.link}</span>
                    ) : null}
                  </div>
                  {p.description ? (
                    <div style={{ color: "#374151" }}>{p.description}</div>
                  ) : x?.description ? (
                    <div style={{ color: "#374151" }}>{ghost(x.description)}</div>
                  ) : null}
                  {bulletsNode(p.bullets, x?.bullets)}
                </div>
              );
            }),
            "projects",
          )
        : null,

    certifications: () =>
      data.certifications.length
        ? sectionNode(
            "Certifications",
            data.certifications.map((c) => {
              const p = phCert?.get(c.id);
              return (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                  <span>
                    {c.url ? linkNode(c.url, c.name || c.url) : c.name ? <span>{c.name}</span> : p?.name ? ghost(p.name) : null}
                    {c.issuer ? (
                      <span style={{ color: "#374151" }}> — {c.issuer}</span>
                    ) : p?.issuer ? (
                      <span style={{ color: "#374151", opacity: 0.4 }}> — {p.issuer}</span>
                    ) : null}
                  </span>
                  <span style={{ color: SUBTLE, whiteSpace: "nowrap" }}>{gv(c.date, p?.date)}</span>
                </div>
              );
            }),
            "certifications",
          )
        : null,

    languages: () =>
      data.languages.length
        ? sectionNode(
            "Languages",
            data.languages.map((l) => {
              const p = phLang?.get(l.id);
              return (
                <span key={l.id} style={{ marginRight: 12 }}>
                  {gv(l.name, p?.name)}
                  {l.level ? (
                    <span style={{ color: SUBTLE }}> ({l.level})</span>
                  ) : p?.level ? (
                    <span style={{ color: SUBTLE, opacity: 0.4 }}> ({p.level})</span>
                  ) : null}
                </span>
              );
            }),
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

  const nameTitleBlock = (
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
    </>
  );

  const textBlock = (
    <>
      {nameTitleBlock}
      {contactBlock()}
    </>
  );

  // Optional profile photo positioned relative to the name/contact block.
  const photoPos = data.header.photoPosition ?? "left";
  const PHOTO_SIZE = 88;
  const photoEl = data.header.photo ? (
    <Image
      src={data.header.photo}
      alt=""
      width={PHOTO_SIZE}
      height={PHOTO_SIZE}
      // User-provided data URL — skip the optimizer, render directly.
      unoptimized
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

  // A small accent monogram (initials) — only when there's no photo competing
  // for the same slot.
  const monogramEl =
    tokens.monogram && !photoEl ? (
      <div
        style={{
          flex: "0 0 auto",
          width: 46,
          height: 46,
          borderRadius: 8,
          background: accent,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        {initialsOf(data.header.fullName || "")}
      </div>
    ) : null;

  let headerInner: ReactNode;
  if (photoEl) {
    headerInner = (
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
    );
  } else if (monogramEl && !centered) {
    headerInner = (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {monogramEl}
          <div>{nameTitleBlock}</div>
        </div>
        {contactBlock()}
      </>
    );
  } else {
    headerInner = textBlock;
  }

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

  // ---- Filled sidebar: solid accent panel with the header living inside it. ----
  if (filledSidebar) {
    const mainKeys = fullOrder.filter((k) => !SIDEBAR_KEYS.has(k));
    const sideKeys = fullOrder.filter((k) => SIDEBAR_KEYS.has(k));
    const sidePad = Math.round(pad * 0.75);

    const sidePhoto = data.header.photo ? (
      <Image
        src={data.header.photo}
        alt=""
        width={72}
        height={72}
        unoptimized
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(255,255,255,0.7)",
          marginBottom: 12,
        }}
      />
    ) : tokens.monogram ? (
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 21,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {initialsOf(data.header.fullName || "")}
      </div>
    ) : null;

    const sideTitle = (children: ReactNode) => (
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          margin: "0 0 5px",
          textTransform: "uppercase",
          letterSpacing: 1.2,
          color: "#fff",
          borderBottom: "1px solid rgba(255,255,255,0.35)",
          paddingBottom: 3,
        }}
      >
        {children}
      </h2>
    );

    const sidebar = (
      <aside
        style={{
          flex: "0 0 35%",
          background: accent,
          color: "rgba(255,255,255,0.9)",
          padding: sidePad,
          fontSize: 10.5,
          boxSizing: "border-box",
        }}
      >
        {sidePhoto}
        <h1 style={{ fontSize: Math.min(tokens.nameSize, 28), margin: 0, fontWeight: 700, lineHeight: 1.1, color: "#fff" }}>
          {data.header.fullName || "Your Name"}
        </h1>
        {data.header.title && (
          <div style={{ fontSize: 12, marginTop: 4, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            {data.header.title}
          </div>
        )}
        {contactEntries.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {sideTitle("Contact")}
            <div style={{ lineHeight: 1.6, wordBreak: "break-word" }}>
              {contactEntries.map((e, i) => (
                <div key={i} style={{ color: "rgba(255,255,255,0.9)" }}>
                  {e.label}
                </div>
              ))}
            </div>
          </div>
        )}
        {sideKeys.map((k) => {
          if (k === "skills" && data.skills.length)
            return (
              <div key={k} style={{ marginTop: 16 }}>
                {sideTitle("Skills")}
                {data.skills.map((g) => (
                  <div key={g.id} style={{ marginBottom: 6 }}>
                    {g.category && <div style={{ fontWeight: 700, color: "#fff" }}>{g.category}</div>}
                    <div style={{ color: "rgba(255,255,255,0.88)" }}>{g.items.filter(Boolean).join(", ")}</div>
                  </div>
                ))}
              </div>
            );
          if (k === "languages" && data.languages.length)
            return (
              <div key={k} style={{ marginTop: 16 }}>
                {sideTitle("Languages")}
                {data.languages.map((l) => (
                  <div key={l.id} style={{ marginBottom: 2, color: "rgba(255,255,255,0.9)" }}>
                    {l.name}
                    {l.level && <span style={{ color: "rgba(255,255,255,0.65)" }}> · {l.level}</span>}
                  </div>
                ))}
              </div>
            );
          if (k === "certifications" && data.certifications.length)
            return (
              <div key={k} style={{ marginTop: 16 }}>
                {sideTitle("Certifications")}
                {data.certifications.map((c) => (
                  <div key={c.id} style={{ marginBottom: 4 }}>
                    <div style={{ color: "#fff" }}>{c.name || c.url}</div>
                    {(c.issuer || c.date) && (
                      <div style={{ color: "rgba(255,255,255,0.65)" }}>{[c.issuer, c.date].filter(Boolean).join(" · ")}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          return null;
        })}
      </aside>
    );

    const main = (
      <div style={{ flex: 1, minWidth: 0, padding: pad, boxSizing: "border-box" }}>
        {mainKeys.map((k) => renderKey(k))}
      </div>
    );

    return (
      <div style={{ ...page, display: "flex", alignItems: "stretch" }}>
        {sidebarSide === "left" ? (
          <>
            {sidebar}
            {main}
          </>
        ) : (
          <>
            {main}
            {sidebar}
          </>
        )}
      </div>
    );
  }

  // ---- Tinted sidebar: header on top, faint accent wash beside the body. ----
  if (isTwoCol) {
    const mainKeys = fullOrder.filter((k) => !SIDEBAR_KEYS.has(k));
    const sideKeys = fullOrder.filter((k) => SIDEBAR_KEYS.has(k));
    const sidebar = (
      <div
        style={{
          flex: "0 0 33%",
          alignSelf: "stretch",
          ...(tokens.sidebarTint
            ? { background: `color-mix(in srgb, ${accent} 8%, #ffffff)`, borderRadius: 6, padding: 14, marginTop: -2, minHeight: "100%" }
            : null),
        }}
      >
        {sideKeys.map((k) => renderKey(k))}
      </div>
    );
    const main = <div style={{ flex: 1, minWidth: 0 }}>{mainKeys.map((k) => renderKey(k))}</div>;
    return (
      <div style={{ ...page, padding: pad, display: "flex", flexDirection: "column" }}>
        {header}
        <div style={{ display: "flex", gap: 22, flex: 1, alignItems: "stretch", minHeight: 0 }}>
          {sidebarSide === "left" ? (
            <>
              {sidebar}
              {main}
            </>
          ) : (
            <>
              {main}
              {sidebar}
            </>
          )}
        </div>
      </div>
    );
  }

  // ---- Single column (optionally a side-label gutter or two-column body). ----
  const body =
    tokens.bodyColumns === 2 ? (
      <div style={{ columnCount: 2, columnGap: 28 }}>{fullOrder.map((k) => renderKey(k))}</div>
    ) : (
      <>{fullOrder.map((k) => renderKey(k))}</>
    );

  return (
    <div style={{ ...page, padding: pad }}>
      {tokens.topRule && <div style={{ height: 4, background: accent, margin: `${-pad}px ${-pad}px ${pad * 0.6}px` }} />}
      {header}
      {body}
    </div>
  );
}
