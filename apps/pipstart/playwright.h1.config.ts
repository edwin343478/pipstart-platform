import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: "milestone-15-h1-publication.spec.ts",
  use: { ...base.use, baseURL: "http://127.0.0.1:3101" },
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3101",
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
