// TA-c: one click changes a live trade idea's status and publishes it again. Browser-safe.
import type { ActionLimited } from "./staff-action-limit";
import type { DeliveryCode } from "./publication-delivery-contract";
import { analysisId, type TradeStatusDraft } from "./analysis-draft-contract";
import {
  isOtherReason,
  tradeLimits,
  tradeOutcomes,
  tradeReasons,
  type TradeReason,
} from "./trade-idea";

export type TradeStatusUpdateInput = {
  id: string;
  /** The live revision the Owner is looking at; anything newer stops the update. */
  revision: number;
  sha: string;
  /** The live publication generation the page was loaded with. */
  generation: number;
  status: TradeStatusDraft;
};

export type TradeStatusUpdateResult =
  | ActionLimited
  | {
      kind: "done";
      revision: number;
      generation: number;
      delivery?: DeliveryCode;
    }
  /** Some steps finished: a draft was saved ("saved") or saved and approved ("approved"). */
  | { kind: "stopped"; step: "saved" | "approved"; revision: number }
  | {
      kind:
        | "not-live"
        | "unchanged"
        | "invalid"
        | "denied"
        | "unavailable"
        | "conflict"
        | "uncertain";
    };

const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const keys = (v: Record<string, unknown>) => Object.keys(v).sort().join(",");

export function validStatusDraft(v: unknown): v is TradeStatusDraft {
  if (!object(v)) return false;
  const reason = v.reason;
  if (
    typeof reason !== "string" ||
    !Object.prototype.hasOwnProperty.call(tradeReasons, reason) ||
    v.state !== tradeReasons[reason as TradeReason].state
  )
    return false;
  const other = isOtherReason(reason as TradeReason);
  const note =
    typeof v.note === "string" &&
    v.note.length > 0 &&
    v.note === v.note.trim() &&
    [...v.note].length <= tradeLimits.noteLength &&
    !/[\u0000-\u001f\u007f]/.test(v.note);
  const expected =
    reason === "inactive-other"
      ? "note,outcome,reason,state"
      : other
        ? "note,reason,state"
        : "reason,state";
  return (
    keys(v) === expected &&
    (!other || note) &&
    (reason !== "inactive-other" ||
      (tradeOutcomes as readonly unknown[]).includes(v.outcome))
  );
}

export function validStatusUpdate(v: unknown): v is TradeStatusUpdateInput {
  return (
    object(v) &&
    keys(v) === "generation,id,revision,sha,status" &&
    analysisId(v.id) &&
    Number.isSafeInteger(v.revision) &&
    Number(v.revision) >= 1 &&
    Number(v.revision) < 2147483647 &&
    typeof v.sha === "string" &&
    /^[a-f0-9]{64}$/.test(v.sha) &&
    Number.isSafeInteger(v.generation) &&
    Number(v.generation) >= 1 &&
    validStatusDraft(v.status)
  );
}
