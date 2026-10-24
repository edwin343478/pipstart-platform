import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  generatedDatabase,
  fixtureUuid,
  executionTarget,
  migrationNames,
} from "./verify-m21-sql.mjs";

test("only a generated, fully qualified fixture database name is accepted", () => {
  assert.equal(
    generatedDatabase("pipstart_m21_ci_" + "a".repeat(32)),
    "pipstart_m21_ci_" + "a".repeat(32),
  );
  for (const value of [
    "postgres",
    "pipstart-platform",
    "pipstart_m21_ci_",
    "pipstart_m21_ci_" + "a".repeat(31),
    "pipstart_m21_ci_" + "a".repeat(32) + ";drop database postgres",
    "PIPSTART_M21_CI_" + "a".repeat(32),
  ])
    assert.throws(() => generatedDatabase(value));
});
test("generated identifiers cannot inject SQL", () => {
  assert.equal(
    fixtureUuid("00000000-0000-4000-8000-000000000001"),
    "00000000-0000-4000-8000-000000000001",
  );
  for (const value of [
    null,
    {},
    "a".repeat(36),
    "00000000-0000-4000-8000-000000000001';--",
  ])
    assert.throws(() => fixtureUuid(value));
});
test("execution is explicit, local fixed target, no hosted/custom endpoint", () => {
  assert.equal(executionTarget({}, ["--run"]), "supabase_db_pipstart-platform");
  for (const args of [
    [],
    ["--ci"],
    ["--run", "--container=production"],
    ["--run", "--url=https://hosted"],
  ])
    assert.throws(() => executionTarget({}, args));
  assert.throws(() => executionTarget({}, ["--run", "--ci"]));
  assert.equal(
    executionTarget({ GITHUB_ACTIONS: "true" }, ["--run", "--ci"]),
    "pipstart-m21-sql-ci",
  );
});
test("pinned M21 migration slice is complete and ordered", () => {
  assert.equal(migrationNames.length, 18);
  assert.equal(new Set(migrationNames).size, 18);
  assert.deepEqual([...migrationNames].sort(), migrationNames);
  const actual = fs
    .readdirSync(new URL("../supabase/migrations/", import.meta.url))
    .filter((name) => /^202610(?:19|20|21|22|23)\d{6}_.*\.sql$/.test(name))
    .sort();
  assert.deepEqual(
    actual,
    migrationNames,
    "Update the explicit acceptance slice when M21 migrations change",
  );
});
