// Read-only planning guard, NOT a database executor or authorization boundary.
import { createHash } from "node:crypto";
import { realpathSync, readFileSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";

export function validateLocalSqlPlan(plan, repositoryRoot) {
  const deny = () => {
    throw new Error(
      "M22 isolated SQL plan refused; review target, manifest and fingerprints. No database operation performed.",
    );
  };
  if (!plan || typeof plan !== "object") deny();
  const { runId, target, migrations, reviewed, phase } = plan;
  if (!/^[a-f0-9]{32}$/.test(runId ?? "")) deny();
  if (
    !target ||
    Object.keys(target).sort().join(",") !== "database,host,port,project"
  )
    deny();
  if (
    target.host !== "127.0.0.1" ||
    !Number.isInteger(target.port) ||
    target.port < 1024 ||
    target.port > 65535
  )
    deny();
  if (
    target.database !== `pipstart_m22_test_${runId}` ||
    target.project !== `pipstart-m22-${runId}`
  )
    deny();
  if (
    reviewed !== true ||
    !["staged", "head"].includes(phase) ||
    !Array.isArray(migrations) ||
    migrations.length === 0
  )
    deny();
  const root = realpathSync(repositoryRoot);
  const seen = new Set();
  let previous = "";
  for (const entry of migrations) {
    if (
      !entry ||
      typeof entry !== "object" ||
      Object.keys(entry).sort().join(",") !== "path,sha256"
    )
      deny();
    if (
      !/^supabase\/migrations\/\d{14}_pipstart_m22_[a-z0-9_]+\.sql$/.test(
        entry.path ?? "",
      )
    )
      deny();
    if (
      !/^[a-f0-9]{64}$/.test(entry.sha256 ?? "") ||
      seen.has(entry.path) ||
      entry.path <= previous
    )
      deny();
    seen.add(entry.path);
    previous = entry.path;
    let file;
    try {
      file = realpathSync(resolve(root, entry.path));
    } catch {
      deny();
    }
    const rel = relative(root, file);
    if (
      isAbsolute(rel) ||
      rel === ".." ||
      rel.startsWith("../") ||
      rel.startsWith("..\\")
    )
      deny();
    let bytes;
    try {
      bytes = readFileSync(file);
    } catch {
      deny();
    }
    if (createHash("sha256").update(bytes).digest("hex") !== entry.sha256)
      deny();
  }
  // The caller gets only a redacted receipt, never a DSN, SQL or credential.
  return Object.freeze({
    kind: "plan-only",
    runId,
    phase,
    migrationCount: migrations.length,
    databaseExecution: false,
  });
}
