import { defineConfig } from "@playwright/test";
import base from "./playwright.m16-level7.config";
export default defineConfig({
  ...base,
  timeout: 90_000,
  testMatch: [...(base.testMatch as string[]), "milestone-16-level-8.spec.ts"],
});
