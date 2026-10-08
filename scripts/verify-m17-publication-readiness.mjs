import {
  restoreSourceReviewBaseline,
  restoreSourceReviewText,
  sourceClosurePriorLedger,
  verifySourceClosure,
  runSourceClosureNegativeChecks,
} from "./verify-m17-source-closure.mjs";
import { verifyCourseContext } from "./verify-m17-course-context.mjs";
import { verifyTargetedSources2 } from "./verify-m17-targeted-sources-2.mjs";
import { verifyTargetedSources1 } from "./verify-m17-targeted-sources-1.mjs";
import assert from "node:assert/strict";
import { verifyArithmetic } from "./verify-m17-glossary-arithmetic.mjs";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) =>
  JSON.parse(
    fs.readFileSync(path.join(root, p), "utf8").replace(/^\uFEFF/, ""),
  );
const sha = (s) => createHash("sha256").update(s).digest("hex");
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
const digest = (v) => sha(canonical(v));
const argIndex = process.argv.indexOf("--catalogue-root");
if (argIndex >= 0 && !process.argv[argIndex + 1])
  throw new Error("Catalogue root argument missing");
const catalogueRoot =
  argIndex >= 0 ? path.resolve(process.argv[argIndex + 1]) : root;
const currentLedger = read("docs/milestone-17-source-verification.json");
const ledger = sourceClosurePriorLedger;
const proposals = JSON.parse(
  fs
    .readFileSync(
      path.join(
        catalogueRoot,
        "docs/milestone-17-source-corrections.proposed.json",
      ),
      "utf8",
    )
    .replace(/^\uFEFF/, ""),
);
const targetedSources2 = read("docs/milestone-17-targeted-sources-2.json");
const targetedSources1 = read("docs/milestone-17-targeted-sources-1.json");
const courseContext = read(
  "docs/milestone-17-course-context-verification.json",
);
const contextEvidence = read("docs/milestone-17-course-context-evidence.json");
const arithmetic = read("docs/milestone-17-arithmetic-verification.json");
const currentText = fs
  .readFileSync(path.join(catalogueRoot, ledger.cataloguePath), "utf8")
  .replace(/^\uFEFF/, "")
  .replace(/\r\n?/g, "\n");
const currentCatalogue = JSON.parse(currentText);
const catalogue = restoreSourceReviewBaseline(currentCatalogue);
const text = restoreSourceReviewText(currentText);

