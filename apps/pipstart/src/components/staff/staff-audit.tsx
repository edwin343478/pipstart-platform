import {
  Heading,
  DataTable,
  Badge,
} from "@/components/admin-preview/primitives";
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
    <section className={s.panel} aria-labelledby="staff-audit-filters">
      <h2 id="staff-audit-filters" className={styles.resultsTitle}>
        Filters
      </h2>
      {/* Native GET keeps every filtered page behind a fresh server gate. */}
      <form
        action="/admin/staff/audit"
        method="get"
        className={styles.peopleToolbar}
      >
        <label htmlFor="audit-source">Records</label>
        <select id="audit-source" name="source" defaultValue={source}>
          <option value="staff">Staff access changes</option>
          <option value="content">Content and maintenance changes</option>
        </select>
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
        <label htmlFor="audit-actor">Actor (staff ID)</label>
        <input
          id="audit-actor"
          name="actor"
          defaultValue={query?.actor ?? ""}
          maxLength={36}
        />
        <label htmlFor="audit-item">
          {source === "staff" ? "Resource" : "Item"}
        </label>
        <input
          id="audit-item"
          name="item"
          defaultValue={query?.item ?? ""}
          maxLength={200}
        />
        <label htmlFor="audit-from">From (UTC day)</label>
        <input
          id="audit-from"
          name="from"
          type="date"
          defaultValue={query?.from ?? ""}
        />
        <label htmlFor="audit-to">To (UTC day, included)</label>
        <input
          id="audit-to"
          name="to"
          type="date"
          defaultValue={query?.to ?? ""}
        />
        <button className={styles.secondary} type="submit">
          Apply filters
        </button>
      </form>
      <p className={styles.tableHelp}>
        Changing the records type lists its own actions after you apply.{" "}
        <a href="/admin/staff/audit">Clear filters</a>
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
    <>
      <Heading eyebrow="Governance" title="Staff audit">
        Recorded staff access, content and maintenance changes.
      </Heading>
      <p className={`${s.alert} ${styles.notice}`}>
        {content
          ? "This view shows recorded content, publication, partner and maintenance changes. Reasons and other free text are not shown here. It does not show failed attempts."
          : "This view shows recorded staff governance events only. Staff membership suspension does not confirm that an Auth account was suspended. It does not show failed attempts or a complete security history."}
      </p>
      <Filters query={query} />
      <section className={s.panel} aria-labelledby="staff-audit-results">
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
        {!content && page && page.items.length > 0 && (
          <DataTable
            caption="Staff governance audit events"
            cols="minmax(0,1fr) minmax(0,1.2fr) minmax(0,2fr)"
            head={["Time (UTC)", "Event", "Recorded details"]}
            rows={page.items.map((event) => ({
              cells: [
                {
                  label: "Time (UTC)",
                  node: (
                    <time
                      className={styles.identifier}
                      dateTime={event.created_at}
                    >
                      {utc(event.created_at)}
                    </time>
                  ),
                },
                {
                  label: "Event",
                  node: (
                    <>
                      <strong>{auditLabels[event.operation]}</strong>
                      <p>
                        <Badge
                          kind={event.outcome === "changed" ? "ok" : "draft"}
                        >
                          {event.outcome === "changed"
                            ? "Changed"
                            : "No change"}
                        </Badge>
                      </p>
                    </>
                  ),
                },
                {
                  label: "Recorded details",
                  node: (
                    <dl className={styles.summary}>
                      <dt>Actor</dt>
                      <dd>{event.actor_id || "Database operator"}</dd>
                      <dt>Target</dt>
                      <dd>{event.target_id || "Staff access control"}</dd>
                      {event.value && (
                        <>
                          <dt>Value</dt>
                          <dd>{event.value.replaceAll("_", " ")}</dd>
                        </>
                      )}
                      {event.resource_kind && (
                        <>
                          <dt>Resource</dt>
                          <dd>
                            {event.resource_kind}: {event.resource_id}
                          </dd>
                        </>
                      )}
                      <dt>Reason</dt>
                      <dd>{event.reason_code.replaceAll("_", " ")}</dd>
                      <dt>Request</dt>
                      <dd>{event.request_id}</dd>
                      <dt>Record</dt>
                      <dd>{event.id}</dd>
                    </dl>
                  ),
                },
              ],
            }))}
          />
        )}
        {content && contentPage && contentPage.items.length > 0 && (
          <DataTable
            caption="Content and maintenance audit events"
            cols="minmax(0,1fr) minmax(0,1.2fr) minmax(0,2fr)"
            head={["Time (UTC)", "Event", "Recorded details"]}
            rows={contentPage.items.map((event) => ({
              cells: [
                {
                  label: "Time (UTC)",
                  node: (
                    <time
                      className={styles.identifier}
                      dateTime={event.created_at}
                    >
                      {utc(event.created_at)}
                    </time>
                  ),
                },
                {
                  label: "Event",
                  node: (
                    <strong>
                      {contentAuditLabels[event.operation]}
                      {event.action
                        ? `: ${maintenanceActionLabels[event.action]}`
                        : ""}
                    </strong>
                  ),
                },
                {
                  label: "Recorded details",
                  node: (
                    <dl className={styles.summary}>
                      <dt>Actor</dt>
                      <dd>{event.actor_id}</dd>
                      <dt>Item</dt>
                      <dd>{event.item_id ?? "Site-wide policy"}</dd>
                      {event.revision_no !== null && (
                        <>
                          <dt>Revision</dt>
                          <dd>{event.revision_no}</dd>
                        </>
                      )}
                      <dt>Record</dt>
                      <dd>{event.id}</dd>
                    </dl>
                  ),
                },
              ],
            }))}
          />
        )}
        <nav className={s.pager} aria-label="Audit pagination">
          <span>
            {current
              ? `${current.items.length} ${current.items.length === 1 ? "event" : "events"} on this page`
              : "No current page"}
          </span>
          <div className={s.row}>
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
    </>
  );
}
