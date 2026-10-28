import {
  Heading,
  DataTable,
  Badge,
} from "@/components/admin-preview/primitives";
import { auditLabels, type AuditPage } from "@/lib/auth/staff-audit";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff.module.css";

export function StaffAudit({
  page,
  invalid = false,
  paginated = false,
}: {
  page: AuditPage | null;
  invalid?: boolean;
  paginated?: boolean;
}) {
  return (
    <>
      <Heading eyebrow="Governance" title="Staff audit">
        Recorded staff access and permission changes.
      </Heading>
      <p className={`${s.alert} ${styles.notice}`}>
        This view shows recorded staff governance events only. Staff membership
        suspension does not confirm that an Auth account was suspended. It does
        not show failed attempts or a complete security history.
      </p>
      <section className={s.panel} aria-labelledby="staff-audit-results">
        <h2 id="staff-audit-results" className={styles.resultsTitle}>
          Recorded events
        </h2>
        <p className={styles.tableHelp} role="status">
          {invalid
            ? "This page link is invalid. Return to the newest events."
            : !page
              ? "The audit view is unavailable. Reload this page to try again."
              : page.items.length
                ? "Newest first. Times are shown in UTC."
                : paginated
                  ? "No older events found."
                  : "No recorded staff events."}
        </p>
        {page && page.items.length > 0 && (
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
                      {event.created_at
                        .replace("T", " ")
                        .replace(/(?:Z|\+00:00)$/, " UTC")}
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
        <nav className={s.pager} aria-label="Audit pagination">
          <span>
            {page
              ? `${page.items.length} ${page.items.length === 1 ? "event" : "events"} on this page`
              : "No current page"}
          </span>
          <div className={s.row}>
            {/* Native GET navigation deliberately performs a fresh server gate and
              avoids restoring a previously cached client-router audit page. */}
            <form action="/admin/staff/audit" method="get">
              <button className={styles.secondary} type="submit">
                {paginated || invalid ? "Newest events" : "Reload events"}
              </button>
            </form>
            {page?.next && (
              <form action="/admin/staff/audit" method="get">
                <input type="hidden" name="before" value={page.next.before} />
                <input
                  type="hidden"
                  name="beforeId"
                  value={page.next.beforeId}
                />
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
