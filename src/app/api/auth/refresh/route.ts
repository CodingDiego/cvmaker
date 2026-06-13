import { NextResponse, type NextRequest } from "next/server";
import { refreshSession } from "@/lib/auth/service";
import { describeRequest } from "@/lib/auth/device";
import { limiters } from "@/lib/redis";

function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  // Only allow same-origin relative paths.
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

// GET: invoked by the edge proxy on a redirect — rotate then bounce back.
export async function GET(request: NextRequest) {
  const ctx = describeRequest(request.headers);
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  await limiters.refresh.limit(ctx.ip);
  const ok = await refreshSession(ctx);

  if (ok) return NextResponse.redirect(new URL(next, request.url));
  return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, request.url));
}

// POST: client-driven silent refresh.
export async function POST(request: NextRequest) {
  const ctx = describeRequest(request.headers);
  const { success } = await limiters.refresh.limit(ctx.ip);
  if (!success) return NextResponse.json({ ok: false }, { status: 429 });

  const ok = await refreshSession(ctx);
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
