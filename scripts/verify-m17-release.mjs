import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const rootIndex = process.argv.indexOf("--repository-root");
const root =
  rootIndex >= 0
    ? path.resolve(process.argv[rootIndex + 1])
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) =>
  JSON.parse(
    fs.readFileSync(path.join(root, p), "utf8").replace(/^\uFEFF/, ""),
  );
const { closureDigest } = await import(
  pathToFileURL(path.join(root, "scripts/verify-m17-source-closure.mjs")).href
);
const recordIndex = process.argv.indexOf("--release-status");
const release =
  recordIndex >= 0
    ? JSON.parse(
        fs
          .readFileSync(process.argv[recordIndex + 1], "utf8")
          .replace(/^\uFEFF/, ""),
      )
    : read("apps/pipstart/src/content/glossary-release-status.json");
const catalogue = read(
    "apps/pipstart/src/content/glossary-catalogue.draft.json",
  ),
  review = read("apps/pipstart/src/content/glossary-review-status.json"),
  applied = read("docs/milestone-17-source-closure.applied.json");
function verify(r) {
  assert.deepEqual(r, {
    schemaVersion: 1,
    scope: "approved-public-release",
    publicationApproved: true,
    personalReviewApproved: true,
    approvalDate: "2026-10-08",
    entryCount: 378,
    meaningCount: 380,
    catalogueDigest: closureDigest(catalogue),
  });
  assert.equal(r.catalogueDigest, review.catalogueDigest);
  assert.equal(r.catalogueDigest, applied.afterCatalogueDigest);
  assert.equal(review.wordingApproved, true);
  assert.equal(review.sourceReviewCompleteWithScope, true);
  assert.equal(applied.approved, true);
  assert.equal(applied.applied, true);
  assert.equal(applied.unresolvedWordingCorrections, 0);
}
verify(release);
for (const change of [
  { personalReviewApproved: false },
  { publicationApproved: false },
  { catalogueDigest: "0".repeat(64) },
  { entryCount: 377 },
  { meaningCount: 378 },
  { scope: "local-review-only" },
])
  assert.throws(() => verify({ ...release, ...change }));
console.log(
  "M17 public release record passed: personal approval, exact 378 entries / 380 meanings, source-closure digest and six rejection fixtures verified. Production browser and CI checks remain separate gates.",
);
