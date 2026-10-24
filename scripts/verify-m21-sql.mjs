import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const migrationNames = [
  "20261019130000_pipstart_account_email_monitor.sql",
  "20261019160000_pipstart_email_delivery_sweep.sql",
  "20261020090000_pipstart_optional_email_preferences.sql",
  "20261020120000_pipstart_optional_email_unsubscribe.sql",
  "20261021100000_pipstart_optional_email_dispatch_state.sql",
  "20261021130000_pipstart_optional_email_queue.sql",
  "20261021160000_pipstart_optional_address_suppression.sql",
  "20261021200000_pipstart_optional_address_import.sql",
  "20261022100000_pipstart_optional_provider_evidence.sql",
  "20261022120000_pipstart_optional_email_cadence.sql",
  "20261022140000_pipstart_optional_worker.sql",
  "20261022160000_pipstart_optional_worker_recovery.sql",
  "20261022180000_pipstart_optional_retention_preview.sql",
  "20261022200000_pipstart_optional_metadata_cleanup.sql",
  "20261022220000_pipstart_optional_content_facts.sql",
  "20261023090000_pipstart_optional_content_minimization.sql",
  "20261023120000_pipstart_optional_test_window.sql",
  "20261023160000_pipstart_optional_begin_outcomes.sql",
];
const suites = [
  "test-m21-optional-begin-outcomes.sql",
  "test-m21-optional-test-window.sql",
];
export function generatedDatabase(value) {
  if (!/^pipstart_m21_ci_[a-f0-9]{32}$/.test(value))
    throw Error("Unsafe generated database identifier");
  return value;
}
export function fixtureUuid(value) {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value)
  )
    throw Error("Invalid generated fixture UUID");
  return value;
}
export function executionTarget(env, argv) {
  if (
    argv.some((arg) => !["--run", "--ci"].includes(arg)) ||
    !argv.includes("--run")
  )
    throw Error("Use --run explicitly; only --ci is additionally supported");
  if (argv.includes("--ci")) {
    if (env.GITHUB_ACTIONS !== "true")
      throw Error("CI mode requires GitHub Actions");
    return "pipstart-m21-sql-ci";
  }
  return "supabase_db_pipstart-platform";
}
const digest = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

