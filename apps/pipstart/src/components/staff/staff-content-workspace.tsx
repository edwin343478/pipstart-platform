"use client";
import Link from "next/link";
import { type Ref, useEffect, useRef, useState } from "react";
import { Badge, type BadgeKind } from "@/components/admin-preview/primitives";
import { Icon } from "@/components/admin-preview/icons";
import { readEditorialWorkspaceAction } from "@/app/admin/staff/content/actions";
import type {
  WorkspaceDetail,
  WorkspacePage,
} from "@/lib/content/editorial-workspace-contract";
import type { EditorialListRow } from "@/lib/content/editorial-adapter";
import { StaffRevisionHistory } from "./staff-revision-history";
import { StaffDecisionPanel } from "./staff-decision-panel";
import { StaffLifecyclePanel } from "./staff-lifecycle-panel";
import {
  StaffItemPublication,
  StaffLivePublication,
} from "./staff-publication-panel";
import styles from "./staff-content-workspace.module.css";
const status = (state: string): BadgeKind =>
  state === "approved"
    ? "approved"
    : state === "submitted"
      ? "review"
      : state === "draft"
        ? "draft"
        : "arch";
const families = [
  "course",
  "module",
  "lesson",
  "quiz",
  "analysis",
  "partner",
  "link",
];
export function ContentRevisionDetail({
  detail,
  headingRef,
}: {
  detail: WorkspaceDetail;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  const labels = {
    imported: "Imported baseline",
    reviewed: "Reviewer approval",
    single_person: "Owner approval",
    changes_requested: "Changes requested",
  };
  const facts: [string, string][] = [
    ["Permanent identity", detail.id],
    ["Family", detail.family],
    ["Learning path", detail.path],
    ["Parent identity", detail.parent ?? "No parent"],
    ["Latest revision", String(detail.revision)],
  ];
  if (detail.publicationRequest) {
    facts.push(["Learner publication", "Requested for this revision"]);
    if (detail.publicationRequest !== true)
      facts.push(
        ["Public author credit", detail.publicationRequest.author],
        ["Public reviewer credit", detail.publicationRequest.reviewer],
        ["Publication date", detail.publicationRequest.publishedDate],
        ["Review date", detail.publicationRequest.reviewDate],
      );
  }
  facts.push(
    ["Revision state", detail.state.replaceAll("_", " ")],
    ["Created (UTC)", new Date(detail.createdAt).toISOString()],
  );
  const after: [string, string][] = [
    ["Archive", detail.trashed ? "In archive" : "Active"],
    ["Retention hold", detail.onHold ? "On hold" : "No hold"],
    [
      "Review policy",
      detail.reviewRequired
        ? "Independent review required"
        : "Owner single-person approval available",
    ],
  ];
  return (
    <section
      className={styles.detailCard}
      aria-labelledby="content-detail-heading"
    >
      <div className={styles.detailHead}>
        <div>
          <p className={styles.eyebrow}>Revision details</p>
          <h2 id="content-detail-heading" ref={headingRef} tabIndex={-1}>
            {detail.title}
          </h2>
          <p>
            Read-only revision details. An approval here does not make a
            revision live on learner pages.
          </p>
        </div>
        <Badge kind={detail.trashed ? "arch" : status(detail.state)}>
          {detail.trashed ? "Archived" : detail.state.replaceAll("_", " ")}
        </Badge>
      </div>
      <dl className={styles.facts}>
        {facts.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <div className={styles.factWide}>
          <dt>Fingerprint</dt>
          <dd>
            <code>{detail.bodySha256}</code>
          </dd>
        </div>
        {after.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <h3>Decisions for this exact revision</h3>
      {!detail.decisions.length ? (
        <p>No decision recorded.</p>
      ) : (
        <ul className={styles.decisions}>
          {detail.decisions.map((d, i) => (
            <li key={i} data-kind={d.kind}>
              <div>
                <strong>{labels[d.kind]}</strong> ·{" "}
                {new Date(d.at).toISOString()}
                {d.kind !== "imported" &&
                  (d.byMe ? " · By you" : " · Recorded actor")}
              </div>
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
  canMakeLive = false,
  canEditPartners = false,
  isOwner = false,
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
  canMakeLive?: boolean;
  /** Owner or Affiliate Manager: partner and link drafts (MP09). */
  canEditPartners?: boolean;
  isOwner?: boolean;
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
  const detailHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (detail) detailHeading.current?.focus();
  }, [detail]);
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
    let didLoadDetail = false;
    try {
      const result = await readEditorialWorkspaceAction({
        kind: "item",
        id: row.id,
      });
      if (result.kind === "item") {
        didLoadDetail = true;
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
      if (!didLoadDetail) heading.current?.focus();
    }
  }
  const rows = (page?.rows ?? []).filter(
    (r) =>
      (family === "all" || r.family === family) &&
      r.id.includes(query.toLowerCase()),
  );
  return (
    <div className={`${styles.workspace} ${styles.library}`} aria-busy={busy}>
      <div className={styles.libraryHead}>
        <div className={styles.libraryIntro}>
          <p className={styles.eyebrow}>Content</p>
          <h1>Library</h1>
          <p>
            Browse permitted content and inspect its latest revision. Learner
            pages change only through live publication, once a content type is
            switched to the store.
          </p>
        </div>
        {(canCreateCourse || canEdit || canEditPartners) && (
          <div className={styles.createActions}>
            {canCreateCourse && (
              <a
                className={styles.createAction}
                href="/admin/staff/content/editor?family=course"
              >
                <Icon name="plus" />
                New course
              </a>
            )}
            {canEdit && (
              <a
                className={styles.createAction}
                href="/admin/staff/content/editor?family=module"
              >
                <Icon name="plus" />
                New module
              </a>
            )}
            {canEdit && (
              <a
                className={styles.createAction}
                href="/admin/staff/content/lesson"
              >
                <Icon name="plus" />
                New lesson
              </a>
            )}
            {canEditPartners && (
              <a
                className={styles.createAction}
                href="/admin/staff/content/partner"
              >
                <Icon name="plus" />
                New partner
              </a>
            )}
          </div>
        )}
      </div>
      <StaffLivePublication isOwner={isOwner} canManageDelivery={canMakeLive} />
      <section
        className={styles.resultsCard}
        aria-labelledby="content-results-heading"
      >
        <div className={styles.resultsHead}>
          <div className={styles.resultsTitle}>
            <h2 id="content-results-heading" ref={heading} tabIndex={-1}>
              Permitted content
            </h2>
            <p>
              {page
                ? `${rows.length} shown from ${page.rows.length} permitted items on this page. Filters apply to this page only.`
                : "No current list loaded."}
            </p>
          </div>
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
              {families.map((f) => (
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
            className={styles.secondaryButton}
            disabled={busy}
            onClick={() => void load("", [])}
          >
            <Icon name="refresh" />
            Reload list
          </button>
        </div>
        {!!rows.length && (
          <div className={styles.tableWrap}>
            <table className={styles.table} role="table">
              <caption>
                Permitted content identities and latest revision states
              </caption>
              <thead role="rowgroup">
                <tr role="row">
                  <th role="columnheader" scope="col">
                    Identity
                  </th>
                  <th role="columnheader" scope="col">
                    Family
                  </th>
                  <th role="columnheader" scope="col">
                    Path
                  </th>
                  <th role="columnheader" scope="col">
                    State
                  </th>
                  <th role="columnheader" scope="col">
                    Revision
                  </th>
                  <th role="columnheader" scope="col">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    role="row"
                    aria-current={detail?.id === row.id ? "true" : undefined}
                  >
                    <td role="cell" data-label="Identity">
                      <span className={styles.identity}>{row.id}</span>
                    </td>
                    <td role="cell" data-label="Family">
                      {row.family}
                    </td>
                    <td role="cell" data-label="Path">
                      {row.learning_path ?? "No path"}
                    </td>
                    <td role="cell" data-label="State">
                      <Badge kind={row.trashed ? "arch" : status(row.state)}>
                        {row.trashed
                          ? "Archived"
                          : row.state.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td role="cell" data-label="Revision">
                      {row.latest_revision}
                    </td>
                    <td role="cell" data-label="Action">
                      {families.includes(row.family) ? (
                        <div className={styles.rowActions}>
                          <button
                            className={styles.rowButton}
                            type="button"
                            disabled={busy}
                            onClick={() => void inspect(row)}
                            aria-label={`View latest revision of ${row.id}`}
                          >
                            View revision
                          </button>
                          {canEdit &&
                            !row.trashed &&
                            ["course", "module", "lesson", "quiz"].includes(
                              row.family,
                            ) && (
                              <a
                                className={styles.rowLink}
                                aria-label={"Edit draft " + row.id}
                                href={
                                  (row.family === "lesson"
                                    ? "/admin/staff/content/lesson?id="
                                    : row.family === "quiz"
                                      ? "/admin/staff/content/quiz?id="
                                      : "/admin/staff/content/editor?id=") +
                                  encodeURIComponent(row.id)
                                }
                              >
                                Edit draft
                              </a>
                            )}
                          {canEdit &&
                            !row.trashed &&
                            row.family === "module" &&
                            (row.learning_path === "forex" ||
                              row.learning_path === "crypto") && (
                              <a
                                className={styles.rowLink}
                                aria-label={"New quiz in module " + row.id}
                                href={
                                  "/admin/staff/content/quiz?parent=" +
                                  encodeURIComponent(row.id) +
                                  "&path=" +
                                  row.learning_path
                                }
                              >
                                New quiz
                              </a>
                            )}
                          {(canEdit || canReview) && row.family === "quiz" && (
                            <a
                              className={styles.rowLink}
                              aria-label={"View quiz " + row.id}
                              href={
                                "/admin/staff/content/quiz/view?id=" +
                                encodeURIComponent(row.id)
                              }
                            >
                              View quiz
                            </a>
                          )}
                          {canEditPartners &&
                            !row.trashed &&
                            ["partner", "link"].includes(row.family) && (
                              <a
                                className={styles.rowLink}
                                aria-label={"Edit draft " + row.id}
                                href={
                                  "/admin/staff/content/partner?id=" +
                                  encodeURIComponent(row.id)
                                }
                              >
                                Edit draft
                              </a>
                            )}
                        </div>
                      ) : (
                        <span>Separate editor</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {page && !rows.length && (
          <p className={styles.empty}>
            No matching items on this page. Change the filter or check another
            page.
          </p>
        )}
        <div className={styles.pagerBar}>
          <button
            className={styles.secondaryButton}
            type="button"
            disabled={busy || !trail.length}
            onClick={() =>
              void load(trail[trail.length - 1], trail.slice(0, -1))
            }
          >
            Previous page
          </button>
          <button
            className={styles.secondaryButton}
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
      <div className={styles.libraryFoot}>
        <p role="status" aria-live="polite" aria-atomic="true">
          {busy ? "Checking live staff access and loading content…" : message}
        </p>
        <Link className={styles.footLink} href="/admin/access">
          Return to staff verification
        </Link>
      </div>
      {detail && (
        <ContentRevisionDetail detail={detail} headingRef={detailHeading} />
      )}
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
        <StaffItemPublication
          key={"live:" + detail.id + ":" + detail.revision + ":" + detail.state}
          detail={detail}
          canPublish={canMakeLive}
          canRevoke={canEditPartners && detail.family === "link"}
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
