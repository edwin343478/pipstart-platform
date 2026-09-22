"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Breadcrumbs } from "../../../../../components/breadcrumbs";
import { LearningHeader } from "../../../../../components/learning-structure";
import {
  gradeAnonymousAssessmentAction,
  loadAssessmentHistoryAction,
  retryAssessmentProgressAction,
  saveAssessmentDraftAction,
  startAssessmentAttemptAction,
  submitAssessmentAttemptAction,
} from "../../../assessment-actions";
import type { gradeAssessment } from "../../../../../lib/assessment";
import {
  coerceAssessmentAnswers,
  normalizeAssessmentPresentation,
  orderedAssessmentQuestions,
  unansweredAssessmentQuestionIds,
  updateAssessmentAnswer,
  type AssessmentClientAnswers,
  type AssessmentPresentation,
  type PublicAssessment,
} from "../../../../../lib/assessment-ux";
import { usePermanentProgress } from "../../../../../lib/use-permanent-progress";
import { forexLessons } from "../lessons";
import {
  FOREX_LEVEL_ONE_PROGRESS_KEY,
  FOREX_PROGRESS_CHANGE_EVENT,
  parseLessonProgress,
  serializeLessonProgress,
} from "../progress";
import lessonStyles from "../page.module.css";
import styles from "./quiz.module.css";

const lessonIds = forexLessons.map((lesson) => lesson.id);
type Grade = ReturnType<typeof gradeAssessment>;
type HistoryAttempt = {
  attemptNumber: number;
  id: string;
  maxScore: number | null;
  passed: boolean | null;
  quizId: string;
  quizVersion: number;
  score: number | null;
  startedAt: string;
  status: "in_progress" | "submitted";
  submittedAt: string | null;
};

