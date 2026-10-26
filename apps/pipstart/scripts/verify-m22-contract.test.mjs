import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { verifyM22Contract } from "./verify-m22-contract.mjs";

const baseline = JSON.parse(
  readFileSync(
    new URL("../../../docs/milestone-22-mp01-evidence.json", import.meta.url),
    "utf8",
  ),
);
const copy = () => structuredClone(baseline);
describe("M22 traceability coverage, not future-feature execution", () => {
  it("maps the approved 14 features and five acceptance tests without a SQL executor", () => {
    expect(verifyM22Contract(baseline)).toEqual({
      features: 14,
      acceptanceTests: 5,
      decisions: 9,
      plannedPatches: 12,
      sqlExecution: false,
    });
  });
  it("detects an omitted feature or acceptance boundary", () => {
    const missing = copy();
    missing.features.pop();
    expect(() => verifyM22Contract(missing)).toThrow();
    const missingTest = copy();
    missingTest.acceptance.pop();
    expect(() => verifyM22Contract(missingTest)).toThrow();
  });
  it("detects duplicated coverage and unapproved patch expansion", () => {
    const duplicate = copy();
    duplicate.features[0] = duplicate.features[1];
    expect(() => verifyM22Contract(duplicate)).toThrow();
    const extra = copy();
    extra.features[0].patches = ["MP13"];
    expect(() => verifyM22Contract(extra)).toThrow();
  });
  it("rejects claiming future feature tests passed or executable SQL in MP01", () => {
    const falsePass = copy();
    falsePass.acceptance[0].status = "passed";
    expect(() => verifyM22Contract(falsePass)).toThrow();
    const executable = copy();
    executable.sqlManifest.executable = true;
    expect(() => verifyM22Contract(executable)).toThrow();
  });
});
