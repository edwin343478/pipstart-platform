import { defineConfig } from "@playwright/test";
import accepted from "./playwright.m18-phase3.config";
export default defineConfig({
  ...accepted,
  testMatch: "milestone-20-calendar.spec.ts",
  webServer: {
    command:
      "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3181",
    url: "http://127.0.0.1:3181",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  outputDir: "test-results/m20",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/m20/results.json" }],
  ],
});
