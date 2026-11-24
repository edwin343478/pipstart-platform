import { defineConfig } from "@playwright/test";
import base from "./playwright.h1.config";

// M24 audit C02: public regression checks against the production build
// (`next build --webpack` first, then `next start` on its own port).
export default defineConfig({
  ...base,
  testMatch: "milestone-24-c02-public-regression.spec.ts",
  use: { ...base.use, baseURL: "http://127.0.0.1:3124" },
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3124",
    url: "http://127.0.0.1:3124",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
