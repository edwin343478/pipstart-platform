import { Icon } from "@/components/admin-preview/icons";
import {
  auditLabels,
  contentAuditLabels,
  maintenanceActionLabels,
  type AuditPage,
  type AuditQuery,
  type ContentAuditPage,
} from "@/lib/auth/staff-audit";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff.module.css";

const utc = (t: string) =>
  t.replace("T", " ").replace(/(?:Z|\+00:00)$/, " UTC");

/** Hidden inputs that keep the current filters on the paging forms. */
function FilterFields({ query }: { query: AuditQuery | null }) {
  if (!query) return null;
  const pairs: [string, string | null][] = [
    ["source", query.source === "content" ? "content" : null],
    ["operation", query.operation],
    ["actor", query.actor],
    ["item", query.item],
    ["from", query.from],
    ["to", query.to],
  ];
  return (
    <>
      {pairs.map(([name, value]) =>
        value ? (
          <input key={name} type="hidden" name={name} value={value} />
        ) : null,
      )}
    </>
  );
}

function Filters({ query }: { query: AuditQuery | null }) {
  const source = query?.source ?? "staff";
  const labels = source === "staff" ? auditLabels : contentAuditLabels;
  return (
    <section className={styles.auditCard} aria-labelledby="staff-audit-filters">
      <h2 id="staff-audit-filters" className={styles.resultsTitle}>
        Filters
      </h2>
      {/* Native GET keeps every filtered page behind a fresh server gate. */}
      <form
        action="/admin/staff/audit"
        method="get"
        className={styles.auditFilters}
      >
        <div className={styles.filterField}>
          <label htmlFor="audit-source">Records</label>
          <select id="audit-source" name="source" defaultValue={source}>
            <option value="staff">Staff access changes</option>
            <option value="content">Content and maintenance changes</option>
          </select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="audit-operation">Action</label>
          <select
            id="audit-operation"
            name="operation"
            defaultValue={query?.operation ?? ""}
          >
            <option value="">Any</option>
            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="audit-actor">Actor (staff ID)</label>
          <input
            id="audit-actor"
            name="actor"
            defaultValue={query?.actor ?? ""}
            maxLength={36}
          />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="audit-item">
            {source === "staff" ? "Resource" : "Item"}
          </label>
          <input
            id="audit-item"
            name="item"
            defaultValue={query?.item ?? ""}
            maxLength={200}
          />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="audit-from">From (UTC day)</label>
          <input
            id="audit-from"
            name="from"
            type="date"
            defaultValue={query?.from ?? ""}
          />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="audit-to">To (UTC day, included)</label>
          <input
            id="audit-to"
            name="to"
            type="date"
            defaultValue={query?.to ?? ""}
          />
        </div>
        <div className={styles.filterActions}>
          <button className={styles.button} type="submit">
            Apply filters
          </button>
          <a href="/admin/staff/audit">Clear filters</a>
        </div>
      </form>
      <p className={styles.tableHelp}>
        Changing the records type lists its own actions after you apply.
      </p>
    </section>
  );
}

