/* eslint-disable react-hooks/static-components -- pure, stateless presentational
   sub-renderers for a static A4 page; they hold no state to reset. */
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

export function ModernoAcentoPreview({ data, accentColor, interactive = true, placeholder }: PreviewProps) {
  const accent = accentColor || "#2f68d8";
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
    <h2
      style={{
        margin: "0 0 14px",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: accent,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {children}
      <span style={{ flex: 1, height: 2, background: mix(accent, 22) }} />
    </h2>
  );

  const renderKey = (key: string): ReactNode => {
    if (key === "summary") {
      const v = data.summary.trim() ? data.summary : placeholder?.summary;
      if (!v) return null;
      return (
        <p key="summary" style={{ margin: "0 0 26px", fontSize: 13.5, color: "#3a3f4a", textWrap: "pretty", ...fade(!data.summary.trim()) }}>{v}</p>
      );
    }
    if (key === "experience") {
      if (!data.experience.length) return null;
      const items = resolveExperience(data, placeholder);
      return (
        <section key="experience" style={{ marginBottom: 26 }}>
          <SecTitle>{resolveSectionTitle(data, "experience")}</SecTitle>
          {items.map((e) => (
            <div key={e.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}><T v={e.role} /></span>
                <span style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap" }}><T v={e.dates} /></span>
              </div>
              <p style={{ margin: "2px 0 7px", fontSize: 13, fontWeight: 600, color: accent }}>
                <T v={e.company} />
                {e.location.t ? <> · <T v={e.location} /></> : null}
              </p>
              {e.bullets.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#3a3f4a" }}>
                  {e.bullets.map((b, i) => (
                    <li key={i} style={fade(b.faded)}>{b.t}</li>
                  ))}
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
        <section key="projects" style={{ marginBottom: 26 }}>
          <SecTitle>{resolveSectionTitle(data, "projects")}</SecTitle>
          {items.map((p) => (
            <div key={p.id} style={{ marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                <T v={p.name} />
                {p.link.t ? <> <A href={hrefFor(p.link.t)} style={{ fontSize: 12, fontWeight: 600, color: accent, ...fade(p.link.faded) }}>{p.link.t}</A></> : null}
              </p>
              {p.description.t ? <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#3a3f4a", ...fade(p.description.faded) }}>{p.description.t}</p> : null}
              {p.bullets.length ? (
                <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 12.5, color: "#3a3f4a" }}>
                  {p.bullets.map((b, i) => <li key={i} style={fade(b.faded)}>{b.t}</li>)}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      );
    }
    if (key === "education" || key === "skills") return null; // rendered together in the grid below
    if (key === "certifications") {
      if (!data.certifications.length) return null;
      const items = resolveCertifications(data, placeholder);
      return (
        <section key="certifications" style={{ marginBottom: 26 }}>
          <SecTitle>{resolveSectionTitle(data, "certifications")}</SecTitle>
          {items.map((ct) => (
            <p key={ct.id} style={{ margin: "0 0 5px", fontSize: 12.5 }}>
              {ct.url ? <A href={hrefFor(ct.url)} style={{ fontWeight: 700, color: accent }}>{ct.name.t}</A> : <strong style={fade(ct.name.faded)}>{ct.name.t}</strong>}
              {ct.issuer.t ? <> — <T v={ct.issuer} style={{ color: "#888" }} /></> : null}
              {ct.date.t ? <> · <T v={ct.date} style={{ color: "#888" }} /></> : null}
            </p>
          ))}
        </section>
      );
    }
    if (key === "languages") {
      if (!data.languages.length) return null;
      const items = resolveLanguages(data, placeholder);
      return (
        <section key="languages" style={{ marginBottom: 26 }}>
          <SecTitle>{resolveSectionTitle(data, "languages")}</SecTitle>
          <p style={{ margin: 0, fontSize: 12.5, color: "#3a3f4a" }}>
            {items.map((l, i) => (
              <span key={l.id} style={fade(l.name.faded)}>{i > 0 ? " · " : ""}{l.name.t}{l.level.t ? ` (${l.level.t})` : ""}</span>
            ))}
          </p>
        </section>
      );
    }
    if (key.startsWith("custom:")) {
      const cs = data.custom.find((s) => `custom:${s.id}` === key);
      if (!cs || (!cs.title.trim() && !cs.items.some((i) => i.text.trim()))) return null;
      return (
        <section key={key} style={{ marginBottom: 26 }}>
          <SecTitle>{cs.title || "Section"}</SecTitle>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#3a3f4a" }}>
            {cs.items.filter((i) => i.text.trim()).map((i) => <li key={i.id}>{i.text}</li>)}
          </ul>
        </section>
      );
    }
    return null;
  };

  const order = resolveSectionOrder(data);
  const education = resolveEducation(data, placeholder);
  const skills = flatSkills(data, placeholder);
  const showGrid = data.education.length > 0 || skills.length > 0;

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, background: "#ffffff", color: "#1a1d24", fontFamily: FONT, boxSizing: "border-box", overflow: "hidden", lineHeight: 1.45 }}>
      <header style={{ background: accent, color: "#fff", padding: "44px 56px 34px" }}>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, letterSpacing: -0.5, ...fade(head.name.faded) }}>{head.name.t || "Your Name"}</h1>
        {head.title.t ? <p style={{ margin: "8px 0 0", fontSize: 16, fontWeight: 500, letterSpacing: 0.5, color: "rgba(255,255,255,0.85)", ...fade(head.title.faded) }}>{head.title.t}</p> : null}
        {contacts.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", fontSize: 12.5, marginTop: 18, color: "rgba(255,255,255,0.82)" }}>
            {contacts.map((e) => (
              <span key={e.key} style={fade(e.faded)}>
                {e.kind === "url" || e.kind === "email" || e.kind === "phone" ? <A href={hrefFor(e.label, e.kind)}>{e.label}</A> : e.label}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div style={{ padding: "30px 56px 0" }}>
        {order.map((k) => renderKey(k))}

        {showGrid ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
            {data.education.length ? (
              <section>
                <SecTitle>{resolveSectionTitle(data, "education")}</SecTitle>
                {education.map((e) => (
                  <div key={e.id} style={{ marginBottom: 8 }}>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}><T v={e.degree} />{e.field.t ? <> · <T v={e.field} /></> : null}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}><T v={e.institution} />{e.dates.t ? <> · <T v={e.dates} /></> : null}</p>
                  </div>
                ))}
              </section>
            ) : <div />}
            {skills.length ? (
              <section>
                <SecTitle>{resolveSectionTitle(data, "skills")}</SecTitle>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {skills.map((sk, i) => (
                    <span key={i} style={{ fontSize: 11.5, background: mix(accent, 12), color: mix(accent, 72, "#10131a"), padding: "4px 11px", borderRadius: 20, fontWeight: 600, ...fade(sk.faded) }}>{sk.name}</span>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
