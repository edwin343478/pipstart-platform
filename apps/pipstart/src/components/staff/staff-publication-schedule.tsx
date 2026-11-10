"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { runPublicationScheduleAction } from "@/app/admin/staff/content/publication-actions";
import { publicationReason } from "@/lib/content/publication-contract";
import { resolveScheduleTime } from "@/lib/content/publication-schedule-time";
import {
  scheduleFailure,
  scheduleLabel,
  type ScheduleAction,
  type ScheduleInput,
  type ScheduleRecord,
  type ScheduleResult,
  type ScheduleStatus,
} from "@/lib/content/publication-schedule-contract";
import type { WorkspaceDetail } from "@/lib/content/editorial-workspace-contract";
import workspace from "./staff-content-workspace.module.css";
import panel from "./staff-decision-panel.module.css";
import styles from "./staff-publication-schedule.module.css";
const refusal: Record<
  "invalid" | "denied" | "unavailable" | "conflict" | "state" | "uncertain",
  string
> = {
  invalid: "Check the action, reason and date/time. No schedule was saved.",
  denied:
    "Your current access does not allow this request. Schedule details have been cleared.",
  unavailable:
    "Schedules could not be loaded. Reload them before making a decision.",
  conflict:
    "The publication changed first. Reload the page and review the plan again.",
  state:
    "This plan cannot be changed in its current state. Reload schedules and review the result.",
  uncertain:
    "The request may have been recorded. It will not be resent. Reload schedules, then refresh the page before deciding again.",
};
export const scheduleTimeMessage = {
  invalid: "Enter a valid date/time and IANA time zone.",
  ambiguous:
    "This time occurs twice in the selected zone. Choose an unambiguous time.",
  nonexistent:
    "This time does not exist in the selected zone. Choose another time.",
};
type Preview = {
  command: Exclude<ScheduleInput, { action: "status" }>;
  dueAt: string | null;
};
async function readSchedules(id: string): Promise<ScheduleResult> {
  try {
    return await runPublicationScheduleAction({ action: "status", id });
  } catch {
    return { kind: "unavailable" };
  }
}
export function StaffPublicationSchedule({
  detail,
  generation,
  canPublish,
  canMakeLive,
  canTakeOffline,
  disabled,
  onBusy,
  onDenied,
}: {
  detail: WorkspaceDetail;
  generation: number | null;
  canPublish: boolean;
  canMakeLive: boolean;
  canTakeOffline: boolean;
  disabled: boolean;
  onBusy: (v: boolean) => void;
  onDenied?: () => void;
}) {
  const [status, setStatus] = useState<ScheduleStatus | null>(null),
    [notice, setNotice] = useState(""),
    [action, setAction] = useState<ScheduleAction | "">(""),
    [localInput, setLocalInput] = useState(""),
    [timeZone, setTimeZone] = useState("UTC"),
    [reason, setReason] = useState(""),
    [preview, setPreview] = useState<Preview | null>(null),
    [busy, setBusy] = useState(false),
    [blocked, setBlocked] = useState(false);
  const lock = useRef(false),
    alive = useRef(true),
    sequence = useRef(0),
    heading = useRef<HTMLHeadingElement>(null),
    reviewButton = useRef<HTMLButtonElement>(null),
    reasonField = useRef<HTMLInputElement>(null),
    actionField = useRef<HTMLSelectElement>(null),
    timeField = useRef<HTMLInputElement>(null),
    previewHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const apply = useCallback(
    (result: ScheduleResult) => {
      if (result.kind === "status") setStatus(result.status);
      else {
        setStatus(null);
        setNotice(
          result.kind === "denied" ? refusal.denied : refusal.unavailable,
        );
        if (result.kind === "denied") onDenied?.();
      }
    },
    [onDenied],
  );
  const load = useCallback(async () => {
    const read = ++sequence.current;
    const result = await readSchedules(detail.id);
    if (alive.current && read === sequence.current) apply(result);
  }, [detail.id, apply]);
  const pending =
    status?.schedules.some((r) => r.state === "scheduled") === true;
  const ready =
    canPublish &&
    !disabled &&
    !busy &&
    !blocked &&
    status !== null &&
    generation !== null;
  function clearPreview() {
    setPreview(null);
    setNotice("");
  }
  function review() {
    if (!ready || pending) return;
    const trimmed = reason.trim();
    if (!publicationReason(trimmed)) {
      setNotice("Give a reason (1 to 200 characters).");
      reasonField.current?.focus();
      return;
    }
    if (
      !action ||
      (action === "publish" && !canMakeLive) ||
      (action === "withdraw" && !canTakeOffline)
    ) {
      setNotice("Choose an available scheduled action.");
      actionField.current?.focus();
      return;
    }
    const time = resolveScheduleTime(localInput, timeZone);
    if (time.kind !== "ready") {
      setNotice(scheduleTimeMessage[time.kind]);
      timeField.current?.focus();
      return;
    }
    setNotice("");
    setPreview({
      command: {
        action: "schedule",
        operation: crypto.randomUUID(),
        expected: generation!,
        id: detail.id,
        publicationAction: action,
        revision: action === "publish" ? detail.revision : null,
        sha: action === "publish" ? detail.bodySha256 : null,
        localInput: time.localInput,
        timeZone: time.timeZone,
        reason: trimmed,
      },
      dueAt: time.dueAt,
    });
    requestAnimationFrame(() => previewHeading.current?.focus());
  }
  function reviewCancel(record: ScheduleRecord) {
    if (!ready) return;
    const trimmed = reason.trim();
    if (!publicationReason(trimmed)) {
      setNotice("Give a cancellation reason (1 to 200 characters).");
      reasonField.current?.focus();
      return;
    }
    setNotice("");
    setPreview({
      command: {
        action: "cancel",
        id: detail.id,
        schedule: record.id,
        reason: trimmed,
      },
      dueAt: record.dueAt,
    });
    requestAnimationFrame(() => previewHeading.current?.focus());
  }
  async function confirm() {
    if (!preview || lock.current || !ready) return;
    lock.current = true;
    sequence.current++;
    setBusy(true);
    onBusy(true);
    setNotice("");
    const command = structuredClone(preview.command);
    try {
      const result = await runPublicationScheduleAction(command);
      if (!alive.current) return;
      if (result.kind === "recorded") {
        setNotice(
          result.record.state === "scheduled"
            ? "Schedule saved. It will not execute while the scheduler is paused."
            : result.record.state === "cancelled"
              ? "Schedule cancelled. This does not undo any completed publication."
              : scheduleLabel(result.record) +
                ". Reload the current publication status.",
        );
        setPreview(null);
        setStatus((current) =>
          current
            ? {
                ...current,
                schedules: [
                  result.record,
                  ...current.schedules.filter((r) => r.id !== result.record.id),
                ].slice(0, 10),
              }
            : null,
        );
        requestAnimationFrame(() => heading.current?.focus());
      } else {
        if (result.kind === "uncertain") setBlocked(true);
        if (result.kind === "denied") {
          setStatus(null);
          onDenied?.();
        }
        setPreview(null);
        setNotice(
          result.kind === "time"
            ? scheduleTimeMessage[result.problem]
            : result.kind === "status"
              ? refusal.uncertain
              : refusal[result.kind],
        );
        if (result.kind === "status") setBlocked(true);
      }
    } catch {
      if (alive.current) {
        setBlocked(true);
        setPreview(null);
        setNotice(refusal.uncertain);
      }
    } finally {
      lock.current = false;
      if (alive.current) {
        setBusy(false);
        onBusy(false);
      }
    }
  }
  const held = busy || disabled || blocked;
  return (
    <section
      className={styles.section}
      aria-labelledby="publication-schedule-heading"
      aria-busy={busy}
    >
      <h3 id="publication-schedule-heading" tabIndex={-1} ref={heading}>
        Scheduled publication
      </h3>
      <p>
        {status === null
          ? "Schedules not loaded."
          : status.executionEnabled
            ? "The scheduler is enabled. Due plans are checked again before execution."
            : "The scheduler is paused. Saved plans will not run while it is paused."}
      </p>
      <p>
        Only an approved revision can be scheduled. Publication or withdrawal
        still needs delivery to the live site; use Check live site to verify it.
      </p>
      <button
        type="button"
        className={workspace.button}
        disabled={busy || disabled}
        onClick={() => {
          setStatus(null);
          void load();
        }}
      >
        {status === null ? "Load schedules" : "Reload schedules"}
      </button>
      {canPublish && generation === null && (
        <p>
          The Owner must create the live baseline before plans can be saved.
        </p>
      )}
      {canPublish && generation !== null && (
        <>
          <label className={panel.note}>
            Schedule or cancellation reason (1 to 200 characters)
            <input
              ref={reasonField}
              value={reason}
              maxLength={200}
              disabled={held}
              onChange={(e) => {
                setReason(e.target.value);
                clearPreview();
              }}
            />
          </label>
          {!pending && (canMakeLive || canTakeOffline) && (
            <div className={styles.fields}>
              <label className={panel.note}>
                Scheduled action
                <select
                  ref={actionField}
                  value={action}
                  disabled={!ready}
                  onChange={(e) => {
                    setAction(e.target.value as ScheduleAction | "");
                    clearPreview();
                  }}
                >
                  <option value="">Choose an action</option>
                  {canMakeLive && (
                    <option value="publish">
                      Publish approved revision {detail.revision}
                    </option>
                  )}
                  {canTakeOffline && (
                    <option value="withdraw">Withdraw this item</option>
                  )}
                </select>
              </label>
              <label className={panel.note}>
                Local date and time
                <input
                  ref={timeField}
                  type="datetime-local"
                  step={60}
                  value={localInput}
                  disabled={!ready}
                  aria-describedby="schedule-time-help schedule-feedback"
                  onChange={(e) => {
                    setLocalInput(e.target.value);
                    clearPreview();
                  }}
                />
              </label>
              <label className={panel.note}>
                Time zone
                <input
                  value={timeZone}
                  list="publication-time-zones"
                  maxLength={100}
                  disabled={!ready}
                  aria-describedby="schedule-time-help"
                  onChange={(e) => {
                    setTimeZone(e.target.value);
                    clearPreview();
                  }}
                />
                <datalist id="publication-time-zones">
                  <option value="UTC" />
                  <option value="Africa/Nairobi" />
                  <option value="Europe/London" />
                  <option value="America/New_York" />
                  <option value="Asia/Kathmandu" />
                </datalist>
              </label>
              <p id="schedule-time-help">
                Use an IANA zone, such as Africa/Nairobi or UTC. Choose a time
                at least one minute and no more than 366 days ahead. Ambiguous
                or nonexistent daylight-saving times are refused.
              </p>
              <button
                ref={reviewButton}
                type="button"
                className={workspace.button}
                disabled={!ready}
                onClick={review}
              >
                Review schedule
              </button>
            </div>
          )}
          {pending && (
            <p>
              One plan is pending for this item. Cancel it before saving a
              replacement.
            </p>
          )}
        </>
      )}
      {preview && (
        <div
          className={styles.review}
          role="region"
          aria-label="Schedule confirmation"
        >
          <h4 ref={previewHeading} tabIndex={-1}>
            {preview.command.action === "schedule"
              ? "Review this schedule"
              : "Review cancellation"}
          </h4>
          {preview.command.action === "schedule" ? (
            <>
              <p>
                {preview.command.publicationAction === "publish"
                  ? "Publish approved revision " + preview.command.revision
                  : "Withdraw this item"}
                : {detail.title}
              </p>
              <p>
                Local: {preview.command.localInput.replace("T", " ")} (
                {preview.command.timeZone})
              </p>
              <p>
                UTC: <time dateTime={preview.dueAt!}>{preview.dueAt}</time>
              </p>
              <p>
                Saving this plan does not publish immediately or enable the
                scheduler.
              </p>
            </>
          ) : (
            <p>
              Cancel the pending plan for {detail.title}? Completed publication
              cannot be undone here.
            </p>
          )}
          <p>Reason: {preview.command.reason}</p>
          <div className={styles.buttons}>
            <button
              type="button"
              className={workspace.button}
              disabled={held}
              onClick={() => void confirm()}
            >
              {preview.command.action === "schedule"
                ? "Save schedule"
                : "Confirm cancellation"}
            </button>
            <button
              type="button"
              className={workspace.button}
              disabled={busy}
              onClick={() => {
                setPreview(null);
                requestAnimationFrame(() =>
                  (reviewButton.current ?? heading.current)?.focus(),
                );
              }}
            >
              Back to plan
            </button>
          </div>
        </div>
      )}
      <p
        id="schedule-feedback"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {busy
          ? "Checking current access and recording the schedule request…"
          : notice}
      </p>
      {status && (
        <div className={styles.history}>
          <h4>Recent plans (up to 10)</h4>
          {status.schedules.length === 0 ? (
            <p>No schedules recorded for this item.</p>
          ) : (
            <ul>
              {status.schedules.map((r) => (
                <li key={r.id}>
                  <strong>
                    {r.action === "publish"
                      ? "Publish revision " + r.revision
                      : "Withdraw item"}{" "}
                    — {scheduleLabel(r)}
                  </strong>
                  <p>
                    Local: {r.localInput.replace("T", " ")} ({r.timeZone})<br />
                    UTC: <time dateTime={r.dueAt}>{r.dueAt}</time>
                  </p>
                  {r.failure && <p>{scheduleFailure[r.failure]}</p>}
                  {r.outcomeGeneration !== null && (
                    <p>
                      Recorded in generation {r.outcomeGeneration}; check
                      delivery separately.
                    </p>
                  )}
                  {canPublish && r.state === "scheduled" && (
                    <button
                      type="button"
                      className={workspace.button}
                      disabled={!ready}
                      onClick={() => reviewCancel(r)}
                    >
                      Cancel pending schedule
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
