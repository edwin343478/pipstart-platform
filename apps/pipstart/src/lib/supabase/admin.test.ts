import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ rpc: vi.fn() })),
}));
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "./admin";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
function configure() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://generated.supabase.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "generated-public");
  vi.stubEnv("SUPABASE_SECRET_KEY", "generated-secret");
}
it("keeps existing no-argument admin clients unchanged", () => {
  configure();
  createSupabaseAdminClient();
  expect(createClient).toHaveBeenCalledWith(
    "https://generated.supabase.test",
    "generated-secret",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
});
it("wires the opt-in fetch into the actual SDK factory options", () => {
  configure();
  const send = vi.fn<typeof fetch>();
  createSupabaseAdminClient({ fetch: send });
  expect(createClient).toHaveBeenCalledWith(
    "https://generated.supabase.test",
    "generated-secret",
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { fetch: send },
    },
  );
});
it("does not construct a client when configuration is absent", () => {
  vi.stubEnv("SUPABASE_SECRET_KEY", "");
  expect(
    createSupabaseAdminClient({ fetch: vi.fn<typeof fetch>() }),
  ).toBeNull();
  expect(createClient).not.toHaveBeenCalled();
});
