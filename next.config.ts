import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    typedEnv: true,
  },
  serverExternalPackages: ["@node-rs/argon2", "@react-pdf/renderer"],
};

export default withWorkflow(nextConfig);
