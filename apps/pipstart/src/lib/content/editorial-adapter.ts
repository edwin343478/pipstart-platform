import "server-only";

// M22 MP04b editorial adapter: the MP04a store through its user-context staff RPCs only.
// It uses the caller's own session client (never a service key), so the database still
// decides every permission. It refuses obviously invalid identities and bodies before the
// network with the same rules as the store. Private view only: no public route reads it
// until MP08.
import type { ContentBody, ContentFamily, LearningPath } from "./contract";
import { checkContentBody } from "./validate";

type RpcResult = {
  data: unknown;
  error: { code?: string; message?: string } | null;
};
/** The part of a Supabase client this adapter uses; pass the signed-in staff client. */
export type EditorialRpcClient = {
  rpc(fn: string, args?: Record<string, unknown>): PromiseLike<RpcResult>;
};

export type EditorialErrorKind =
  "conflict" | "forbidden" | "invalid" | "state" | "unavailable";
export class EditorialError extends Error {
  constructor(
    readonly kind: EditorialErrorKind,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "EditorialError";
  }
}
// PT409 is the store's optimistic conflict (never 40001, which PostgREST retries).
const kinds: Record<string, EditorialErrorKind> = {
  PT409: "conflict",
  "42501": "forbidden",
  "22023": "invalid",
  "55000": "state",
};

export type RevisionState =
  "draft" | "submitted" | "changes_requested" | "approved" | "superseded";
export type RevisionResult = {
  item_id: string;
  revision_no: number;
  body_sha256: string;
  state: RevisionState;
};
export type EditorialItemView = {
  item: {
    id: string;
    family: ContentFamily;
    learning_path: LearningPath | null;
    parent_id: string | null;
    latest_revision: number;
    trashed: boolean;
    on_hold: boolean;
  };
  revision: {
    revision_no: number;
    schema_version: 1;
    body: unknown;
    body_sha256: string;
    base_revision: number;
    author_is_me: boolean;
    state: RevisionState;
    created_at: string;
  };
  decisions: {
    kind: "reviewed" | "single_person" | "changes_requested";
    note: string | null;
    by_me: boolean;
    at: string;
  }[];
  review_required: boolean;
};
export type EditorialListRow = {
  id: string;
  family: ContentFamily;
  learning_path: LearningPath | null;
  category: "fundamental" | "technical" | null;
  parent_id: string | null;
  latest_revision: number;
  state: RevisionState;
  trashed: boolean;
};

export const contentId = /^[a-z0-9][a-z0-9_:/.-]{0,199}$/;
const reasonOk = (reason: string) =>
  [...reason].length >= 1 && [...reason].length <= 200;

export type NewItem<F extends ContentFamily = ContentFamily> = {
  id: string;
  family: F;
  learningPath: F extends "analysis" ? null : LearningPath;
  parentId: F extends "course" | "analysis" ? null : string;
  body: ContentBody[F];
  reason: string;
};

/** Identity rules of the store: courses and analysis posts have no parent; analysis has no path. */
export function checkNewItem(item: NewItem): string | null {
  if (!contentId.test(item.id)) return "Invalid content identity";
  const learning = item.family !== "analysis";
  if (
    learning !==
    (item.learningPath === "forex" || item.learningPath === "crypto")
  )
    return "Unsupported content family or path";
  const rootless = item.family === "course" || item.family === "analysis";
  if (rootless !== (item.parentId === null))
    return "Parent does not fit this family";
  if (item.parentId !== null && !contentId.test(item.parentId))
    return "Invalid parent identity";
  if (!reasonOk(item.reason)) return "Give a reason (1 to 200 characters)";
  const body = checkContentBody(item.family, item.body);
  return body.ok ? null : body.reason;
}

export function createEditorialRepository(client: EditorialRpcClient) {
  async function call<T>(fn: string, args: Record<string, unknown>) {
    const { data, error } = await client.rpc(`pipstart_editorial_${fn}`, args);
    if (error)
      throw new EditorialError(
        kinds[error.code ?? ""] ?? "unavailable",
        error.message ?? "Editorial store unavailable",
        error.code,
      );
    return data as T;
  }
  const refuse = (message: string): never => {
    throw new EditorialError("invalid", message);
  };
  return {
    list: (after = "", limit = 50) =>
      call<EditorialListRow[]>("list", { p_after: after, p_limit: limit }),
    item: (id: string) => call<EditorialItemView>("item", { p_id: id }),
    create(item: NewItem) {
      const problem = checkNewItem(item);
      if (problem) refuse(problem);
      return call<RevisionResult>("create", {
        p_id: item.id,
        p_family: item.family,
        p_learning_path: item.learningPath,
        p_parent: item.parentId,
        p_body: item.body,
        p_reason: item.reason,
      });
    },
    save(
      id: string,
      family: ContentFamily,
      baseRevision: number,
      body: unknown,
      reason: string,
    ) {
      const check = checkContentBody(family, body);
      if (!check.ok) refuse(check.reason);
      if (!reasonOk(reason)) refuse("Give a reason (1 to 200 characters)");
      return call<RevisionResult>("save", {
        p_id: id,
        p_base_revision: baseRevision,
        p_body: body,
        p_reason: reason,
      });
    },
    /** "Send to reviewer". */
    submit: (id: string, revision: number, sha: string) =>
      call<RevisionResult>("submit", {
        p_id: id,
        p_revision: revision,
        p_sha: sha,
      }),
    review: (
      id: string,
      revision: number,
      sha: string,
      approve: boolean,
      note: string | null,
    ) =>
      call<RevisionResult>("review", {
        p_id: id,
        p_revision: revision,
        p_sha: sha,
        p_approve: approve,
        p_note: note,
      }),
    /** "Publish": the Owner's single-person decision while review is optional. */
    publish: (id: string, revision: number, sha: string, note: string | null) =>
      call<RevisionResult>("approve_single_person", {
        p_id: id,
        p_revision: revision,
        p_sha: sha,
        p_note: note,
      }),
    trash: (id: string, reason: string) =>
      call<{ item_id: string; trashed: true }>("trash", {
        p_id: id,
        p_reason: reason,
      }),
    restore: (id: string, reason: string) =>
      call<RevisionResult>("restore", { p_id: id, p_reason: reason }),
    /** Owner-only; a null reason releases the hold. */
    hold: (id: string, reason: string | null) =>
      call<{ item_id: string; held: boolean }>("hold", {
        p_id: id,
        p_reason: reason,
      }),
    setReviewPolicy: (requireReview: boolean, expectedVersion: number) =>
      call<{ require_review: boolean; version: number }>("set_review_policy", {
        p_require_review: requireReview,
        p_expected_version: expectedVersion,
      }),
  };
}
export type EditorialRepository = ReturnType<typeof createEditorialRepository>;
