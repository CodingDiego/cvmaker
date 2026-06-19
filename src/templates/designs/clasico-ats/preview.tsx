import type { CSSProperties, ReactNode } from "react";
import type { PreviewProps } from "../types";
import {
  PAGE_W,
  PAGE_H,
  hrefFor,
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

const FONT = "var(--font-cv-arimo), Helvetica, Arial, sans-serif";
const fade = (f: boolean): CSSProperties | undefined => (f ? { opacity: 0.45 } : undefined);

export function ClasicoAtsPreview({ data, accentColor, interactive = true, placeholder }: PreviewProps) {
  const ink = accentColor || "#1c1c1c";
  const head = resolveHeader(data, placeholder);
  const contacts = contactEntriesWithPlaceholder(data, placeholder);

  const A = ({ href, children, style }: { href: string; children: ReactNode; style?: CSSProperties }) =>
    interactive ? (
      <a href={href} style={{ color: "inherit", textDecoration: "none", ...style }}>
        {children}
      </a>
    ) : (
      <span style={style}>{children}</span>
    );

  const SecTitle = ({ children }: { children: string }) => (
    <h2
      style={{
        margin: "0 0 8px",
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        borderBottom: "1px solid #c9c9c9",
        paddingBottom: 5,
      }}
    >
      {children}
    </h2>
  );

  const T = ({ v, style }: { v: Val; style?: CSSProperties }) => (
    <span style={{ ...fade(v.faded), ...style }}>{v.t}</span>
  );

  const renderKey = (key: string): ReactNode => {
    if (key === "summary") {
      const v = data.summary.trim() ? data.summary : placeholder?.summary;
      if (!v) return null;
      return (
        <section key="summary" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "summary")}</SecTitle>
          <p style={{ margin: 0, fontSize: 13, color: "#333", textWrap: "pretty", ...fade(!data.summary.trim()) }}>{v}</p>
        </section>
      );
    }
    if (key === "experience") {
      if (!data.experience.length) return null;
      const items = resolveExperience(data, placeholder, "Presente");
      return (
        <section key="experience" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "experience")}</SecTitle>
          {items.map((e) => (
            <div key={e.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}><T v={e.role} /></span>
                <span style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap" }}><T v={e.dates} /></span>
              </div>
              <p style={{ margin: "1px 0 6px", fontSize: 12.5, fontWeight: 500, color: "#555" }}>
                <T v={e.company} />
                {e.location.t ? <> · <T v={e.location} /></> : null}
              </p>
              {e.bullets.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#333" }}>
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
    if (key === "education") {
      if (!data.education.length) return null;
      const items = resolveEducation(data, placeholder);
      return (
        <section key="education" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "education")}</SecTitle>
          {items.map((e) => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                <T v={e.degree} />
                {e.field.t ? <> · <T v={e.field} /></> : null}
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 12, color: "#666" }}>
                <T v={e.institution} />
                {e.dates.t ? <> · <T v={e.dates} /></> : null}
              </p>
            </div>
          ))}
        </section>
      );
    }
    if (key === "skills") {
      const groups = skillGroups(data, placeholder);
      if (!groups.length) return null;
      return (
        <section key="skills" style={{ marginBottom: 22 }}>
          <SecTitle>{resolveSectionTitle(data, "skills")}</SecTitle>
          {groups.map((g) => (
            <p key={g.id} style={{ margin: "0 0 4px", fontSize: 12.5, color: "#333", ...fade(g.faded) }}>
              {g.category ? <strong>{g.category}: </strong> : null}
              {g.items.map((it) => it.name).join(", ")}
            </p>
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
            <div key={p.id} style={{ marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                <T v={p.name} />
                {p.link.t ? (
                  <>
                    {" "}
                    <A href={hrefFor(p.link.t)} style={{ fontWeight: 500, fontSize: 12, color: "#555", ...fade(p.link.faded) }}>
                      {p.link.t}
                    </A>
                  </>
                ) : null}
              </p>
              {p.description.t ? <p style={{ margin: "1px 0 0", fontSize: 12.5, color: "#333", ...fade(p.description.faded) }}>{p.description.t}</p> : null}
              {p.bullets.length ? (
                <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 12.5, color: "#333" }}>
                  {p.bullets.map((b, i) => (
                    <li key={i} style={fade(b.faded)}>{b.t}</li>
                  ))}
                </ul>
              ) : null}
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
            <p key={ct.id} style={{ margin: "0 0 4px", fontSize: 12.5, color: "#333" }}>
              {ct.url ? (
                <A href={hrefFor(ct.url)} style={{ fontWeight: 700 }}>{ct.name.t}</A>
              ) : (
                <strong style={fade(ct.name.faded)}>{ct.name.t}</strong>
              )}
              {ct.issuer.t ? <> — <T v={ct.issuer} style={{ color: "#666" }} /></> : null}
              {ct.date.t ? <> · <T v={ct.date} style={{ color: "#666" }} /></> : null}
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
          <p style={{ margin: 0, fontSize: 12.5, color: "#333" }}>
            {items.map((l, i) => (
              <span key={l.id} style={fade(l.name.faded)}>
                {i > 0 ? " · " : ""}
                {l.name.t}
                {l.level.t ? ` (${l.level.t})` : ""}
              </span>
            ))}
          </p>
        </section>
      );
    }
    if (key.startsWith("custom:")) {
      const cs = data.custom.find((s) => `custom:${s.id}` === key);
      if (!cs || (!cs.title.trim() && !cs.items.some((i) => i.text.trim()))) return null;
      return (
        <section key={key} style={{ marginBottom: 22 }}>
          <SecTitle>{cs.title || "Sección"}</SecTitle>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#333" }}>
            {cs.items.filter((i) => i.text.trim()).map((i) => (
              <li key={i.id}>{i.text}</li>
            ))}
          </ul>
        </section>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        width: PAGE_W,
        height: PAGE_H,
        background: "#ffffff",
        color: "#1c1c1c",
        fontFamily: FONT,
        padding: "60px 64px",
        boxSizing: "border-box",
        overflow: "hidden",
        lineHeight: 1.45,
      }}
    >
      <header style={{ borderBottom: `2px solid ${ink}`, paddingBottom: 18, marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: 0.5, ...fade(head.name.faded) }}>{head.name.t || "Tu Nombre"}</h1>
        {head.title.t ? (
          <p style={{ margin: "6px 0 12px", fontSize: 15, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", color: "#444", ...fade(head.title.faded) }}>
            {head.title.t}
          </p>
        ) : null}
        {contacts.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", fontSize: 12.5, color: "#333" }}>
            {contacts.map((e, i) => (
              <span key={e.key} style={{ display: "flex", gap: "6px 18px", ...fade(e.faded) }}>
                {i > 0 ? <span aria-hidden>·</span> : null}
                {e.kind === "url" || e.kind === "email" || e.kind === "phone" ? (
                  <A href={hrefFor(e.label, e.kind)}>{e.label}</A>
                ) : (
                  <span>{e.label}</span>
                )}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {resolveSectionOrder(data).map((k) => renderKey(k))}
    </div>
  );
}
