"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteCvAction, renameCvAction } from "@/lib/cv/actions";
import { TEMPLATE_LABELS } from "@/templates/registry";

export function CvCard({
  id,
  title,
  templateId,
  updatedAt,
}: {
  id: string;
  title: string;
  templateId: string;
  updatedAt: string;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(title);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/editor/${id}`} className="block">
        <div className="flex aspect-[1/1.1] items-center justify-center border-b bg-muted/40">
          <FileText className="size-12 text-muted-foreground/40" />
        </div>
      </Link>
      <CardContent className="pt-4">
        {renaming ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setRenaming(false);
              startTransition(() => void renameCvAction(id, name));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
        ) : (
          <div className="truncate font-medium">{title}</div>
        )}
        <div className="mt-1 text-xs text-muted-foreground capitalize">
          {TEMPLATE_LABELS[templateId] ?? templateId}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(updatedAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href={`/editor/${id}`} />}>
            <Pencil className="size-3.5" /> Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="More actions" />}
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setRenaming(true)}>
                <Pencil className="size-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={pending}
                onSelect={() => startTransition(() => void deleteCvAction(id))}
              >
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
