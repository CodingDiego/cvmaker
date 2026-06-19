import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  ImageRun,
  AlignmentType,
  BorderStyle,
  type ISectionOptions,
} from "docx";
import type { ResumeData } from "@/lib/cv/types";
import { resolveSectionOrder, resolveSectionTitle } from "@/lib/cv/types";

/**
 * Shared DOCX builder. DOCX is a flow format — it cannot reproduce the bespoke
 * visual designs (colored bands, sidebars, timelines, skill bars), so every
 * design linearizes to a clean, ATS-safe document here. Per-design character is
 * carried by a small config (accent, font, heading style, alignment); the
 * structure stays parser-friendly (real headings, no layout tables/text boxes).
 */
export interface DocxConfig {
  /** Accent color, hex with or without leading #. */
  accent: string;
  /** Standard DOCX font family name (e.g. "Calibri", "Arial", "Georgia"). */
  font: string;
  headerAlign?: "left" | "center";
  headingUpper?: boolean;
  headingAccent?: boolean;
  nameAccent?: boolean;
  divider?: boolean;
  present?: string;
}

function hrefFor(value: string, kind: "url" | "email" | "phone" = "url"): string {
  const v = value.trim();
  if (kind === "email") return `mailto:${v}`;
  if (kind === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

function dataUrlToImage(dataUrl: string): { data: Buffer; type: "jpg" | "png" } | null {
  const m = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(dataUrl);
  if (!m) return null;
  return { data: Buffer.from(m[2]!, "base64"), type: m[1]!.toLowerCase() === "png" ? "png" : "jpg" };
}

export async function buildResumeDocx(data: ResumeData, config: DocxConfig): Promise<Buffer> {
  const font = config.font;
  const accent = config.accent.replace("#", "");
  const present = config.present ?? "Present";
  const headerAlign = config.headerAlign === "center" ? AlignmentType.CENTER : AlignmentType.LEFT;

  const children: Paragraph[] = [];

  const sectionTitle = (text: string) =>
    new Paragraph({
      spacing: { before: 220, after: 80 },
      border: config.divider
        ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: config.headingAccent ? accent : "999999" } }
        : undefined,
      children: [
        new TextRun({
          text: config.headingUpper ? text.toUpperCase() : text,
          bold: true,
          size: 22,
          color: config.headingAccent ? accent : "111111",
          font,
        }),
      ],
    });

  const line = (runs: { text: string; bold?: boolean; color?: string; italics?: boolean }[], after = 40) =>
    new Paragraph({
      spacing: { after },
      children: runs.filter((r) => r.text).map((r) => new TextRun({ ...r, font, size: 20 })),
    });

  const bullet = (text: string) =>
    new Paragraph({ bullet: { level: 0 }, spacing: { after: 20 }, children: [new TextRun({ text, font, size: 20 })] });

  const linkRun = (label: string, value: string, kind?: "url" | "email" | "phone", size = 20) =>
    new ExternalHyperlink({
      link: hrefFor(value, kind),
      children: [new TextRun({ text: label, font, size, color: accent, underline: {} })],
    });

  const photo = data.header.photo ? dataUrlToImage(data.header.photo) : null;
  if (photo) {
    const pos = data.header.photoPosition ?? "left";
    const align = pos === "center" ? AlignmentType.CENTER : pos === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT;
    children.push(
      new Paragraph({
        alignment: align,
        spacing: { after: 80 },
        children: [new ImageRun({ data: photo.data, type: photo.type, transformation: { width: 72, height: 72 } })],
      }),
    );
  }

  children.push(
    new Paragraph({
      alignment: headerAlign,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: data.header.fullName || "Your Name", bold: true, size: 40, color: config.nameAccent ? accent : "111111", font }),
      ],
    }),
  );
  if (data.header.title) {
    children.push(
      new Paragraph({ alignment: headerAlign, spacing: { after: 40 }, children: [new TextRun({ text: data.header.title, size: 24, color: "444444", font })] }),
    );
  }

  const c = data.header.contact;
  const contacts: { label: string; value: string; kind?: "url" | "email" | "phone" }[] = [
    c.email && { label: c.email, value: c.email, kind: "email" as const },
    c.phone && { label: c.phone, value: c.phone, kind: "phone" as const },
    c.location && { label: c.location, value: "" },
    c.website && { label: c.website, value: c.website },
    c.linkedin && { label: c.linkedin, value: c.linkedin },
    c.github && { label: c.github, value: c.github },
  ].filter(Boolean) as { label: string; value: string; kind?: "url" | "email" | "phone" }[];
  if (contacts.length) {
    const runs: (TextRun | ExternalHyperlink)[] = [];
    contacts.forEach((e, i) => {
      if (i > 0) runs.push(new TextRun({ text: "  |  ", size: 18, color: "666666", font }));
      runs.push(e.value ? linkRun(e.label, e.value, e.kind, 18) : new TextRun({ text: e.label, size: 18, color: "666666", font }));
    });
    children.push(new Paragraph({ alignment: headerAlign, spacing: { after: 120 }, children: runs }));
  }

  const renderers: Record<string, () => void> = {
    summary: () => {
      if (!data.summary?.trim()) return;
      children.push(sectionTitle(resolveSectionTitle(data, "summary")));
      children.push(line([{ text: data.summary }]));
    },
    experience: () => {
      if (!data.experience.length) return;
      children.push(sectionTitle(resolveSectionTitle(data, "experience")));
      for (const e of data.experience) {
        const dates = [e.startDate, e.current ? present : e.endDate].filter(Boolean).join(" – ");
        children.push(line([{ text: e.role, bold: true }, { text: dates ? `   ${dates}` : "", color: "666666" }]));
        children.push(line([{ text: [e.company, e.location].filter(Boolean).join(" · "), color: "444444" }]));
        e.bullets.filter(Boolean).forEach((b) => children.push(bullet(b)));
      }
    },
    education: () => {
      if (!data.education.length) return;
      children.push(sectionTitle(resolveSectionTitle(data, "education")));
      for (const e of data.education) {
        const dates = [e.startDate, e.endDate].filter(Boolean).join(" – ");
        children.push(line([{ text: e.institution, bold: true }, { text: dates ? `   ${dates}` : "", color: "666666" }]));
        children.push(line([{ text: [[e.degree, e.field].filter(Boolean).join(", "), e.location].filter(Boolean).join(" · "), color: "444444" }]));
        if (e.details) children.push(line([{ text: e.details, color: "555555" }]));
      }
    },
    skills: () => {
      if (!data.skills.length) return;
      children.push(sectionTitle(resolveSectionTitle(data, "skills")));
      for (const g of data.skills) {
        const items = g.items
          .filter((it) => it.name.trim())
          .map((it) => (typeof it.level === "number" ? `${it.name} (${it.level}%)` : it.name))
          .join(", ");
        if (!g.category && !items) continue;
        children.push(line([{ text: g.category ? `${g.category}: ` : "", bold: true }, { text: items }]));
      }
    },
    projects: () => {
      if (!data.projects.length) return;
      children.push(sectionTitle(resolveSectionTitle(data, "projects")));
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
      children.push(sectionTitle(resolveSectionTitle(data, "certifications")));
      for (const ct of data.certifications) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              ct.url ? linkRun(ct.name || ct.url, ct.url) : new TextRun({ text: ct.name, font, size: 20 }),
              ...(ct.issuer ? [new TextRun({ text: ` — ${ct.issuer}`, font, size: 20, color: "444444" })] : []),
              ...(ct.date ? [new TextRun({ text: `   ${ct.date}`, font, size: 20, color: "666666" })] : []),
            ],
          }),
        );
      }
    },
    languages: () => {
      if (!data.languages.length) return;
      children.push(sectionTitle(resolveSectionTitle(data, "languages")));
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
