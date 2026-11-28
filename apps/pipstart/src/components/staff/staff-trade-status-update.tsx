"use client";
// TA-c: the Owner changes a live trade idea's status in one step; it is saved, approved and
// published again with the usual deployment. Shown on the analysis editor page.
import { useRef, useState, useSyncExternalStore } from "react";
import { runTradeStatusUpdateAction } from "@/app/admin/staff/content/analysis-actions";
import type { TradeStatusDraft } from "@/lib/content/analysis-draft-contract";
import {
  validStatusUpdate,
  type TradeStatusUpdateResult,
} from "@/lib/content/trade-status-update-contract";
import {
  isOtherReason,
  outcomeLabels,
  reasonLabels,
  tradeLimits,
  tradeOutcomes,
  tradeReasons,
  type TradeOutcome,
  type TradeReason,
} from "@/lib/content/trade-idea";
import { deliveryMessage } from "@/lib/content/publication-delivery-contract";
import { actionLimitMessage } from "@/lib/content/staff-action-limit";
import {
  activeReasons,
  inactiveReasons,
  reasonOption,
} from "./staff-analysis-editor";
import styles from "./staff-trade-status-update.module.css";

const subscribe = () => () => {};

export type LiveTradeStatus =
  | {
      kind: "live";
      id: string;
      revision: number;
      sha: string;
      generation: number;
      status: TradeStatusDraft;
      statusUpdatedAt: string | null;
    }
  | { kind: "pending-changes" };

export function resultMessage(r: TradeStatusUpdateResult): string {
  switch (r.kind) {
    case "done":
      return (
        `Status updated and published (revision ${r.revision}). ` +
        (r.delivery
          ? deliveryMessage[r.delivery]
          : "The site updates when the deployment finishes, usually in 2 to 3 minutes.")
      );
    case "stopped":
      return r.step === "saved"
        ? `The new status was saved as revision ${r.revision} but not approved or published. Approve and publish it from the content library.`
        : `The new status was saved and approved as revision ${r.revision} but not published. Use Make live in the content library.`;
    case "not-live":
      return "This post has changed since the page loaded, or has unpublished edits. Reload the page; nothing was changed.";
    case "unchanged":
      return "That is already the live status. Nothing was changed.";
    case "conflict":
      return "The live site changed since the page loaded. Reload the page; nothing was changed.";
    case "denied":
      return "Only the Owner can update a live trade idea, or your staff access changed. Nothing was changed.";
    case "limited":
      return actionLimitMessage(r.retryAfter);
    case "invalid":
      return "Check the status: an “Other” reason needs a short written explanation. Nothing was changed.";
    case "uncertain":
      return "The outcome is uncertain. Do not try again yet: open the content library and check the latest revision and live status.";
    default:
      return "The update is unavailable right now. Nothing was changed.";
  }
}

