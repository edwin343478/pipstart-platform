"use client";
import { actionLimitMessage } from "@/lib/content/staff-action-limit";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { runPartnerEditorAction } from "@/app/admin/staff/content/partner-actions";
import {
  emptyPartnerFields,
  hostName,
  linkProblems,
  partnerProblems,
  partnerSlug,
  type LinkFields,
  type PartnerEditorInput,
  type PartnerEditorResult,
  type PartnerEditorView,
  type PartnerFact,
  type PartnerFields,
  type PartnerPolicyView,
} from "@/lib/content/partner-editor-contract";
import s from "@/components/admin-preview/admin-preview.module.css";
import { Icon } from "@/components/admin-preview/icons";
import styles from "./staff-curriculum-editor.module.css";

export type PartnerCreation = {
  kind: "partner" | "link";
  slug: string;
  policy: PartnerPolicyView | null;
};
const subscribe = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;
const outcome: Record<string, string> = {
  invalid:
    "The store refused these details. Check the highlighted rules; nothing was saved.",
  denied: "Your current access does not allow this. Nothing was saved.",
  unavailable: "The store could not be reached. Nothing was saved; try again.",
  conflict:
    "Someone saved a newer revision first. Your entries are still here; load the latest before saving again.",
  uncertain:
    "The result is unclear. Do not save again: reload this page to see what the store recorded.",
};
const emptyFact = (): PartnerFact => ({
  label: "",
  value: "",
  verification: "pending",
  sourceUrl: "",
  checkedAt: "",
});

/** Partner or link draft editor, with the Owner's protected policy beside it. Review and making
 * content live happen in the content library, through the shared panels. */
