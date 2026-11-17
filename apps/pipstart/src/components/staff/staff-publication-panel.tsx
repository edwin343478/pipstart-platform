"use client";
import { actionLimitMessage } from "@/lib/content/staff-action-limit";
import { StaffPublicationSchedule } from "./staff-publication-schedule";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  runPublicationDeliveryAction,
  runPublicationAction,
} from "@/app/admin/staff/content/publication-actions";
import {
  publicationReason,
  type PublicationInput,
  type PublicationResult,
  type PublicationStatus,
} from "@/lib/content/publication-contract";
import {
  deliveryMessage,
  type DeliveryInput,
} from "@/lib/content/publication-delivery-contract";
import type { WorkspaceDetail } from "@/lib/content/editorial-workspace-contract";
import s from "@/components/admin-preview/admin-preview.module.css";
import workspace from "./staff-content-workspace.module.css";
import styles from "./staff-revision-history.module.css";
import panel from "./staff-decision-panel.module.css";

const refreshLabel: Record<
  NonNullable<PublicationStatus["refresh"]>["state"],
  string
> = {
  pending: "waiting for delivery to the live site",
  processing: "being delivered to the live site",
  verified: "verified on the live site",
  failed: "delivery failed; check the live site before retrying",
  superseded: "replaced by a newer generation",
};
const refusal: Record<
  Exclude<PublicationResult["kind"], "status" | "done">,
  string
> = {
  limited: actionLimitMessage(null),
  invalid:
    "The store refused this change. Reload and check it before trying again. Nothing was changed.",
  denied:
    "You cannot make this change. Access is checked again on every request. Nothing was changed.",
  unavailable:
    "The live publication could not be reached. Nothing was changed. Reload and try again.",
  conflict:
    "Someone changed the live publication first. Reload the status and decide again. Nothing was changed.",
  state:
    "This change is not possible in the current state (for example, publish the parent first, or take the contents offline first). Nothing was changed.",
  uncertain:
    "The change may or may not have been recorded. It will not be resent. Reload the status to see the live generation.",
  references:
    "This revision points at pages or images this site does not have. Fix them in the editor first. Nothing was changed.",
};
/** MP10b: the refusal plus the first missing pages or images, one per line. */
export function referencesMessage(result: {
  total: number;
  references: string[];
}) {
  const lines = [refusal.references, ...result.references];
  if (result.total > result.references.length)
    lines.push(`…and ${result.total - result.references.length} more.`);
  return lines.join("\n");
}
const operation = () => crypto.randomUUID();
type PublicationRead =
  { status: PublicationStatus; configured: boolean } | { message: string };
async function readStatus(id: string | null): Promise<PublicationRead> {
  try {
    const result = await runPublicationAction({ action: "status", id });
    return result.kind === "status"
      ? {
          status: result.status,
          configured: result.deliveryConfigured === true,
        }
      : {
          message: refusal[result.kind === "done" ? "uncertain" : result.kind],
        };
  } catch {
    return { message: refusal.unavailable };
  }
}
export function liveSummary(status: PublicationStatus | null) {
  if (!status) return "Live status not loaded.";
  if (status.generation === null)
    return "Nothing is live from the store yet. Learner pages read the published code.";
  const refresh = status.refresh
    ? refreshLabel[status.refresh.state]
    : "no delivery record";
  return `Live generation ${status.generation}: ${refresh}.`;
}

/** Shared state and one-write-at-a-time sending for both panels. */
function usePublication(id: string | null) {
  const [status, setStatus] = useState<PublicationStatus | null>(null),
    [configured, setConfigured] = useState(false),
    [busy, setBusy] = useState(false),
    [blocked, setBlocked] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false);
  // Applies a status read; used on first load (from a promise callback) and after each change.
  const apply = useCallback((r: PublicationRead) => {
    if ("status" in r) {
      setStatus(r.status);
      setConfigured(r.configured);
    } else setMessage(r.message);
  }, []);
  const load = useCallback(
    async () => apply(await readStatus(id)),
    [apply, id],
  );
  useEffect(() => {
    let current = true;
    void readStatus(id).then((r) => {
      if (current) apply(r);
    });
    return () => {
      current = false;
    };
  }, [apply, id]);
  async function send(
    input: PublicationInput,
    done: (generation: number) => string,
  ) {
    if (lock.current || blocked) return false;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const result = await runPublicationAction(input);
      if (result.kind === "done") {
        setMessage(
          done(result.generation) +
            (result.delivery ? " " + deliveryMessage[result.delivery] : ""),
        );
        await load();
        return true;
      }
      if (result.kind === "references") {
        setMessage(referencesMessage(result));
        return false;
      }
      if (result.kind === "uncertain") setBlocked(true);
      setMessage(
        result.kind === "limited"
          ? actionLimitMessage(result.retryAfter)
          : refusal[result.kind === "status" ? "uncertain" : result.kind],
      );
      if (result.kind === "status" || result.kind === "uncertain")
        setBlocked(true);
      return false;
    } catch {
      setBlocked(true);
      setMessage(refusal.uncertain);
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function delivery(action: DeliveryInput["action"]) {
    if (lock.current || !status?.generation) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const r = await runPublicationDeliveryAction({
        action,
        generation: status.generation,
      });
      setMessage(deliveryMessage[r.kind]);
    } catch {
      setMessage(deliveryMessage.unknown);
    } finally {
      await load();
      lock.current = false;
      setBusy(false);
    }
  }
  return {
    status,
    configured,
    busy,
    blocked,
    message,
    setMessage,
    send,
    load,
    delivery,
  };
}

