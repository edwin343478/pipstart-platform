import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonical = (v) =>
  Array.isArray(v)
    ? "[" + v.map(canonical).join(",") + "]"
    : v && typeof v === "object"
      ? "{" +
        Object.keys(v)
          .sort()
          .map((k) => JSON.stringify(k) + ":" + canonical(v[k]))
          .join(",") +
        "}"
      : JSON.stringify(v);
const hash = (v) => createHash("sha256").update(v).digest("hex");
export const closureDigest = (v) => hash(canonical(v));
const normalized = (p) =>
  fs
    .readFileSync(p, "utf8")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n");
const read = (p) => JSON.parse(normalized(path.join(root, p)));
const review = read("docs/milestone-17-source-closure.review.json");
const applied = read("docs/milestone-17-source-closure.applied.json");
export const sourceClosurePriorLedger = read(
  "docs/milestone-17-source-verification.pre-closure.json",
);
assert.equal(
  closureDigest(review),
  "c883d1666444660b7106a23e9f4e1df071a4b250dae6d5014c95c72c388820bf",
  "Exact owner-approved review snapshot",
);
assert.equal(
  closureDigest(applied),
  "39e14d33800d564c7d6ed23c4c659b366e94f5cd6e28af15da2c88ce715cd06b",
  "Exact correction approval/application record",
);
assert.equal(
  closureDigest(sourceClosurePriorLedger),
  "625ec0616084dfa076670e19952ade74fa758656b669b08691d6f1106e744b85",
  "Historical evidence ledger preserved",
);

