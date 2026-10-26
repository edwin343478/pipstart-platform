import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateLocalSqlPlan } from "./m22-local-plan-guard.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const migration =
  "supabase/migrations/20261026120000_pipstart_m22_staff_core.sql";
const dependency =
  "supabase/migrations/20260915143000_pipstart_learner_accounts.sql";
const suite = "apps/pipstart/scripts/test-m22-staff-core.sql";
const digest = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

export function isolatedName(runId) {
  if (typeof runId !== "string" || !/^[a-f0-9]{32}$/.test(runId))
    throw Error("Invalid isolated run identifier");
  return `pipstart_m22_test_${runId}`;
}
export function executionMode(argv, env) {
  if (env.DOCKER_HOST || env.DOCKER_CONTEXT)
    throw Error("Docker target override refused");
  if (argv.includes("--ci")) {
    if (
      env.GITHUB_ACTIONS !== "true" ||
      argv.length !== 2 ||
      !argv.includes("--run-isolated") ||
      new Set(argv).size !== 2
    )
      throw Error(
        "CI mode requires GitHub Actions and explicit isolated execution",
      );
    return "ci";
  }
  if (
    argv.length > 1 ||
    argv.some((arg) => !["--preflight", "--run-isolated"].includes(arg))
  )
    throw Error(
      "Use --preflight or separately authorized --run-isolated; no hosted/reset mode",
    );
  return argv[0] === "--run-isolated" ? "run" : "preflight";
}
export function executionContainer(mode) {
  if (!["preflight", "run", "ci"].includes(mode))
    throw Error("Unknown execution mode");
  return mode === "ci"
    ? "pipstart-m22-staff-sql-ci"
    : "supabase_db_pipstart-platform";
}
export function checkedContainer(inspected, mode) {
  executionContainer(mode);
  if (
    !inspected ||
    inspected.Running !== true ||
    !/^[a-f0-9]{64}$/.test(inspected.Id ?? "")
  )
    throw Error("Expected an existing running isolated/local DB container");
  if (mode === "ci" && inspected.CiLabel !== "staff-sql-ci-v1")
    throw Error("CI container isolation label mismatch");
  return inspected.Id;
}
export function checkedManifest(repositoryRoot, manifest) {
  const expected = [dependency, migration, suite];
  if (
    manifest.version !== 1 ||
    !Array.isArray(manifest.files) ||
    manifest.files.length !== 3 ||
    manifest.files.some(
      (entry, index) =>
        entry.path !== expected[index] || !/^[a-f0-9]{64}$/.test(entry.sha256),
    )
  )
    throw Error("Unreviewed MP02 SQL manifest");
  for (const entry of manifest.files) {
    const source = fs.realpathSync(path.resolve(repositoryRoot, entry.path));
    const rel = path.relative(fs.realpathSync(repositoryRoot), source);
    if (path.isAbsolute(rel) || rel === ".." || rel.startsWith(".." + path.sep))
      throw Error("SQL manifest escaped repository");
    if (digest(fs.readFileSync(source)) !== entry.sha256)
      throw Error("MP02 SQL fingerprint changed");
  }
  return { migration, dependency, suite };
}

