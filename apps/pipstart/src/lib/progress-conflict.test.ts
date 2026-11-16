import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  PROGRESS_CONFLICT_MESSAGE,
  PROGRESS_NOT_SAVED_MESSAGE,
  progressSaveErrorMessage,
} from "./progress-conflict";

const read = (file: string) =>
  fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("lesson save conflicts", () => {
  it("reports a stale save (PT409) as a change on another device", () => {
    expect(progressSaveErrorMessage("PT409")).toBe(PROGRESS_CONFLICT_MESSAGE);
    expect(PROGRESS_CONFLICT_MESSAGE).toBe(
      "Progress changed on another device. Refresh and try again.",
    );
  });

  it("keeps the pre-migration 40001 code as the same conflict", () => {
    expect(progressSaveErrorMessage("40001")).toBe(PROGRESS_CONFLICT_MESSAGE);
  });

  it("reports every other failure as not saved", () => {
    for (const code of [undefined, null, "", "42501", "PGRST116", "P0001"])
      expect(progressSaveErrorMessage(code)).toBe(PROGRESS_NOT_SAVED_MESSAGE);
  });

  it("is what the lesson completion action uses", () => {
    const action = read("src/app/learn/progress-actions.ts");
    expect(action).toContain("progressSaveErrorMessage(error.code)");
    expect(action).not.toContain('"40001"');
  });

  it("the migration answers a stale revision with PT409, never 40001", () => {
    const migration = read(
      "../../supabase/migrations/20261120090000_pipstart_m22_conflict_codes.sql",
    );
    expect(migration).toContain(
      "raise exception 'progress conflict' using errcode = 'PT409';",
    );
    expect(migration).toContain(
      "raise exception using errcode='PT409',message='Default-closed staff version changed';",
    );
    expect(migration).not.toMatch(/errcode\s*=\s*'40001'/);
  });
});

describe("assessment reconciliation log", () => {
  it("does not log the learner's user ID", () => {
    const actions = read("src/app/learn/assessment-actions.ts");
    const start = actions.indexOf(
      'console.error("Assessment progress reconciliation failed"',
    );
    expect(start).toBeGreaterThan(-1);
    const entry = actions.slice(start, actions.indexOf("});", start));
    expect(entry).toContain("attemptId: row.id");
    expect(entry).not.toContain("userId");
    expect(entry).not.toContain("session.user");
  });
});
