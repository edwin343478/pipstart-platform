import { defineConfig } from "@playwright/test";
import base from "./playwright.h2.config";

export default defineConfig({
  ...base,
  testMatch: [
    "milestone-15-h1-publication.spec.ts",
    "milestone-15-h2-reading.spec.ts",
    "milestone-15-h3-full-reading.spec.ts",
  ],
});
