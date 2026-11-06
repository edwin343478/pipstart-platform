import type { ContentFamily, LearningPath } from "./contract";
import type { EditorialListRow, RevisionState } from "./editorial-adapter";
import type { LiveStaffAccess } from "../auth/staff-role-flow";
export const WORKSPACE_PAGE_SIZE = 25;
export type WorkspaceInput =
  { kind: "list"; after: string } | { kind: "item"; id: string };
export type WorkspaceDecision = {
  kind: "imported" | "reviewed" | "single_person" | "changes_requested";
  note: string | null;
  byMe: boolean;
  at: string;
};
export type WorkspaceDetail = {
  id: string;
  family: "course" | "module" | "lesson" | "quiz";
  path: LearningPath;
  parent: string | null;
  title: string;
  revision: number;
  bodySha256: string;
  state: RevisionState;
  trashed: boolean;
  onHold: boolean;
  authorIsMe: boolean;
  reviewRequired: boolean;
  createdAt: string;
  decisions: WorkspaceDecision[];
};
export type WorkspacePage = { rows: EditorialListRow[]; next: string | null };
export type WorkspaceResult =
  | { kind: "list"; page: WorkspacePage }
  | { kind: "item"; detail: WorkspaceDetail }
  | { kind: "invalid" | "denied" | "unavailable" };
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const exact = (v: Record<string, unknown>, keys: string) =>
  Object.keys(v).sort().join(",") === keys;
const id = (v: unknown): v is string =>
  typeof v === "string" && /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(v);
const families: ContentFamily[] = [
  "course",
  "module",
  "lesson",
  "quiz",
  "analysis",
];
const states: RevisionState[] = [
  "draft",
  "submitted",
  "changes_requested",
  "approved",
  "superseded",
];
const integer = (v: unknown, min = 1): v is number =>
  typeof v === "number" &&
  Number.isSafeInteger(v) &&
  v >= min &&
  v <= 2147483647;
const stamp = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 64 && Number.isFinite(Date.parse(v));
export function validWorkspaceInput(v: unknown): v is WorkspaceInput {
  return (
    object(v) &&
    ((v.kind === "list" &&
      exact(v, "after,kind") &&
      (v.after === "" || id(v.after))) ||
      (v.kind === "item" && exact(v, "id,kind") && id(v.id)))
  );
}
// Navigation guidance only: resource-scoped SQL remains the read authority.
export function canOpenContentWorkspace(access: LiveStaffAccess) {
  return (
    access.capabilities.includes("content.read") ||
    access.roles.some((r) =>
      ["owner", "author", "reviewer", "editor"].includes(r),
    )
  );
}
function identity(v: Record<string, unknown>) {
  if (!id(v.id) || !families.includes(v.family as ContentFamily)) return false;
  const root = v.family === "course" || v.family === "analysis";
  return (
    (v.family === "analysis"
      ? v.learning_path === null
      : ["forex", "crypto"].includes(String(v.learning_path))) &&
    (root ? v.parent_id === null : id(v.parent_id))
  );
}
export function parseWorkspaceList(
  v: unknown,
  after: string,
): WorkspacePage | null {
  if (!Array.isArray(v) || v.length > WORKSPACE_PAGE_SIZE + 1) return null;
  const ids = new Set<string>();
  for (const row of v) {
    if (
      !object(row) ||
      !exact(
        row,
        "category,family,id,latest_revision,learning_path,parent_id,state,trashed",
      ) ||
      !identity(row) ||
      !integer(row.latest_revision) ||
      !states.includes(row.state as RevisionState) ||
      typeof row.trashed !== "boolean" ||
      (row.family === "analysis"
        ? !["fundamental", "technical"].includes(String(row.category))
        : row.category !== null) ||
      ids.has(String(row.id)) ||
      row.id === after
    )
      return null;
    ids.add(String(row.id));
  }
  return {
    rows: (v as EditorialListRow[]).slice(0, WORKSPACE_PAGE_SIZE),
    next:
      v.length > WORKSPACE_PAGE_SIZE
        ? String(v[WORKSPACE_PAGE_SIZE - 1].id)
        : null,
  };
}
export function parseWorkspaceDetail(
  v: unknown,
  expectedId: string,
): WorkspaceDetail | null {
  if (
    !object(v) ||
    !exact(v, "decisions,item,review_required,revision") ||
    typeof v.review_required !== "boolean" ||
    !object(v.item) ||
    !object(v.revision) ||
    !Array.isArray(v.decisions) ||
    v.decisions.length > 100
  )
    return null;
  const i = v.item,
    r = v.revision;
  if (
    !exact(
      i,
      "family,id,latest_revision,learning_path,on_hold,parent_id,trashed",
    ) ||
    !identity(i) ||
    i.id !== expectedId ||
    !["course", "module", "lesson", "quiz"].includes(String(i.family)) ||
    !integer(i.latest_revision) ||
    typeof i.trashed !== "boolean" ||
    typeof i.on_hold !== "boolean" ||
    !exact(
      r,
      "author_is_me,base_revision,body,body_sha256,created_at,revision_no,schema_version,state",
    ) ||
    r.schema_version !== 1 ||
    !integer(r.revision_no) ||
    r.revision_no !== i.latest_revision ||
    !integer(r.base_revision, 0) ||
    r.base_revision >= r.revision_no ||
    typeof r.author_is_me !== "boolean" ||
    !states.includes(r.state as RevisionState) ||
    !stamp(r.created_at) ||
    typeof r.body_sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(r.body_sha256) ||
    !object(r.body) ||
    !object(r.body.metadata)
  )
    return null;
  const title = r.body.metadata.title;
  if (
    typeof title !== "string" ||
    title.trim().length === 0 ||
    [...title].length > 200
  )
    return null;
  const decisions: WorkspaceDecision[] = [];
  for (const d of v.decisions) {
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
  // The browser receives only this allowlist, never the full body or hidden fields.
  return {
    id: i.id as string,
    family: i.family as WorkspaceDetail["family"],
    path: i.learning_path as LearningPath,
    parent: i.parent_id as string | null,
    title,
    revision: r.revision_no,
    bodySha256: r.body_sha256,
    state: r.state as RevisionState,
    trashed: i.trashed,
    onHold: i.on_hold,
    authorIsMe: r.author_is_me,
    reviewRequired: v.review_required,
    createdAt: r.created_at,
    decisions,
  };
}
