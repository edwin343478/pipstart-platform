import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runAnalysisDraft } from "./analysis-draft";
import { runEditorialDecision } from "./editorial-decision";
import { runPublication } from "./publication";
import { runPublicationWithDelivery } from "./publication-delivery";
import {
  validStatusUpdate,
  type TradeStatusUpdateResult,
} from "./trade-status-update-contract";
import type { TradeStatusDraft } from "./analysis-draft-contract";
import { reasonLabels } from "./trade-idea";

const same = (a: TradeStatusDraft, b: TradeStatusDraft) =>
  a.state === b.state &&
  a.reason === b.reason &&
  (a.note ?? "") === (b.note ?? "") &&
  (a.outcome ?? "") === (b.outcome ?? "");

/** The editorial and publication reason for a status change: one line, at most 200 characters. */
export function statusChangeReason(status: TradeStatusDraft) {
  const text =
    "Trade status: " +
    (status.note
      ? `${reasonLabels[status.reason]} (${status.note})`
      : reasonLabels[status.reason]);
  return [...text].length > 200 ? [...text].slice(0, 199).join("") + "…" : text;
}

/**
 * TA-c. Changes the status of the live trade idea and publishes it again, by running the existing
 * steps in order: save a draft with the new status (the earlier status moves into the history),
 * the Owner's single-person approval, then Make live with deployment delivery. It runs only while
 * the latest revision is the live one, so no other unpublished edit is published with it. Each
 * step repeats the live Owner check; a step that does not finish stops the chain and says which
 * steps did. Nothing is retried.
 */
export async function runTradeStatusUpdate(
  client: SupabaseClient,
  input: unknown,
): Promise<TradeStatusUpdateResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validStatusUpdate(input)) return { kind: "invalid" };
  const command = structuredClone(input);

  const live = await runPublication(client, {
    action: "status",
    id: command.id,
  });
  if (live.kind === "limited") return live;
  if (live.kind !== "status")
    return { kind: live.kind === "denied" ? "denied" : "unavailable" };
  if (live.status.generation !== command.generation)
    return { kind: "conflict" };
  const published = live.status.published;
  if (
    !published ||
    published.revision !== command.revision ||
    published.bodySha256 !== command.sha
  )
    return { kind: "not-live" };

  const loaded = await runAnalysisDraft(client, {
    kind: "load",
    id: command.id,
  });
  if (loaded.kind !== "ready")
    return loaded.kind === "denied"
      ? { kind: "denied" }
      : { kind: "unavailable" };
  const view = loaded.item;
  if (view.revision !== command.revision || view.bodySha256 !== command.sha)
    return { kind: "not-live" };
  const trade = view.fields.trade;
  if (!trade) return { kind: "invalid" };
  if (same(trade.status, command.status)) return { kind: "unchanged" };

  const reason = statusChangeReason(command.status);
  const saved = await runAnalysisDraft(client, {
    kind: "save",
    id: command.id,
    baseRevision: view.revision,
    baseSha256: view.bodySha256,
    fields: { ...view.fields, trade: { ...trade, status: command.status } },
    reason,
  });
  if (saved.kind !== "saved")
    return saved.kind === "ready" ? { kind: "uncertain" } : saved;

  const approved = await runEditorialDecision(client, {
    action: "publish",
    id: command.id,
    revision: saved.revision,
    sha: saved.bodySha256,
    note: null,
  });
  if (approved.kind !== "done")
    return { kind: "stopped", step: "saved", revision: saved.revision };

  const made = await runPublicationWithDelivery(client, {
    action: "publish",
    operation: randomUUID(),
    expected: command.generation,
    id: command.id,
    revision: saved.revision,
    sha: saved.bodySha256,
    reason,
  });
  if (made.kind !== "done")
    return { kind: "stopped", step: "approved", revision: saved.revision };
  return {
    kind: "done",
    revision: saved.revision,
    generation: made.generation,
    ...(made.delivery ? { delivery: made.delivery } : {}),
  };
}
