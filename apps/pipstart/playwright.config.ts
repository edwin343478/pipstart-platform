import { defineConfig, devices } from "@playwright/test";

const remoteAssessmentEnvironment: Record<string, string> = {};
const remoteUrl = process.env.PIPSTART_M13_SUPABASE_URL;
const remotePublishableKey = process.env.PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY;
const remoteSecretKey = process.env.PIPSTART_M13_SUPABASE_SECRET_KEY;
if (remoteUrl && remotePublishableKey && remoteSecretKey) {
  remoteAssessmentEnvironment.NEXT_PUBLIC_SUPABASE_URL = remoteUrl;
  remoteAssessmentEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
    remotePublishableKey;
  remoteAssessmentEnvironment.SUPABASE_SECRET_KEY = remoteSecretKey;
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3100",
    env: remoteAssessmentEnvironment,
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
