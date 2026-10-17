import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@dashroute/ui", "@dashroute/ui-tokens"],
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
};

export default nextConfig;
