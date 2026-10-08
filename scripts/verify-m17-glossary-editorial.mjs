import { restoreSourceReviewBaseline } from "./verify-m17-source-closure.mjs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) =>
  JSON.parse(
    readFileSync(resolve(repositoryRoot, relative), "utf8").replace(
      /^\uFEFF/,
      "",
    ),
  );

export function verifyEditorialCatalogue(
  catalogue,
  baseline,
  changes,
  corrections,
) {
  assert.equal(
    baseline.entries.length,
    362,
    "Original catalogue must retain all 362 entries",
  );
  assert.equal(baseline.checkpoint, "d1f8331be06b50c6bdf5f161a2699d1e3924232e");
  assert.equal(changes.document, "PipStart-M17-Glossary-Editorial-Review");
  assert.deepEqual(changes.approval, {
    date: "2026-10-07",
    wordingApproved: true,
    publicationApproved: false,
    allSourcesVerified: false,
  });
  assert.equal(changes.definitions.length, 33);
  assert.equal(changes.examples.length, 121);
  assert.equal(changes.notes.length, 29);
  assert.equal(changes.categories.length, 13);
  assert.equal(
    changes.aliases.reduce((count, row) => count + row.values.length, 0),
    11,
  );
  assert.equal(
    changes.lessonLinks.reduce((count, row) => count + row.links.length, 0),
    10,
  );
  assert.equal(changes.relatedLinks.length, 38);
  assert.equal(changes.newEntries.length, 16);
  assert.equal(changes.sources.length, 32);

  // Reconstruct only the owner-approved field changes. A full-object comparison
  // catches accidental edits to retained meanings, provenance, gates and links.
  const expected = structuredClone(baseline);
  const entries = new Map(expected.entries.map((entry) => [entry.id, entry]));
  const requireEntry = (id) => {
    assert(entries.has(id), `Unknown reviewed entry ${id}`);
    return entries.get(id);
  };
  for (const row of changes.definitions) {
    const meaning = requireEntry(row.id).meanings[0];
    assert.equal(
      meaning.definition,
      row.before,
      `Original definition mismatch for ${row.id}`,
    );
    meaning.definition = row.after;
  }
  for (const [rows, field] of [
    [changes.examples, "example"],
    [changes.notes, "confusionNote"],
  ]) {
    for (const row of rows) {
      const meaning = requireEntry(row.id).meanings[0];
      assert.equal(
        meaning[field] ?? null,
        row.before,
        `Original ${field} mismatch for ${row.id}`,
      );
      meaning[field] = row.after;
    }
  }
  for (const row of changes.categories) {
    const entry = requireEntry(row.id);
    assert.equal(entry.category, row.before);
    entry.category = row.after;
  }
  for (const row of changes.aliases)
    requireEntry(row.id).aliases.push(...row.values);
  for (const row of changes.lessonLinks)
    requireEntry(row.id).lessonLinks.push(...row.links);
  for (const row of changes.relatedLinks)
    requireEntry(row.id).relatedEntries.push(row.related);
  for (const row of changes.newEntries) {
    assert(
      !entries.has(row.entry.id),
      `New entry replaces an existing identity ${row.entry.id}`,
    );
    entries.set(row.entry.id, row.entry);
    expected.entries.push(row.entry);
  }
  expected.editorialReview = {
    ...changes.approval,
    document: changes.document,
    scope: "wording-examples-and-discovery-metadata",
    changeRecord: "docs/milestone-17-glossary-editorial-changes.json",
  };
  expected.editorialSources = changes.sources;
  assert.equal(corrections.schemaVersion, 1);
  assert.equal(corrections.approved, true);
  assert.equal(corrections.applied, true);
  assert.equal(
    createHash("sha256")
      .update(JSON.stringify(corrections.corrections))
      .digest("hex"),
    "5382b3f9cd641711d39d5355a76b5e38e3bc1492f1e41026c22e1a80b85133d7",
    "Exact approved correction set",
  );
  assert.deepEqual(corrections.approval, {
    date: "2026-10-07",
    scope: "five-definition-corrections-only",
    publicationApproved: false,
    allSourcesVerified: false,
  });
  assert.deepEqual(
    corrections.corrections.map((row) => row.entryId),
    [
      "crypto:active-addresses",
      "crypto:rehypothecation",
      "crypto:broker-crypto",
      "crypto:audit-scope",
      "crypto:watch-only-wallet",
    ],
  );
  for (const row of corrections.corrections) {
    assert.equal(row.meaningIndex, 0);
    assert.equal(row.field, "definition");
    assert.equal(row.approved, true);
    assert.equal(row.status, "approved-applied");
    const meaning = requireEntry(row.entryId).meanings[0];
    assert.equal(
      meaning.definition,
      row.before,
      "Original approved wording mismatch",
    );
    meaning.definition = row.after;
  }
  assert.deepEqual(
    catalogue,
    expected,
    "Catalogue differs from the approved editorial changes",
  );

  assert.equal(catalogue.status, "draft", "Catalogue must remain private");
  assert.equal(
    catalogue.approved,
    false,
    "No catalogue release approval in this patch",
  );
  assert.deepEqual(
    catalogue.preservationBaseline,
    baseline.preservationBaseline,
  );
  assert.equal(catalogue.preservationBaseline.length, 89);
  assert.equal(catalogue.entries.length, 378);
  assert.equal(
    catalogue.entries.filter((entry) => entry.course === "forex").length,
    242,
  );
  assert.equal(
    catalogue.entries.filter((entry) => entry.course === "crypto").length,
    136,
  );
  assert.equal(
    catalogue.entries.reduce(
      (count, entry) => count + entry.meanings.length,
      0,
    ),
    380,
  );
  assert.equal(new Set(catalogue.entries.map((entry) => entry.id)).size, 378);

  const lessonMap = new Map(
    catalogue.preservationBaseline.map((lesson) => [lesson.id, lesson]),
  );
  const linkedLessons = new Set();
  const sourceCodes = new Set(changes.sources.map((source) => source.code));
  assert.equal(sourceCodes.size, 32);
  for (const source of changes.sources) {
    assert(/^S\d{2}$/.test(source.code));
    assert(source.title.trim().length > 0);
    assert.equal(new URL(source.url).protocol, "https:");
  }
  for (const row of changes.definitions) {
    assert(/^D\d{2}$/.test(row.reviewCode));
    for (const code of row.sourceCodes) assert(sourceCodes.has(code));
  }
  for (const entry of catalogue.entries) {
    assert.equal(entry.id, `${entry.course}:${entry.slug}`);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug));
    assert.equal(
      entry.href,
      `${entry.course === "forex" ? "/glossary#" : "/glossary/crypto#"}${entry.slug}`,
    );
    assert.equal(entry.status, "draft");
    assert.equal(entry.approved, false);
    assert.equal(entry.sourceReview, "pending");
    assert(catalogue.categories.includes(entry.category));
    assert(entry.name.trim().length > 0);
    assert(entry.meanings.length > 0);
    for (const meaning of entry.meanings)
      assert(meaning.definition.trim().length > 0);
    if (entry.course === "crypto")
      assert(entry.meanings[0].example.trim().length > 0);
    assert.equal(
      new Set(entry.aliases.map((alias) => alias.value.toLowerCase())).size,
      entry.aliases.length,
    );
    assert.equal(
      new Set(entry.lessonLinks.map((link) => link.lessonId)).size,
      entry.lessonLinks.length,
    );
    for (const link of entry.lessonLinks) {
      const lesson = lessonMap.get(link.lessonId);
      assert(lesson, `Unregistered lesson ${link.lessonId}`);
      assert.equal(lesson.path, entry.course);
      assert.equal(
        lesson.href,
        link.href,
        `Changed lesson route ${link.lessonId}`,
      );
      linkedLessons.add(link.lessonId);
    }
    assert.equal(
      new Set(entry.relatedEntries.map((related) => related.id)).size,
      entry.relatedEntries.length,
    );
    for (const related of entry.relatedEntries) {
      assert(entries.has(related.id) && related.id !== entry.id);
      assert(
        [
          "related-concepts-not-synonyms",
          "terminology-overlap-not-merged",
          "cross-course-comparison",
        ].includes(related.kind),
      );
    }
    for (const code of entry.provenance.referenceCodes ?? [])
      assert(sourceCodes.has(code));
  }
  assert.equal(linkedLessons.size, 89);
  for (const slug of ["slashing", "wash-trading"]) {
    const oldEntry = baseline.entries.find(
      (entry) => entry.id === `crypto:${slug}`,
    );
    const newEntry = catalogue.entries.find(
      (entry) => entry.id === oldEntry.id,
    );
    assert.equal(newEntry.meanings.length, 2);
    assert.deepEqual(
      newEntry.meanings.map((meaning) => meaning.definition),
      oldEntry.meanings.map((meaning) => meaning.definition),
    );
    assert.deepEqual(
      newEntry.meanings.map((meaning) => meaning.lessons),
      oldEntry.meanings.map((meaning) => meaning.lessons),
    );
  }
  return {
    entries: 378,
    retainedIdentities: 362,
    newEntries: 16,
    meanings: 380,
    linkedLessons: 89,
  };
}

