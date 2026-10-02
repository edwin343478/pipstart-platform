import { defineConfig } from "@playwright/test";
import base from "./playwright.h1.config";

export default defineConfig({
  ...base,
  testMatch: [
    "milestone-15-h1-publication.spec.ts",
    "milestone-15-h2-reading.spec.ts",
  ],
});
