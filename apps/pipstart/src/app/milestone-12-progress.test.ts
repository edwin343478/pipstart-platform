import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "../../supabase/migrations/20260916100000_pipstart_permanent_progress.sql",
  ),
  "utf8",
);
const importHardeningMigration = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "../../supabase/migrations/20260916160000_pipstart_progress_import_union_hardening.sql",
  ),
  "utf8",
);
describe("Milestone 12 database contract", () => {
  it("cascades deletion and enables RLS on every progress table", () => {
    expect(
      migration.match(/references auth\.users\(id\) on delete cascade/g) ?? [],
    ).toHaveLength(4);
    expect(migration.match(/enable row level security/g) ?? []).toHaveLength(4);
    expect(migration).not.toMatch(
      /grant (insert|update|delete).*authenticated/i,
    );
  });
  it("uses hardened functions, authenticated ownership and server timestamps", () => {
    expect(migration.match(/security definer/g) ?? []).toHaveLength(4);
    expect(migration.match(/set search_path = ''/g) ?? []).toHaveLength(4);
    expect(migration).toContain("current_user_id uuid := (select auth.uid())");
    expect(migration).toContain("change_time timestamptz := now()");
  });
  it("guards duplicates, stale writes, replay and event flooding", () => {
    expect(migration).toContain("primary key (user_id, lesson_id)");
    expect(migration).toContain("current_record.revision <> expected_revision");
    expect(migration).toContain("primary key (user_id, import_fingerprint)");
    expect(migration).toContain("interval '5 minutes'");
    expect(migration).toContain("on conflict (user_id, lesson_id) do nothing");
  });
  it("revokes every progress mutation function before authenticated grants", () => {
    expect(
      migration.match(/from public, anon, authenticated/g) ?? [],
    ).toHaveLength(4);
  });

  it("union-imports safe completion without resurrecting a deliberate undo", () => {
    expect(importHardeningMigration).toContain(
      "on conflict (user_id, lesson_id) do update set",
    );
    expect(importHardeningMigration).toContain("is_complete = true");
    expect(importHardeningMigration).toContain(
      "not public.pipstart_lesson_progress.is_complete",
    );
    expect(importHardeningMigration).toContain(
      "learning_event.event_type = 'lesson_reopened'",
    );
    expect(importHardeningMigration).toContain(
      "if found then imported_count := imported_count + 1",
    );
  });

  it("keeps guarded imports idempotent and least-privileged", () => {
    // The primary key remains defined in the immutable original migration.
    expect(migration).toContain("primary key (user_id, import_fingerprint)");
    expect(importHardeningMigration).toContain("if not found then return 0");
    expect(importHardeningMigration).toContain("security definer");
    expect(importHardeningMigration).toContain("set search_path = ''");
    expect(importHardeningMigration).toContain(
      "from public, anon, authenticated",
    );
  });
});
