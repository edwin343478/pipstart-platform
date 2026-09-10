import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(import.meta.dirname);

const routes = [
  "about/page.tsx",
  "contact/page.tsx",
  "legal/privacy-policy/page.tsx",
  "legal/terms/page.tsx",
  "legal/cookie-policy/page.tsx",
  "legal/risk-disclosure/page.tsx",
];

describe("PipStart public and legal pages", () => {
  it.each(routes)("provides the %s route", (route) => {
    expect(fs.existsSync(path.join(appRoot, route))).toBe(true);
  });

  it("uses the PipStart reference shell", () => {
    const shell = fs.readFileSync(
      path.join(appRoot, "../components/reference-page-shell.tsx"),
      "utf8",
    );
    const siteChrome = fs.readFileSync(
      path.join(appRoot, "../components/site-chrome.tsx"),
      "utf8",
    );

    expect(shell).toContain("<CompactFooter");
    expect(siteChrome).toContain("PipStart · pipstart.net");
    expect(shell).not.toContain("Skillcima");
    expect(siteChrome).not.toContain("Skillcima");
  });

  it("redirects the former risk-disclaimer URL permanently", () => {
    const nextConfig = fs.readFileSync(
      path.join(appRoot, "../../next.config.ts"),
      "utf8",
    );

    expect(nextConfig).toContain('source: "/legal/risk-disclaimer"');
    expect(nextConfig).toContain('destination: "/legal/risk-disclosure"');
    expect(nextConfig).toContain("permanent: true");
  });
});
