import { defineConfig } from "@playwright/test";
import accepted from "./playwright.m18-phase3.config";
import { getM20BrowserMetadata } from "./scripts/m20-browser-metadata.mjs";
export default defineConfig({
  ...accepted,
  metadata: { m20: getM20BrowserMetadata(process.cwd()) },
  use: { ...accepted.use, screenshot: "only-on-failure" },
  testMatch: "milestone-20-calendar.spec.ts",
  webServer: {
    command:
      "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3181",
    url: "http://127.0.0.1:3181",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  outputDir: "test-results/m20/artifacts",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/m20", open: "never" }],
    ["json", { outputFile: "test-results/m20/results.json" }],
  ],
});