export function StaffTradeStatusUpdate({ live }: { live: LiveTradeStatus }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const current = live.kind === "live" ? live.status : null;
  const [reason, setReason] = useState<TradeReason>(
    current?.reason ?? "triggered",
  );
  const [note, setNote] = useState(current?.note ?? "");
  const [outcome, setOutcome] = useState<TradeOutcome>(
    current?.outcome ?? "void",
  );
  const [phase, setPhase] = useState<"idle" | "busy" | "finished">("idle");
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  const status = useRef<HTMLParagraphElement>(null);

  if (live.kind !== "live")
    return (
      <section className={styles.card} aria-labelledby="live-status-heading">
        <h2 id="live-status-heading">Live trade status</h2>
        <p className={styles.help}>
          This post has saved changes that are not live yet. Publish or replace
          them from the content library first; the one-step status update works
          on the live version only.
        </p>
      </section>
    );

  const state = tradeReasons[reason].state;
  const next: TradeStatusDraft = {
    state,
    reason,
    ...(isOtherReason(reason) ? { note: note.trim() } : {}),
    ...(reason === "inactive-other" ? { outcome } : {}),
  };
  const shownOutcome =
    reason === "inactive-other" ? outcome : tradeReasons[reason].outcome;

  async function submit() {
    if (lock.current || phase !== "idle" || live.kind !== "live") return;
    const command = {
      id: live.id,
      revision: live.revision,
      sha: live.sha,
      generation: live.generation,
      status: next,
    };
    if (!validStatusUpdate(command)) {
      setMessage(resultMessage({ kind: "invalid" }));
      status.current?.focus();
      return;
    }
    lock.current = true;
    setPhase("busy");
    setMessage("Saving, approving and publishing the new status…");
    let result: TradeStatusUpdateResult;
    try {
      result = await runTradeStatusUpdateAction(command);
    } catch {
      result = { kind: "uncertain" };
    }
    // Anything but a clean refusal before writing ends this page's one-step update.
    const retryable = [
      "unchanged",
      "invalid",
      "limited",
      "unavailable",
    ].includes(result.kind);
    setPhase(retryable ? "idle" : "finished");
    setMessage(resultMessage(result));
    lock.current = false;
    status.current?.focus();
  }

  const disabled = !hydrated || phase !== "idle";
  return (
    <section className={styles.card} aria-labelledby="live-status-heading">
      <div className={styles.head}>
        <h2 id="live-status-heading">Live trade status</h2>
        <span className={styles.badge} data-state={live.status.state}>
          Now: {live.status.state === "active" ? "Active" : "Inactive"}
        </span>
      </div>
      <p className={styles.help}>
        Readers see “
        {isOtherReason(live.status.reason) && live.status.note
          ? live.status.note
          : reasonLabels[live.status.reason]}
        ”
        {live.statusUpdatedAt ? (
          <>
            {" "}
            since{" "}
            <time dateTime={live.statusUpdatedAt}>
              {new Date(live.statusUpdatedAt).toUTCString()}
            </time>
          </>
        ) : null}
        . Change it here in one step: the new status is saved, approved and
        published, and the current one moves into the post&apos;s status
        history.
      </p>
      <div className={styles.fields}>
        <label htmlFor="live-status-reason">
          New status
          <select
            id="live-status-reason"
            value={reason}
            disabled={disabled}
            onChange={(e) => setReason(e.target.value as TradeReason)}
          >
            <optgroup label="Active: the idea is still valid">
              {activeReasons.map((r) => (
                <option key={r} value={r}>
                  {reasonOption(r)}
                </option>
              ))}
            </optgroup>
            <optgroup label="Inactive: closed or no longer tradable">
              {inactiveReasons.map((r) => (
                <option key={r} value={r}>
                  {reasonOption(r)}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        {reason === "inactive-other" && (
          <label htmlFor="live-status-outcome">
            Outcome
            <select
              id="live-status-outcome"
              value={outcome}
              disabled={disabled}
              onChange={(e) => setOutcome(e.target.value as TradeOutcome)}
            >
              {tradeOutcomes.map((o) => (
                <option key={o} value={o}>
                  {o === "void"
                    ? "No longer valid (no trade)"
                    : outcomeLabels[o]}
                </option>
              ))}
            </select>
          </label>
        )}
        {isOtherReason(reason) && (
          <label htmlFor="live-status-note" className={styles.wide}>
            Write the explanation
            <textarea
              id="live-status-note"
              rows={2}
              required
              maxLength={tradeLimits.noteLength}
              disabled={disabled}
              value={note}
              onChange={(e) =>
                setNote(e.target.value.replace(/\s*\n\s*/g, " "))
              }
            />
            <span>
              {note.length} / {tradeLimits.noteLength}
            </span>
          </label>
        )}
      </div>
      <p className={styles.preview}>
        <span className={styles.badge} data-state={state}>
          {state === "active" ? "Active" : "Inactive"}
        </span>
        {shownOutcome ? (
          <span className={styles.outcome} data-outcome={shownOutcome}>
            {outcomeLabels[shownOutcome]}
          </span>
        ) : null}
        <span>
          {isOtherReason(reason)
            ? note.trim()
              ? `“${note.trim()}”`
              : "Your explanation will appear here"
            : reasonLabels[reason]}
        </span>
      </p>
      <div className={styles.actions}>
        <button type="button" disabled={disabled} onClick={() => void submit()}>
          {phase === "busy" ? "Updating…" : "Update status and publish"}
        </button>
        <p
          ref={status}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className={styles.message}
        >
          {message ||
            "Publishing rebuilds the site; readers see the change in about 2 to 3 minutes."}
        </p>
      </div>
    </section>
  );
}
