import Link from "next/link";
import { FileText } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="size-5 text-primary" />
          <span>CVMaker</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm sm:flex">
          <Button variant="ghost" size="sm" render={<Link href="/templates" />}>
            Templates
          </Button>
          {user && (
            <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
