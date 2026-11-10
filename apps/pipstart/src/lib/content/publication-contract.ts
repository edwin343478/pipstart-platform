import type { DeliveryCode } from "./publication-delivery-contract";
// M22 MP08b1 live publication: the browser-safe contract for the staff Publication panel. The
// store (MP08a) decides every permission and rule; these checks only refuse malformed input early.
export type PublicationInput =
  | { action: "status"; id: string | null }
  | { action: "baseline"; operation: string; reason: string }
  | {
      action: "publish";
      operation: string;
      expected: number;
      id: string;
      revision: number;
      sha: string;
      reason: string;
    }
  | {
      action: "withdraw";
      operation: string;
      expected: number;
      id: string;
      reason: string;
    }
  | {
      action: "restore";
      operation: string;
      expected: number;
      from: number;
      reason: string;
    };
export type RefreshState =
  "pending" | "processing" | "verified" | "failed" | "superseded";
export type PublicationStatus = {
  generation: number | null;
  refresh: { state: RefreshState; attempts: number; updatedAt: string } | null;
  published: { revision: number; bodySha256: string } | null;
};
export type PublicationResult =
  | { kind: "status"; status: PublicationStatus; deliveryConfigured?: boolean }
  | {
      kind: "done";
      generation: number;
      replayed: boolean;
      delivery?: DeliveryCode;
    }
  | {
      kind:
        | "invalid"
        | "denied"
        | "unavailable"
        | "conflict"
        | "state"
        | "uncertain";
    };
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const keys = (v: Record<string, unknown>, k: string) =>
  Object.keys(v).sort().join(",") === k;
const id = (v: unknown): v is string =>
  typeof v === "string" && /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(v);
const integer = (v: unknown, min = 1): v is number =>
  typeof v === "number" &&
  Number.isSafeInteger(v) &&
  v >= min &&
  v <= 9007199254740991;
const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    v,
  );
/** 1 to 200 characters, already trimmed, one line. */
export const publicationReason = (v: unknown): v is string =>
  typeof v === "string" &&
  v === v.trim() &&
  [...v].length >= 1 &&
  [...v].length <= 200 &&
  !/[\u0000-\u001f\u007f]/.test(v);
export function validPublicationInput(v: unknown): v is PublicationInput {
  if (!object(v)) return false;
  switch (v.action) {
    case "status":
      return keys(v, "action,id") && (v.id === null || id(v.id));
    case "baseline":
      return (
        keys(v, "action,operation,reason") &&
        uuid(v.operation) &&
        publicationReason(v.reason)
      );
    case "publish":
      return (
        keys(v, "action,expected,id,operation,reason,revision,sha") &&
        uuid(v.operation) &&
        integer(v.expected) &&
        id(v.id) &&
        integer(v.revision) &&
        typeof v.sha === "string" &&
        /^[a-f0-9]{64}$/.test(v.sha) &&
        publicationReason(v.reason)
      );
    case "withdraw":
      return (
        keys(v, "action,expected,id,operation,reason") &&
        uuid(v.operation) &&
        integer(v.expected) &&
        id(v.id) &&
        publicationReason(v.reason)
      );
    case "restore":
      return (
        keys(v, "action,expected,from,operation,reason") &&
        uuid(v.operation) &&
        integer(v.expected) &&
        integer(v.from) &&
        v.from < v.expected &&
        publicationReason(v.reason)
      );
    default:
      return false;
  }
}
const refreshStates: RefreshState[] = [
  "pending",
  "processing",
  "verified",
  "failed",
  "superseded",
];
/** The store's status reply, exactly; anything else is refused. */
export function parsePublicationStatus(
  v: unknown,
  withItem: boolean,
): PublicationStatus | null {
  if (!object(v)) return null;
  if (
    !keys(
      v,
      withItem ? "generation,item_id,published,refresh" : "generation,refresh",
    )
  )
    return null;
  const generation =
    v.generation === null
      ? null
      : integer(v.generation)
        ? v.generation
        : undefined;
  if (generation === undefined) return null;
  let refresh: PublicationStatus["refresh"] = null;
  if (v.refresh !== null) {
    const r = v.refresh;
    if (
      !object(r) ||
      !keys(r, "attempts,state,updated_at") ||
      !refreshStates.includes(r.state as RefreshState) ||
      !integer(r.attempts, 0) ||
      typeof r.updated_at !== "string" ||
      !Number.isFinite(Date.parse(r.updated_at))
    )
      return null;
    refresh = {
      state: r.state as RefreshState,
      attempts: r.attempts,
      updatedAt: r.updated_at,
    };
  }
  let published: PublicationStatus["published"] = null;
  if (withItem && v.published !== null) {
    const p = v.published;
    if (
      !object(p) ||
      !keys(p, "body_sha256,revision_no") ||
      !integer(p.revision_no) ||
      typeof p.body_sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(p.body_sha256)
    )
      return null;
    published = { revision: p.revision_no, bodySha256: p.body_sha256 };
  }
  return { generation, refresh, published };
}
