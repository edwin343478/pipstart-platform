import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const page = fs.readFileSync(
  path.resolve(process.cwd(), "src/app/learn/forex/level-1/quiz/page.tsx"),
  "utf8",
);
const client = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "src/app/learn/forex/level-1/quiz/quiz-client.tsx",
  ),
  "utf8",
);
const css = fs.readFileSync(
  path.resolve(
    process.cwd(),
    "src/app/learn/forex/level-1/quiz/quiz.module.css",
  ),
  "utf8",
);

describe("Milestone 13 learner quiz UX contract", () => {
  it("serializes only the public assessment from the server page", () => {
    expect(page).toContain("getCurrentPublishedAssessment");
    expect(page).toContain("toPublicAssessment(assessment)");
    expect(client).not.toContain("assessment-registry");
  });

  it("uses native accessible question groups and explicit submit confirmation", () => {
    expect(client).toContain("<fieldset");
    expect(client).toContain("<legend>");
    expect(client).toContain('role="alert"');
    expect(client).toContain('aria-live="polite"');
    expect(client).toContain("Review unanswered");
    expect(client).toContain("Submit anyway");
  });

  it("supports anonymous and authenticated result paths", () => {
    expect(client).toContain("gradeAnonymousAssessmentAction");
    expect(client).toContain("submitAssessmentAttemptAction");
    expect(client).toContain("loadAssessmentHistoryAction");
    expect(client).toContain("Sign in to save future quiz attempts");
  });

  it("keeps the new quiz controls mobile-first without horizontal sizing", () => {
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("min-width: 0");
    expect(css).not.toMatch(/^\s*width:\s*\d{3,}px/m);
  });
});
