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
  "supabase/migrations/20261102090000_pipstart_m22_editorial_revision_read.sql",
  "apps/pipstart/scripts/test-m22-editorial-revision-read.sql",
  "supabase/migrations/20261105090000_pipstart_m22_editorial_publication_sources.sql",
  "apps/pipstart/scripts/test-m22-editorial-publication-sources.sql",
  "supabase/migrations/20261106090000_pipstart_m22_quiz_versions.sql",
  "apps/pipstart/scripts/test-m22-editorial-quiz-versions.sql",
  "supabase/migrations/20261107090000_pipstart_m22_publication_store.sql",
  "apps/pipstart/scripts/test-m22-publication-store.sql",
  "supabase/migrations/20261107120000_pipstart_m22_publication_schedules.sql",
  "apps/pipstart/scripts/test-m22-publication-schedules.sql",
  "supabase/migrations/20261107150000_pipstart_m22_publication_scheduler.sql",
  "apps/pipstart/scripts/test-m22-publication-scheduler.sql",
  "supabase/migrations/20261112190000_pipstart_m22_publication_verify_observed.sql",
  "apps/pipstart/scripts/test-m22-publication-verify-observed.sql",
  "supabase/migrations/20261116090000_pipstart_m22_partner_store.sql",
  "apps/pipstart/scripts/test-m22-partner-store.sql",
  "supabase/migrations/20261116120000_pipstart_m22_partner_snapshot.sql",
  "apps/pipstart/scripts/test-m22-partner-snapshot.sql",
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
    revisionReadStaged: false,
    revisionReadHead: false,
    publicationSourcesStaged: false,
    publicationSourcesHead: false,
    quizVersionsStaged: false,
    quizVersionsHead: false,
    publicationStaged: false,
    publicationHead: false,
    publicationRaceBlocked: false,
    publicationSingleWinner: false,
    publicationReplaySingle: false,
    partnerStoreStaged: false,
    partnerStoreHead: false,
    partnerSnapshotContinuity: false,
    partnerSnapshotStaged: false,
    partnerSnapshotHead: false,
    schedulerStaged: false,
    schedulerHead: false,
    schedulerOverlap: false,
    schedulerTickWins: false,
    schedulerCancelWins: false,
    schedulerRevokeBlocked: false,
    schedulerRevoked: false,
    schedulerDeliverySingle: false,
    publicationSchedulesStaged: false,
    publicationSchedulesHead: false,
    scheduleCreateBlocked: false,
    scheduleCreateSingle: false,
    scheduleCancelBlocked: false,
    scheduleCancelSingle: false,
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
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261102090000_pipstart_m22_editorial_revision_read.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-editorial-revision-read.sql",
        ),
        "utf8",
      ),
    );
    result.revisionReadStaged = true;
    result.revisionReadHead =
      sql(
        database,
        "select not exists(select 1 from pipstart_editorial_private.items) and not exists(select 1 from pipstart_editorial_private.revisions) and has_function_privilege('authenticated','public.pipstart_editorial_revision(text,integer)','EXECUTE') and not has_function_privilege('anon','public.pipstart_editorial_history(text,integer,integer)','EXECUTE') and not has_function_privilege('service_role','public.pipstart_editorial_revision(text,integer)','EXECUTE') and not exists(select 1 from auth.users where id::text like 'fa000000-%');",
      ) === "t";
    if (!result.revisionReadHead)
      throw Error("Editorial revision read rollback/grant/head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261105090000_pipstart_m22_editorial_publication_sources.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-editorial-publication-sources.sql",
        ),
        "utf8",
      ),
    );
    result.publicationSourcesStaged = true;
    result.publicationSourcesHead =
      sql(
        database,
        "select not exists(select 1 from pipstart_editorial_private.items) and not exists(select 1 from pipstart_editorial_private.decisions) and has_function_privilege('authenticated','public.pipstart_editorial_submit(text,integer,text)','EXECUTE') and not has_function_privilege('authenticated','pipstart_editorial_private.publication_sources_ok(text,jsonb)','EXECUTE') and not has_function_privilege('service_role','public.pipstart_editorial_approve_single_person(text,integer,text,text)','EXECUTE') and not exists(select 1 from auth.users where id::text like 'fb000000-%');",
      ) === "t";
    if (!result.publicationSourcesHead)
      throw Error("Editorial publication sources rollback/grant/head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261106090000_pipstart_m22_quiz_versions.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-editorial-quiz-versions.sql",
        ),
        "utf8",
      ),
    );
    result.quizVersionsStaged = true;
    result.quizVersionsHead =
      sql(
        database,
        "select not exists(select 1 from pipstart_editorial_private.items) and not exists(select 1 from pipstart_editorial_private.decisions) and has_function_privilege('authenticated','public.pipstart_editorial_save(text,integer,jsonb,text)','EXECUTE') and not has_function_privilege('authenticated','pipstart_editorial_private.quiz_decision_ok(text,integer)','EXECUTE') and not exists(select 1 from auth.users where id::text like 'fc000000-%');",
      ) === "t";
    if (!result.quizVersionsHead)
      throw Error("Editorial quiz versions rollback/grant/head failed");

    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261107090000_pipstart_m22_publication_store.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(root, "apps/pipstart/scripts/test-m22-publication-store.sql"),
        "utf8",
      ),
    );
    result.publicationStaged = true;
    result.publicationHead =
      sql(
        database,
        "select (select generation from pipstart_editorial_private.publication_pointer) is null and not exists(select 1 from pipstart_editorial_private.generations) and not exists(select 1 from pipstart_editorial_private.refresh_jobs) and not exists(select 1 from pipstart_editorial_private.items) and has_function_privilege('authenticated','public.pipstart_publication_publish(uuid,bigint,text,integer,text,text)','EXECUTE') and not has_function_privilege('authenticated','public.pipstart_publication_snapshot()','EXECUTE') and has_function_privilege('service_role','public.pipstart_publication_snapshot()','EXECUTE') and not has_function_privilege('anon','public.pipstart_publication_status(text)','EXECUTE') and not exists(select 1 from auth.users where id::text like 'fe000000-%');",
      ) === "t";
    if (!result.publicationHead)
      throw Error("Publication store rollback/grant/head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261107120000_pipstart_m22_publication_schedules.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-publication-schedules.sql",
        ),
        "utf8",
      ),
    );
    result.publicationSchedulesStaged = true;
    result.publicationSchedulesHead =
      sql(
        database,
        "select (select count(*) from pipstart_editorial_private.publication_scheduler_control)=1 and exists(select 1 from pipstart_editorial_private.publication_scheduler_control where singleton and not enabled and version=0) and not exists(select 1 from pipstart_editorial_private.publication_schedules) and not exists(select 1 from pipstart_editorial_private.publication_schedule_events) and (select generation from pipstart_editorial_private.publication_pointer) is null and not exists(select 1 from auth.users where id::text like 'ed800000-%');",
      ) === "t";
    if (!result.publicationSchedulesHead)
      throw Error("Schedule rollback/default-off head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261107150000_pipstart_m22_publication_scheduler.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-publication-scheduler.sql",
        ),
        "utf8",
      ),
    );
    result.schedulerStaged = true;
    result.schedulerHead =
      sql(
        database,
        "select not exists(select 1 from pipstart_editorial_private.publication_scheduler_deliveries) and not exists(select 1 from pipstart_editorial_private.publication_schedules) and not exists(select 1 from pipstart_editorial_private.publication_scheduler_control where enabled) and not exists(select 1 from pipstart_editorial_private.generations) and exists(select 1 from pg_roles where rolname='pipstart_publication_scheduler' and not rolcanlogin and not rolsuper and not rolbypassrls) and not has_function_privilege('authenticated','pipstart_editorial_private.scheduler_tick()','execute');",
      ) === "t";
    if (!result.schedulerHead)
      throw Error("Restricted scheduler default-closed/head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261112190000_pipstart_m22_publication_verify_observed.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "apps/pipstart/scripts/test-m22-publication-verify-observed.sql",
        ),
        "utf8",
      ),
    );
    result.observedVerificationStaged = true;
    result.observedVerificationHead =
      sql(
        database,
        "select (select generation from pipstart_editorial_private.publication_pointer) is null and not exists(select 1 from pipstart_editorial_private.refresh_jobs) and not exists(select 1 from pipstart_editorial_private.publication_scheduler_deliveries) and not exists(select 1 from auth.users where id='ee910000-0000-4000-8000-000000000001') and has_function_privilege('service_role','public.pipstart_publication_verify_observed(bigint,text,text,integer)','execute') and not has_function_privilege('authenticated','public.pipstart_publication_verify_observed(bigint,text,text,integer)','execute');",
      ) === "t";
    if (!result.observedVerificationHead)
      throw Error("Observed verification rollback/grant/head failed");
    sql(
      database,
      fs.readFileSync(
        path.join(
          root,
          "supabase/migrations/20261116090000_pipstart_m22_partner_store.sql",
        ),
        "utf8",
      ),
    );
    sql(
      database,
      fs.readFileSync(
        path.join(root, "apps/pipstart/scripts/test-m22-partner-store.sql"),
        "utf8",
      ),
    );
    result.partnerStoreStaged = true;
    result.partnerStoreHead =
      sql(
        database,
        "select not exists(select 1 from pipstart_editorial_private.partner_policies) and not exists(select 1 from pipstart_editorial_private.generation_partner_policies) and not exists(select 1 from pipstart_editorial_private.items where family in ('partner','link')) and (select generation from pipstart_editorial_private.publication_pointer) is null and not exists(select 1 from auth.users where id::text like 'fd000000-%') and has_function_privilege('authenticated','public.pipstart_partner_policy_set(text,text,integer,jsonb,text)','execute') and not has_function_privilege('anon','public.pipstart_partner_policy_set(text,text,integer,jsonb,text)','execute') and not has_function_privilege('service_role','public.pipstart_partner_policy(text)','execute') and not has_function_privilege('authenticated','pipstart_editorial_private.allowed(text,text,text)','execute');",
      ) === "t";
    if (!result.partnerStoreHead)
      throw Error("Partner store rollback/grant/head failed");
    // Seal continuity: content sealed by the previous snapshot function must still verify after the
    // MP09b redefinition. One transaction, rolled back; the migration's own begin/commit are removed.
    const partnerSnapshotSource = fs.readFileSync(
      path.join(
        root,
        "supabase/migrations/20261116120000_pipstart_m22_partner_snapshot.sql",
      ),
      "utf8",
    );
    const partnerSnapshotBody = partnerSnapshotSource
      .replace(/\r/g, "")
      .replace(/^begin;$/m, "")
      .replace(/^commit;\s*$/m, "");
    result.partnerSnapshotContinuity =
      sql(
        database,
        `begin;
        update pipstart_staff_private.members set active=false where active;
        insert into auth.users(id,raw_user_meta_data) values('fa000000-0000-4000-8000-000000000001','{}');
        insert into auth.mfa_factors(id,user_id,factor_type,status) values('fa100000-0000-4000-8000-000000000001','fa000000-0000-4000-8000-000000000001','totp','verified');
        insert into auth.sessions(id,user_id,factor_id,aal) values('fa200000-0000-4000-8000-000000000001','fa000000-0000-4000-8000-000000000001','fa100000-0000-4000-8000-000000000001','aal2');
        insert into pipstart_staff_private.members(user_id) values('fa000000-0000-4000-8000-000000000001');
        insert into pipstart_staff_private.roles values('fa000000-0000-4000-8000-000000000001','owner');
        select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
        set local role authenticated;
        select set_config('request.jwt.claims','{"sub":"fa000000-0000-4000-8000-000000000001","session_id":"fa200000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2","user_metadata":{"role":"owner"}}',true);
        select public.pipstart_editorial_approve_single_person(x.id,1,(public.pipstart_editorial_create(x.id,x.family,x.path,x.parent,x.body::jsonb,'continuity'))->>'body_sha256',null)
          from (values (1,'sc-course','course','forex',null,'{"metadata":{"title":"Course","placement":{"order":1}}}'),
            (2,'sc-module','module','forex','sc-course','{"metadata":{"title":"Module","placement":{"order":1}}}'),
            (3,'sc-quiz','quiz','forex','sc-module','{"metadata":{"title":"Quiz","version":1,"placement":{"order":1}},"questions":[{"id":"q1","choices":[{"id":"a"},{"id":"b"}],"correctChoiceIds":["a"]}]}'),
            (4,'sc-post','analysis',null,null,'{"metadata":{"title":"Post","category":"technical","excerpt":"Short"},"paragraphs":["Text"]}')) x(n,id,family,path,parent,body) order by x.n;
        select public.pipstart_publication_baseline('fa900000-0000-4000-8000-000000000001','Continuity baseline');
        reset role;
        ${partnerSnapshotBody}
        set local role service_role;
        select (public.pipstart_publication_snapshot())->>'generation'='1' and not ((public.pipstart_publication_snapshot())->'snapshot' ? 'partners');
        rollback;`,
      )
        .split(/\r?\n/)
        .filter(Boolean)
        .at(-1) === "t";
    if (!result.partnerSnapshotContinuity)
      throw Error("Partner snapshot changed an earlier generation's seal");
    sql(database, partnerSnapshotSource);
    sql(
      database,
      fs.readFileSync(
        path.join(root, "apps/pipstart/scripts/test-m22-partner-snapshot.sql"),
        "utf8",
      ),
    );
    result.partnerSnapshotStaged = true;
    result.partnerSnapshotHead =
      sql(
        database,
        "select (select generation from pipstart_editorial_private.publication_pointer) is null and not exists(select 1 from pipstart_editorial_private.partner_policies) and not exists(select 1 from auth.users where id::text like 'fc000000-%' or id::text like 'fa000000-%') and to_regprocedure('pipstart_editorial_private.partner_snapshot(bigint)') is not null and not has_function_privilege('service_role','pipstart_editorial_private.partner_snapshot(bigint)','execute');",
      ) === "t";
    if (!result.partnerSnapshotHead)
      throw Error("Partner snapshot rollback/grant/head failed");
    // Two sessions racing on the live generation: the pointer lock picks one winner; the loser
    // waits, then refuses as stale. The same operation identity from two sessions publishes once.
    sql(
      database,
      `update pipstart_staff_private.members set active=false where active;
      insert into auth.users(id,raw_user_meta_data) values('ff000000-0000-4000-8000-000000000001','{}');
      insert into auth.mfa_factors(id,user_id,factor_type,status) values('ff100000-0000-4000-8000-000000000001','ff000000-0000-4000-8000-000000000001','totp','verified');
      insert into auth.sessions(id,user_id,factor_id,aal) values('ff200000-0000-4000-8000-000000000001','ff000000-0000-4000-8000-000000000001','ff100000-0000-4000-8000-000000000001','aal2');
      insert into pipstart_staff_private.members(user_id) values('ff000000-0000-4000-8000-000000000001');
      insert into pipstart_staff_private.roles values('ff000000-0000-4000-8000-000000000001','owner');
      select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
      begin;set local role authenticated;select set_config('request.jwt.claims','{"sub":"ff000000-0000-4000-8000-000000000001","session_id":"ff200000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2","user_metadata":{"role":"owner"}}',true);
      select public.pipstart_editorial_approve_single_person(x,1,(public.pipstart_editorial_create(x,'course','forex',null,jsonb_build_object('metadata',jsonb_build_object('title',x)),'race'))->>'body_sha256',null) from unnest(array['race-base']) x;
      select public.pipstart_publication_baseline('ff900000-0000-4000-8000-000000000001','race baseline');
      select public.pipstart_editorial_approve_single_person(x,1,(public.pipstart_editorial_create(x,'course','forex',null,jsonb_build_object('metadata',jsonb_build_object('title',x)),'race'))->>'body_sha256',null) from unnest(array['race-a','race-b','race-c']) x;
      commit;`,
    );
    const sha = (id) =>
      sql(
        database,
        `select body_sha256 from pipstart_editorial_private.revisions where item_id='${id}' and revision_no=1;`,
      );
    const publish = (op, expected, id) =>
      `select (public.pipstart_publication_publish('${op}',${expected},'${id}',1,'${sha(id)}','race'))->>'generation' as published;`;
    const pubA = childSql(
      `set application_name='m22-pub-a-${runId}';begin;set local role authenticated;select set_config('request.jwt.claims','{"sub":"ff000000-0000-4000-8000-000000000001","session_id":"ff200000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2","user_metadata":{"role":"owner"}}',true);${publish("ff900000-0000-4000-8000-000000000002", 1, "race-a")}select 'M22_PUB_LOCKED';select pg_sleep(4);commit;`,
    );
    // A barrier that is not observed reports the child session's own error.
    const barrier = async (check, ms, child, label) => {
      try {
        await waitFor(check, ms);
      } catch {
        const r = await child.done.catch((e) => ({
          output: "",
          errors: String(e),
        }));
        throw Error(
          "Publication race " +
            label +
            " not observed: " +
            String(r.errors || r.output).slice(-600),
        );
      }
    };
    await barrier(
      () => pubA.output().includes("M22_PUB_LOCKED"),
      8000,
      pubA,
      "session A lock",
    );
    const pubB = childSql(
      `set application_name='m22-pub-b-${runId}';begin;set local role authenticated;select set_config('request.jwt.claims','{"sub":"ff000000-0000-4000-8000-000000000001","session_id":"ff200000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2","user_metadata":{"role":"owner"}}',true);${publish("ff900000-0000-4000-8000-000000000003", 1, "race-b")}commit;`,
    );
    await waitFor(
      () =>
        sql(
          database,
          `select exists(select 1 from pg_stat_activity where datname=current_database() and application_name='m22-pub-b-${runId}' and wait_event_type='Lock');`,
        ) === "t",
      3500,
    );
    result.publicationRaceBlocked = true;
    const [won, lost] = await Promise.all([pubA.done, pubB.done]);
    result.publicationSingleWinner =
      won.code === 0 &&
      /^2$/m.test(won.output) &&
      lost.code !== 0 &&
      (lost.output + lost.errors).includes("A newer publication exists") &&
      sql(
        database,
        "select (select generation from pipstart_editorial_private.publication_pointer)=2 and (select count(*) from pipstart_editorial_private.generations)=2;",
      ) === "t";
    if (!result.publicationSingleWinner)
      throw Error(
        "Publication compare-and-set contention failed: " +
          JSON.stringify({
            won: [won.code, won.output.slice(-200), won.errors.slice(-300)],
            lost: [lost.code, lost.output.slice(-200), lost.errors.slice(-300)],
          }),
      );
    const again = (tag) =>
      childSql(
        `set application_name='m22-pub-${tag}-${runId}';begin;set local role authenticated;select set_config('request.jwt.claims','{"sub":"ff000000-0000-4000-8000-000000000001","session_id":"ff200000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2","user_metadata":{"role":"owner"}}',true);select (public.pipstart_publication_publish('ff900000-0000-4000-8000-000000000004',2,'race-c',1,'${sha("race-c")}','race'))::text;select 'M22_PUB_REPLAY';${tag === "c" ? "select pg_sleep(3);" : ""}commit;`,
      );
    const pubC = again("c");
    await barrier(
      () => pubC.output().includes("M22_PUB_REPLAY"),
      8000,
      pubC,
      "replay session",
    );
    const pubD = again("d");
    const [pubFirst, pubReplay] = await Promise.all([pubC.done, pubD.done]);
    result.publicationReplaySingle =
      pubFirst.code === 0 &&
      pubReplay.code === 0 &&
      pubFirst.output.includes('"replayed": false') &&
      pubReplay.output.includes('"replayed": true') &&
      sql(
        database,
        "select (select generation from pipstart_editorial_private.publication_pointer)=3 and (select count(*) from pipstart_editorial_private.generations)=3 and (select count(*) from pipstart_editorial_private.audit where operation='publish')=2;",
      ) === "t";
    if (!result.publicationReplaySingle)
      throw Error(
        "Publication operation replay contention failed: " +
          JSON.stringify({
            first: [
              pubFirst.code,
              pubFirst.output.slice(-300),
              pubFirst.errors.slice(-300),
            ],
            replay: [
              pubReplay.code,
              pubReplay.output.slice(-300),
              pubReplay.errors.slice(-300),
            ],
          }),
      );

    // Real two-session schedule/replay and cancel/replay. Only the existing generated race Owner.
    const scheduleDue = new Date(
        Math.ceil((Date.now() + 7200000) / 60000) * 60000,
      ).toISOString(),
      scheduleLocal = scheduleDue.slice(0, 16);
    const scheduleAuth = `begin;set local role authenticated;select set_config('request.jwt.claims','{"sub":"ff000000-0000-4000-8000-000000000001","session_id":"ff200000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',true);`;
    const scheduleCall = `select (public.pipstart_publication_schedule('ff990000-0000-4000-8000-000000000001',3,'withdraw','race-c',null,null,'${scheduleLocal}','UTC','${scheduleDue}','Generated concurrent schedule'))->>'state';`;
    const scheduleA = childSql(
      `set application_name='m22-schedule-a-${runId}';${scheduleAuth}${scheduleCall}select 'M22_SCHEDULE_LOCKED';select pg_sleep(4);commit;`,
    );
    await barrier(
      () => scheduleA.output().includes("M22_SCHEDULE_LOCKED"),
      8000,
      scheduleA,
      "schedule request",
    );
    const scheduleB = childSql(
      `set application_name='m22-schedule-b-${runId}';${scheduleAuth}${scheduleCall}commit;`,
    );
    await waitFor(
      () =>
        sql(
          database,
          `select exists(select 1 from pg_stat_activity where datname=current_database() and application_name='m22-schedule-b-${runId}' and wait_event_type='Lock');`,
        ) === "t",
      3500,
    );
    result.scheduleCreateBlocked = true;
    const scheduleReplies = await Promise.all([scheduleA.done, scheduleB.done]);
    result.scheduleCreateSingle =
      scheduleReplies.every(
        (r) => r.code === 0 && /^scheduled$/m.test(r.output),
      ) &&
      sql(
        database,
        "select (select count(*) from pipstart_editorial_private.publication_schedules)=1 and (select count(*) from pipstart_editorial_private.publication_schedule_events)=1 and (select generation from pipstart_editorial_private.publication_pointer)=3;",
      ) === "t";
    if (!result.scheduleCreateSingle)
      throw Error(
        "Schedule identity contention did not produce one durable request/event",
      );
    const cancelCall =
      "select (public.pipstart_publication_cancel_schedule('ff990000-0000-4000-8000-000000000001','Generated concurrent cancel'))->>'state';";
    const cancelA = childSql(
      `set application_name='m22-cancel-a-${runId}';${scheduleAuth}${cancelCall}select 'M22_CANCEL_LOCKED';select pg_sleep(4);commit;`,
    );
    await barrier(
      () => cancelA.output().includes("M22_CANCEL_LOCKED"),
      8000,
      cancelA,
      "cancel request",
    );
    const cancelB = childSql(
      `set application_name='m22-cancel-b-${runId}';${scheduleAuth}${cancelCall}commit;`,
    );
    await waitFor(
      () =>
        sql(
          database,
          `select exists(select 1 from pg_stat_activity where datname=current_database() and application_name='m22-cancel-b-${runId}' and wait_event_type='Lock');`,
        ) === "t",
      3500,
    );
    result.scheduleCancelBlocked = true;
    const cancelReplies = await Promise.all([cancelA.done, cancelB.done]);
    result.scheduleCancelSingle =
      cancelReplies.every(
        (r) => r.code === 0 && /^cancelled$/m.test(r.output),
      ) &&
      sql(
        database,
        "select (select count(*) from pipstart_editorial_private.publication_schedule_events)=2 and not exists(select 1 from pipstart_editorial_private.publication_schedules where state='scheduled') and not exists(select 1 from pipstart_editorial_private.publication_scheduler_control where enabled) and (select generation from pipstart_editorial_private.publication_pointer)=3;",
      ) === "t";
    if (!result.scheduleCancelSingle)
      throw Error(
        "Concurrent cancel did not create exactly one terminal event",
      );
    {
      // Restricted worker overlap, tick/cancel and governance races. No HTTP or saved human actor.
      const workerAuth = "begin;set local role pipstart_publication_scheduler;";
      const enqueueDue = (id, action) =>
        sql(
          database,
          `insert into pipstart_editorial_private.publication_schedules(id,actor_id,action,item_id,revision_no,body_sha256,base_generation,policy_version,due_at,time_zone,local_input,reason)
    values('ff991000-0000-4000-8000-${id}','ff000000-0000-4000-8000-000000000001','${action}','race-c',${action === "publish" ? "1" : "null"},${action === "publish" ? "'" + sha("race-c") + "'" : "null"},(select generation from pipstart_editorial_private.publication_pointer),(select version from pipstart_editorial_private.policy),date_trunc('minute',now()-interval '1 hour'),'UTC',to_char(now()-interval '1 hour','YYYY-MM-DD"T"HH24:MI'),'Generated scheduler contention');`,
        );
      sql(
        database,
        "update pipstart_editorial_private.publication_scheduler_control set enabled=true;",
      );
      enqueueDue("000000000001", "withdraw");
      const tickA = childSql(
        `set application_name='m22-tick-a-${runId}';${workerAuth}select pipstart_editorial_private.scheduler_tick()::text;select 'M22_TICK_LOCKED';select pg_sleep(4);commit;`,
      );
      await barrier(
        () => tickA.output().includes("M22_TICK_LOCKED"),
        8000,
        tickA,
        "worker tick",
      );
      const tickB = childSql(
        workerAuth +
          "select pipstart_editorial_private.scheduler_tick()->>'state';commit;",
      );
      const overlap = await tickB.done;
      result.schedulerOverlap =
        overlap.code === 0 && /^busy$/m.test(overlap.output);
      if (!result.schedulerOverlap)
        throw Error("Overlapping worker did not refuse busy");
      const cancelDuring = childSql(
        `set application_name='m22-tick-cancel-${runId}';${scheduleAuth}select public.pipstart_publication_cancel_schedule('ff991000-0000-4000-8000-000000000001','Generated cancel race');commit;`,
      );
      await waitFor(
        () =>
          sql(
            database,
            `select exists(select 1 from pg_stat_activity where application_name='m22-tick-cancel-${runId}' and datname=current_database() and wait_event_type='Lock');`,
          ) === "t",
        3500,
      );
      const [tickWon, cancelLost] = await Promise.all([
        tickA.done,
        cancelDuring.done,
      ]);
      result.schedulerTickWins =
        tickWon.code === 0 &&
        tickWon.output.includes('"published": 1') &&
        cancelLost.code !== 0 &&
        cancelLost.errors.includes(
          "Completed publication work cannot be cancelled",
        ) &&
        sql(
          database,
          "select (select generation from pipstart_editorial_private.publication_pointer)=4 and (select count(*) from pipstart_editorial_private.generations where operation_id='ff991000-0000-4000-8000-000000000001')=1;",
        ) === "t";
      if (!result.schedulerTickWins)
        throw Error(
          "Tick/cancel single winner failed: " +
            JSON.stringify([tickWon, cancelLost]),
        );
      const deliveryA = childSql(
        "begin;set local role service_role;select public.pipstart_publication_scheduler_claim()::text;select 'M22_DELIVERY_CLAIMED';select pg_sleep(4);commit;",
      );
      await barrier(
        () => deliveryA.output().includes("M22_DELIVERY_CLAIMED"),
        8000,
        deliveryA,
        "delivery claim",
      );
      const deliveryB = childSql(
        `set application_name='m22-delivery-b-${runId}';begin;set local role service_role;select public.pipstart_publication_scheduler_claim()::text;commit;`,
      );
      await waitFor(
        () =>
          sql(
            database,
            `select exists(select 1 from pg_stat_activity where application_name='m22-delivery-b-${runId}' and datname=current_database() and wait_event_type='Lock');`,
          ) === "t",
        3500,
      );
      const [firstClaim, secondClaim] = await Promise.all([
        deliveryA.done,
        deliveryB.done,
      ]);
      result.schedulerDeliverySingle =
        firstClaim.code === 0 &&
        secondClaim.code === 0 &&
        firstClaim.output.includes('"state": "claimed"') &&
        secondClaim.output.includes('"state": "idle"') &&
        sql(
          database,
          "select (select count(*) from pipstart_editorial_private.publication_scheduler_deliveries)=1 and (select attempts from pipstart_editorial_private.refresh_jobs where generation=4)=1;",
        ) === "t";
      if (!result.schedulerDeliverySingle)
        throw Error("Two delivery wakes did not share one durable claim");
      enqueueDue("000000000002", "publish");
      const cancelFirst = childSql(
        `set application_name='m22-cancel-first-${runId}';${scheduleAuth}select public.pipstart_publication_cancel_schedule('ff991000-0000-4000-8000-000000000002','Cancel before worker');select 'M22_CANCEL_FIRST';select pg_sleep(4);commit;`,
      );
      await barrier(
        () => cancelFirst.output().includes("M22_CANCEL_FIRST"),
        8000,
        cancelFirst,
        "cancel first",
      );
      const afterCancel = childSql(
        `set application_name='m22-after-cancel-${runId}';${workerAuth}select pipstart_editorial_private.scheduler_tick()::text;commit;`,
      );
      await waitFor(
        () =>
          sql(
            database,
            `select exists(select 1 from pg_stat_activity where application_name='m22-after-cancel-${runId}' and datname=current_database() and wait_event_type='Lock');`,
          ) === "t",
        3500,
      );
      const [cancelWon, tickLost] = await Promise.all([
        cancelFirst.done,
        afterCancel.done,
      ]);
      result.schedulerCancelWins =
        cancelWon.code === 0 &&
        tickLost.code === 0 &&
        tickLost.output.includes('"processed": 0') &&
        sql(
          database,
          "select (select generation from pipstart_editorial_private.publication_pointer)=4 and not exists(select 1 from pipstart_editorial_private.generations where operation_id='ff991000-0000-4000-8000-000000000002');",
        ) === "t";
      if (!result.schedulerCancelWins)
        throw Error("Cancelled schedule executed");
      enqueueDue("000000000003", "publish");
      const revokeFirst = childSql(
        "begin;select 1 from pipstart_staff_private.control where singleton for update;update pipstart_staff_private.members set active=false where user_id='ff000000-0000-4000-8000-000000000001';select 'M22_REVOKE_HELD';select pg_sleep(4);commit;",
      );
      await barrier(
        () => revokeFirst.output().includes("M22_REVOKE_HELD"),
        8000,
        revokeFirst,
        "governance revoke",
      );
      const afterRevoke = childSql(
        `set application_name='m22-after-revoke-${runId}';${workerAuth}select pipstart_editorial_private.scheduler_tick()::text;commit;`,
      );
      await waitFor(
        () =>
          sql(
            database,
            `select exists(select 1 from pg_stat_activity where application_name='m22-after-revoke-${runId}' and datname=current_database() and wait_event_type='Lock');`,
          ) === "t",
        3500,
      );
      result.schedulerRevokeBlocked = true;
      const [revoked, refused] = await Promise.all([
        revokeFirst.done,
        afterRevoke.done,
      ]);
      result.schedulerRevoked =
        revoked.code === 0 &&
        refused.code === 0 &&
        refused.output.includes('"failed": 1') &&
        sql(
          database,
          "select (select generation from pipstart_editorial_private.publication_pointer)=4 and exists(select 1 from pipstart_editorial_private.publication_schedules where id='ff991000-0000-4000-8000-000000000003' and state='failed' and failure_code='revoked');",
        ) === "t";
      if (!result.schedulerRevoked)
        throw Error("Revoked authorizer published due work");
    }
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
      result.importHead &&
      result.revisionReadStaged &&
      result.revisionReadHead &&
      result.publicationSourcesStaged &&
      result.publicationSourcesHead &&
      result.quizVersionsStaged &&
      result.quizVersionsHead &&
      result.publicationStaged &&
      result.publicationHead &&
      result.publicationRaceBlocked &&
      result.publicationSingleWinner &&
      result.publicationReplaySingle &&
      result.publicationSchedulesStaged &&
      result.publicationSchedulesHead &&
      result.scheduleCreateBlocked &&
      result.scheduleCreateSingle &&
      result.scheduleCancelBlocked &&
      result.scheduleCancelSingle &&
      result.observedVerificationStaged &&
      result.observedVerificationHead &&
      result.partnerStoreStaged &&
      result.partnerStoreHead &&
      result.partnerSnapshotContinuity &&
      result.partnerSnapshotStaged &&
      result.partnerSnapshotHead &&
      result.schedulerStaged &&
      result.schedulerHead &&
      result.schedulerOverlap &&
      result.schedulerTickWins &&
      result.schedulerCancelWins &&
      result.schedulerRevokeBlocked &&
      result.schedulerRevoked &&
      result.schedulerDeliverySingle;
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
