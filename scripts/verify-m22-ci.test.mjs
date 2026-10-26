// Dependency-free CI bootstrap checks; safe to run before any DB service write.
import test from "node:test";
import assert from "node:assert/strict";
import {
  executionMode,
  executionContainer,
  checkedContainer,
  isolatedName,
} from "../apps/pipstart/scripts/verify-m22-staff-core.mjs";

test("CI cannot be enabled by environment alone", () => {
  assert.equal(executionMode([], { GITHUB_ACTIONS: "true" }), "preflight");
  assert.equal(
    executionMode(["--run-isolated"], { GITHUB_ACTIONS: "true" }),
    "run",
  );
});
test("CI needs both explicit flags and the expected context", () => {
  assert.throws(() => executionMode(["--run-isolated", "--ci"], {}));
  for (const args of [
    ["--ci"],
    ["--ci", "--ci"],
    ["--ci", "--preflight"],
    ["--run-isolated", "--ci", "--hosted"],
  ])
    assert.throws(() => executionMode(args, { GITHUB_ACTIONS: "true" }));
  assert.equal(
    executionMode(["--run-isolated", "--ci"], { GITHUB_ACTIONS: "true" }),
    "ci",
  );
});
test("remote Docker overrides are refused even in CI", () => {
  for (const extra of [
    { DOCKER_HOST: "ssh://remote" },
    { DOCKER_CONTEXT: "remote" },
  ])
    assert.throws(() =>
      executionMode(["--run-isolated", "--ci"], {
        GITHUB_ACTIONS: "true",
        ...extra,
      }),
    );
});
test("CI cannot select the existing application database container", () => {
  assert.equal(executionContainer("ci"), "pipstart-m22-staff-sql-ci");
  assert.equal(executionContainer("run"), "supabase_db_pipstart-platform");
  assert.notEqual(executionContainer("ci"), executionContainer("run"));
  assert.throws(() => executionContainer("hosted"));
});
test("a CI name alone is insufficient without a running labelled identity", () => {
  const good = {
    Id: "a".repeat(64),
    Running: true,
    CiLabel: "staff-sql-ci-v1",
  };
  assert.equal(checkedContainer(good, "ci"), good.Id);
  for (const changed of [
    { Running: false },
    { Id: "other" },
    { CiLabel: null },
    { CiLabel: "m21" },
  ])
    assert.throws(() => checkedContainer({ ...good, ...changed }, "ci"));
  assert.equal(checkedContainer({ ...good, CiLabel: null }, "run"), good.Id);
});
test("database identity is generated, never supplied as postgres or a host", () => {
  assert.equal(
    isolatedName("b".repeat(32)),
    "pipstart_m22_test_" + "b".repeat(32),
  );
  for (const bad of ["postgres", "db.example.com", "../app", "B".repeat(32)])
    assert.throws(() => isolatedName(bad));
});
