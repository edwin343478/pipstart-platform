import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/legal/risk-disclaimer",
        destination: "/legal/risk-disclosure",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
