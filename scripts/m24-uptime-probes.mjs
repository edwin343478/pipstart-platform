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

const pageLimitBytes = 2 * 1024 * 1024;
const healthLimitBytes = 4096;
const acknowledgementLimitBytes = 64;

async function withDeadline(work) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    return await work(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function readText(response, limitBytes, signal) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const cancel = () => void reader.cancel().catch(() => {});
  signal.addEventListener("abort", cancel, { once: true });

  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let bytes = 0;
    let text = "";
    while (true) {
      signal.throwIfAborted();
      const { value, done } = await reader.read();
      signal.throwIfAborted();
      if (done) return text + decoder.decode();
      bytes += value.byteLength;
      if (bytes > limitBytes) throw new Error("response too large");
      text += decoder.decode(value, { stream: true });
    }
  } catch (error) {
    cancel();
    throw error;
  } finally {
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
}

async function requestText(request, url, init, limitBytes) {
  return withDeadline(async (signal) => {
    const response = await request(url, { ...init, signal });
    if (response.status !== 200) {
      void response.body?.cancel().catch(() => {});
      return { status: response.status, text: "" };
    }
    return {
      status: response.status,
      text: await readText(response, limitBytes, signal),
    };
  });
}

async function probe(url, expectedText, request) {
  try {
    const { status, text } = await requestText(
      request,
      url,
      {
        redirect: "manual",
        headers: { "user-agent": "pipstart-uptime-check" },
      },
      expectedText ? pageLimitBytes : healthLimitBytes,
    );
    if (status !== 200) return "HTTP " + status;
    if (expectedText) {
      return text.toLowerCase().includes(expectedText.toLowerCase())
        ? ""
        : "page marker missing";
    }
    const health = JSON.parse(text);
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
          const { status, text } = await requestText(
            request,
            endpoint,
            {
              method: "POST",
              redirect: "manual",
              body: failures.length
                ? failures.join("\n")
                : "M24 uptime probes passed",
            },
            acknowledgementLimitBytes,
          );
          if (status !== 200 || text.trim() !== "OK") {
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
