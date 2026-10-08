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
export function verifyCourseContext(catalogue, record, evidence, sourceRoot) {
  assert.equal(record.schemaVersion, 1);
  assert.equal(evidence.schemaVersion, 1);
  assert.equal(
    digest(record),
    "de5e800a9ddfda7f3cb946c36b1d3fd98228b0f734ffe3425b0a2bdc70415e83",
    "Exact reviewed context record",
  );
  assert.equal(
    record.evidenceDigest,
    digest(evidence),
    "Reviewed lesson snapshot",
  );
  assert.equal(record.catalogueDigest, digest(catalogue), "Catalogue binding");
  assert.equal(record.scope, "definition-to-approved-lesson-context-only");
  assert.equal(record.publicationApproved, false);
  assert.equal(record.fullMeaningReview, "pending");
  assert.equal(catalogue.approved, false);
  assert.equal(catalogue.status, "draft");
  assert.equal(record.checks.length, 58);
  const seen = new Set();
  let excerpts = 0;
  for (const x of record.checks) {
    const key = x.entryId + "/" + x.meaningIndex;
    assert.ok(!seen.has(key));
    seen.add(key);
    const entry = catalogue.entries.find((e) => e.id === x.entryId);
    assert.ok(entry);
    const meaning = entry.meanings[x.meaningIndex];
    assert.ok(meaning);
    assert.equal(x.definition, meaning.definition);
    assert.equal(x.meaningDigest, digest(meaning));
    assert.deepEqual(
      x.lessonIds,
      entry.lessonLinks.map((l) => l.lessonId),
    );
    assert.equal(x.result, "definition-context-aligned");
    assert.ok(x.reviewNotes && x.evidence.length);
    for (const p of x.evidence) {
      assert.equal(p.lessonKey, entry.course + ":" + p.lessonId);
      assert.ok(
        entry.lessonLinks.some(
          (l) => l.lessonId === p.lessonId && l.href === p.href,
        ),
        "Evidence linked to entry",
      );
      assert.equal(
        evidence.lessons[p.lessonKey]?.[p.blockPointer],
        p.excerpt,
        "Exact block excerpt",
      );
      assert.equal(p.excerptDigest, digest(p.excerpt));
      excerpts++;
    }
  }
  assert.ok(evidence.sourceFiles.length);
  for (const s of evidence.sourceFiles) {
    assert.ok(
      /^apps\/pipstart\/src\/content\/lessons\/(forex|crypto)\/[a-z0-9-]+\.(mdx|ts)$/.test(
        s.path,
      ),
      "Scoped lesson input",
    );
    const raw = fs
      .readFileSync(path.join(sourceRoot, s.path), "utf8")
      .replace(/^\uFEFF/, "")
      .replace(/\r\n?/g, "\n");
    assert.equal(
      createHash("sha256").update(raw).digest("hex"),
      s.textHash,
      "Approved lesson input differs: " + s.path,
    );
  }
  return excerpts;
}
const scriptRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const i = process.argv.indexOf("--catalogue-root");
  if (i >= 0 && !process.argv[i + 1])
    throw new Error("Catalogue root argument missing");
  const sourceRoot = i >= 0 ? path.resolve(process.argv[i + 1]) : scriptRoot;
  const c = restoreSourceReviewBaseline(
      read(
        path.join(
          sourceRoot,
          "apps/pipstart/src/content/glossary-catalogue.draft.json",
        ),
      ),
    ),
    r = read(
      path.join(
        scriptRoot,
        "docs/milestone-17-course-context-verification.json",
      ),
    ),
    e = read(
      path.join(scriptRoot, "docs/milestone-17-course-context-evidence.json"),
    );
  const n = verifyCourseContext(c, r, e, sourceRoot);
  const fixtures = [
    [
      "changed definition",
      (c) =>
        (c.entries.find(
          (x) => x.id === r.checks[0].entryId,
        ).meanings[0].definition += " changed"),
    ],
    ["missing context", (_c, r) => r.checks.pop()],
    [
      "duplicate context",
      (_c, r) => (r.checks[1] = structuredClone(r.checks[0])),
    ],
    ["wrong lesson", (_c, r) => (r.checks[0].evidence[0].lessonId = "other")],
    [
      "wrong block",
      (_c, r) => (r.checks[0].evidence[0].blockPointer = "/999/children"),
    ],
    [
      "changed excerpt",
      (_c, r) => (r.checks[0].evidence[0].excerpt += " changed"),
    ],
    [
      "changed snapshot",
      (_c, _r, e) =>
        (e.lessons[r.checks[0].evidence[0].lessonKey][
          r.checks[0].evidence[0].blockPointer
        ] += " changed"),
    ],
    ["missing source hash", (_c, _r, e) => e.sourceFiles.pop()],
    ["publication opened", (c) => (c.approved = true)],
    ["scope broadened", (_c, r) => (r.scope = "all-sources-verified")],
  ];
  for (const [name, mutate] of fixtures) {
    const cc = structuredClone(c),
      rr = structuredClone(r),
      ee = structuredClone(e);
    mutate(cc, rr, ee);
    assert.throws(
      () => verifyCourseContext(cc, rr, ee, sourceRoot),
      undefined,
      name,
    );
  }
  console.log(
    `58 definition-context checks passed; ${n} exact lesson excerpts. ${fixtures.length} negative fixtures passed. Historical context snapshot retained; current whole-meaning closure is checked separately. Publication remains blocked.`,
  );
}
