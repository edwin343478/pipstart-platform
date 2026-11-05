export type LifecycleAction = "archive" | "restore" | "hold" | "release";
export type LifecycleInput = {
  action: LifecycleAction;
  id: string;
  revision: number;
  sha: string;
  reason: string | null;
};
export type LifecycleResult =
  | {
      kind: "done";
      id: string;
      action: LifecycleAction;
      /** The new draft revision a restore creates; otherwise the unchanged latest revision. */
      revision: number;
    }
  | {
      kind:
        | "invalid"
        | "denied"
        | "unavailable"
        | "conflict"
        | "state"
        | "held"
        | "uncertain";
    };
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const reason = (v: unknown): v is string =>
  typeof v === "string" &&
  v === v.trim() &&
  [...v].length >= 1 &&
  [...v].length <= 200 &&
  !/[\u0000-\u001f\u007f]/.test(v);
export function validLifecycleInput(v: unknown): v is LifecycleInput {
  return (
    object(v) &&
    Object.keys(v).sort().join(",") === "action,id,reason,revision,sha" &&
    ["archive", "restore", "hold", "release"].includes(String(v.action)) &&
    typeof v.id === "string" &&
    /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(v.id) &&
    typeof v.revision === "number" &&
    Number.isSafeInteger(v.revision) &&
    v.revision >= 1 &&
    v.revision < 2147483647 &&
    typeof v.sha === "string" &&
    /^[a-f0-9]{64}$/.test(v.sha) &&
    // Releasing a hold takes no reason; every other action must give one.
    (v.action === "release" ? v.reason === null : reason(v.reason))
  );
}
