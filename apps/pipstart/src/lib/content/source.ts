import "server-only";

// M22 MP05c-2 content source switch. Code is the default and the only source in Production.
// Outside Production, PIPSTART_CONTENT_SOURCE=snapshot makes the site read an approved store
// snapshot (PIPSTART_CONTENT_SNAPSHOT, a file exported from the editorial store) instead of
// the code registries. The lesson registry, curriculum, assessment registry, analysis posts
// and presentation text each switch where they are defined, through the MP05b shadow reads,
// so every page follows. The file is verified completely before anything uses it.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { contentFamilies, type ContentFamily } from "./contract";
import { jsonbText } from "./jsonb";
import { checkContentBody } from "./validate";
import type { StoreRow } from "./import/shadow";

export const CONTENT_SNAPSHOT_FORMAT = "pipstart-content-snapshot";

export type SnapshotItem = {
  id: string;
  family: ContentFamily;
  learningPath: "forex" | "crypto" | null;
  parentId: string | null;
  revisionNo: number;
  state: "approved";
  bodySha256: string;
  body: Record<string, unknown>;
};

export type ContentSnapshot = {
  format: typeof CONTENT_SNAPSHOT_FORMAT;
  version: 1;
  exportedAt: string;
  items: SnapshotItem[];
  itemsSha256: string;
};

const sha256 = (text: string) =>
  createHash("sha256").update(text, "utf8").digest("hex");

/** The seal over the item list: one line per item, in file order. */
export function snapshotItemsSha256(items: readonly SnapshotItem[]) {
  return sha256(
    items
      .map(
        (item) =>
          `${item.id} ${item.family} ${item.revisionNo} ${item.bodySha256}\n`,
      )
      .join(""),
  );
}

/** Seals approved rows as a snapshot file body (the export tooling and tests use this). */
export function buildContentSnapshot(
  items: readonly Omit<SnapshotItem, "state" | "bodySha256">[],
  exportedAt: string,
): ContentSnapshot {
  const sealed = items.map((item) => ({
    ...item,
    state: "approved" as const,
    bodySha256: sha256(jsonbText(item.body)),
  }));
  return {
    format: CONTENT_SNAPSHOT_FORMAT,
    version: 1,
    exportedAt,
    items: sealed,
    itemsSha256: snapshotItemsSha256(sealed),
  };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// A child's family and the family its parent must have.
const parentFamily: Partial<Record<ContentFamily, ContentFamily>> = {
  module: "course",
  lesson: "module",
  quiz: "module",
};

/** Parses and verifies a snapshot file completely; any defect refuses the whole snapshot. */
export function parseContentSnapshot(text: string): StoreRow[] {
  const fail = (reason: string): never => {
    throw new Error(`Content snapshot refused: ${reason}`);
  };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    fail("not valid JSON");
  }
  if (!isObject(data)) return fail("not an object");
  if (data.format !== CONTENT_SNAPSHOT_FORMAT || data.version !== 1)
    fail("unknown format or version");
  if (!Array.isArray(data.items) || data.items.length === 0) fail("no items");
  const items = data.items as SnapshotItem[];
  const seen = new Map<string, ContentFamily>();
  for (const item of items) {
    if (!isObject(item)) fail("an item is not an object");
    const where = `item ${String(item.id)}`;
    if (
      typeof item.id !== "string" ||
      !/^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(item.id)
    )
      fail(`${where}: invalid ID`);
    if (seen.has(item.id)) fail(`${where}: duplicate ID`);
    if (!(contentFamilies as readonly string[]).includes(item.family))
      fail(`${where}: unknown family`);
    if (item.state !== "approved") fail(`${where}: not an approved revision`);
    if (!Number.isInteger(item.revisionNo) || item.revisionNo < 1)
      fail(`${where}: invalid revision number`);
    const pathOk =
      item.family === "analysis"
        ? item.learningPath === null
        : item.learningPath === "forex" || item.learningPath === "crypto";
    if (!pathOk) fail(`${where}: invalid learning path`);
    const expectedParent = parentFamily[item.family];
    if (expectedParent) {
      if (
        typeof item.parentId !== "string" ||
        seen.get(item.parentId) !== expectedParent
      )
        fail(
          `${where}: its ${expectedParent} must come earlier in the snapshot`,
        );
      const parent = items.find((candidate) => candidate.id === item.parentId)!;
      if (parent.learningPath !== item.learningPath)
        fail(`${where}: its parent belongs to another learning path`);
    } else if (item.parentId !== null) fail(`${where}: must not have a parent`);
    if (!isObject(item.body)) fail(`${where}: body is not an object`);
    const check = checkContentBody(item.family, item.body);
    if (!check.ok) fail(`${where}: ${check.reason}`);
    if (item.bodySha256 !== sha256(jsonbText(item.body)))
      fail(`${where}: body does not match its SHA-256`);
    seen.set(item.id, item.family);
  }
  if (data.itemsSha256 !== snapshotItemsSha256(items))
    fail("the item list does not match its seal");
  return items.map(({ id, family, learningPath, parentId, body }) => ({
    id,
    family,
    learningPath,
    parentId,
    body,
  }));
}

export type ContentSourceEnv = {
  PIPSTART_CONTENT_SOURCE?: string;
  PIPSTART_CONTENT_SNAPSHOT?: string;
  VERCEL_ENV?: string;
};

/** Null for the code source; the verified snapshot rows otherwise. */
export function resolveContentSource(
  env: ContentSourceEnv,
  readFile: (path: string) => string = (path) => readFileSync(path, "utf8"),
): StoreRow[] | null {
  const source = env.PIPSTART_CONTENT_SOURCE ?? "code";
  if (source === "code") return null;
  if (source !== "snapshot")
    throw new Error(`Unknown PIPSTART_CONTENT_SOURCE "${source}"`);
  if (env.VERCEL_ENV === "production")
    throw new Error(
      "The content snapshot source is refused in Production; Production reads code",
    );
  if (!env.PIPSTART_CONTENT_SNAPSHOT)
    throw new Error("PIPSTART_CONTENT_SNAPSHOT must name the snapshot file");
  return parseContentSnapshot(readFile(env.PIPSTART_CONTENT_SNAPSHOT));
}

let resolved: { rows: StoreRow[] | null } | undefined;

/** The snapshot rows when the snapshot source is on, else null. Read once per server. */
export function contentSnapshotRows(): StoreRow[] | null {
  resolved ??= {
    rows: resolveContentSource({
      PIPSTART_CONTENT_SOURCE: process.env.PIPSTART_CONTENT_SOURCE,
      PIPSTART_CONTENT_SNAPSHOT: process.env.PIPSTART_CONTENT_SNAPSHOT,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }),
  };
  return resolved.rows;
}
