"use client";
import { useState } from "react";
import { gradeAssessment } from "@/lib/assessment";
import {
  quizDraftProblems,
  type QuizDraftFields,
  type QuizDraftQuestion,
} from "@/lib/content/quiz-draft-contract";
import styles from "./staff-quiz-editor.module.css";

type Graded = ReturnType<typeof gradeAssessment>;

/**
 * Staff sandbox: answers the current draft as a learner would and grades it in this tab with the
 * learner grader. Nothing is sent: no attempt, result, progress or learner record is created.
 */
export function StaffQuizPreview({
  id,
  version,
  fields,
  questions,
}: {
  id: string;
  version: number;
  fields: QuizDraftFields;
  questions: QuizDraftQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({}),
    [graded, setGraded] = useState<Graded | null>(null);
  const problems = quizDraftProblems(fields, questions);
  if (problems.length)
    return (
      <section aria-label="Quiz sandbox preview" className={styles.preview}>
        <h2>Quiz sandbox preview</h2>
        <p role="status">Fix the listed problems to preview this quiz.</p>
      </section>
    );
  const sandbox: Parameters<typeof gradeAssessment>[0] = {
    id,
    version,
    title: fields.title,
    scope: "module",
    learningPath: "forex",
    courseId: "sandbox",
    passingPercentage: fields.passingPercentage,
    retakeCooldownSeconds: fields.retakeCooldownSeconds,
    status: "draft",
    governance: {
      author: "sandbox",
      nextReviewAt: "",
      reviewedAt: "",
      reviewer: "sandbox",
      sources: [],
    },
    questions,
  };
  const choose = (q: QuizDraftQuestion, choice: string, on: boolean) =>
    setAnswers({
      ...answers,
      [q.id]:
        q.type === "multiple-answer"
          ? on
            ? [...(answers[q.id] ?? []), choice]
            : (answers[q.id] ?? []).filter((c) => c !== choice)
          : [choice],
    });
  const label = (q: QuizDraftQuestion, ids: readonly string[]) =>
    q.choices
      .filter((c) => ids.includes(c.id))
      .map((c) => c.label)
      .join("; ") || "No answer";
  return (
    <section aria-label="Quiz sandbox preview" className={styles.preview}>
      <h2>Quiz sandbox preview</h2>
      <p>
        Sandbox only. Answers are graded in this tab against the draft&apos;s
        answer key. No attempt, result, progress or learner record is created,
        and nothing is sent to the server.
      </p>
      <h3>{fields.title}</h3>
      <p>
        Version {version} · {questions.length} question
        {questions.length === 1 ? "" : "s"} · pass mark{" "}
        {fields.passingPercentage}%
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setGraded(gradeAssessment(sandbox, answers));
        }}
      >
        {questions.map((q, n) => {
          const result = graded?.questions[n];
          return (
            <fieldset key={q.id} className={styles.question}>
              <legend>
                Question {n + 1} of {questions.length}
              </legend>
              <p>{q.prompt}</p>
              {q.type === "multiple-answer" && <p>Select all that apply.</p>}
              {q.choices.map((c) => (
                <label key={c.id} className={styles.choice}>
                  <input
                    type={q.type === "multiple-answer" ? "checkbox" : "radio"}
                    name={"sandbox-" + q.id}
                    disabled={!!graded}
                    checked={(answers[q.id] ?? []).includes(c.id)}
                    onChange={(e) => choose(q, c.id, e.target.checked)}
                  />
                  {c.label}
                </label>
              ))}
              {result && (
                <div role="note">
                  <p>
                    <strong>
                      {result.correct ? "Correct" : "Not correct"}
                    </strong>
                    {!result.answered && " · Not answered"}
                  </p>
                  <p>Your answer: {label(q, result.submittedChoiceIds)}</p>
                  <p>Correct answer: {label(q, result.correctChoiceIds)}</p>
                  <p>{result.explanation}</p>
                </div>
              )}
            </fieldset>
          );
        })}
        {graded ? (
          <div role="status" aria-live="polite">
            <p>
              Sandbox score {graded.correctCount} of {graded.maxScore} (
              {graded.percentage}%):{" "}
              {graded.passed ? "would pass" : "would not pass"} at{" "}
              {fields.passingPercentage}%. Nothing was recorded.
            </p>
            <button
              type="button"
              onClick={() => {
                setGraded(null);
                setAnswers({});
              }}
            >
              Clear sandbox answers
            </button>
          </div>
        ) : (
          <button type="submit">Check sandbox answers</button>
        )}
      </form>
    </section>
  );
}
