import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const pipStart = fileURLToPath(new URL("../apps/pipstart/", import.meta.url));
const skillcimaExport = fileURLToPath(
  new URL("../apps/skillcima/out/", import.meta.url),
);
const requireApp = createRequire(resolve(pipStart, "package.json"));
const { chromium } = requireApp("@playwright/test");
const budget = { javascript: 250 * 1024, firstParty: 750 * 1024 };
const resourceTypes = new Set([
  "document",
  "script",
  "stylesheet",
  "font",
  "image",
  "media",
  "fetch",
  "xhr",
]);
const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".txt": "text/x-component",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function startServer(handler) {
  const server = createServer(handler);
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server);
    });
  });
}

function localOrigin(server) {
  return "http://127.0.0.1:" + server.address().port;
}

function closeServer(server) {
  if (!server) return Promise.resolve();
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
}

async function waitForPipStart(child) {
  const ready = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("PipStart startup timed out")),
      30_000,
    );
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error("PipStart exited during startup (" + code + ")"));
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output = (output + chunk).slice(-2048);
      if (output.includes("Ready in")) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
  await ready;
}

async function stopPipStart(child) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null)
    return;
  const stopped = once(child, "exit");
  child.kill();
  await stopped;
}

async function serveSkillcima(request, response) {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const name = pathname === "/" ? "/index.html" : pathname;
    const suffix = extname(name) ? "" : request.headers.rsc ? ".txt" : ".html";
    const file = resolve(skillcimaExport, "." + name + suffix);
    if (!file.startsWith(resolve(skillcimaExport) + sep)) {
      response.writeHead(404).end();
      return;
    }
    const asset = await readFile(file);
    response
      .writeHead(200, {
        "Content-Type":
          contentTypes[extname(file)] ?? "application/octet-stream",
      })
      .end(request.method === "HEAD" ? undefined : asset);
  } catch {
    response.writeHead(404).end();
  }
}

function speculative(request) {
  const headers = request.headers();
  return Boolean(
    headers["next-router-prefetch"] ||
    headers["next-router-segment-prefetch"] ||
    /prefetch/i.test([headers.purpose, headers["sec-purpose"]].join(" ")),
  );
}

function normalizedBytes(response, body, type) {
  const contentType = response.headers()["content-type"] ?? "";
  const compressible =
    ["document", "script", "stylesheet"].includes(type) ||
    /^(?:text\/|image\/svg\+xml|application\/(?:json|javascript))/i.test(
      contentType,
    );
  return compressible ? gzipSync(body, { level: 6 }).length : body.length;
}

async function measure(browser, origin, route) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  try {
    await context.route("**/*", (route) => {
      const request = route.request();
      return new URL(request.url()).origin === origin &&
        ["GET", "HEAD"].includes(request.method())
        ? route.continue()
        : route.abort();
    });
    const page = await context.newPage();
    const assets = new Map();
    const problems = [];
    const pending = new Set();

    const isMeasured = (request) =>
      request.method() === "GET" &&
      new URL(request.url()).origin === origin &&
      resourceTypes.has(request.resourceType()) &&
      !speculative(request);

    page.on("request", (request) => {
      if (isMeasured(request)) pending.add(request);
    });
    page.on("requestfinished", (request) => pending.delete(request));
    page.on("requestfailed", (request) => {
      if (pending.delete(request))
        problems.push(new URL(request.url()).pathname);
    });
    page.on("response", (response) => {
      const request = response.request();
      if (!isMeasured(request)) return;
      const url = response.url();
      if (response.status() >= 400) {
        problems.push(new URL(url).pathname);
        return;
      }
      if (response.ok() && !assets.has(url)) assets.set(url, response);
    });

    const document = await page.goto(origin + route, {
      waitUntil: "load",
      timeout: 20_000,
    });
    if (!document?.ok() || page.url() !== origin + route)
      throw new Error("Public route did not load: " + route);

    await page.locator("main h1").first().waitFor({ timeout: 5_000 });
    // Capture initial hydration resources without scrolling or clicking.
    await new Promise((resolve) => setTimeout(resolve, 1600));

    if (problems.length || pending.size)
      throw new Error(
        "Incomplete first-party load for " +
          route +
          ": " +
          [
            ...problems,
            ...[...pending].map((r) => new URL(r.url()).pathname),
          ].join(", "),
      );

    const totals = { javascript: 0, firstParty: 0 };
    for (const response of assets.values()) {
      const type = response.request().resourceType();
      const size = normalizedBytes(response, await response.body(), type);
      totals.firstParty += size;
      if (type === "script") totals.javascript += size;
    }

    if (!totals.javascript)
      throw new Error("No first-party JavaScript measured for " + route);
    return totals;
  } finally {
    await context.close();
  }
}

async function main() {
  process.env.NODE_ENV = "production";
  process.env.NEXT_TELEMETRY_DISABLED = "1";
  let pipStartProcess, skillcimaServer, browser;
  try {
    await readFile(resolve(pipStart, ".next/BUILD_ID"));
    await readFile(resolve(skillcimaExport, "index.html"));
    const reservation = await startServer();
    const port = reservation.address().port;
    await closeServer(reservation);
    pipStartProcess = spawn(
      process.execPath,
      [
        requireApp.resolve("next/dist/bin/next"),
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(port),
      ],
      { cwd: pipStart, stdio: ["ignore", "pipe", "ignore"], windowsHide: true },
    );
    await waitForPipStart(pipStartProcess);

    skillcimaServer = await startServer(serveSkillcima);
    browser = await chromium.launch();
    const sites = [
      {
        name: "PipStart",
        origin: "http://127.0.0.1:" + port,
        routes: [
          "/",
          "/learn/forex/level-1",
          "/learn/forex/level-1/quiz",
          "/tools/risk-reward-calculator",
        ],
      },
      {
        name: "Skillcima",
        origin: localOrigin(skillcimaServer),
        routes: ["/", "/legal/privacy-policy"],
      },
    ];

    const failures = [];
    for (const site of sites) {
      for (const route of site.routes) {
        const totals = await measure(browser, site.origin, route);
        const label = site.name + " " + route;
        console.log(
          label +
            " — " +
            (totals.javascript / 1024).toFixed(1) +
            " KiB JS gzip, " +
            (totals.firstParty / 1024).toFixed(1) +
            " KiB first-party normalized",
        );
        for (const metric of Object.keys(budget)) {
          if (totals[metric] > budget[metric])
            failures.push(label + " " + metric);
        }
      }
    }

    if (failures.length)
      throw new Error("Public route budget exceeded: " + failures.join(", "));
  } finally {
    if (browser) await browser.close();
    await Promise.all([
      stopPipStart(pipStartProcess),
      closeServer(skillcimaServer),
    ]);
  }
}

main().catch((error) => {
  console.error("Public route budget check failed: " + error.message);
  process.exitCode = 1;
});