export function restoreSourceReviewBaseline(c, a = applied, r = review) {
  assert.equal(a.schemaVersion, 1);
  assert.equal(a.approved, true);
  assert.equal(a.applied, true);
  assert.deepEqual(a.approval, {
    date: "2026-10-08",
    scope: "18-exact-wording-corrections-and-evidence-ledger-reconciliation",
    publicationApproved: false,
  });
  assert.equal(a.publicationApproved, false);
  assert.equal(a.releaseReady, false);
  assert.equal(a.reviewDigest, closureDigest(r));
  assert.equal(a.beforeCatalogueDigest, r.catalogueDigest);
  assert.equal(
    closureDigest(c),
    a.afterCatalogueDigest,
    "Exact corrected catalogue",
  );
  assert.equal(c.approved, false);
  assert.equal(c.status, "draft");
  assert.equal(a.corrections.length, 18);
  assert.equal(a.correctionCount, 18);
  const result = structuredClone(c),
    seen = new Set();
  for (const x of a.corrections) {
    const key = x.entryId + "/" + x.meaningIndex;
    assert.ok(!seen.has(key));
    seen.add(key);
    const proposal = r.corrections.find(
      (p) => p.entryId === x.entryId && p.meaningIndex === x.meaningIndex,
    );
    assert.ok(proposal, "Only approved replacement targets");
    assert.deepEqual(x, {
      entryId: proposal.entryId,
      meaningIndex: proposal.meaningIndex,
      field: proposal.field,
      before: proposal.before,
      after: proposal.proposed,
      reason: proposal.reason,
      sourceIds: proposal.sourceIds,
      approved: true,
      applied: true,
    });
    const e = result.entries.find((e) => e.id === x.entryId),
      m = e?.meanings[x.meaningIndex];
    assert.ok(m);
    assert.equal(m[x.field], x.after, "Exact replacement is applied");
    m[x.field] = x.before;
  }
  assert.equal(
    closureDigest(result),
    a.beforeCatalogueDigest,
    "Only the approved 18 fields changed",
  );
  return result;
}
export function restoreSourceReviewText(raw) {
  let result = raw;
  for (const x of applied.corrections) {
    const parts = result.split(JSON.stringify(x.after));
    assert.equal(parts.length, 2, "Unique approved field text");
    result = parts.join(JSON.stringify(x.before));
  }
  assert.equal(
    hash(result),
    review.catalogueTextHash,
    "Exact historical text restoration",
  );
  return result;
}
function calculate(x) {
  if (typeof x === "number") {
    assert.ok(Number.isFinite(x));
    return x;
  }
  assert.ok(x && Array.isArray(x.args) && x.args.length === 2);
  const [a, b] = x.args.map(calculate);
  if (x.op === "add") return a + b;
  if (x.op === "subtract") return a - b;
  if (x.op === "multiply") return a * b;
  if (x.op === "divide") {
    assert.notEqual(b, 0);
    return a / b;
  }
  throw new Error("Unsupported proof operation");
}
function expectedLedger(c, r, h, raw) {
  const result = structuredClone(h),
    entries = new Map(c.entries.map((e) => [e.id, e]));
  const rows = new Map(
    r.rows.map((x) => [x.entryId + "/" + x.meaningIndex, x]),
  );
  const fixes = new Map(
    r.corrections.map((x) => [x.entryId + "/" + x.meaningIndex, x]),
  );
  Object.assign(result, {
    auditDate: "2026-10-08",
    scope: "whole-meaning-scoped-review-and-approved-corrections-private-draft",
    catalogueDigest: closureDigest(c),
    catalogueTextHash: hash(raw),
    sources: r.sources,
    fullMeaningReviewCount: 380,
    unresolvedWordingCorrections: 0,
    scopeLimitationsRemain: true,
    wordingCorrections: {
      previouslyApplied: 5,
      newlyApplied: 18,
      totalApplied: 23,
    },
    sourceClosureEvidence: "docs/milestone-17-source-closure.applied.json",
  });
  const counts = {};
  for (const row of result.rows) {
    const key = row.entryId + "/" + row.meaningIndex,
      x = rows.get(key),
      e = entries.get(row.entryId),
      m = e?.meanings[row.meaningIndex];
    assert.ok(x && m);
    const prior = row.status,
      status = ["arithmetic-verified", "course-context-aligned"].includes(prior)
        ? prior
        : "source-reviewed-with-scope";
    Object.assign(row, {
      priorStatus: prior,
      status,
      definition: m.definition,
      meaningDigest: closureDigest(m),
      entryDigest: closureDigest(e),
      sourceIds: x.sourceIds,
      fullMeaningReview: "review-complete-with-recorded-scope",
      definitionReview: x.definitionReview,
      exampleReview: x.exampleReview,
      confusionNoteReview: x.noteReview,
      supportType: x.supportType,
      fullMeaningEvidence: "docs/milestone-17-source-closure.review.json",
      requiredAction:
        "No outstanding wording correction. Preserve recorded limits; expanded content integration, release testing and publication approval remain required.",
    });
    if (fixes.has(key)) {
      const fix = fixes.get(key);
      row.approvedCorrection = {
        field: fix.field,
        applied: true,
        record: "docs/milestone-17-source-closure.applied.json",
      };
      row.definitionReview =
        (fix.field === "definition"
          ? "Approved definition correction applied: "
          : "Definition retained; approved example correction applied: ") +
        fix.reason;
      if (fix.field === "example")
        row.exampleReview =
          "Approved example correction applied: " +
          fix.reason +
          " The illustration remains hypothetical and scoped to provider terms.";
    }
    counts[status] = (counts[status] || 0) + 1;
  }
  result.counts = counts;
  for (const g of result.gates) {
    if (g.id === "source-completion")
      Object.assign(g, {
        status: "complete",
        evidence:
          "All 380 meanings have a documented scoped review, including the 118 former pending checks. Recorded evidence limits remain; this is not universal certification or publication approval.",
      });
    if (g.id === "corrections")
      Object.assign(g, {
        status: "complete",
        evidence:
          "The five earlier corrections and 18 replacements approved on 2026-10-08 are applied to the private draft. Both prior wording and exact approval scope are retained.",
      });
  }
  return result;
}
export function verifySourceClosure(
  c,
  l,
  raw,
  a = applied,
  r = review,
  h = sourceClosurePriorLedger,
) {
  const before = restoreSourceReviewBaseline(c, a, r);
  assert.equal(a.priorLedgerDigest, closureDigest(h));
  assert.equal(h.catalogueDigest, closureDigest(before));
  assert.equal(a.afterLedgerDigest, closureDigest(l));
  assert.equal(a.reviewedMeaningCount, 380);
  assert.equal(a.previousPendingResolved, 118);
  assert.equal(a.unresolvedWordingCorrections, 0);
  assert.equal(a.scopeLimitationsRemain, true);
  assert.equal(r.rows.length, 380);
  assert.equal(r.previousTargetedPendingReviewed, 118);
  assert.equal(r.reviewIsPublicationApproval, false);
  assert.equal(r.releaseReady, false);
  const sources = new Map(r.sources.map((s) => [s.id, s]));
  assert.equal(sources.size, 159);
  for (const s of sources.values()) {
    assert.equal(new URL(s.url).protocol, "https:");
    assert.ok(s.retrievalRef && s.supportedScope && s.limitation);
  }
  for (const s of h.sources)
    assert.deepEqual(
      sources.get(s.id),
      s,
      "Retain historical source scopes and dates",
    );
  const seen = new Set();
  for (const x of r.rows) {
    const key = x.entryId + "/" + x.meaningIndex;
    assert.ok(!seen.has(key));
    seen.add(key);
    const e = before.entries.find((e) => e.id === x.entryId),
      m = e?.meanings[x.meaningIndex];
    assert.ok(m);
    assert.deepEqual(x.meaning, m);
    assert.equal(x.meaningDigest, closureDigest(m));
    assert.ok(x.definitionReview && x.exampleReview && x.noteReview);
    assert.equal(x.publicationApproved, false);
    x.sourceIds.forEach((id) => assert.ok(sources.has(id)));
    if (x.supportType === "primary-concept-and-scoped-inference")
      assert.ok(x.sourceIds.length);
    const fix = r.corrections.find(
      (p) => p.entryId === x.entryId && p.meaningIndex === x.meaningIndex,
    );
    assert.equal(
      x.decision,
      fix ? "correction-proposed" : "retain-with-recorded-scope",
    );
  }
  assert.equal(seen.size, 380);
  assert.equal(r.corrections.length, 18);
  assert.equal(
    r.unresolvedClaims.length,
    18,
    "Historical proposals retained; all are resolved in applied record",
  );
  assert.equal(r.additionalNumericalProofs.length, 41);
  for (const p of r.additionalNumericalProofs) {
    const x = r.rows.find(
      (x) => x.entryId === p.entryId && x.meaningIndex === p.meaningIndex,
    );
    assert.ok(x);
    assert.equal(p.meaningDigest, x.meaningDigest);
    assert.ok(p.units);
    assert.equal(p.tolerance, 1e-9);
    assert.ok(Number.isFinite(p.expected));
    assert.ok(Math.abs(calculate(p.expression) - p.expected) <= p.tolerance);
    const m = c.entries.find((e) => e.id === p.entryId).meanings[
      p.meaningIndex
    ];
    assert.equal(
      m.example,
      x.meaning.example,
      "Arithmetic example still matches reviewed proof",
    );
  }
  assert.deepEqual(
    l,
    expectedLedger(c, r, h, raw),
    "Exact ledger reconciliation; no hidden pending flags or opened release gates",
  );
  assert.deepEqual(l.counts, {
    "source-reviewed-with-scope": 302,
    "arithmetic-verified": 20,
    "course-context-aligned": 58,
  });
  assert.equal(l.releaseReady, false);
  assert.ok(l.rows.every((x) => x.publicationEligible === false));
  assert.ok(
    c.entries.every(
      (e) =>
        e.status === "draft" &&
        e.approved === false &&
        e.sourceReview === "pending",
    ),
  );
  return before;
}

