import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "../../supabase/migrations/20260917140000_pipstart_learner_dashboard_foundation.sql",
  ),
  "utf8",
);
const dashboardServer = fs.readFileSync(
  path.resolve(process.cwd(), "src/lib/dashboard-server.ts"),
  "utf8",
);

describe("Milestone 14 dashboard foundation", () => {
  it("stores lesson bookmarks with deletion cascade and owner RLS", () => {
    expect(migration).toContain("create table public.pipstart_bookmarks");
    expect(migration).toContain("references auth.users(id) on delete cascade");
    expect(migration).toContain("resource_type = 'lesson'");
    expect(migration).toContain(
      "primary key (user_id, resource_type, resource_id)",
    );
    expect(migration).toContain("enable row level security");
    expect(
      migration.match(/\(select auth\.uid\(\)\) = user_id/g) ?? [],
    ).toHaveLength(3);
  });

  it("permits bookmark create/read/delete but exposes no update path", () => {
    expect(migration).toContain(
      "revoke all on public.pipstart_bookmarks from public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant insert (user_id, resource_type, resource_id)",
    );
    expect(migration).toContain(
      "grant delete on public.pipstart_bookmarks to authenticated",
    );
    expect(migration).not.toMatch(/for update|grant update/i);
  });

  it("keeps assessment answer payloads out of the dashboard query", () => {
    expect(dashboardServer).toContain(
      '"quiz_id,quiz_version,attempt_number,score,max_score,passed,submitted_at"',
    );
    expect(dashboardServer).not.toContain("submitted_answers");
    expect(dashboardServer).not.toContain("review_snapshot");
    expect(dashboardServer).not.toContain("draft_answers");
  });

  it("loads the dashboard only for the authenticated learner", () => {
    expect(dashboardServer).toContain('requireUser("/dashboard")');
    expect(dashboardServer).toContain('.eq("user_id", user.id)');
  });
});
