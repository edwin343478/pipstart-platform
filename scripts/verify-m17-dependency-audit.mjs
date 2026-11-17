import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const hashes = {
  "lib/parse.js":
    "f8de83fc9bb9e96331db0e055b664ac86bb56152b90040719f5b0397a31bfc3a",
  "lib/compile.js":
    "154d1f35be4edeb200224377dbbdac76a103dbef6b48638b1789f31c3aa1e538",
  "lib/expand.js":
    "aceb1c4bacae437004b9a24f61fda1701580ba8b53f1fb4f64e82bc39f114dff",
  "lib/stringify.js":
    "009cc9699ce8bbcb9c0ec5302f2961ab2531f16a0040dfbd24aba710bdc7e64a",
};
const advisory = "GHSA-vfj7-8cjw-p6xm";
// M22 audit follow-up (17 November 2026): GHSA-fc5q-39xc-vjpf, picomatch <=4.0.7 ReDoS via single-branch repeated
// extglobs, has no published fix (npm lists ">=4.0.8", which does not exist yet). picomatch is reached only through
// development tooling whose glob patterns come from this repository's own configuration, never from users.
// Accepted only for the exact installed versions, dev-only, through vitest, the Next ESLint config or the MDX
// rollup plugin. Remove this entry when a fixed picomatch is adopted.
const picomatchAdvisory = "GHSA-fc5q-39xc-vjpf";
const picomatchVersions = new Set(["4.0.5", "2.3.2"]);
const picomatchPath =
  /^(apps__(pipstart|skillcima)|packages__(ui|validation))>(vitest|eslint-config-next|@mdx-js\/rollup)(>[@a-z0-9._/-]+)*>picomatch$/;
