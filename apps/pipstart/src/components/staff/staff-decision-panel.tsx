"use client";
import { useRef, useState } from "react";
import { runEditorialDecisionAction } from "@/app/admin/staff/content/decision-actions";
import type {
  DecisionAction,
  DecisionResult,
} from "@/lib/content/editorial-decision-contract";
import type { WorkspaceDetail } from "@/lib/content/editorial-workspace-contract";
import s from "@/components/admin-preview/admin-preview.module.css";
import workspace from "./staff-content-workspace.module.css";
import styles from "./staff-revision-history.module.css";
import panel from "./staff-decision-panel.module.css";
const done: Record<DecisionAction, string> = {
  submit: "Sent to a reviewer.",
  approve: "Approved by review.",
  changes: "Changes requested.",
  publish: "Published by the Owner.",
};
const refusal: Record<Exclude<DecisionResult["kind"], "done">, string> = {
  invalid:
    "The store refused this decision. Reload the revision and check it before trying again.",
  denied:
    "You cannot make this decision for this item. Access is checked again on every request.",
  unavailable:
    "The decision could not be sent. Nothing was changed. Reload the revision and try again.",
  conflict:
    "A newer revision was saved. Reload the revision and review it before deciding.",
  state:
    "This revision is no longer in a state for that decision. Reload the revision.",
  sources:
    "Add at least one HTTPS source in the lesson editor before sending to review or publishing. Nothing was changed.",
  uncertain:
    "The decision may or may not have been recorded. It will not be resent. Reload the revision to see its current state.",
};
export function StaffDecisionPanel({
  detail,
  canSubmit,
  canReview,
  canPublish,
  onChanged,
}: {
  detail: WorkspaceDetail;
  canSubmit: boolean;
  canReview: boolean;
  canPublish: boolean;
  onChanged: (message: string) => void;
}) {
  const [note, setNote] = useState(""),
    [busy, setBusy] = useState(false),
    [blocked, setBlocked] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false);
  const open = !detail.trashed,
    submit = open && canSubmit && detail.state === "draft",
    review =
      open && canReview && detail.state === "submitted" && !detail.authorIsMe,
    publish =
      open &&
      canPublish &&
      !detail.reviewRequired &&
      ["draft", "submitted"].includes(detail.state);
  async function decide(action: DecisionAction) {
    if (lock.current || blocked) return;
    const text = note.trim();
    if (action === "changes" && !text) {
      setMessage("Say what needs to change before requesting changes.");
      return;
    }
    if (
      action === "publish" &&
      !window.confirm(
        `Publish revision ${detail.revision} of ${detail.id}? This records your Owner approval of this exact revision.`,
      )
    )
      return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const result = await runEditorialDecisionAction({
        action,
        id: detail.id,
        revision: detail.revision,
        sha: detail.bodySha256,
        note: action === "submit" || !text ? null : text,
      });
      if (result.kind === "done") {
        onChanged(done[action] + " Revision reloaded.");
        return;
      }
      if (result.kind === "uncertain") setBlocked(true);
      setMessage(refusal[result.kind]);
    } catch {
      setBlocked(true);
      setMessage(refusal.uncertain);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className={`${s.panel} ${styles.history}`}
      aria-labelledby="decision-heading"
      aria-busy={busy}
    >
      <h2 id="decision-heading">Review and publication</h2>
      <p>
        Decisions apply to revision {detail.revision} exactly. Approval does not
        change learner pages yet: they keep reading the published code until the
        public content cutover.
      </p>
      {detail.trashed && (
        <p>Archived content cannot be reviewed or published.</p>
      )}
      {open && detail.state === "approved" && (
        <p>This revision is approved. Save a new draft to change it.</p>
      )}
      {open && detail.state === "changes_requested" && (
        <p>
          A reviewer asked for changes. Edit and save a new draft, then send it
          to review again.
        </p>
      )}
      {open &&
        detail.state === "submitted" &&
        detail.authorIsMe &&
        canReview && (
          <p>You saved this revision, so a different person must review it.</p>
        )}
      {open && detail.reviewRequired && canPublish && (
        <p>Independent review is required by policy, so Publish is closed.</p>
      )}
      {(review || publish) && (
        <label className={panel.note}>
          Decision note{" "}
          {review ? "(required to request changes)" : "(optional)"}
          <textarea
            rows={3}
            maxLength={1000}
            value={note}
            disabled={busy || blocked}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      )}
      <div className={styles.actions}>
        {submit && (
          <button
            type="button"
            className={workspace.button}
            disabled={busy || blocked}
            onClick={() => void decide("submit")}
          >
            Send to reviewer
          </button>
        )}
        {review && (
          <button
            type="button"
            className={workspace.button}
            disabled={busy || blocked}
            onClick={() => void decide("approve")}
          >
            Approve revision {detail.revision}
          </button>
        )}
        {review && (
          <button
            type="button"
            className={workspace.button}
            disabled={busy || blocked}
            onClick={() => void decide("changes")}
          >
            Request changes
          </button>
        )}
        {publish && (
          <button
            type="button"
            className={workspace.button}
            disabled={busy || blocked}
            onClick={() => void decide("publish")}
          >
            Publish revision {detail.revision}
          </button>
        )}
      </div>
      {!submit &&
        !review &&
        !publish &&
        open &&
        ["draft", "submitted"].includes(detail.state) && (
          <p>No decision is available to you for this revision.</p>
        )}
      <p role="status" aria-live="polite" aria-atomic="true">
        {busy
          ? "Checking live staff access and recording the decision…"
          : message}
      </p>
    </section>
  );
}
