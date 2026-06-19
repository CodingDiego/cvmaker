import "server-only";
import type { DesignRenderer } from "@/templates/designs/types";
import { FREE_RENDERERS } from "@/templates/designs/renderers";
import { PREMIUM_RENDERERS } from "@premium/render";

/**
 * Server-only lookup of a design's export renderers (free + premium overlay),
 * falling back to the default design for retired/unknown template ids.
 */
const MAP = new Map<string, DesignRenderer>(
  [...FREE_RENDERERS, ...PREMIUM_RENDERERS].map((r) => [r.id, r]),
);

export function rendererFor(id: string): DesignRenderer {
  return MAP.get(id) ?? MAP.get("clasico-ats") ?? [...MAP.values()][0]!;
}
