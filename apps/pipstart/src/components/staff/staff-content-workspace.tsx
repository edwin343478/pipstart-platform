"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  Heading,
  Badge,
  DataTable,
  type BadgeKind,
} from "@/components/admin-preview/primitives";
import { readEditorialWorkspaceAction } from "@/app/admin/staff/content/actions";
import type {
  WorkspaceDetail,
  WorkspacePage,
} from "@/lib/content/editorial-workspace-contract";
import type { EditorialListRow } from "@/lib/content/editorial-adapter";
import { StaffRevisionHistory } from "./staff-revision-history";
import { StaffDecisionPanel } from "./staff-decision-panel";
import { StaffLifecyclePanel } from "./staff-lifecycle-panel";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff-content-workspace.module.css";
const status = (state: string): BadgeKind =>
  state === "approved"
    ? "approved"
    : state === "submitted"
      ? "review"
      : state === "draft"
        ? "draft"
        : "arch";
export function ContentRevisionDetail({ detail }: { detail: WorkspaceDetail }) {
  const labels = {
    imported: "Imported baseline",
    reviewed: "Reviewer approval",
    single_person: "Owner approval",
    changes_requested: "Changes requested",
  };
  return (
    <section
      className={`${s.panel} ${styles.detail}`}
      aria-labelledby="content-detail-heading"
    >
      <h2 id="content-detail-heading" tabIndex={-1}>
        {detail.title}
      </h2>
      <p>
        Read-only revision details. An approval here does not make a revision
        live on learner pages.
      </p>
      <dl>
        <dt>Permanent identity</dt>
        <dd>{detail.id}</dd>
        <dt>Family</dt>
        <dd>{detail.family}</dd>
        <dt>Learning path</dt>
        <dd>{detail.path}</dd>
        <dt>Parent identity</dt>
        <dd>{detail.parent ?? "No parent"}</dd>
        <dt>Latest revision</dt>
        <dd>{detail.revision}</dd>
        <dt>Revision state</dt>
        <dd>{detail.state.replaceAll("_", " ")}</dd>
        <dt>Created (UTC)</dt>
        <dd>{new Date(detail.createdAt).toISOString()}</dd>
        <dt>Fingerprint</dt>
        <dd>
          <code>{detail.bodySha256}</code>
        </dd>
        <dt>Archive</dt>
        <dd>{detail.trashed ? "In archive" : "Active"}</dd>
        <dt>Retention hold</dt>
        <dd>{detail.onHold ? "On hold" : "No hold"}</dd>
        <dt>Review policy</dt>
        <dd>
          {detail.reviewRequired
            ? "Independent review required"
            : "Owner single-person approval available"}
        </dd>
      </dl>
      <h3>Decisions for this exact revision</h3>
      {!detail.decisions.length ? (
        <p>No decision recorded.</p>
      ) : (
        <ul>
          {detail.decisions.map((d, i) => (
            <li key={i}>
              <strong>{labels[d.kind]}</strong> · {new Date(d.at).toISOString()}
              {d.kind !== "imported" &&
                (d.byMe ? " · By you" : " · Recorded actor")}
              {d.kind === "imported" && (
                <p>
                  Recorded import provenance; this is not a new human review.
                </p>
              )}
              {d.note && <p>{d.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
export function StaffContentWorkspace({
  initialPage,
  canEdit = false,
  canCreateCourse = false,
  canSubmit = false,
  canReview = false,
  canPublish = false,
  canArchive = false,
  canRestore = false,
  canHold = false,
}: {
  initialPage: WorkspacePage | null;
  canEdit?: boolean;
  canCreateCourse?: boolean;
  canSubmit?: boolean;
  canReview?: boolean;
  canPublish?: boolean;
  canArchive?: boolean;
  canRestore?: boolean;
  canHold?: boolean;
}) {
  const [page, setPage] = useState(initialPage),
    [detail, setDetail] = useState<WorkspaceDetail | null>(null),
    [after, setAfter] = useState(""),
    [trail, setTrail] = useState<string[]>([]),
    [family, setFamily] = useState("all"),
    [query, setQuery] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(
      initialPage
        ? ""
        : "The content list is unavailable. Reload it to check access again.",
    );
  const lock = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  async function load(cursor: string, history: string[]) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setDetail(null);
    setPage(null);
    setMessage("");
    try {
      const result = await readEditorialWorkspaceAction({
        kind: "list",
        after: cursor,
      });
      if (result.kind === "list") {
        setPage(result.page);
        setAfter(cursor);
        setTrail(history);
        setMessage("Content list updated.");
      } else
        setMessage(
          result.kind === "denied"
            ? "Staff access changed. Return to staff verification."
            : "The content list is unavailable. No saved content was changed.",
        );
    } catch {
      setMessage(
        "The content list is unavailable. No saved content was changed.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      heading.current?.focus();
    }
  }
  async function inspect(row: Pick<EditorialListRow, "id">, loaded?: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setDetail(null);
    setMessage("");
    try {
      const result = await readEditorialWorkspaceAction({
        kind: "item",
        id: row.id,
      });
      if (result.kind === "item") {
        setDetail(result.detail);
        setMessage(loaded ?? "Latest permitted revision loaded.");
      } else {
        setPage(null);
        setMessage(
          result.kind === "denied"
            ? "Access to this item changed. Return to staff verification or reload the list."
            : "The revision is unavailable or outside this workspace. No saved content was changed.",
        );
      }
    } catch {
      setPage(null);
      setMessage(
        "The revision could not be loaded. Reload the list before continuing.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      heading.current?.focus();
    }
  }
  const rows = (page?.rows ?? []).filter(
    (r) =>
      (family === "all" || r.family === family) &&
      r.id.includes(query.toLowerCase()),
  );
  return (
    <div className={styles.workspace} aria-busy={busy}>
      <Heading eyebrow="Content" title="Library">
        Browse permitted content and inspect its latest revision. This workspace
        cannot change learner pages.
      </Heading>
      <div className={styles.toolbar}>
        {canCreateCourse && (
          <a
            className={styles.linkButton}
            href="/admin/staff/content/editor?family=course"
          >
            New course
          </a>
        )}
        {canEdit && (
          <a
            className={styles.linkButton}
            href="/admin/staff/content/editor?family=module"
          >
            New module
          </a>
        )}
        {canEdit && (
          <a className={styles.linkButton} href="/admin/staff/content/lesson">
            New lesson
          </a>
        )}
        <label htmlFor="content-family">
          Content family
          <select
            id="content-family"
            value={family}
            disabled={busy}
            onChange={(e) => {
              setFamily(e.target.value);
              setDetail(null);
            }}
          >
            <option value="all">All families</option>
            {["course", "module", "lesson", "quiz", "analysis"].map((f) => (
              <option key={f} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="content-query">
          Filter identities on this page
          <input
            id="content-query"
            value={query}
            disabled={busy}
            maxLength={200}
            onChange={(e) => {
              setQuery(e.target.value);
              setDetail(null);
            }}
            type="search"
          />
        </label>
        <button
          type="button"
          className={styles.button}
          disabled={busy}
          onClick={() => void load("", [])}
        >
          Reload list
        </button>
      </div>
      <section className={s.panel} aria-labelledby="content-results-heading">
        <h2 id="content-results-heading" ref={heading} tabIndex={-1}>
          Permitted content
        </h2>
        <p>
          {page
            ? `${rows.length} shown from ${page.rows.length} permitted items on this page. Filters apply to this page only.`
            : "No current list loaded."}
        </p>
        {!!rows.length && (
          <DataTable
            caption="Permitted content identities and latest revision states"
            cols="minmax(0,2fr) 6rem 6rem 8rem 4rem 7rem"
            head={["Identity", "Family", "Path", "State", "Revision", "Action"]}
            rows={rows.map((row) => ({
              cells: [
                {
                  label: "Identity",
                  node: <span className={styles.identity}>{row.id}</span>,
                },
                { label: "Family", node: row.family },
                { label: "Path", node: row.learning_path ?? "No path" },
                {
                  label: "State",
                  node: (
                    <Badge kind={row.trashed ? "arch" : status(row.state)}>
                      {row.trashed
                        ? "Archived"
                        : row.state.replaceAll("_", " ")}
                    </Badge>
                  ),
                },
                { label: "Revision", node: row.latest_revision },
                {
                  label: "Action",
                  node: ["course", "module", "lesson"].includes(row.family) ? (
                    <div>
                      <button
                        className={styles.linkButton}
                        type="button"
                        disabled={busy}
                        onClick={() => void inspect(row)}
                        aria-label={`View latest revision of ${row.id}`}
                      >
                        View revision
                      </button>
                      {canEdit &&
                        !row.trashed &&
                        ["course", "module", "lesson"].includes(row.family) && (
                          <a
                            className={styles.linkButton}
                            aria-label={"Edit draft " + row.id}
                            href={
                              (row.family === "lesson"
                                ? "/admin/staff/content/lesson?id="
                                : "/admin/staff/content/editor?id=") +
                              encodeURIComponent(row.id)
                            }
                          >
                            Edit draft
                          </a>
                        )}
                    </div>
                  ) : (
                    <span>Separate editor</span>
                  ),
                },
              ],
            }))}
          />
        )}
        {page && !rows.length && (
          <p>
            No matching items on this page. Change the filter or check another
            page.
          </p>
        )}
        <div className={styles.pager}>
          <button
            className={styles.button}
            type="button"
            disabled={busy || !trail.length}
            onClick={() =>
              void load(trail[trail.length - 1], trail.slice(0, -1))
            }
          >
            Previous page
          </button>
          <button
            className={styles.button}
            type="button"
            disabled={busy || !page?.next}
            onClick={() =>
              page?.next && void load(page.next, [...trail, after])
            }
          >
            Next page
          </button>
        </div>
      </section>
      <p role="status" aria-live="polite" aria-atomic="true">
        {busy ? "Checking live staff access and loading content…" : message}
      </p>
      <Link className={styles.linkButton} href="/admin/access">
        Return to staff verification
      </Link>
      {detail && <ContentRevisionDetail detail={detail} />}
      {detail && (
        <StaffDecisionPanel
          key={detail.id + ":" + detail.revision + ":" + detail.state}
          detail={detail}
          canSubmit={canSubmit}
          canReview={canReview}
          canPublish={canPublish}
          onChanged={(message) => void inspect({ id: detail.id }, message)}
        />
      )}
      {detail && (
        <StaffLifecyclePanel
          key={[detail.id, detail.revision, detail.trashed, detail.onHold].join(
            ":",
          )}
          detail={detail}
          canArchive={canArchive}
          canRestore={canRestore}
          canHold={canHold}
          onChanged={(message) => void inspect({ id: detail.id }, message)}
        />
      )}
      {detail && (
        <StaffRevisionHistory
          key={detail.id + ":" + detail.revision}
          id={detail.id}
          latestRevision={detail.revision}
        />
      )}
    </div>
  );
}
