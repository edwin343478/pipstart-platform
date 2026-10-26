import { defineConfig } from "@playwright/test";

// Milestone 22 MP01: the administrator-only design preview.
// Anonymous gate tests always run. The signed-in screen tests run only when
// PIPSTART_M22_ADMIN_EMAIL and PIPSTART_M22_ADMIN_PASSWORD name a disposable
// administrator in the Supabase project given by the PIPSTART_M13_* variables.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "milestone-22-mp01-preview.spec.ts",
  timeout: 180_000,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  outputDir: "test-results/m22-mp01",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/m22-mp01/results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3220",
    // Traces and screenshots could retain disposable login credentials.
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { browserName: "chromium", viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile-chromium",
      use: { browserName: "chromium", viewport: { width: 390, height: 900 } },
    },
    {
      name: "narrow-chromium",
      use: { browserName: "chromium", viewport: { width: 320, height: 900 } },
    },
  ],
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3220",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.PIPSTART_M13_SUPABASE_URL ?? "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY ?? "",
      SUPABASE_SECRET_KEY: process.env.PIPSTART_M13_SUPABASE_SECRET_KEY ?? "",
    },
    url: "http://127.0.0.1:3220",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
