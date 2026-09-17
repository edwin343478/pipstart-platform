import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "../../supabase/migrations/20260916230000_pipstart_assessment_attempts.sql",
  ),
  "utf8",
);

const actions = fs.readFileSync(
  path.resolve(process.cwd(), "src/app/learn/assessment-actions.ts"),
  "utf8",
);

describe("Milestone 13 assessment persistence contract", () => {
  it("stores immutable, user-owned attempt history with RLS and cascade deletion", () => {
    expect(migration).toContain(
      "user_id uuid not null references auth.users(id) on delete cascade",
    );
    expect(migration).toContain(
      "alter table public.pipstart_assessment_attempts enable row level security",
    );
    expect(migration).toContain("for select\n  to authenticated");
    expect(migration).toContain("old.status = 'submitted'");
    expect(migration).toContain(
      "before update on public.pipstart_assessment_attempts",
    );
    expect(migration).not.toContain("before update or delete");
  });

  it("prevents direct learner mutations and reserves trusted RPCs for service role", () => {
    expect(migration).toContain(
      "revoke all on table public.pipstart_assessment_attempts\n  from public, anon, authenticated",
    );
    expect(migration).not.toMatch(
      /grant (insert|update|delete).*authenticated/i,
    );
    expect(migration.match(/security definer/g) ?? []).toHaveLength(3);
    expect(migration.match(/set search_path = ''/g) ?? []).toHaveLength(4);
    expect(migration.match(/to service_role;/g) ?? []).toHaveLength(3);
    expect(migration).not.toMatch(
      /grant execute on function public\.pipstart_(start|save|submit)[\s\S]*authenticated/i,
    );
  });

  it("serializes start/resume, enforces one active attempt and numbers retakes", () => {
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("pipstart_assessment_one_active_attempt_idx");
    expect(migration).toContain("where status = 'in_progress'");
    expect(migration).toContain("coalesce(max(attempt_number), 0) + 1");
    expect(migration).toContain(
      "if found then\n    return next current_attempt",
    );
  });

  it("freezes presentation state, persists drafts and makes submit idempotent", () => {
    expect(migration).toContain("question_order jsonb not null");
    expect(migration).toContain("choice_order jsonb not null");
    expect(migration).toContain("draft_answers jsonb not null");
    expect(migration).toContain("public_snapshot jsonb not null");
    expect(migration).toContain("requested_max_score <> jsonb_array_length");
    expect(migration).toContain(
      "if current_attempt.status = 'submitted' then\n    return next current_attempt",
    );
    expect(migration).toContain("pipstart_assessment_submission_token_idx");
  });

  it("uses trusted server grading and the admin boundary for mutations", () => {
    expect(actions).toContain("gradeAssessment");
    expect(actions).toContain("createSupabaseAdminClient");
    expect(actions).toContain('admin.rpc("pipstart_start_assessment_attempt"');
    expect(actions).toContain('admin.rpc("pipstart_save_assessment_draft"');
    expect(actions).toContain('"pipstart_submit_assessment_attempt"');
    expect(actions).toContain("gradeAnonymousAssessmentAction");
    expect(actions).toContain("pipstart_consume_assessment_rate_limit");
  });

  it("keeps historical answer keys out of pre-submit history payloads", () => {
    const historyStart = actions.indexOf("function safeHistoryAttempt");
    const historyEnd = actions.indexOf("function persistedGrade");
    const historySerializer = actions.slice(historyStart, historyEnd);

    expect(historyStart).toBeGreaterThan(-1);
    expect(historySerializer).not.toContain("reviewSnapshot");
    expect(historySerializer).not.toContain("submittedAnswers");
    expect(actions).toContain("map(safeHistoryAttempt)");
  });
});
