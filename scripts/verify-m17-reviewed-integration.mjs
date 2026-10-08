import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootIndex = process.argv.indexOf("--repository-root");
if (rootIndex >= 0 && !process.argv[rootIndex + 1])
  throw new Error("Repository root missing");
const root =
  rootIndex >= 0
    ? path.resolve(process.argv[rootIndex + 1])
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { closureDigest } = await import(
  pathToFileURL(path.join(root, "scripts/verify-m17-source-closure.mjs")).href
);
const statusIndex = process.argv.indexOf("--review-status");
if (statusIndex >= 0 && !process.argv[statusIndex + 1])
  throw new Error("Review status path missing");
const statusPath =
  statusIndex >= 0
    ? path.resolve(process.argv[statusIndex + 1])
    : path.join(root, "apps/pipstart/src/content/glossary-review-status.json");
const read = (p) =>
  JSON.parse(
    fs.readFileSync(path.join(root, p), "utf8").replace(/^\uFEFF/, ""),
  );
const c = read("apps/pipstart/src/content/glossary-catalogue.draft.json"),
  a = read("docs/milestone-17-source-closure.applied.json"),
  r = JSON.parse(fs.readFileSync(statusPath, "utf8").replace(/^\uFEFF/, ""));
function verify(c, a, r) {
  assert.equal(a.approved, true);
  assert.equal(a.applied, true);
  assert.equal(a.publicationApproved, false);
  assert.equal(a.unresolvedWordingCorrections, 0);
  assert.equal(a.corrections.length, 18);
  assert.equal(a.afterCatalogueDigest, closureDigest(c));
  assert.deepEqual(r, {
    schemaVersion: 1,
    scope: "local-review-only",
    wordingApproved: true,
    sourceReviewCompleteWithScope: true,
    correctionsApplied: 18,
    unresolvedWordingCorrections: 0,
    entryCount: 378,
    meaningCount: 380,
    catalogueDigest: a.afterCatalogueDigest,
    publicationApproved: false,
  });
  assert.equal(c.status, "draft");
  assert.equal(c.approved, false);
  assert.equal(c.entries.length, 378);
  assert.equal(
    c.entries.reduce((n, e) => n + e.meanings.length, 0),
    380,
  );
  assert.ok(
    c.entries.every(
      (e) =>
        e.status === "draft" &&
        e.approved === false &&
        e.sourceReview === "pending",
    ),
  );
}
verify(c, a, r);
const fixtures = [
  ["missing approval", (x) => (x.r.wordingApproved = false)],
  ["wrong digest", (x) => (x.r.catalogueDigest = "0".repeat(64))],
  ["incomplete review", (x) => (x.r.sourceReviewCompleteWithScope = false)],
  ["wrong count", (x) => (x.r.meaningCount = 378)],
  ["unresolved wording", (x) => (x.r.unresolvedWordingCorrections = 1)],
  ["accidental publication", (x) => (x.c.approved = true)],
  ["incorrect public approval", (x) => (x.r.publicationApproved = true)],
];
for (const [label, mutate] of fixtures) {
  const x = {
    c: structuredClone(c),
    a: structuredClone(a),
    r: structuredClone(r),
  };
  mutate(x);
  assert.throws(() => verify(x.c, x.a, x.r), undefined, "Missed " + label);
}
console.log(
  "M17 reviewed integration record passed: 378 entries / 380 meanings bound to approved source closure. Seven negative fixtures passed. Local review is distinct from publication.",
);