function Reason({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <label className={panel.note}>
      {label}
      <input
        maxLength={200}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/** Library-level: what is live, the one-time baseline and restoring an earlier generation. */
export function StaffLivePublication({
  isOwner,
  canManageDelivery = isOwner,
}: {
  isOwner: boolean;
  canManageDelivery?: boolean;
}) {
  const p = usePublication(null);
  const [reason, setReason] = useState(""),
    [from, setFrom] = useState("");
  const g = p.status?.generation ?? null;
  const ready = !p.busy && !p.blocked && p.status !== null;
  return (
    <section
      className={`${s.panel} ${styles.history}`}
      aria-labelledby="live-heading"
      aria-busy={p.busy}
    >
      <h2 id="live-heading">Live publication</h2>
      <p>{liveSummary(p.status)}</p>
      <p>
        Learner pages change only when a new generation is delivered to the live
        site. Until a content type is switched to the store, its learner pages
        keep reading the published code.
      </p>
      {g !== null && p.status?.refresh && (
        <p>Delivery attempts: {p.status.refresh.attempts} of 20.</p>
      )}
      {p.status && !p.configured && <p>Delivery is not configured.</p>}
      {canManageDelivery && g !== null && (
        <div className={styles.actions}>
          <button
            type="button"
            className={workspace.button}
            disabled={p.busy}
            onClick={() => void p.delivery("check")}
          >
            Check live site
          </button>
          {p.status?.refresh &&
            ["pending", "failed"].includes(p.status.refresh.state) &&
            p.status.refresh.attempts < 20 &&
            p.configured && (
              <button
                type="button"
                className={workspace.button}
                disabled={p.busy}
                onClick={() => {
                  if (
                    window.confirm(
                      "Request a new deployment for this generation? A previous unconfirmed request may already have been accepted. This does not repeat publication.",
                    )
                  )
                    void p.delivery("retry");
                }}
              >
                Retry delivery
              </button>
            )}
        </div>
      )}
      {isOwner && p.status && (
        <>
          <Reason
            label="Reason (1 to 200 characters)"
            value={reason}
            onChange={setReason}
            disabled={!ready}
          />
          {g === null ? (
            <button
              type="button"
              className={workspace.button}
              disabled={!ready}
              onClick={() => {
                const r = reason.trim();
                if (!publicationReason(r))
                  return p.setMessage(
                    "Give a reason first. Nothing was changed.",
                  );
                if (
                  !window.confirm(
                    "Create the live baseline from every approved item? This is generation 1 and can be done once.",
                  )
                )
                  return;
                void p.send(
                  { action: "baseline", operation: operation(), reason: r },
                  (n) => `Baseline created as generation ${n}.`,
                );
              }}
            >
              Create the live baseline
            </button>
          ) : (
            <div className={styles.actions}>
              <label className={panel.note}>
                Generation to restore
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={from}
                  disabled={!ready}
                  onChange={(e) => setFrom(e.target.value.replace(/\D/g, ""))}
                />
              </label>
              <button
                type="button"
                className={workspace.button}
                disabled={!ready || !from}
                onClick={() => {
                  const r = reason.trim(),
                    n = Number(from);
                  if (!publicationReason(r))
                    return p.setMessage(
                      "Give a reason first. Nothing was changed.",
                    );
                  if (!Number.isSafeInteger(n) || n < 1 || n >= g)
                    return p.setMessage(
                      `Choose an earlier generation, 1 to ${g - 1}. Nothing was changed.`,
                    );
                  if (
                    !window.confirm(
                      `Make generation ${n}'s content live again as generation ${g + 1}?`,
                    )
                  )
                    return;
                  void p.send(
                    {
                      action: "restore",
                      operation: operation(),
                      expected: g,
                      from: n,
                      reason: r,
                    },
                    (next) => `Generation ${n} restored as generation ${next}.`,
                  );
                }}
              >
                Restore generation
              </button>
            </div>
          )}
        </>
      )}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ whiteSpace: "pre-line" }}
      >
        {p.busy
          ? "Checking live staff access and recording the change…"
          : p.message}
      </p>
    </section>
  );
}