type QuizState = {
  attemptId: string | null;
  attemptNumber: number | null;
  authenticated: boolean;
  presentation: AssessmentPresentation;
};

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function historyDate(value: string | null) {
  if (!value) return "Not submitted";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function draftBackupKey(attemptId: string) {
  return `pipstart:assessment-draft:${attemptId}`;
}

function readDraftBackup(attemptId: string) {
  try {
    const value = window.localStorage.getItem(draftBackupKey(attemptId));
    return value ? coerceAssessmentAnswers(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}

function writeDraftBackup(attemptId: string, answers: AssessmentClientAnswers) {
  try {
    window.localStorage.setItem(
      draftBackupKey(attemptId),
      JSON.stringify(answers),
    );
  } catch {
    /* The debounced account save remains available. */
  }
}

function clearDraftBackup(attemptId: string) {
  try {
    window.localStorage.removeItem(draftBackupKey(attemptId));
  } catch {
    /* A stale local backup is harmless and is scoped to this attempt. */
  }
}

export function ForexFoundationsQuiz({
  assessment,
}: {
  assessment: PublicAssessment;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [answers, setAnswers] = useState<AssessmentClientAnswers>({});
  const [history, setHistory] = useState<HistoryAttempt[]>([]);
  const [result, setResult] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmUnanswered, setConfirmUnanswered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("Preparing quiz…");
  const [saveFailed, setSaveFailed] = useState(false);
  const [progressPending, setProgressPending] = useState(false);
  const [saveRetryVersion, setSaveRetryVersion] = useState(0);
  const savedFingerprint = useRef("");
  const saveGeneration = useRef(0);
  const submittingRef = useRef(false);
  const confirmationRef = useRef<HTMLDivElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const progress = usePermanentProgress({
    courseId: "forex-kindergarten",
    eventName: FOREX_PROGRESS_CHANGE_EVENT,
    parse: parseLessonProgress,
    serialize: serializeLessonProgress,
    storageKey: FOREX_LEVEL_ONE_PROGRESS_KEY,
    validIds: lessonIds,
  });

  const beginAttempt = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setConfirmUnanswered(false);
    setSaveFailed(false);
    setProgressPending(false);
    saveGeneration.current += 1;

    try {
      const started = await startAssessmentAttemptAction({
        quizId: assessment.id,
        version: assessment.version,
      });

      if (started.authenticated) {
        if (!started.attempt)
          throw new Error("Quiz attempt could not be loaded.");
        const presentation = normalizeAssessmentPresentation(
          assessment,
          started.attempt,
        );
        const remoteDraft = coerceAssessmentAnswers(
          started.attempt.draftAnswers,
        );
        const restored = readDraftBackup(started.attempt.id) ?? remoteDraft;
        setQuiz({
          attemptId: started.attempt.id,
          attemptNumber: started.attempt.attemptNumber,
          authenticated: true,
          presentation,
        });
        setAnswers(restored);
        savedFingerprint.current = JSON.stringify(remoteDraft);
        setSaveMessage("Your answers are saved as you go.");

        try {
          const loadedHistory = await loadAssessmentHistoryAction(
            assessment.id,
          );
          setHistory(loadedHistory.attempts as HistoryAttempt[]);
        } catch {
          setHistory([]);
        }
      } else {
        if (!("presentation" in started) || !started.presentation) {
          throw new Error("Quiz could not be prepared.");
        }
        setQuiz({
          attemptId: null,
          attemptNumber: null,
          authenticated: false,
          presentation: normalizeAssessmentPresentation(
            assessment,
            started.presentation,
          ),
        });
        setAnswers({});
        setHistory([]);
        savedFingerprint.current = "{}";
        setSaveMessage(
          "Anonymous quiz progress is not saved if you leave this page.",
        );
      }
    } catch (cause) {
      setQuiz(null);
      setError(message(cause, "Quiz could not be prepared. Try again."));
      setSaveMessage("Quiz could not be prepared.");
    } finally {
      setLoading(false);
    }
  }, [assessment]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void beginAttempt();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [beginAttempt]);

  useEffect(() => {
    if (
      !quiz?.authenticated ||
      !quiz.attemptId ||
      loading ||
      submitting ||
      result
    ) {
      return;
    }

    const fingerprint = JSON.stringify(answers);
    if (fingerprint === savedFingerprint.current) return;
    const generation = ++saveGeneration.current;

    const timer = window.setTimeout(() => {
      void saveAssessmentDraftAction({
        answers,
        attemptId: quiz.attemptId!,
        quizId: assessment.id,
        version: assessment.version,
      })
        .then(() => {
          if (saveGeneration.current !== generation) return;
          savedFingerprint.current = fingerprint;
          setSaveFailed(false);
          setSaveMessage("Selections saved to your account.");
          clearDraftBackup(quiz.attemptId!);
        })
        .catch((cause) => {
          if (saveGeneration.current !== generation) return;
          setSaveFailed(true);
          setSaveMessage(
            message(cause, "Selections were not saved. Try again."),
          );
        });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [
    answers,
    assessment.id,
    assessment.version,
    loading,
    quiz,
    result,
    saveRetryVersion,
    submitting,
  ]);

  useEffect(() => {
    if (confirmUnanswered) confirmationRef.current?.focus();
  }, [confirmUnanswered]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  const questions = useMemo(
    () => (quiz ? orderedAssessmentQuestions(quiz.presentation) : []),
    [quiz],
  );
  const reviewByQuestion = useMemo(
    () =>
      new Map(result?.questions.map((item) => [item.questionId, item]) ?? []),
    [result],
  );
  const completedLessons = new Set(progress.completedIds);
  const quizPassed = Boolean(
    (quiz?.authenticated && result?.passed) ||
    progress.snapshot?.assessments?.some(
      (completion) => completion.assessmentId === assessment.id,
    ),
  );

  function renderSidebar(
    className: string,
    collapsible = false,
    collapsed = false,
  ) {
    return (
      <aside
        className={`${lessonStyles.sidebar} ${
          collapsed ? lessonStyles.sidebarCollapsed : ""
        } ${className}`}
        aria-label="Forex Kindergarten lessons"
        id={collapsible ? "forex-quiz-desktop-sidebar" : undefined}
      >
        <div className={lessonStyles.sidebarHeading}>
          <h2>
            <Link href="/learn/forex/level-1/forex-kindergarten">
              Forex Kindergarten
            </Link>
          </h2>
          {collapsible ? (
            <button
              type="button"
              className={lessonStyles.sidebarToggle}
              aria-controls="forex-quiz-desktop-sidebar"
              aria-expanded={!collapsed}
              aria-label={
                collapsed ? "Expand lesson sidebar" : "Collapse lesson sidebar"
              }
              onClick={() => setSidebarCollapsed((current) => !current)}
            >
              <span aria-hidden="true">{collapsed ? "›" : "‹"}</span>
            </button>
          ) : null}
        </div>
        <p className={lessonStyles.progressSummary} aria-live="polite">
          {progress.completedIds.length} of {forexLessons.length} complete
        </p>
        <nav>
          {forexLessons.map((lesson) => (
            <Link
              className={lessonStyles.upcomingLesson}
              href={lesson.href}
              key={lesson.id}
            >
              <span>{lesson.title}</span>
              {completedLessons.has(lesson.id) ? (
                <span
                  className={lessonStyles.completedMarker}
                  aria-hidden="true"
                >
                  ✓
                </span>
              ) : null}
            </Link>
          ))}
          <Link
            aria-current="page"
            className={lessonStyles.currentLesson}
            href="/learn/forex/level-1/quiz"
          >
            <span>Forex Foundations quiz</span>
            {quizPassed ? (
              <span className={lessonStyles.completedMarker} aria-hidden="true">
                ✓
              </span>
            ) : null}
          </Link>
        </nav>
      </aside>
    );
  }

  function changeAnswer(
    question: (typeof questions)[number],
    choiceId: string,
    checked: boolean,
  ) {
    setConfirmUnanswered(false);
    setSaveFailed(false);
    if (quiz?.authenticated) setSaveMessage("Saving selections…");
    setAnswers((current) => {
      const next = updateAssessmentAnswer(current, question, choiceId, checked);
      if (quiz?.authenticated && quiz.attemptId) {
        writeDraftBackup(quiz.attemptId, next);
      }
      return next;
    });
  }

  async function submit(force = false) {
    if (!quiz || submittingRef.current || result) return;
    const unanswered = unansweredAssessmentQuestionIds(
      quiz.presentation.publicSnapshot,
      answers,
    );
    if (unanswered.length && !force) {
      setConfirmUnanswered(true);
      return;
    }

    submittingRef.current = true;
    saveGeneration.current += 1;
    setSubmitting(true);
    setConfirmUnanswered(false);
    setError(null);
    setSaveMessage("Submitting quiz…");

    try {
      let grade: Grade;
      if (quiz.authenticated) {
        if (!quiz.attemptId) throw new Error("Quiz attempt is unavailable.");
        const submitted = await submitAssessmentAttemptAction({
          answers,
          attemptId: quiz.attemptId,
          quizId: assessment.id,
          submissionToken: crypto.randomUUID(),
          version: assessment.version,
        });
        grade = submitted.grade;
        clearDraftBackup(quiz.attemptId);
        setProgressPending(submitted.progressReconciliationPending);
        setSaveMessage(
          submitted.progressReconciliationPending
            ? "Quiz attempt saved. Course progress needs a refresh."
            : "Quiz attempt and course progress saved to your account.",
        );
        try {
          const loadedHistory = await loadAssessmentHistoryAction(
            assessment.id,
          );
          setHistory(loadedHistory.attempts as HistoryAttempt[]);
        } catch {
          if (!submitted.progressReconciliationPending) {
            setSaveMessage(
              "Quiz attempt saved. Attempt history could not be refreshed.",
            );
          }
        }
      } else {
        const submitted = await gradeAnonymousAssessmentAction({
          answers,
          quizId: assessment.id,
          version: assessment.version,
        });
        grade = submitted.grade;
        setSaveMessage("Result ready. This anonymous attempt is not saved.");
      }
      setResult(grade);
    } catch (cause) {
      setError(message(cause, "Quiz could not be submitted. Try again."));
      setSaveMessage("Quiz was not submitted.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  const unansweredCount = quiz
    ? unansweredAssessmentQuestionIds(quiz.presentation.publicSnapshot, answers)
        .length
    : 0;

  return (
    <main className={lessonStyles.page}>
      <LearningHeader
        allLevelsClassName={lessonStyles.allLevels}
        allLevelsHref="/learn/forex"
        allLevelsLabel="All Forex levels"
        brandClassName={lessonStyles.brand}
        className={lessonStyles.header}
        contextClassName={lessonStyles.levelContext}
        levelLabel="Level 1 · Forex Kindergarten"
      />

      <div
        className={`${lessonStyles.lessonLayout} ${
          sidebarCollapsed ? lessonStyles.lessonLayoutCollapsed : ""
        }`}
      >
        {renderSidebar(lessonStyles.desktopSidebar, true, sidebarCollapsed)}
        <details className={lessonStyles.mobileSidebar}>
          <summary className={lessonStyles.sidebarSummary}>
            <span>Forex Kindergarten</span>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="m5 8 5 5 5-5" />
            </svg>
          </summary>
          {renderSidebar(lessonStyles.mobileSidebarContent)}
        </details>

        <article className={lessonStyles.lesson}>
          <Breadcrumbs items={[{ label: assessment.title }]} />
          <p className={lessonStyles.eyebrow}>
            Level 1 · Module quiz · {assessment.questions.length} questions ·
            Pass mark {assessment.passingPercentage}%
          </p>
          <h1>{assessment.title}</h1>
          <p className={lessonStyles.introduction}>
            Check what you remember from the six Forex Foundations lessons. You
            can retake the quiz as many times as you need.
          </p>

          <section
            className={lessonStyles.keyPoints}
            aria-labelledby="quiz-help"
          >
            <h2 id="quiz-help">Before you start</h2>
            <p>
              Choose one answer unless the question says “Choose all that
              apply.”
            </p>
            <p>Explanations appear after you submit.</p>
            <p aria-live="polite">
              {saveMessage}
              {saveFailed ? (
                <>
                  {" "}
                  <button
                    className={styles.retrySave}
                    type="button"
                    onClick={() => {
                      setSaveFailed(false);
                      setSaveMessage("Retrying save…");
                      setSaveRetryVersion((current) => current + 1);
                    }}
                  >
                    Retry save
                  </button>
                </>
              ) : null}
            </p>
          </section>

          {error ? (
            <div
              className={styles.errorSummary}
              ref={errorRef}
              role="alert"
              tabIndex={-1}
            >
              <strong>Something needs attention.</strong>
              <p>{error}</p>
              {!quiz ? (
                <button type="button" onClick={() => void beginAttempt()}>
                  Try again
                </button>
              ) : null}
            </div>
          ) : null}

          {loading ? (
            <p className={styles.loading} role="status">
              Preparing your quiz…
            </p>
          ) : null}

          {!loading && quiz ? (
            <form
              className={styles.quizForm}
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              {questions.map((question, index) => {
                const selected = answers[question.id] ?? [];
                const review = reviewByQuestion.get(question.id);
                const correctLabels = review?.correctChoiceIds.flatMap((id) => {
                  const choice = question.choices.find(
                    (item) => item.id === id,
                  );
                  return choice ? [choice.label] : [];
                });

                return (
                  <fieldset
                    className={styles.questionCard}
                    disabled={Boolean(result) || submitting}
                    id={`question-${question.id}`}
                    key={question.id}
                    tabIndex={-1}
                  >
                    <legend>
                      <span className={styles.questionNumber}>
                        Question {index + 1} of {questions.length}
                      </span>
                      <span className={styles.questionPrompt}>
                        {question.prompt}
                      </span>
                    </legend>
                    {question.type === "multiple-answer" ? (
                      <p className={styles.questionHint}>
                        Choose all that apply.
                      </p>
                    ) : null}
                    <div className={styles.choices}>
                      {question.choices.map((choice) => (
                        <label className={styles.choice} key={choice.id}>
                          <input
                            checked={selected.includes(choice.id)}
                            name={question.id}
                            onChange={(event) =>
                              changeAnswer(
                                question,
                                choice.id,
                                event.currentTarget.checked,
                              )
                            }
                            type={
                              question.type === "multiple-answer"
                                ? "checkbox"
                                : "radio"
                            }
                            value={choice.id}
                          />
                          <span>{choice.label}</span>
                        </label>
                      ))}
                    </div>

                    {review ? (
                      <div
                        className={
                          review.correct
                            ? styles.correctReview
                            : styles.incorrectReview
                        }
                      >
                        <strong>
                          {review.correct ? "Correct" : "Needs review"}
                        </strong>
                        <p>{review.explanation}</p>
                        {!review.correct && correctLabels?.length ? (
                          <p>Correct answer: {correctLabels.join(", ")}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </fieldset>
                );
              })}

              {confirmUnanswered ? (
                <div
                  className={styles.confirmation}
                  ref={confirmationRef}
                  role="alert"
                  tabIndex={-1}
                >
                  <strong>
                    {unansweredCount} unanswered{" "}
                    {unansweredCount === 1 ? "question" : "questions"}.
                  </strong>
                  <p>You can review them or submit the quiz as it is.</p>
                  <div className={styles.inlineActions}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => {
                        const first = unansweredAssessmentQuestionIds(
                          quiz.presentation.publicSnapshot,
                          answers,
                        )[0];
                        setConfirmUnanswered(false);
                        if (first) {
                          document.getElementById(`question-${first}`)?.focus();
                        }
                      }}
                    >
                      Review unanswered
                    </button>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={() => void submit(true)}
                    >
                      Submit anyway
                    </button>
                  </div>
                </div>
              ) : null}

              {result ? (
                <section
                  aria-live="polite"
                  className={styles.result}
                  ref={resultRef}
                  tabIndex={-1}
                >
                  <span className={styles.resultLabel}>
                    {result.passed ? "Passed" : "Ready to retry"}
                  </span>
                  <h2>
                    {result.score} of {result.maxScore} correct ·{" "}
                    {result.percentage}%
                  </h2>
                  <p>
                    {result.passed
                      ? "Nice work — this module assessment is complete."
                      : "Review the explanations above, then try again when you’re ready."}
                  </p>
                  {quiz.authenticated && progressPending ? (
                    <p>
                      <button
                        className={styles.retrySave}
                        type="button"
                        onClick={() => {
                          setError(null);
                          setSaveMessage("Refreshing course progress…");
                          void retryAssessmentProgressAction(
                            assessment.courseId,
                          )
                            .then(() => {
                              setProgressPending(false);
                              setSaveMessage(
                                "Quiz attempt and course progress saved to your account.",
                              );
                              window.dispatchEvent(new Event("focus"));
                            })
                            .catch((cause) => {
                              setError(
                                message(
                                  cause,
                                  "Course progress could not be refreshed. Try again.",
                                ),
                              );
                              setSaveMessage(
                                "Quiz attempt saved. Course progress still needs a refresh.",
                              );
                            });
                        }}
                      >
                        Refresh course progress
                      </button>
                    </p>
                  ) : null}
                  {!quiz.authenticated ? (
                    <p>
                      <Link href="/login?next=%2Flearn%2Fforex%2Flevel-1%2Fquiz">
                        Sign in to save future quiz attempts and build your
                        history.
                      </Link>
                    </p>
                  ) : null}
                </section>
              ) : null}

              <div className={lessonStyles.stickyActions}>
                <div className={styles.submitArea}>
                  {result ? (
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={() => void beginAttempt()}
                    >
                      Try again
                    </button>
                  ) : (
                    <button
                      className={styles.primaryButton}
                      disabled={submitting}
                      type="submit"
                    >
                      {submitting ? "Submitting…" : "Submit quiz"}
                    </button>
                  )}
                  <Link
                    className={styles.moduleLink}
                    href="/learn/forex/level-1/forex-kindergarten/forex-foundations"
                  >
                    Back to Forex Foundations
                  </Link>
                </div>
              </div>
            </form>
          ) : null}

          {quiz?.authenticated &&
          history.some((item) => item.status === "submitted") ? (
            <section
              className={styles.history}
              aria-labelledby="attempt-history"
            >
              <h2 id="attempt-history">Attempt history</h2>
              <ol>
                {history
                  .filter((item) => item.status === "submitted")
                  .map((item) => (
                    <li key={item.id}>
                      <span>
                        Attempt {item.attemptNumber} ·{" "}
                        {historyDate(item.submittedAt)}
                      </span>
                      <strong>
                        {item.score ?? 0}/
                        {item.maxScore ?? assessment.questions.length} ·{" "}
                        {item.passed ? "Passed" : "Not passed"}
                      </strong>
                    </li>
                  ))}
              </ol>
            </section>
          ) : null}
        </article>
      </div>
    </main>
  );
}
