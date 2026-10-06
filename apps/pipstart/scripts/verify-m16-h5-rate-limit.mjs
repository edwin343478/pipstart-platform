import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("next"));
nextRequire("@next/env").loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secret = process.env.SUPABASE_SECRET_KEY?.trim();
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
if (!url || !secret || !publicKey)
  throw new Error(
    "H5 rate-limit verification requires the existing Supabase configuration. No keys are printed.",
  );
const options = {
  auth: { autoRefreshToken: false, persistSession: false },
  global: {
    fetch: (input, init) =>
      fetch(input, { ...init, signal: AbortSignal.timeout(15000) }),
  },
};
const admin = createClient(url, secret, options);
const anonymous = createClient(url, publicKey, options);
const params = {
  requested_client_key: `m16-h5-verification-${randomUUID()}`,
  requested_limit: 20,
  // A daily test-only bucket prevents an ordinary minute boundary resetting
  // the concurrent test. Application submissions still use a 60-second window.
  requested_window_seconds: 86400,
};
try {
  const results = await Promise.all(
    Array.from({ length: 25 }, () =>
      admin.rpc("pipstart_consume_assessment_rate_limit", params),
    ),
  );
  if (
    results.some(
      (result) => result.error || typeof result.data !== "boolean",
    ) ||
    results.filter((result) => result.data === true).length !== 20 ||
    results.filter((result) => result.data === false).length !== 5
  ) {
    throw new Error("Concurrent database budget verification failed.");
  }
  const denied = await anonymous.rpc(
    "pipstart_consume_assessment_rate_limit",
    params,
  );
  if (!denied.error || denied.data === true)
    throw new Error("Anonymous direct RPC access was not denied.");
} catch {
  throw new Error(
    "H5 database rate-limit verification failed. Return the output without keys. No learning records or database schema were changed.",
  );
}
console.log(
  "H5 shared rate limiter passed: exactly 20/25 concurrent requests allowed; direct anonymous RPC denied. Test bucket expires through existing cleanup.",
);
