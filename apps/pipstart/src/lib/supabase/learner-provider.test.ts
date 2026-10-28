import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.create }));
import {
  createLearnerProviderClient,
  learnerProviderConfigured,
} from "./learner-provider";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  vi.stubEnv("PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "sb_publishable_owned_test",
  );
  vi.stubEnv("PIPSTART_M22_ACCOUNT_PROVIDER_SECRET_KEY", "");
  vi.stubEnv("SUPABASE_SECRET_KEY", "shared-secret-must-not-be-used");
});
afterEach(() => vi.unstubAllEnvs());
describe("dedicated learner provider client", () => {
  it("never substitutes the shared administration key", () => {
    expect(learnerProviderConfigured()).toBe(false);
    expect(createLearnerProviderClient()).toBeNull();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("requires both flags and uses only the dedicated server key", () => {
    vi.stubEnv(
      "PIPSTART_M22_ACCOUNT_PROVIDER_SECRET_KEY",
      "dedicated-owned-test-key",
    );
    vi.stubEnv("PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED", "false");
    expect(createLearnerProviderClient()).toBeNull();
    vi.stubEnv("PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED", "true");
    expect(learnerProviderConfigured()).toBe(true);
    createLearnerProviderClient();
    expect(mocks.create).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "dedicated-owned-test-key",
      expect.objectContaining({
        auth: { autoRefreshToken: false, persistSession: false },
      }),
    );
  });
});
