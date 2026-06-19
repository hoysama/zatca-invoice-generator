import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages compatible
  transpilePackages: ["next"],
};

export default nextConfig;