export async function verify(argv = process.argv.slice(2)) {
  const container = executionTarget(process.env, argv);
  const database = generatedDatabase(
    "pipstart_m21_ci_" + crypto.randomBytes(16).toString("hex"),
  );
  const marker = "m21-generated-" + crypto.randomBytes(16).toString("hex");
  const docker = process.platform === "win32" ? "docker.exe" : "docker";
  const reportFile = path.join(
    process.env.RUNNER_TEMP || os.tmpdir(),
    database + ".json",
  );
  const report = {
    database,
    migrationCount: 0,
    suites: [],
    rollback: false,
    concurrency: false,
    cleanup: false,
    passed: false,
  };
  let created = false;
  const children = [];
  const deadline = Date.now() + 120000;
  const args = (db) => [
    "exec",
    "-i",
    container,
    "psql",
    "-X",
    "-q",
    "-A",
    "-t",
    "-U",
    "postgres",
    "-d",
    db,
    "--set=ON_ERROR_STOP=1",
  ];
  function command(parameters, input) {
    const run = spawnSync(docker, parameters, {
      input,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000,
      windowsHide: true,
    });
    if (run.error || run.status !== 0)
      throw Error(
        "Docker/SQL check failed: " +
          (run.error?.message || run.stderr).slice(-2000),
      );
    return run.stdout.trim();
  }
  function sql(db, text, cleanup = false) {
    if (db !== "postgres") generatedDatabase(db);
    if (!cleanup && Date.now() > deadline)
      throw Error("SQL acceptance exceeded its two-minute work budget");
    return command(
      args(db),
      "set statement_timeout='15s'; set lock_timeout='8s';\n" + text,
    );
  }
  function cleanup() {
    if (!created) return;
    generatedDatabase(database);
    // A UUID name alone is not enough: verify this run's marker and owner before DROP.
    const identity = sql(
      "postgres",
      `select count(*) from pg_database where datname='${database}' and datdba=(select oid from pg_roles where rolname='postgres') and shobj_description(oid,'pg_database')='${marker}';`,
      true,
    );
    if (identity !== "1")
      throw Error("Disposable database identity mismatch; cleanup refused");
    sql("postgres", `drop database ${database} with (force);`, true);
    created = false;
    report.cleanup =
      sql(
        "postgres",
        `select count(*) from pg_database where datname='${database}';`,
        true,
      ) === "0";
    if (!report.cleanup)
      throw Error("Disposable database cleanup not confirmed");
  }
  function interrupted() {
    try {
      for (const child of children) child.kill();
      cleanup();
    } catch (error) {
      console.error(error.message);
    }
    report.passed = false;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
    console.error(
      "Interrupted. Disposable cleanup result: " +
        report.cleanup +
        ". Report: " +
        reportFile,
    );
    process.exit(1);
  }
  const snapshot = () => {
    const tables = JSON.parse(
      sql(
        database,
        "select coalesce(json_agg(json_build_array(schemaname,tablename) order by schemaname,tablename),'[]') from pg_tables where schemaname in ('public','auth');",
      ),
    );
    const rows = tables.map(([schema, table]) => {
      if (
        !/^[a-z_][a-z0-9_]*$/.test(schema) ||
        !/^[a-z_][a-z0-9_]*$/.test(table)
      )
        throw Error("Unexpected fixture relation");
      return `select '${schema}.${table}' as relation,coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from "${schema}"."${table}" t`;
    });
    return digest(
      sql(
        database,
        "select jsonb_agg(to_jsonb(s) order by relation)::text from (" +
          rows.join(" union all ") +
          ") s;",
      ),
    );
  };
  process.once("SIGINT", interrupted);
  process.once("SIGTERM", interrupted);
  try {
    if (
      !command(["ps", "--format", "{{.Names}}"])
        .split(/\r?\n/)
        .includes(container)
    )
      throw Error(
        "Required local/CI PostgreSQL is not running. This runner never starts or resets Supabase",
      );
    if (
      sql(
        "postgres",
        "select count(*) from pg_roles where rolname in ('anon','authenticated','service_role');",
      ) !== "3"
    )
      throw Error(
        "Required pre-existing roles absent; runner never creates global roles",
      );
    const inputs = [
      "supabase/migrations/20260915143000_pipstart_learner_accounts.sql",
      ...migrationNames.map((n) => "supabase/migrations/" + n),
      ...suites.map((n) => "apps/pipstart/scripts/" + n),
    ];
    report.sourceHash = digest(
      inputs
        .map(
          (file) => file + ":" + digest(fs.readFileSync(path.join(root, file))),
        )
        .join("\n"),
    );
    console.log("Creating generated disposable database: " + database);
    sql("postgres", `create database ${database} template template0;`);
    created = true;
    sql("postgres", `comment on database ${database} is '${marker}';`);
    sql(
      database,
      "create schema auth; create table auth.users(id uuid primary key,raw_user_meta_data jsonb not null default '{}'::jsonb,email text,email_confirmed_at timestamptz,deleted_at timestamptz,banned_until timestamptz); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,service_role; grant execute on function auth.uid() to authenticated,service_role;",
    );
    // Replay in one psql session: migration BEGIN/COMMIT boundaries are retained,
    // while avoiding 19 separate Docker CLI startups on Windows.
    sql(
      database,
      inputs
        .slice(0, 19)
        .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
        .join("\n"),
    );
    report.migrationCount = 19;
    const baseline = snapshot();
    for (const suite of suites) {
      sql(
        database,
        fs.readFileSync(
          path.join(root, "apps/pipstart/scripts", suite),
          "utf8",
        ),
      );
      if (snapshot() !== baseline)
        throw Error("SQL suite failed to roll back all fixture rows: " + suite);
      report.suites.push(suite);
      console.log("PASS " + suite);
    }
    report.rollback = true;
    const fixture = JSON.parse(
      sql(
        database,
        `do $$declare u uuid:=gen_random_uuid();j uuid;a jsonb;c jsonb;begin
   insert into auth.users(id,email,email_confirmed_at) values(u,'ci-race@example.test',now());
   j:=(public.pipstart_enqueue_optional_email(u,'ci-race','learning_lesson','Generated','Generated','Generated')->>'jobId')::uuid;
   insert into public.pipstart_optional_email_reservations values(gen_random_uuid(),public.pipstart_optional_address_hash('ci-race@example.test'),'learning_lesson',clock_timestamp()-interval '1 hour');
   perform public.pipstart_set_optional_test_window(j,clock_timestamp()+interval '5 minutes','M21-generated-ci-race');
   a:=public.pipstart_acquire_optional_worker();c:=public.pipstart_claim_optional_email(j);
   perform set_config('m21.fixture',jsonb_build_object('jobId',j,'token',c->>'token','workerToken',a->>'token')::text,false);
  end $$;select current_setting('m21.fixture');`,
      ),
    );
    for (const key of ["jobId", "token", "workerToken"])
      fixtureUuid(fixture[key]);
    const message = {
      jobId: fixture.jobId,
      to: "ci-race@example.test",
      subject: "Generated",
      html: "Generated",
      text: "Generated",
      headers: {
        "List-Unsubscribe":
          "<https://pipstart.net/unsubscribe?token=" + "a".repeat(64) + ">",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
    const call = `select public.pipstart_begin_optional_email_v2('${fixture.jobId}','${fixture.token}','${JSON.stringify(message)}'::jsonb)->>'status';`;
    function connection() {
      const child = spawn(docker, args(database), { windowsHide: true });
      children.push(child);
      const result = { stdout: "", stderr: "" };
      child.stdout.on("data", (data) => (result.stdout += data));
      child.stderr.on("data", (data) => (result.stderr += data));
      child.stdin.on("error", () => {});
      const closed = new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          child.kill();
          reject(Error("SQL connection exceeded 20 seconds"));
        }, 20000);
        child.once("error", (error) => {
          clearTimeout(timer);
          reject(error);
        });
        child.once("close", (code) => {
          clearTimeout(timer);
          resolve({ ...result, code });
        });
      });
      closed.catch(() => {});
      return { child, closed };
    }
    async function observe(query, label) {
      const until = Date.now() + 5000;
      while (Date.now() < until) {
        if (sql(database, query) === "1") return;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw Error(label);
    }
    const first = connection();
    first.child.stdin.write(
      "set application_name='m21-ci-race-holder';set statement_timeout='15s';set idle_in_transaction_session_timeout='20s';begin;" +
        call +
        "select 'm21-ready';\n",
    );
    await observe(
      "select count(*) from pg_stat_activity where datname=current_database() and application_name='m21-ci-race-holder' and state='idle in transaction' and xact_start is not null;",
      "First connection never held its uncommitted deferral",
    );
    const second = connection();
    second.child.stdin.end(
      "set application_name='m21-ci-race-contender';set statement_timeout='15s';set lock_timeout='8s';" +
        call +
        "\n",
    );
    await observe(
      "select count(*) from pg_stat_activity c join pg_stat_activity h on h.pid=any(pg_blocking_pids(c.pid)) where c.datname=current_database() and h.datname=current_database() and c.application_name='m21-ci-race-contender' and h.application_name='m21-ci-race-holder' and c.wait_event_type='Lock';",
      "Contender was not observed blocked by the holder",
    );
    report.blockingObserved = true;
    first.child.stdin.end("commit;\n");
    const [holder, contender] = await Promise.all([
      first.closed,
      second.closed,
    ]);
    if (
      holder.code !== 0 ||
      contender.code !== 0 ||
      holder.stderr.trim() ||
      contender.stderr.trim() ||
      holder.stdout.trim() !== "cadence_deferred\nm21-ready" ||
      contender.stdout.trim() !== "lease_lost"
    )
      throw Error("Concurrent deferral acknowledgments violated contract");
    if (
      sql(
        database,
        `select count(*)=1 and bool_and(status='pending' and reason='cadence_limited' and attempts=0 and lease_token is null and lease_until is null and prepared_message is null and provider_id is null and available_at>clock_timestamp()) from public.pipstart_optional_email_jobs where id='${fixture.jobId}';`,
      ) !== "t"
    )
      throw Error("Concurrent job invariant failed");
    if (
      sql(
        database,
        `select count(*) from public.pipstart_optional_email_reservations where job_id='${fixture.jobId}';`,
      ) !== "0"
    )
      throw Error("Deferral consumed a reservation");
    if (
      sql(
        database,
        `select public.pipstart_finish_optional_worker('${fixture.workerToken}');`,
      ) !== "t"
    )
      throw Error("Safe worker finish failed");
    report.concurrency = true;
    console.log(
      "PASS real two-connection race: cadence_deferred / lease_lost; refunded attempt; no reservation; safe finish.",
    );
  } finally {
    for (const child of children) child.kill();
    try {
      cleanup();
    } finally {
      process.removeListener("SIGINT", interrupted);
      process.removeListener("SIGTERM", interrupted);
      report.passed =
        report.migrationCount === 19 &&
        report.suites.length === 2 &&
        report.rollback &&
        report.blockingObserved &&
        report.concurrency &&
        report.cleanup;
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
      console.log("Report: " + reportFile);
    }
  }
  if (!report.passed) throw Error("Incomplete SQL acceptance");
  console.log(
    "M21 ISOLATED SQL ACCEPTANCE PASSED. Generated database removed; no app/hosted migration, email send or worker activation.",
  );
  return report;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  verify().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
