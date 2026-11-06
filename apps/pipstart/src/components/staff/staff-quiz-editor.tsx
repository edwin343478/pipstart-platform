"use client";
import {
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { runQuizDraftAction } from "@/app/admin/staff/content/quiz-actions";
import {
  nextQuizPartId,
  QUIZ_LIMITS,
  quizDraftInputSchema,
  quizDraftProblems,
  type QuizDraftQuestion,
  type QuizDraftView,
  type QuizQuestionType,
} from "@/lib/content/quiz-draft-contract";
import {
  initialQuizEditor,
  quizBuffer,
  quizEditorReducer,
} from "@/lib/content/quiz-editor-state";
import { StaffQuizPreview } from "./staff-quiz-preview";
import { useDraftLeaveGuard } from "./use-draft-leave-guard";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff-quiz-editor.module.css";

const typeLabels: Record<QuizQuestionType, string> = {
  "single-choice": "Single choice",
  "multiple-answer": "Multiple answers",
  "true-false": "True or false",
};
const subscribeToHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;
const trueFalse = () => [
  { id: "true", label: "True" },
  { id: "false", label: "False" },
];
const noKey = (): string[] => [];

/** A new question of a type, with fresh identities and an empty answer key. */
export function newQuizQuestion(
  type: QuizQuestionType,
  used: readonly string[],
): QuizDraftQuestion {
  return {
    sourceIndex: null,
    id: nextQuizPartId("question", used),
    type,
    prompt: "",
    explanation: "",
    choices:
      type === "true-false"
        ? trueFalse()
        : [
            { id: "choice-1", label: "" },
            { id: "choice-2", label: "" },
          ],
    correctChoiceIds: noKey(),
  };
}

export function StaffQuizEditor({ item }: { item: QuizDraftView }) {
  const [state, dispatch] = useReducer(
      quizEditorReducer,
      item,
      initialQuizEditor,
    ),
    [loading, setLoading] = useState(false),
    [preview, setPreview] = useState(false),
    [addType, setAddType] = useState<QuizQuestionType>("single-choice");
  const lock = useRef(false),
    status = useRef<HTMLParagraphElement>(null);
  const dirty = quizBuffer(state) !== state.clean;
  useDraftLeaveGuard(
    dirty || state.phase === "busy" || state.phase === "uncertain",
  );
  // Server HTML stays inert until hydration: React resets a controlled field
  // when it hydrates, dropping or merging anything typed before that point.
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientHydrated,
    serverHydrated,
  );
  const disabled =
    !hydrated ||
    loading ||
    ["busy", "uncertain", "denied", "saved"].includes(state.phase);
  const problems = quizDraftProblems(state.fields, state.questions);
  const setQuestions = (questions: QuizDraftQuestion[]) =>
    dispatch({ type: "edit", buffer: { questions } });
  const setQuestion = (n: number, q: QuizDraftQuestion) =>
    setQuestions(state.questions.map((v, i) => (i === n ? q : v)));
  const setField = (patch: Partial<typeof state.fields>) =>
    dispatch({
      type: "edit",
      buffer: { fields: { ...state.fields, ...patch } },
    });
  async function save(event: FormEvent) {
    event.preventDefault();
    if (lock.current || state.phase !== "idle") return;
    const command = {
      kind: "save",
      id: state.base.id,
      baseRevision: state.base.revision,
      baseSha256: state.base.bodySha256,
      fields: state.fields,
      questions: state.questions,
      reason: state.reason,
    };
    if (!quizDraftInputSchema.safeParse(command).success) {
      dispatch({ type: "invalid" });
      status.current?.focus();
      return;
    }
    lock.current = true;
    dispatch({ type: "busy" });
    try {
      dispatch({ type: "result", result: await runQuizDraftAction(command) });
    } catch {
      dispatch({ type: "result", result: { kind: "uncertain" } });
    } finally {
      lock.current = false;
      status.current?.focus();
    }
  }
  async function latest() {
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    try {
      const result = await runQuizDraftAction({
        kind: "load",
        id: state.base.id,
      });
      dispatch({ type: "latest", result });
      if (result.kind === "ready" && state.phase === "saved")
        dispatch({ type: "use-latest" });
    } catch {
      dispatch({ type: "latest", result: { kind: "unavailable" } });
    } finally {
      lock.current = false;
      setLoading(false);
      status.current?.focus();
    }
  }
  const base = state.base;
  return (
    <div className={styles.editor}>
      <header>
        <p className={s.eyebrow}>Content · Quiz draft</p>
        <h1>Edit quiz</h1>
        <p>
          Save a private draft. Saving does not approve, publish or change the
          quiz learners take.
        </p>
        <a href="/admin/staff/content">Back to content library</a>
      </header>
      <p
        className={styles.notice}
        ref={status}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {state.message || (dirty ? "Unsaved changes." : "No unsaved changes.")}
      </p>
      <form
        className={s.panel}
        aria-label="Quiz draft"
        aria-busy={!hydrated || state.phase === "busy" || loading}
        onSubmit={(e) => void save(e)}
      >
        <fieldset disabled={disabled}>
          <legend>Permanent quiz identity</legend>
          <dl>
            <dt>Identity</dt>
            <dd>{base.id}</dd>
            <dt>Learning path</dt>
            <dd>{base.path}</dd>
            <dt>Scope</dt>
            <dd>{base.scope}</dd>
            <dt>Parent</dt>
            <dd>{base.parent}</dd>
            <dt>Base revision</dt>
            <dd>{base.revision}</dd>
            <dt>Version on save</dt>
            <dd>{base.nextVersion}</dd>
          </dl>
          <p className={styles.version}>
            {base.approved
              ? `Version ${base.version} is approved and never changes: attempts started on it finish and are graded on it. Saving creates version ${base.nextVersion}, which learners only take after it is reviewed and published.`
              : `This draft is version ${base.version}, which is not approved yet. Saving keeps version ${base.nextVersion}.`}{" "}
            The version is set by the server; it cannot be typed.
          </p>
          <div className={styles.grid}>
            <label>
              Title
              <input
                required
                maxLength={QUIZ_LIMITS.title}
                value={state.fields.title}
                onChange={(e) => setField({ title: e.target.value })}
              />
            </label>
            <label>
              Passing percentage
              <input
                type="number"
                min={1}
                max={100}
                required
                value={
                  Number.isFinite(state.fields.passingPercentage)
                    ? state.fields.passingPercentage
                    : ""
                }
                onChange={(e) =>
                  setField({ passingPercentage: e.target.valueAsNumber })
                }
              />
            </label>
            <label>
              Retake cooldown (seconds)
              <input
                type="number"
                min={0}
                max={3600}
                required
                value={
                  Number.isFinite(state.fields.retakeCooldownSeconds)
                    ? state.fields.retakeCooldownSeconds
                    : ""
                }
                onChange={(e) =>
                  setField({ retakeCooldownSeconds: e.target.valueAsNumber })
                }
              />
            </label>
          </div>
          <h2>Questions</h2>
          <p>
            Each question needs a prompt, an explanation shown after submission,
            2 to 10 choices and an answer key. Explanations and answer keys stay
            private until a learner submits.
          </p>
          <ol className={styles.questions}>
            {state.questions.map((q, n) => (
              <li key={n}>
                <details open={q.sourceIndex === null}>
                  <summary>
                    Question {n + 1}: {q.prompt.trim() || "Untitled question"} ·{" "}
                    {typeLabels[q.type]}
                  </summary>
                  <QuestionFields
                    question={q}
                    number={n + 1}
                    onChange={(next) => setQuestion(n, next)}
                  />
                  <div className={styles.actions}>
                    {[-1, 1].map((d) => (
                      <button
                        key={d}
                        type="button"
                        disabled={n + d < 0 || n + d >= state.questions.length}
                        onClick={() => {
                          const moved = [...state.questions];
                          [moved[n], moved[n + d]] = [moved[n + d], moved[n]];
                          setQuestions(moved);
                        }}
                      >
                        Move question {n + 1} {d < 0 ? "up" : "down"}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={state.questions.length === 1}
                      onClick={() => {
                        if (
                          window.confirm("Remove this question from the draft?")
                        )
                          setQuestions(
                            state.questions.filter((_, i) => i !== n),
                          );
                      }}
                    >
                      Remove question {n + 1}
                    </button>
                  </div>
                </details>
              </li>
            ))}
          </ol>
          <div className={styles.actions}>
            <label>
              Question type to add
              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value as QuizQuestionType)}
              >
                {Object.entries(typeLabels).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={state.questions.length >= QUIZ_LIMITS.questions}
              onClick={() =>
                setQuestions([
                  ...state.questions,
                  newQuizQuestion(
                    addType,
                    state.questions.map((q) => q.id),
                  ),
                ])
              }
            >
              Add {typeLabels[addType].toLowerCase()} question
            </button>
          </div>
          <label>
            Change reason
            <input
              required
              maxLength={200}
              value={state.reason}
              onChange={(e) =>
                dispatch({ type: "edit", buffer: { reason: e.target.value } })
              }
            />
          </label>
        </fieldset>
        {problems.length > 0 && (
          <section aria-label="Problems to fix" className={styles.problems}>
            <h2>Fix before saving</h2>
            <ul>
              {problems.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </section>
        )}
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={
              disabled ||
              state.phase !== "idle" ||
              !dirty ||
              problems.length > 0
            }
          >
            {state.phase === "busy" ? "Saving quiz…" : "Save quiz draft"}
          </button>
          <button
            type="button"
            disabled={!hydrated || loading || state.phase === "busy"}
            onClick={() => void latest()}
          >
            {loading
              ? "Reading latest…"
              : state.phase === "saved"
                ? "Reload saved quiz"
                : "Load latest for comparison"}
          </button>
          <button
            type="button"
            aria-expanded={preview}
            disabled={!hydrated}
            onClick={() => setPreview(!preview)}
          >
            {preview ? "Hide sandbox preview" : "Open sandbox preview"}
          </button>
        </div>
      </form>
      {state.latest && (
        <section
          className={s.panel + " " + styles.comparison}
          aria-label="Compare latest quiz"
        >
          <h2>Latest revision {state.latest.revision}</h2>
          <p>
            Your entered work is unchanged. Compare both drafts before
            discarding any work.
          </p>
          <div className={styles.grid}>
            <QuizSummary
              heading="Your entered quiz"
              fields={state.fields}
              questions={state.questions}
            />
            <QuizSummary
              heading={`Latest quiz (version ${state.latest.version})`}
              fields={state.latest.fields}
              questions={state.latest.questions}
            />
          </div>
          <button
            type="button"
            disabled={loading || state.phase === "busy"}
            onClick={() => {
              if (
                window.confirm(
                  "Discard your entered work and use the latest quiz draft?",
                )
              )
                dispatch({ type: "use-latest" });
            }}
          >
            Use latest and discard my changes
          </button>
        </section>
      )}
      {preview && (
        <div className={s.panel}>
          <StaffQuizPreview
            key={JSON.stringify([state.fields, state.questions])}
            id={base.id}
            version={base.nextVersion}
            fields={state.fields}
            questions={state.questions}
          />
        </div>
      )}
      <p>
        Revision {base.revision} ·{" "}
        <code className={styles.hash}>{base.bodySha256}</code>
      </p>
    </div>
  );
}

function QuestionFields({
  question: q,
  number,
  onChange,
}: {
  question: QuizDraftQuestion;
  number: number;
  onChange: (q: QuizDraftQuestion) => void;
}) {
  const single = q.type !== "multiple-answer";
  const setKey = (id: string, on: boolean) =>
    onChange({
      ...q,
      correctChoiceIds: single
        ? [id]
        : on
          ? q.correctChoiceIds.concat(id)
          : q.correctChoiceIds.filter((k) => k !== id),
    });
  return (
    <div className={styles.questionFields}>
      <p>
        Question identity <code>{q.id}</code>
      </p>
      <label>
        Question {number} type
        <select
          value={q.type}
          onChange={(e) => {
            const type = e.target.value as QuizQuestionType;
            if (type === "true-false")
              onChange({
                ...q,
                type,
                choices: trueFalse(),
                correctChoiceIds: noKey(),
              });
            else if (q.type === "true-false")
              onChange({
                ...q,
                type,
                choices: [
                  { id: "choice-1", label: "" },
                  { id: "choice-2", label: "" },
                ],
                correctChoiceIds: noKey(),
              });
            else
              onChange({
                ...q,
                type,
                correctChoiceIds:
                  type === "single-choice"
                    ? q.correctChoiceIds.slice(0, 1)
                    : q.correctChoiceIds,
              });
          }}
        >
          {Object.entries(typeLabels).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Question {number} prompt
        <textarea
          required
          rows={2}
          maxLength={QUIZ_LIMITS.prompt}
          value={q.prompt}
          onChange={(e) => onChange({ ...q, prompt: e.target.value })}
        />
      </label>
      <fieldset>
        <legend>
          Question {number} choices and answer key
          {single ? " (one correct answer)" : " (two or more correct answers)"}
        </legend>
        {q.choices.map((c, i) => (
          <div key={c.id} className={styles.choiceRow}>
            <label className={styles.choice}>
              <input
                type={single ? "radio" : "checkbox"}
                name={"key-" + q.id}
                checked={q.correctChoiceIds.includes(c.id)}
                onChange={(e) => setKey(c.id, e.target.checked)}
              />
              Correct: choice {i + 1}
            </label>
            {q.type === "true-false" ? (
              <span>{c.label}</span>
            ) : (
              <>
                <label>
                  Question {number} choice {i + 1}
                  <input
                    required
                    maxLength={QUIZ_LIMITS.label}
                    value={c.label}
                    onChange={(e) =>
                      onChange({
                        ...q,
                        choices: q.choices.map((v, n) =>
                          n === i ? { ...v, label: e.target.value } : v,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  disabled={q.choices.length <= QUIZ_LIMITS.choicesMin}
                  onClick={() =>
                    onChange({
                      ...q,
                      choices: q.choices.filter((_, n) => n !== i),
                      correctChoiceIds: q.correctChoiceIds.filter(
                        (k) => k !== c.id,
                      ),
                    })
                  }
                >
                  Remove choice {i + 1}
                </button>
              </>
            )}
          </div>
        ))}
        {q.type !== "true-false" && (
          <button
            type="button"
            disabled={q.choices.length >= QUIZ_LIMITS.choicesMax}
            onClick={() =>
              onChange({
                ...q,
                choices: [
                  ...q.choices,
                  {
                    id: nextQuizPartId(
                      "choice",
                      q.choices.map((c) => c.id),
                    ),
                    label: "",
                  },
                ],
              })
            }
          >
            Add choice to question {number}
          </button>
        )}
      </fieldset>
      <label>
        Question {number} explanation (shown after submission)
        <textarea
          required
          rows={3}
          maxLength={QUIZ_LIMITS.explanation}
          value={q.explanation}
          onChange={(e) => onChange({ ...q, explanation: e.target.value })}
        />
      </label>
    </div>
  );
}

function QuizSummary({
  heading,
  fields,
  questions,
}: {
  heading: string;
  fields: QuizDraftView["fields"];
  questions: QuizDraftQuestion[];
}) {
  return (
    <div>
      <h3>{heading}</h3>
      <dl>
        <dt>Title</dt>
        <dd>{fields.title}</dd>
        <dt>Passing percentage</dt>
        <dd>{String(fields.passingPercentage)}</dd>
        <dt>Retake cooldown (seconds)</dt>
        <dd>{String(fields.retakeCooldownSeconds)}</dd>
      </dl>
      <ol>
        {questions.map((q, n) => (
          <li key={n}>
            <p>{q.prompt}</p>
            <ul>
              {q.choices.map((c) => (
                <li key={c.id}>
                  {c.label}
                  {q.correctChoiceIds.includes(c.id) ? " (correct)" : ""}
                </li>
              ))}
            </ul>
            <p>Explanation: {q.explanation}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
