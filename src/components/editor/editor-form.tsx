"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ImageUp, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const PHOTO_POSITIONS = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
] as const;

function PhotoField() {
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
          <Image src={photo} alt="Profile" fill sizes="64px" unoptimized className="object-cover" />
        ) : (
          <User className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <ImageUp className="size-3.5" /> {photo ? "Replace photo" : "Add photo"}
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
              <SelectTrigger className="h-9 w-32" aria-label="Photo position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHOTO_POSITIONS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
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
              <Trash2 className="size-3.5" /> Remove
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  hint,
  children,
  onAdd,
  addLabel = "Add",
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {onAdd && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="size-3.5" /> {addLabel}
          </Button>
        )}
      </div>
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
  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex justify-end gap-0.5">
        {onMoveUp && (
          <Button size="icon-xs" variant="ghost" aria-label="Move up" onClick={onMoveUp}>
            <ChevronUp className="size-3.5" />
          </Button>
        )}
        {onMoveDown && (
          <Button size="icon-xs" variant="ghost" aria-label="Move down" onClick={onMoveDown}>
            <ChevronDown className="size-3.5" />
          </Button>
        )}
        <Button size="icon-xs" variant="ghost" aria-label="Remove" onClick={onRemove}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      {children}
    </div>
  );
}

