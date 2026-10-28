"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Heading,
  DataTable,
  Badge,
  Tag,
  PersonCell,
} from "@/components/admin-preview/primitives";
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
    <>
      <Heading eyebrow="People" title="People">
        Staff and learner profiles, with role management and controlled learner
        login requests.
      </Heading>
      <p className={`${s.alert} ${styles.notice}`}>
        Privacy by design: this list shows profile names, references and staff
        membership only. It does not expose email addresses, learning progress,
        authenticator status or last activity.
      </p>
      <section
        className={s.panel}
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
        {page && (
          <DataTable
            caption="People and current staff roles"
            cols="minmax(0,2fr) minmax(0,1.5fr) minmax(0,1fr) 9rem"
            head={["Person", "Staff roles", "Staff membership", "Actions"]}
            rows={page.items.map((p) => ({
              cells: [
                {
                  label: "Person",
                  className: "main",
                  node: (
                    <PersonCell
                      name={p.display_name}
                      initials={p.display_name.slice(0, 2).toUpperCase()}
                      sub={p.user_id}
                    />
                  ),
                },
                {
                  label: "Staff roles",
                  node: (
                    <div className={styles.roleTags}>
                      {p.staff_roles.length ? (
                        p.staff_roles.map((r) => (
                          <Tag key={r}>{r.replaceAll("_", " ")}</Tag>
                        ))
                      ) : (
                        <span>No staff roles</span>
                      )}
                    </div>
                  ),
                },
                {
                  label: "Staff membership",
                  node:
                    p.staff_active === null ? (
                      <Tag kind="slate">Not staff</Tag>
                    ) : (
                      <Badge kind={p.staff_active ? "ok" : "fail"}>
                        {p.staff_active ? "Active" : "Suspended"}
                      </Badge>
                    ),
                },
                {
                  label: "Actions",
                  className: "act",
                  node:
                    manage ||
                    (learnerManage &&
                      p.staff_active === null &&
                      p.user_id !== access.user_id) ? (
                      <div className={styles.roleTags}>
                        {manage && (
                          <button
                            className={`${s.btn} ${s.sec} ${s.sm}`}
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
                              className={`${s.btn} ${s.sec} ${s.sm}`}
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
                            className={`${s.btn} ${s.sec} ${s.sm}`}
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
                      <span>Read only</span>
                    ),
                },
              ],
            }))}
          />
        )}
        <div className={s.pager}>
          <span>
            {page
              ? `${page.items.length} profiles on this page`
              : "No current page"}
          </span>
          <div className={s.row}>
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
    </>
  );
}
