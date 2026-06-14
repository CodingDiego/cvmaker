import {
  Document,
  Page,
  View,
  Text,
  Image,
  Link,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/cv/types";
import { resolveSectionOrder } from "@/lib/cv/types";
import { getTemplate } from "@/templates/registry";

function hrefFor(value: string, kind: "url" | "email" | "phone" = "url"): string {
  const v = value.trim();
  if (kind === "email") return `mailto:${v}`;
  if (kind === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

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
    headerText: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: headerAlign === "center" ? "center" : "flex-start",
      marginTop: 4,
    },
    contactItem: { fontSize: 8.5, color: "#6b7280", marginRight: 8, marginBottom: 2 },
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
    bulletDot: { width: 8, color: accent },
    link: { color: accent, textDecoration: "none" },
  });

  const markers: Record<string, string> = { disc: "•", dash: "–", square: "▪", none: "•" };
  const marker = markers[tokens.bullet ?? "disc"] ?? "•";

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
          <Text style={s.bulletDot}>{marker}</Text>
          <Text style={{ flex: 1 }}>{b}</Text>
        </View>
      ))}
    </>
  );

  const c = data.header.contact;
  const contactEntries: { label: string; value: string; kind?: "url" | "email" | "phone" }[] = [
    c.email && { label: c.email, value: c.email, kind: "email" as const },
    c.phone && { label: c.phone, value: c.phone, kind: "phone" as const },
    c.location && { label: c.location, value: "" },
    c.website && { label: c.website, value: c.website },
    c.linkedin && { label: c.linkedin, value: c.linkedin },
    c.github && { label: c.github, value: c.github },
  ].filter(Boolean) as { label: string; value: string; kind?: "url" | "email" | "phone" }[];

  const ContactLine = () =>
    contactEntries.length ? (
      <View style={s.contactRow}>
        {contactEntries.map((e, i) => (
          <Text key={i} style={s.contactItem}>
            {i > 0 ? "   •   " : ""}
            {e.value ? (
              <Link src={hrefFor(e.value, e.kind)} style={s.link}>
                {e.label}
              </Link>
            ) : (
              e.label
            )}
          </Text>
        ))}
      </View>
    ) : null;

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
              <Text>
                <Text style={s.bold}>{p.name}</Text>
                {p.link ? (
                  <Text>
                    {"  "}
                    <Link src={hrefFor(p.link)} style={s.link}>
                      {p.link}
                    </Link>
                  </Text>
                ) : null}
              </Text>
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
              <Text>
                {ct.url ? (
                  <Link src={hrefFor(ct.url)} style={s.link}>
                    {ct.name || ct.url}
                  </Link>
                ) : (
                  <Text>{ct.name}</Text>
                )}
                {ct.issuer ? <Text style={s.muted}> — {ct.issuer}</Text> : null}
              </Text>
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

  const renderCustom = (id: string) => {
    const cs = data.custom.find((s2) => s2.id === id);
    if (!cs || (!cs.title && !cs.items.length)) return null;
    return (
      <View style={s.section} key={`custom:${id}`}>
        <SecTitle>{cs.title || "Section"}</SecTitle>
        <Bullets items={cs.items.map((i) => i.text)} />
      </View>
    );
  };

  const renderKey = (k: string) =>
    k.startsWith("custom:") ? renderCustom(k.slice("custom:".length)) : renderers[k]?.();

  const fullOrder = resolveSectionOrder(data);

  const photo = data.header.photo;
  const photoPos = data.header.photoPosition ?? "left";
  const PHOTO = 64;
  const headerDir =
    photoPos === "center" ? "column" : photoPos === "right" ? "row-reverse" : "row";

  const HeaderText = () => (
    <View
      style={{
        ...s.headerText,
        flexGrow: 1,
        ...(photo && photoPos === "left" ? { marginLeft: 12 } : null),
        ...(photo && photoPos === "right" ? { marginRight: 12 } : null),
        ...(photo && photoPos === "center" ? { marginTop: 6 } : null),
      }}
    >
      <Text style={s.name}>{data.header.fullName || "Your Name"}</Text>
      {data.header.title ? <Text style={s.role}>{data.header.title}</Text> : null}
      <ContactLine />
    </View>
  );

  const doc = (
    <Document>
      <Page size="A4" style={s.page}>
        <View
          style={{
            flexDirection: headerDir,
            alignItems: photoPos === "center" ? "center" : "flex-start",
            width: "100%",
          }}
        >
          {photo ? (
            // react-pdf <Image> has no alt prop (it renders to PDF, not the DOM).
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={photo} style={{ width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2, objectFit: "cover" }} />
          ) : null}
          <HeaderText />
        </View>
        {fullOrder.map((k) => renderKey(k))}
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
