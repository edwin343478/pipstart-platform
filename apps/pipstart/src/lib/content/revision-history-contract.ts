import type { RevisionState } from "./editorial-adapter";
import type { WorkspaceDecision } from "./editorial-workspace-contract";
import type { RevisionComparison } from "./revision-compare";
export const HISTORY_PAGE_SIZE = 20;
export type RevisionHistoryInput =
  | { kind: "history"; id: string; before: number | null }
  | { kind: "compare"; id: string; from: number };
export type RevisionSummary = {
  revision: number;
  state: RevisionState;
  bodySha256: string;
  baseRevision: number;
  authorIsMe: boolean;
  reason: string;
  createdAt: string;
  decisions: WorkspaceDecision[];
  imported: boolean;
};
export type RevisionHistoryPage = {
  id: string;
  latest: number;
  rows: RevisionSummary[];
  next: number | null;
};
export type RevisionRef = {
  revision: number;
  state: RevisionState;
  bodySha256: string;
  createdAt: string;
};
export type RevisionHistoryResult =
  | { kind: "history"; page: RevisionHistoryPage }
  | {
      kind: "compare";
      id: string;
      from: RevisionRef;
      to: RevisionRef;
      comparison: RevisionComparison;
    }
  | { kind: "invalid" | "denied" | "unavailable" | "unsupported" | "stale" };
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const exact = (v: Record<string, unknown>, keys: string) =>
  Object.keys(v).sort().join(",") === keys;
const id = (v: unknown): v is string =>
  typeof v === "string" && /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(v);
const integer = (v: unknown, min = 1): v is number =>
  typeof v === "number" &&
  Number.isSafeInteger(v) &&
  v >= min &&
  v <= 2147483647;
const stamp = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 64 && Number.isFinite(Date.parse(v));
const sha = (v: unknown): v is string =>
  typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
const states: RevisionState[] = [
  "draft",
  "submitted",
  "changes_requested",
  "approved",
  "superseded",
];
export function validHistoryInput(v: unknown): v is RevisionHistoryInput {
  return (
    object(v) &&
    id(v.id) &&
    ((v.kind === "history" &&
      exact(v, "before,id,kind") &&
      (v.before === null || integer(v.before, 2))) ||
      (v.kind === "compare" && exact(v, "from,id,kind") && integer(v.from)))
  );
}
export function parseDecisions(v: unknown): WorkspaceDecision[] | null {
  if (!Array.isArray(v) || v.length > 100) return null;
  const decisions: WorkspaceDecision[] = [];
  for (const d of v) {
    if (
      !object(d) ||
      !exact(d, "at,by_me,kind,note") ||
      !["imported", "reviewed", "single_person", "changes_requested"].includes(
        String(d.kind),
      ) ||
      typeof d.by_me !== "boolean" ||
      !stamp(d.at) ||
      !(
        d.note === null ||
        (typeof d.note === "string" &&
          [...d.note].length >= 1 &&
          [...d.note].length <= 1000)
      )
    )
      return null;
    decisions.push({
      kind: d.kind as WorkspaceDecision["kind"],
      note: d.note as string | null,
      byMe: d.by_me,
      at: d.at,
    });
  }
  return decisions;
}
/** Newest first, strictly below `before`, one lookahead row; anything else fails closed. */
export function parseHistory(
  v: unknown,
  expectedId: string,
  before: number | null,
): RevisionHistoryPage | null {
  if (
    !object(v) ||
    !exact(v, "item_id,latest_revision,revisions") ||
    v.item_id !== expectedId ||
    !integer(v.latest_revision) ||
    !Array.isArray(v.revisions) ||
    v.revisions.length > HISTORY_PAGE_SIZE + 1
  )
    return null;
  const latest = v.latest_revision,
    rows: RevisionSummary[] = [];
  let previous = before ?? latest + 1;
  for (const r of v.revisions) {
    if (
      !object(r) ||
      !exact(
        r,
        "author_is_me,base_revision,body_sha256,created_at,decisions,imported,reason,revision_no,state",
      ) ||
      !integer(r.revision_no) ||
      r.revision_no >= previous ||
      r.revision_no > latest ||
      !integer(r.base_revision, 0) ||
      r.base_revision >= r.revision_no ||
      !sha(r.body_sha256) ||
      typeof r.author_is_me !== "boolean" ||
      typeof r.imported !== "boolean" ||
      !states.includes(r.state as RevisionState) ||
      typeof r.reason !== "string" ||
      [...r.reason].length < 1 ||
      [...r.reason].length > 200 ||
      !stamp(r.created_at)
    )
      return null;
    const decisions = parseDecisions(r.decisions);
    if (!decisions) return null;
    previous = r.revision_no;
    rows.push({
      revision: r.revision_no,
      state: r.state as RevisionState,
      bodySha256: r.body_sha256,
      baseRevision: r.base_revision,
      authorIsMe: r.author_is_me,
      reason: r.reason,
      createdAt: r.created_at,
      decisions,
      imported: r.imported,
    });
  }
  // A first page must start at the latest revision; later pages continue below the cursor.
  if (before === null && rows.length && rows[0].revision !== latest)
    return null;
  return {
    id: expectedId,
    latest,
    rows: rows.slice(0, HISTORY_PAGE_SIZE),
    next:
      rows.length > HISTORY_PAGE_SIZE
        ? rows[HISTORY_PAGE_SIZE - 1].revision
        : null,
  };
}
/** One exact revision read. The body stays on the server for comparison only. */
export function parseRevision(
  v: unknown,
  expectedId: string,
  expectedRevision: number,
): { ref: RevisionRef; latest: number; body: unknown } | null {
  if (
    !object(v) ||
    !exact(v, "decisions,imported,item_id,latest_revision,revision") ||
    v.item_id !== expectedId ||
    !integer(v.latest_revision) ||
    typeof v.imported !== "boolean" ||
    !parseDecisions(v.decisions) ||
    !object(v.revision)
  )
    return null;
  const r = v.revision;
  if (
    !exact(
      r,
      "author_is_me,base_revision,body,body_sha256,created_at,revision_no,schema_version,state",
    ) ||
    r.revision_no !== expectedRevision ||
    r.revision_no > v.latest_revision ||
    r.schema_version !== 1 ||
    !integer(r.base_revision, 0) ||
    r.base_revision >= r.revision_no ||
    typeof r.author_is_me !== "boolean" ||
    !sha(r.body_sha256) ||
    !states.includes(r.state as RevisionState) ||
    !stamp(r.created_at) ||
    !object(r.body)
  )
    return null;
  return {
    ref: {
      revision: r.revision_no,
      state: r.state as RevisionState,
      bodySha256: r.body_sha256,
      createdAt: r.created_at,
    },
    latest: v.latest_revision,
    body: r.body,
  };
}
