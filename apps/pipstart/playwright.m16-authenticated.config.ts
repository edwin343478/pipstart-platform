import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: "milestone-16-h3-authenticated-crypto.spec.ts",
  timeout: 180_000,
  workers: 1,
  retries: 0,
  outputDir: "test-results/m16-authenticated",
  // Traces and screenshots could retain disposable login credentials.
  use: {
    ...base.use,
    baseURL: "http://127.0.0.1:3102",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3102",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.PIPSTART_M13_SUPABASE_URL ?? "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY ?? "",
      SUPABASE_SECRET_KEY: process.env.PIPSTART_M13_SUPABASE_SECRET_KEY ?? "",
    },
    url: "http://127.0.0.1:3102",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
