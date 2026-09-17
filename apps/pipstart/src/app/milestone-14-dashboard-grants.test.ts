import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(import.meta.dirname);
const repositoryRoot = path.resolve(process.cwd(), "../..");

const dashboardServer = fs.readFileSync(
  path.join(appRoot, "../lib/dashboard-server.ts"),
  "utf8",
);
const grantMigration = fs.readFileSync(
  path.join(
    repositoryRoot,
    "supabase/migrations/20260917173000_pipstart_dashboard_assessment_completion_user_id_grant.sql",
  ),
  "utf8",
);

describe("Milestone 14 dashboard assessment completion grants", () => {
  it("keeps the dashboard assessment-completion query explicitly user-scoped", () => {
    expect(dashboardServer).toContain(
      '.from("pipstart_assessment_completions")',
    );
    expect(dashboardServer).toContain('.eq("user_id", user.id)');
  });

  it("grants only the missing user_id column needed by that authenticated filter", () => {
    expect(grantMigration).toContain("grant select (user_id)");
    expect(grantMigration).toContain(
      "on public.pipstart_assessment_completions",
    );
    expect(grantMigration).toContain("to authenticated");
    expect(grantMigration).not.toContain(
      "grant select on public.pipstart_assessment_completions",
    );
  });
});
