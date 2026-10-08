import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getM17BrowserMetadata,
  m17Projects,
  m17TestsPerProject,
  m17ReviewMode,
} from "../apps/pipstart/scripts/m17-browser-metadata.mjs";
function verify(report, expected, buildModified) {
  assert(
    expected.buildId && expected.releaseApproved && expected.archivePreserved,
    "Fresh build, approved release and preserved review archive required.",
  );
  assert.deepEqual(
    report.config?.metadata?.m17,
    expected,
    "Browser report is bound to another build, catalogue or source revision.",
  );
  assert.deepEqual(
    report.config.projects.map((project) => project.name).sort(),
    [...m17Projects].sort(),
    "Missing or unexpected browser projects.",
  );
  assert.deepEqual(report.errors, [], "Browser runner errors exist.");
  const total = m17Projects.length * m17TestsPerProject;
  assert.equal(
    report.stats?.expected,
    total,
    "Not all expected browser cases passed.",
  );
  for (const field of ["unexpected", "flaky", "skipped"])
    assert.equal(
      report.stats[field],
      0,
      "Browser cases are failed, flaky or skipped.",
    );
  const started = Date.parse(report.stats.startTime);
  assert(
    Number.isFinite(started) &&
      started >= buildModified - 1000 &&
      started <= Date.now() + 60_000,
    "Browser report predates the current production build or has an invalid timestamp.",
  );
  const counts = new Map(m17Projects.map((project) => [project, 0]));
  function walk(suite) {
    for (const spec of suite.specs ?? []) {
      assert(
        spec.file
          ?.replaceAll("\\", "/")
          .endsWith("milestone-17-glossary.spec.ts"),
        "Unexpected test source.",
      );
      assert(spec.ok === true, "A browser specification did not pass.");
      for (const test of spec.tests ?? []) {
        assert(counts.has(test.projectName), "Unexpected browser project.");
        assert.equal(test.status, "expected");
        assert.equal(test.expectedStatus, "passed");
        assert(
          test.results?.length === 1 && test.results[0].status === "passed",
          "Retried or missing browser results.",
        );
        counts.set(test.projectName, counts.get(test.projectName) + 1);
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  }
  for (const suite of report.suites ?? []) walk(suite);
  for (const [project, count] of counts)
    assert.equal(
      count,
      m17TestsPerProject,
      "Incomplete coverage for " + project,
    );
}
function selfTest() {
  const now = Date.now();
  const expected = {
    scope: "fixture",
    reviewMode: m17ReviewMode,
    buildId: "fixture-build",
    catalogueHash: "catalogue",
    sourceHash: "sources",
    releaseApproved: true,
    archivePreserved: true,
  };
  const valid = {
    config: {
      metadata: { m17: expected },
      projects: m17Projects.map((name) => ({ name })),
    },
    errors: [],
    stats: {
      expected: m17Projects.length * m17TestsPerProject,
      unexpected: 0,
      flaky: 0,
      skipped: 0,
      startTime: new Date(now).toISOString(),
    },
    suites: [
      {
        specs: Array.from({ length: m17TestsPerProject }, () => ({
          file: "e2e/milestone-17-glossary.spec.ts",
          ok: true,
          tests: m17Projects.map((projectName) => ({
            projectName,
            status: "expected",
            expectedStatus: "passed",
            results: [{ status: "passed" }],
          })),
        })),
      },
    ],
  };
  verify(valid, expected, now);
  const changes = [
    (r) => {
      r.config.metadata.m17.reviewMode = !m17ReviewMode;
    },
    (r) => {
      r.config.metadata.m17.buildId = "old-build";
    },
    (r) => {
      r.config.metadata.m17.sourceHash = "old-sources";
    },
    (r) => {
      r.config.projects.pop();
    },
    (r) => {
      r.stats.expected = 1;
    },
    (r) => {
      r.stats.flaky = 1;
    },
    (r) => {
      r.stats.skipped = 1;
    },
    (r) => {
      r.stats.startTime = new Date(now - 60_000).toISOString();
    },
    (r) => {
      r.errors = [{ message: "failure" }];
    },
    (r) => {
      r.suites[0].specs.pop();
    },
    (r) => {
      r.suites[0].specs[0].file = "other.spec.ts";
    },
    (r) => {
      r.suites[0].specs[0].tests[0].results[0].status = "failed";
    },
  ];
  for (const change of changes) {
    const changed = structuredClone(valid);
    change(changed);
    assert.throws(() => verify(changed, expected, now));
  }
  console.log(
    `M17 browser-report verifier self-test passed: valid fixture and ${changes.length} stale/partial/failed/mode-mismatch rejection fixtures. These fixtures do not run browser tests.`,
  );
}
if (process.argv.includes("--self-test")) selfTest();
else {
  const appRoot = path.resolve(import.meta.dirname, "../apps/pipstart");
  const file = path.join(
    appRoot,
    m17ReviewMode
      ? "test-results/m17-review/results.json"
      : "test-results/m17/results.json",
  );
  if (!fs.existsSync(file))
    throw new Error(
      "M17 browser results are missing. Run the production browser gate first.",
    );
  const expected = getM17BrowserMetadata(appRoot);
  verify(
    JSON.parse(fs.readFileSync(file, "utf8")),
    expected,
    fs.statSync(path.join(appRoot, ".next/BUILD_ID")).mtimeMs,
  );
  console.log(
    `M17 ${m17ReviewMode ? "review" : "public"} browser results passed: ${m17Projects.length * m17TestsPerProject} cases across desktop, mobile and small-mobile, including native fallback. The build/catalogue/source/mode binding matches. Approved public release and historical evidence preservation verified.`,
  );
}
