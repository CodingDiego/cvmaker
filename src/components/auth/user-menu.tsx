"use client";

import { Link } from "@/components/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/auth/actions";

function initials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function UserMenu({
  name,
  email,
  avatarUrl,
}: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu" />
        }
      >
        <Avatar className="size-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? email} />}
          <AvatarFallback>{initials(name, email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            <div className="font-medium">{name ?? "Account"}</div>
            <div className="text-xs text-muted-foreground truncate">{email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard className="size-4" /> Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/security" />}>
          <ShieldCheck className="size-4" /> Security & 2FA
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/account" />}>
          <Settings className="size-4" /> Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleLogout(); }}>
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
