import { defineConfig } from "@playwright/test";
import cumulative from "./playwright.m16-level10.config";

// Includes all eleven approved Crypto suites and the existing M15 hardening suites.
// The inherited server uses next start on port 3101, never a development server.
export default defineConfig({
  ...cumulative,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  testMatch: [
    ...(cumulative.testMatch as string[]),
    "milestone-16-h3-published-routes.spec.ts",
    "milestone-16-h5-runtime-security.spec.ts",
  ],
  outputDir: "test-results/m16",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/m16", open: "never" }],
    ["json", { outputFile: "test-results/m16/results.json" }],
  ],
});
