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
  flatSkills,
  resolveSectionOrder,
  resolveSectionTitle,
  type Val,
} from "../shared";

const FONT = "var(--font-cv-archivo), Helvetica, Arial, sans-serif";
const fade = (f: boolean): CSSProperties | undefined => (f ? { opacity: 0.5 } : undefined);

/**
 * Esencial — an airy, monochrome minimalist design. Every block sits on a fixed
 * two-column grid: a narrow left "gutter" holds the date range (and section
 * titles), the wide right column holds content. Hairline rules, generous
 * whitespace and a letter-spaced header give it a quiet editorial feel.
 */
export function EsencialPreview({ data, accentColor, interactive = true, placeholder }: PreviewProps) {
  const accent = accentColor || "#334155";
  const head = resolveHeader(data, placeholder);
  const contacts = contactEntriesWithPlaceholder(data, placeholder);

  const A = ({ href, children, style }: { href: string; children: ReactNode; style?: CSSProperties }) =>
    interactive ? (
      <a href={href} style={{ color: "inherit", textDecoration: "none", ...style }}>{children}</a>
    ) : (
      <span style={style}>{children}</span>
    );
  const T = ({ v, style }: { v: Val; style?: CSSProperties }) => <span style={{ ...fade(v.faded), ...style }}>{v.t}</span>;

  // A labeled section laid out as gutter (title) + content, with a top hairline.
  const Block = ({ title, children }: { title: string; children: ReactNode }) => (
    <section style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 26, padding: "20px 0", borderTop: "1px solid #e6e8ec" }}>
      <h2 style={{ margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: accent }}>{title}</h2>
      <div>{children}</div>
    </section>
  );

  const renderKey = (key: string): ReactNode => {
    if (key === "summary") {
      const v = data.summary.trim() ? data.summary : placeholder?.summary;
      if (!v) return null;
      return (
        <Block key="summary" title={resolveSectionTitle(data, "summary")}>
          <p style={{ margin: 0, fontSize: 13, color: "#3a3f4a", textWrap: "pretty", lineHeight: 1.6, ...fade(!data.summary.trim()) }}>{v}</p>
        </Block>
      );
    }
    if (key === "experience") {
      if (!data.experience.length) return null;
      const items = resolveExperience(data, placeholder);
      return (
        <Block key="experience" title={resolveSectionTitle(data, "experience")}>
          {items.map((e, idx) => (
            <div key={e.id} style={{ marginBottom: idx === items.length - 1 ? 0 : 16 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}><T v={e.role} /></p>
              <p style={{ margin: "2px 0 1px", fontSize: 12.5, color: mix(accent, 70, "#10131a") }}>
                <T v={e.company} />{e.location.t ? <> · <T v={e.location} /></> : null}
              </p>
              {e.dates.t ? <p style={{ margin: "0 0 6px", fontSize: 11, letterSpacing: 0.5, color: "#9aa0a8" }}><T v={e.dates} /></p> : null}
              {e.bullets.length ? (
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#3a3f4a", lineHeight: 1.55 }}>
                  {e.bullets.map((b, i) => <li key={i} style={fade(b.faded)}>{b.t}</li>)}
                </ul>
              ) : null}
            </div>
          ))}
        </Block>
      );
    }
    if (key === "projects") {
      if (!data.projects.length) return null;
      const items = resolveProjects(data, placeholder);
      return (
        <Block key="projects" title={resolveSectionTitle(data, "projects")}>
          {items.map((p, idx) => (
            <div key={p.id} style={{ marginBottom: idx === items.length - 1 ? 0 : 12 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}>
                <T v={p.name} />
                {p.link.t ? <> <A href={hrefFor(p.link.t)} style={{ fontSize: 11.5, fontWeight: 600, color: accent, ...fade(p.link.faded) }}>{p.link.t}</A></> : null}
              </p>
              {p.description.t ? <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#3a3f4a", ...fade(p.description.faded) }}>{p.description.t}</p> : null}
              {p.bullets.length ? (
                <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 12.5, color: "#3a3f4a" }}>
                  {p.bullets.map((b, i) => <li key={i} style={fade(b.faded)}>{b.t}</li>)}
                </ul>
              ) : null}
            </div>
          ))}
        </Block>
      );
    }
    if (key === "education") {
      if (!data.education.length) return null;
      const items = resolveEducation(data, placeholder);
      return (
        <Block key="education" title={resolveSectionTitle(data, "education")}>
          {items.map((e, idx) => (
            <div key={e.id} style={{ marginBottom: idx === items.length - 1 ? 0 : 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}><T v={e.degree} />{e.field.t ? <> · <T v={e.field} /></> : null}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11.5, color: "#9aa0a8" }}><T v={e.institution} />{e.dates.t ? <> · <T v={e.dates} /></> : null}</p>
            </div>
          ))}
        </Block>
      );
    }
    if (key === "skills") {
      const skills = flatSkills(data, placeholder);
      if (!skills.length) return null;
      return (
        <Block key="skills" title={resolveSectionTitle(data, "skills")}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#3a3f4a", lineHeight: 1.7 }}>
            {skills.map((sk, i) => (
              <span key={i} style={fade(sk.faded)}>{i > 0 ? <span style={{ color: "#cbd0d6" }}>{"  /  "}</span> : null}{sk.name}</span>
            ))}
          </p>
        </Block>
      );
    }
    if (key === "languages") {
      if (!data.languages.length) return null;
      const items = resolveLanguages(data, placeholder);
      return (
        <Block key="languages" title={resolveSectionTitle(data, "languages")}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#3a3f4a" }}>
            {items.map((l, i) => (
              <span key={l.id} style={fade(l.name.faded)}>{i > 0 ? "   ·   " : ""}{l.name.t}{l.level.t ? ` (${l.level.t})` : ""}</span>
            ))}
          </p>
        </Block>
      );
    }
    if (key === "certifications") {
      if (!data.certifications.length) return null;
      const items = resolveCertifications(data, placeholder);
      return (
        <Block key="certifications" title={resolveSectionTitle(data, "certifications")}>
          {items.map((ct) => (
            <p key={ct.id} style={{ margin: "0 0 5px", fontSize: 12.5 }}>
              {ct.url ? <A href={hrefFor(ct.url)} style={{ fontWeight: 700, color: accent }}>{ct.name.t}</A> : <strong style={fade(ct.name.faded)}>{ct.name.t}</strong>}
              {ct.issuer.t ? <> — <T v={ct.issuer} style={{ color: "#9aa0a8" }} /></> : null}
              {ct.date.t ? <> · <T v={ct.date} style={{ color: "#9aa0a8" }} /></> : null}
            </p>
          ))}
        </Block>
      );
    }
    if (key.startsWith("custom:")) {
      const cs = data.custom.find((s) => `custom:${s.id}` === key);
      if (!cs || (!cs.title.trim() && !cs.items.some((i) => i.text.trim()))) return null;
      return (
        <Block key={key} title={cs.title || "Section"}>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#3a3f4a" }}>
            {cs.items.filter((i) => i.text.trim()).map((i) => <li key={i.id}>{i.text}</li>)}
          </ul>
        </Block>
      );
    }
    return null;
  };

  const order = resolveSectionOrder(data);

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, background: "#ffffff", color: "#1a1d24", fontFamily: FONT, padding: "60px 64px", boxSizing: "border-box", overflow: "hidden", lineHeight: 1.45 }}>
      <header style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 26, marginBottom: 24 }}>
        <div />
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", ...fade(head.name.faded) }}>{head.name.t || "Your Name"}</h1>
          {head.title.t ? <p style={{ margin: "6px 0 0", fontSize: 13.5, letterSpacing: 1, color: "#6b7280", ...fade(head.title.faded) }}>{head.title.t}</p> : null}
          {contacts.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", fontSize: 11.5, marginTop: 12, color: "#6b7280" }}>
              {contacts.map((e) => (
                <span key={e.key} style={fade(e.faded)}>
                  {e.kind === "url" || e.kind === "email" || e.kind === "phone" ? <A href={hrefFor(e.label, e.kind)}>{e.label}</A> : e.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {order.map((k) => renderKey(k))}
    </div>
  );
}
