import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  AlignmentType,
  BorderStyle,
  type ISectionOptions,
} from "docx";
import type { ResumeData } from "@/lib/cv/types";
import { resolveSectionOrder } from "@/lib/cv/types";
import { fontById } from "@/lib/font-config";
import { getTemplate } from "@/templates/registry";

function hrefFor(value: string, kind: "url" | "email" | "phone" = "url"): string {
  const v = value.trim();
  if (kind === "email") return `mailto:${v}`;
  if (kind === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

/**
 * ATS-safe DOCX generation: real headings/paragraphs, a standard font, no
 * layout tables or text boxes. Even the two-column template linearizes here so
 * parsers read sections in order.
 */
export async function renderDocx(
  data: ResumeData,
  opts: { templateId: string; accentColor?: string; fontFamily?: string },
): Promise<Buffer> {
  const tokens = getTemplate(opts.templateId);
  const font = fontById(opts.fontFamily ?? tokens.font).docxName;
  const accent = (opts.accentColor ?? tokens.accentColor).replace("#", "");
  const headerAlign = tokens.headerAlign === "center" ? AlignmentType.CENTER : AlignmentType.LEFT;

  const children: Paragraph[] = [];

  const sectionTitle = (text: string) =>
    new Paragraph({
      spacing: { before: 220, after: 80 },
      border: tokens.divider
        ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: tokens.accent === "rule" ? accent : "999999" } }
        : undefined,
      children: [
        new TextRun({
          text: tokens.sectionTitle === "uppercase" || tokens.sectionTitle === "bar" ? text.toUpperCase() : text,
          bold: true,
          size: 22,
          color: tokens.accent === "heading" ? accent : "111111",
          font,
        }),
      ],
    });

  const line = (runs: { text: string; bold?: boolean; color?: string; italics?: boolean }[], opts2?: { spacing?: number }) =>
    new Paragraph({
      spacing: { after: opts2?.spacing ?? 40 },
      children: runs.filter((r) => r.text).map((r) => new TextRun({ ...r, font, size: 20 })),
    });

  const bullet = (text: string) =>
    new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 20 },
      children: [new TextRun({ text, font, size: 20 })],
    });

  const linkRun = (label: string, value: string, kind?: "url" | "email" | "phone", size = 20) =>
    new ExternalHyperlink({
      link: hrefFor(value, kind),
      children: [new TextRun({ text: label, font, size, color: accent, underline: {} })],
    });

  // Header
  children.push(
    new Paragraph({
      alignment: headerAlign,
      spacing: { after: 40 },
      children: [new TextRun({ text: data.header.fullName || "Your Name", bold: true, size: 40, color: tokens.accent === "name" ? accent : "111111", font })],
    }),
  );
  if (data.header.title) {
    children.push(new Paragraph({ alignment: headerAlign, spacing: { after: 40 }, children: [new TextRun({ text: data.header.title, size: 24, color: "444444", font })] }));
  }
  const c = data.header.contact;
  const contactEntries: { label: string; value: string; kind?: "url" | "email" | "phone" }[] = [
    c.email && { label: c.email, value: c.email, kind: "email" as const },
    c.phone && { label: c.phone, value: c.phone, kind: "phone" as const },
    c.location && { label: c.location, value: "" },
    c.website && { label: c.website, value: c.website },
    c.linkedin && { label: c.linkedin, value: c.linkedin },
    c.github && { label: c.github, value: c.github },
  ].filter(Boolean) as { label: string; value: string; kind?: "url" | "email" | "phone" }[];
  if (contactEntries.length) {
    const runs: (TextRun | ExternalHyperlink)[] = [];
    contactEntries.forEach((e, i) => {
      if (i > 0) runs.push(new TextRun({ text: "  |  ", size: 18, color: "666666", font }));
      runs.push(
        e.value
          ? linkRun(e.label, e.value, e.kind, 18)
          : new TextRun({ text: e.label, size: 18, color: "666666", font }),
      );
    });
    children.push(new Paragraph({ alignment: headerAlign, spacing: { after: 120 }, children: runs }));
  }

  const renderers: Record<string, () => void> = {
    summary: () => {
      if (!data.summary?.trim()) return;
      children.push(sectionTitle("Summary"));
      children.push(line([{ text: data.summary }]));
    },
    experience: () => {
      if (!data.experience.length) return;
      children.push(sectionTitle("Experience"));
      for (const e of data.experience) {
        const dates = [e.startDate, e.current ? "Present" : e.endDate].filter(Boolean).join(" – ");
        children.push(line([{ text: e.role, bold: true }, { text: dates ? `   ${dates}` : "", color: "666666" }]));
        children.push(line([{ text: [e.company, e.location].filter(Boolean).join(" · "), color: "444444" }]));
        e.bullets.filter(Boolean).forEach((b) => children.push(bullet(b)));
      }
    },
    education: () => {
      if (!data.education.length) return;
      children.push(sectionTitle("Education"));
      for (const e of data.education) {
        const dates = [e.startDate, e.endDate].filter(Boolean).join(" – ");
        children.push(line([{ text: e.institution, bold: true }, { text: dates ? `   ${dates}` : "", color: "666666" }]));
        children.push(line([{ text: [[e.degree, e.field].filter(Boolean).join(", "), e.location].filter(Boolean).join(" · "), color: "444444" }]));
        if (e.details) children.push(line([{ text: e.details, color: "555555" }]));
      }
    },
    skills: () => {
      if (!data.skills.length) return;
      children.push(sectionTitle("Skills"));
      for (const g of data.skills) {
        children.push(line([{ text: g.category ? `${g.category}: ` : "", bold: true }, { text: g.items.filter(Boolean).join(", ") }]));
      }
    },
    projects: () => {
      if (!data.projects.length) return;
      children.push(sectionTitle("Projects"));
      for (const p of data.projects) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: p.name, bold: true, font, size: 20 }),
              ...(p.link ? [new TextRun({ text: "   ", font, size: 20 }), linkRun(p.link, p.link)] : []),
            ],
          }),
        );
        if (p.description) children.push(line([{ text: p.description, color: "444444" }]));
        p.bullets.filter(Boolean).forEach((b) => children.push(bullet(b)));
      }
    },
    certifications: () => {
      if (!data.certifications.length) return;
      children.push(sectionTitle("Certifications"));
      for (const ct of data.certifications) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              ct.url
                ? linkRun(ct.name || ct.url, ct.url)
                : new TextRun({ text: ct.name, font, size: 20 }),
              ...(ct.issuer ? [new TextRun({ text: ` — ${ct.issuer}`, font, size: 20, color: "444444" })] : []),
              ...(ct.date ? [new TextRun({ text: `   ${ct.date}`, font, size: 20, color: "666666" })] : []),
            ],
          }),
        );
      }
    },
    languages: () => {
      if (!data.languages.length) return;
      children.push(sectionTitle("Languages"));
      children.push(line([{ text: data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(",  ") }]));
    },
  };

  const renderCustom = (id: string) => {
    const cs = data.custom.find((s2) => s2.id === id);
    if (!cs || (!cs.title && !cs.items.length)) return;
    children.push(sectionTitle(cs.title || "Section"));
    cs.items.filter((i) => i.text).forEach((i) => children.push(bullet(i.text)));
  };

  resolveSectionOrder(data).forEach((k) => {
    if (k.startsWith("custom:")) renderCustom(k.slice("custom:".length));
    else renderers[k]?.();
  });

  const section: ISectionOptions = {
    properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
    children,
  };

  const doc = new Document({ sections: [section], styles: { default: { document: { run: { font } } } } });
  return Packer.toBuffer(doc);
}
