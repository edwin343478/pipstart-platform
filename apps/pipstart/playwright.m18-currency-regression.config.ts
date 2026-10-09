import { defineConfig } from "@playwright/test";
import accepted from "./playwright.m18-phase3.config";

// Keep prior acceptance intact, adding only the currency-zero regression cases.
export default defineConfig({
  ...accepted,
  testMatch: [
    "milestone-18-phase1.spec.ts",
    "milestone-18-phase2.spec.ts",
    "milestone-18-phase3.spec.ts",
    "milestone-18-currency-regression.spec.ts",
  ],
  outputDir: "test-results/m18-currency-regression",
  reporter: [
    ["list"],
    [
      "json",
      { outputFile: "test-results/m18-currency-regression/results.json" },
    ],
  ],
});
