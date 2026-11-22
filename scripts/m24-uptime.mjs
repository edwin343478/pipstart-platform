import { pathToFileURL } from "node:url";

const groups = [
  {
    name: "PipStart site",
    secret: "HC_UPTIME_PIPSTART",
    routes: [
      ["https://pipstart.net/", "PipStart"],
      ["https://pipstart.net/start-here", "Start Here"],
      ["https://pipstart.net/learn/forex", "Forex"],
      ["https://pipstart.net/login", "Log in"],
    ],
  },
  {
    name: "Skillcima site",
    secret: "HC_UPTIME_SKILLCIMA",
    routes: [["https://skillcima.com/", "Free Forex Foundations Course"]],
  },
  {
    name: "Database via Skillcima",
    secret: "HC_UPTIME_DATABASE",
    routes: [["https://skillcima.com/api/v1/health", null]],
  },
];

const pingPattern =
  /^https:\/\/hc-ping\.com\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

async function probe(url, expectedText, request) {
  try {
    const response = await request(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
      headers: { "user-agent": "pipstart-uptime-check" },
    });
    if (response.status !== 200) return "HTTP " + response.status;
    if (expectedText) {
      const html = await response.text();
      return html.toLowerCase().includes(expectedText.toLowerCase())
        ? ""
        : "page marker missing";
    }
    const health = await response.json();
    return health.ok === true && health.data?.database === "ok"
      ? ""
      : "database health not confirmed";
  } catch {
    return "request or response failed";
  }
}

export async function run({ report, env, request = fetch, log = console.log }) {
  const targets = groups.map((group) => env[group.secret]?.trim());
  if (
    report &&
    (targets.some((target) => !pingPattern.test(target ?? "")) ||
      new Set(targets.map((target) => target?.toLowerCase())).size !==
        groups.length)
  ) {
    log("Reporting requires three valid, distinct Healthchecks UUID URLs.");
    return false;
  }

  const outcomes = await Promise.all(
    groups.map(async (group, index) => {
      const failures = (
        await Promise.all(
          group.routes.map(async ([url, expected]) => {
            const reason = await probe(url, expected, request);
            return reason ? new URL(url).pathname + " " + reason : "";
          }),
        )
      ).filter(Boolean);
      log(
        group.name +
          (failures.length
            ? " probe failed: " + failures.join(", ")
            : " probes passed"),
      );
      if (report) {
        try {
          const endpoint = targets[index] + (failures.length ? "/fail" : "");
          const response = await request(endpoint, {
            method: "POST",
            redirect: "manual",
            signal: AbortSignal.timeout(10000),
            body: failures.length
              ? failures.join("\n")
              : "M24 uptime probes passed",
          });
          if (
            response.status !== 200 ||
            (await response.text()).trim() !== "OK"
          ) {
            log(group.name + " ping was not acknowledged");
            return false;
          }
          log(group.name + " ping acknowledged");
        } catch {
          log(group.name + " ping failed");
          return false;
        }
      }
      return failures.length === 0;
    }),
  );
  return outcomes.every(Boolean);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (
    process.argv.length > 3 ||
    (process.argv[2] && process.argv[2] !== "--report")
  ) {
    console.error("Usage: node m24-uptime.mjs [--report]");
    process.exitCode = 1;
  } else {
    process.exitCode = (await run({
      report: process.argv[2] === "--report",
      env: process.env,
    }))
      ? 0
      : 1;
  }
}
