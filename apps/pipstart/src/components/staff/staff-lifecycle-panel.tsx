"use client";
import { useRef, useState } from "react";
import { runEditorialLifecycleAction } from "@/app/admin/staff/content/lifecycle-actions";
import type {
  LifecycleAction,
  LifecycleResult,
} from "@/lib/content/editorial-lifecycle-contract";
import type { WorkspaceDetail } from "@/lib/content/editorial-workspace-contract";
import s from "@/components/admin-preview/admin-preview.module.css";
import workspace from "./staff-content-workspace.module.css";
import styles from "./staff-revision-history.module.css";
import panel from "./staff-decision-panel.module.css";
const done: Record<LifecycleAction, string> = {
  archive: "Moved to the archive.",
  restore: "Restored as a new draft revision.",
  hold: "Hold placed.",
  release: "Hold released.",
};
const confirmText: Record<LifecycleAction, (d: WorkspaceDetail) => string> = {
  archive: (d) =>
    `Move ${d.id} to the archive? It can be restored later as a new draft.`,
  restore: (d) =>
    `Restore ${d.id}? This creates a new draft revision; approval is not reinstated.`,
  hold: (d) => `Place a hold on ${d.id}? It cannot be archived while held.`,
  release: (d) => `Release the hold on ${d.id}?`,
};
const refusal: Record<Exclude<LifecycleResult["kind"], "done">, string> = {
  invalid: "The store refused this request. Check the reason and try again.",
  denied:
    "You cannot do this for this item. Access is checked again on every request.",
  unavailable:
    "The request could not be sent. Nothing was changed. Reload the revision and try again.",
  conflict:
    "This item changed since it was loaded. Reload the revision before trying again.",
  state:
    "This is not possible for the item as stored. An item with active contents must have them archived first, and a restore needs an active parent. Reload the revision.",
  held: "This item is on hold and cannot be archived. The Owner must release the hold first.",
  uncertain:
    "The request may or may not have been recorded. It will not be resent. Reload the revision to see its current state.",
};
export function StaffLifecyclePanel({
  detail,
  canArchive,
  canRestore,
  canHold,
  onChanged,
}: {
  detail: WorkspaceDetail;
  canArchive: boolean;
  canRestore: boolean;
  canHold: boolean;
  onChanged: (message: string) => void;
}) {
  const [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [blocked, setBlocked] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false);
  const archive = canArchive && !detail.trashed && !detail.onHold,
    restore = canRestore && detail.trashed,
    hold = canHold && !detail.onHold,
    release = canHold && detail.onHold,
    needsReason = archive || restore || hold;
  async function act(action: LifecycleAction) {
    if (lock.current || blocked) return;
    const text = reason.trim();
    if (action !== "release" && !text) {
      setMessage("Give a short reason first.");
      return;
    }
    if (!window.confirm(confirmText[action](detail))) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const result = await runEditorialLifecycleAction({
        action,
        id: detail.id,
        revision: detail.revision,
        sha: detail.bodySha256,
        reason: action === "release" ? null : text,
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
  const button = (action: LifecycleAction, label: string) => (
    <button
      type="button"
      className={workspace.button}
      disabled={busy || blocked}
      onClick={() => void act(action)}
    >
      {label}
    </button>
  );
  return (
    <section
      className={`${s.panel} ${styles.history}`}
      aria-labelledby="lifecycle-heading"
      aria-busy={busy}
    >
      <h2 id="lifecycle-heading">Archive and hold</h2>
      <p>
        {detail.trashed
          ? "This item is in the archive. Restoring it creates a new draft revision; earlier approvals are not reinstated."
          : "Archiving keeps every revision and can be undone by restoring. Learner pages are not changed."}
        {detail.onHold &&
          " An Owner hold is in place, so it cannot be archived."}
      </p>
      {needsReason && (
        <label className={panel.note}>
          Reason (required, up to 200 characters)
          <input
            maxLength={200}
            value={reason}
            disabled={busy || blocked}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
      )}
      <div className={styles.actions}>
        {archive && button("archive", "Archive")}
        {restore && button("restore", "Restore as draft")}
        {hold && button("hold", "Place hold")}
        {release && button("release", "Release hold")}
      </div>
      {!archive && !restore && !hold && !release && (
        <p>No archive or hold action is available to you for this item.</p>
      )}
      <p role="status" aria-live="polite" aria-atomic="true">
        {busy
          ? "Checking live staff access and recording the request…"
          : message}
      </p>
    </section>
  );
}
