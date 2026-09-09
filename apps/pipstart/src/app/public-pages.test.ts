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
  "legal/risk-disclaimer/page.tsx",
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

    expect(shell).toContain("PipStart · pipstart.net");
    expect(shell).not.toContain("Skillcima");
  });
});
