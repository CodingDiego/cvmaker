import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  type ISectionOptions,
} from "docx";
import type { ResumeData } from "@/lib/cv/types";
import { fontById } from "@/lib/font-config";
import { getTemplate } from "@/templates/registry";

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
  const contactLine = [c.email, c.phone, c.location, c.website, c.linkedin, c.github].filter(Boolean).join("  |  ");
  if (contactLine) {
    children.push(new Paragraph({ alignment: headerAlign, spacing: { after: 120 }, children: [new TextRun({ text: contactLine, size: 18, color: "666666", font })] }));
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
        children.push(line([{ text: p.name, bold: true }, { text: p.link ? `   ${p.link}` : "", color: accent }]));
        if (p.description) children.push(line([{ text: p.description, color: "444444" }]));
        p.bullets.filter(Boolean).forEach((b) => children.push(bullet(b)));
      }
    },
    certifications: () => {
      if (!data.certifications.length) return;
      children.push(sectionTitle("Certifications"));
      for (const ct of data.certifications) {
        children.push(line([{ text: [ct.name, ct.issuer].filter(Boolean).join(" — ") }, { text: ct.date ? `   ${ct.date}` : "", color: "666666" }]));
      }
    },
    languages: () => {
      if (!data.languages.length) return;
      children.push(sectionTitle("Languages"));
      children.push(line([{ text: data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(",  ") }]));
    },
  };

  const order = data.sectionOrder.filter((k) => renderers[k]);
  const rest = Object.keys(renderers).filter((k) => !order.includes(k));
  [...order, ...rest].forEach((k) => renderers[k]?.());

  for (const cs of data.custom) {
    if (!cs.title && !cs.items.length) continue;
    children.push(sectionTitle(cs.title || "Section"));
    cs.items.filter((i) => i.text).forEach((i) => children.push(bullet(i.text)));
  }

  const section: ISectionOptions = {
    properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
    children,
  };

  const doc = new Document({ sections: [section], styles: { default: { document: { run: { font } } } } });
  return Packer.toBuffer(doc);
}
