import type { NextConfig } from "next";
import createMDX from "@next/mdx";

import { createContentSecurityPolicy } from "./src/lib/security-policy";

const contentSecurityPolicy = createContentSecurityPolicy(
  process.env.NODE_ENV === "development",
  process.env.NEXT_PUBLIC_SITE_URL,
);

export const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
] as const;

// Later route-specific CSP overrides the global value only on this route.
export const economicCalendarSecurityHeaders = securityHeaders.map((header) =>
  header.key === "Content-Security-Policy"
    ? {
        key: header.key,
        value: createContentSecurityPolicy(
          process.env.NODE_ENV === "development",
          process.env.NEXT_PUBLIC_SITE_URL,
          true,
        ),
      }
    : header,
);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  poweredByHeader: false,
  typescript: {
    tsconfigPath:
      process.env.NODE_ENV === "development"
        ? "tsconfig.json"
        : "tsconfig.production.json",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...securityHeaders],
      },
      {
        source: "/economic-calendar/:path*",
        headers: economicCalendarSecurityHeaders,
      },
    ];
  },
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

export default createMDX({ extension: /\.mdx?$/ })(nextConfig);
