import type { RevisionState } from "./editorial-adapter";
export type DecisionAction = "submit" | "approve" | "changes" | "publish";
export type DecisionInput = {
  action: DecisionAction;
  id: string;
  revision: number;
  sha: string;
  note: string | null;
};
export type DecisionResult =
  | { kind: "done"; id: string; revision: number; state: RevisionState }
  | {
      kind:
        | "invalid"
        | "denied"
        | "unavailable"
        | "conflict"
        | "state"
        | "sources"
        | "uncertain";
    };
/** The revision state each action leaves, as the store reports it. */
export const decisionState: Record<DecisionAction, RevisionState> = {
  submit: "submitted",
  approve: "approved",
  changes: "changes_requested",
  publish: "approved",
};
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const note = (v: unknown) =>
  v === null ||
  (typeof v === "string" &&
    v === v.trim() &&
    [...v].length >= 1 &&
    [...v].length <= 1000 &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v));
export function validDecisionInput(v: unknown): v is DecisionInput {
  return (
    object(v) &&
    Object.keys(v).sort().join(",") === "action,id,note,revision,sha" &&
    ["submit", "approve", "changes", "publish"].includes(String(v.action)) &&
    typeof v.id === "string" &&
    /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(v.id) &&
    typeof v.revision === "number" &&
    Number.isSafeInteger(v.revision) &&
    v.revision >= 1 &&
    v.revision <= 2147483647 &&
    typeof v.sha === "string" &&
    /^[a-f0-9]{64}$/.test(v.sha) &&
    note(v.note) &&
    // Only review decisions carry a note; asking for changes must say what.
    (v.action === "changes"
      ? v.note !== null
      : v.action === "approve" || v.action === "publish" || v.note === null)
  );
}
