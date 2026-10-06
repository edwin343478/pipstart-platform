import { createClient } from "@supabase/supabase-js";
import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function localCiEnvironment(status) {
  const values = status.env ?? status;
  const apiUrl = values.API_URL;
  const publishable = values.PUBLISHABLE_KEY || values.ANON_KEY;
  const secret = values.SECRET_KEY || values.SERVICE_ROLE_KEY;
  if (
    ![apiUrl, publishable, secret].every(
      (value) =>
        typeof value === "string" && value.length > 0 && !/[\r\n]/.test(value),
    )
  ) {
    throw new Error("Local Supabase status is missing safe API credentials.");
  }
  let url;
  try {
    url = new URL(apiUrl);
  } catch {
    throw new Error("Invalid local Supabase URL.");
  }
  if (
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.protocol !== "http:" ||
    url.username ||
    url.password ||
    !["", "/"].includes(url.pathname) ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "The normal CI browser gate must use an isolated loopback Supabase instance.",
    );
  }
  return {
    NEXT_PUBLIC_SUPABASE_URL: url.origin,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable,
    SUPABASE_SECRET_KEY: secret,
  };
}

export async function configureCi() {
  if (process.env.GITHUB_ACTIONS !== "true" || !process.env.GITHUB_ENV) {
    throw new Error(
      "This bootstrap is restricted to GitHub Actions; it does not configure your local or remote database.",
    );
  }
  const started = spawnSync("pnpm", ["exec", "supabase", "start"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  // CLI status/start output contains credentials, so never relay it to CI logs.
  if (started.error || started.status !== 0) {
    throw new Error(
      "Isolated CI Supabase failed to start. Check runner Docker availability and the committed Supabase configuration.",
    );
  }
  const status = spawnSync(
    "pnpm",
    ["exec", "supabase", "status", "--output", "json"],
    { encoding: "utf8", maxBuffer: 1024 * 1024 },
  );
  if (status.error || status.status !== 0)
    throw new Error("Could not read isolated CI Supabase status.");
  let parsed;
  try {
    parsed = JSON.parse(status.stdout);
  } catch {
    throw new Error("Supabase status did not return JSON.");
  }
  const environment = localCiEnvironment(parsed);
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
  ]) {
    console.log(`::add-mask::${environment[name].replaceAll("%", "%25")}`);
  }
  const client = createClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SECRET_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(15_000) }),
      },
    },
  );
  const probe = await client.rpc("pipstart_consume_assessment_rate_limit", {
    requested_client_key: "m16-ci-bootstrap",
    requested_limit: 20,
    requested_window_seconds: 60,
  });
  if (probe.error || probe.data !== true)
    throw new Error(
      "The isolated CI database is missing the required assessment rate-limit RPC.",
    );
  appendFileSync(
    process.env.GITHUB_ENV,
    Object.entries(environment)
      .map(([name, value]) => `${name}=${value}\n`)
      .join(""),
  );
  console.log(
    "Isolated local Supabase is ready for production browser grading. No remote database or repository environment file was changed.",
  );
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
)
  await configureCi();
