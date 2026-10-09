import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "milestone-18-phase1.spec.ts",
  timeout: 45_000,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  outputDir: "test-results/m18-phase1",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/m18-phase1/results.json" }],
  ],
  use: { baseURL: "http://127.0.0.1:3181", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop-chromium",
      use: { browserName: "chromium", viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile-chromium",
      use: { browserName: "chromium", viewport: { width: 390, height: 900 } },
    },
  ],
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3181",
    url: "http://127.0.0.1:3181",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
