import { defineConfig } from "@playwright/test";
import {
  getM17BrowserMetadata,
  m17ReviewMode,
} from "./scripts/m17-browser-metadata.mjs";
// A production-only server and a separate port preserve the approved M15/M16 configurations.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "milestone-17-glossary.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 120_000,
  expect: { timeout: 10_000 },
  metadata: { m17: getM17BrowserMetadata(process.cwd()) },
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: m17ReviewMode
          ? "playwright-report/m17-review"
          : "playwright-report/m17",
        open: "never",
      },
    ],
    [
      "json",
      {
        outputFile: m17ReviewMode
          ? "test-results/m17-review/results.json"
          : "test-results/m17/results.json",
      },
    ],
  ],
  outputDir: m17ReviewMode
    ? "test-results/m17-review/artifacts"
    : "test-results/m17/artifacts",
  use: {
    baseURL: "http://127.0.0.1:3102",
    browserName: "chromium",
    channel: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "small-mobile",
      use: {
        viewport: { width: 320, height: 900 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3102",
    url: "http://127.0.0.1:3102/glossary",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
