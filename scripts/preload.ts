import { plugin } from "bun";

// Neutralize Next's server-only / client-only markers when running plain scripts.
plugin({
  name: "neutralize-only-markers",
  setup(build) {
    build.module("server-only", () => ({ exports: {}, loader: "object" }));
    build.module("client-only", () => ({ exports: {}, loader: "object" }));
  },
});
