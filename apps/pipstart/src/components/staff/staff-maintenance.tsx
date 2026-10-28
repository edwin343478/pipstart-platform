"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { getSupabasePublicConfiguration } from "@/lib/supabase/config";
import { readStaffFactors, type StaffFactor } from "@/lib/auth/staff-mfa-flow";
import {
  authorizeStaffAccountRequest,
  type AccountProof,
} from "@/lib/auth/staff-account-proof";
import {
  parseMaintenanceReview,
  type MaintenanceReview,
} from "@/lib/auth/staff-maintenance-contract";
import { executeMaintenanceAction } from "@/app/admin/maintenance/actions";
import styles from "./staff-maintenance.module.css";
type MaintenanceResult = Awaited<ReturnType<typeof executeMaintenanceAction>>;
export type NoticeTone = "success" | "warning" | "error" | "info";
export type Notice = { tone: NoticeTone; text: string };
const EMPTY: Notice = { tone: "info", text: "" };
// Text carries the meaning; tone only adds a visual cue.
const LABELS: Record<NoticeTone, string> = {
  success: "Recorded",
  warning: "Check required",
  error: "Stopped",
  info: "Note",
};
const UNCERTAIN =
  "The result is uncertain. Do not repeat the action. Inspect and reconcile the exact request with the operator.";
