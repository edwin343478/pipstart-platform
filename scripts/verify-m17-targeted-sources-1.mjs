import { restoreSourceReviewBaseline } from "./verify-m17-source-closure.mjs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
const digest = (v) => createHash("sha256").update(canonical(v)).digest("hex");
const read = (p) =>
  JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
function calculate(x) {
  if (typeof x === "number") {
    assert.ok(Number.isFinite(x));
    return x;
  }
  assert.ok(x && Array.isArray(x.args) && x.args.length === 2);
  const [a, b] = x.args.map(calculate);
  if (x.op === "multiply") return a * b;
  if (x.op === "subtract") return a - b;
  if (x.op === "divide") {
    assert.notEqual(b, 0);
    return a / b;
  }
  throw new Error("Unsupported operation");
}
export function verifyTargetedSources1(c, r) {
  assert.equal(r.schemaVersion, 1);
  assert.equal(
    digest(r),
    "5e12190941656769c3b099542af123cf93f90f06653b74e45f4e9287f2d9498f",
    "Exact reviewed batch",
  );
  assert.equal(r.catalogueDigest, digest(c));
  assert.equal(c.status, "draft");
  assert.equal(c.approved, false);
  assert.equal(r.publicationApproved, false);
  assert.equal(r.scope, "18-existing-meanings-only");
  assert.equal(r.checks.length, 18);
  assert.deepEqual(r.correctionsRequired, []);
  const sources = new Map(r.sources.map((s) => [s.id, s]));
  assert.equal(sources.size, r.sources.length);
  const seen = new Set();
  let proofs = 0;
  for (const x of r.checks) {
    assert.ok(!seen.has(x.entryId));
    seen.add(x.entryId);
    const e = c.entries.find((e) => e.id === x.entryId);
    assert.ok(e);
    assert.equal(x.meaningIndex, 0);
    assert.deepEqual(x.meaning, e.meanings[0]);
    assert.equal(x.meaningDigest, digest(e.meanings[0]));
    assert.equal(x.result, "supported-with-stated-scope");
    assert.ok(x.definitionReview && x.exampleReview && x.confusionNoteReview);
    assert.ok(x.sourceIds.length);
    for (const id of x.sourceIds) {
      const s = sources.get(id);
      assert.ok(s && s.supportedScope && s.limitation && s.retrievalRef);
      assert.equal(new URL(s.url).protocol, "https:");
    }
    for (const p of x.proofs) {
      assert.ok(p.units);
      assert.ok(
        Math.abs(calculate(p.expression) - p.expected) < 1e-9,
        "Numerical example",
      );
      proofs++;
    }
  }
  assert.equal(proofs, 10);
  return proofs;
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const i = process.argv.indexOf("--catalogue-root");
  if (i >= 0 && !process.argv[i + 1]) throw new Error("Catalogue root missing");
  const cr = i >= 0 ? path.resolve(process.argv[i + 1]) : root;
  const c = restoreSourceReviewBaseline(
      read(
        path.join(
          cr,
          "apps/pipstart/src/content/glossary-catalogue.draft.json",
        ),
      ),
    ),
    r = read(path.join(root, "docs/milestone-17-targeted-sources-1.json"));
  const n = verifyTargetedSources1(c, r);
  const fixtures = [
    [
      "changed definition",
      (c) =>
        (c.entries.find(
          (e) => e.id === r.checks[0].entryId,
        ).meanings[0].definition += " changed"),
    ],
    [
      "changed example",
      (c) =>
        (c.entries.find(
          (e) => e.id === r.checks[0].entryId,
        ).meanings[0].example += " changed"),
    ],
    [
      "changed note",
      (c) =>
        (c.entries.find(
          (e) => e.id === r.checks[0].entryId,
        ).meanings[0].confusionNote += " changed"),
    ],
    ["missing check", (_c, r) => r.checks.pop()],
    [
      "duplicate check",
      (_c, r) => (r.checks[1] = structuredClone(r.checks[0])),
    ],
    ["unknown source", (_c, r) => (r.checks[0].sourceIds = ["unknown"])],
    ["scope removed", (_c, r) => (r.sources[0].supportedScope = "")],
    ["wrong proof", (_c, r) => (r.checks[0].proofs[0].expected = 999)],
    ["published", (c) => (c.approved = true)],
  ];
  for (const [name, mutate] of fixtures) {
    const cc = structuredClone(c),
      rr = structuredClone(r);
    mutate(cc, rr);
    assert.throws(() => verifyTargetedSources1(cc, rr), undefined, name);
  }
  console.log(
    `18 targeted source reviews passed; ${n} numerical proofs; ${fixtures.length} negative fixtures. Historical batch retained unchanged; current corrections are checked by the source-closure verifier. Publication remains blocked.`,
  );
}
