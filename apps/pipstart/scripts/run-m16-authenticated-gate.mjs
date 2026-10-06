import { spawnSync } from "node:child_process";

const names = [
  "PIPSTART_M13_SUPABASE_URL",
  "PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY",
  "PIPSTART_M13_SUPABASE_SECRET_KEY",
];
const values = names.map((name) => process.env[name]?.trim() ?? "");
if (values.some((value) => !value)) {
  throw new Error(
    "M16 authenticated gate requires all three PIPSTART_M13_SUPABASE_* values. No tests were run.",
  );
}
let url;
try {
  url = new URL(values[0]);
} catch {
  throw new Error(
    "Use the remote Supabase base project URL, without /rest/v1/ or credentials.",
  );
}
if (
  url.protocol !== "https:" ||
  ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) ||
  !["", "/"].includes(url.pathname) ||
  url.search ||
  url.hash ||
  url.username ||
  url.password
) {
  throw new Error(
    "Use the remote Supabase base project URL, without /rest/v1/ or credentials.",
  );
}
// NEXT_PUBLIC_* values must be set while building, as well as when serving.
// Keys stay in the child-process environment; no .env files are written.
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: url.origin,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: values[1],
  SUPABASE_SECRET_KEY: values[2],
};
for (const args of [
  ["exec", "next", "build", "--webpack"],
  ["verify:public-bundles"],
  [
    "exec",
    "playwright",
    "test",
    "--config=playwright.m16-authenticated.config.ts",
  ],
]) {
  const result = spawnSync("pnpm", args, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
