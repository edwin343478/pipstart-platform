"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/admin-preview/icons";
import { getSupabasePublicConfiguration } from "@/lib/supabase/config";
import {
  readLiveStaffPeople,
  type LiveStaffAccess,
} from "@/lib/auth/staff-role-flow";
import { parseStaffPeople } from "@/lib/auth/staff-people";
import { staffDeadline } from "@/lib/auth/staff-entry";
import { StaffRoleChange } from "./staff-role-change";
import { StaffGovernance } from "./staff-governance";
import { StaffLearnerAccount } from "./staff-learner-account";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff.module.css";

export type StaffPeoplePage = Extract<
  ReturnType<typeof parseStaffPeople>,
  { kind: "ready" }
>;
export function StaffPeople({
  access: initialAccess,
  initialPage,
  accountEnabled = false,
}: {
  access: LiveStaffAccess;
  initialPage: StaffPeoplePage | null;
  accountEnabled?: boolean;
}) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const lock = useRef(false);
  const [access, setAccess] = useState(initialAccess);
  const [page, setPage] = useState(initialPage);
  const [query, setQuery] = useState(""),
    [appliedQuery, setAppliedQuery] = useState("");
  const [after, setAfter] = useState<string | null>(null),
    [history, setHistory] = useState<(string | null)[]>([]);
  const [management, setManagement] = useState<
    "roles" | "governance" | "learner"
  >("roles");
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const connected = client !== null;
  const [message, setMessage] = useState(
    initialPage
      ? ""
      : "The people list is unavailable. Try reloading the list.",
  );
  const results = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    let active = true;
    const config = getSupabasePublicConfiguration();
    if (!config) return;
    const supabase = createBrowserClient(config.url, config.publishableKey);
    void staffDeadline(supabase.auth.getUser())
      .then((reply) => {
        if (!active) return;
        if (!reply.error && reply.data.user?.id === initialAccess.user_id)
          setClient(supabase);
        else {
          setPage(null);
          setMessage("Your session changed. Return to staff verification.");
        }
      })
      .catch(() => {
        if (active) {
          setPage(null);
          setMessage(
            "The session check is unavailable. Reload before continuing.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [initialAccess.user_id]);
  async function load(
    search: string,
    cursor: string | null,
    trail: (string | null)[],
    clearSelection = true,
    successMessage = "People list updated.",
  ) {
    if (lock.current || !client) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    setPage(null);
    if (clearSelection) setSelected(null);
    try {
      const result = await readLiveStaffPeople(
        client,
        initialAccess.user_id,
        search,
        cursor,
      );
      if (result.kind === "ready") {
        setPage(result);
        setAccess(result.access);
        setAppliedQuery(search);
        setAfter(cursor);
        setHistory(trail);
        setMessage(
          result.items.length ? successMessage : "No matching people found.",
        );
      } else {
        setSelected(null);
        setMessage(
          result.kind === "denied"
            ? "Your current session or staff access no longer permits this list. Return to staff verification."
            : result.kind === "invalid"
              ? "Use an empty search or a display-name prefix of 2–60 characters."
              : "The people list is unavailable. Reload before continuing.",
        );
      }
    } finally {
      lock.current = false;
      setBusy(false);
      results.current?.focus();
    }
  }
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(query.trim(), null, []);
  }
  const person = page?.items.find((p) => p.user_id === selected);
  const learnerManage =
    accountEnabled && access.capabilities.includes("people.manage_learners");
  const manage =
    access.capabilities.includes("roles.manage") ||
    access.capabilities.includes("roles.delegate");
  return (
    <div className={styles.peoplePage}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>People</p>
        <h1>People</h1>
        <p className={styles.lead}>
          Staff and learner profiles, with role management and controlled
          learner login requests.
        </p>
      </div>
      <p className={styles.privacyNote}>
        <span className={styles.privacyIcon} aria-hidden="true">
          <Icon name="shield" />
        </span>
        <span>
          <strong>Privacy by design:</strong> this list shows profile names,
          references and staff membership only. It does not expose email
          addresses, learning progress, authenticator status or last activity.
        </span>
      </p>
      <section
        className={styles.peopleCard}
        aria-labelledby="staff-people-results"
        aria-busy={busy}
      >
        <form onSubmit={search} className={styles.peopleToolbar}>
          <label>
            Search display names
            <input
              className={styles.input}
              name="people-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={60}
              aria-describedby="people-search-help"
              disabled={busy || !!selected}
            />
          </label>
          <button
            className={styles.button}
            type="submit"
            disabled={busy || !connected || !!selected}
          >
            Search
          </button>
          <button
            className={styles.secondary}
            type="button"
            disabled={busy || !connected || !!selected}
            onClick={() => void load(appliedQuery, after, history)}
          >
            Reload list
          </button>
        </form>
        <p id="people-search-help" className={styles.tableHelp}>
          Use a name prefix of at least two characters, or leave empty to list
          profiles.
        </p>
        <div className={styles.resultsHead}>
          <h2
            id="staff-people-results"
            ref={results}
            tabIndex={-1}
            className={styles.resultsTitle}
          >
            People results
          </h2>
          <p className={styles.tableHelp} role="status" aria-live="polite">
            {busy ? "Loading people…" : message}
          </p>
        </div>
        {page && (
          <div className={styles.peopleTableWrap}>
            <table className={styles.peopleTable}>
              <caption className={s.srOnly}>
                People and current staff roles
              </caption>
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Staff roles</th>
                  <th scope="col">Staff membership</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {page.items.map((p) => (
                  <tr key={p.user_id}>
                    <td data-label="Person">
                      <div className={styles.personCell}>
                        <span
                          className={styles.personInitials}
                          aria-hidden="true"
                        >
                          {p.display_name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className={styles.personText}>
                          <strong>{p.display_name}</strong>
                          <span className={styles.personRef}>{p.user_id}</span>
                        </span>
                      </div>
                    </td>
                    <td data-label="Staff roles">
                      <div className={styles.roleTags}>
                        {p.staff_roles.length ? (
                          p.staff_roles.map((r) => (
                            <span key={r} className={styles.roleChip}>
                              {r.replaceAll("_", " ")}
                            </span>
                          ))
                        ) : (
                          <span className={styles.mutedText}>
                            No staff roles
                          </span>
                        )}
                      </div>
                    </td>
                    <td data-label="Staff membership">
                      {p.staff_active === null ? (
                        <span className={styles.memberBadge} data-state="none">
                          Not staff
                        </span>
                      ) : (
                        <span
                          className={styles.memberBadge}
                          data-state={p.staff_active ? "active" : "suspended"}
                        >
                          {p.staff_active ? "Active" : "Suspended"}
                        </span>
                      )}
                    </td>
                    <td data-label="Actions">
                      {manage ||
                      (learnerManage &&
                        p.staff_active === null &&
                        p.user_id !== access.user_id) ? (
                        <div className={styles.roleTags}>
                          {manage && (
                            <button
                              className={styles.rowAction}
                              type="button"
                              disabled={!connected || busy || !!selected}
                              aria-label={`Manage roles for ${p.display_name}`}
                              onClick={() => {
                                setManagement("roles");
                                setSelected(p.user_id);
                              }}
                            >
                              Roles
                            </button>
                          )}
                          {learnerManage &&
                            p.staff_active === null &&
                            p.user_id !== access.user_id && (
                              <button
                                className={styles.rowAction}
                                type="button"
                                disabled={!connected || busy || !!selected}
                                aria-label={`Manage learner account for ${p.display_name}`}
                                onClick={() => {
                                  setManagement("learner");
                                  setSelected(p.user_id);
                                }}
                              >
                                Learner account
                              </button>
                            )}
                          {access.capabilities.includes("roles.manage") && (
                            <button
                              className={styles.rowAction}
                              type="button"
                              disabled={!connected || busy || !!selected}
                              aria-label={`Manage governance for ${p.display_name}`}
                              onClick={() => {
                                setManagement("governance");
                                setSelected(p.user_id);
                              }}
                            >
                              Governance
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className={styles.mutedText}>Read only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className={styles.peoplePager}>
          <span>
            {page
              ? `${page.items.length} profiles on this page`
              : "No current page"}
          </span>
          <div className={styles.pagerButtons}>
            <button
              type="button"
              className={styles.secondary}
              disabled={
                busy || !connected || !!selected || !page || !history.length
              }
              onClick={() =>
                void load(
                  appliedQuery,
                  history[history.length - 1],
                  history.slice(0, -1),
                )
              }
            >
              Previous
            </button>
            <button
              type="button"
              className={styles.secondary}
              disabled={busy || !connected || !!selected || !page?.nextAfter}
              onClick={() =>
                void load(appliedQuery, page!.nextAfter, [...history, after])
              }
            >
              Next
            </button>
          </div>
        </div>
      </section>
      {person && client && management === "learner" && learnerManage && (
        <StaffLearnerAccount
          key={person.user_id}
          client={client}
          access={access}
          person={person}
          onClose={() => {
            setSelected(null);
            results.current?.focus();
          }}
        />
      )}
      {person && client && management === "roles" && (
        <StaffRoleChange
          key={person.user_id}
          client={client}
          access={access}
          person={person}
          onClose={() => {
            setSelected(null);
            results.current?.focus();
          }}
          onChanged={() =>
            void load(
              appliedQuery,
              after,
              history,
              true,
              "Role request recorded. People list updated.",
            )
          }
        />
      )}
      {person && client && management === "governance" && (
        <StaffGovernance
          key={person.user_id}
          client={client}
          access={access}
          person={person}
          onClose={() => {
            setSelected(null);
            results.current?.focus();
          }}
          onChanged={() =>
            void load(
              appliedQuery,
              after,
              history,
              true,
              "Governance request recorded. People list updated.",
            )
          }
        />
      )}
    </div>
  );
}
