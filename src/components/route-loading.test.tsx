import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RouteLoading } from "./route-loading";

describe("RouteLoading", () => {
  test("provides immediate accessible feedback during navigation", () => {
    const html = renderToStaticMarkup(<RouteLoading />);

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status"');
  });
});
