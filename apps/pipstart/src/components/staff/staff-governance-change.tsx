"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { readStaffFactors, type StaffFactor } from "@/lib/auth/staff-mfa-flow";
import {
  completeGovernanceIntent,
  mayChangeGovernance,
  prepareGovernanceIntent,
  STAFF_DELEGATIONS,
  STAFF_RESOURCE_KINDS,
  type GovernanceCommand,
  type GovernanceIntent,
} from "@/lib/auth/staff-governance-flow";
import {
  STAFF_REASONS,
  type LiveStaffAccess,
} from "@/lib/auth/staff-role-flow";
import type { StaffGovernance } from "@/lib/auth/staff-governance";
import styles from "./staff.module.css";
import visual from "@/components/admin-preview/admin-preview.module.css";

export function StaffGovernanceChange({
  client,
  access,
  person,
  page,
  onClose,
  onChanged,
}: {
  client: SupabaseClient;
  access: LiveStaffAccess;
  person: { user_id: string; display_name: string; staff_roles: string[] };
  page: StaffGovernance;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [operation, setOperation] = useState<GovernanceCommand["operation"]>(
    page.roles.includes("administrator") ? "grant_delegation" : "assign",
  );
  const [delegation, setDelegation] = useState<string>(STAFF_DELEGATIONS[0]);
  const [resourceKind, setResourceKind] = useState<string>(
    STAFF_RESOURCE_KINDS[0],
  );
  const [resourceId, setResourceId] = useState("");
  const delegationAction = operation.endsWith("delegation");
  const [reason, setReason] =
    useState<GovernanceCommand["reason"]>("access_change");
  const [factors, setFactors] = useState<StaffFactor[]>([]);
  const [factor, setFactor] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<
    "edit" | "busy" | "review" | "unknown" | "blocked" | "done"
  >("edit");
  const [intent, setIntent] = useState<GovernanceIntent | null>(null);
  const [message, setMessage] = useState("");
  const lock = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  const command: GovernanceCommand = {
    target: person.user_id,
    operation,
    value: delegationAction ? delegation : "",
    resourceKind: delegationAction ? "" : resourceKind,
    resourceId: delegationAction ? "" : resourceId,
    reason,
  };
  const protectedTarget =
    page.staffActive === null || !access.capabilities.includes("roles.manage");
  const allowed =
    !protectedTarget &&
    mayChangeGovernance(access, command) &&
    (!delegationAction || page.roles.includes("administrator"));
  useEffect(() => {
    let active = true;
    void readStaffFactors(client, access.user_id).then((result) => {
      if (!active) return;
      if (result.kind !== "ready" || result.factors.length === 0) {
        setStage("blocked");
        setMessage(
          "No verified authenticator is available. Return to staff verification.",
        );
        return;
      }
      setFactors(result.factors);
      setFactor(result.factors[0].id);
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
    if (lock.current || stage !== "edit" || !allowed) return;
    lock.current = true;
    setStage("busy");
    setMessage("");
    const submitted = code;
    setCode("");
    try {
      const result = await prepareGovernanceIntent(
        client,
        access.user_id,
        command,
        factor,
        submitted,
      );
      if (result.kind === "ready") {
        setIntent(result.intent);
        setStage("review");
      } else if (result.kind === "rejected" || result.kind === "invalid") {
        setStage("edit");
        setMessage(
          "Verification was not accepted. If the code was valid, wait for a new code before trying again; the previous verification may already have been used.",
        );
      } else {
        setStage("blocked");
        setMessage(
          "Preparation did not complete reliably or your access changed. No governance-change command was sent. Reload and check your current access before starting again.",
        );
      }
    } finally {
      lock.current = false;
    }
  }
  async function finish(reconcileOnly = false) {
    if (
      lock.current ||
      !intent ||
      (reconcileOnly ? stage !== "unknown" : stage !== "review")
    )
      return;
    lock.current = true;
    setStage("busy");
    try {
      const result = await completeGovernanceIntent(
        client,
        intent,
        reconcileOnly,
      );
      if (result.kind === "complete") {
        setMessage(
          result.status === "changed"
            ? "Governance change recorded."
            : result.status === "unchanged"
              ? "Request recorded; the governance state already matched the requested state."
              : "This exact request was already recorded.",
        );
        setIntent(null);
        setStage("done");
        onChanged();
      } else if (result.kind === "rejected" && !reconcileOnly) {
        setIntent(null);
        setStage("blocked");
        setMessage(
          "The database refused this governance change. Current access, verification expiry or target eligibility may prevent it. Refresh the people list before another action.",
        );
      } else {
        setStage("unknown");
        setMessage(
          "The outcome is not confirmed. Do not create another request. Check this exact request below, or give its reference to the Owner for audit review. A pending request may still finish.",
        );
      }
    } finally {
      lock.current = false;
    }
  }
  const frozen = stage !== "edit";
  return (
    <section
      className={`${visual.panel} ${styles.rolePanel}`}
      aria-labelledby="staff-governance-title"
      aria-busy={stage === "busy"}
    >
      <div className={visual.ph}>
        <h2 id="staff-governance-title" ref={heading} tabIndex={-1}>
          Governance · {person.display_name}
        </h2>
      </div>
      <div className={visual.pb}>
        <p className={styles.notice}>
          Profile reference:{" "}
          <span className={styles.identifier}>{person.user_id}</span>
        </p>
        <p>
          Current roles:{" "}
          {person.staff_roles.map((r) => r.replaceAll("_", " ")).join(", ") ||
            "No staff roles"}
          .
        </p>
        <p>
          Delegations are limited to Administrator targets. Assignments define
          scope and do not grant a role. Staff membership is not Auth account
          status.
        </p>
        {protectedTarget && (
          <p role="status">
            Only an authorized Owner can manage governance for a staff member.
          </p>
        )}
        {message && (
          <p className={styles.notice} role="status" aria-live="polite">
            {message}
          </p>
        )}
        {stage === "edit" || (stage === "busy" && !intent) ? (
          <form className={styles.form} onSubmit={(e) => void prepare(e)}>
            <fieldset
              disabled={frozen || protectedTarget}
              className={styles.fields}
            >
              <legend>Choose the exact governance change</legend>
              <label>
                Action
                <select
                  className={styles.input}
                  value={operation}
                  onChange={(event) =>
                    setOperation(
                      event.target.value as GovernanceCommand["operation"],
                    )
                  }
                >
                  <option
                    value="grant_delegation"
                    disabled={!page.roles.includes("administrator")}
                  >
                    Grant delegation
                  </option>
                  <option
                    value="revoke_delegation"
                    disabled={!page.roles.includes("administrator")}
                  >
                    Remove delegation
                  </option>
                  <option value="assign">Assign resource</option>
                  <option value="unassign">Remove assignment</option>
                </select>
              </label>
              {delegationAction ? (
                <label>
                  Delegation
                  <select
                    className={styles.input}
                    value={delegation}
                    onChange={(event) => setDelegation(event.target.value)}
                  >
                    {STAFF_DELEGATIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <>
                  <label>
                    Resource kind
                    <select
                      className={styles.input}
                      value={resourceKind}
                      onChange={(event) => setResourceKind(event.target.value)}
                    >
                      {STAFF_RESOURCE_KINDS.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Resource reference
                    <input
                      className={styles.input}
                      value={resourceId}
                      onChange={(event) => setResourceId(event.target.value)}
                      maxLength={200}
                      pattern="[a-z0-9][a-z0-9_:\x2f.\x2d]{0,199}"
                      required
                      aria-describedby="governance-resource-help"
                    />
                  </label>
                  <p id="governance-resource-help">
                    Use the exact internal resource reference. This assigns
                    scope only; it does not create, publish or verify that
                    resource. No URL will be opened.
                  </p>
                </>
              )}
              <label>
                Reason
                <select
                  className={styles.input}
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value as GovernanceCommand["reason"])
                  }
                >
                  {STAFF_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Authenticator
                <select
                  className={styles.input}
                  value={factor}
                  onChange={(e) => setFactor(e.target.value)}
                >
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
                  aria-describedby="governance-proof-help"
                />
              </label>
              <p id="governance-proof-help">
                Verify once for this exact change, then review and confirm. A
                verification cannot be shared with another action.
              </p>
              {!allowed && !protectedTarget && (
                <p role="status">
                  This governance change is not permitted. Self-delegation
                  grants are not allowed.
                </p>
              )}
              <button
                className={styles.button}
                type="submit"
                disabled={!allowed || !factor || frozen}
              >
                {stage === "busy" ? "Verifying…" : "Verify and review"}
              </button>
            </fieldset>
          </form>
        ) : null}
        {intent && (
          <>
            <h3>Review this exact request</h3>
            <dl className={styles.summary}>
              <dt>Person</dt>
              <dd>
                {person.display_name} · {intent.command.target}
              </dd>
              <dt>Action</dt>
              <dd>
                {intent.command.operation.replaceAll("_", " ")} ·{" "}
                {intent.command.value ||
                  intent.command.resourceKind +
                    ": " +
                    intent.command.resourceId}
              </dd>
              <dt>Reason</dt>
              <dd>{intent.command.reason.replaceAll("_", " ")}</dd>
              <dt>Reference</dt>
              <dd>{intent.request}</dd>
            </dl>
            <p>
              This exact scope or delegation changes only when the database
              accepts it. The database rechecks current authority and
              verification expiry.
            </p>
            {stage === "review" && (
              <button
                type="button"
                className={styles.button}
                onClick={() => void finish()}
              >
                Confirm governance change
              </button>
            )}
            {stage === "unknown" && (
              <button
                type="button"
                className={styles.button}
                onClick={() => void finish(true)}
              >
                Check recorded outcome only
              </button>
            )}
          </>
        )}
        <button
          type="button"
          className={styles.secondary}
          disabled={stage === "busy" || stage === "unknown"}
          onClick={onClose}
        >
          {stage === "review"
            ? "Cancel without changing governance"
            : "Close governance form"}
        </button>
      </div>
    </section>
  );
}
