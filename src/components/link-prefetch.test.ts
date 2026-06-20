import { describe, expect, test } from "bun:test";
import { resolveLinkPrefetch } from "./link-prefetch";

describe("resolveLinkPrefetch", () => {
  test("preserves Next.js automatic prefetching by default", () => {
    expect(resolveLinkPrefetch(undefined)).toBeUndefined();
  });

  test("allows callers to explicitly disable prefetching", () => {
    expect(resolveLinkPrefetch(false)).toBe(false);
  });
});
