import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/cv/types";
import { getTemplate } from "@/templates/registry";

/**
 * ATS-safe PDF generation: selectable, real text using react-pdf's built-in
 * standard fonts (Helvetica / Times-Roman) for maximum reliability on
 * serverless — no font file registration needed. Serif templates map to Times.
 */
export async function renderPdf(
  data: ResumeData,
  opts: { templateId: string; accentColor?: string; fontFamily?: string },
): Promise<Buffer> {
  const tokens = getTemplate(opts.templateId);
  const accent = opts.accentColor ?? tokens.accentColor;
  const serif = (opts.fontFamily ?? tokens.font) === "merriweather";
  const fontFamily = serif ? "Times-Roman" : "Helvetica";
  const boldFont = serif ? "Times-Bold" : "Helvetica-Bold";
  const headerAlign = tokens.headerAlign === "center" ? "center" : "left";
  const titleColor = tokens.accent === "heading" ? accent : "#111827";

  const s = StyleSheet.create({
    page: { paddingVertical: 36, paddingHorizontal: 40, fontFamily, fontSize: 9.5, color: "#1f2937", lineHeight: 1.4 },
    name: { fontSize: 22, fontFamily: boldFont, color: tokens.accent === "name" ? accent : "#111827", textAlign: headerAlign },
    role: { fontSize: 11, color: "#4b5563", marginTop: 2, textAlign: headerAlign },
    contact: { fontSize: 8.5, color: "#6b7280", marginTop: 4, textAlign: headerAlign },
    section: { marginTop: 12 },
    secTitle: {
      fontSize: 11,
      fontFamily: boldFont,
      color: titleColor,
      textTransform: tokens.sectionTitle === "uppercase" || tokens.sectionTitle === "bar" ? "uppercase" : "none",
      letterSpacing: tokens.sectionTitle === "uppercase" ? 1 : 0,
      marginBottom: 3,
      paddingLeft: tokens.sectionTitle === "bar" ? 6 : 0,
      borderLeftWidth: tokens.sectionTitle === "bar" ? 2 : 0,
      borderLeftColor: accent,
    },
    rule: { borderBottomWidth: 1, borderBottomColor: tokens.accent === "rule" ? accent : "#d1d5db", marginBottom: 5 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    bold: { fontFamily: boldFont },
    muted: { color: "#6b7280" },
    item: { marginBottom: 5 },
    bullet: { flexDirection: "row", marginBottom: 1 },
    bulletDot: { width: 8 },
  });

  const dateRange = (a: string, b: string, current?: boolean) =>
    [a, current ? "Present" : b].filter(Boolean).join(" – ");

  const SecTitle = ({ children }: { children: string }) => (
    <View>
      <Text style={s.secTitle}>{children}</Text>
      {tokens.divider ? <View style={s.rule} /> : null}
    </View>
  );

  const Bullets = ({ items }: { items: string[] }) => (
    <>
      {items.filter(Boolean).map((b, i) => (
        <View style={s.bullet} key={i}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={{ flex: 1 }}>{b}</Text>
        </View>
      ))}
    </>
  );

  const c = data.header.contact;
  const contactLine = [c.email, c.phone, c.location, c.website, c.linkedin, c.github]
    .filter(Boolean)
    .join("   •   ");

  const renderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      data.summary?.trim() ? (
        <View style={s.section} key="summary">
          <SecTitle>Summary</SecTitle>
          <Text>{data.summary}</Text>
        </View>
      ) : null,
    experience: () =>
      data.experience.length ? (
        <View style={s.section} key="experience">
          <SecTitle>Experience</SecTitle>
          {data.experience.map((e) => (
            <View style={s.item} key={e.id}>
              <View style={s.row}>
                <Text style={s.bold}>{e.role}</Text>
                <Text style={s.muted}>{dateRange(e.startDate, e.endDate, e.current)}</Text>
              </View>
              <Text style={s.muted}>{[e.company, e.location].filter(Boolean).join(" · ")}</Text>
              <Bullets items={e.bullets} />
            </View>
          ))}
        </View>
      ) : null,
    education: () =>
      data.education.length ? (
        <View style={s.section} key="education">
          <SecTitle>Education</SecTitle>
          {data.education.map((e) => (
            <View style={s.item} key={e.id}>
              <View style={s.row}>
                <Text style={s.bold}>{e.institution}</Text>
                <Text style={s.muted}>{dateRange(e.startDate, e.endDate)}</Text>
              </View>
              <Text style={s.muted}>
                {[[e.degree, e.field].filter(Boolean).join(", "), e.location].filter(Boolean).join(" · ")}
              </Text>
              {e.details ? <Text>{e.details}</Text> : null}
            </View>
          ))}
        </View>
      ) : null,
    skills: () =>
      data.skills.length ? (
        <View style={s.section} key="skills">
          <SecTitle>Skills</SecTitle>
          {data.skills.map((g) => (
            <Text key={g.id}>
              {g.category ? <Text style={s.bold}>{g.category}: </Text> : null}
              {g.items.filter(Boolean).join(", ")}
            </Text>
          ))}
        </View>
      ) : null,
    projects: () =>
      data.projects.length ? (
        <View style={s.section} key="projects">
          <SecTitle>Projects</SecTitle>
          {data.projects.map((p) => (
            <View style={s.item} key={p.id}>
              <Text style={s.bold}>{p.name}{p.link ? `  ${p.link}` : ""}</Text>
              {p.description ? <Text style={s.muted}>{p.description}</Text> : null}
              <Bullets items={p.bullets} />
            </View>
          ))}
        </View>
      ) : null,
    certifications: () =>
      data.certifications.length ? (
        <View style={s.section} key="certifications">
          <SecTitle>Certifications</SecTitle>
          {data.certifications.map((ct) => (
            <View style={s.row} key={ct.id}>
              <Text>{[ct.name, ct.issuer].filter(Boolean).join(" — ")}</Text>
              <Text style={s.muted}>{ct.date}</Text>
            </View>
          ))}
        </View>
      ) : null,
    languages: () =>
      data.languages.length ? (
        <View style={s.section} key="languages">
          <SecTitle>Languages</SecTitle>
          <Text>{data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(",   ")}</Text>
        </View>
      ) : null,
  };

  const order = data.sectionOrder.filter((k) => renderers[k]);
  const rest = Object.keys(renderers).filter((k) => !order.includes(k));
  const fullOrder = [...order, ...rest];

  const doc = (
    <Document>
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.name}>{data.header.fullName || "Your Name"}</Text>
          {data.header.title ? <Text style={s.role}>{data.header.title}</Text> : null}
          {contactLine ? <Text style={s.contact}>{contactLine}</Text> : null}
        </View>
        {fullOrder.map((k) => renderers[k]?.())}
        {data.custom.map((cs) =>
          cs.title || cs.items.length ? (
            <View style={s.section} key={cs.id}>
              <SecTitle>{cs.title || "Section"}</SecTitle>
              <Bullets items={cs.items.map((i) => i.text)} />
            </View>
          ) : null,
        )}
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
