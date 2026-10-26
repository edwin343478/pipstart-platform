import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkedManifest,
  executionMode,
  executionContainer,
  checkedContainer,
  isolatedName,
} from "./verify-m22-staff-core.mjs";

const roots = [];
const paths = [
  "supabase/migrations/20260915143000_pipstart_learner_accounts.sql",
  "supabase/migrations/20261026120000_pipstart_m22_staff_core.sql",
  "apps/pipstart/scripts/test-m22-staff-core.sql",
];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "pipstart-m22-plan-"));
  roots.push(root);
  const files = paths.map((path) => {
    const file = join(root, path);
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, "select 1;\n");
    return {
      path,
      sha256: createHash("sha256").update("select 1;\n").digest("hex"),
    };
  });
  return { root, manifest: { version: 1, files } };
}
afterEach(() => {
  for (const root of roots.splice(0)) {
    if (!root.startsWith(join(tmpdir(), "pipstart-m22-plan-")))
      throw Error("Unsafe test cleanup");
    rmSync(root, { recursive: true, force: true });
  }
});
describe("MP02 isolated runner planning safety without Docker", () => {
  it("defaults to no-execution preflight", () => {
    expect(executionMode([], {})).toBe("preflight");
    expect(executionMode(["--preflight"], {})).toBe("preflight");
  });
  it("requires the explicit isolated run argument", () => {
    expect(executionMode(["--run-isolated"], {})).toBe("run");
  });
  it("requires explicit CI opt-in and a real Actions context", () => {
    expect(() => executionMode(["--run-isolated", "--ci"], {})).toThrow();
    expect(() => executionMode(["--ci"], { GITHUB_ACTIONS: "true" })).toThrow();
    expect(
      executionMode(["--run-isolated", "--ci"], { GITHUB_ACTIONS: "true" }),
    ).toBe("ci");
    expect(executionMode(["--run-isolated"], { GITHUB_ACTIONS: "true" })).toBe(
      "run",
    );
  });
  it("isolates CI from the application container and checks its label", () => {
    expect(executionContainer("ci")).toBe("pipstart-m22-staff-sql-ci");
    expect(executionContainer("run")).toBe("supabase_db_pipstart-platform");
    const inspected = {
      Id: "a".repeat(64),
      Running: true,
      CiLabel: "staff-sql-ci-v1",
    };
    expect(checkedContainer(inspected, "ci")).toBe(inspected.Id);
    expect(() =>
      checkedContainer({ ...inspected, CiLabel: null }, "ci"),
    ).toThrow();
    expect(() =>
      checkedContainer({ ...inspected, Running: false }, "ci"),
    ).toThrow();
  });
  it.each([
    "--hosted",
    "--reset",
    "--database=postgres",
    "--run",
    "--container=other",
  ])("refuses alternate execution target %s", (arg) => {
    expect(() => executionMode([arg], {})).toThrow();
  });
  it("rejects remote Docker overrides and multiple modes", () => {
    expect(() => executionMode([], { DOCKER_HOST: "ssh://remote" })).toThrow();
    expect(() => executionMode([], { DOCKER_CONTEXT: "other" })).toThrow();
    expect(() =>
      executionMode(["--preflight", "--run-isolated"], {}),
    ).toThrow();
  });
  it.each(["postgres", "../../production", "a".repeat(31), "A".repeat(32)])(
    "rejects unsafe generated DB identity %s",
    (id) => {
      expect(() => isolatedName(id)).toThrow();
    },
  );
  it("accepts only a 128-bit run's fixed disposable name", () => {
    expect(isolatedName("a".repeat(32))).toBe(
      "pipstart_m22_test_" + "a".repeat(32),
    );
  });
  it("checks the exact ordered dependencies and fingerprints", () => {
    const { root, manifest } = fixture();
    expect(checkedManifest(root, manifest).migration).toBe(paths[1]);
  });
  it("rejects changed bytes, missing files and unreviewed additions", () => {
    const { root, manifest } = fixture();
    const extra = structuredClone(manifest);
    extra.files.push(extra.files[0]);
    expect(() => checkedManifest(root, extra)).toThrow();
    const reordered = structuredClone(manifest);
    reordered.files.reverse();
    expect(() => checkedManifest(root, reordered)).toThrow();
    writeFileSync(join(root, paths[1]), "select 2;\n");
    expect(() => checkedManifest(root, manifest)).toThrow();
    rmSync(join(root, paths[0]));
    expect(() => checkedManifest(root, manifest)).toThrow();
  });
});
