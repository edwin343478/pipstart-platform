import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { validateLocalSqlPlan } from "./m22-local-plan-guard.mjs";

const runId = "0123456789abcdef0123456789abcdef";
const roots = [];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "pipstart-m22-guard-"));
  roots.push(root);
  mkdirSync(join(root, "supabase/migrations"), { recursive: true });
  const path = "supabase/migrations/20261026000000_pipstart_m22_fixture.sql";
  const sql = "select 1;\n";
  writeFileSync(join(root, path), sql);
  return {
    root,
    path,
    plan: {
      runId,
      reviewed: true,
      phase: "staged",
      target: {
        host: "127.0.0.1",
        port: 54322,
        database: `pipstart_m22_test_${runId}`,
        project: `pipstart-m22-${runId}`,
      },
      migrations: [
        { path, sha256: createHash("sha256").update(sql).digest("hex") },
      ],
    },
  };
}
afterEach(() => {
  for (const root of roots.splice(0)) {
    // Only exact mkdtemp paths under the OS temporary directory are removed.
    if (!root.startsWith(join(tmpdir(), "pipstart-m22-guard-")))
      throw Error("Unsafe test cleanup");
    rmSync(root, { recursive: true, force: true });
  }
});
describe("read-only M22 isolated SQL plan guard", () => {
  it("returns a plan receipt without touching the input SQL", () => {
    const { root, path, plan } = fixture();
    const before = readFileSync(join(root, path), "utf8");
    expect(validateLocalSqlPlan(plan, root)).toEqual({
      kind: "plan-only",
      runId,
      phase: "staged",
      migrationCount: 1,
      databaseExecution: false,
    });
    expect(readFileSync(join(root, path), "utf8")).toBe(before);
  });
  it.each(["postgres", "pipstart-platform", "pipstart_m22_test_wrong"])(
    "rejects existing/default database %s",
    (database) => {
      const { root, plan } = fixture();
      plan.target.database = database;
      expect(() => validateLocalSqlPlan(plan, root)).toThrow(/refused/);
    },
  );
  it.each([
    "localhost",
    "db.example.supabase.co",
    "127.0.0.1.example.com",
    "::1",
    "0.0.0.0",
  ])("rejects a nonliteral target %s", (host) => {
    const { root, plan } = fixture();
    plan.target.host = host;
    expect(() => validateLocalSqlPlan(plan, root)).toThrow(/refused/);
  });
  it.each([0, 443, 65536, "54322"])("rejects invalid port %s", (port) => {
    const { root, plan } = fixture();
    plan.target.port = port;
    expect(() => validateLocalSqlPlan(plan, root)).toThrow(/refused/);
  });
  it("rejects credentials and redacts their values from failures", () => {
    const { root, plan } = fixture();
    plan.target.password = "sentinel-secret";
    let message = "";
    try {
      validateLocalSqlPlan(plan, root);
    } catch (error) {
      message = error.message;
    }
    expect(message).toContain("refused");
    expect(message).not.toContain("sentinel-secret");
  });
  it("rejects empty, unreviewed, wrong-run and unsupported phase plans", () => {
    const { root, plan } = fixture();
    for (const patch of [
      { migrations: [] },
      { reviewed: false },
      { runId: "../production" },
      { phase: "reset" },
    ]) {
      expect(() => validateLocalSqlPlan({ ...plan, ...patch }, root)).toThrow(
        /refused/,
      );
    }
  });
  it("rejects traversal, historical files, duplicates and altered SQL", () => {
    const { root, plan, path } = fixture();
    for (const wrong of [
      "../outside.sql",
      "supabase/migrations/20261019160000_pipstart_email_delivery_sweep.sql",
    ]) {
      expect(() =>
        validateLocalSqlPlan(
          { ...plan, migrations: [{ ...plan.migrations[0], path: wrong }] },
          root,
        ),
      ).toThrow(/refused/);
    }
    expect(() =>
      validateLocalSqlPlan(
        { ...plan, migrations: [...plan.migrations, ...plan.migrations] },
        root,
      ),
    ).toThrow(/refused/);
    writeFileSync(join(root, path), "select 2;\n");
    expect(() => validateLocalSqlPlan(plan, root)).toThrow(/refused/);
  });
  it("rejects a linked migration that escapes the workspace", () => {
    const { root, plan } = fixture();
    const outside = mkdtempSync(join(tmpdir(), "pipstart-m22-guard-"));
    roots.push(outside);
    const linked = join(root, "linked");
    symlinkSync(outside, linked, "junction");
    const entryPath =
      "supabase/migrations/20261026000001_pipstart_m22_link.sql";
    // A file junction is not portable on Windows; the directory target resolves
    // outside root through realpath and is rejected before read/hash.
    symlinkSync(outside, join(root, entryPath), "junction");
    expect(() =>
      validateLocalSqlPlan(
        { ...plan, migrations: [{ path: entryPath, sha256: "a".repeat(64) }] },
        root,
      ),
    ).toThrow(/refused/);
  });
});
