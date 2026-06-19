"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ImageUp, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCvStore, newId } from "@/lib/cv/store";
import { sampleResume } from "@/lib/cv/types";
import { TextField, AreaField, BulletsField, LinkField } from "./field";
import { useT } from "@/i18n/provider";

/**
 * Example content shown as *placeholders* in the editor. A CV created from a
 * template starts blank (see `templateStarter`) but with the same item ids as
 * this sample, so each field can surface a matching example until the user types
 * a real value. Built once — it's static.
 */
function usePlaceholders() {
  return useMemo(() => {
    const s = sampleResume();
    const byId = <T extends { id: string }>(rows: T[]) => new Map(rows.map((r) => [r.id, r]));
    return {
      header: s.header,
      summary: s.summary,
      experience: byId(s.experience),
      education: byId(s.education),
      skills: byId(s.skills),
      projects: byId(s.projects),
      certifications: byId(s.certifications),
      languages: byId(s.languages),
    };
  }, []);
}

/** Downscale + re-encode a chosen image to a small JPEG data URL so the resume
 * document (autosaved as JSON) stays lightweight. */
async function fileToResizedDataUrl(file: File, max = 320): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.85);
}

const PHOTO_POSITIONS = ["left", "center", "right"] as const;

function PhotoField() {
  const t = useT();
  const photo = useCvStore((s) => s.data.header.photo);
  const position = useCvStore((s) => s.data.header.photoPosition);
  const mutate = useCvStore((s) => s.mutate);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToResizedDataUrl(file);
        mutate((d) => {
          d.header.photo = dataUrl;
        });
      } catch {
        // Ignore unreadable images.
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
        {photo ? (
          <Image src={photo} alt={t("editor.photo.alt")} fill sizes="64px" unoptimized className="object-cover" />
        ) : (
          <User className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <ImageUp className="size-3.5" /> {photo ? t("editor.photo.replace") : t("editor.photo.add")}
        </Button>
        {photo && (
          <>
            <Select
              value={position}
              onValueChange={(v) =>
                v && mutate((d) => {
                  d.header.photoPosition = v as "left" | "center" | "right";
                })
              }
            >
              <SelectTrigger className="h-9 w-32" aria-label={t("editor.photo.positionAria")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHOTO_POSITIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {t(`editor.photo.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => mutate((d) => {
                d.header.photo = "";
              })}
            >
              <Trash2 className="size-3.5" /> {t("editor.photo.remove")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/** Inline-editable heading for a built-in section (lets the user rename it). */
function EditableSectionTitle({ sectionKey, defaultLabel }: { sectionKey: string; defaultLabel: string }) {
  const t = useT();
  const value = useCvStore((s) => s.data.sectionTitles?.[sectionKey] ?? "");
  const mutate = useCvStore((s) => s.mutate);
  return (
    <input
      value={value}
      placeholder={defaultLabel}
      onChange={(e) =>
        mutate((d) => {
          d.sectionTitles = { ...d.sectionTitles, [sectionKey]: e.target.value };
        })
      }
      aria-label={t("editor.actions.sectionTitleAria", { section: defaultLabel })}
      title={t("editor.actions.rename")}
      className="w-full rounded-sm bg-transparent font-semibold text-foreground outline-none placeholder:text-foreground focus:bg-muted/60 focus:px-1"
    />
  );
}

function SectionBlock({
  title,
  titleKey,
  hint,
  children,
  onAdd,
  addLabel,
  error,
}: {
  title: string;
  /** When set, the heading becomes an editable rename field for this section. */
  titleKey?: string;
  hint?: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  error?: string;
}) {
  const t = useT();
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {titleKey ? (
            <EditableSectionTitle sectionKey={titleKey} defaultLabel={title} />
          ) : (
            <h3 className="font-semibold">{title}</h3>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {onAdd && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="size-3.5" /> {addLabel ?? t("editor.actions.add")}
          </Button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      {children}
    </section>
  );
}

function ItemCard({
  children,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const t = useT();
  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex justify-end gap-0.5">
        {onMoveUp && (
          <Button size="icon-xs" variant="ghost" aria-label={t("editor.actions.moveUp")} onClick={onMoveUp}>
            <ChevronUp className="size-3.5" />
          </Button>
        )}
        {onMoveDown && (
          <Button size="icon-xs" variant="ghost" aria-label={t("editor.actions.moveDown")} onClick={onMoveDown}>
            <ChevronDown className="size-3.5" />
          </Button>
        )}
        <Button size="icon-xs" variant="ghost" aria-label={t("editor.actions.remove")} onClick={onRemove}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      {children}
    </div>
  );
}

export function EditorForm() {
  const t = useT();
  const data = useCvStore((s) => s.data);
  const mutate = useCvStore((s) => s.mutate);
  const sectionErrors = useCvStore((s) => s.sectionErrors);
  const ph = usePlaceholders();

  if (!data.header) return null;

  const errorSet = new Set(sectionErrors);
  const sectionError = (key: string) => (errorSet.has(key) ? t("editor.emptySection") : undefined);

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionBlock title={t("editor.sections.personal")}>
        <PhotoField />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label={t("editor.fields.fullName")} placeholder={ph.header.fullName} value={data.header.fullName} onChange={(v) => mutate((d) => { d.header.fullName = v; })} />
          <TextField label={t("editor.fields.jobTitle")} placeholder={ph.header.title} value={data.header.title} onChange={(v) => mutate((d) => { d.header.title = v; })} />
          <TextField label={t("editor.fields.email")} type="email" placeholder={ph.header.contact.email} value={data.header.contact.email} onChange={(v) => mutate((d) => { d.header.contact.email = v; })} />
          <TextField label={t("editor.fields.phone")} placeholder={ph.header.contact.phone} value={data.header.contact.phone} onChange={(v) => mutate((d) => { d.header.contact.phone = v; })} />
          <TextField label={t("editor.fields.location")} placeholder={ph.header.contact.location} value={data.header.contact.location} onChange={(v) => mutate((d) => { d.header.contact.location = v; })} />
          <LinkField label={t("editor.fields.website")} placeholder={ph.header.contact.website} value={data.header.contact.website} onChange={(v) => mutate((d) => { d.header.contact.website = v; })} />
          <LinkField label={t("editor.fields.linkedin")} value={data.header.contact.linkedin} placeholder={ph.header.contact.linkedin} onChange={(v) => mutate((d) => { d.header.contact.linkedin = v; })} />
          <LinkField label={t("editor.fields.github")} value={data.header.contact.github} placeholder={ph.header.contact.github} onChange={(v) => mutate((d) => { d.header.contact.github = v; })} />
        </div>
      </SectionBlock>

      {/* Summary */}
      <SectionBlock title={t("editor.sections.summary")} titleKey="summary">
        <AreaField label={t("editor.fields.summary")} rows={4} placeholder={ph.summary} value={data.summary} onChange={(v) => mutate((d) => { d.summary = v; })} />
      </SectionBlock>

      {/* Experience */}
      <SectionBlock
        title={t("editor.sections.experience")}
        titleKey="experience"
        error={sectionError("experience")}
        onAdd={() => mutate((d) => { d.experience.push({ id: newId("exp"), company: "", role: "", location: "", startDate: "", endDate: "", current: false, bullets: [] }); })}
      >
        {data.experience.map((e, i) => {
          const p = ph.experience.get(e.id);
          return (
          <ItemCard
            key={e.id}
            onRemove={() => mutate((d) => { d.experience.splice(i, 1); })}
            onMoveUp={i > 0 ? () => mutate((d) => { d.experience.splice(i - 1, 0, d.experience.splice(i, 1)[0]!); }) : undefined}
            onMoveDown={i < data.experience.length - 1 ? () => mutate((d) => { d.experience.splice(i + 1, 0, d.experience.splice(i, 1)[0]!); }) : undefined}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label={t("editor.fields.role")} placeholder={p?.role} value={e.role} onChange={(v) => mutate((d) => { d.experience[i]!.role = v; })} />
              <TextField label={t("editor.fields.company")} placeholder={p?.company} value={e.company} onChange={(v) => mutate((d) => { d.experience[i]!.company = v; })} />
              <TextField label={t("editor.fields.location")} placeholder={p?.location} value={e.location} onChange={(v) => mutate((d) => { d.experience[i]!.location = v; })} />
              <div className="grid grid-cols-2 gap-2">
                <TextField label={t("editor.fields.start")} placeholder={p?.startDate} value={e.startDate} onChange={(v) => mutate((d) => { d.experience[i]!.startDate = v; })} />
                <TextField label={t("editor.fields.end")} placeholder={p?.endDate} value={e.endDate} onChange={(v) => mutate((d) => { d.experience[i]!.endDate = v; })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={e.current} onCheckedChange={(c) => mutate((d) => { d.experience[i]!.current = c; })} />
              <Label className="text-xs">{t("editor.fields.currentlyHere")}</Label>
            </div>
            <BulletsField placeholder={p?.bullets.join("\n")} value={e.bullets} onChange={(v) => mutate((d) => { d.experience[i]!.bullets = v; })} />
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Education */}
      <SectionBlock
        title={t("editor.sections.education")}
        titleKey="education"
        error={sectionError("education")}
        onAdd={() => mutate((d) => { d.education.push({ id: newId("edu"), institution: "", degree: "", field: "", location: "", startDate: "", endDate: "", details: "" }); })}
      >
        {data.education.map((e, i) => {
          const p = ph.education.get(e.id);
          return (
          <ItemCard key={e.id} onRemove={() => mutate((d) => { d.education.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label={t("editor.fields.institution")} placeholder={p?.institution} value={e.institution} onChange={(v) => mutate((d) => { d.education[i]!.institution = v; })} />
              <TextField label={t("editor.fields.degree")} placeholder={p?.degree} value={e.degree} onChange={(v) => mutate((d) => { d.education[i]!.degree = v; })} />
              <TextField label={t("editor.fields.field")} placeholder={p?.field} value={e.field} onChange={(v) => mutate((d) => { d.education[i]!.field = v; })} />
              <TextField label={t("editor.fields.location")} placeholder={p?.location} value={e.location} onChange={(v) => mutate((d) => { d.education[i]!.location = v; })} />
              <TextField label={t("editor.fields.start")} placeholder={p?.startDate} value={e.startDate} onChange={(v) => mutate((d) => { d.education[i]!.startDate = v; })} />
              <TextField label={t("editor.fields.end")} placeholder={p?.endDate} value={e.endDate} onChange={(v) => mutate((d) => { d.education[i]!.endDate = v; })} />
            </div>
            <AreaField label={t("editor.fields.detailsOptional")} rows={2} value={e.details} onChange={(v) => mutate((d) => { d.education[i]!.details = v; })} />
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Skills */}
      <SectionBlock
        title={t("editor.sections.skills")}
        titleKey="skills"
        error={sectionError("skills")}
        onAdd={() => mutate((d) => { d.skills.push({ id: newId("sk"), category: "", items: [] }); })}
      >
        {data.skills.map((g, i) => {
          const p = ph.skills.get(g.id);
          return (
          <ItemCard key={g.id} onRemove={() => mutate((d) => { d.skills.splice(i, 1); })}>
            <TextField label={t("editor.fields.category")} placeholder={p?.category} value={g.category} onChange={(v) => mutate((d) => { d.skills[i]!.category = v; })} />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{t("editor.fields.skillsList")}</Label>
                <span className="text-[0.7rem] text-muted-foreground">{t("editor.fields.skillLevelHint")}</span>
              </div>
              {g.items.map((it, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Input
                    value={it.name}
                    placeholder={p?.items[j]?.name ?? t("editor.fields.skillNamePlaceholder")}
                    onChange={(e) => mutate((d) => { d.skills[i]!.items[j]!.name = e.target.value; })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={it.level ?? ""}
                    placeholder="%"
                    aria-label={t("editor.fields.skillLevelAria")}
                    className="w-16"
                    onChange={(e) =>
                      mutate((d) => {
                        const v = e.target.value;
                        d.skills[i]!.items[j]!.level =
                          v === "" ? undefined : Math.max(0, Math.min(100, Math.round(Number(v))));
                      })
                    }
                  />
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label={t("editor.actions.remove")}
                    onClick={() => mutate((d) => { d.skills[i]!.items.splice(j, 1); })}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => mutate((d) => { d.skills[i]!.items.push({ name: "" }); })}
              >
                <Plus className="size-3.5" /> {t("editor.fields.addSkill")}
              </Button>
            </div>
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Projects */}
      <SectionBlock
        title={t("editor.sections.projects")}
        titleKey="projects"
        error={sectionError("projects")}
        onAdd={() => mutate((d) => { d.projects.push({ id: newId("prj"), name: "", link: "", description: "", bullets: [] }); })}
      >
        {data.projects.map((p, i) => {
          const ex = ph.projects.get(p.id);
          return (
          <ItemCard key={p.id} onRemove={() => mutate((d) => { d.projects.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label={t("editor.fields.name")} placeholder={ex?.name} value={p.name} onChange={(v) => mutate((d) => { d.projects[i]!.name = v; })} />
              <LinkField label={t("editor.fields.link")} placeholder={ex?.link} value={p.link} onChange={(v) => mutate((d) => { d.projects[i]!.link = v; })} />
            </div>
            <AreaField label={t("editor.fields.description")} rows={2} placeholder={ex?.description} value={p.description} onChange={(v) => mutate((d) => { d.projects[i]!.description = v; })} />
            <BulletsField placeholder={ex?.bullets.join("\n")} value={p.bullets} onChange={(v) => mutate((d) => { d.projects[i]!.bullets = v; })} />
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Certifications */}
      <SectionBlock
        title={t("editor.sections.certifications")}
        titleKey="certifications"
        error={sectionError("certifications")}
        onAdd={() => mutate((d) => { d.certifications.push({ id: newId("cert"), name: "", issuer: "", date: "", url: "" }); })}
      >
        {data.certifications.map((c, i) => {
          const p = ph.certifications.get(c.id);
          return (
          <ItemCard key={c.id} onRemove={() => mutate((d) => { d.certifications.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField label={t("editor.fields.name")} placeholder={p?.name} value={c.name} onChange={(v) => mutate((d) => { d.certifications[i]!.name = v; })} />
              <TextField label={t("editor.fields.issuer")} placeholder={p?.issuer} value={c.issuer} onChange={(v) => mutate((d) => { d.certifications[i]!.issuer = v; })} />
              <TextField label={t("editor.fields.date")} placeholder={p?.date} value={c.date} onChange={(v) => mutate((d) => { d.certifications[i]!.date = v; })} />
            </div>
            <LinkField label={t("editor.fields.credentialLink")} value={c.url} placeholder={p?.url ?? "credly.com/badges/…"} onChange={(v) => mutate((d) => { d.certifications[i]!.url = v; })} />
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Languages */}
      <SectionBlock
        title={t("editor.sections.languages")}
        titleKey="languages"
        error={sectionError("languages")}
        onAdd={() => mutate((d) => { d.languages.push({ id: newId("lng"), name: "", level: "" }); })}
      >
        {data.languages.map((l, i) => {
          const p = ph.languages.get(l.id);
          return (
          <ItemCard key={l.id} onRemove={() => mutate((d) => { d.languages.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label={t("editor.fields.language")} placeholder={p?.name} value={l.name} onChange={(v) => mutate((d) => { d.languages[i]!.name = v; })} />
              <TextField label={t("editor.fields.level")} placeholder={p?.level} value={l.level} onChange={(v) => mutate((d) => { d.languages[i]!.level = v; })} />
            </div>
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Custom sections — user-defined, reorderable */}
      <SectionBlock
        title={t("editor.sections.custom")}
        hint={t("editor.sections.customHint")}
        addLabel={t("editor.actions.addSection")}
        onAdd={() => mutate((d) => { d.custom.push({ id: newId("cs"), title: "", items: [{ id: newId("ci"), text: "" }] }); })}
      >
        {data.custom.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("editor.sections.customEmpty")}</p>
        )}
        {data.custom.map((cs, i) => (
          <ItemCard
            key={cs.id}
            onRemove={() => mutate((d) => { d.custom.splice(i, 1); })}
            onMoveUp={i > 0 ? () => mutate((d) => { d.custom.splice(i - 1, 0, d.custom.splice(i, 1)[0]!); }) : undefined}
            onMoveDown={i < data.custom.length - 1 ? () => mutate((d) => { d.custom.splice(i + 1, 0, d.custom.splice(i, 1)[0]!); }) : undefined}
          >
            {sectionError(`custom:${cs.id}`) && (
              <p className="text-xs font-medium text-destructive">{t("editor.emptySection")}</p>
            )}
            <TextField label={t("editor.fields.sectionTitle")} value={cs.title} placeholder={t("editor.fields.customTitlePlaceholder")} onChange={(v) => mutate((d) => { d.custom[i]!.title = v; })} />
            <BulletsField
              label={t("editor.fields.customItems")}
              value={cs.items.map((it) => it.text)}
              onChange={(lines) => mutate((d) => { d.custom[i]!.items = lines.map((text, idx) => ({ id: cs.items[idx]?.id ?? newId("ci"), text })); })}
            />
          </ItemCard>
        ))}
      </SectionBlock>
    </div>
  );
}