export function StaffPartnerEditor({
  view,
  create,
  isOwner,
}: {
  view: PartnerEditorView | null;
  create: PartnerCreation | null;
  isOwner: boolean;
}) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    subscribe,
    clientHydrated,
    serverHydrated,
  );
  const kind = view?.kind ?? create!.kind;
  const [slug, setSlug] = useState(view?.slug ?? create?.slug ?? "");
  const [partner, setPartner] = useState<PartnerFields>(
    view?.kind === "partner" ? view.fields : emptyPartnerFields(),
  );
  const [link, setLink] = useState<LinkFields>(
    view?.kind === "link"
      ? view.fields
      : { title: "Open an account", url: "", active: true, expiresAt: "" },
  );
  const [base, setBase] = useState(
    view
      ? { revision: view.revision, sha: view.bodySha256, state: view.state }
      : null,
  );
  const [policy, setPolicy] = useState<PartnerPolicyView>(
    view?.policy ??
      create?.policy ?? { version: 0, riskNotice: null, allowedHosts: [] },
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const [notice, setNotice] = useState(policy.riskNotice ?? "");
  const [hosts, setHosts] = useState(policy.allowedHosts.join(", "));
  const [policyReason, setPolicyReason] = useState("");
  const itemId = (kind === "partner" ? "partner:" : "link:") + slug;
  const disabled = !hydrated || busy || !!view?.trashed;

  async function run(input: PartnerEditorInput): Promise<PartnerEditorResult> {
    setBusy(true);
    try {
      return await runPartnerEditorAction(input);
    } catch {
      return { kind: "unavailable" };
    } finally {
      setBusy(false);
    }
  }
  async function reload(note: string) {
    const r = await run({ kind: "load", id: itemId });
    if (r.kind !== "ready")
      return setMessage(note + " Reload the page to see the latest revision.");
    if (r.view.kind === "partner") setPartner(r.view.fields);
    else setLink(r.view.fields);
    setBase({
      revision: r.view.revision,
      sha: r.view.bodySha256,
      state: r.view.state,
    });
    setPolicy(r.view.policy);
    setDirty(false);
    setMessage(note);
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    const p =
      kind === "partner"
        ? partnerProblems(partner)
        : linkProblems(link, policy.allowedHosts);
    if (!partnerSlug(slug))
      p.unshift(
        "Use a lowercase identity of letters, numbers and single hyphens.",
      );
    if (!reason.trim()) p.push("Give a change reason.");
    setProblems(p);
    if (p.length)
      return setMessage("Fix the problems listed above. Nothing was saved.");
    const r = reason.trim();
    const input: PartnerEditorInput = base
      ? kind === "partner"
        ? {
            kind: "save-partner",
            slug,
            fields: partner,
            baseRevision: base.revision,
            baseSha256: base.sha,
            reason: r,
          }
        : {
            kind: "save-link",
            slug,
            fields: link,
            baseRevision: base.revision,
            baseSha256: base.sha,
            reason: r,
          }
      : kind === "partner"
        ? { kind: "create-partner", slug, fields: partner, reason: r }
        : { kind: "create-link", slug, fields: link, reason: r };
    const result = await run(input);
    if (result.kind !== "saved")
      return setMessage(
        result.kind === "limited"
          ? actionLimitMessage(result.retryAfter)
          : (outcome[result.kind] ?? outcome.unavailable),
      );
    setReason("");
    if (!base) {
      router.push(
        "/admin/staff/content/partner?id=" + encodeURIComponent(result.id),
      );
      return;
    }
    await reload(
      `Draft revision ${result.revision} saved. Send it for review from the content library.`,
    );
  }
  async function savePolicy() {
    const r = policyReason.trim();
    const list = hosts
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    if (!r)
      return setMessage(
        "Give a reason for the policy change. Nothing was saved.",
      );
    if (kind === "partner" && !notice.trim())
      return setMessage("Write the risk notice. Nothing was saved.");
    if (
      kind === "link" &&
      (!list.length ||
        list.length > 5 ||
        !list.every(hostName) ||
        new Set(list).size !== list.length)
    )
      return setMessage(
        "List one to five different lowercase host names, separated by commas. Nothing was saved.",
      );
    const result = await run({
      kind: "policy",
      id: itemId,
      expectedVersion: policy.version,
      riskNotice: kind === "partner" ? notice.trim() : null,
      allowedHosts: kind === "link" ? list : null,
      reason: r,
    });
    if (result.kind !== "policy-saved")
      return setMessage(
        result.kind === "limited"
          ? actionLimitMessage(result.retryAfter)
          : (outcome[result.kind] ?? outcome.unavailable),
      );
    setPolicyReason("");
    const fresh = await run({ kind: "read-policy", id: itemId });
    if (fresh.kind === "policy") setPolicy(fresh.policy);
    setMessage(
      `Policy version ${result.version} saved. Live content changes only when a new generation is made live.`,
    );
  }
  const setFact = (i: number, patch: Partial<PartnerFact>) => {
    setDirty(true);
    setPartner((f) => ({
      ...f,
      facts: f.facts.map((x, j) => (j === i ? { ...x, ...patch } : x)),
    }));
  };
  const field = <K extends keyof PartnerFields>(
    name: K,
    value: PartnerFields[K],
  ) => {
    setDirty(true);
    setPartner((f) => ({ ...f, [name]: value }));
  };
  const title =
    kind === "partner"
      ? base
        ? `Partner ${slug}`
        : "New partner"
      : base
        ? `Link for ${slug}`
        : `New link for ${slug}`;

  return (
    <div className={`${styles.editor} ${styles.redesign} ${styles.partner}`}>
      <header className={styles.head}>
        <div className={styles.headRow}>
          <div className={styles.headText}>
            <p className={styles.eyebrow}>Partner directory</p>
            <h1>{title}</h1>
            <p>
              Drafts change nothing public. A saved draft is reviewed and made
              live from the <a href="/admin/staff/content">content library</a>;
              the directory and <code>/go</code> change when that generation is
              delivered.
            </p>
          </div>
        </div>
      </header>
      {view?.trashed && (
        <p className={styles.archived}>
          This item is archived and cannot be edited.
        </p>
      )}
      {base && (
        <p className={styles.revisionChip}>
          Latest revision {base.revision} · state{" "}
          {base.state.replaceAll("_", " ")}
        </p>
      )}
      {kind === "partner" && view?.kind === "partner" && (
        <p className={styles.headAction}>
          {view.hasLink ? (
            <a
              href={
                "/admin/staff/content/partner?id=" +
                encodeURIComponent("link:" + slug)
              }
            >
              Edit this partner’s link
            </a>
          ) : (
            <a
              href={
                "/admin/staff/content/partner?link=" + encodeURIComponent(slug)
              }
            >
              Add a link for this partner
            </a>
          )}
        </p>
      )}
      <form
        className={styles.formCard}
        onSubmit={(e) => void save(e)}
        noValidate
      >
        <fieldset disabled={disabled}>
          <legend>
            {kind === "partner" ? "Partner details" : "Link details"}
          </legend>
          {!base && kind === "partner" && (
            <label htmlFor="partner-slug">
              Identity
              <input
                id="partner-slug"
                required
                maxLength={60}
                value={slug}
                onChange={(e) => {
                  setDirty(true);
                  setSlug(e.target.value);
                }}
              />
              <span>
                Lowercase letters, numbers and hyphens. Its link will be served
                at /go/{slug || "identity"}.
              </span>
            </label>
          )}
          {kind === "partner" ? (
            <>
              <div className={styles.grid}>
                <label htmlFor="partner-name">
                  Name
                  <input
                    id="partner-name"
                    required
                    maxLength={200}
                    value={partner.name}
                    onChange={(e) => field("name", e.target.value)}
                  />
                </label>
                <label htmlFor="partner-short">
                  Short name
                  <input
                    id="partner-short"
                    required
                    maxLength={60}
                    value={partner.shortName}
                    onChange={(e) => field("shortName", e.target.value)}
                  />
                </label>
                <label htmlFor="partner-kind">
                  Directory
                  <select
                    id="partner-kind"
                    value={partner.kind}
                    onChange={(e) =>
                      field("kind", e.target.value as PartnerFields["kind"])
                    }
                  >
                    <option value="forex-broker">Forex broker</option>
                    <option value="crypto-exchange">Crypto exchange</option>
                  </select>
                </label>
                <label htmlFor="partner-relationship">
                  Relationship
                  <select
                    id="partner-relationship"
                    value={partner.relationship}
                    onChange={(e) =>
                      field(
                        "relationship",
                        e.target.value as PartnerFields["relationship"],
                      )
                    }
                  >
                    <option value="affiliate">
                      Affiliate (disclosure shown)
                    </option>
                    <option value="none">No commercial relationship</option>
                  </select>
                </label>
                <label htmlFor="partner-brand">
                  Card style
                  <select
                    id="partner-brand"
                    value={partner.brand}
                    onChange={(e) =>
                      field("brand", e.target.value as PartnerFields["brand"])
                    }
                  >
                    <option value="neutral">Neutral</option>
                    <option value="deriv">Deriv</option>
                  </select>
                </label>
              </div>
              <label htmlFor="partner-summary" className={styles.wide}>
                Summary
                <textarea
                  id="partner-summary"
                  rows={4}
                  required
                  maxLength={2000}
                  value={partner.summary}
                  onChange={(e) => field("summary", e.target.value)}
                />
              </label>
              <fieldset className={styles.subBox}>
                <legend>Review</legend>
                <div className={styles.grid}>
                  <label htmlFor="partner-review-status">
                    Review status
                    <select
                      id="partner-review-status"
                      value={partner.reviewStatus}
                      onChange={(e) =>
                        field(
                          "reviewStatus",
                          e.target.value as PartnerFields["reviewStatus"],
                        )
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                    </select>
                  </label>
                  <label htmlFor="partner-reviewed">
                    Reviewed on
                    <input
                      id="partner-reviewed"
                      type="date"
                      value={partner.reviewedAt}
                      onChange={(e) => field("reviewedAt", e.target.value)}
                    />
                  </label>
                  <label htmlFor="partner-expires">
                    Review expires on
                    <input
                      id="partner-expires"
                      type="date"
                      value={partner.expiresAt}
                      onChange={(e) => field("expiresAt", e.target.value)}
                    />
                    <span>
                      From this date the visit button stops until the review is
                      renewed.
                    </span>
                  </label>
                </div>
                <label htmlFor="partner-sources">
                  Review sources
                  <textarea
                    id="partner-sources"
                    rows={4}
                    maxLength={10000}
                    value={partner.reviewSources}
                    onChange={(e) => field("reviewSources", e.target.value)}
                  />
                  <span>
                    One per line: an https link, a space, then the date you
                    checked it (YYYY-MM-DD).
                  </span>
                </label>
              </fieldset>
              <fieldset className={styles.subBox}>
                <legend>Facts</legend>
                {partner.facts.map((f, i) => (
                  <fieldset key={i} className={styles.factCard}>
                    <legend>Fact {i + 1}</legend>
                    <div className={styles.grid}>
                      <label htmlFor={`fact-label-${i}`}>
                        Label
                        <input
                          id={`fact-label-${i}`}
                          maxLength={100}
                          value={f.label}
                          onChange={(e) =>
                            setFact(i, { label: e.target.value })
                          }
                        />
                      </label>
                      <label htmlFor={`fact-value-${i}`}>
                        Value
                        <input
                          id={`fact-value-${i}`}
                          maxLength={500}
                          value={f.value}
                          onChange={(e) =>
                            setFact(i, { value: e.target.value })
                          }
                        />
                      </label>
                      <label htmlFor={`fact-verification-${i}`}>
                        Verification
                        <select
                          id={`fact-verification-${i}`}
                          value={f.verification}
                          onChange={(e) =>
                            setFact(i, {
                              verification: e.target
                                .value as PartnerFact["verification"],
                            })
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                        </select>
                      </label>
                      <label htmlFor={`fact-source-${i}`}>
                        Source link
                        <input
                          id={`fact-source-${i}`}
                          type="url"
                          maxLength={2048}
                          value={f.sourceUrl}
                          onChange={(e) =>
                            setFact(i, { sourceUrl: e.target.value })
                          }
                        />
                      </label>
                      <label htmlFor={`fact-checked-${i}`}>
                        Source checked on
                        <input
                          id={`fact-checked-${i}`}
                          type="date"
                          value={f.checkedAt}
                          onChange={(e) =>
                            setFact(i, { checkedAt: e.target.value })
                          }
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className={styles.dangerAction}
                      onClick={() => {
                        setDirty(true);
                        setPartner((x) => ({
                          ...x,
                          facts: x.facts.filter((_, j) => j !== i),
                        }));
                      }}
                    >
                      Remove fact {i + 1}
                    </button>
                  </fieldset>
                ))}
                <button
                  type="button"
                  className={styles.addButton}
                  disabled={partner.facts.length >= 50}
                  onClick={() => {
                    setDirty(true);
                    setPartner((x) => ({
                      ...x,
                      facts: [...x.facts, emptyFact()],
                    }));
                  }}
                >
                  Add a fact
                </button>
              </fieldset>
              <p>
                Fees, payments, support, regulated entities, availability and
                the card image are kept exactly as stored.
              </p>
            </>
          ) : (
            <>
              <p>
                Approved hosts:{" "}
                {policy.allowedHosts.length
                  ? policy.allowedHosts.join(", ")
                  : "none yet: the Owner must approve a host first"}
              </p>
              <div className={styles.grid}>
                <label htmlFor="link-title">
                  Button label
                  <input
                    id="link-title"
                    required
                    maxLength={200}
                    value={link.title}
                    onChange={(e) => {
                      setDirty(true);
                      setLink({ ...link, title: e.target.value });
                    }}
                  />
                </label>
                <label htmlFor="link-url">
                  Destination
                  <input
                    id="link-url"
                    type="url"
                    required
                    maxLength={2048}
                    value={link.url}
                    onChange={(e) => {
                      setDirty(true);
                      setLink({ ...link, url: e.target.value });
                    }}
                  />
                  <span>
                    Keep the partner’s attribution parameters exactly as issued.
                  </span>
                </label>
                <label htmlFor="link-expires">
                  Stops working on
                  <input
                    id="link-expires"
                    type="date"
                    value={link.expiresAt}
                    onChange={(e) => {
                      setDirty(true);
                      setLink({ ...link, expiresAt: e.target.value });
                    }}
                  />
                </label>
              </div>
              <label htmlFor="link-active">
                <input
                  id="link-active"
                  type="checkbox"
                  checked={link.active}
                  onChange={(e) => {
                    setDirty(true);
                    setLink({ ...link, active: e.target.checked });
                  }}
                />{" "}
                Active
              </label>
            </>
          )}
          <label htmlFor="partner-reason" className={styles.reason}>
            Change reason
            <input
              id="partner-reason"
              required
              maxLength={200}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        </fieldset>
        {problems.length > 0 && (
          <ul aria-label="Problems to fix" className={styles.problems}>
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
        <div className={styles.actions}>
          <button type="submit" disabled={disabled || (!!base && !dirty)}>
            {busy
              ? "Saving…"
              : base
                ? "Save draft"
                : kind === "partner"
                  ? "Create partner draft"
                  : "Create link draft"}
          </button>
          {base && (
            <button
              type="button"
              className={styles.dangerAction}
              disabled={disabled}
              onClick={() =>
                void reload(
                  "Latest revision loaded; unsaved entries were discarded.",
                )
              }
            >
              Load latest and discard my changes
            </button>
          )}
        </div>
      </form>
      {(isOwner || policy.version > 0) && (base || kind === "link") && (
        <section
          className={`${s.panel} ${styles.policyCard}`}
          aria-labelledby="policy-heading"
        >
          <h2 id="policy-heading">
            <span className={styles.policyIcon}>
              <Icon name="shield" />
            </span>
            Owner policy
          </h2>
          <p>
            {kind === "partner"
              ? "The risk notice shown on this partner’s card. Only the Owner can change it."
              : "The hosts this link may point to. Only the Owner can change them."}{" "}
            Version {policy.version || "not set"}.
          </p>
          {kind === "partner" ? (
            <label htmlFor="policy-notice">
              Risk notice
              <textarea
                id="policy-notice"
                rows={3}
                maxLength={1000}
                readOnly={!isOwner}
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
              />
            </label>
          ) : (
            <label htmlFor="policy-hosts">
              Approved hosts
              <input
                id="policy-hosts"
                maxLength={1300}
                readOnly={!isOwner}
                value={hosts}
                onChange={(e) => setHosts(e.target.value)}
              />
              <span>
                Lowercase host names separated by commas, for example
                t.example.link.
              </span>
            </label>
          )}
          {isOwner && (
            <>
              <label htmlFor="policy-reason">
                Policy change reason
                <input
                  id="policy-reason"
                  maxLength={200}
                  value={policyReason}
                  onChange={(e) => setPolicyReason(e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={!hydrated || busy || (kind === "partner" && !base)}
                onClick={() => void savePolicy()}
              >
                Save policy version {policy.version + 1}
              </button>
            </>
          )}
        </section>
      )}
      {kind === "partner" && !base && isOwner && (
        <p>Save the partner first, then set its risk notice here.</p>
      )}
      <p
        className={styles.statusLine}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {busy ? "Checking live staff access with the store…" : message}
      </p>
    </div>
  );
}
