import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep a running dev server isolated from `next build`, which otherwise
  // replaces `.next` and can leave Fast Refresh with a stale router runtime.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
