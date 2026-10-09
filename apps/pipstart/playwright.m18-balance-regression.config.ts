import { defineConfig } from "@playwright/test";
import accepted from "./playwright.m18-currency-regression.config";
export default defineConfig({
  ...accepted,
  testMatch: [
    ...(accepted.testMatch as string[]),
    "milestone-18-balance-regression.spec.ts",
  ],
  outputDir: "test-results/m18-balance-regression",
  reporter: [
    ["list"],
    [
      "json",
      { outputFile: "test-results/m18-balance-regression/results.json" },
    ],
  ],
});