function runNegativeChecks(catalogue, baseline, changes, corrections) {
  const mutations = [
    [
      "entry publication",
      (value) => {
        value.entries[0].status = "published";
      },
    ],
    [
      "source approval",
      (value) => {
        value.entries[0].sourceReview = "verified";
      },
    ],
    [
      "catalogue release",
      (value) => {
        value.approved = true;
      },
    ],
    [
      "retained identity",
      (value) => {
        value.entries[0].id = "forex:changed";
      },
    ],
    [
      "lesson route",
      (value) => {
        value.entries[0].lessonLinks[0].href = "/missing";
      },
    ],
    [
      "reading key",
      (value) => {
        value.preservationBaseline[0].readingKey = "changed";
      },
    ],
    [
      "second meaning",
      (value) => {
        value.entries
          .find((entry) => entry.id === "crypto:slashing")
          .meanings.pop();
      },
    ],
    [
      "unapproved wording",
      (value) => {
        value.entries[0].meanings[0].definition = "Unapproved replacement";
      },
    ],
    [
      "new example removal",
      (value) => {
        delete value.entries.find((entry) => entry.id === "crypto:ether")
          .meanings[0].example;
      },
    ],
  ];
  for (const [label, mutate] of mutations) {
    const fixture = structuredClone(catalogue);
    mutate(fixture);
    assert.throws(
      () => verifyEditorialCatalogue(fixture, baseline, changes, corrections),
      undefined,
      `Verification missed ${label}`,
    );
  }
  console.log(
    `Negative checks passed: ${mutations.length} unintended changes rejected.`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const catalogue = restoreSourceReviewBaseline(
      readJson("apps/pipstart/src/content/glossary-catalogue.draft.json"),
    );
    const baseline = readJson(
      "docs/milestone-17-glossary-editorial-baseline.json",
    );
    const changes = readJson(
      "docs/milestone-17-glossary-editorial-changes.json",
    );
    const corrections = readJson(
      "docs/milestone-17-source-corrections.proposed.json",
    );
    const result = verifyEditorialCatalogue(
      catalogue,
      baseline,
      changes,
      corrections,
    );
    console.log("M17 approved glossary editorial verification passed.");
    console.log(JSON.stringify(result));
    runNegativeChecks(catalogue, baseline, changes, corrections);
    console.log(
      "Publication gates remain closed; lesson source files and public page code are outside this patch.",
    );
  } catch (error) {
    console.error("M17 glossary editorial verification failed:", error.message);
    process.exitCode = 1;
  }
}
