"use client";

import { ExternalLink, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function hrefFor(v: string) {
  const t = v.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

/** A URL field: link icon, monospace value, and a button to open it in a tab. */
export function LinkField({
  label,
  value,
  onChange,
  placeholder = "example.com/you",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <Link2 className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="url"
          inputMode="url"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="pr-8 pl-8 font-mono text-[0.8rem]"
        />
        {value.trim() && (
          <a
            href={hrefFor(value)}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Open link"
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Bullets editor: one line per bullet. */
export function BulletsField({
  label = "Bullet points (one per line)",
  value,
  onChange,
  placeholder = "Delivered X by doing Y\nReduced Z by N%",
}: {
  label?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <AreaField
      label={label}
      rows={4}
      value={value.join("\n")}
      onChange={(v) => onChange(v.split("\n"))}
      placeholder={placeholder}
    />
  );
}