export async function verifyStaffCore(
  argv = process.argv.slice(2),
  env = process.env,
) {
  const mode = executionMode(argv, env);
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(root, "docs/milestone-22-mp02-sql-manifest.json"),
      "utf8",
    ),
  );
  checkedManifest(root, manifest);
  const runId = crypto.randomBytes(16).toString("hex");
  const database = isolatedName(runId);
  validateLocalSqlPlan(
    {
      runId,
      reviewed: true,
      phase: "staged",
      target: {
        host: "127.0.0.1",
        port: 54322,
        database,
        project: `pipstart-m22-${runId}`,
      },
      migrations: [manifest.files[1]],
    },
    root,
  );
  if (mode === "preflight") {
    console.log(
      "MP02 SQL PREFLIGHT PASSED: three reviewed fingerprints and isolated-target plan. No Docker/database call; SQL execution is pending authorization.",
    );
    return;
  }
  if (mode === "ci" && !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? ""))
    throw Error("Expected exact CI revision before isolated execution");
  const docker = process.platform === "win32" ? "docker.exe" : "docker";
  const reportRoot = mode === "ci" ? env.RUNNER_TEMP : os.tmpdir();
  if (
    typeof reportRoot !== "string" ||
    !path.isAbsolute(reportRoot) ||
    !fs.statSync(reportRoot).isDirectory()
  )
    throw Error("Expected existing local runner report directory");
  const reportFile = path.join(reportRoot, `pipstart-m22-mp02-${runId}.json`);
  const marker = `m22-mp02-${runId}`;
  const result = {
    reportVersion: 2,
    execution: mode === "ci" ? "ci-isolated" : "local-isolated",
    inputs: manifest.files,
    runnerSha256: digest(fs.readFileSync(fileURLToPath(import.meta.url))),
    revision:
      mode === "ci" && /^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? "")
        ? env.GITHUB_SHA
        : null,
    runId,
    database,
    marker,
    staged: false,
    head: false,
    raceBlocked: false,
    race: false,
    cleanup: false,
    passed: false,
  };
  const deadline = Date.now() + 180000;
  let created = false,
    container;
  const children = [];
  function command(args, input, timeout = 30000) {
    const run = spawnSync(docker, args, {
      input,
      encoding: "utf8",
      timeout,
      maxBuffer: 2 * 1024 * 1024,
      windowsHide: true,
    });
    if (run.error || run.status !== 0)
      throw Error(
        "MP02 Docker/SQL operation failed; see sanitized test stage. " +
          (run.stderr || run.error?.message || "").slice(-800),
      );
    return run.stdout.trim();
  }
  function sql(db, input, cleanup = false) {
    if (db !== "postgres") isolatedName(db.replace("pipstart_m22_test_", ""));
    if (!cleanup && Date.now() > deadline)
      throw Error("MP02 acceptance exceeded its three-minute work budget");
    return command(
      [
        "exec",
        "-i",
        container,
        "psql",
        "-X",
        "-qAt",
        "-U",
        "postgres",
        "-d",
        db,
        "--set=ON_ERROR_STOP=1",
      ],
      "set statement_timeout='20s';set lock_timeout='8s';\n" + input,
    );
  }
  function childSql(input) {
    const child = spawn(
      docker,
      [
        "exec",
        "-i",
        container,
        "psql",
        "-X",
        "-qAt",
        "-U",
        "postgres",
        "-d",
        database,
        "--set=ON_ERROR_STOP=1",
      ],
      { stdio: ["pipe", "pipe", "pipe"], windowsHide: true },
    );
    children.push(child);
    let output = "",
      errors = "";
    const done = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        child.kill();
        reject(Error("MP02 race session deadline"));
      }, 22000);
      child.on("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.stdout.on("data", (chunk) => {
        output += chunk;
      });
      child.stderr.on("data", (chunk) => {
        errors += chunk;
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        resolve({ code, output, errors });
      });
    });
    void done.catch(() => {});
    child.stdin.end(
      "\\set VERBOSITY verbose\nset statement_timeout='20s';set lock_timeout='8s';\n" +
        input,
    );
    return { child, done, output: () => output };
  }
  async function waitFor(check, milliseconds) {
    const until = Date.now() + milliseconds;
    while (Date.now() < until) {
      if (check()) return;
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    throw Error("MP02 concurrency barrier not observed");
  }
  function cleanup() {
    if (!created) return;
    const owned = sql(
      "postgres",
      `select count(*) from pg_database where datname='${database}' and datdba=(select oid from pg_roles where rolname='postgres') and shobj_description(oid,'pg_database')='${marker}';`,
      true,
    );
    if (owned !== "1")
      throw Error("Generated database identity mismatch; cleanup refused");
    sql("postgres", `drop database ${database} with (force);`, true);
    created = false;
    result.cleanup =
      sql(
        "postgres",
        `select count(*)=0 from pg_database where datname='${database}';`,
        true,
      ) === "t";
    if (!result.cleanup)
      throw Error("Generated database cleanup not confirmed");
  }
  function interrupted() {
    result.passed = false;
    for (const child of children) if (child.exitCode === null) child.kill();
    try {
      cleanup();
    } catch (error) {
      console.error(error.message);
    }
    fs.writeFileSync(reportFile, JSON.stringify(result, null, 2) + "\n");
    console.error(
      "Interrupted; generated database cleanup status is in " + reportFile,
    );
    process.exit(130);
  }
  process.on("SIGINT", interrupted);
  process.on("SIGTERM", interrupted);
  fs.writeFileSync(reportFile, JSON.stringify(result, null, 2) + "\n");
  try {
    const endpoint = JSON.parse(
      command([
        "context",
        "inspect",
        "--format",
        "{{json .Endpoints.docker.Host}}",
      ]),
    );
    if (
      typeof endpoint !== "string" ||
      !/^(npipe:\/\/|unix:\/\/)/.test(endpoint)
    )
      throw Error("Only the local Docker engine is allowed");
    const inspected = JSON.parse(
      command([
        "inspect",
        "--format",
        '{"Id":"{{.Id}}","Running":{{.State.Running}},"CiLabel":{{json (index .Config.Labels "pipstart.m22.isolated")}}}',
        executionContainer(mode),
      ]),
    );
    container = checkedContainer(inspected, mode);
    if (
      sql(
        "postgres",
        "select count(*) from pg_roles where rolname in ('anon','authenticated','service_role');",
      ) !== "3"
    )
      throw Error(
        "Expected existing API roles; no global roles will be created",
      );
    if (
      sql(
        "postgres",
        `select count(*) from pg_database where datname='${database}';`,
      ) !== "0"
    )
      throw Error("Generated database already exists");
    sql(
      "postgres",
      `create database ${database} template template0 owner postgres;`,
    );
    created = true;
    sql("postgres", `comment on database ${database} is '${marker}';`);
    fs.writeFileSync(reportFile, JSON.stringify(result, null, 2) + "\n");
    console.log(
      "Created a fresh marked disposable database; existing application database is untouched.",
    );
    sql(
      database,
      `create schema auth;
      create table auth.users(id uuid primary key,raw_user_meta_data jsonb not null default '{}');
      create table auth.sessions(id uuid primary key,user_id uuid not null references auth.users(id));
      create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
      create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
      grant usage on schema auth to authenticated; grant execute on function auth.jwt(),auth.uid() to authenticated;`,
    );
    sql(database, fs.readFileSync(path.join(root, dependency), "utf8"));
    sql(database, fs.readFileSync(path.join(root, migration), "utf8"));
    sql(database, fs.readFileSync(path.join(root, suite), "utf8"));
    result.staged = true;
    result.head =
      sql(
        database,
        "select (not enabled) and (select count(*)=0 from pipstart_staff_private.members) and (select count(*)=0 from pipstart_staff_private.audit) and (select count(*)=0 from pipstart_staff_private.receipts) from pipstart_staff_private.control;",
      ) === "t";
    if (!result.head)
      throw Error("Fixture rollback/default-closed verification failed");
    console.log(
      "MP02 behavioral stage passed; fixtures rolled back and head remains default-closed.",
    );
    const owners = [1, 2].map((n) => `10000000-0000-4000-8000-00000000000${n}`);
    const sessions = [1, 2].map(
      (n) => `20000000-0000-4000-8000-00000000000${n}`,
    );
    sql(
      database,
      `insert into auth.users(id,raw_user_meta_data) values('${owners[0]}','{"display_name":"Fixture"}'),('${owners[1]}','{"display_name":"Fixture"}');
      insert into auth.sessions values('${sessions[0]}','${owners[0]}'),('${sessions[1]}','${owners[1]}');
      select pipstart_staff_private.bootstrap_owner('${owners[0]}',gen_random_uuid());
      insert into pipstart_staff_private.members(user_id) values('${owners[1]}');
      insert into pipstart_staff_private.roles values('${owners[1]}','owner');
      select pipstart_staff_private.transition(true,0,gen_random_uuid());
      ${owners.map((u, i) => `select pipstart_staff_private.issue_receipt('${u}','${sessions[i]}','revoke_role','${u}','owner','','',sha256(convert_to(repeat('${i ? "b" : "a"}',64),'UTF8')),clock_timestamp());`).join("\n")}`,
    );
    const claim = (i) =>
      `set local role authenticated;set local request.jwt.claims='${JSON.stringify({ sub: owners[i], session_id: sessions[i], aal: "aal2", role: "authenticated" })}';`;
    const change = (i) =>
      `select public.pipstart_staff_change('${owners[i]}','revoke_role','owner','','',repeat('${i ? "b" : "a"}',64),gen_random_uuid(),'owner_transfer');`;
    const a = childSql(
      `set application_name='m22-owner-a-${runId}';begin;select 1 from pipstart_staff_private.control where singleton for update;select 'M22_LOCKED';select pg_sleep(5);${claim(0)}${change(0)}commit;`,
    );
    await waitFor(() => a.output().includes("M22_LOCKED"), 8000);
    const b = childSql(
      `set application_name='m22-owner-b-${runId}';begin;${claim(1)}${change(1)}commit;`,
    );
    await waitFor(
      () =>
        sql(
          database,
          `select exists(select 1 from pg_stat_activity where datname=current_database() and application_name='m22-owner-b-${runId}' and wait_event_type='Lock');`,
        ) === "t",
      3500,
    );
    result.raceBlocked = true;
    const [first, second] = await Promise.all([a.done, b.done]);
    result.race =
      first.code === 0 &&
      second.code !== 0 &&
      second.errors.includes("42501") &&
      sql(
        database,
        "select count(*) from pipstart_staff_private.members m join pipstart_staff_private.roles r using(user_id) where m.active and r.role_name='owner';",
      ) === "1" &&
      sql(
        database,
        "select count(*) from pipstart_staff_private.audit where operation='revoke_role';",
      ) === "1";
    if (!result.race) throw Error("Last-owner concurrent acceptance failed");
    cleanup();
    result.passed =
      result.staged &&
      result.head &&
      result.raceBlocked &&
      result.race &&
      result.cleanup;
    console.log(
      "MP02 ISOLATED SQL ACCEPTANCE PASSED: behavioral stage, rollback/head and observed two-session last-owner contention. SQL-only Auth stubs; not live Auth/PostgREST acceptance.",
    );
  } finally {
    process.removeListener("SIGINT", interrupted);
    process.removeListener("SIGTERM", interrupted);
    for (const child of children) if (child.exitCode === null) child.kill();
    try {
      cleanup();
    } finally {
      fs.writeFileSync(reportFile, JSON.stringify(result, null, 2) + "\n");
      console.log("Sanitized report: " + reportFile);
    }
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  verifyStaffCore().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
