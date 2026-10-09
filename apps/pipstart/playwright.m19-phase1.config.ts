import { defineConfig } from "@playwright/test";
import accepted from "./playwright.m18-phase3.config";
export default defineConfig({
  ...accepted,
  testMatch: "milestone-19-phase1.spec.ts",
  outputDir: "test-results/m19-phase1",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/m19-phase1/results.json" }],
  ],
});
