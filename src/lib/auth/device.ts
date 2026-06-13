import "server-only";
import { UAParser } from "ua-parser-js";
import { env } from "@/lib/env";

export type SessionEnv = "prod" | "preview" | "local";

export interface RequestContext {
  ip: string;
  userAgent: string;
  deviceLabel: string;
  environment: SessionEnv;
}

const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1", "localhost", ""]);

/** Minimal header accessor — works for both Headers and Next's ReadonlyHeaders. */
type HeaderLike = { get(name: string): string | null };

function extractIp(headers: HeaderLike): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() ?? "";
}

function describeDevice(uaString: string): string {
  if (!uaString) return "Unknown device";
  const ua = UAParser(uaString);
  const browser = ua.browser.name ?? "Unknown browser";
  const os = ua.os.name ? ` on ${ua.os.name}` : "";
  return `${browser}${os}`;
}

/**
 * Classify the session environment. Local dev / localhost sessions are tagged
 * `local` so the dashboard can dedupe them (one logical dev session) instead of
 * stacking a new row on every hot reload.
 */
function classifyEnv(ip: string, host: string | null): SessionEnv {
  const vEnv = env.vercelEnv();
  if (vEnv === "production") return "prod";
  if (vEnv === "preview") return "preview";

  const isLoopback = LOOPBACK.has(ip);
  const isLocalHost = !!host && (host.startsWith("localhost") || host.startsWith("127.0.0.1"));
  if (vEnv === "development" || isLoopback || isLocalHost || !env.isProd()) {
    return "local";
  }
  return "prod";
}

export function describeRequest(headers: HeaderLike): RequestContext {
  const ip = extractIp(headers);
  const userAgent = headers.get("user-agent") ?? "";
  return {
    ip: ip || "unknown",
    userAgent,
    deviceLabel: describeDevice(userAgent),
    environment: classifyEnv(ip, headers.get("host")),
  };
}
