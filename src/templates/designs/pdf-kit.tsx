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
import { resolveSectionOrder, resolveSectionTitle } from "@/lib/cv/types";
import { pdfHeaderStyles, pdfHeaderTextStyle } from "@/templates/render/pdf-layout";

/**
 * Shared react-pdf builder. Each bespoke design maps to a config here so the
 * PDF reflects its character (header band vs centered vs colored sidebar, skill
 * bars, accent) while staying selectable real text and serverless-safe (built-in
 * Helvetica/Times — no font file registration). PDFs approximate the on-screen
 * design rather than matching it pixel-for-pixel.
 */
export type PdfHeader = "plain" | "band" | "underline" | "centered";

export interface PdfSidebar {
  side: "left" | "right";
  /** Solid dark/accent panel with light text (name lives inside). */
  dark?: boolean;
  /** Sections routed into the sidebar. */
  sections: string[];
}

export interface PdfConfig {
  accent: string; // hex
  serif?: boolean;
  header: PdfHeader;
  sidebar?: PdfSidebar;
  skillBars?: boolean;
  /** Left accent rule on experience entries (timeline feel). */
  timeline?: boolean;
  uppercaseHeadings?: boolean;
  uppercaseName?: boolean;
  letterSpacedName?: boolean;
  nameSize?: number;
  present?: string;
}

function clamp(n: number) {
  return Math.max(0, Math.min(255, n));
}
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
}
function rgbToHex(rgb: [number, number, number]) {
  return "#" + rgb.map((x) => clamp(Math.round(x)).toString(16).padStart(2, "0")).join("");
}
export function mixHex(hex: string, pct: number, other = "#ffffff") {
  const a = hexToRgb(hex);
  const b = hexToRgb(other);
  const t = pct / 100;
  return rgbToHex([a[0] * t + b[0] * (1 - t), a[1] * t + b[1] * (1 - t), a[2] * t + b[2] * (1 - t)]);
}

