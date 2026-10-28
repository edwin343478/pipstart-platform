"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { readStaffFactors, type StaffFactor } from "@/lib/auth/staff-mfa-flow";
import {
  completeRoleIntent,
  mayChangeRole,
  prepareRoleIntent,
  STAFF_REASONS,
  STAFF_ROLES,
  type LiveStaffAccess,
  type RoleCommand,
  type RoleIntent,
} from "@/lib/auth/staff-role-flow";
import styles from "./staff.module.css";
import visual from "@/components/admin-preview/admin-preview.module.css";

export function StaffRoleChange({
  client,
  access,
  person,
  onClose,
  onChanged,
}: {
  client: SupabaseClient;
  access: LiveStaffAccess;
  person: { user_id: string; display_name: string; staff_roles: string[] };
  onClose: () => void;
  onChanged: () => void;
}) {
  const owner = access.capabilities.includes("roles.manage");
  const options = STAFF_ROLES.filter(
    (role) => owner || !["owner", "administrator"].includes(role),
  );
  const [operation, setOperation] =
    useState<RoleCommand["operation"]>("grant_role");
  const [role, setRole] = useState<RoleCommand["value"]>(
    options[0] || "author",
  );
  const [reason, setReason] = useState<RoleCommand["reason"]>("access_change");
  const [factors, setFactors] = useState<StaffFactor[]>([]);
  const [factor, setFactor] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<
    "edit" | "busy" | "review" | "unknown" | "blocked" | "done"
  >("edit");
  const [intent, setIntent] = useState<RoleIntent | null>(null);
  const [message, setMessage] = useState("");
  const lock = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  const command: RoleCommand = {
    target: person.user_id,
    operation,
    value: role,
    reason,
  };
  const protectedTarget =
    !owner &&
    (person.user_id === access.user_id ||
      person.staff_roles.some((r) => ["owner", "administrator"].includes(r)));
  const allowed = !protectedTarget && mayChangeRole(access, command);
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
      const result = await prepareRoleIntent(
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
          "Preparation did not complete reliably or your access changed. No role-change command was sent. Reload and check your current access before starting again.",
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
      const result = await completeRoleIntent(client, intent, reconcileOnly);
      if (result.kind === "complete") {
        setMessage(
          result.status === "changed"
            ? "Role change recorded."
            : result.status === "unchanged"
              ? "Request recorded; the role already matched the requested state."
              : "This exact request was already recorded.",
        );
        setIntent(null);
        setStage("done");
        onChanged();
      } else if (result.kind === "rejected" && !reconcileOnly) {
        setIntent(null);
        setStage("blocked");
        setMessage(
          "The database refused this role change. Current access, verification expiry or the last-Owner rule may prevent it. Refresh the people list before another action.",
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
      aria-labelledby="staff-role-title"
      aria-busy={stage === "busy"}
    >
      <div className={visual.ph}>
        <h2 id="staff-role-title" ref={heading} tabIndex={-1}>
          Roles · {person.display_name}
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
          Role access also requires an active membership and verified staff
          session. Removing a role does not delete the account.
        </p>
        {protectedTarget && (
          <p role="status">
            Only the Owner can change this person’s staff roles.
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
              <legend>Choose the exact role change</legend>
              <label>
                Action
                <select
                  className={styles.input}
                  value={operation}
                  onChange={(e) =>
                    setOperation(e.target.value as RoleCommand["operation"])
                  }
                >
                  <option value="grant_role">Grant role</option>
                  <option value="revoke_role">Remove role</option>
                </select>
              </label>
              <label>
                Role
                <select
                  className={styles.input}
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as RoleCommand["value"])
                  }
                >
                  {options.map((r) => (
                    <option key={r} value={r}>
                      {r.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Reason
                <select
                  className={styles.input}
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value as RoleCommand["reason"])
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
                  aria-describedby="role-proof-help"
                />
              </label>
              <p id="role-proof-help">
                Verify once for this exact change, then review and confirm. A
                verification cannot be shared with another action.
              </p>
              {!allowed && !protectedTarget && (
                <p role="status">
                  This role change is not permitted. Self-grants are not
                  allowed.
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
                {intent.command.operation === "grant_role" ? "Grant" : "Remove"}{" "}
                {intent.command.value.replaceAll("_", " ")}
              </dd>
              <dt>Reason</dt>
              <dd>{intent.command.reason.replaceAll("_", " ")}</dd>
              <dt>Reference</dt>
              <dd>{intent.request}</dd>
            </dl>
            <p>
              A role change takes effect when the database accepts it. The last
              active Owner must remain. Verification expires; the database
              decides whether it is still valid.
            </p>
            {stage === "review" && (
              <button
                type="button"
                className={styles.button}
                onClick={() => void finish()}
              >
                Confirm role change
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
            ? "Cancel without changing roles"
            : "Close role panel"}
        </button>
      </div>
    </section>
  );
}
