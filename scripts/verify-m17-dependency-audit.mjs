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
const severities = ["info", "low", "moderate", "high", "critical"];

export function verifyAudit(report) {
  const advisories = report?.advisories;
  const counts = report?.metadata?.vulnerabilities;
  assert(
    report &&
      !report.error &&
      advisories &&
      typeof advisories === "object" &&
      !Array.isArray(advisories) &&
      counts &&
      typeof counts === "object" &&
      !Array.isArray(counts) &&
      severities.every((severity) => Object.hasOwn(counts, severity)) &&
      Object.values(counts).every(
        (count) => Number.isSafeInteger(count) && count >= 0,
      ),
    "Incomplete/errored audit response.",
  );
  const rows = Object.values(advisories);
  const reported = Object.values(counts).reduce(
    (total, count) => total + count,
    0,
  );
  assert.equal(
    reported,
    rows.length,
    "Audit summary disagrees with detailed findings.",
  );
  assert.equal(rows.length, 0, "Unresolved dependency advisories remain.");
}

function selfTest() {
  const clean = {
    advisories: {},
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 },
    },
  };
  assert.doesNotThrow(() => verifyAudit(clean));
  for (const id of [
    "GHSA-vfj7-8cjw-p6xm",
    "GHSA-fc5q-39xc-vjpf",
    "other-advisory",
  ]) {
    const finding = structuredClone(clean);
    finding.advisories[id] = { github_advisory_id: id };
    finding.metadata.vulnerabilities.high = 1;
    assert.throws(
      () => verifyAudit(finding),
      /Unresolved dependency advisories remain/,
    );
  }
  const inconsistent = structuredClone(clean);
  inconsistent.metadata.vulnerabilities.high = 1;
  assert.throws(() => verifyAudit(inconsistent), /Audit summary disagrees/);
  assert.throws(
    () => verifyAudit({ ...clean, error: { code: "EFAIL" } }),
    /Incomplete\/errored/,
  );
  assert.throws(
    () => verifyAudit({ ...clean, advisories: [] }),
    /Incomplete\/errored/,
  );
  assert.throws(
    () => verifyAudit({ ...clean, metadata: { vulnerabilities: {} } }),
    /Incomplete\/errored/,
  );
  console.log(
    "Audit policy: accepted a clean response and rejected seven advisory or response errors.",
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
  verifyAudit(report);
  console.log(
    "Installed braces depth guards and normal-pattern checks passed.",
  );
  console.log(
    "Fresh audit reports no advisories. No audit exceptions are configured.",
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
