"use client";
import { useRef, useState } from "react";
import { Badge, DataTable } from "@/components/admin-preview/primitives";
import { readRevisionHistoryAction } from "@/app/admin/staff/content/history-actions";
import type {
  RevisionHistoryPage,
  RevisionHistoryResult,
  RevisionSummary,
} from "@/lib/content/revision-history-contract";
import s from "@/components/admin-preview/admin-preview.module.css";
import workspace from "./staff-content-workspace.module.css";
import styles from "./staff-revision-history.module.css";
type Comparison = Extract<RevisionHistoryResult, { kind: "compare" }>;
const decisionLabels = {
  imported: "Imported baseline",
  reviewed: "Reviewer approval",
  single_person: "Owner approval",
  changes_requested: "Changes requested",
};
const approving = (r: RevisionSummary) =>
  r.decisions.some((d) => d.kind !== "changes_requested");
const utc = (at: string) => new Date(at).toISOString();
const refusal = {
  invalid: "That revision cannot be compared. Reload the history.",
  denied:
    "Access to this item changed. Return to staff verification or reload the list.",
  unavailable: "Revision history is unavailable. No saved content was changed.",
  unsupported:
    "These revisions use content this comparison cannot show. Open the editor to review them.",
  stale: "A newer revision was saved. Reload the history and compare again.",
};
export function RevisionComparisonView({ result }: { result: Comparison }) {
  const { comparison: c, from, to } = result;
  return (
    <section
      className={`${s.panel} ${styles.comparison}`}
      aria-labelledby="revision-comparison-heading"
    >
      <h3 id="revision-comparison-heading" tabIndex={-1}>
        Changes from revision {from.revision} to revision {to.revision}
      </h3>
      <p>
        Revision {from.revision} ({from.state.replaceAll("_", " ")}, saved{" "}
        {utc(from.createdAt)}) compared with the latest revision {to.revision} (
        {to.state.replaceAll("_", " ")}). Only editable fields and content are
        compared.
      </p>
      <h4>Fields</h4>
      {!c.fields.length ? (
        <p>No field changed.</p>
      ) : (
        <DataTable
          caption={`Field changes from revision ${from.revision} to ${to.revision}`}
          cols="10rem minmax(0,1fr) minmax(0,1fr)"
          head={["Field", "Before", "After"]}
          rows={c.fields.map((f) => ({
            cells: [
              { label: "Field", node: f.label },
              {
                label: "Before",
                node: (
                  <span className={styles.text}>{f.before || "(empty)"}</span>
                ),
              },
              {
                label: "After",
                node: (
                  <span className={styles.text}>{f.after || "(empty)"}</span>
                ),
              },
            ],
          }))}
        />
      )}
      <h4>Content</h4>
      <p>
        {c.lines.length
          ? `${c.lines.length} content ${c.lines.length === 1 ? "change" : "changes"}; ${c.unchangedLines} unchanged. An edited block shows as removed and added.`
          : `No content changed (${c.unchangedLines} unchanged).`}
      </p>
      {!!c.lines.length && (
        <ol className={styles.lines}>
          {c.lines.map((l, i) => (
            <li
              key={i}
              className={l.op === "added" ? styles.added : styles.removed}
            >
              <Badge kind={l.op === "added" ? "approved" : "arch"}>
                {l.op === "added" ? "Added" : "Removed"}
              </Badge>{" "}
              <strong>
                {l.label} {l.position}
              </strong>{" "}
              {l.op === "added"
                ? "in the latest revision"
                : `in revision ${from.revision}`}
              <span className={styles.text}>{l.text || "(empty)"}</span>
            </li>
          ))}
        </ol>
      )}
      {c.truncated && (
        <p>
          Only the first {c.lines.length} changes are shown. Open the editor to
          review the rest.
        </p>
      )}
    </section>
  );
}
export function StaffRevisionHistory({
  id,
  latestRevision,
}: {
  id: string;
  latestRevision: number;
}) {
  const [page, setPage] = useState<RevisionHistoryPage | null>(null),
    [comparison, setComparison] = useState<Comparison | null>(null),
    [before, setBefore] = useState<number | null>(null),
    [trail, setTrail] = useState<(number | null)[]>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  async function run(
    input: unknown,
    apply: (r: RevisionHistoryResult) => void,
  ) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const result = await readRevisionHistoryAction(input);
      if (result.kind === "history" || result.kind === "compare") apply(result);
      else {
        setComparison(null);
        if (result.kind === "denied" || result.kind === "stale") setPage(null);
        setMessage(refusal[result.kind]);
      }
    } catch {
      setComparison(null);
      setMessage(refusal.unavailable);
    } finally {
      lock.current = false;
      setBusy(false);
      heading.current?.focus();
    }
  }
  const history = (cursor: number | null, nextTrail: (number | null)[]) =>
    run({ kind: "history", id, before: cursor }, (r) => {
      if (r.kind !== "history") return;
      if (r.page.latest !== latestRevision) {
        setPage(null);
        setComparison(null);
        setMessage(refusal.stale);
        return;
      }
      setPage(r.page);
      setBefore(cursor);
      setTrail(nextTrail);
      setComparison(null);
      setMessage("Revision history loaded.");
    });
  const compare = (from: number) =>
    run({ kind: "compare", id, from }, (r) => {
      if (r.kind !== "compare") return;
      setComparison(r);
      setMessage(`Revision ${from} compared with the latest revision.`);
    });
  const lastApproved = page?.rows.find(
    (r) => r.revision !== page.latest && approving(r),
  );
  return (
    <section
      className={`${s.panel} ${styles.history}`}
      aria-labelledby="revision-history-heading"
      aria-busy={busy}
    >
      <h2 id="revision-history-heading" ref={heading} tabIndex={-1}>
        Revision history
      </h2>
      <p>
        Read-only. Compare an earlier revision with the latest one. Nothing here
        changes content or approvals.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={workspace.button}
          disabled={busy}
          onClick={() => void history(null, [])}
        >
          {page ? "Reload history" : "Show revision history"}
        </button>
        {lastApproved && (
          <button
            type="button"
            className={workspace.button}
            disabled={busy}
            onClick={() => void compare(lastApproved.revision)}
          >
            Compare with last approved (revision {lastApproved.revision})
          </button>
        )}
      </div>
      {page && (
        <DataTable
          caption={`Revisions of ${id}, newest first`}
          cols="5rem 8rem 11rem 7rem minmax(0,1.5fr) minmax(0,1.5fr) 9rem"
          head={[
            "Revision",
            "State",
            "Saved (UTC)",
            "Saved by",
            "Reason",
            "Decisions",
            "Action",
          ]}
          rows={page.rows.map((r) => ({
            cells: [
              { label: "Revision", node: r.revision },
              {
                label: "State",
                node: (
                  <Badge
                    kind={
                      r.state === "approved"
                        ? "approved"
                        : r.state === "draft"
                          ? "draft"
                          : r.state === "submitted"
                            ? "review"
                            : "arch"
                    }
                  >
                    {r.state.replaceAll("_", " ")}
                  </Badge>
                ),
              },
              { label: "Saved (UTC)", node: utc(r.createdAt) },
              {
                label: "Saved by",
                node: r.imported
                  ? "Import"
                  : r.authorIsMe
                    ? "You"
                    : "Another staff member",
              },
              {
                label: "Reason",
                node: <span className={styles.text}>{r.reason}</span>,
              },
              {
                label: "Decisions",
                node: r.decisions.length
                  ? r.decisions.map((d) => decisionLabels[d.kind]).join(", ")
                  : "None",
              },
              {
                label: "Action",
                node:
                  r.revision === page.latest ? (
                    <span>Latest</span>
                  ) : (
                    <button
                      type="button"
                      className={workspace.linkButton}
                      disabled={busy}
                      aria-label={`Compare revision ${r.revision} with the latest revision`}
                      onClick={() => void compare(r.revision)}
                    >
                      Compare with latest
                    </button>
                  ),
              },
            ],
          }))}
        />
      )}
      {page && (
        <div className={workspace.pager}>
          <button
            type="button"
            className={workspace.button}
            disabled={busy || !trail.length}
            onClick={() =>
              void history(trail[trail.length - 1], trail.slice(0, -1))
            }
          >
            Newer revisions
          </button>
          <button
            type="button"
            className={workspace.button}
            disabled={busy || !page.next}
            onClick={() =>
              page.next && void history(page.next, [...trail, before])
            }
          >
            Older revisions
          </button>
        </div>
      )}
      <p role="status" aria-live="polite" aria-atomic="true">
        {busy ? "Checking live staff access and reading revisions…" : message}
      </p>
      {comparison && <RevisionComparisonView result={comparison} />}
    </section>
  );
}
