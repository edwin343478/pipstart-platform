import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "../../supabase/migrations/20260916233000_pipstart_assessment_progress_integration.sql",
  ),
  "utf8",
);
const hardeningMigration = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "../../supabase/migrations/20260917100000_pipstart_assessment_hardening.sql",
  ),
  "utf8",
);
const assessmentActions = fs.readFileSync(
  path.resolve(process.cwd(), "src/app/learn/assessment-actions.ts"),
  "utf8",
);
const progressActions = fs.readFileSync(
  path.resolve(process.cwd(), "src/app/learn/progress-actions.ts"),
  "utf8",
);
const reconciliation = fs.readFileSync(
  path.resolve(process.cwd(), "src/lib/course-progress-server.ts"),
  "utf8",
);

describe("Milestone 13 assessment progress database contract", () => {
  it("stores one durable user-owned pass per assessment", () => {
    expect(migration).toContain(
      "create table public.pipstart_assessment_completions",
    );
    expect(migration).toContain("references auth.users(id) on delete cascade");
    expect(migration).toContain("primary key (user_id, quiz_id)");
    expect(migration).toContain(
      "alter table public.pipstart_assessment_completions enable row level security",
    );
    expect(migration).toContain(
      "Learners read their own assessment completions",
    );
  });

  it("records passes atomically while preserving earlier earned completion", () => {
    expect(migration).toContain("if requested_passed then");
    expect(migration).toContain(
      "insert into public.pipstart_assessment_completions",
    );
    expect(migration).toContain("on conflict (user_id, quiz_id) do update set");
    expect(migration).toContain("earned_at = least(");
    expect(migration).toContain("highest_passed_version = greatest(");
    expect(migration).toContain("last_passed_at = greatest(");
  });

  it("reconciles course completion from trusted lessons and durable passes", () => {
    expect(hardeningMigration).toContain(
      "create or replace function public.pipstart_reconcile_course_completion",
    );
    expect(hardeningMigration).toContain(
      "from public.pipstart_lesson_progress as progress",
    );
    expect(hardeningMigration).toContain(
      "from public.pipstart_assessment_completions as completion",
    );
    expect(hardeningMigration).toContain(
      "grant execute on function public.pipstart_reconcile_course_completion",
    );
    expect(hardeningMigration).toContain("to service_role");
    expect(hardeningMigration).toContain(
      "drop function if exists public.pipstart_set_enrollment_completion(text, boolean)",
    );
  });

  it("records assessment, module and course learning events", () => {
    for (const event of [
      "quiz_attempted",
      "quiz_passed",
      "module_completed",
      "course_completed",
    ]) {
      expect(hardeningMigration).toContain(`'${event}'`);
    }
    expect(hardeningMigration).toContain(
      "create or replace function public.pipstart_reconcile_module_completion",
    );
  });

  it("uses curriculum-derived reconciliation after lesson and quiz mutations", () => {
    expect(reconciliation).toContain("getCourseLessonIds(course)");
    expect(reconciliation).toContain("getCourseRequiredAssessmentIds(course)");
    expect(reconciliation).toContain(
      "getModuleRequiredAssessmentIds(curriculumModule)",
    );
    expect(reconciliation).toContain(
      'admin.rpc(\n      "pipstart_reconcile_module_completion"',
    );
    expect(reconciliation).toContain(
      'admin.rpc("pipstart_reconcile_course_completion"',
    );
    expect(progressActions).toContain("reconcileCourseEnrollmentForUser(");
    expect(assessmentActions).toContain("reconcileCourseEnrollmentForUser(");
  });

  it("uses a shared database rate limiter for anonymous submissions", () => {
    expect(hardeningMigration).toContain(
      "create table public.pipstart_assessment_rate_limits",
    );
    expect(hardeningMigration).toContain(
      "create or replace function public.pipstart_consume_assessment_rate_limit",
    );
    expect(assessmentActions).toContain(
      'admin.rpc(\n    "pipstart_consume_assessment_rate_limit"',
    );
  });

  it("loads assessment completions into the permanent progress snapshot", () => {
    expect(progressActions).toContain(
      '.from("pipstart_assessment_completions")',
    );
    expect(progressActions).toContain("highest_passed_version");
    expect(progressActions).toContain("assessments: assessmentRows.map(");
  });
});