export function runSourceClosureNegativeChecks(c, l, raw) {
  const fixtures = [
    [
      "unapproved extra definition",
      (x) => {
        x.c.entries[0].meanings[0].definition += " changed";
      },
    ],
    [
      "missing corrected field",
      (x) => {
        const p = x.a.corrections[0];
        x.c.entries.find((e) => e.id === p.entryId).meanings[p.meaningIndex][
          p.field
        ] = p.before;
      },
    ],
    [
      "wrong second meaning",
      (x) => {
        x.a.corrections.find(
          (p) => p.entryId === "crypto:slashing",
        ).meaningIndex = 0;
      },
    ],
    [
      "withdrawn approval",
      (x) => {
        x.a.approved = false;
      },
    ],
    [
      "invented approval date",
      (x) => {
        x.a.approval.date = "2026-10-09";
      },
    ],
    [
      "missing review",
      (x) => {
        x.r.rows.pop();
      },
    ],
    [
      "duplicate review",
      (x) => {
        x.r.rows[1] = structuredClone(x.r.rows[0]);
      },
    ],
    [
      "removed evidence",
      (x) => {
        x.l.rows[0].sourceIds = [];
      },
    ],
    [
      "stale pending state",
      (x) => {
        x.l.rows[0].fullMeaningReview = "pending";
      },
    ],
    [
      "publication gate opened",
      (x) => {
        x.c.approved = true;
      },
    ],
    [
      "false release",
      (x) => {
        x.l.releaseReady = true;
      },
    ],
    [
      "historical evidence rewritten",
      (x) => {
        x.h.sources[0].supportedScope = "changed";
      },
    ],
    [
      "bad proof",
      (x) => {
        x.r.additionalNumericalProofs[0].expected += 1;
      },
    ],
    [
      "wrong totals",
      (x) => {
        x.l.counts["source-reviewed-with-scope"] -= 1;
      },
    ],
    [
      "integration gate opened",
      (x) => {
        x.l.gates.find((g) => g.id === "content-adapter").status = "complete";
      },
    ],
    [
      "unresolved correction",
      (x) => {
        x.a.unresolvedWordingCorrections = 1;
      },
    ],
  ];
  for (const [label, mutate] of fixtures) {
    const x = {
      c: structuredClone(c),
      l: structuredClone(l),
      a: structuredClone(applied),
      r: structuredClone(review),
      h: structuredClone(sourceClosurePriorLedger),
    };
    mutate(x);
    // Allow record hashes to follow fixture edits so semantic checks cannot hide behind a checksum failure.
    x.a.reviewDigest = closureDigest(x.r);
    x.a.priorLedgerDigest = closureDigest(x.h);
    x.a.afterLedgerDigest = closureDigest(x.l);
    x.a.afterCatalogueDigest = closureDigest(x.c);
    assert.throws(
      () => verifySourceClosure(x.c, x.l, raw, x.a, x.r, x.h),
      undefined,
      "Missed semantic fixture: " + label,
    );
  }
  return fixtures.length;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const raw = normalized(
      path.join(
        root,
        "apps/pipstart/src/content/glossary-catalogue.draft.json",
      ),
    ),
    c = JSON.parse(raw),
    l = read("docs/milestone-17-source-verification.json");
  verifySourceClosure(c, l, raw);
  runSourceClosureNegativeChecks(c, l, raw);
  console.log(
    "M17 source closure passed: all 380 meanings reviewed with scope; 18 exact corrections applied; 118 former pending checks reconciled.",
  );
  console.log(
    "41 additional numerical proofs and 16 semantic negative fixtures passed. All 90 inherited source records preserved.",
  );
  console.log(
    "Historical proposed issues are resolved by the applied record. Expanded publication, integration testing and release approval remain gated.",
  );
}
