import { restoreSourceReviewBaseline } from "./verify-m17-source-closure.mjs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
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
function calculate(x) {
  if (typeof x === "number") {
    assert.ok(Number.isFinite(x), "Finite input");
    return x;
  }
  assert.ok(
    x && typeof x === "object" && Array.isArray(x.args),
    "Expression schema",
  );
  const arity = (n) => assert.equal(x.args.length, n, "Expression arity");
  if (x.op === "mean") {
    arity(1);
    const a = x.args[0];
    assert.ok(Array.isArray(a));
    if (!a.length) return undefined;
    return a.reduce((s, n) => s + calculate(n), 0) / a.length;
  }
  if (x.op === "weightedMean") {
    arity(1);
    let numerator = 0,
      denominator = 0;
    for (const pair of x.args[0]) {
      assert.equal(pair.length, 2);
      const [q, p] = pair.map(calculate);
      assert.ok(q >= 0, "Nonnegative compatible quantity");
      numerator += q * p;
      denominator += q;
    }
    return denominator === 0 ? undefined : numerator / denominator;
  }
  if (["maximumDrawdownCash", "maximumDrawdownPercent"].includes(x.op)) {
    arity(1);
    const a = x.args[0];
    assert.ok(Array.isArray(a) && a.length);
    let peak = -Infinity,
      result = 0;
    for (const value of a) {
      const n = calculate(value);
      assert.ok(n > 0, "Positive account reference");
      peak = Math.max(peak, n);
      const loss = peak - n;
      result = Math.max(
        result,
        x.op === "maximumDrawdownCash" ? loss : (loss / peak) * 100,
      );
    }
    return result;
  }
  if (x.op === "abs") {
    arity(1);
    return Math.abs(calculate(x.args[0]));
  }
  if (x.op === "round") {
    arity(2);
    const value = calculate(x.args[0]),
      places = calculate(x.args[1]);
    assert.ok(Number.isInteger(places) && places >= 0 && places <= 10);
    return Math.round(value * 10 ** places) / 10 ** places;
  }
  arity(2);
  const [a, b] = x.args.map(calculate);
  assert.ok(
    a !== undefined && b !== undefined,
    "Undefined ratio cannot enter another arithmetic operation",
  );
  if (x.op === "add") return a + b;
  if (x.op === "subtract") return a - b;
  if (x.op === "multiply") return a * b;
  if (x.op === "divide") return b === 0 ? undefined : a / b;
  throw new Error("Unknown arithmetic operation");
}
const ids = [
  "forex:break-even",
  "forex:cross-rate",
  "forex:gross-profit-and-loss",
  "forex:inverse-quote",
  "forex:net-profit-and-loss",
  "forex:midpoint-price",
  "forex:basis-point",
  "forex:drawdown",
  "forex:percentage-point",
  "forex:recovery-percentage",
  "forex:average-loss",
  "forex:average-win",
  "forex:maximum-drawdown",
  "forex:profit-factor",
  "forex:r-multiple",
  "forex:sample-expectancy",
  "forex:weighted-average-fill",
  "forex:win-rate",
  "forex:yield-differential",
  "crypto:drawdown",
];
export function verifyArithmetic(catalogue, record) {
  assert.equal(record.schemaVersion, 1);
  assert.equal(
    record.catalogueDigest,
    digest(catalogue),
    "Arithmetic catalogue binding",
  );
  assert.equal(catalogue.approved, false, "Publication remains closed");
  assert.deepEqual(
    record.checks.map((x) => x.entryId).sort(),
    [...ids].sort(),
    "Exactly 20 arithmetic entries",
  );
  assert.equal(
    new Set(record.checks.map((x) => x.entryId)).size,
    20,
    "Unique arithmetic checks",
  );
  let proofs = 0;
  for (const row of record.checks) {
    const entry = catalogue.entries.find((e) => e.id === row.entryId);
    assert.ok(entry);
    assert.equal(row.meaningIndex, 0);
    assert.equal(row.result, "passed");
    assert.deepEqual(
      row.meaning,
      entry.meanings[0],
      "Reviewed wording unchanged",
    );
    assert.equal(row.meaningDigest, digest(entry.meanings[0]));
    assert.deepEqual(
      row.lessonIds,
      entry.lessonLinks.map((x) => x.lessonId),
      "Lesson context preserved",
    );
    assert.ok(row.formula && row.units && row.reviewNotes, "Calculation scope");
    assert.ok(row.proofs.length > 0);
    for (const p of row.proofs) {
      assert.ok(p.label);
      assert.ok(p.tolerance > 0 && p.tolerance <= 1e-8);
      const actual = calculate(p.expression);
      if (p.expected === "undefined")
        assert.equal(actual, undefined, "Undefined denominator rule");
      else {
        assert.ok(Number.isFinite(p.expected));
        assert.ok(
          actual !== undefined && Math.abs(actual - p.expected) <= p.tolerance,
          `Wrong arithmetic for ${row.entryId}: ${p.label}`,
        );
      }
      proofs++;
    }
  }
  assert.equal(proofs, 37, "Complete numerical and boundary coverage");
  return { meanings: 20, proofs };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const idx = process.argv.indexOf("--catalogue-root");
  if (idx >= 0 && !process.argv[idx + 1])
    throw new Error("Missing catalogue root");
  const catRoot = idx >= 0 ? resolve(process.argv[idx + 1]) : root;
  const read = (p) =>
    JSON.parse(readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
  const c = restoreSourceReviewBaseline(
      read(
        resolve(
          catRoot,
          "apps/pipstart/src/content/glossary-catalogue.draft.json",
        ),
      ),
    ),
    r = read(resolve(root, "docs/milestone-17-arithmetic-verification.json"));
  const result = verifyArithmetic(c, r);
  const fixtures = [
    ["missing entry", (x) => x.checks.pop()],
    ["wrong result", (x) => (x.checks[0].proofs[0].expected = 1)],
    ["changed wording", (x) => (x.checks[0].meaning.definition += " changed")],
    ["units removed", (x) => (x.checks[0].units = "")],
    [
      "zero denominator reported finite",
      (x) =>
        (x.checks.find(
          (r) => r.entryId === "forex:profit-factor",
        ).proofs[1].expected = 0),
    ],
    [
      "future peak misused",
      (x) =>
        (x.checks.find(
          (r) => r.entryId === "forex:maximum-drawdown",
        ).proofs[2].expected = 30),
    ],
    [
      "zero result excluded",
      (x) =>
        (x.checks.find(
          (r) => r.entryId === "forex:win-rate",
        ).proofs[0].expected = (100 * 2) / 3),
    ],
    [
      "unweighted price average",
      (x) =>
        (x.checks.find(
          (r) => r.entryId === "forex:weighted-average-fill",
        ).proofs[0].expected = 1.11),
    ],
    ["scope note removed", (x) => (x.checks[0].reviewNotes = "")],
  ];
  for (const [label, mutate] of fixtures) {
    const copy = structuredClone(r);
    mutate(copy);
    assert.throws(
      () => verifyArithmetic(c, copy),
      undefined,
      `Missed ${label}`,
    );
  }
  console.log(
    `M17 arithmetic verification passed: ${result.meanings} meanings, ${result.proofs} numerical/boundary proofs, ${fixtures.length} negative fixtures.`,
  );
  console.log(
    "Historical numerical examples retained. Publication approval and universal source certification are not granted.",
  );
}
