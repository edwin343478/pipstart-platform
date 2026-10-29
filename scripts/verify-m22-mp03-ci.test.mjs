import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  checkedMp03Manifest,
  MP03_SQL_INPUTS,
  executionMode,
  executionContainer,
  checkedContainer,
} from "../apps/pipstart/scripts/verify-m22-mp03.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(root, "docs/milestone-22-mp03-release-sql-manifest.json"),
    "utf8",
  ),
);
test("complete checked-in MP03 SQL inputs match exact ordered scope", () => {
  assert.equal(MP03_SQL_INPUTS.length, 25);
  assert.deepEqual(MP03_SQL_INPUTS.slice(-4), [
    "supabase/migrations/20261029090000_pipstart_m22_staff_enrolment_gate.sql",
    "apps/pipstart/scripts/test-m22-staff-enrolment-gate.sql",
    "supabase/migrations/20261030090000_pipstart_m22_editorial_store.sql",
    "apps/pipstart/scripts/test-m22-editorial-store.sql",
  ]);
  assert.deepEqual(checkedMp03Manifest(root, manifest), manifest.files);
});
test("missing, extra, reordered, duplicate and traversal entries refused", () => {
  const samples = [
    { version: 1, files: manifest.files.slice(1) },
    { ...manifest, version: 2 },
    { ...manifest, files: [...manifest.files, ...manifest.files.slice(0, 1)] },
  ];
  for (const transform of [
    (a) => a.reverse(),
    (a) => {
      a[1] = a[0];
      return a;
    },
    (a) => {
      a[0] = { ...a[0], path: "../outside.sql" };
      return a;
    },
  ])
    samples.push({
      ...manifest,
      files: transform(structuredClone(manifest.files)),
    });
  for (const v of samples) assert.throws(() => checkedMp03Manifest(root, v));
});
test("changed SQL fingerprints refused before any database work", () => {
  const changed = structuredClone(manifest);
  changed.files.at(-1).sha256 = "0".repeat(64);
  assert.throws(() => checkedMp03Manifest(root, changed));
});
test("real preflight validates all MP03 inputs without Docker", () => {
  const env = { ...process.env };
  delete env.DOCKER_HOST;
  delete env.DOCKER_CONTEXT;
  const r = spawnSync(
    process.execPath,
    [
      path.join(root, "apps/pipstart/scripts/verify-m22-mp03.mjs"),
      "--preflight",
    ],
    { env, encoding: "utf8" },
  );
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /MP03 SQL PREFLIGHT PASSED/);
});
test("SQL sources reached through a symlink outside the declared root are refused", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "m22-ci-manifest-"));
  try {
    const inside = path.join(tmp, "inside"),
      outside = path.join(tmp, "outside");
    fs.mkdirSync(inside);
    fs.mkdirSync(outside);
    const entries = MP03_SQL_INPUTS.map((p) => {
      const f = path.join(outside, p);
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, "select 1;\n");
      return {
        path: p,
        sha256: crypto.createHash("sha256").update("select 1;\n").digest("hex"),
      };
    });
    for (const folder of ["apps", "supabase"])
      fs.symlinkSync(
        path.join(outside, folder),
        path.join(inside, folder),
        process.platform === "win32" ? "junction" : "dir",
      );
    assert.throws(() =>
      checkedMp03Manifest(inside, { version: 1, files: entries }),
    );
  } finally {
    // Remove only the exact mkdtemp tree; unlink directory junctions before recursion.
    for (const folder of ["apps", "supabase"]) {
      const link = path.join(tmp, "inside", folder);
      if (fs.existsSync(link)) fs.unlinkSync(link);
    }
    if (
      path.dirname(path.resolve(tmp)) !== path.resolve(os.tmpdir()) ||
      !path.basename(tmp).startsWith("m22-ci-manifest-")
    )
      throw Error("Temporary cleanup path escaped scope");
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("MP03 runner itself refuses remote and implicit CI modes", () => {
  assert.equal(executionMode([], { GITHUB_ACTIONS: "true" }), "preflight");
  for (const env of [
    {},
    { GITHUB_ACTIONS: "true", DOCKER_HOST: "ssh://remote" },
    { GITHUB_ACTIONS: "true", DOCKER_CONTEXT: "remote" },
  ])
    assert.throws(() => executionMode(["--run-isolated", "--ci"], env));
  assert.equal(
    executionMode(["--run-isolated", "--ci"], { GITHUB_ACTIONS: "true" }),
    "ci",
  );
  for (const args of [
    ["--ci"],
    ["--ci", "--preflight"],
    ["--run-isolated", "--ci", "--hosted"],
  ])
    assert.throws(() => executionMode(args, { GITHUB_ACTIONS: "true" }));
});
test("MP03 CI cannot select an unlabelled application container", () => {
  assert.equal(executionContainer("ci"), "pipstart-m22-staff-sql-ci");
  assert.notEqual(executionContainer("ci"), executionContainer("run"));
  const identity = {
    Id: "a".repeat(64),
    Running: true,
    CiLabel: "staff-sql-ci-v1",
  };
  assert.equal(checkedContainer(identity, "ci"), identity.Id);
  for (const change of [
    { CiLabel: null },
    { CiLabel: "wrong" },
    { Running: false },
    { Id: "unreviewed" },
  ])
    assert.throws(() => checkedContainer({ ...identity, ...change }, "ci"));
});

test("consolidated Auth-session stub permits learner deletion while staff history remains restricted", () => {
  const runner = fs.readFileSync(
    path.join(root, "apps/pipstart/scripts/verify-m22-mp03.mjs"),
    "utf8",
  );
  const ddl = /create table auth\.sessions\([^;]+;/i.exec(runner)?.[0];
  assert.ok(ddl, "Auth session stub missing");
  assert.match(
    ddl,
    /user_id uuid not null references auth\.users\(id\) on delete cascade/i,
  );
  const staff = fs.readFileSync(
    path.join(
      root,
      "supabase/migrations/20261026120000_pipstart_m22_staff_core.sql",
    ),
    "utf8",
  );
  assert.match(
    staff,
    /user_id uuid primary key references auth\.users\(id\) on delete restrict/i,
  );
  assert.doesNotMatch(
    "create table auth.sessions(id uuid primary key,user_id uuid not null references auth.users(id));",
    /on delete cascade/i,
  );
});
