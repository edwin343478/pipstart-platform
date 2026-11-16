"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { runMaintenanceAction } from "@/app/admin/staff/maintenance/actions";
import type { MaintenancePage } from "@/lib/content/maintenance";
import {
  actionMessage,
  familyLabel,
  MAINTENANCE_FAMILIES,
  MAINTENANCE_STATUSES,
  MANUAL_RESULTS,
  resultLabel,
  statusLabel,
  type MaintenanceFamily,
  type MaintenanceInput,
  type MaintenanceResult,
  type MaintenanceStatus,
  type MaintenanceView,
  type WorklistItem,
} from "@/lib/content/maintenance-contract";
import styles from "./staff.module.css";
import workspace from "./staff-content-workspace.module.css";

export type LinkReport =
  | { kind: "ready"; generation: number; items: number; lines: string[] }
  | { kind: "code" }
  | { kind: "unavailable" };

const views: { id: MaintenanceView; label: string }[] = [
  { id: "mine", label: "Assigned to me" },
  { id: "all", label: "Due and overdue" },
  { id: "report", label: "Link report" },
  { id: "policy", label: "Review policy" },
];
const field = (form: HTMLFormElement, name: string) =>
  String(new FormData(form).get(name) ?? "").trim();
const href = (view: MaintenanceView, extra: Record<string, string> = {}) =>
  "/admin/staff/maintenance?" + new URLSearchParams({ view, ...extra });

/** One write (or read) at a time; an unclear outcome blocks further writes until reload. */
function useMaintenance() {
  const router = useRouter();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [message, setMessage] = useState("");
  async function send(input: MaintenanceInput) {
    if (lock.current || blocked) return null;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const result = await runMaintenanceAction(input);
      if (result.kind === "results") return result;
      if (result.kind === "uncertain") setBlocked(true);
      setMessage(actionMessage[result.kind]);
      if (result.kind === "done") router.refresh();
      return result;
    } catch {
      setBlocked(true);
      setMessage(actionMessage.uncertain);
      return null;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, blocked, message, send };
}

