import { defineConfig } from "@playwright/test";
import base from "./playwright.m16-level0.config";
export default defineConfig({
  ...base,
  testMatch: [...(base.testMatch as string[]), "milestone-16-level-1.spec.ts"],
});
