import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

export const m20Projects = [
  "desktop-chromium",
  "mobile-chromium",
  "narrow-chromium",
];
export const m20Cases = [
  "calendar descriptions use international coverage wording",
  "mobile calendar and explanations scroll independently in both directions",
  "page, attribution, fixed height, metadata and teaching links",
  "blocked script shows a fallback without breaking static content",
  "silent no-frame script times out after loading begins",
  "loads only after intersection, with no premature timeout",
  "no JavaScript still offers the calendar and official sources",
  "only the calendar route gains third-party CSP allowances",
  "privacy disclosures and analysis discovery link",
  "calendar entry and exit request fresh documents with the correct CSP",
  "iframe presence does not remove permanent blank-frame guidance",
  "intro, chips, full-calendar button and notice cards",
  "desktop panels line up and explanations scroll inside",
  "phones stack the panels and show the tab bar with Analysis active",
  "calendar page has no serious accessibility violations",
  "Calendar follows Analysis and opens as a fresh document",
  "desktop navigation fits on one row from 901px",
  "frame loss exposes a document reload without automatic retry",
  "late frame recovers after timeout without claiming fresh data",
  "related glossary links resolve to public term anchors",
];
export const m20InstanceCount = m20Projects.length * m20Cases.length;
export const m20PassCount = m20InstanceCount - 6;
export function m20ExpectedSkip(project, title) {
  if (project === "desktop-chromium")
    return [m20Cases[1], m20Cases[13]].includes(title);
  return [m20Cases[12], m20Cases[16]].includes(title);
}

// Bind code and configuration; normalize checkout line endings for Windows/Linux.
const sources = [
  ".github/workflows/ci.yml",
  "pnpm-lock.yaml",
  "scripts/verify-m20-browser-results.mjs",
  "apps/pipstart/package.json",
  "apps/pipstart/next.config.ts",
  "apps/pipstart/playwright.m20.config.ts",
  "apps/pipstart/playwright.m18-phase3.config.ts",
  "apps/pipstart/scripts/m20-browser-metadata.mjs",
  "apps/pipstart/e2e/milestone-20-calendar.spec.ts",
  "apps/pipstart/src/app/economic-calendar/page.tsx",
  "apps/pipstart/src/app/economic-calendar/page.module.css",
  "apps/pipstart/src/app/globals.css",
  "apps/pipstart/src/app/page.module.css",
  "apps/pipstart/src/app/legal/privacy-policy/page.tsx",
  "apps/pipstart/src/app/legal/cookie-policy/page.tsx",
  "apps/pipstart/src/components/economic-calendar-widget.tsx",
  "apps/pipstart/src/components/economic-calendar-widget.module.css",
  "apps/pipstart/src/components/calendar-timezone.tsx",
  "apps/pipstart/src/components/calendar-document-boundary.tsx",
  "apps/pipstart/src/components/primary-navigation.tsx",
  "apps/pipstart/src/components/bottom-tab-bar.tsx",
  "apps/pipstart/src/components/calendar-navigation.test.tsx",
  "apps/pipstart/src/content/calendar-explainers.ts",
  "apps/pipstart/src/lib/economic-calendar.ts",
  "apps/pipstart/src/lib/security-policy.ts",
];
const hash = (value) => createHash("sha256").update(value).digest("hex");
export function getM20BrowserMetadata(appRoot) {
  const repository = path.resolve(appRoot, "../..");
  const build = path.join(appRoot, ".next/BUILD_ID");
  const require = createRequire(path.join(appRoot, "package.json"));
  return {
    scope: "m20-fixture-integration-not-live-provider-certification",
    commit: execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repository,
      encoding: "utf8",
    }).trim(),
    buildId: fs.existsSync(build)
      ? fs.readFileSync(build, "utf8").trim()
      : null,
    sourceHash: hash(
      sources
        .map(
          (file) =>
            file +
            "\n" +
            hash(
              fs
                .readFileSync(path.join(repository, file), "utf8")
                .replace(/^\uFEFF/, "")
                .replace(/\r\n?/g, "\n"),
            ),
        )
        .join("\n"),
    ),
    nodeVersion: process.versions.node,
    playwrightVersion: require("@playwright/test/package.json").version,
    ciRunId: process.env.GITHUB_RUN_ID ?? null,
    ciRunAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
  };
}