export function EditorForm() {
  const data = useCvStore((s) => s.data);
  const mutate = useCvStore((s) => s.mutate);
  const ph = usePlaceholders();

  if (!data.header) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <SectionBlock title="Personal details">
        <PhotoField />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Full name" placeholder={ph.header.fullName} value={data.header.fullName} onChange={(v) => mutate((d) => { d.header.fullName = v; })} />
          <TextField label="Job title" placeholder={ph.header.title} value={data.header.title} onChange={(v) => mutate((d) => { d.header.title = v; })} />
          <TextField label="Email" type="email" placeholder={ph.header.contact.email} value={data.header.contact.email} onChange={(v) => mutate((d) => { d.header.contact.email = v; })} />
          <TextField label="Phone" placeholder={ph.header.contact.phone} value={data.header.contact.phone} onChange={(v) => mutate((d) => { d.header.contact.phone = v; })} />
          <TextField label="Location" placeholder={ph.header.contact.location} value={data.header.contact.location} onChange={(v) => mutate((d) => { d.header.contact.location = v; })} />
          <LinkField label="Website" placeholder={ph.header.contact.website} value={data.header.contact.website} onChange={(v) => mutate((d) => { d.header.contact.website = v; })} />
          <LinkField label="LinkedIn" value={data.header.contact.linkedin} placeholder={ph.header.contact.linkedin} onChange={(v) => mutate((d) => { d.header.contact.linkedin = v; })} />
          <LinkField label="GitHub" value={data.header.contact.github} placeholder={ph.header.contact.github} onChange={(v) => mutate((d) => { d.header.contact.github = v; })} />
        </div>
      </SectionBlock>

      {/* Summary */}
      <SectionBlock title="Summary">
        <AreaField label="Professional summary" rows={4} placeholder={ph.summary} value={data.summary} onChange={(v) => mutate((d) => { d.summary = v; })} />
      </SectionBlock>

      {/* Experience */}
      <SectionBlock
        title="Experience"
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
              <TextField label="Role" placeholder={p?.role} value={e.role} onChange={(v) => mutate((d) => { d.experience[i]!.role = v; })} />
              <TextField label="Company" placeholder={p?.company} value={e.company} onChange={(v) => mutate((d) => { d.experience[i]!.company = v; })} />
              <TextField label="Location" placeholder={p?.location} value={e.location} onChange={(v) => mutate((d) => { d.experience[i]!.location = v; })} />
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Start" placeholder={p?.startDate} value={e.startDate} onChange={(v) => mutate((d) => { d.experience[i]!.startDate = v; })} />
                <TextField label="End" placeholder={p?.endDate} value={e.endDate} onChange={(v) => mutate((d) => { d.experience[i]!.endDate = v; })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={e.current} onCheckedChange={(c) => mutate((d) => { d.experience[i]!.current = c; })} />
              <Label className="text-xs">I currently work here</Label>
            </div>
            <BulletsField placeholder={p?.bullets.join("\n")} value={e.bullets} onChange={(v) => mutate((d) => { d.experience[i]!.bullets = v; })} />
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Education */}
      <SectionBlock
        title="Education"
        onAdd={() => mutate((d) => { d.education.push({ id: newId("edu"), institution: "", degree: "", field: "", location: "", startDate: "", endDate: "", details: "" }); })}
      >
        {data.education.map((e, i) => {
          const p = ph.education.get(e.id);
          return (
          <ItemCard key={e.id} onRemove={() => mutate((d) => { d.education.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Institution" placeholder={p?.institution} value={e.institution} onChange={(v) => mutate((d) => { d.education[i]!.institution = v; })} />
              <TextField label="Degree" placeholder={p?.degree} value={e.degree} onChange={(v) => mutate((d) => { d.education[i]!.degree = v; })} />
              <TextField label="Field of study" placeholder={p?.field} value={e.field} onChange={(v) => mutate((d) => { d.education[i]!.field = v; })} />
              <TextField label="Location" placeholder={p?.location} value={e.location} onChange={(v) => mutate((d) => { d.education[i]!.location = v; })} />
              <TextField label="Start" placeholder={p?.startDate} value={e.startDate} onChange={(v) => mutate((d) => { d.education[i]!.startDate = v; })} />
              <TextField label="End" placeholder={p?.endDate} value={e.endDate} onChange={(v) => mutate((d) => { d.education[i]!.endDate = v; })} />
            </div>
            <AreaField label="Details (optional)" rows={2} value={e.details} onChange={(v) => mutate((d) => { d.education[i]!.details = v; })} />
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Skills */}
      <SectionBlock
        title="Skills"
        onAdd={() => mutate((d) => { d.skills.push({ id: newId("sk"), category: "", items: [] }); })}
      >
        {data.skills.map((g, i) => {
          const p = ph.skills.get(g.id);
          return (
          <ItemCard key={g.id} onRemove={() => mutate((d) => { d.skills.splice(i, 1); })}>
            <TextField label="Category" placeholder={p?.category} value={g.category} onChange={(v) => mutate((d) => { d.skills[i]!.category = v; })} />
            <AreaField label="Skills (comma separated)" rows={2} placeholder={p?.items.join(", ")} value={g.items.join(", ")} onChange={(v) => mutate((d) => { d.skills[i]!.items = v.split(",").map((s) => s.trim()); })} />
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Projects */}
      <SectionBlock
        title="Projects"
        onAdd={() => mutate((d) => { d.projects.push({ id: newId("prj"), name: "", link: "", description: "", bullets: [] }); })}
      >
        {data.projects.map((p, i) => {
          const ex = ph.projects.get(p.id);
          return (
          <ItemCard key={p.id} onRemove={() => mutate((d) => { d.projects.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Name" placeholder={ex?.name} value={p.name} onChange={(v) => mutate((d) => { d.projects[i]!.name = v; })} />
              <LinkField label="Link" placeholder={ex?.link} value={p.link} onChange={(v) => mutate((d) => { d.projects[i]!.link = v; })} />
            </div>
            <AreaField label="Description" rows={2} placeholder={ex?.description} value={p.description} onChange={(v) => mutate((d) => { d.projects[i]!.description = v; })} />
            <BulletsField placeholder={ex?.bullets.join("\n")} value={p.bullets} onChange={(v) => mutate((d) => { d.projects[i]!.bullets = v; })} />
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Certifications */}
      <SectionBlock
        title="Certifications"
        onAdd={() => mutate((d) => { d.certifications.push({ id: newId("cert"), name: "", issuer: "", date: "", url: "" }); })}
      >
        {data.certifications.map((c, i) => {
          const p = ph.certifications.get(c.id);
          return (
          <ItemCard key={c.id} onRemove={() => mutate((d) => { d.certifications.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField label="Name" placeholder={p?.name} value={c.name} onChange={(v) => mutate((d) => { d.certifications[i]!.name = v; })} />
              <TextField label="Issuer" placeholder={p?.issuer} value={c.issuer} onChange={(v) => mutate((d) => { d.certifications[i]!.issuer = v; })} />
              <TextField label="Date" placeholder={p?.date} value={c.date} onChange={(v) => mutate((d) => { d.certifications[i]!.date = v; })} />
            </div>
            <LinkField label="Credential link (optional)" value={c.url} placeholder={p?.url ?? "credly.com/badges/…"} onChange={(v) => mutate((d) => { d.certifications[i]!.url = v; })} />
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Languages */}
      <SectionBlock
        title="Languages"
        onAdd={() => mutate((d) => { d.languages.push({ id: newId("lng"), name: "", level: "" }); })}
      >
        {data.languages.map((l, i) => {
          const p = ph.languages.get(l.id);
          return (
          <ItemCard key={l.id} onRemove={() => mutate((d) => { d.languages.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Language" placeholder={p?.name} value={l.name} onChange={(v) => mutate((d) => { d.languages[i]!.name = v; })} />
              <TextField label="Level" placeholder={p?.level} value={l.level} onChange={(v) => mutate((d) => { d.languages[i]!.level = v; })} />
            </div>
          </ItemCard>
          );
        })}
      </SectionBlock>

      {/* Custom sections — user-defined, reorderable */}
      <SectionBlock
        title="Custom sections"
        hint="Add your own sections (e.g. Awards, Publications) and reorder them. They render after the built-in sections."
        addLabel="Add section"
        onAdd={() => mutate((d) => { d.custom.push({ id: newId("cs"), title: "", items: [{ id: newId("ci"), text: "" }] }); })}
      >
        {data.custom.length === 0 && (
          <p className="text-sm text-muted-foreground">No custom sections yet.</p>
        )}
        {data.custom.map((cs, i) => (
          <ItemCard
            key={cs.id}
            onRemove={() => mutate((d) => { d.custom.splice(i, 1); })}
            onMoveUp={i > 0 ? () => mutate((d) => { d.custom.splice(i - 1, 0, d.custom.splice(i, 1)[0]!); }) : undefined}
            onMoveDown={i < data.custom.length - 1 ? () => mutate((d) => { d.custom.splice(i + 1, 0, d.custom.splice(i, 1)[0]!); }) : undefined}
          >
            <TextField label="Section title" value={cs.title} placeholder="Awards" onChange={(v) => mutate((d) => { d.custom[i]!.title = v; })} />
            <BulletsField
              label="Items (one per line)"
              value={cs.items.map((it) => it.text)}
              onChange={(lines) => mutate((d) => { d.custom[i]!.items = lines.map((text, idx) => ({ id: cs.items[idx]?.id ?? newId("ci"), text })); })}
            />
          </ItemCard>
        ))}
      </SectionBlock>
    </div>
  );
}
