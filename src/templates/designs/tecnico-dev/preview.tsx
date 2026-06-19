/* eslint-disable react-hooks/static-components -- pure, stateless presentational
   sub-renderers for a static A4 page; they hold no state to reset. */
import type { CSSProperties, ReactNode } from "react";
import type { PreviewProps } from "../types";
import {
  PAGE_W,
  PAGE_H,
  hrefFor,
  mix,
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

const SANS = "var(--font-cv-plex-sans), Helvetica, Arial, sans-serif";
const MONO = "var(--font-cv-plex-mono), ui-monospace, monospace";
const fade = (f: boolean): CSSProperties | undefined => (f ? { opacity: 0.5 } : undefined);

export function TecnicoDevPreview({ data, accentColor, interactive = true, placeholder }: PreviewProps) {
  const green = accentColor || "#16a34a";
  const heading = mix(green, 82, "#0e2e1c");
  const head = resolveHeader(data, placeholder);
  const c = data.header.contact;
  const cph = placeholder?.header.contact;

  const A = ({ href, children, style }: { href: string; children: ReactNode; style?: CSSProperties }) =>
    interactive ? <a href={href} style={{ color: "inherit", textDecoration: "none", ...style }}>{children}</a> : <span style={style}>{children}</span>;

  const T = ({ v, style }: { v: Val; style?: CSSProperties }) => <span style={{ ...fade(v.faded), ...style }}>{v.t}</span>;

  const SecTitle = ({ children }: { children: string }) => (
    <h2 style={{ margin: "0 0 10px", fontFamily: MONO, fontSize: 12.5, fontWeight: 600, color: heading }}>## {children.toLowerCase()}</h2>
  );

  const renderKey = (key: string): ReactNode => {
    if (key === "summary") {
      const v = data.summary.trim() ? data.summary : placeholder?.summary;
      if (!v) return null;
      return (
        <section key="summary" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "summary")}</SecTitle>
          <p style={{ margin: 0, fontSize: 12.5, color: "#3a4047", textWrap: "pretty", ...fade(!data.summary.trim()) }}>{v}</p>
        </section>
      );
    }
    if (key === "skills") {
      const skills = flatSkills(data, placeholder);
      if (!skills.length) return null;
      return (
        <section key="skills" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "skills")}</SecTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {skills.map((sk, i) => (
              <span key={i} style={{ fontFamily: MONO, fontSize: 11, background: mix(green, 10), color: mix(green, 72, "#0e2e1c"), padding: "4px 9px", borderRadius: 4, ...fade(sk.faded) }}>{sk.name}</span>
            ))}
          </div>
        </section>
      );
    }
    if (key === "experience") {
      if (!data.experience.length) return null;
      const items = resolveExperience(data, placeholder, "now");
      return (
        <section key="experience" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "experience")}</SecTitle>
          {items.map((e) => (
            <div key={e.id} style={{ marginBottom: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}><T v={e.role} /></span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#8a9099", whiteSpace: "nowrap" }}><T v={e.dates} /></span>
              </div>
              <p style={{ margin: "2px 0 6px", fontSize: 12, fontWeight: 600, color: mix(green, 78, "#0e2e1c") }}>
                <T v={e.company} />
                {e.location.t ? <> · <T v={e.location} /></> : null}
              </p>
              {e.bullets.length ? (
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#3a4047" }}>
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
        <section key="projects" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "projects")}</SecTitle>
          {items.map((p) => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600 }}>
                <T v={p.name} />
                {p.link.t ? <> <A href={hrefFor(p.link.t)} style={{ fontFamily: MONO, fontSize: 11, color: mix(green, 72, "#0e2e1c"), ...fade(p.link.faded) }}>{p.link.t}</A></> : null}
              </p>
              {p.description.t ? <p style={{ margin: "1px 0 0", fontSize: 11.5, color: "#5a6169", ...fade(p.description.faded) }}>{p.description.t}</p> : null}
            </div>
          ))}
        </section>
      );
    }
    if (key === "education") {
      if (!data.education.length) return null;
      const items = resolveEducation(data, placeholder);
      return (
        <section key="education" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "education")}</SecTitle>
          {items.map((e) => (
            <div key={e.id} style={{ marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600 }}><T v={e.degree} />{e.field.t ? <> · <T v={e.field} /></> : null}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11.5, color: "#5a6169" }}><T v={e.institution} />{e.dates.t ? <> · <T v={e.dates} /></> : null}</p>
            </div>
          ))}
        </section>
      );
    }
    if (key === "certifications") {
      if (!data.certifications.length) return null;
      const items = resolveCertifications(data, placeholder);
      return (
        <section key="certifications" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "certifications")}</SecTitle>
          {items.map((ct) => (
            <p key={ct.id} style={{ margin: "0 0 4px", fontSize: 12 }}>
              {ct.url ? <A href={hrefFor(ct.url)} style={{ fontWeight: 600, color: mix(green, 72, "#0e2e1c") }}>{ct.name.t}</A> : <strong style={fade(ct.name.faded)}>{ct.name.t}</strong>}
              {ct.issuer.t ? <> — <T v={ct.issuer} style={{ color: "#8a9099" }} /></> : null}
            </p>
          ))}
        </section>
      );
    }
    if (key === "languages") {
      if (!data.languages.length) return null;
      const items = resolveLanguages(data, placeholder);
      return (
        <section key="languages" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "languages")}</SecTitle>
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 11.5, color: "#3a4047" }}>
            {items.map((l, i) => <span key={l.id} style={fade(l.name.faded)}>{i > 0 ? " · " : ""}{l.name.t}{l.level.t ? `(${l.level.t})` : ""}</span>)}
          </p>
        </section>
      );
    }
    if (key.startsWith("custom:")) {
      const cs = data.custom.find((s) => `custom:${s.id}` === key);
      if (!cs || (!cs.title.trim() && !cs.items.some((i) => i.text.trim()))) return null;
      return (
        <section key={key} style={{ marginBottom: 22 }}>
          <SecTitle>{cs.title || "section"}</SecTitle>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#3a4047" }}>
            {cs.items.filter((i) => i.text.trim()).map((i) => <li key={i.id}>{i.text}</li>)}
          </ul>
        </section>
      );
    }
    return null;
  };

  const ContactPair = ({ label, value, kind }: { label: string; value: string; kind?: "url" | "email" | "phone" }) => (
    <>
      <span style={{ color: mix(green, 70, "#0e2e1c") }}>{label}</span>
      {kind ? <A href={hrefFor(value, kind)}>{value}</A> : <span>{value}</span>}
    </>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, background: "#ffffff", color: "#1b1f23", fontFamily: SANS, padding: "48px 56px", boxSizing: "border-box", overflow: "hidden", lineHeight: 1.45 }}>
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: MONO, color: green, fontSize: 20 }}>~/</span>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: -0.5, ...fade(head.name.faded) }}>{head.name.t || "Your Name"}</h1>
        </div>
        {head.title.t ? <p style={{ margin: "6px 0 12px", fontFamily: MONO, fontSize: 14, color: "#5a6169", ...fade(head.title.faded) }}>&gt; {head.title.t}</p> : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontFamily: MONO, fontSize: 11.5, color: "#5a6169" }}>
          {(c.email || cph?.email) ? <span style={{ display: "inline-flex", gap: 6, ...fade(!c.email) }}><ContactPair label="email:" value={c.email || cph?.email || ""} kind="email" /></span> : null}
          {(c.location || cph?.location) ? <span style={{ display: "inline-flex", gap: 6, ...fade(!c.location) }}><ContactPair label="loc:" value={c.location || cph?.location || ""} /></span> : null}
          {(c.github || cph?.github) ? <span style={{ display: "inline-flex", gap: 6, ...fade(!c.github) }}><ContactPair label="git:" value={c.github || cph?.github || ""} kind="url" /></span> : null}
          {(c.website || cph?.website) ? <span style={{ display: "inline-flex", gap: 6, ...fade(!c.website) }}><ContactPair label="web:" value={c.website || cph?.website || ""} kind="url" /></span> : null}
        </div>
      </header>

      {resolveSectionOrder(data).map((k) => renderKey(k))}
    </div>
  );
}
