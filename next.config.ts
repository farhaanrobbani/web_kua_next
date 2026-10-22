import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1", "server-farhan", "192.168.1.3"],
  serverExternalPackages: ["puppeteer-core"],
  turbopack: {
    root: path.dirname(new URL(import.meta.url).pathname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