/** Item-level: this item's live revision, making the approved latest revision live, or taking it offline. */
export function StaffItemPublication({
  detail,
  canPublish,
  canRevoke = false,
  onChanged,
}: {
  detail: WorkspaceDetail;
  canPublish: boolean;
  /** An assigned Affiliate Manager may take a live link offline (MP09); the store decides. */
  canRevoke?: boolean;
  onChanged: (message: string) => void;
}) {
  const p = usePublication(detail.id);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const scheduleAccessChanged = useCallback(
    () => onChanged("Access to this item changed."),
    [onChanged],
  );
  const [reason, setReason] = useState("");
  const g = p.status?.generation ?? null,
    live = p.status?.published ?? null;
  const approved = detail.state === "approved" && !detail.trashed;
  const canMakeLive =
    canPublish &&
    g !== null &&
    approved &&
    live?.bodySha256 !== detail.bodySha256;
  const canTakeOffline =
    (canPublish || canRevoke) && g !== null && live !== null;
  const ready = !p.busy && !p.blocked && !scheduleBusy;
  function act(kind: "publish" | "withdraw") {
    const r = reason.trim();
    if (!publicationReason(r))
      return p.setMessage("Give a reason first. Nothing was changed.");
    if (g === null) return;
    const question =
      kind === "publish"
        ? `Make revision ${detail.revision} of ${detail.id} live? Learner pages change when the new generation is delivered.`
        : `Take ${detail.id} offline? Learner pages change when the new generation is delivered.`;
    if (!window.confirm(question)) return;
    const input: PublicationInput =
      kind === "publish"
        ? {
            action: "publish",
            operation: operation(),
            expected: g,
            id: detail.id,
            revision: detail.revision,
            sha: detail.bodySha256,
            reason: r,
          }
        : {
            action: "withdraw",
            operation: operation(),
            expected: g,
            id: detail.id,
            reason: r,
          };
    void p
      .send(input, (n) =>
        kind === "publish"
          ? `Made live in generation ${n}.`
          : `Taken offline in generation ${n}.`,
      )
      .then((ok) => {
        if (ok)
          onChanged(
            (kind === "publish" ? "Made live" : "Taken offline") +
              ` in generation ${g + 1}. Revision reloaded.`,
          );
      });
  }
  return (
    <section
      className={`${s.panel} ${styles.history}`}
      aria-labelledby="item-live-heading"
      aria-busy={p.busy}
    >
      <h2 id="item-live-heading">Live publication of this item</h2>
      <p>
        {p.status === null
          ? "Live status not loaded."
          : g === null
            ? "Nothing is live from the store yet. The Owner creates the live baseline first."
            : live === null
              ? `Not live in generation ${g}.`
              : live.bodySha256 === detail.bodySha256
                ? `Revision ${live.revision} (this revision) is live in generation ${g}.`
                : `Revision ${live.revision} is live in generation ${g}; this revision is not.`}
      </p>
      {canPublish && g !== null && !approved && (
        <p>Only an approved revision can be made live.</p>
      )}
      {(canMakeLive || canTakeOffline) && (
        <Reason
          label="Reason (1 to 200 characters)"
          value={reason}
          onChange={setReason}
          disabled={!ready}
        />
      )}
      <div className={styles.actions}>
        {canMakeLive && (
          <button
            type="button"
            className={workspace.button}
            disabled={!ready}
            onClick={() => act("publish")}
          >
            Make revision {detail.revision} live
          </button>
        )}
        {canTakeOffline && (
          <button
            type="button"
            className={workspace.button}
            disabled={!ready}
            onClick={() => act("withdraw")}
          >
            Take offline
          </button>
        )}
      </div>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ whiteSpace: "pre-line" }}
      >
        {p.busy
          ? "Checking live staff access and recording the change…"
          : p.message}
      </p>
      <StaffPublicationSchedule
        detail={detail}
        generation={g}
        canPublish={canPublish}
        canMakeLive={canMakeLive}
        canTakeOffline={canTakeOffline}
        disabled={p.busy || p.blocked}
        onBusy={setScheduleBusy}
        onDenied={scheduleAccessChanged}
      />
    </section>
  );
}
