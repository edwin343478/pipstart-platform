import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dashboardPage = fs.readFileSync(
  path.resolve(process.cwd(), "src/app/dashboard/page.tsx"),
  "utf8",
);
const accountShell = fs.readFileSync(
  path.resolve(process.cwd(), "src/components/account-shell.tsx"),
  "utf8",
);
const loginPage = fs.readFileSync(
  path.resolve(process.cwd(), "src/app/login/page.tsx"),
  "utf8",
);

describe("Milestone 14 learner dashboard route", () => {
  it("is authenticated, dynamic and excluded from indexing", () => {
    expect(dashboardPage).toContain("loadDashboardData()");
    expect(dashboardPage).toContain('dynamic = "force-dynamic"');
    expect(dashboardPage).toContain("revalidate = 0");
    expect(dashboardPage).toContain("follow: false, index: false");
  });

  it("renders every required dashboard information area", () => {
    for (const label of [
      "Continue learning",
      "Enrolled courses",
      "Recent lessons",
      "Quiz scores",
      "Bookmarks",
      "Completed courses",
      "Settings and notifications",
    ]) {
      expect(dashboardPage).toContain(label);
    }
    expect(dashboardPage).toContain("Choose your first learning path");
  });

  it("keeps settings centralized and links the learner account to the dashboard", () => {
    expect(dashboardPage).toContain('href="/account/settings"');
    expect(dashboardPage).toContain('href="/account/email-preferences"');
    expect(accountShell).toContain('href="/dashboard"');
  });

  it("uses the dashboard as the ordinary login destination", () => {
    expect(loginPage).toContain('safeInternalRedirect(next, "/dashboard")');
    expect(loginPage).toContain("redirect(destination)");
  });
});
