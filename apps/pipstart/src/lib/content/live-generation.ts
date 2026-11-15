// M22 MP08b2a: the live publication generation a production build is made from. The build step
// (scripts/fetch-live-generation.mjs) reads it through the service-role RPC (MP08a), which refuses a
// generation that does not match its seal, and writes it here. The site reads it once per server.
// Which content groups read it is PIPSTART_STORE_FAMILIES: empty (default) means code everywhere.
import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Content groups that switch together: analysis posts, the curriculum with its quizzes, and the
 * partner directory with its links (MP09b). */
export const STORE_GROUPS = ["analysis", "curriculum", "partners"] as const;
export type StoreGroup = (typeof STORE_GROUPS)[number];
export const LIVE_GENERATION_FILE = join(".generated", "live-generation.json");
export const LIVE_GENERATION_FORMAT = "pipstart-live-generation";

/** The switched groups; anything other than a list of known groups is refused. */
export function storeGroups(value: string | undefined): StoreGroup[] {
  const raw = (value ?? "").trim();
  if (!raw) return [];
  const groups = raw.split(",").map((g) => g.trim());
  if (
    groups.some((g) => !(STORE_GROUPS as readonly string[]).includes(g)) ||
    new Set(groups).size !== groups.length
  )
    throw new Error(`Unknown PIPSTART_STORE_FAMILIES "${raw}"`);
  return groups as StoreGroup[];
}

export type LiveGeneration = {
  generation: number;
  snapshotSha256: string;
  groups: StoreGroup[];
  fetchedAt: string;
  /** The generation's public snapshot text (format 2), verified again by the content loader. */
  snapshot: string;
};

const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** Parses the build file exactly; any defect refuses it, so the build or server fails closed. */
export function parseLiveGeneration(
  text: string,
  expected: StoreGroup[],
): LiveGeneration {
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    throw new Error("Live generation file is not valid JSON");
  }
  if (
    !object(v) ||
    Object.keys(v).sort().join(",") !==
      "fetchedAt,format,generation,groups,snapshot,snapshotSha256" ||
    v.format !== LIVE_GENERATION_FORMAT ||
    typeof v.generation !== "number" ||
    !Number.isSafeInteger(v.generation) ||
    v.generation < 1 ||
    typeof v.snapshotSha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(v.snapshotSha256) ||
    typeof v.fetchedAt !== "string" ||
    !Number.isFinite(Date.parse(v.fetchedAt)) ||
    typeof v.snapshot !== "string" ||
    !Array.isArray(v.groups)
  )
    throw new Error("Live generation file is malformed");
  const groups = storeGroups((v.groups as unknown[]).join(","));
  if (groups.join(",") !== expected.join(","))
    throw new Error("Live generation file was made for other content groups");
  return {
    generation: v.generation,
    snapshotSha256: v.snapshotSha256,
    groups,
    fetchedAt: v.fetchedAt,
    snapshot: v.snapshot,
  };
}

let cached: { live: LiveGeneration | null } | undefined;
/** The deployment's live generation, or null when every group reads code. Read once per server. */
export function liveGeneration(
  env: Record<string, string | undefined> = process.env,
  readFile: (path: string) => string = (path) => readFileSync(path, "utf8"),
): LiveGeneration | null {
  if (cached && env === process.env) return cached.live;
  const groups = storeGroups(env.PIPSTART_STORE_FAMILIES);
  const live = groups.length
    ? parseLiveGeneration(
        readFile(join(process.cwd(), LIVE_GENERATION_FILE)),
        groups,
      )
    : null;
  if (env === process.env) cached = { live };
  return live;
}