function verify(c, l, p, raw = text) {
  assert.equal(l.schemaVersion, 1, "Ledger schema");
  assert.equal(p.schemaVersion, 1, "Proposal schema");
  assert.equal(
    l.cataloguePath,
    "apps/pipstart/src/content/glossary-catalogue.draft.json",
    "Catalogue path",
  );
  assert.equal(l.catalogueTextHash, sha(raw), "Catalogue text differs");
  assert.equal(l.catalogueDigest, digest(c), "Catalogue digest");
  assert.equal(p.catalogueDigest, digest(c), "Proposal catalogue digest");
  assert.equal(c.status, "draft", "Root publication gate");
  assert.equal(c.approved, false, "Root approval gate");
  assert.equal(p.approved, true, "Corrections approved");
  assert.equal(p.applied, true, "Corrections applied");
  assert.equal(l.releaseReady, false, "Audit is not release authorization");
  assert.equal(c.entries.length, 378, "Catalogue entries");
  assert.equal(l.entryCount, c.entries.length, "Ledger entries");
  const meanings = c.entries.reduce((n, e) => n + e.meanings.length, 0);
  assert.equal(meanings, 380, "Catalogue meanings");
  assert.equal(l.meaningCount, meanings, "Ledger meaning count");
  assert.equal(l.rows.length, meanings, "Ledger coverage");
  const sources = new Map();
  for (const s of l.sources) {
    assert.ok(s.id && !sources.has(s.id), "Unique source ID");
    assert.equal(new URL(s.url).protocol, "https:", "HTTPS evidence URL");
    assert.ok(
      s.title && s.publisher && s.checkedOn && s.supportedScope && s.limitation,
      "Source scope metadata",
    );
    assert.ok(
      ["page-excerpt", "author-abstract", "primary-indexed-excerpt"].includes(
        s.retrieval,
      ),
      "Retrieval method",
    );
    sources.set(s.id, s);
  }
  const entries = new Map(c.entries.map((e) => [e.id, e]));
  assert.equal(entries.size, c.entries.length, "Unique entries");
  const seen = new Set(),
    counts = {};
  const statuses = new Set([
    "core-evidence-mapped",
    "targeted-source-check-pending",
    "targeted-source-supported",
    "arithmetic-verified",
    "course-context-aligned",
    "correction-applied",
  ]);
  for (const row of l.rows) {
    const key = `${row.entryId}/${row.meaningIndex}`;
    assert.ok(!seen.has(key), "Duplicate meaning");
    seen.add(key);
    const e = entries.get(row.entryId);
    assert.ok(e, "Unknown entry");
    assert.ok(
      Number.isInteger(row.meaningIndex) &&
        row.meaningIndex >= 0 &&
        row.meaningIndex < e.meanings.length,
      "Meaning index",
    );
    const m = e.meanings[row.meaningIndex];
    assert.equal(e.status, "draft", "Entry publication gate");
    assert.equal(e.approved, false, "Entry approval gate");
    assert.equal(e.sourceReview, "pending", "Entry source gate");
    assert.equal(row.definition, m.definition, "Definition matches");
    assert.equal(row.entryDigest, digest(e), "Entry binding");
    assert.equal(row.meaningDigest, digest(m), "Meaning binding");
    assert.equal(row.course, e.course, "Course");
    assert.equal(row.name, e.name, "Name");
    assert.equal(row.href, e.href, "Anchor compatibility");
    assert.deepEqual(
      row.lessonIds,
      e.lessonLinks.map((x) => x.lessonId),
      "Lesson context",
    );
    assert.ok(statuses.has(row.status), "Review disposition");
    assert.equal(row.publicationEligible, false, "No publication approval");
    assert.equal(row.fullMeaningReview, "pending", "Full review pending");
    assert.ok(row.requiredAction, "Actionable check");
    assert.ok(Array.isArray(row.sourceIds), "Source array");
    assert.equal(
      new Set(row.sourceIds).size,
      row.sourceIds.length,
      "Unique evidence",
    );
    for (const id of row.sourceIds)
      assert.ok(sources.has(id), "Unknown source ID");
    if (["core-evidence-mapped", "correction-applied"].includes(row.status))
      assert.ok(row.sourceIds.length > 0, "Evidence missing");
    counts[row.status] = (counts[row.status] || 0) + 1;
  }
  assert.deepEqual(l.counts, counts, "Disposition summary");
  verifyArithmetic(c, arithmetic);
  verifyTargetedSources1(c, targetedSources1);
  verifyTargetedSources2(c, targetedSources2);
  const batches = [
    [targetedSources1, "docs/milestone-17-targeted-sources-1.json"],
    [targetedSources2, "docs/milestone-17-targeted-sources-2.json"],
  ];
  const covered = new Set();
  for (const [batch, evidencePath] of batches) {
    for (const x of batch.checks) {
      const key = `${x.entryId}/${x.meaningIndex}`;
      assert.ok(!covered.has(key), "Non-overlapping targeted batches");
      covered.add(key);
      const row = l.rows.find(
        (r) => r.entryId === x.entryId && r.meaningIndex === x.meaningIndex,
      );
      assert.equal(row.status, "targeted-source-supported");
      assert.equal(row.targetedSourceEvidence, evidencePath);
      for (const id of x.sourceIds) assert.ok(row.sourceIds.includes(id));
    }
    for (const source of batch.sources)
      assert.deepEqual(
        l.sources.find((v) => v.id === source.id),
        source,
        "Targeted evidence source binding",
      );
  }
  assert.equal(covered.size, 30);
  assert.equal(
    l.rows.filter((r) => r.status === "targeted-source-supported").length,
    covered.size,
    "Exact cumulative targeted coverage",
  );
  verifyCourseContext(c, courseContext, contextEvidence, catalogueRoot);
  assert.equal(
    l.rows.filter((r) => r.status === "course-context-aligned").length,
    58,
    "Context ledger coverage",
  );
  for (const x of courseContext.checks) {
    const row = l.rows.find(
      (r) => r.entryId === x.entryId && r.meaningIndex === x.meaningIndex,
    );
    assert.equal(row.status, "course-context-aligned");
    assert.equal(
      row.courseContextEvidence,
      "docs/milestone-17-course-context-verification.json",
    );
  }
  assert.equal(
    l.rows.filter((r) => r.status === "arithmetic-verified").length,
    20,
    "Arithmetic ledger coverage",
  );
  for (const x of arithmetic.checks) {
    const row = l.rows.find(
      (r) => r.entryId === x.entryId && r.meaningIndex === x.meaningIndex,
    );
    assert.equal(row.status, "arithmetic-verified");
    assert.equal(
      row.arithmeticEvidence,
      "docs/milestone-17-arithmetic-verification.json",
    );
  }
  assert.equal(p.corrections.length, 5, "Five approved corrections");
  assert.deepEqual(p.approval, {
    date: "2026-10-07",
    scope: "five-definition-corrections-only",
    publicationApproved: false,
    allSourcesVerified: false,
  });
  assert.equal(
    digest(p.corrections),
    "8caa8888c0f031245d2b1445f2884bbcf6100d9cd07c9cf3aa099c6923342666",
    "Exact approved correction record",
  );
  const reverse = structuredClone(c);
  for (const x of p.corrections) {
    const entry = reverse.entries.find((e) => e.id === x.entryId);
    assert.ok(entry && entry.meanings[x.meaningIndex], "Reversal target");
    entry.meanings[x.meaningIndex].definition = x.before;
  }
  assert.equal(
    digest(reverse),
    p.originalCatalogueDigest,
    "Only approved corrections changed the catalogue",
  );
  const corrected = new Set();
  for (const x of p.corrections) {
    const key = `${x.entryId}/${x.meaningIndex}`;
    assert.ok(!corrected.has(key), "Duplicate correction");
    corrected.add(key);
    const e = entries.get(x.entryId);
    assert.ok(e && e.meanings[x.meaningIndex], "Correction target");
    assert.equal(x.field, "definition", "Scoped correction");
    assert.equal(
      x.after,
      e.meanings[x.meaningIndex].definition,
      "Approved correction applied",
    );
    assert.ok(
      x.after && x.after !== x.before && x.reason,
      "Reviewable replacement",
    );
    assert.equal(x.approved, true, "Correction approval");
    assert.equal(x.status, "approved-applied", "Applied correction status");
    assert.ok(x.sourceIds.length > 0, "Correction evidence");
    for (const id of x.sourceIds)
      assert.ok(sources.has(id), "Correction source");
    const row = l.rows.find(
      (r) => r.entryId === x.entryId && r.meaningIndex === x.meaningIndex,
    );
    assert.equal(row.status, "correction-applied", "Correction in ledger");
  }
  assert.equal(
    l.rows.filter((r) => r.status === "correction-applied").length,
    p.corrections.length,
    "Correction coverage",
  );
  assert.deepEqual(
    l.gates.map((g) => g.id),
    [
      "source-completion",
      "corrections",
      "content-adapter",
      "approved-content-rendering",
      "compatibility-browser",
      "search-roadmap",
      "release-approval",
    ],
    "Release gates",
  );
  for (const g of l.gates)
    assert.ok(
      (g.id === "corrections"
        ? g.status === "complete"
        : ["blocked", "not-tested"].includes(g.status)) && g.evidence,
      "Release gates reflect applied wording approval only",
    );
}
verify(catalogue, ledger, proposals);
verifySourceClosure(currentCatalogue, currentLedger, currentText);
const closureFixtures = runSourceClosureNegativeChecks(
  currentCatalogue,
  currentLedger,
  currentText,
);
const fixtures = [
  ["missing meaning", (_c, l) => l.rows.pop()],
  [
    "duplicate meaning",
    (_c, l) => {
      l.rows[1] = structuredClone(l.rows[0]);
    },
  ],
  [
    "changed definition",
    (_c, l) => {
      l.rows[0].definition += " changed";
    },
  ],
  [
    "missing evidence",
    (_c, l) => {
      l.rows.find((r) => r.status === "core-evidence-mapped").sourceIds = [];
    },
  ],
  [
    "unknown evidence",
    (_c, l) => {
      l.rows[0].sourceIds = ["unknown"];
    },
  ],
  [
    "premature release",
    (_c, l) => {
      l.releaseReady = true;
    },
  ],
  [
    "wrong correction text",
    (_c, _l, p) => {
      p.corrections[0].before += " changed";
    },
  ],
  [
    "invalid correction",
    (_c, _l, p) => {
      p.corrections[0].meaningIndex = 99;
    },
  ],
  [
    "gate opened",
    (c) => {
      c.approved = true;
    },
  ],
  [
    "scope missing",
    (_c, l) => {
      l.sources[0].supportedScope = "";
    },
  ],
  [
    "correction approval withdrawn",
    (_c, _l, p) => {
      p.approved = false;
    },
  ],
  [
    "unapproved replacement",
    (_c, _l, p) => {
      p.corrections[0].after += " changed";
    },
  ],
  [
    "release gate omitted",
    (_c, l) => {
      l.gates.pop();
    },
  ],
];
for (const [name, mutate] of fixtures) {
  const c = structuredClone(catalogue),
    l = structuredClone(ledger),
    p = structuredClone(proposals);
  mutate(c, l, p);
  assert.throws(
    () => verify(c, l, p),
    undefined,
    `Negative fixture did not fail: ${name}`,
  );
}
console.log(
  `M17 source/readiness record integrity passed: ${catalogue.entries.length} entries, ${ledger.rows.length} meanings, ${currentLedger.sources.length} scoped source records; historical audit and current closure validated.`,
);
console.log(JSON.stringify(currentLedger.counts));
console.log(
  `${closureFixtures} current closure negative fixtures passed through the existing CI readiness command.`,
);
console.log(
  `${fixtures.length} negative fixtures passed. Historical five-correction audit preserved; 18 further corrections applied and all 380 scoped reviews recorded. Publication gates remain closed.`,
);
console.log(
  "PUBLICATION: NOT READY. Source review is complete with documented limits; expanded integration, browser checks and release approval remain gated.",
);
if (process.argv.includes("--require-release-ready")) {
  console.error(
    "Release check refused: expanded content integration, browser checks and publication approval are still outstanding.",
  );
  process.exitCode = 1;
}
