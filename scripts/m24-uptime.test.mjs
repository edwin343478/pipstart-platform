import assert from "node:assert/strict";
import test from "node:test";
import { run } from "./m24-uptime.mjs";

const env = {
  HC_UPTIME_PIPSTART:
    "https://hc-ping.com/00000000-0000-0000-0000-000000000001",
  HC_UPTIME_SKILLCIMA:
    "https://hc-ping.com/00000000-0000-0000-0000-000000000002",
  HC_UPTIME_DATABASE:
    "https://hc-ping.com/00000000-0000-0000-0000-000000000003",
};
const html = "PipStart Start Here Forex Log in Free Forex Foundations Course";

async function exercise({ report = true, secrets = env, overrides = {} } = {}) {
  const calls = [];
  const logs = [];
  const request = async (url, options) => {
    calls.push([url, options]);
    if (Object.hasOwn(overrides, url)) return overrides[url]();
    if (url.startsWith("https://hc-ping.com/")) return new Response("OK");
    if (url.endsWith("/health"))
      return Response.json({ ok: true, data: { database: "ok" } });
    return new Response(html);
  };
  const ok = await run({
    report,
    env: secrets,
    request,
    log: (line) => logs.push(line),
  });
  assert(
    logs.every(
      (line) => !line.includes("hc-ping.com") && !line.includes("00000000"),
    ),
  );
  return { ok, calls, logs };
}

test("default run reads six public endpoints without pings", async () => {
  const result = await exercise({ report: false, secrets: {} });
  assert.equal(result.ok, true);
  assert.equal(result.calls.length, 6);
  assert(result.calls.every(([, options]) => options.redirect === "manual"));
});

test("reporting requires all three exact and distinct UUID URLs", async () => {
  for (const value of [
    undefined,
    "https://example.com/token",
    env.HC_UPTIME_SKILLCIMA,
  ]) {
    const result = await exercise({
      secrets: { ...env, HC_UPTIME_PIPSTART: value },
    });
    assert.equal(result.ok, false);
    assert.equal(result.calls.length, 0);
  }
});

test("healthy reporting requires three acknowledged POSTs", async () => {
  const result = await exercise();
  assert.equal(result.ok, true);
  const reports = result.calls.filter(
    ([, options]) => options.method === "POST",
  );
  assert.deepEqual(
    reports.map(([url]) => url).sort(),
    Object.values(env).sort(),
  );
});

test("redirect is reported as a probe failure without following it", async () => {
  const result = await exercise({
    overrides: {
      "https://pipstart.net/": () => Response.redirect("https://example.com"),
    },
  });
  assert.equal(result.ok, false);
  assert(
    result.calls.some(
      ([url, options]) =>
        url === env.HC_UPTIME_PIPSTART + "/fail" &&
        options.body === "/ HTTP 302",
    ),
  );
  assert(!result.calls.some(([url]) => url.startsWith("https://example.com")));
});

test("database response requires nested successful status", async () => {
  const result = await exercise({
    overrides: {
      "https://skillcima.com/api/v1/health": () =>
        Response.json({ ok: false, data: { database: "ok" } }),
    },
  });
  assert.equal(result.ok, false);
  assert(
    result.calls.some(([url]) => url === env.HC_UPTIME_DATABASE + "/fail"),
  );
});

test("invalid page body and transport failures still report all groups", async () => {
  const result = await exercise({
    overrides: {
      "https://pipstart.net/start-here": () => new Response("unexpected body"),
      "https://skillcima.com/": () => {
        throw Error("network error");
      },
    },
  });
  assert.equal(result.ok, false);
  assert.equal(
    result.calls.filter(([, options]) => options.method === "POST").length,
    3,
  );
  assert(result.logs.some((line) => line.includes("page marker missing")));
});

test("HTTP 200 ignored pings and ping errors cannot pass", async () => {
  for (const response of [
    () => new Response("rate limited"),
    () => new Response("not found"),
    () => {
      throw Error("fail");
    },
  ]) {
    const result = await exercise({
      overrides: { [env.HC_UPTIME_DATABASE]: response },
    });
    assert.equal(result.ok, false);
    assert(!result.logs.includes("Database via Skillcima ping acknowledged"));
  }
});

test("health results require bounded and well-formed JSON", async () => {
  for (const body of [
    '{"ok": true',
    JSON.stringify({
      ok: true,
      data: { database: "ok" },
      pad: "é".repeat(2100),
    }),
  ]) {
    const result = await exercise({
      overrides: {
        "https://skillcima.com/api/v1/health": () => new Response(body),
      },
    });
    assert.equal(result.ok, false);
    assert(
      result.calls.some(([url]) => url === env.HC_UPTIME_DATABASE + "/fail"),
    );
  }
});

test("a page marker cannot pass an oversized streamed page", async () => {
  let cancelled = false;
  const result = await exercise({
    overrides: {
      "https://pipstart.net/": () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode("PipStart"));
              controller.enqueue(new Uint8Array(2 * 1024 * 1024));
            },
            cancel() {
              cancelled = true;
            },
          }),
        ),
    },
  });
  assert.equal(result.ok, false);
  assert.equal(cancelled, true);
  assert(
    result.calls.some(([url]) => url === env.HC_UPTIME_PIPSTART + "/fail"),
  );
});

test("the deadline cancels a stalled probe body even when cancellation rejects", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let started;
  const reading = new Promise((resolve) => {
    started = resolve;
  });
  let cancelled = false;
  const run = exercise({
    overrides: {
      "https://pipstart.net/": () =>
        new Response(
          new ReadableStream({
            pull() {
              started();
            },
            cancel() {
              cancelled = true;
              throw new Error("cancel failed");
            },
          }),
        ),
    },
  });
  await reading;
  t.mock.timers.tick(10000);
  const result = await run;
  assert.equal(result.ok, false);
  assert.equal(cancelled, true);
  assert(
    result.calls.some(([url]) => url === env.HC_UPTIME_PIPSTART + "/fail"),
  );
});

test("the ping must acknowledge with the complete bounded OK body", async () => {
  for (const body of [
    "OK extra",
    "OK" + " ".repeat(62) + "unexpected",
    "OK " + "é".repeat(31),
  ]) {
    const result = await exercise({
      overrides: { [env.HC_UPTIME_DATABASE]: () => new Response(body) },
    });
    assert.equal(result.ok, false);
    assert(!result.logs.includes("Database via Skillcima ping acknowledged"));
  }
});
