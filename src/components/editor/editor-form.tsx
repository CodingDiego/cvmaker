"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCvStore, newId } from "@/lib/cv/store";
import { TextField, AreaField, BulletsField } from "./field";

function SectionBlock({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <section className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {onAdd && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="size-3.5" /> Add
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}

function ItemCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex justify-end">
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

  if (!data.header) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <SectionBlock title="Personal details">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Full name" value={data.header.fullName} onChange={(v) => mutate((d) => { d.header.fullName = v; })} />
          <TextField label="Job title" value={data.header.title} onChange={(v) => mutate((d) => { d.header.title = v; })} />
          <TextField label="Email" value={data.header.contact.email} onChange={(v) => mutate((d) => { d.header.contact.email = v; })} />
          <TextField label="Phone" value={data.header.contact.phone} onChange={(v) => mutate((d) => { d.header.contact.phone = v; })} />
          <TextField label="Location" value={data.header.contact.location} onChange={(v) => mutate((d) => { d.header.contact.location = v; })} />
          <TextField label="Website" value={data.header.contact.website} onChange={(v) => mutate((d) => { d.header.contact.website = v; })} />
          <TextField label="LinkedIn" value={data.header.contact.linkedin} onChange={(v) => mutate((d) => { d.header.contact.linkedin = v; })} />
          <TextField label="GitHub" value={data.header.contact.github} onChange={(v) => mutate((d) => { d.header.contact.github = v; })} />
        </div>
      </SectionBlock>

      {/* Summary */}
      <SectionBlock title="Summary">
        <AreaField label="Professional summary" rows={4} value={data.summary} onChange={(v) => mutate((d) => { d.summary = v; })} />
      </SectionBlock>

      {/* Experience */}
      <SectionBlock
        title="Experience"
        onAdd={() => mutate((d) => { d.experience.push({ id: newId("exp"), company: "", role: "", location: "", startDate: "", endDate: "", current: false, bullets: [] }); })}
      >
        {data.experience.map((e, i) => (
          <ItemCard key={e.id} onRemove={() => mutate((d) => { d.experience.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Role" value={e.role} onChange={(v) => mutate((d) => { d.experience[i]!.role = v; })} />
              <TextField label="Company" value={e.company} onChange={(v) => mutate((d) => { d.experience[i]!.company = v; })} />
              <TextField label="Location" value={e.location} onChange={(v) => mutate((d) => { d.experience[i]!.location = v; })} />
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Start" value={e.startDate} onChange={(v) => mutate((d) => { d.experience[i]!.startDate = v; })} />
                <TextField label="End" value={e.endDate} onChange={(v) => mutate((d) => { d.experience[i]!.endDate = v; })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={e.current} onCheckedChange={(c) => mutate((d) => { d.experience[i]!.current = c; })} />
              <Label className="text-xs">I currently work here</Label>
            </div>
            <BulletsField value={e.bullets} onChange={(v) => mutate((d) => { d.experience[i]!.bullets = v; })} />
          </ItemCard>
        ))}
      </SectionBlock>

      {/* Education */}
      <SectionBlock
        title="Education"
        onAdd={() => mutate((d) => { d.education.push({ id: newId("edu"), institution: "", degree: "", field: "", location: "", startDate: "", endDate: "", details: "" }); })}
      >
        {data.education.map((e, i) => (
          <ItemCard key={e.id} onRemove={() => mutate((d) => { d.education.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Institution" value={e.institution} onChange={(v) => mutate((d) => { d.education[i]!.institution = v; })} />
              <TextField label="Degree" value={e.degree} onChange={(v) => mutate((d) => { d.education[i]!.degree = v; })} />
              <TextField label="Field of study" value={e.field} onChange={(v) => mutate((d) => { d.education[i]!.field = v; })} />
              <TextField label="Location" value={e.location} onChange={(v) => mutate((d) => { d.education[i]!.location = v; })} />
              <TextField label="Start" value={e.startDate} onChange={(v) => mutate((d) => { d.education[i]!.startDate = v; })} />
              <TextField label="End" value={e.endDate} onChange={(v) => mutate((d) => { d.education[i]!.endDate = v; })} />
            </div>
            <AreaField label="Details (optional)" rows={2} value={e.details} onChange={(v) => mutate((d) => { d.education[i]!.details = v; })} />
          </ItemCard>
        ))}
      </SectionBlock>

      {/* Skills */}
      <SectionBlock
        title="Skills"
        onAdd={() => mutate((d) => { d.skills.push({ id: newId("sk"), category: "", items: [] }); })}
      >
        {data.skills.map((g, i) => (
          <ItemCard key={g.id} onRemove={() => mutate((d) => { d.skills.splice(i, 1); })}>
            <TextField label="Category" value={g.category} onChange={(v) => mutate((d) => { d.skills[i]!.category = v; })} />
            <AreaField label="Skills (comma separated)" rows={2} value={g.items.join(", ")} onChange={(v) => mutate((d) => { d.skills[i]!.items = v.split(",").map((s) => s.trim()); })} />
          </ItemCard>
        ))}
      </SectionBlock>

      {/* Projects */}
      <SectionBlock
        title="Projects"
        onAdd={() => mutate((d) => { d.projects.push({ id: newId("prj"), name: "", link: "", description: "", bullets: [] }); })}
      >
        {data.projects.map((p, i) => (
          <ItemCard key={p.id} onRemove={() => mutate((d) => { d.projects.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Name" value={p.name} onChange={(v) => mutate((d) => { d.projects[i]!.name = v; })} />
              <TextField label="Link" value={p.link} onChange={(v) => mutate((d) => { d.projects[i]!.link = v; })} />
            </div>
            <AreaField label="Description" rows={2} value={p.description} onChange={(v) => mutate((d) => { d.projects[i]!.description = v; })} />
            <BulletsField value={p.bullets} onChange={(v) => mutate((d) => { d.projects[i]!.bullets = v; })} />
          </ItemCard>
        ))}
      </SectionBlock>

      {/* Certifications */}
      <SectionBlock
        title="Certifications"
        onAdd={() => mutate((d) => { d.certifications.push({ id: newId("cert"), name: "", issuer: "", date: "" }); })}
      >
        {data.certifications.map((c, i) => (
          <ItemCard key={c.id} onRemove={() => mutate((d) => { d.certifications.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField label="Name" value={c.name} onChange={(v) => mutate((d) => { d.certifications[i]!.name = v; })} />
              <TextField label="Issuer" value={c.issuer} onChange={(v) => mutate((d) => { d.certifications[i]!.issuer = v; })} />
              <TextField label="Date" value={c.date} onChange={(v) => mutate((d) => { d.certifications[i]!.date = v; })} />
            </div>
          </ItemCard>
        ))}
      </SectionBlock>

      {/* Languages */}
      <SectionBlock
        title="Languages"
        onAdd={() => mutate((d) => { d.languages.push({ id: newId("lng"), name: "", level: "" }); })}
      >
        {data.languages.map((l, i) => (
          <ItemCard key={l.id} onRemove={() => mutate((d) => { d.languages.splice(i, 1); })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Language" value={l.name} onChange={(v) => mutate((d) => { d.languages[i]!.name = v; })} />
              <TextField label="Level" value={l.level} onChange={(v) => mutate((d) => { d.languages[i]!.level = v; })} />
            </div>
          </ItemCard>
        ))}
      </SectionBlock>
    </div>
  );
}