export function StaffAudit({
  page,
  contentPage = null,
  query = null,
  invalid = false,
  paginated = false,
}: {
  page: AuditPage | null;
  contentPage?: ContentAuditPage | null;
  query?: AuditQuery | null;
  invalid?: boolean;
  paginated?: boolean;
}) {
  const content = query?.source === "content";
  const current = content ? contentPage : page;
  const next = current?.next ?? null;
  return (
    <div className={styles.auditPage}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Governance</p>
        <h1>Staff audit</h1>
        <p className={styles.lead}>
          Recorded staff access, content and maintenance changes.
        </p>
      </div>
      <p className={styles.privacyNote}>
        <span className={styles.privacyIcon} aria-hidden="true">
          <Icon name="info" />
        </span>
        <span>
          {content
            ? "This view shows recorded content, publication, partner and maintenance changes. Reasons and other free text are not shown here. It does not show failed attempts."
            : "This view shows recorded staff governance events only. Staff membership suspension does not confirm that an Auth account was suspended. It does not show failed attempts or a complete security history."}
        </span>
      </p>
      <Filters query={query} />
      <section
        className={`${styles.auditCard} ${styles.auditResults}`}
        aria-labelledby="staff-audit-results"
      >
        <div className={styles.resultsHead}>
          <h2 id="staff-audit-results" className={styles.resultsTitle}>
            Recorded events
          </h2>
          <p className={styles.tableHelp} role="status">
            {invalid
              ? "This page link or filter is invalid. Return to the newest events."
              : !current
                ? "The audit view is unavailable. Reload this page to try again."
                : current.items.length
                  ? "Newest first. Times are shown in UTC."
                  : paginated
                    ? "No older events found."
                    : content
                      ? "No recorded content or maintenance events match."
                      : "No recorded staff events."}
          </p>
        </div>
        {!content && page && page.items.length > 0 && (
          <div className={styles.peopleTableWrap}>
            <table className={styles.auditTable}>
              <caption className={s.srOnly}>
                Staff governance audit events
              </caption>
              <thead>
                <tr>
                  <th scope="col">Time (UTC)</th>
                  <th scope="col">Event</th>
                  <th scope="col">Recorded details</th>
                </tr>
              </thead>
              <tbody>
                {page.items.map((event) => (
                  <tr key={event.id}>
                    <td data-label="Time (UTC)">
                      <time
                        className={`${styles.identifier} ${styles.auditTime}`}
                        dateTime={event.created_at}
                      >
                        {utc(event.created_at)}
                      </time>
                    </td>
                    <td data-label="Event">
                      <div className={styles.eventCell}>
                        <strong>{auditLabels[event.operation]}</strong>
                        <span
                          className={styles.memberBadge}
                          data-state={
                            event.outcome === "changed" ? "active" : "none"
                          }
                        >
                          {event.outcome === "changed"
                            ? "Changed"
                            : "No change"}
                        </span>
                      </div>
                    </td>
                    <td data-label="Recorded details">
                      <dl className={styles.detailTiles}>
                        <div>
                          <dt>Actor</dt>
                          <dd>{event.actor_id || "Database operator"}</dd>
                        </div>
                        <div>
                          <dt>Target</dt>
                          <dd>{event.target_id || "Staff access control"}</dd>
                        </div>
                        {event.value && (
                          <div>
                            <dt>Value</dt>
                            <dd>{event.value.replaceAll("_", " ")}</dd>
                          </div>
                        )}
                        {event.resource_kind && (
                          <div>
                            <dt>Resource</dt>
                            <dd>
                              {event.resource_kind}: {event.resource_id}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt>Reason</dt>
                          <dd>{event.reason_code.replaceAll("_", " ")}</dd>
                        </div>
                        <div>
                          <dt>Request</dt>
                          <dd>{event.request_id}</dd>
                        </div>
                        <div>
                          <dt>Record</dt>
                          <dd>{event.id}</dd>
                        </div>
                      </dl>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {content && contentPage && contentPage.items.length > 0 && (
          <div className={styles.peopleTableWrap}>
            <table className={styles.auditTable}>
              <caption className={s.srOnly}>
                Content and maintenance audit events
              </caption>
              <thead>
                <tr>
                  <th scope="col">Time (UTC)</th>
                  <th scope="col">Event</th>
                  <th scope="col">Recorded details</th>
                </tr>
              </thead>
              <tbody>
                {contentPage.items.map((event) => (
                  <tr key={event.id}>
                    <td data-label="Time (UTC)">
                      <time
                        className={`${styles.identifier} ${styles.auditTime}`}
                        dateTime={event.created_at}
                      >
                        {utc(event.created_at)}
                      </time>
                    </td>
                    <td data-label="Event">
                      <strong>
                        {contentAuditLabels[event.operation]}
                        {event.action
                          ? `: ${maintenanceActionLabels[event.action]}`
                          : ""}
                      </strong>
                    </td>
                    <td data-label="Recorded details">
                      <dl className={styles.detailTiles}>
                        <div>
                          <dt>Actor</dt>
                          <dd>{event.actor_id}</dd>
                        </div>
                        <div>
                          <dt>Item</dt>
                          <dd>{event.item_id ?? "Site-wide policy"}</dd>
                        </div>
                        {event.revision_no !== null && (
                          <div>
                            <dt>Revision</dt>
                            <dd>{event.revision_no}</dd>
                          </div>
                        )}
                        <div>
                          <dt>Record</dt>
                          <dd>{event.id}</dd>
                        </div>
                      </dl>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <nav className={styles.peoplePager} aria-label="Audit pagination">
          <span>
            {current
              ? `${current.items.length} ${current.items.length === 1 ? "event" : "events"} on this page`
              : "No current page"}
          </span>
          <div className={styles.pagerButtons}>
            {/* Native GET navigation deliberately performs a fresh server gate and
              avoids restoring a previously cached client-router audit page. */}
            <form action="/admin/staff/audit" method="get">
              {!invalid && <FilterFields query={query} />}
              <button className={styles.secondary} type="submit">
                {paginated || invalid ? "Newest events" : "Reload events"}
              </button>
            </form>
            {next && (
              <form action="/admin/staff/audit" method="get">
                <FilterFields query={query} />
                <input type="hidden" name="before" value={next.before} />
                <input type="hidden" name="beforeId" value={next.beforeId} />
                <button className={styles.secondary} type="submit">
                  Older events
                </button>
              </form>
            )}
          </div>
        </nav>
      </section>
    </div>
  );
}
