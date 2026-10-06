import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("next"));
nextRequire("@next/env").loadEnvConfig(process.cwd());
const urlValue = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const secret = process.env.SUPABASE_SECRET_KEY?.trim();
if (!urlValue || !publicKey || !secret) {
  throw new Error(
    "The M16 production browser gate needs the app's Supabase URL, publishable key and secret key for anonymous rate limiting. CI supplies an isolated local instance. No tests ran.",
  );
}
let url;
try {
  url = new URL(urlValue);
} catch {
  throw new Error("Invalid Supabase base URL for browser verification.");
}
if (
  !["", "/"].includes(url.pathname) ||
  url.search ||
  url.hash ||
  url.username ||
  url.password ||
  (url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    ))
) {
  throw new Error(
    "Use a Supabase base project URL, without /rest/v1/ or credentials.",
  );
}
const client = createClient(url.origin, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: {
    fetch: (input, init) =>
      fetch(input, { ...init, signal: AbortSignal.timeout(15_000) }),
  },
});
let result;
try {
  result = await client.rpc("pipstart_consume_assessment_rate_limit", {
    requested_client_key: "m16-browser-preflight",
    requested_limit: 20,
    requested_window_seconds: 60,
  });
} catch {
  throw new Error(
    "The configured Supabase instance is unreachable. Start your local instance or check connectivity before browser verification.",
  );
}
if (result.error || result.data !== true) {
  throw new Error(
    "The assessment rate-limit RPC is unavailable or rejected the configured key. No browser tests ran; return this output without keys.",
  );
}
console.log("M16 production browser backend preflight passed.");
