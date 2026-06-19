import type { CSSProperties, ReactNode } from "react";
import type { PreviewProps } from "../types";
import {
  PAGE_W,
  PAGE_H,
  hrefFor,
  mix,
  contactEntriesWithPlaceholder,
  resolveHeader,
  resolveExperience,
  resolveEducation,
  resolveProjects,
  resolveCertifications,
  resolveLanguages,
  skillGroups,
  resolveSectionOrder,
  resolveSectionTitle,
  type Val,
} from "../shared";

const FONT = "var(--font-cv-archivo), Helvetica, Arial, sans-serif";
const fade = (f: boolean): CSSProperties | undefined => (f ? { opacity: 0.5 } : undefined);

/**
 * Compacto — a dense, no-nonsense single column for people with a lot to say.
 * Name and title sit on the left of a split header with contacts stacked on the
 * right; every section title carries a small filled accent square; spacing is
 * deliberately tight so a long career still fits one page. Skills render as
 * grouped category lines to save vertical space.
 */
export function CompactoPreview({ data, accentColor, interactive = true, placeholder }: PreviewProps) {
  const accent = accentColor || "#b45309";
  const head = resolveHeader(data, placeholder);
  const contacts = contactEntriesWithPlaceholder(data, placeholder);

  const A = ({ href, children, style }: { href: string; children: ReactNode; style?: CSSProperties }) =>
    interactive ? (
      <a href={href} style={{ color: "inherit", textDecoration: "none", ...style }}>{children}</a>
    ) : (
      <span style={style}>{children}</span>
    );
  const T = ({ v, style }: { v: Val; style?: CSSProperties }) => <span style={{ ...fade(v.faded), ...style }}>{v.t}</span>;

  const SecTitle = ({ children }: { children: string }) => (
    <h2 style={{ margin: "0 0 7px", fontSize: 12, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: "#1a1d24", display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 9, height: 9, background: accent, display: "inline-block" }} />
      {children}
    </h2>
  );

  const renderKey = (key: string): ReactNode => {
    if (key === "summary") {
      const v = data.summary.trim() ? data.summary : placeholder?.summary;
      if (!v) return null;
      return (
        <section key="summary" style={{ marginBottom: 13 }}>
          <SecTitle>{resolveSectionTitle(data, "summary")}</SecTitle>
          <p style={{ margin: 0, fontSize: 12, color: "#3a3f4a", textWrap: "pretty", lineHeight: 1.45, ...fade(!data.summary.trim()) }}>{v}</p>
        </section>
      );
    }
    if (key === "experience") {
      if (!data.experience.length) return null;
      const items = resolveExperience(data, placeholder);
      return (
        <section key="experience" style={{ marginBottom: 13 }}>
          <SecTitle>{resolveSectionTitle(data, "experience")}</SecTitle>
          {items.map((e) => (
            <div key={e.id} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}><T v={e.role} /> <span style={{ fontWeight: 600, color: mix(accent, 75, "#10131a") }}>· <T v={e.company} /></span></span>
                <span style={{ fontSize: 11, color: "#888", whiteSpace: "nowrap" }}><T v={e.dates} /></span>
              </div>
              {e.location.t ? <p style={{ margin: "1px 0 0", fontSize: 11, color: "#9aa0a8" }}><T v={e.location} /></p> : null}
              {e.bullets.length ? (
                <ul style={{ margin: "3px 0 0", paddingLeft: 15, fontSize: 12, color: "#3a3f4a", lineHeight: 1.4 }}>
                  {e.bullets.map((b, i) => <li key={i} style={fade(b.faded)}>{b.t}</li>)}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      );
    }
    if (key === "projects") {
      if (!data.projects.length) return null;
      const items = resolveProjects(data, placeholder);
      return (
        <section key="projects" style={{ marginBottom: 13 }}>
          <SecTitle>{resolveSectionTitle(data, "projects")}</SecTitle>
          {items.map((p) => (
            <div key={p.id} style={{ marginBottom: 7 }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700 }}>
                <T v={p.name} />
                {p.link.t ? <> <A href={hrefFor(p.link.t)} style={{ fontSize: 11, fontWeight: 600, color: accent, ...fade(p.link.faded) }}>{p.link.t}</A></> : null}
              </p>
              {p.description.t ? <p style={{ margin: "1px 0 0", fontSize: 12, color: "#3a3f4a", ...fade(p.description.faded) }}>{p.description.t}</p> : null}
              {p.bullets.length ? (
                <ul style={{ margin: "2px 0 0", paddingLeft: 15, fontSize: 12, color: "#3a3f4a" }}>
                  {p.bullets.map((b, i) => <li key={i} style={fade(b.faded)}>{b.t}</li>)}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      );
    }
    if (key === "education") {
      if (!data.education.length) return null;
      const items = resolveEducation(data, placeholder);
      return (
        <section key="education" style={{ marginBottom: 13 }}>
          <SecTitle>{resolveSectionTitle(data, "education")}</SecTitle>
          {items.map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}><strong><T v={e.degree} /></strong>{e.field.t ? <> · <T v={e.field} /></> : null} — <T v={e.institution} style={{ color: "#6b7280" }} /></span>
              <span style={{ fontSize: 11, color: "#888", whiteSpace: "nowrap" }}><T v={e.dates} /></span>
            </div>
          ))}
        </section>
      );
    }
    if (key === "skills") {
      const groups = skillGroups(data, placeholder);
      if (!groups.length) return null;
      return (
        <section key="skills" style={{ marginBottom: 13 }}>
          <SecTitle>{resolveSectionTitle(data, "skills")}</SecTitle>
          {groups.map((g) => (
            <p key={g.id} style={{ margin: "0 0 3px", fontSize: 12, color: "#3a3f4a", ...fade(g.faded) }}>
              {g.category ? <strong style={{ color: mix(accent, 75, "#10131a") }}>{g.category}: </strong> : null}
              {g.items.map((it) => it.name).join(", ")}
            </p>
          ))}
        </section>
      );
    }
    if (key === "languages") {
      if (!data.languages.length) return null;
      const items = resolveLanguages(data, placeholder);
      return (
        <section key="languages" style={{ marginBottom: 13 }}>
          <SecTitle>{resolveSectionTitle(data, "languages")}</SecTitle>
          <p style={{ margin: 0, fontSize: 12, color: "#3a3f4a" }}>
            {items.map((l, i) => (
              <span key={l.id} style={fade(l.name.faded)}>{i > 0 ? "   ·   " : ""}{l.name.t}{l.level.t ? ` (${l.level.t})` : ""}</span>
            ))}
          </p>
        </section>
      );
    }
    if (key === "certifications") {
      if (!data.certifications.length) return null;
      const items = resolveCertifications(data, placeholder);
      return (
        <section key="certifications" style={{ marginBottom: 13 }}>
          <SecTitle>{resolveSectionTitle(data, "certifications")}</SecTitle>
          {items.map((ct) => (
            <p key={ct.id} style={{ margin: "0 0 3px", fontSize: 12 }}>
              {ct.url ? <A href={hrefFor(ct.url)} style={{ fontWeight: 700, color: accent }}>{ct.name.t}</A> : <strong style={fade(ct.name.faded)}>{ct.name.t}</strong>}
              {ct.issuer.t ? <> — <T v={ct.issuer} style={{ color: "#888" }} /></> : null}
              {ct.date.t ? <> · <T v={ct.date} style={{ color: "#888" }} /></> : null}
            </p>
          ))}
        </section>
      );
    }
    if (key.startsWith("custom:")) {
      const cs = data.custom.find((s) => `custom:${s.id}` === key);
      if (!cs || (!cs.title.trim() && !cs.items.some((i) => i.text.trim()))) return null;
      return (
        <section key={key} style={{ marginBottom: 13 }}>
          <SecTitle>{cs.title || "Section"}</SecTitle>
          <ul style={{ margin: 0, paddingLeft: 15, fontSize: 12, color: "#3a3f4a" }}>
            {cs.items.filter((i) => i.text.trim()).map((i) => <li key={i.id}>{i.text}</li>)}
          </ul>
        </section>
      );
    }
    return null;
  };

  const order = resolveSectionOrder(data);

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, background: "#ffffff", color: "#1a1d24", fontFamily: FONT, padding: "46px 52px", boxSizing: "border-box", overflow: "hidden", lineHeight: 1.4 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, paddingBottom: 12, marginBottom: 16, borderBottom: `2.5px solid ${accent}` }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.3, ...fade(head.name.faded) }}>{head.name.t || "Your Name"}</h1>
          {head.title.t ? <p style={{ margin: "3px 0 0", fontSize: 13.5, fontWeight: 600, color: mix(accent, 80, "#10131a"), ...fade(head.title.faded) }}>{head.title.t}</p> : null}
        </div>
        {contacts.length ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, fontSize: 11, color: "#6b7280", textAlign: "right" }}>
            {contacts.map((e) => (
              <span key={e.key} style={fade(e.faded)}>
                {e.kind === "url" || e.kind === "email" || e.kind === "phone" ? <A href={hrefFor(e.label, e.kind)}>{e.label}</A> : e.label}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {order.map((k) => renderKey(k))}
    </div>
  );
}
