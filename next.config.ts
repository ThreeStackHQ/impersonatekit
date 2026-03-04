import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@impersonatekit/db"],
  serverExternalPackages: ["bcrypt"],
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
