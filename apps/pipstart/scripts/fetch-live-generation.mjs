// M22 MP08b2a build step: when PIPSTART_STORE_FAMILIES switches a content group to the store, read
// the live publication generation through the service-role RPC (MP08a refuses a generation that does
// not match its seal) and write .generated/live-generation.json for this build. With no group
// switched it does nothing (and removes a stale file), so the site reads code. Any failure stops the
// build: the current deployment stays live, and Git is never a silent fallback for a switched group.
// The key is read from the environment and never printed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GROUPS = ["analysis", "curriculum"];
const FILE = path.join(".generated", "live-generation.json");

export function groupsFrom(value) {
  const raw = (value ?? "").trim();
  if (!raw) return [];
  const groups = raw.split(",").map((g) => g.trim());
  if (
    groups.some((g) => !GROUPS.includes(g)) ||
    new Set(groups).size !== groups.length
  )
    throw new Error(`Unknown PIPSTART_STORE_FAMILIES "${raw}"`);
  return groups;
}

/** Fetches and writes the live generation; returns a one-line, secret-free summary. */
export async function fetchLiveGeneration({
  env = process.env,
  cwd = process.cwd(),
  fetchImpl = fetch,
} = {}) {
  const groups = groupsFrom(env.PIPSTART_STORE_FAMILIES);
  const target = path.join(cwd, FILE);
  if (!groups.length) {
    fs.rmSync(target, { force: true });
    return "Live generation: no content group switched to the store; this build reads code.";
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    key = env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key)
    throw new Error(
      "Switched content groups need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY at build time",
    );
  const base = new URL(url);
  if (
    base.protocol !== "https:" &&
    !["127.0.0.1", "localhost"].includes(base.hostname)
  )
    throw new Error("Supabase URL must use HTTPS");
  const response = await fetchImpl(
    new URL("/rest/v1/rpc/pipstart_publication_snapshot", base),
    {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok)
    throw new Error(
      `Live generation read refused (HTTP ${response.status}); the current deployment stays live`,
    );
  const data = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    Object.keys(data).sort().join(",") !==
      "generation,snapshot,snapshot_sha256" ||
    !Number.isSafeInteger(data.generation) ||
    data.generation < 1 ||
    typeof data.snapshot_sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(data.snapshot_sha256) ||
    !data.snapshot ||
    typeof data.snapshot !== "object"
  )
    throw new Error(
      "Live generation reply is malformed; the current deployment stays live",
    );
  const out = {
    format: "pipstart-live-generation",
    generation: data.generation,
    snapshotSha256: data.snapshot_sha256,
    groups,
    fetchedAt: new Date().toISOString(),
    snapshot: JSON.stringify(data.snapshot),
  };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = target + ".partial";
  fs.writeFileSync(temporary, JSON.stringify(out));
  fs.renameSync(temporary, target);
  return `Live generation ${data.generation} (${data.snapshot_sha256.slice(0, 12)}…) written for ${groups.join(", ")}.`;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  fetchLiveGeneration()
    .then((summary) => console.log(summary))
    .catch((error) => {
      console.error(
        error instanceof Error ? error.message : "Live generation read failed",
      );
      process.exitCode = 1;
    });
}
