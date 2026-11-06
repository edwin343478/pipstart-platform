import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
vi.mock("@/app/admin/staff/content/actions", () => ({
  readEditorialWorkspaceAction: vi.fn(),
}));
import { StaffContentWorkspace } from "@/components/staff/staff-content-workspace";
import { runEditorialLifecycle } from "./editorial-lifecycle";
import { compareRevisionBodies } from "./revision-compare";

// M22 MP07b: quizzes join the library's revision view, review and history, but not archive or hold.
const quiz = (patch: Record<string, unknown> = {}) => ({
  metadata: {
    title: "Quiz",
    version: 1,
    scope: "module",
    passingPercentage: 70,
    retakeCooldownSeconds: 60,
    governance: { reviewer: "PRIVATE_GOVERNANCE" },
  },
  questions: [
    {
      id: "q1",
      type: "single-choice",
      prompt: "Pick one",
      explanation: "Because",
      choices: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      correctChoiceIds: ["a"],
      hidden: "PRIVATE_ATTRIBUTE",
    },
  ],
  ...patch,
});
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());
describe("M22 MP07b quizzes in the content library", () => {
  it("offers View revision and the quiz editor for quiz rows", () => {
    const html = renderToStaticMarkup(
      <StaffContentWorkspace
        canEdit
        initialPage={{
          rows: [
            {
              id: "quiz-1",
              family: "quiz",
              learning_path: "forex",
              category: null,
              parent_id: "module-1",
              latest_revision: 2,
              state: "approved",
              trashed: false,
            },
          ],
          next: null,
        }}
      />,
    );
    expect(html).toContain("View latest revision of quiz-1");
    expect(html).toContain('href="/admin/staff/content/quiz?id=quiz-1"');
    expect(html).not.toContain("Separate editor");
  });

  it("compares quiz revisions field by field and line by line, through the editable projection only", () => {
    const after = quiz();
    after.metadata = { ...after.metadata, version: 2, passingPercentage: 80 };
    after.questions = [
      {
        ...after.questions[0],
        choices: [
          { id: "a", label: "A" },
          { id: "b", label: "B changed" },
        ],
        correctChoiceIds: ["b"],
      },
    ];
    const c = compareRevisionBodies("quiz", quiz(), after)!;
    expect(c.fields).toEqual([
      { label: "Version", before: "1", after: "2" },
      { label: "Passing percentage", before: "70", after: "80" },
    ]);
    expect(c.lines).toEqual([
      {
        op: "removed",
        position: 2,
        label: "Question 1 choice",
        text: "A · correct · a",
      },
      {
        op: "removed",
        position: 3,
        label: "Question 1 choice",
        text: "B · b",
      },
      {
        op: "added",
        position: 2,
        label: "Question 1 choice",
        text: "A · a",
      },
      {
        op: "added",
        position: 3,
        label: "Question 1 choice",
        text: "B changed · correct · b",
      },
    ]);
    const text = JSON.stringify(c);
    expect(text).not.toContain("PRIVATE_GOVERNANCE");
    expect(text).not.toContain("PRIVATE_ATTRIBUTE");
    expect(compareRevisionBodies("quiz", quiz(), { metadata: {} })).toBeNull();
  });

  it("refuses to archive, restore or hold a quiz, without writing", async () => {
    const rpc = vi.fn((fn: string) => ({
      abortSignal: () =>
        Promise.resolve({
          data:
            fn === "pipstart_staff_access"
              ? {
                  authorized: true,
                  user_id: "d1000000-0000-4000-8000-000000000001",
                  roles: ["owner"],
                  capabilities: ["staff.enter"],
                }
              : {
                  item: {
                    id: "quiz-1",
                    family: "quiz",
                    learning_path: "forex",
                    parent_id: "module-1",
                    latest_revision: 3,
                    trashed: false,
                    on_hold: false,
                  },
                  revision: {
                    revision_no: 3,
                    schema_version: 1,
                    body: quiz(),
                    body_sha256: "a".repeat(64),
                    base_revision: 2,
                    author_is_me: false,
                    state: "approved",
                    created_at: "2026-11-05T10:00:00.000Z",
                  },
                  decisions: [],
                  review_required: false,
                },
          error: null,
        }),
    }));
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "d1000000-0000-4000-8000-000000000001" } },
          error: null,
        }),
      },
      rpc,
    } as unknown as SupabaseClient;
    for (const action of ["archive", "hold"])
      expect(
        await runEditorialLifecycle(client, {
          action,
          id: "quiz-1",
          revision: 3,
          sha: "a".repeat(64),
          reason: "Retired",
        }),
      ).toEqual({ kind: "unavailable" });
    expect(
      rpc.mock.calls.filter(
        (c) =>
          !["pipstart_staff_access", "pipstart_editorial_item"].includes(c[0]),
      ),
    ).toEqual([]);
  });
});
