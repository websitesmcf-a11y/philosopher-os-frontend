import type { NextConfig } from "next";

const RAILWAY_URL = "https://web-production-a93f0.up.railway.app";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${RAILWAY_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
