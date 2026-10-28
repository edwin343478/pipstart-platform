"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import type { LiveStaffAccess } from "@/lib/auth/staff-role-flow";
import { readLiveStaffGovernance } from "@/lib/auth/staff-governance-flow";
import type {
  StaffAssignment,
  StaffGovernance as GovernancePage,
} from "@/lib/auth/staff-governance";
import { StaffGovernanceChange } from "./staff-governance-change";
import styles from "./staff.module.css";
import visual from "@/components/admin-preview/admin-preview.module.css";

export function StaffGovernance({
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
  const [page, setPage] = useState<GovernancePage | null>(null),
    [busy, setBusy] = useState(true),
    [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("Loading current governance details…"),
    [after, setAfter] = useState<StaffAssignment | null>(null),
    [history, setHistory] = useState<(StaffAssignment | null)[]>([]);
  const alive = useRef(true),
    lock = useRef(false),
    title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!editing && !busy) title.current?.focus();
  }, [editing, busy]);
  useEffect(() => {
    alive.current = true;
    let active = true;
    void readLiveStaffGovernance(client, access.user_id, person.user_id).then(
      (result) => {
        if (!active) return;
        setBusy(false);
        if (result.kind === "ready") {
          setPage(result);
          setMessage("Current governance details loaded.");
        } else
          setMessage(
            "Governance details are unavailable or your Owner access changed. No change can be prepared.",
          );
        title.current?.focus();
      },
    );
    return () => {
      active = false;
      alive.current = false;
    };
  }, [client, access.user_id, person.user_id]);
  async function load(
    cursor: StaffAssignment | null,
    trail: (StaffAssignment | null)[],
  ) {
    if (lock.current || editing) return;
    lock.current = true;
    setBusy(true);
    setPage(null);
    setMessage("Loading current governance details…");
    try {
      const result = await readLiveStaffGovernance(
        client,
        access.user_id,
        person.user_id,
        cursor,
      );
      if (!alive.current) return;
      if (result.kind === "ready") {
        setPage(result);
        setAfter(cursor);
        setHistory(trail);
        setMessage("Current governance details loaded.");
      } else
        setMessage(
          "Governance details are unavailable or your Owner access changed. No change can be prepared.",
        );
    } finally {
      lock.current = false;
      if (alive.current) {
        setBusy(false);
        title.current?.focus();
      }
    }
  }
  if (editing && page)
    return (
      <StaffGovernanceChange
        client={client}
        access={access}
        person={{ ...person, staff_roles: page.roles }}
        page={page}
        onClose={() => {
          setEditing(false);
          title.current?.focus();
        }}
        onChanged={() => {
          setEditing(false);
          onChanged();
        }}
      />
    );
  return (
    <section
      className={`${visual.panel} ${styles.rolePanel}`}
      aria-labelledby="staff-governance-details"
      aria-busy={busy}
    >
      <div className={visual.ph}>
        <h2 id="staff-governance-details" ref={title} tabIndex={-1}>
          Governance · {person.display_name}
        </h2>
      </div>
      <div className={visual.pb}>
        <p className={styles.identifier}>Profile reference: {person.user_id}</p>
        <p role="status" aria-live="polite">
          {message}
        </p>
        {page && (
          <>
            <p>
              Membership:{" "}
              {page.staffActive === null
                ? "Not staff"
                : page.staffActive
                  ? "Active staff"
                  : "Suspended staff"}
              . This is not Auth account status.
            </p>
            <h3>Current roles</h3>
            <p>{page.roles.join(", ") || "No staff roles"}</p>
            <h3>Administrator delegations</h3>
            {page.delegations.length ? (
              <ul>
                {page.delegations.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            ) : (
              <p>No delegations.</p>
            )}
            <h3>Resource assignments</h3>
            {page.assignments.length ? (
              <ul>
                {page.assignments.map((item) => (
                  <li
                    key={item.resource_kind + ":" + item.resource_id}
                    className={styles.identifier}
                  >
                    {item.resource_kind}: {item.resource_id}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No assignments on this page.</p>
            )}
            <p>
              Assignments define scope; they do not grant a role or create or
              publish content.
            </p>
            <div className={styles.roleTags}>
              <button
                type="button"
                className={styles.secondary}
                disabled={busy || !history.length}
                onClick={() =>
                  void load(history[history.length - 1], history.slice(0, -1))
                }
              >
                Previous assignments
              </button>
              <button
                type="button"
                className={styles.secondary}
                disabled={busy || !page.nextAfter}
                onClick={() => void load(page.nextAfter, [...history, after])}
              >
                Next assignments
              </button>
              <button
                type="button"
                className={styles.button}
                disabled={
                  busy ||
                  page.staffActive === null ||
                  !access.capabilities.includes("roles.manage")
                }
                onClick={() => setEditing(true)}
              >
                Change delegation or assignment
              </button>
            </div>
          </>
        )}
        <button
          type="button"
          className={styles.secondary}
          disabled={busy}
          onClick={() => void load(after, history)}
        >
          Reload governance
        </button>
        <button
          type="button"
          className={styles.secondary}
          disabled={busy}
          onClick={onClose}
        >
          Close governance panel
        </button>
      </div>
    </section>
  );
}
