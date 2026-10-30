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

export const MP03_SQL_INPUTS = Object.freeze([
  "supabase/migrations/20260915143000_pipstart_learner_accounts.sql",
  "supabase/migrations/20261026120000_pipstart_m22_staff_core.sql",
  "apps/pipstart/scripts/test-m22-staff-core.sql",
  "supabase/migrations/20261026220000_pipstart_m22_staff_proofs_people.sql",
  "apps/pipstart/scripts/test-m22-staff-proofs.sql",
  "supabase/migrations/20261027150000_pipstart_m22_staff_governance_read.sql",
  "apps/pipstart/scripts/test-m22-staff-governance.sql",
  "supabase/migrations/20261027180000_pipstart_m22_account_deletion_safety.sql",
  "apps/pipstart/scripts/test-m22-account-deletion-safety.sql",
  "supabase/migrations/20261027200000_pipstart_m22_account_operation_journal.sql",
  "apps/pipstart/scripts/test-m22-account-operation-journal.sql",
  "supabase/migrations/20261027210000_pipstart_m22_account_provider_bridge.sql",
  "apps/pipstart/scripts/test-m22-account-provider-bridge.sql",
  "supabase/migrations/20261027220000_pipstart_m22_staff_retirement.sql",
  "apps/pipstart/scripts/test-m22-staff-retirement.sql",
  "supabase/migrations/20261028120000_pipstart_m22_learner_account_intents.sql",
  "apps/pipstart/scripts/test-m22-learner-account-intents.sql",
  "supabase/migrations/20261028150000_pipstart_m22_learner_provider_bridge.sql",
  "apps/pipstart/scripts/test-m22-learner-provider-bridge.sql",
  "supabase/migrations/20261028180000_pipstart_m22_staff_maintenance_transport.sql",
  "apps/pipstart/scripts/test-m22-staff-maintenance.sql",
  "supabase/migrations/20261029090000_pipstart_m22_staff_enrolment_gate.sql",
  "apps/pipstart/scripts/test-m22-staff-enrolment-gate.sql",
  "supabase/migrations/20261030090000_pipstart_m22_editorial_store.sql",
  "apps/pipstart/scripts/test-m22-editorial-store.sql",
  "supabase/migrations/20261031090000_pipstart_m22_editorial_import.sql",
  "apps/pipstart/scripts/test-m22-editorial-import.sql",
]);
export function checkedMp03Manifest(repositoryRoot, manifest) {
  if (
    manifest?.version !== 1 ||
    !Array.isArray(manifest.files) ||
    manifest.files.length !== MP03_SQL_INPUTS.length
  )
    throw Error("Unexpected MP03 SQL scope");
  const base = fs.realpathSync(repositoryRoot);
  for (const [i, f] of manifest.files.entries()) {
    if (f.path !== MP03_SQL_INPUTS[i] || !/^[a-f0-9]{64}$/.test(f.sha256))
      throw Error("Unreviewed MP03 SQL entry");
    const file = fs.realpathSync(path.resolve(base, f.path)),
      rel = path.relative(base, file);
    if (
      path.isAbsolute(rel) ||
      rel === ".." ||
      rel.startsWith(".." + path.sep) ||
      digest(fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n")) !== f.sha256
    )
      throw Error("MP03 SQL input escaped root or changed");
  }
  return manifest.files;
}

export async function verifyStaffCore(
  argv = process.argv.slice(2),
  env = process.env,
) {
  const mode = executionMode(argv, env);
  const mp03Inputs = checkedMp03Manifest(
    root,
    JSON.parse(
      fs.readFileSync(
        path.join(root, "docs/milestone-22-mp03-release-sql-manifest.json"),
        "utf8",
      ),
    ),
  );
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
      "MP03 SQL PREFLIGHT PASSED: core and all MP03 SQL fingerprints; isolated-target plan. No Docker/database calls.",
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
  const reportFile = path.join(
    reportRoot,
    `pipstart-m22-mp03-ci-${runId}.json`,
  );
  const marker = `m22-mp02-${runId}`;
  const result = {
    reportVersion: 2,
    execution: mode === "ci" ? "ci-isolated" : "local-isolated",
    inputs: manifest.files,
    mp03Inputs,
    journalInputs: [
      {
        path: "supabase/migrations/20261027200000_pipstart_m22_account_operation_journal.sql",
        sha256:
          "fd47ba3c6d96f72514cda761c4cd855572b6fc25b0212d9c41b704534e7fba09",
      },
      {
        path: "apps/pipstart/scripts/test-m22-account-operation-journal.sql",
        sha256:
          "264bc72045b6f423572c14ec65a12e8c8093e846f2cf66968de13196b8d647a9",
      },
    ],
    maintenanceStaged: false,
    maintenanceHead: false,
    maintenanceRaceBlocked: false,
    maintenanceSinglePermit: false,
    maintenanceFinalClosed: false,
    enrolmentStaged: false,
    enrolmentHead: false,
    editorialStaged: false,
    editorialHead: false,
    importStaged: false,
    importHead: false,
    learnerProviderStaged: false,
    learnerProviderHead: false,
    learnerProviderRaceBlocked: false,
    learnerProviderSinglePermit: false,
    learnerProviderFinalClosed: false,
    learnerStaged: false,
    learnerHead: false,
    learnerRaceBlocked: false,
    learnerSingleIntent: false,
    learnerFinalClosed: false,
    proofStaged: false,
    journalStaged: false,
    journalHead: false,
    journalRaceBlocked: false,
    journalSinglePermit: false,
    journalClosed: false,
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
      create table auth.sessions(id uuid primary key,user_id uuid not null references auth.users(id) on delete cascade);
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
    // All following writes remain inside this exact fresh marked database.
    sql(
      database,
      `truncate pipstart_staff_private.audit,pipstart_staff_private.receipts,pipstart_staff_private.assignments,pipstart_staff_private.delegations,pipstart_staff_private.roles,pipstart_staff_private.members,pipstart_staff_private.control;
      insert into pipstart_staff_private.control(singleton) values(true);
      truncate auth.sessions;delete from auth.users;
      alter table auth.sessions add column factor_id uuid,add column aal text,add column not_after timestamptz;
      create table auth.mfa_factors(id uuid primary key,user_id uuid not null references auth.users(id),factor_type text not null,status text not null);
      create table auth.mfa_amr_claims(id uuid primary key,session_id uuid not null references auth.sessions(id),authentication_method text not null,updated_at timestamptz not null,unique(session_id,authentication_method));`,
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261026220000_pipstart_m22_staff_proofs_people.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(root, "apps/pipstart/scripts/test-m22-staff-proofs.sql"),
        "utf8",
      ),
    );
    result.proofStaged = true;
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261027150000_pipstart_m22_staff_governance_read.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(root, "apps/pipstart/scripts/test-m22-staff-governance.sql"),
        "utf8",
      ),
    );
    result.governanceStaged = true;
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261027180000_pipstart_m22_account_deletion_safety.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-account-deletion-safety.sql",
        ),
        "utf8",
      ),
    );
    result.deletionStaged = true;
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261027200000_pipstart_m22_account_operation_journal.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-account-operation-journal.sql",
        ),
        "utf8",
      ),
    );
    result.journalStaged = true;
    result.journalHead =
      sql(
        database,
        "select (not enabled) and version=0 and (select count(*)=0 from auth.users) and (select count(*)=0 from pipstart_staff_private.members) and (select count(*)=0 from pipstart_staff_private.audit) and (select count(*)=0 from pipstart_staff_private.account_operations) and (select count(*)=0 from pipstart_staff_private.account_operation_events) from pipstart_staff_private.control;",
      ) === "t";
    if (!result.journalHead)
      throw Error("Journal fixture rollback/head failed");
    console.log(
      "Journal behavior and atomic append rollback passed; empty/default-closed head verified.",
    );
    const target = crypto.randomUUID(),
      request = crypto.randomUUID();
    sql(
      database,
      `insert into auth.users(id,raw_user_meta_data) values('${target}','{"display_name":"Journal contention fixture"}');
      insert into pipstart_staff_private.members(user_id,active) values('${target}',false);
      select pipstart_staff_private.account_operation_prepare('${request}','${target}','auth_resume',null,null,'access_change',0);`,
    );
    const firstClaim = childSql(
      `set application_name='m22-journal-a-${runId}';begin;select 1 from pipstart_staff_private.control where singleton for update;select 'M22_JOURNAL_LOCKED';select pg_sleep(5);select pipstart_staff_private.account_operation_claim('${request}');commit;`,
    );
    await waitFor(
      () => firstClaim.output().includes("M22_JOURNAL_LOCKED"),
      8000,
    );
    const secondClaim = childSql(
      `set application_name='m22-journal-b-${runId}';begin;select pipstart_staff_private.account_operation_claim('${request}');commit;`,
    );
    await waitFor(
      () =>
        sql(
          database,
          `select exists(select 1 from pg_stat_activity where datname=current_database() and application_name='m22-journal-b-${runId}' and wait_event_type='Lock');`,
        ) === "t",
      3500,
    );
    result.journalRaceBlocked = true;
    const [claimed, refused] = await Promise.all([
      firstClaim.done,
      secondClaim.done,
    ]);
    result.journalSinglePermit =
      claimed.code === 0 &&
      refused.code === 0 &&
      claimed.output.includes("dispatch_authorized") &&
      refused.output.includes("not_dispatchable") &&
      !refused.output.includes("dispatch_id") &&
      sql(
        database,
        "select count(*) from pipstart_staff_private.account_operation_events where status='dispatched';",
      ) === "1";
    if (!result.journalSinglePermit)
      throw Error("Journal single-dispatch contention failed");
    sql(
      database,
      `select pipstart_staff_private.account_operation_result(request_id,dispatch_id,'failed') from pipstart_staff_private.account_operations where request_id='${request}';`,
    );
    result.journalClosed =
      sql(
        database,
        "select (not enabled) and version=0 and not exists(select 1 from pipstart_staff_private.account_operations where status in ('prepared','dispatched','unknown')) from pipstart_staff_private.control;",
      ) === "t";
    if (!result.journalClosed)
      throw Error("Final journal/control close failed");
    sql(
      database,
      "alter table auth.users add column banned_until timestamptz;",
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261027210000_pipstart_m22_account_provider_bridge.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-account-provider-bridge.sql",
        ),
        "utf8",
      ),
    );
    result.bridgeInputs = [
      {
        path: "supabase/migrations/20261027210000_pipstart_m22_account_provider_bridge.sql",
        sha256:
          "1758d9961cc3c9a647ce02ac2052ccc0d11757b4ae073b8ba7835544630cb1f5",
      },
      {
        path: "apps/pipstart/scripts/test-m22-account-provider-bridge.sql",
        sha256:
          "ca155be8fa98ebf4576575680dbc0b239f664959a0e4964460975722aabef759",
      },
    ];
    result.bridgeStaged = true;
    result.bridgeHead =
      sql(
        database,
        "select (not enabled) and version=0 and (select count(*)=0 from pipstart_staff_private.receipts) and (select count(*)=0 from pipstart_staff_private.proof_uses) and (select count(*)=1 from pipstart_staff_private.members) and (select count(*)=1 from pipstart_staff_private.account_operations) and not exists(select 1 from pipstart_staff_private.account_operations where status in ('prepared','dispatched','unknown')) and has_function_privilege('authenticated','public.pipstart_staff_account_receipt(uuid,text,text)','EXECUTE') and not has_function_privilege('service_role','public.pipstart_staff_account_receipt(uuid,text,text)','EXECUTE') and not has_function_privilege('authenticated','pipstart_staff_private.account_operation_take(uuid,text,text)','EXECUTE') from pipstart_staff_private.control;",
      ) === "t";
    if (!result.bridgeHead)
      throw Error("Bridge rollback/head/grant verification failed");
    sql(database, "alter table auth.users add column deleted_at timestamptz;");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261027220000_pipstart_m22_staff_retirement.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(root, "apps/pipstart/scripts/test-m22-staff-retirement.sql"),
        "utf8",
      ),
    );
    result.retirementStaged = true;
    result.retirementHead =
      sql(
        database,
        "select (not enabled) and version=0 and (select count(*)=1 from pipstart_staff_private.members) and (select count(*)=0 from auth.users where deleted_at is not null) and not exists(select 1 from pipstart_staff_private.account_operations where status in ('prepared','dispatched','unknown')) from pipstart_staff_private.control;",
      ) === "t";
    if (!result.retirementHead)
      throw Error("Retirement rollback/head check failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261028120000_pipstart_m22_learner_account_intents.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-learner-account-intents.sql",
        ),
        "utf8",
      ),
    );
    result.learnerStaged = true;
    result.learnerHead =
      sql(
        database,
        "select not enabled and (select count(*)=0 from pipstart_staff_private.learner_requests) and (select count(*)=0 from pipstart_staff_private.learner_request_events) from pipstart_staff_private.control;",
      ) === "t";
    if (!result.learnerHead) throw Error("Learner intent rollback/head failed");
    const learnerActor = crypto.randomUUID(),
      learnerTarget = crypto.randomUUID(),
      learnerSession = crypto.randomUUID(),
      learnerFactor = crypto.randomUUID(),
      learnerAmr = crypto.randomUUID(),
      learnerRequest = crypto.randomUUID(),
      learnerToken = crypto.randomBytes(32).toString("hex");
    const learnerStamp = Number(
      sql(
        database,
        "select floor(extract(epoch from clock_timestamp()-interval '60 seconds'))::bigint;",
      ),
    );
    if (!Number.isSafeInteger(learnerStamp))
      throw Error("Invalid fixture AMR second");
    const learnerClaims = JSON.stringify({
      sub: learnerActor,
      session_id: learnerSession,
      role: "authenticated",
      aal: "aal2",
      amr: [{ method: "totp", timestamp: learnerStamp }],
    });
    const learnerContext = `set local role authenticated;select set_config('request.jwt.claims','${learnerClaims}',true);`;
    sql(
      database,
      `insert into auth.users(id,raw_user_meta_data) values('${learnerActor}','{"display_name":"Learner contention staff fixture"}'),('${learnerTarget}','{"display_name":"Learner contention target fixture"}');
    insert into pipstart_staff_private.members(user_id) values('${learnerActor}');insert into pipstart_staff_private.roles values('${learnerActor}','owner');
    insert into auth.mfa_factors(id,user_id,factor_type,status) values('${learnerFactor}','${learnerActor}','totp','verified');
    insert into auth.sessions(id,user_id,factor_id,aal) values('${learnerSession}','${learnerActor}','${learnerFactor}','aal2');
    insert into auth.mfa_amr_claims(id,session_id,authentication_method,updated_at) values('${learnerAmr}','${learnerSession}','totp',to_timestamp(${learnerStamp}));
    update pipstart_staff_private.control set enabled=true;
    begin;${learnerContext}select public.pipstart_staff_learner_receipt('${learnerRequest}','${learnerTarget}','auth_resume',null,'access_change','${learnerToken}');commit;`,
    );
    const learnerCommand = `select public.pipstart_staff_learner_prepare('${learnerRequest}','${learnerTarget}','auth_resume',null,'access_change','${learnerToken}');`;
    const learnerFirst = childSql(
      `set application_name='m22-learner-a-${runId}';begin;select 1 from pipstart_staff_private.control where singleton for update;select 'M22_LEARNER_LOCKED';select pg_sleep(5);${learnerContext}${learnerCommand}commit;`,
    );
    await waitFor(
      () => learnerFirst.output().includes("M22_LEARNER_LOCKED"),
      8000,
    );
    const learnerSecond = childSql(
      `set application_name='m22-learner-b-${runId}';begin;${learnerContext}${learnerCommand}commit;`,
    );
    await waitFor(
      () =>
        sql(
          database,
          `select exists(select 1 from pg_stat_activity where datname=current_database() and application_name='m22-learner-b-${runId}' and wait_event_type='Lock');`,
        ) === "t",
      3500,
    );
    result.learnerRaceBlocked = true;
    const [learnerA, learnerB] = await Promise.all([
      learnerFirst.done,
      learnerSecond.done,
    ]);
    result.learnerSingleIntent =
      learnerA.code === 0 &&
      learnerB.code === 0 &&
      learnerA.output.includes("intent_recorded") &&
      learnerB.output.includes("intent_recorded") &&
      sql(
        database,
        "select (select count(*)=1 from pipstart_staff_private.learner_requests) and (select count(*)=1 from pipstart_staff_private.learner_request_events);",
      ) === "t";
    if (!result.learnerSingleIntent)
      throw Error("Learner request observed contention/single intent failed");
    sql(database, "update pipstart_staff_private.control set enabled=false;");
    result.learnerFinalClosed =
      sql(
        database,
        "select not enabled from pipstart_staff_private.control;",
      ) === "t";
    if (!result.learnerFinalClosed)
      throw Error("Learner fixture final control not paused");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261028150000_pipstart_m22_learner_provider_bridge.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-learner-provider-bridge.sql",
        ),
        "utf8",
      ),
    );
    result.learnerProviderStaged = true;
    result.learnerProviderHead =
      sql(
        database,
        "select not enabled and (select count(*)=0 from pipstart_staff_private.learner_deliveries) and (select count(*)=0 from pipstart_staff_private.learner_provider_permits) and (select count(*)=0 from pipstart_staff_private.learner_provider_events) from pipstart_staff_private.control;",
      ) === "t";
    if (!result.learnerProviderHead)
      throw Error("Learner provider rollback/head failed");
    sql(database, "update pipstart_staff_private.control set enabled=true;");
    const userGrant = JSON.parse(
      sql(
        database,
        `begin;${learnerContext}select public.pipstart_staff_learner_claim('${learnerRequest}','dispatch','${learnerToken}');commit;`,
      )
        .split(/\r?\n/)
        .at(-1),
    );
    if (
      userGrant.request_id !== learnerRequest ||
      userGrant.status !== "execution_permitted" ||
      typeof userGrant.dispatch_id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        userGrant.dispatch_id,
      ) ||
      typeof userGrant.permit !== "string" ||
      !/^[0-9a-f]{64}$/.test(userGrant.permit)
    )
      throw Error("Invalid fixture execution permit");
    const providerTake = `select public.pipstart_staff_learner_provider_take('${learnerRequest}','${userGrant.dispatch_id}','${userGrant.permit}');`;
    const providerFirst = childSql(
      `set application_name='m22-provider-a-${runId}';begin;select 1 from pipstart_staff_private.control where singleton for update;select 'M22_PROVIDER_LOCKED';select pg_sleep(5);set local role service_role;${providerTake}commit;`,
    );
    await waitFor(
      () => providerFirst.output().includes("M22_PROVIDER_LOCKED"),
      8000,
    );
    const providerSecond = childSql(
      `set application_name='m22-provider-b-${runId}';begin;set local role service_role;${providerTake}commit;`,
    );
    await waitFor(
      () =>
        sql(
          database,
          `select exists(select 1 from pg_stat_activity where datname=current_database() and application_name='m22-provider-b-${runId}' and wait_event_type='Lock');`,
        ) === "t",
      3500,
    );
    result.learnerProviderRaceBlocked = true;
    const [providerWinner, providerRefused] = await Promise.all([
      providerFirst.done,
      providerSecond.done,
    ]);
    result.learnerProviderSinglePermit =
      providerWinner.code === 0 &&
      providerWinner.output.includes("dispatch_authorized") &&
      providerRefused.code !== 0 &&
      providerRefused.errors.includes("42501") &&
      sql(
        database,
        "select count(*)=1 from pipstart_staff_private.learner_provider_events where event='dispatched';",
      ) === "t";
    if (!result.learnerProviderSinglePermit)
      throw Error(
        "Learner provider observed contention/single executable permit failed",
      );
    sql(
      database,
      `begin;set local role service_role;select public.pipstart_staff_learner_provider_result('${learnerRequest}','${userGrant.dispatch_id}','${userGrant.permit}','unknown');commit;
    update pipstart_staff_private.control set enabled=false;select pipstart_staff_private.learner_delivery_review('${learnerRequest}','${userGrant.dispatch_id}','observed_other');`,
    );
    result.learnerProviderFinalClosed =
      sql(
        database,
        "select not enabled and not exists(select 1 from pipstart_staff_private.learner_deliveries where state in ('prepared','dispatched','unknown')) from pipstart_staff_private.control;",
      ) === "t";
    if (!result.learnerProviderFinalClosed)
      throw Error("Learner provider final paused head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261028180000_pipstart_m22_staff_maintenance_transport.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(root, "apps/pipstart/scripts/test-m22-staff-maintenance.sql"),
        "utf8",
      ),
    );
    result.maintenanceStaged = true;
    result.maintenanceHead =
      sql(
        database,
        "select not enabled and (select count(*)=0 from pipstart_staff_private.maintenance_permits) from pipstart_staff_private.control;",
      ) === "t";
    if (!result.maintenanceHead)
      throw Error("Maintenance rollback/default-closed head failed");
    const maintenanceTarget = crypto.randomUUID(),
      maintenanceRequest = crypto.randomUUID(),
      maintenanceToken = crypto.randomBytes(32).toString("hex");
    const maintenanceStamp = Number(
      sql(
        database,
        "select floor(extract(epoch from clock_timestamp()-interval '30 seconds'))::bigint;",
      ),
    );
    if (
      !Number.isSafeInteger(maintenanceStamp) ||
      maintenanceStamp === learnerStamp
    )
      throw Error("Invalid fixture maintenance AMR second");
    const maintenanceContext = `set local role authenticated;select set_config('request.jwt.claims','${JSON.stringify({ sub: learnerActor, session_id: learnerSession, role: "authenticated", aal: "aal2", amr: [{ method: "totp", timestamp: maintenanceStamp }] })}',true);`;
    const maintenanceGrant = JSON.parse(
      sql(
        database,
        `insert into auth.users(id,raw_user_meta_data) values('${maintenanceTarget}','{"display_name":"Maintenance contention target fixture"}');
      insert into pipstart_staff_private.members(user_id) values('${maintenanceTarget}');
      select pipstart_staff_private.account_operation_prepare('${maintenanceRequest}','${maintenanceTarget}','auth_resume',null,null,'access_change',(select version from pipstart_staff_private.control where singleton));
      update auth.mfa_amr_claims set updated_at=to_timestamp(${maintenanceStamp}) where session_id='${learnerSession}' and authentication_method='totp';
      begin;${maintenanceContext}select public.pipstart_staff_account_receipt('${maintenanceRequest}','dispatch','${maintenanceToken}');select public.pipstart_staff_maintenance_claim('${maintenanceRequest}','dispatch','${maintenanceToken}');commit;`,
      )
        .split(/\r?\n/)
        .at(-1),
    );
    if (
      maintenanceGrant.request_id !== maintenanceRequest ||
      maintenanceGrant.status !== "execution_permitted" ||
      typeof maintenanceGrant.permit_id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        maintenanceGrant.permit_id,
      ) ||
      typeof maintenanceGrant.permit !== "string" ||
      !/^[0-9a-f]{64}$/.test(maintenanceGrant.permit)
    )
      throw Error("Invalid fixture maintenance permit");
    const maintenanceTake = `select set_config('request.jwt.claims','{"role":"service_role"}',true);select public.pipstart_staff_maintenance_take('${maintenanceRequest}','${maintenanceGrant.permit_id}','${maintenanceGrant.permit}','${maintenanceToken}');`;
    const maintenanceFirst = childSql(
      `set application_name='m22-maintenance-a-${runId}';begin;select 1 from pipstart_staff_private.control where singleton for update;select 'M22_MAINTENANCE_LOCKED';select pg_sleep(5);set local role service_role;${maintenanceTake}commit;`,
    );
    await waitFor(
      () => maintenanceFirst.output().includes("M22_MAINTENANCE_LOCKED"),
      8000,
    );
    const maintenanceSecond = childSql(
      `set application_name='m22-maintenance-b-${runId}';begin;set local role service_role;${maintenanceTake}commit;`,
    );
    await waitFor(
      () =>
        sql(
          database,
          `select exists(select 1 from pg_stat_activity where datname=current_database() and application_name='m22-maintenance-b-${runId}' and wait_event_type='Lock');`,
        ) === "t",
      3500,
    );
    result.maintenanceRaceBlocked = true;
    const [maintenanceWinner, maintenanceRefused] = await Promise.all([
      maintenanceFirst.done,
      maintenanceSecond.done,
    ]);
    result.maintenanceSinglePermit =
      maintenanceWinner.code === 0 &&
      maintenanceWinner.output.includes("dispatch_authorized") &&
      maintenanceRefused.code !== 0 &&
      maintenanceRefused.errors.includes("42501") &&
      sql(
        database,
        `select (select count(*)=1 from pipstart_staff_private.account_operation_events where request_id='${maintenanceRequest}' and status='dispatched') and (select count(*)=1 from pipstart_staff_private.maintenance_permits where request_id='${maintenanceRequest}' and consumed_at is not null and dispatch_id is not null);`,
      ) === "t";
    if (!result.maintenanceSinglePermit)
      throw Error(
        "Maintenance observed contention/single executable permit failed",
      );
    const maintenanceDispatch = sql(
      database,
      `select dispatch_id from pipstart_staff_private.maintenance_permits where id='${maintenanceGrant.permit_id}';`,
    );
    sql(
      database,
      `begin;set local role service_role;select set_config('request.jwt.claims','{"role":"service_role"}',true);select public.pipstart_staff_maintenance_result('${maintenanceRequest}','${maintenanceGrant.permit_id}','${maintenanceGrant.permit}','${maintenanceDispatch}','succeeded');commit;`,
    );
    result.maintenanceFinalClosed =
      sql(
        database,
        "select not enabled and not exists(select 1 from pipstart_staff_private.account_operations where status in ('prepared','dispatched','unknown')) and not exists(select 1 from pipstart_staff_private.maintenance_permits where consumed_at is null) from pipstart_staff_private.control;",
      ) === "t";
    if (!result.maintenanceFinalClosed)
      throw Error("Maintenance final paused/resolved head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261029090000_pipstart_m22_staff_enrolment_gate.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-staff-enrolment-gate.sql",
        ),
        "utf8",
      ),
    );
    result.enrolmentStaged = true;
    result.enrolmentHead =
      sql(
        database,
        "select not enabled and has_function_privilege('authenticated','public.pipstart_staff_enrolment_allowed()','EXECUTE') and not has_function_privilege('anon','public.pipstart_staff_enrolment_allowed()','EXECUTE') and not has_function_privilege('service_role','public.pipstart_staff_enrolment_allowed()','EXECUTE') and not exists(select 1 from auth.users where id::text like 'e1000000-%') from pipstart_staff_private.control;",
      ) === "t";
    if (!result.enrolmentHead)
      throw Error("Enrolment gate rollback/grant/head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261030090000_pipstart_m22_editorial_store.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(root, "apps/pipstart/scripts/test-m22-editorial-store.sql"),
        "utf8",
      ),
    );
    result.editorialStaged = true;
    result.editorialHead =
      sql(
        database,
        "select not enabled and (select not require_review and version=0 from pipstart_editorial_private.policy) and not exists(select 1 from pipstart_editorial_private.items) and not exists(select 1 from pipstart_editorial_private.revisions) and not exists(select 1 from pipstart_editorial_private.audit) and has_function_privilege('authenticated','public.pipstart_editorial_save(text,integer,jsonb,text)','EXECUTE') and not has_function_privilege('anon','public.pipstart_editorial_save(text,integer,jsonb,text)','EXECUTE') and not has_schema_privilege('authenticated','pipstart_editorial_private','USAGE') and not exists(select 1 from auth.users where id::text like 'f4000000-%') from pipstart_staff_private.control;",
      ) === "t";
    if (!result.editorialHead)
      throw Error("Editorial store rollback/grant/head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261031090000_pipstart_m22_editorial_import.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(root, "apps/pipstart/scripts/test-m22-editorial-import.sql"),
        "utf8",
      ),
    );
    result.importStaged = true;
    result.importHead =
      sql(
        database,
        "select not exists(select 1 from pipstart_editorial_private.imports) and not exists(select 1 from pipstart_editorial_private.items) and not exists(select 1 from pipstart_editorial_private.decisions) and not has_function_privilege('authenticated','pipstart_editorial_private.import_item(text,text,text,text,jsonb,text,text)','EXECUTE') and not has_function_privilege('service_role','pipstart_editorial_private.import_item(text,text,text,text,jsonb,text,text)','EXECUTE') and not has_table_privilege('authenticated','pipstart_editorial_private.imports','SELECT') and not exists(select 1 from auth.users where id::text like 'f8000000-%');",
      ) === "t";
    if (!result.importHead)
      throw Error("Editorial import rollback/grant/head failed");
    cleanup();
    result.passed =
      result.staged &&
      result.head &&
      result.raceBlocked &&
      result.race &&
      result.cleanup &&
      result.proofStaged &&
      result.journalStaged &&
      result.journalHead &&
      result.journalRaceBlocked &&
      result.journalSinglePermit &&
      result.journalClosed &&
      result.bridgeStaged &&
      result.bridgeHead &&
      result.retirementStaged &&
      result.retirementHead &&
      result.governanceStaged &&
      result.deletionStaged &&
      result.learnerStaged &&
      result.learnerHead &&
      result.learnerRaceBlocked &&
      result.learnerSingleIntent &&
      result.learnerFinalClosed &&
      result.learnerProviderStaged &&
      result.learnerProviderHead &&
      result.learnerProviderRaceBlocked &&
      result.learnerProviderSinglePermit &&
      result.learnerProviderFinalClosed &&
      result.maintenanceStaged &&
      result.maintenanceHead &&
      result.maintenanceRaceBlocked &&
      result.maintenanceSinglePermit &&
      result.maintenanceFinalClosed &&
      result.enrolmentStaged &&
      result.enrolmentHead &&
      result.editorialStaged &&
      result.editorialHead &&
      result.importStaged &&
      result.importHead;
    console.log(
      "MP03 CONSOLIDATED SQL ACCEPTANCE PASSED: behavioral/rollback/head gates and observed two-session single-dispatch contention. SQL Auth stubs only; no provider execution or live recovery acceptance.",
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