const hash = (value) => createHash("sha256").update(value).digest("hex");
export function verifyBraces(directory) {
  const req = createRequire(path.join(directory, "package.json"));
  assert.equal(req("./package.json").version, "3.0.3");
  for (const [file, expected] of Object.entries(hashes)) {
    assert.equal(
      hash(
        fs
          .readFileSync(path.join(directory, file), "utf8")
          .replace(/\r\n?/g, "\n"),
      ),
      expected,
      "Installed braces patch differs: " + file,
    );
  }
  const braces = req("./index.js");
  assert.deepEqual(braces.expand("src/{app,lib}/**/*.{ts,tsx}"), [
    "src/app/**/*.ts",
    "src/app/**/*.tsx",
    "src/lib/**/*.ts",
    "src/lib/**/*.tsx",
  ]);
  assert.deepEqual(braces.expand("{a,{b,c}}"), ["a", "b", "c"]);
  assert.deepEqual(braces.expand("{1..3}"), ["1", "2", "3"]);
  assert.equal(braces.stringify("a/{b,c}/d"), "a/{b,c}/d");
  for (const pattern of [
    "{".repeat(101) + "a,b" + "}".repeat(101),
    "(".repeat(101) + "x" + ")".repeat(101),
    "{(".repeat(51) + "x" + ")}".repeat(51),
    "{".repeat(4000) + "a,b" + "}".repeat(4000),
  ]) {
    for (const method of ["parse", "compile", "expand", "stringify"])
      assert.throws(
        () => braces[method](pattern),
        (e) =>
          e instanceof SyntaxError &&
          e.message.includes("PipStart braces nesting limit exceeded"),
      );
    assert.throws(() => braces(pattern), SyntaxError);
  }
  // Public AST APIs also need a depth bound, independent of the parser.
  const ast = () => {
    const root = { type: "root", nodes: [] };
    let current = root;
    for (let i = 0; i < 200; i++) {
      const child = { type: "paren", nodes: [], parent: current };
      current.nodes.push(child);
      current = child;
    }
    current.nodes.push({ type: "text", value: "x" });
    return root;
  };
  for (const method of ["compile", "expand", "stringify"])
    assert.throws(() => braces[method](ast()), SyntaxError);
  assert.doesNotThrow(() =>
    braces.compile("{".repeat(100) + "a,b" + "}".repeat(100)),
  );
  assert.doesNotThrow(() => braces.compile('"' + "{".repeat(500) + '"'));
  assert.doesNotThrow(() => braces.compile("\\{".repeat(500)));
  return directory;
}
export function verifyAudit(report) {
  assert(
    report &&
      !report.error &&
      report.advisories &&
      report.metadata?.vulnerabilities,
    "Incomplete/errored audit response.",
  );
  const rows = Object.values(report.advisories);
  for (const row of rows) {
    if (row.github_advisory_id === picomatchAdvisory) {
      assert.equal(row.module_name, "picomatch");
      assert(row.findings?.length > 0, "Missing dependency paths.");
      for (const finding of row.findings) {
        assert(
          picomatchVersions.has(finding.version),
          "Unexpected picomatch version: " + finding.version,
        );
        assert.equal(
          finding.dev,
          true,
          "picomatch appeared in production dependencies.",
        );
        assert(finding.paths?.length > 0);
        for (const chain of finding.paths)
          assert(
            picomatchPath.test(chain) && !/>next>/.test(chain),
            "Unexpected picomatch dependency path: " + chain,
          );
      }
      continue;
    }
    assert.equal(
      row.github_advisory_id,
      advisory,
      "Unresolved additional advisory: " + row.github_advisory_id,
    );
    assert.equal(row.module_name, "braces");
    assert(row.findings?.length > 0, "Missing dependency paths.");
    for (const finding of row.findings) {
      assert.equal(finding.version, "3.0.3");
      assert.equal(
        finding.dev,
        true,
        "Braces appeared in production dependencies.",
      );
      assert(finding.paths?.length > 0);
      for (const chain of finding.paths)
        assert(
          /^apps__(pipstart|skillcima)>eslint-config-next>@next\/eslint-plugin-next>fast-glob>micromatch>braces$/.test(
            chain,
          ),
          "Unexpected braces dependency path: " + chain,
        );
    }
  }
  const reported = Object.values(report.metadata.vulnerabilities).reduce(
    (n, v) => n + v,
    0,
  );
  assert.equal(
    reported,
    rows.length,
    "Audit summary disagrees with detailed findings.",
  );
  return rows.length;
}
function selfTest() {
  const valid = {
    advisories: {
      one: {
        github_advisory_id: advisory,
        module_name: "braces",
        findings: [
          {
            version: "3.0.3",
            dev: true,
            paths: [
              "apps__pipstart>eslint-config-next>@next/eslint-plugin-next>fast-glob>micromatch>braces",
            ],
          },
        ],
      },
    },
    metadata: { vulnerabilities: { high: 1 } },
  };
  assert.equal(verifyAudit(valid), 1);
  const picomatch = {
    github_advisory_id: picomatchAdvisory,
    module_name: "picomatch",
    findings: [
      {
        version: "4.0.5",
        dev: true,
        paths: [
          "apps__pipstart>vitest>vite>tinyglobby>fdir>picomatch",
          "apps__pipstart>@mdx-js/rollup>@rollup/pluginutils>picomatch",
          "packages__ui>vitest>picomatch",
        ],
      },
      {
        version: "2.3.2",
        dev: true,
        paths: [
          "apps__skillcima>eslint-config-next>@next/eslint-plugin-next>fast-glob>micromatch>picomatch",
        ],
      },
    ],
  };
  const both = structuredClone(valid);
  both.advisories.two = structuredClone(picomatch);
  both.metadata.vulnerabilities.high = 2;
  assert.equal(verifyAudit(both), 2);
  const alone = {
    advisories: { two: structuredClone(picomatch) },
    metadata: { vulnerabilities: { high: 1 } },
  };
  assert.equal(verifyAudit(alone), 1);
  for (const mutate of [
    (r) => (r.advisories.two.findings[0].dev = false),
    (r) => (r.advisories.two.findings[0].version = "4.0.6"),
    (r) =>
      (r.advisories.two.findings[0].paths = ["apps__pipstart>next>picomatch"]),
    (r) =>
      (r.advisories.two.findings[0].paths = [
        "apps__pipstart>chokidar>picomatch",
      ]),
    (r) =>
      (r.advisories.two.findings[0].paths = [
        "apps__pipstart>vitest>vite>picomatch>evil",
      ]),
    (r) => (r.advisories.two.module_name = "micromatch"),
    (r) => (r.advisories.two.github_advisory_id = "GHSA-0000-0000-0000"),
    (r) => (r.metadata.vulnerabilities.high = 1),
  ]) {
    const r = structuredClone(both);
    mutate(r);
    assert.throws(() => verifyAudit(r));
  }
  for (const mutate of [
    (r) => (r.advisories.one.github_advisory_id = "other"),
    (r) => (r.advisories.one.findings[0].dev = false),
    (r) => (r.advisories.one.findings[0].version = "3.0.4"),
    (r) => (r.advisories.one.findings[0].paths = ["other>braces"]),
    (r) => (r.metadata.vulnerabilities.high = 2),
  ]) {
    const r = structuredClone(valid);
    mutate(r);
    assert.throws(() => verifyAudit(r));
  }
  console.log(
    "Audit policy: valid scoped braces and picomatch findings, five braces and eight picomatch rejection fixtures passed.",
  );
}
function main() {
  selfTest();
  if (process.argv.includes("--self-test")) return;
  const root = process.cwd();
  const patchFile = path.join(root, "patches/braces-3.0.3-depth-limit.patch");
  assert.equal(
    hash(fs.readFileSync(patchFile, "utf8").replace(/\r\n?/g, "\n")),
    "7d5bfb2f061d0a8bb8f1efc2117e68f8dae8733a1f214bed8b08be86e0c06529",
    "Committed braces patch changed.",
  );
  const directories = new Set();
  for (const app of ["pipstart", "skillcima"]) {
    let req = createRequire(path.join(root, "apps", app, "package.json"));
    for (const name of [
      "eslint-config-next",
      "@next/eslint-plugin-next",
      "fast-glob",
      "micromatch",
    ])
      req = createRequire(req.resolve(name));
    directories.add(path.dirname(req.resolve("braces")));
  }
  for (const directory of directories) verifyBraces(directory);
  const run =
    process.platform === "win32"
      ? spawnSync("cmd.exe", ["/d", "/s", "/c", "pnpm.cmd audit --json"], {
          encoding: "utf8",
          maxBuffer: 16 * 1024 * 1024,
        })
      : spawnSync("pnpm", ["audit", "--json"], {
          encoding: "utf8",
          maxBuffer: 16 * 1024 * 1024,
        });
  assert(!run.error, "Audit could not execute: " + run.error?.message);
  const option = process.argv.find((a) => a.startsWith("--report="));
  if (option) fs.writeFileSync(option.slice(9), run.stdout || run.stderr || "");
  assert(
    [0, 1].includes(run.status),
    "Audit command failed: " + run.stderr + " " + run.stdout,
  );
  const report = JSON.parse(run.stdout);
  const findings = verifyAudit(report);
  console.log(
    "Installed braces depth guards and normal-pattern checks passed.",
  );
  console.log(
    findings
      ? "Raw audit retains " +
          findings +
          " scoped advisory record(s): braces (mitigated by the verified local patch) and/or picomatch (development tooling only, no published fix). All other advisories cleared."
      : "Fresh audit reports no advisories.",
  );
  console.log(
    "No global audit ignore is configured. This check requires the installed patch and rejects new/production/unexpected findings.",
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