function Results({ item }: { item: WorklistItem }) {
  const { busy, message, send } = useMaintenance();
  const [results, setResults] = useState<MaintenanceResult[] | null>(null);
  return (
    <div>
      <button
        type="button"
        className={styles.secondary}
        disabled={busy}
        onClick={async () => {
          const r = await send({ action: "results", id: item.id });
          if (r?.kind === "results") setResults(r.results);
        }}
      >
        Show recorded checks
      </button>
      {results &&
        (results.length ? (
          <ul>
            {results.map((r) => (
              <li key={r.reference}>
                <span className={styles.identifier}>{r.reference}</span>:{" "}
                {resultLabel[r.classification] ?? r.classification}
                {r.evidence ? ` (${r.evidence})` : ""},{" "}
                {r.checkedAt.slice(0, 10)}
                {r.byMe ? " by you" : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p>No checks recorded for this revision.</p>
        ))}
      {message && <p role="status">{message}</p>}
    </div>
  );
}

function ItemActions({
  item,
  me,
  owner,
  editor,
  staff,
}: {
  item: WorklistItem;
  me: string;
  owner: boolean;
  editor: boolean;
  staff: { id: string; name: string }[] | null;
}) {
  const { busy, blocked, message, send } = useMaintenance();
  const canAct = owner || item.assignedToMe;
  const submit =
    (build: (f: HTMLFormElement) => MaintenanceInput | null) =>
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const input = build(e.currentTarget);
      if (input) await send(input);
    };
  const disabled = busy || blocked;
  const id = (name: string) => `${name}-${item.id.replace(/[^a-z0-9]/g, "-")}`;
  return (
    <details className={workspace.detail}>
      <summary>Actions for {item.title ?? item.id}</summary>
      {canAct && (
        <>
          <form
            className={styles.form}
            onSubmit={submit((f) => ({
              action: "acknowledge",
              id: item.id,
              revision: item.revision,
              reason: field(f, "reason"),
            }))}
          >
            <h3>Acknowledge</h3>
            <p>
              Records that you have seen this. It stays due; it is not a review.
            </p>
            <label htmlFor={id("ack")}>Reason</label>
            <input
              id={id("ack")}
              name="reason"
              className={styles.input}
              maxLength={200}
              required
            />
            <button className={styles.button} disabled={disabled}>
              Acknowledge
            </button>
          </form>
          <form
            className={styles.form}
            onSubmit={submit((f) => ({
              action: "reschedule",
              id: item.id,
              revision: item.revision,
              due: field(f, "due"),
              reason: field(f, "reason"),
            }))}
          >
            <h3>Reschedule</h3>
            <p>
              A new due date for this revision: at most {owner ? "365" : "90"}{" "}
              days ahead.
            </p>
            <label htmlFor={id("due")}>New due date</label>
            <input
              id={id("due")}
              name="due"
              type="date"
              className={styles.input}
              required
            />
            <label htmlFor={id("rs")}>Reason</label>
            <input
              id={id("rs")}
              name="reason"
              className={styles.input}
              maxLength={200}
              required
            />
            <button className={styles.button} disabled={disabled}>
              Reschedule
            </button>
          </form>
          <form
            className={styles.form}
            onSubmit={submit((f) => ({
              action: "result",
              id: item.id,
              revision: item.revision,
              reference: field(f, "reference"),
              classification: field(
                f,
                "classification",
              ) as (typeof MANUAL_RESULTS)[number],
              note: field(f, "note"),
            }))}
          >
            <h3>Record a manual check</h3>
            <label htmlFor={id("ref")}>
              Link or reference, exactly as it appears in the content
            </label>
            <input
              id={id("ref")}
              name="reference"
              className={styles.input}
              maxLength={2048}
              required
            />
            <label htmlFor={id("cls")}>Result</label>
            <select
              id={id("cls")}
              name="classification"
              className={styles.input}
            >
              {MANUAL_RESULTS.map((c) => (
                <option key={c} value={c}>
                  {resultLabel[c]}
                </option>
              ))}
            </select>
            <label htmlFor={id("note")}>Note (optional)</label>
            <input
              id={id("note")}
              name="note"
              className={styles.input}
              maxLength={500}
            />
            <button className={styles.button} disabled={disabled}>
              Record check
            </button>
          </form>
        </>
      )}
      {(owner || editor) && (
        <form
          className={styles.form}
          onSubmit={submit((f) =>
            owner
              ? {
                  action: "assign",
                  id: item.id,
                  assignee: field(f, "assignee"),
                  reason: field(f, "reason"),
                }
              : {
                  action: "assign",
                  id: item.id,
                  assignee: me,
                  reason: field(f, "reason"),
                },
          )}
        >
          <h3>Maintenance owner</h3>
          {owner && staff ? (
            <>
              <label htmlFor={id("who")}>Assign to</label>
              <select
                id={id("who")}
                name="assignee"
                className={styles.input}
                required
              >
                {staff.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <p>Assign this item to yourself.</p>
          )}
          <label htmlFor={id("ar")}>Reason</label>
          <input
            id={id("ar")}
            name="reason"
            className={styles.input}
            maxLength={200}
            required
          />
          <button
            className={styles.button}
            disabled={disabled || (owner && !staff?.length)}
          >
            {owner ? "Assign" : "Assign to me"}
          </button>
        </form>
      )}
      {(owner || editor) && (item.assignee || item.assignedToMe) && (
        <form
          className={styles.form}
          onSubmit={submit((f) => ({
            action: "unassign",
            id: item.id,
            reason: field(f, "reason"),
          }))}
        >
          <label htmlFor={id("ur")}>Reason for removing the owner</label>
          <input
            id={id("ur")}
            name="reason"
            className={styles.input}
            maxLength={200}
            required
          />
          <button className={styles.secondary} disabled={disabled}>
            Remove maintenance owner
          </button>
        </form>
      )}
      {(canAct || owner || editor) && <Results item={item} />}
      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}
    </details>
  );
}

function Worklist({
  view,
  page,
  filters,
  me,
  owner,
  editor,
}: {
  view: "mine" | "all";
  page: MaintenancePage;
  filters: {
    status: MaintenanceStatus | null;
    family: MaintenanceFamily | null;
  };
  me: string;
  owner: boolean;
  editor: boolean;
}) {
  const names = new Map((page.staff ?? []).map((p) => [p.id, p.name]));
  if (!page.worklist)
    return <p role="alert">The maintenance list could not be read.</p>;
  return (
    <>
      <form className={workspace.toolbar} method="get">
        <input type="hidden" name="view" value={view} />
        <label htmlFor="mt-status">Status</label>
        <select
          id="mt-status"
          name="status"
          defaultValue={filters.status ?? ""}
        >
          <option value="">Any</option>
          {MAINTENANCE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
        <label htmlFor="mt-family">Type</label>
        <select
          id="mt-family"
          name="family"
          defaultValue={filters.family ?? ""}
        >
          <option value="">Any</option>
          {MAINTENANCE_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {familyLabel[f]}
            </option>
          ))}
        </select>
        <button className={workspace.button}>Filter</button>
      </form>
      {page.worklist.items.length === 0 ? (
        <p>
          {view === "mine"
            ? "Nothing is assigned to you."
            : "No live items match."}
        </p>
      ) : (
        <ul>
          {page.worklist.items.map((item) => (
            <li key={item.id}>
              <h2>{item.title ?? item.id}</h2>
              <dl className={styles.summary}>
                <dt>Type</dt>
                <dd>{familyLabel[item.family]}</dd>
                <dt>Status</dt>
                <dd>{statusLabel[item.status]}</dd>
                <dt>Due</dt>
                <dd>
                  {item.due ?? "No date"}
                  {item.rescheduled
                    ? ` (rescheduled; content date ${item.contentDue ?? "none"})`
                    : ""}
                </dd>
                <dt>Last review</dt>
                <dd>{item.reviewedOn ?? "No review on record"}</dd>
                <dt>Maintenance owner</dt>
                <dd>
                  {item.assignedToMe
                    ? "You"
                    : item.assignee
                      ? (names.get(item.assignee) ?? "Another staff member")
                      : owner
                        ? "Unassigned"
                        : "Not you"}
                </dd>
                {item.acknowledged && (
                  <>
                    <dt>Acknowledged</dt>
                    <dd>
                      {item.acknowledged.at.slice(0, 10)}:{" "}
                      {item.acknowledged.reason}
                    </dd>
                  </>
                )}
              </dl>
              <ItemActions
                item={item}
                me={me}
                owner={owner}
                editor={editor}
                staff={page.staff}
              />
            </li>
          ))}
        </ul>
      )}
      {page.worklist.next && (
        <nav className={workspace.pager} aria-label="Maintenance pages">
          <Link
            href={href(view, {
              ...(filters.status ? { status: filters.status } : {}),
              ...(filters.family ? { family: filters.family } : {}),
              after: page.worklist.next,
            })}
          >
            Next page
          </Link>
        </nav>
      )}
    </>
  );
}

function Policy({ page, owner }: { page: MaintenancePage; owner: boolean }) {
  const { busy, blocked, message, send } = useMaintenance();
  const disabled = busy || blocked;
  return (
    <>
      <h2>Review intervals</h2>
      <p>
        Analysis posts and lessons are due this many days after their last
        review date. Partners, links and quizzes use the dates in their own
        content.
      </p>
      {!page.intervals ? (
        <p role="alert">The review intervals could not be read.</p>
      ) : (
        <ul>
          {page.intervals.map((i) => (
            <li key={i.family}>
              {familyLabel[i.family]}: {i.days} days (version {i.version}, since{" "}
              {i.setAt.slice(0, 10)})
              {owner && (
                <form
                  className={styles.form}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = e.currentTarget;
                    await send({
                      action: "interval",
                      family: i.family,
                      expected: i.version,
                      days: Number(field(f, "days")),
                      reason: field(f, "reason"),
                    });
                  }}
                >
                  <label htmlFor={`days-${i.family}`}>
                    New interval (days)
                  </label>
                  <input
                    id={`days-${i.family}`}
                    name="days"
                    type="number"
                    min={30}
                    max={730}
                    className={styles.input}
                    required
                  />
                  <label htmlFor={`ir-${i.family}`}>Reason</label>
                  <input
                    id={`ir-${i.family}`}
                    name="reason"
                    className={styles.input}
                    maxLength={200}
                    required
                  />
                  <button className={styles.button} disabled={disabled}>
                    Save interval
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
      {owner && (
        <>
          <h2>Hosts allowed for automatic checks</h2>
          <p>
            Only these hosts may be checked automatically (MP10d). Affiliate
            hosts are never allowed.
          </p>
          {!page.allowlist ? (
            <p role="alert">The allowlist could not be read.</p>
          ) : page.allowlist.length ? (
            <ul>
              {page.allowlist.map((h) => (
                <li key={h.host}>
                  {h.host} (since {h.since.slice(0, 10)})
                </li>
              ))}
            </ul>
          ) : (
            <p>No hosts are allowed yet.</p>
          )}
          <form
            className={styles.form}
            onSubmit={async (e) => {
              e.preventDefault();
              const f = e.currentTarget;
              await send({
                action: "allowlist",
                host: field(f, "host"),
                change: field(f, "change") === "remove" ? "remove" : "add",
                reason: field(f, "reason"),
              });
            }}
          >
            <label htmlFor="al-host">Host name</label>
            <input
              id="al-host"
              name="host"
              className={styles.input}
              maxLength={253}
              required
            />
            <label htmlFor="al-change">Change</label>
            <select id="al-change" name="change" className={styles.input}>
              <option value="add">Allow</option>
              <option value="remove">Remove</option>
            </select>
            <label htmlFor="al-reason">Reason</label>
            <input
              id="al-reason"
              name="reason"
              className={styles.input}
              maxLength={200}
              required
            />
            <button className={styles.button} disabled={disabled}>
              Save
            </button>
          </form>
        </>
      )}
      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}
    </>
  );
}

function Report({ report }: { report: LinkReport | null }) {
  if (!report || report.kind === "unavailable")
    return <p role="alert">The link report could not be prepared.</p>;
  if (report.kind === "code")
    return (
      <p>
        This deployment reads content from code, not a store generation. There
        is no live generation to check.
      </p>
    );
  return (
    <>
      <p>
        Internal pages and images in live generation {report.generation} (
        {report.items} items), as served by this deployment. External links are
        not checked here.
      </p>
      {report.lines.length ? (
        <ul>
          {report.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p>No missing internal pages, images, parents or quiz targets.</p>
      )}
    </>
  );
}

export function StaffContentMaintenance({
  view,
  filters,
  page,
  report,
  me,
  owner,
  editor,
}: {
  view: MaintenanceView;
  filters: {
    status: MaintenanceStatus | null;
    family: MaintenanceFamily | null;
    after: string;
  };
  page: MaintenancePage;
  report: LinkReport | null;
  me: string;
  owner: boolean;
  editor: boolean;
}) {
  const visible = views.filter((v) => v.id !== "all" || owner || editor);
  return (
    <section className={styles.panel}>
      <h1>Maintenance</h1>
      <p>
        Reviews that are due, who looks after them, and recorded link checks.
        Acknowledging an item never counts as a review.
      </p>
      <nav aria-label="Maintenance views" className={workspace.toolbar}>
        {visible.map((v) => (
          <Link
            key={v.id}
            href={href(v.id)}
            aria-current={v.id === view ? "page" : undefined}
          >
            {v.label}
          </Link>
        ))}
      </nav>
      {(view === "mine" || view === "all") && (
        <Worklist
          view={view}
          page={page}
          filters={filters}
          me={me}
          owner={owner}
          editor={editor}
        />
      )}
      {view === "report" && <Report report={report} />}
      {view === "policy" && <Policy page={page} owner={owner} />}
    </section>
  );
}
