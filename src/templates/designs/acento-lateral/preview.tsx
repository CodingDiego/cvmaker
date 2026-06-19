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
const STRIPE = 232;

/**
 * Acento Lateral — a full-height colored stripe down the left edge carries the
 * name, title and contacts in light text; the white body holds the content with
 * "tabbed" section titles (a small filled accent tab to the left of each). The
 * stripe is a single solid column, so it reads cleanly and stays distinctive
 * without the busyness of a two-column resume.
 */
export function AcentoLateralPreview({ data, accentColor, interactive = true, placeholder }: PreviewProps) {
  const accent = accentColor || "#0d9488";
  const dark = mix(accent, 88, "#04201d");
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
    <h2 style={{ margin: "0 0 11px", fontSize: 12.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: dark, display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ width: 18, height: 4, background: accent, borderRadius: 2, display: "inline-block" }} />
      {children}
    </h2>
  );

  const renderKey = (key: string): ReactNode => {
    if (key === "summary") {
      const v = data.summary.trim() ? data.summary : placeholder?.summary;
      if (!v) return null;
      return (
        <section key="summary" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "summary")}</SecTitle>
          <p style={{ margin: 0, fontSize: 13, color: "#3a3f4a", textWrap: "pretty", lineHeight: 1.55, ...fade(!data.summary.trim()) }}>{v}</p>
        </section>
      );
    }
    if (key === "experience") {
      if (!data.experience.length) return null;
      const items = resolveExperience(data, placeholder);
      return (
        <section key="experience" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "experience")}</SecTitle>
          {items.map((e) => (
            <div key={e.id} style={{ marginBottom: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}><T v={e.role} /></span>
                <span style={{ fontSize: 11.5, color: "#9aa0a8", whiteSpace: "nowrap" }}><T v={e.dates} /></span>
              </div>
              <p style={{ margin: "1px 0 5px", fontSize: 12.5, fontWeight: 600, color: accent }}>
                <T v={e.company} />{e.location.t ? <> · <T v={e.location} /></> : null}
              </p>
              {e.bullets.length ? (
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#3a3f4a", lineHeight: 1.5 }}>
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
            <div key={p.id} style={{ marginBottom: 11 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}>
                <T v={p.name} />
                {p.link.t ? <> <A href={hrefFor(p.link.t)} style={{ fontSize: 11.5, fontWeight: 600, color: accent, ...fade(p.link.faded) }}>{p.link.t}</A></> : null}
              </p>
              {p.description.t ? <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#3a3f4a", ...fade(p.description.faded) }}>{p.description.t}</p> : null}
              {p.bullets.length ? (
                <ul style={{ margin: "3px 0 0", paddingLeft: 16, fontSize: 12.5, color: "#3a3f4a" }}>
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
        <section key="education" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "education")}</SecTitle>
          {items.map((e) => (
            <div key={e.id} style={{ marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}><T v={e.degree} />{e.field.t ? <> · <T v={e.field} /></> : null}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11.5, color: "#9aa0a8" }}><T v={e.institution} />{e.dates.t ? <> · <T v={e.dates} /></> : null}</p>
            </div>
          ))}
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
              <span key={i} style={{ fontSize: 11.5, background: mix(accent, 12), color: mix(accent, 78, "#04201d"), padding: "4px 11px", borderRadius: 4, fontWeight: 600, ...fade(sk.faded) }}>{sk.name}</span>
            ))}
          </div>
        </section>
      );
    }
    if (key === "languages") {
      if (!data.languages.length) return null;
      const items = resolveLanguages(data, placeholder);
      return (
        <section key="languages" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "languages")}</SecTitle>
          <p style={{ margin: 0, fontSize: 12.5, color: "#3a3f4a" }}>
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
        <section key="certifications" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "certifications")}</SecTitle>
          {items.map((ct) => (
            <p key={ct.id} style={{ margin: "0 0 5px", fontSize: 12.5 }}>
              {ct.url ? <A href={hrefFor(ct.url)} style={{ fontWeight: 700, color: accent }}>{ct.name.t}</A> : <strong style={fade(ct.name.faded)}>{ct.name.t}</strong>}
              {ct.issuer.t ? <> — <T v={ct.issuer} style={{ color: "#9aa0a8" }} /></> : null}
              {ct.date.t ? <> · <T v={ct.date} style={{ color: "#9aa0a8" }} /></> : null}
            </p>
          ))}
        </section>
      );
    }
    if (key.startsWith("custom:")) {
      const cs = data.custom.find((s) => `custom:${s.id}` === key);
      if (!cs || (!cs.title.trim() && !cs.items.some((i) => i.text.trim()))) return null;
      return (
        <section key={key} style={{ marginBottom: 22 }}>
          <SecTitle>{cs.title || "Section"}</SecTitle>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#3a3f4a" }}>
            {cs.items.filter((i) => i.text.trim()).map((i) => <li key={i.id}>{i.text}</li>)}
          </ul>
        </section>
      );
    }
    return null;
  };

  const order = resolveSectionOrder(data);

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, background: "#ffffff", color: "#1a1d24", fontFamily: FONT, display: "flex", boxSizing: "border-box", overflow: "hidden", lineHeight: 1.45 }}>
      <aside style={{ width: STRIPE, flexShrink: 0, background: dark, color: "#fff", padding: "52px 30px" }}>
        <h1 style={{ margin: 0, fontSize: 27, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.2, ...fade(head.name.faded) }}>{head.name.t || "Your Name"}</h1>
        {head.title.t ? <p style={{ margin: "10px 0 0", fontSize: 13, fontWeight: 500, color: mix(accent, 35, "#ffffff"), ...fade(head.title.faded) }}>{head.title.t}</p> : null}
        {contacts.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5, marginTop: 26, color: "rgba(255,255,255,0.82)", wordBreak: "break-word" }}>
            {contacts.map((e) => (
              <span key={e.key} style={fade(e.faded)}>
                {e.kind === "url" || e.kind === "email" || e.kind === "phone" ? <A href={hrefFor(e.label, e.kind)}>{e.label}</A> : e.label}
              </span>
            ))}
          </div>
        ) : null}
      </aside>

      <div style={{ flex: 1, padding: "52px 46px", minWidth: 0 }}>
        {order.map((k) => renderKey(k))}
      </div>
    </div>
  );
}
