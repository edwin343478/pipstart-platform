"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { readStaffFactors, type StaffFactor } from "@/lib/auth/staff-mfa-flow";
import type { LiveStaffAccess } from "@/lib/auth/staff-role-flow";
import {
  prepareLearnerProvider,
  prepareLearnerInspection,
  readLearnerDelivery,
  type LearnerProof,
  type LearnerDeliveryState,
} from "@/lib/auth/staff-learner-flow";
import { executeLearnerProviderAction } from "@/app/admin/staff/people/account-actions";
import type { LearnerCommand } from "@/lib/auth/staff-learner-intent";
import styles from "./staff.module.css";
import visual from "@/components/admin-preview/admin-preview.module.css";
export function StaffLearnerAccount({
  client,
  access,
  person,
  onClose,
}: {
  client: SupabaseClient;
  access: LiveStaffAccess;
  person: {
    user_id: string;
    display_name: string;
    staff_active: boolean | null;
  };
  onClose: () => void;
}) {
  const [operation, setOperation] =
      useState<LearnerCommand["operation"]>("auth_suspend"),
    [until, setUntil] = useState(""),
    [reason, setReason] =
      useState<LearnerCommand["reason"]>("security_response");
  const [factors, setFactors] = useState<StaffFactor[]>([]),
    [factor, setFactor] = useState(""),
    [code, setCode] = useState("");
  const [stage, setStage] = useState<
      "edit" | "busy" | "review" | "unknown" | "done" | "blocked"
    >("edit"),
    [proof, setProof] = useState<LearnerProof | null>(null),
    [request, setRequest] = useState(""),
    [lookup, setLookup] = useState(""),
    [state, setState] = useState<LearnerDeliveryState | null>(null),
    [message, setMessage] = useState("");
  const lock = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  const allowed =
    person.staff_active === null &&
    person.user_id !== access.user_id &&
    access.capabilities.includes("people.manage_learners") &&
    (access.roles.includes("owner") || access.roles.includes("administrator"));
  useEffect(() => {
    let active = true;
    void readStaffFactors(client, access.user_id).then((r) => {
      if (!active) return;
      if (r.kind !== "ready" || !r.factors.length) {
        setStage("blocked");
        setMessage("Return to staff verification before account actions.");
        return;
      }
      setFactors(r.factors);
      setFactor(r.factors[0].id);
    });
    return () => {
      active = false;
    };
  }, [client, access.user_id]);
  useEffect(() => {
    if (stage !== "busy") heading.current?.focus();
  }, [stage]);
  async function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !allowed || stage !== "edit") return;
    lock.current = true;
    setStage("busy");
    setMessage("");
    const submitted = code;
    setCode("");
    try {
      let expiry: string | null = null;
      if (operation === "auth_suspend") {
        const date = new Date(until);
        if (!Number.isFinite(date.getTime())) {
          setStage("edit");
          setMessage("Choose a valid suspension end time.");
          return;
        }
        expiry = date.toISOString();
      }
      const command: LearnerCommand = {
        request: crypto.randomUUID(),
        target: person.user_id,
        operation,
        until: expiry,
        reason,
      };
      setRequest(command.request);
      const r = await prepareLearnerProvider(
        client,
        access.user_id,
        command,
        factor,
        submitted,
      );
      if (r.kind === "ready") {
        setProof(r.proof);
        setStage("review");
        setMessage("Review the exact account request before confirming.");
      } else {
        setStage(
          r.kind === "rejected" || r.kind === "invalid" ? "edit" : "blocked",
        );
        setMessage(
          "Verification or current permission could not be confirmed. No provider action was requested.",
        );
      }
    } catch {
      setStage("blocked");
      setMessage("Verification is unavailable. Return to staff verification.");
    } finally {
      lock.current = false;
    }
  }
  async function execute() {
    if (lock.current || stage !== "review" || !proof) return;
    lock.current = true;
    setStage("busy");
    const selected = proof;
    setProof(null);
    try {
      const r = await executeLearnerProviderAction({
        mode: "dispatch",
        command: selected.command,
        token: selected.token,
      });
      setRequest(selected.command.request);
      setLookup(selected.command.request);
      if (r.kind === "recorded" && r.outcome === "succeeded") {
        setStage("done");
        setMessage(
          "The provider acknowledged this account request. This does not change staff permissions.",
        );
      } else if (r.kind === "disabled" || r.kind === "invalid") {
        setStage("blocked");
        setMessage(
          "Account actions are unavailable. No new provider attempt was started.",
        );
      } else {
        setStage("unknown");
        setMessage(
          "The outcome is not confirmed. Do not submit another request. Check the record or inspect only; save the reference for Owner review.",
        );
      }
    } catch {
      setStage("unknown");
      setMessage(
        "The response was lost. Do not repeat the request. Save the reference and check the record only.",
      );
    } finally {
      lock.current = false;
    }
  }
  async function read() {
    if (lock.current) return;
    const ref = lookup.trim() || request;
    if (!ref) return;
    lock.current = true;
    setStage("busy");
    setProof(null);
    setCode("");
    setRequest(ref);
    try {
      const r = await readLearnerDelivery(
        client,
        access.user_id,
        ref,
        person.user_id,
      );
      if (r.kind === "ready") {
        setState(r);
        setStage(r.state === "succeeded" ? "done" : "unknown");
        setMessage(
          `Recorded delivery state: ${r.state.replaceAll("_", " ")}. This check does not send an account request.`,
        );
      } else {
        setState(null);
        setStage("unknown");
        setMessage(
          "The record is unavailable. Absence of a response does not prove the earlier request cannot finish. Ask the Owner to review.",
        );
      }
    } catch {
      setState(null);
      setStage("unknown");
      setMessage(
        "Record check is unavailable. Do not repeat the account request.",
      );
    } finally {
      lock.current = false;
    }
  }
  async function inspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !state || state.state === "intent_only") return;
    lock.current = true;
    setStage("busy");
    const submitted = code;
    setCode("");
    try {
      const p = await prepareLearnerInspection(
        client,
        access.user_id,
        state.request,
        factor,
        submitted,
      );
      if (p.kind !== "ready") {
        setStage("unknown");
        setMessage(
          "Fresh inspection verification was not accepted. No account update was requested.",
        );
        return;
      }
      const r = await executeLearnerProviderAction({
        mode: "inspect",
        request: state.request,
        token: p.token,
      });
      setStage("unknown");
      setMessage(
        r.kind === "observed"
          ? `Provider observation: ${r.observation}. Observation does not prove causality or resolve the recorded request. No account update was requested.`
          : "Provider inspection is unavailable. Do not repeat the account request; ask the Owner to review.",
      );
    } catch {
      setStage("unknown");
      setMessage("Inspection is unavailable. No account update was requested.");
    } finally {
      lock.current = false;
    }
  }
  return (
    <section
      className={`${visual.panel} ${styles.learnerPanel}`}
      aria-labelledby="learner-account-title"
      aria-busy={stage === "busy"}
    >
      <h2 id="learner-account-title" tabIndex={-1} ref={heading}>
        Learner account: {person.display_name}
      </h2>
      <p>Reference: {person.user_id}</p>
      <p>
        Suspension blocks new logins until the chosen end time. Existing learner
        sessions may remain usable until they expire or sign out. Reactivation
        does not restore staff access.
      </p>
      {!allowed ? (
        <p role="status">
          This target is not eligible for learner account actions.
        </p>
      ) : (
        <>
          {stage === "edit" && (
            <form className={styles.learnerForm} onSubmit={prepare}>
              <label>
                Account action
                <select
                  className={styles.input}
                  value={operation}
                  onChange={(e) =>
                    setOperation(e.target.value as LearnerCommand["operation"])
                  }
                >
                  <option value="auth_suspend">Suspend learner login</option>
                  <option value="auth_resume">Reactivate learner login</option>
                </select>
              </label>
              {operation === "auth_suspend" && (
                <label>
                  Suspension end time (your device time)
                  <input
                    className={styles.input}
                    type="datetime-local"
                    required
                    value={until}
                    onChange={(e) => setUntil(e.target.value)}
                  />
                </label>
              )}
              <label>
                Reason
                <select
                  className={styles.input}
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value as LearnerCommand["reason"])
                  }
                >
                  <option value="security_response">Security response</option>
                  <option value="access_change">Access change</option>
                </select>
              </label>
              <label>
                Verified authenticator
                <select
                  className={styles.input}
                  value={factor}
                  onChange={(e) => setFactor(e.target.value)}
                  required
                >
                  <option value="">Choose an authenticator</option>
                  {factors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fresh six-digit authenticator code
                <input
                  className={styles.input}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                />
              </label>
              <button
                className={styles.button}
                type="submit"
                disabled={!factor}
              >
                Verify and review
              </button>
            </form>
          )}
          {stage === "review" && proof && (
            <div className={styles.learnerReview}>
              <h3>Confirm the exact learner request</h3>
              <p>
                {proof.command.operation === "auth_suspend"
                  ? "Suspend learner login"
                  : "Reactivate learner login"}
                : {person.display_name}
              </p>
              <p>Target: {proof.command.target}</p>
              <p>End time: {proof.command.until ?? "Not applicable"}</p>
              <p>Reason: {proof.command.reason.replaceAll("_", " ")}</p>
              <p>Request: {proof.command.request}</p>
              <button
                className={styles.button}
                type="button"
                onClick={() => void execute()}
              >
                Confirm account request once
              </button>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => {
                  setProof(null);
                  setStage("edit");
                  setCode("");
                }}
              >
                Discard review
              </button>
            </div>
          )}
          {request && (
            <p>
              Request reference: <code>{request}</code>
            </p>
          )}
          {(stage === "edit" ||
            stage === "unknown" ||
            stage === "done" ||
            stage === "blocked") && (
            <div className={styles.learnerLookup}>
              <label>
                Existing request reference
                <input
                  className={styles.input}
                  value={lookup}
                  onChange={(e) => setLookup(e.target.value)}
                  autoComplete="off"
                  maxLength={36}
                />
              </label>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => void read()}
                disabled={!lookup.trim() && !request}
              >
                Check recorded outcome only
              </button>
            </div>
          )}
          {(stage === "unknown" || stage === "done") &&
            state &&
            state.state !== "intent_only" && (
              <form className={styles.learnerForm} onSubmit={inspect}>
                <p>
                  Inspect the provider only. Use a new authenticator
                  verification for this read; no suspension or reactivation is
                  sent.
                </p>
                <label>
                  Authenticator
                  <select
                    className={styles.input}
                    value={factor}
                    onChange={(e) => setFactor(e.target.value)}
                    required
                  >
                    {factors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Fresh six-digit inspection code
                  <input
                    className={styles.input}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    pattern="[0-9]{6}"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </label>
                <button className={styles.secondary} type="submit">
                  Verify and inspect only
                </button>
              </form>
            )}
        </>
      )}
      <p role="status" aria-live="polite">
        {message}
      </p>
      <button
        type="button"
        className={styles.secondary}
        disabled={stage === "busy"}
        onClick={() => {
          setCode("");
          setProof(null);
          onClose();
        }}
      >
        Close account panel
      </button>
    </section>
  );
}
