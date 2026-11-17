// The read-only rendering of one quiz: fields, then each question with its choices, the correct
// answers marked and its explanation. Staff pages only (answer keys and explanations are private).
import type {
  QuizDraftFields,
  QuizDraftQuestion,
  QuizQuestionType,
} from "@/lib/content/quiz-draft-contract";

export const quizTypeLabels: Record<QuizQuestionType, string> = {
  "single-choice": "Single choice",
  "multiple-answer": "Multiple answers",
  "true-false": "True or false",
};

export function QuizSummary({
  heading,
  fields,
  questions,
}: {
  heading: string;
  fields: QuizDraftFields;
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
            <p>
              {q.prompt} <small>({quizTypeLabels[q.type]})</small>
            </p>
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
