import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getM20BrowserMetadata,
  m20Projects,
  m20Cases,
  m20ExpectedSkip,
  m20InstanceCount,
  m20PassCount,
} from "../apps/pipstart/scripts/m20-browser-metadata.mjs";

function verify(report, expected, buildModified) {
  assert(expected.buildId, "A production build is required.");
  assert.deepEqual(
    report.config?.metadata?.m20,
    expected,
    "Report commit, build, source, runtime or CI run does not match.",
  );
  assert.deepEqual(
    report.config.projects.map((p) => p.name).sort(),
    [...m20Projects].sort(),
    "Missing or unexpected projects.",
  );
  for (const project of report.config.projects) {
    assert.equal(project.retries, 0, "Retries must not hide failures.");
    assert.equal(project.repeatEach, 1, "Unexpected repeated suite.");
    assert.deepEqual(project.testMatch, ["milestone-20-calendar.spec.ts"]);
  }
  assert.equal(
    report.config.forbidOnly,
    true,
    "Focused-only tests are forbidden.",
  );
  assert.deepEqual(report.errors, [], "Browser runner errors exist.");
  assert.equal(
    report.stats?.expected,
    m20PassCount,
    "Unexpected passing instance count.",
  );
  assert.equal(
    report.stats?.skipped,
    6,
    "Expected only six layout-specific skips.",
  );
  assert.equal(report.stats?.unexpected, 0, "Browser failures exist.");
  assert.equal(report.stats?.flaky, 0, "Flaky results are not accepted.");
  const started = Date.parse(report.stats.startTime);
  assert(
    Number.isFinite(started) &&
      started >= buildModified - 1000 &&
      started <= Date.now() + 60_000,
    "Report predates the production build or has an invalid timestamp.",
  );
  const seen = new Set();
  function walk(suite) {
    for (const spec of suite.specs ?? []) {
      assert.equal(
        spec.file?.replaceAll("\\", "/").split("/").pop(),
        "milestone-20-calendar.spec.ts",
        "Unexpected test source.",
      );
      assert(m20Cases.includes(spec.title), "Unknown or renamed test case.");
      assert.equal(spec.ok, true, "A specification did not pass.");
      for (const test of spec.tests ?? []) {
        assert(m20Projects.includes(test.projectName), "Unexpected project.");
        const key = test.projectName + "\n" + spec.title;
        assert(!seen.has(key), "Duplicate test identity.");
        seen.add(key);
        const skipped = m20ExpectedSkip(test.projectName, spec.title);
        assert.equal(
          test.expectedStatus,
          skipped ? "skipped" : "passed",
          "Unexpected skip or expected-failure annotation.",
        );
        assert.equal(test.status, skipped ? "skipped" : "expected");
        assert.equal(test.results?.length, 1, "Missing or retried result.");
        const result = test.results[0];
        assert.equal(result.status, skipped ? "skipped" : "passed");
        assert.equal(result.retry, 0, "Retried result.");
        assert.deepEqual(result.errors, [], "Result contains errors.");
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  }
  for (const suite of report.suites ?? []) walk(suite);
  assert.equal(seen.size, m20InstanceCount, "Missing test identities.");
  for (const project of m20Projects)
    for (const title of m20Cases)
      assert(seen.has(project + "\n" + title), "Incomplete project coverage.");
}

function selfTest() {
  const now = Date.now();
  const expected = {
    buildId: "fixture-build",
    commit: "fixture-commit",
    sourceHash: "fixture-source",
    scope: "fixture",
  };
  const valid = {
    config: {
      metadata: { m20: expected },
      forbidOnly: true,
      projects: m20Projects.map((name) => ({
        name,
        retries: 0,
        repeatEach: 1,
        testMatch: ["milestone-20-calendar.spec.ts"],
      })),
    },
    errors: [],
    stats: {
      expected: m20PassCount,
      skipped: 6,
      unexpected: 0,
      flaky: 0,
      startTime: new Date(now).toISOString(),
    },
    suites: [
      {
        specs: m20Cases.map((title) => ({
          title,
          file: "milestone-20-calendar.spec.ts",
          ok: true,
          tests: m20Projects.map((projectName) => {
            const skipped = m20ExpectedSkip(projectName, title);
            return {
              projectName,
              expectedStatus: skipped ? "skipped" : "passed",
              status: skipped ? "skipped" : "expected",
              results: [
                {
                  status: skipped ? "skipped" : "passed",
                  retry: 0,
                  errors: [],
                },
              ],
            };
          }),
        })),
      },
    ],
  };
  verify(valid, expected, now);
  const changes = [
    (r) => {
      r.config.metadata.m20.commit = "old";
    },
    (r) => {
      r.config.metadata.m20.buildId = "old";
    },
    (r) => {
      r.config.metadata.m20.sourceHash = "old";
    },
    (r) => {
      r.config.projects.pop();
    },
    (r) => {
      r.config.projects[0].retries = 1;
    },
    (r) => {
      r.config.projects[0].repeatEach = 2;
    },
    (r) => {
      r.config.projects[0].testMatch = ["other.spec.ts"];
    },
    (r) => {
      r.config.forbidOnly = false;
    },
    (r) => {
      r.stats.expected = 44;
    },
    (r) => {
      r.stats.skipped = 7;
    },
    (r) => {
      r.stats.unexpected = 1;
    },
    (r) => {
      r.stats.flaky = 1;
    },
    (r) => {
      r.stats.startTime = new Date(now - 60_000).toISOString();
    },
    (r) => {
      r.stats.startTime = new Date(now + 120_000).toISOString();
    },
    (r) => {
      r.errors = [{ message: "runner error" }];
    },
    (r) => {
      r.suites[0].specs.pop();
    },
    (r) => {
      r.suites[0].specs.push(structuredClone(r.suites[0].specs[0]));
    },
    (r) => {
      r.suites[0].specs[0].file = "other.spec.ts";
    },
    (r) => {
      r.suites[0].specs[0].title = "renamed";
    },
    (r) => {
      r.suites[0].specs[0].ok = false;
    },
    (r) => {
      r.suites[0].specs[0].tests[0].projectName = "other";
    },
    (r) => {
      r.suites[0].specs[0].tests[0].expectedStatus = "skipped";
    },
    (r) => {
      r.suites[0].specs[0].tests[0].expectedStatus = "failed";
    },
    (r) => {
      r.suites[0].specs[0].tests[0].status = "unexpected";
    },
    (r) => {
      r.suites[0].specs[0].tests[0].results = [];
    },
    (r) => {
      r.suites[0].specs[0].tests[0].results.push({ status: "passed" });
    },
    (r) => {
      r.suites[0].specs[0].tests[0].results[0].status = "failed";
    },
    (r) => {
      r.suites[0].specs[0].tests[0].results[0].retry = 1;
    },
    (r) => {
      r.suites[0].specs[0].tests[0].results[0].errors = [{}];
    },
    (r) => {
      r.suites[0].specs[1].tests[0].expectedStatus = "passed";
    },
  ];
  for (const change of changes) {
    const changed = structuredClone(valid);
    change(changed);
    assert.throws(() => verify(changed, expected, now));
  }
  assert.throws(() => verify(valid, { ...expected, buildId: null }, now));
  console.log(
    `M20 verifier self-test passed: valid fixture and ${changes.length + 1} rejection fixtures. No browser or live provider checks are claimed.`,
  );
}

if (process.argv.includes("--self-test")) selfTest();
else {
  const appRoot = path.resolve(import.meta.dirname, "../apps/pipstart");
  const file = path.join(appRoot, "test-results/m20/results.json");
  assert(
    fs.existsSync(file),
    "M20 results missing. Run the production browser suite first.",
  );
  verify(
    JSON.parse(fs.readFileSync(file, "utf8")),
    getM20BrowserMetadata(appRoot),
    fs.statSync(path.join(appRoot, ".next/BUILD_ID")).mtimeMs,
  );
  console.log(
    `M20 browser gate passed: ${m20PassCount} passed and exactly six justified skips across three projects; commit/build/source/runtime binding verified. Live provider accuracy and real-device acceptance are separate.`,
  );
}