export function outcomeNotice(result: MaintenanceResult | null): Notice {
  if (result?.kind === "recorded")
    return result.outcome === "succeeded"
      ? {
          tone: "success",
          text: "Provider acknowledgment recorded. Staff remains paused. This does not re-enable staff access.",
        }
      : {
          tone: "warning",
          text: "The provider outcome is uncertain. Do not repeat the action. Inspect and reconcile the exact request with the operator.",
        };
  if (result?.kind === "observed")
    return {
      tone: "info",
      text: `Read-only observation: ${result.observation}. Journal state: ${result.journalState}. Observation does not prove causality or resolve an in-flight operation. Staff remains paused.`,
    };
  if (
    result?.kind === "disabled" ||
    result?.kind === "invalid" ||
    result?.kind === "denied"
  )
    return {
      tone: "error",
      text: "The request was not authorized or the transport is disabled. Check the journal with the operator before attempting any further action.",
    };
  return { tone: "warning", text: UNCERTAIN };
}
// Fixed, unambiguous UTC that wraps at spaces on narrow screens.
export function formatUtc(iso: string | null) {
  if (iso === null) return "Not applicable";
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return iso;
  return new Date(time).toISOString().slice(0, 19).replace("T", " ") + " UTC";
}
export function MaintenanceReviewDetails({
  review,
  mode,
  acted,
}: {
  review: MaintenanceReview;
  mode: "dispatch" | "inspect";
  acted: boolean;
}) {
  return (
    <div className={styles.review}>
      <h2>
        {acted
          ? "Request as reviewed before this action"
          : "Exact request review"}
      </h2>
      {acted && (
        <p className={styles.hint}>
          These details were captured before the action. The journal may have
          changed since; inspect to read its recorded state.
        </p>
      )}
      <dl>
        <dt>Request</dt>
        <dd>{review.request_id}</dd>
        <dt>Staff account ID</dt>
        <dd>{review.target_id}</dd>
        <dt>Action</dt>
        <dd>
          {review.operation === "auth_suspend"
            ? "Suspend Auth account"
            : "Resume Auth account"}
        </dd>
        <dt>Suspension ends</dt>
        <dd>
          {review.suspend_until === null ? (
            formatUtc(null)
          ) : (
            <time dateTime={review.suspend_until}>
              {formatUtc(review.suspend_until)}
            </time>
          )}
        </dd>
        <dt>Reason</dt>
        <dd>{review.reason.replaceAll("_", " ")}</dd>
        <dt>{acted ? "Journal state at review" : "Journal state"}</dt>
        <dd>{review.state}</dd>
        <dt>Mode</dt>
        <dd>
          {mode === "dispatch" ? "One provider action" : "Read-only inspection"}
        </dd>
      </dl>
    </div>
  );
}
export function StaffMaintenance({ userId }: { userId: string }) {
  const client = useMemo(() => {
    const c = getSupabasePublicConfiguration();
    return c ? createBrowserClient(c.url, c.publishableKey) : null;
  }, []);
  const [factors, setFactors] = useState<StaffFactor[]>([]),
    [factor, setFactor] = useState(""),
    [code, setCode] = useState(""),
    [request, setRequest] = useState(""),
    [mode, setMode] = useState<"dispatch" | "inspect">("dispatch");
  const [stage, setStage] = useState<"edit" | "busy" | "review" | "finished">(
      "edit",
    ),
    [proof, setProof] = useState<AccountProof | null>(null),
    [review, setReview] = useState<MaintenanceReview | null>(null),
    [notice, setNotice] = useState<Notice>(EMPTY);
  const lock = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    let active = true;
    if (client)
      void readStaffFactors(client, userId).then((r) => {
        if (!active) return;
        if (r.kind === "ready" && r.factors.length) {
          setFactors(r.factors);
          setFactor(r.factors[0].id);
        } else
          setNotice({
            tone: "error",
            text: "A verified authenticator is required. Use the reviewed Owner recovery procedure if it is unavailable.",
          });
      });
    return () => {
      active = false;
    };
  }, [client, userId]);
  useEffect(() => {
    if (stage !== "busy") heading.current?.focus();
  }, [stage]);
  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current || !client || stage !== "edit") return;
    lock.current = true;
    setStage("busy");
    setProof(null);
    setReview(null);
    setNotice(EMPTY);
    const submitted = code;
    setCode("");
    try {
      const authorized = await authorizeStaffAccountRequest(
        client,
        userId,
        request,
        mode,
        factor,
        submitted,
      );
      if (authorized.kind !== "ready") {
        setNotice({
          tone: "error",
          text: "Verification was not accepted. Staff must be paused and this account must be an active Owner. No provider action was requested.",
        });
        setStage("edit");
        return;
      }
      const reply = await client
        .rpc("pipstart_staff_maintenance_review", {
          p_request: authorized.proof.request,
          p_mode: authorized.proof.mode,
          p_token: authorized.proof.token,
        })
        .abortSignal(AbortSignal.timeout(8_000));
      const parsed = reply.error
        ? null
        : parseMaintenanceReview(reply.data, authorized.proof.request);
      if (
        !parsed ||
        parsed.target_id === userId ||
        (mode === "dispatch" && parsed.state !== "prepared")
      ) {
        setNotice({
          tone: "warning",
          text: "The exact prepared request could not be reviewed. Do not dispatch. Ask the operator to inspect its journal state.",
        });
        setStage("finished");
        return;
      }
      setProof(authorized.proof);
      setReview(parsed);
      setStage("review");
    } catch {
      setNotice({
        tone: "warning",
        text: "Verification or review was unavailable. No provider action was requested.",
      });
      setStage("edit");
    } finally {
      lock.current = false;
    }
  }
  async function confirm() {
    if (lock.current || stage !== "review" || !proof || !review) return;
    if (Date.parse(proof.expiresAt) <= Date.now()) {
      setProof(null);
      setReview(null);
      setNotice({
        tone: "warning",
        text: "Verification expired. Verify again before continuing.",
      });
      setStage("edit");
      return;
    }
    lock.current = true;
    setStage("busy");
    const bound = proof;
    setProof(null);
    try {
      setNotice(outcomeNotice(await executeMaintenanceAction(bound)));
    } catch {
      setNotice(outcomeNotice(null));
    } finally {
      lock.current = false;
      setStage("finished");
    }
  }
  return (
    <section className={styles.panel} aria-busy={stage === "busy"}>
      <p className={styles.eyebrow}>Account security · Paused staff</p>
      <h1 ref={heading} tabIndex={-1}>
        Owner staff maintenance
      </h1>
      <p>
        Execute or inspect one operator-prepared suspension or resumption
        request for a current or former staff account. A live Owner account and
        fresh authenticator verification are required. General staff access
        stays paused.
      </p>
      <p>
        Account suspension is not immediate revocation of every existing Auth
        token. Protected staff requests also check the live account state.
      </p>
      {stage === "edit" && (
        <form onSubmit={verify} className={styles.form}>
          <label htmlFor="maintenance-request">
            Exact operator-prepared request ID
          </label>
          <input
            id="maintenance-request"
            required
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            maxLength={36}
            autoComplete="off"
            spellCheck={false}
          />
          <label htmlFor="maintenance-mode">Request mode</label>
          <select
            id="maintenance-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as "dispatch" | "inspect")}
          >
            <option value="dispatch">Execute prepared action once</option>
            <option value="inspect">Inspect provider state only</option>
          </select>
          <label htmlFor="maintenance-factor">Authenticator</label>
          <select
            id="maintenance-factor"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            required
          >
            <option value="">Select authenticator</option>
            {factors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <label htmlFor="maintenance-code">
            Current six-digit authenticator code
          </label>
          <input
            id="maintenance-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
          />
          <button type="submit" disabled={!client || !factors.length}>
            Verify and review request
          </button>
          <p>Verification alone does not execute the provider action.</p>
        </form>
      )}
      {review && (
        <MaintenanceReviewDetails
          review={review}
          mode={mode}
          acted={stage === "finished"}
        />
      )}
      {stage === "review" && (
        <div className={styles.actions}>
          <button type="button" onClick={() => void confirm()}>
            {mode === "dispatch"
              ? "Confirm exact action once"
              : "Confirm read-only inspection"}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              setProof(null);
              setReview(null);
              setStage("edit");
              setNotice({
                tone: "info",
                text: "Local review dismissed. The operator-prepared journal request was not cancelled.",
              });
            }}
          >
            Dismiss review
          </button>
        </div>
      )}
      {stage === "busy" && (
        <p role="status">
          Checking the exact request. Do not repeat or reload this operation.
        </p>
      )}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.notice}
        data-tone={notice.text ? notice.tone : undefined}
      >
        {notice.text && <strong>{LABELS[notice.tone]}: </strong>}
        {notice.text}
      </p>
      {stage === "finished" && (
        <button
          type="button"
          onClick={() => {
            setMode("inspect");
            setReview(null);
            setProof(null);
            setCode("");
            setStage("edit");
          }}
        >
          Prepare a fresh read-only inspection
        </button>
      )}
      <p>
        Request creation, cancellation, uncertainty resolution, factor recovery
        and retirement remain reviewed operator procedures. This page cannot
        enable staff, grant roles or remove factors.
      </p>
    </section>
  );
}