function hrefFor(value: string, kind: "url" | "email" | "phone" = "url"): string {
  const v = value.trim();
  if (kind === "email") return `mailto:${v}`;
  if (kind === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export async function buildResumePdf(data: ResumeData, config: PdfConfig): Promise<Buffer> {
  const accent = config.accent || "#1d4ed8";
  const present = config.present ?? "Present";
  const fontFamily = config.serif ? "Times-Roman" : "Helvetica";
  const boldFont = config.serif ? "Times-Bold" : "Helvetica-Bold";
  const sidebarSections = new Set(config.sidebar?.sections ?? []);
  const darkSide = config.sidebar?.dark ?? false;
  const headerAlign = config.header === "centered" ? "center" : "left";
  const headerStyles = pdfHeaderStyles();

  const s = StyleSheet.create({
    page: { flexDirection: "row", fontFamily, fontSize: 9.5, color: "#1f2937", lineHeight: 1.4 },
    col: { paddingVertical: 34, paddingHorizontal: 38 },
    main: { flexGrow: 1, flexBasis: 0 },
    sidebar: {
      width: 210,
      paddingVertical: 34,
      paddingHorizontal: 26,
      backgroundColor: darkSide ? mixHex(accent, 30, "#0b0e12") : mixHex(accent, 10),
      color: darkSide ? "#eceaf0" : "#1f2937",
    },
    band: { backgroundColor: accent, color: "#ffffff", paddingVertical: 26, paddingHorizontal: 38, marginBottom: 14 },
    name: {
      fontSize: config.nameSize ?? 22,
      fontFamily: boldFont,
      textAlign: headerAlign,
      letterSpacing: config.letterSpacedName ? 1.5 : 0,
      ...headerStyles.name,
    },
    role: {
      fontSize: 11,
      color: "#4b5563",
      textAlign: headerAlign,
      ...headerStyles.role,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: headerAlign === "center" ? "center" : "flex-start",
      ...headerStyles.contacts,
    },
    contactItem: { fontSize: 8.5, color: "#6b7280", marginRight: 8, marginBottom: 2 },
    section: { marginTop: 12 },
    secTitle: {
      fontSize: 10.5,
      fontFamily: boldFont,
      color: accent,
      textTransform: config.uppercaseHeadings ? "uppercase" : "none",
      letterSpacing: config.uppercaseHeadings ? 1 : 0,
      marginBottom: 3,
    },
    rule: { borderBottomWidth: 1, borderBottomColor: mixHex(accent, 40), marginBottom: 5, marginTop: 1 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    bold: { fontFamily: boldFont },
    muted: { color: "#6b7280" },
    item: { marginBottom: 6 },
    tItem: { marginBottom: 6, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: mixHex(accent, 45) },
    bullet: { flexDirection: "row", marginBottom: 1 },
    bulletDot: { width: 8, color: accent },
    link: { color: darkSide ? "#ffffff" : accent, textDecoration: "none" },
    barTrack: { height: 4, borderRadius: 2, backgroundColor: darkSide ? mixHex(accent, 45, "#0b0e12") : mixHex(accent, 18), marginTop: 2, marginBottom: 6 },
    chip: { fontSize: 8.5, borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6, marginRight: 4, marginBottom: 4, backgroundColor: mixHex(accent, 14) },
  });

  const dateRange = (a: string, b: string, current?: boolean) =>
    [a, current ? present : b].filter(Boolean).join(" – ");

  const SecTitle = ({ children, light }: { children: string; light?: boolean }) => (
    <View>
      <Text style={[s.secTitle, light ? { color: mixHex(accent, 60, "#ffffff") } : {}]}>{children}</Text>
      {config.header === "underline" && !light ? <View style={s.rule} /> : null}
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
  const contacts = [
    c.location && { label: c.location, value: "" },
    c.phone && { label: c.phone, value: c.phone, kind: "phone" as const },
    c.email && { label: c.email, value: c.email, kind: "email" as const },
    c.website && { label: c.website, value: c.website },
    c.linkedin && { label: c.linkedin, value: c.linkedin },
    c.github && { label: c.github, value: c.github },
  ].filter(Boolean) as { label: string; value: string; kind?: "url" | "email" | "phone" }[];

  const ContactLine = () =>
    contacts.length ? (
      <View style={s.contactRow}>
        {contacts.map((e, i) => (
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

  const SkillsBlock = ({ light }: { light?: boolean }) =>
    data.skills.length ? (
      <View style={s.section}>
        <SecTitle light={light}>{resolveSectionTitle(data, "skills")}</SecTitle>
        {config.skillBars ? (
          data.skills.flatMap((g) => g.items).filter((it) => it.name.trim()).map((it, i) => (
            <View key={i}>
              <Text style={{ fontSize: 9 }}>{it.name}</Text>
              <View style={s.barTrack}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: light ? "#ffffff" : accent, width: `${it.level ?? 70}%` }} />
              </View>
            </View>
          ))
        ) : (
          data.skills.map((g) => {
            const items = g.items.filter((it) => it.name.trim()).map((it) => it.name).join(", ");
            if (!g.category && !items) return null;
            return (
              <Text key={g.id} style={{ marginBottom: 2 }}>
                {g.category ? <Text style={s.bold}>{g.category}: </Text> : null}
                {items}
              </Text>
            );
          })
        )}
      </View>
    ) : null;

  const LanguagesBlock = ({ light }: { light?: boolean }) =>
    data.languages.length ? (
      <View style={s.section}>
        <SecTitle light={light}>{resolveSectionTitle(data, "languages")}</SecTitle>
        <Text>{data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(",   ")}</Text>
      </View>
    ) : null;

  const CertsBlock = ({ light }: { light?: boolean }) =>
    data.certifications.length ? (
      <View style={s.section}>
        <SecTitle light={light}>{resolveSectionTitle(data, "certifications")}</SecTitle>
        {data.certifications.map((ct) => (
          <View key={ct.id} style={{ marginBottom: 3 }}>
            <Text>
              {ct.url ? (
                <Link src={hrefFor(ct.url)} style={s.link}>
                  {ct.name || ct.url}
                </Link>
              ) : (
                <Text style={s.bold}>{ct.name}</Text>
              )}
              {ct.issuer ? <Text style={s.muted}> — {ct.issuer}</Text> : null}
              {ct.date ? <Text style={s.muted}>  {ct.date}</Text> : null}
            </Text>
          </View>
        ))}
      </View>
    ) : null;

  const SECTION_NODES: Record<string, (light?: boolean) => React.ReactNode> = {
    summary: () =>
      data.summary?.trim() ? (
        <View style={s.section} key="summary">
          <SecTitle>{resolveSectionTitle(data, "summary")}</SecTitle>
          <Text>{data.summary}</Text>
        </View>
      ) : null,
    experience: () =>
      data.experience.length ? (
        <View style={s.section} key="experience">
          <SecTitle>{resolveSectionTitle(data, "experience")}</SecTitle>
          {data.experience.map((e) => (
            <View style={config.timeline ? s.tItem : s.item} key={e.id}>
              <View style={s.row}>
                <Text style={s.bold}>{e.role}</Text>
                <Text style={s.muted}>{dateRange(e.startDate, e.endDate, e.current)}</Text>
              </View>
              <Text style={{ color: mixHex(accent, 70, "#1b1f23") }}>{[e.company, e.location].filter(Boolean).join(" · ")}</Text>
              <Bullets items={e.bullets} />
            </View>
          ))}
        </View>
      ) : null,
    education: () =>
      data.education.length ? (
        <View style={s.section} key="education">
          <SecTitle>{resolveSectionTitle(data, "education")}</SecTitle>
          {data.education.map((e) => (
            <View style={s.item} key={e.id}>
              <View style={s.row}>
                <Text style={s.bold}>{e.institution}</Text>
                <Text style={s.muted}>{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</Text>
              </View>
              <Text style={s.muted}>{[[e.degree, e.field].filter(Boolean).join(", "), e.location].filter(Boolean).join(" · ")}</Text>
              {e.details ? <Text>{e.details}</Text> : null}
            </View>
          ))}
        </View>
      ) : null,
    projects: () =>
      data.projects.length ? (
        <View style={s.section} key="projects">
          <SecTitle>{resolveSectionTitle(data, "projects")}</SecTitle>
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
    skills: (light?: boolean) => <SkillsBlock key="skills" light={light} />,
    languages: (light?: boolean) => <LanguagesBlock key="languages" light={light} />,
    certifications: (light?: boolean) => <CertsBlock key="certifications" light={light} />,
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

  const renderKey = (k: string, light?: boolean) =>
    k.startsWith("custom:") ? renderCustom(k.slice("custom:".length)) : SECTION_NODES[k]?.(light);

  const order = resolveSectionOrder(data);
  const mainOrder = order.filter((k) => !sidebarSections.has(k));
  const sideOrder = order.filter((k) => sidebarSections.has(k));

  const photo = data.header.photo;
  const PHOTO = 58;

  const Header = ({ light }: { light?: boolean }) => (
    <View style={{ flexDirection: photo && config.header !== "centered" ? "row" : "column", alignItems: config.header === "centered" ? "center" : "flex-start" }}>
      {photo ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={photo} style={{ width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2, objectFit: "cover", marginRight: 12, marginBottom: 6 }} />
      ) : null}
      <View style={pdfHeaderTextStyle({ hasPhoto: Boolean(photo), photoPosition: data.header.photoPosition })}>
        <Text style={[s.name, light ? { color: "#ffffff" } : {}]}>
          {config.uppercaseName ? (data.header.fullName || "Your Name").toUpperCase() : data.header.fullName || "Your Name"}
        </Text>
        {data.header.title ? <Text style={[s.role, light ? { color: mixHex(accent, 40, "#ffffff") } : {}]}>{data.header.title}</Text> : null}
        {!light ? <ContactLine /> : null}
      </View>
    </View>
  );

  // Two-column layout with a colored sidebar.
  if (config.sidebar) {
    const Sidebar = (
      <View style={s.sidebar} key="sidebar">
        {darkSide ? (
          <>
            {photo ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={photo} style={{ width: 86, height: 86, borderRadius: 43, objectFit: "cover", marginBottom: 12, alignSelf: "center" }} />
            ) : null}
            <Text style={[s.secTitle, { color: mixHex(accent, 55, "#ffffff") }]}>Contact</Text>
            {contacts.map((e, i) => (
              <Text key={i} style={{ fontSize: 8.5, marginBottom: 2, color: "#d6d2de" }}>
                {e.value ? <Link src={hrefFor(e.value, e.kind)} style={s.link}>{e.label}</Link> : e.label}
              </Text>
            ))}
          </>
        ) : null}
        {sideOrder.map((k) => renderKey(k, darkSide))}
      </View>
    );
    const Main = (
      <View style={[s.col, s.main]} key="main">
        <Header />
        {mainOrder.map((k) => renderKey(k))}
      </View>
    );
    return renderToBuffer(
      <Document>
        <Page size="A4" style={s.page}>
          {config.sidebar.side === "left" ? (
            <>
              {Sidebar}
              {Main}
            </>
          ) : (
            <>
              {Main}
              {Sidebar}
            </>
          )}
        </Page>
      </Document>,
    );
  }

  // Single column (optionally with a colored band header).
  return renderToBuffer(
    <Document>
      <Page size="A4" style={{ fontFamily, fontSize: 9.5, color: "#1f2937", lineHeight: 1.4 }}>
        {config.header === "band" ? (
          <>
            <View style={s.band}>
              <Header light />
              <ContactLine />
            </View>
            <View style={{ paddingHorizontal: 38, paddingBottom: 34 }}>{order.map((k) => renderKey(k))}</View>
          </>
        ) : (
          <View style={{ paddingVertical: 34, paddingHorizontal: 38 }}>
            <Header />
            {config.header === "underline" || config.header === "centered" ? <View style={[s.rule, { marginTop: 8 }]} /> : null}
            {order.map((k) => renderKey(k))}
          </View>
        )}
      </Page>
    </Document>,
  );
}
