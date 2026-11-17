"use client";
import { useState } from "react";
import type { QuizReadView } from "@/lib/content/quiz-view-contract";
import { StaffQuizPreview } from "./staff-quiz-preview";
import { QuizSummary } from "./staff-quiz-summary";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff-quiz-editor.module.css";

/** Package 5 (D4): one quiz revision, read-only, with the answer key and the sandbox preview. */
export function StaffQuizView({
  view,
  canEdit,
}: {
  view: QuizReadView;
  canEdit: boolean;
}) {
  const [preview, setPreview] = useState(false);
  const g = view.governance;
  return (
    <div className={styles.editor}>
      <header>
        <p className={s.eyebrow}>Content · Quiz (read only)</p>
        <h1>{view.fields.title}</h1>
        <p>
          Revision {view.revision} of {view.latestRevision}, version{" "}
          {view.version}. Nothing on this page changes the quiz. Answer keys and
          explanations are shown for review only; learners see them after
          submitting.
        </p>
        <a href="/admin/staff/content">Back to content library</a>
        {canEdit && !view.trashed && (
          <>
            {" · "}
            <a
              href={
                "/admin/staff/content/quiz?id=" + encodeURIComponent(view.id)
              }
            >
              Edit draft
            </a>
          </>
        )}
      </header>
      <section className={s.panel} aria-labelledby="quiz-view-record">
        <h2 id="quiz-view-record">Record</h2>
        <dl>
          <dt>Permanent identity</dt>
          <dd>{view.id}</dd>
          <dt>Learning path</dt>
          <dd>{view.path}</dd>
          <dt>Scope</dt>
          <dd>{view.scope}</dd>
          <dt>Parent</dt>
          <dd>{view.parent}</dd>
          <dt>Revision state</dt>
          <dd>{view.state.replaceAll("_", " ")}</dd>
          <dt>Archive</dt>
          <dd>{view.trashed ? "In archive" : "Active"}</dd>
          <dt>Retention hold</dt>
          <dd>{view.onHold ? "On hold" : "No hold"}</dd>
          <dt>Fingerprint</dt>
          <dd>
            <code className={styles.hash}>{view.bodySha256}</code>
          </dd>
        </dl>
        <h3>Review record in the quiz</h3>
        {g ? (
          <dl>
            <dt>Author</dt>
            <dd>{g.author}</dd>
            <dt>Reviewer</dt>
            <dd>{g.reviewer}</dd>
            <dt>Reviewed</dt>
            <dd>{g.reviewedAt}</dd>
            <dt>Next review</dt>
            <dd>{g.nextReviewAt}</dd>
            <dt>Sources</dt>
            <dd>
              <ul>
                {g.sources.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </dd>
          </dl>
        ) : (
          <p>No readable review record in this revision.</p>
        )}
      </section>
      <section className={s.panel} aria-label="Questions and answer key">
        <QuizSummary
          heading="Questions and answer key"
          fields={view.fields}
          questions={view.questions}
        />
      </section>
      <div className={styles.actions}>
        <button
          type="button"
          aria-expanded={preview}
          onClick={() => setPreview(!preview)}
        >
          {preview ? "Hide sandbox preview" : "Open sandbox preview"}
        </button>
      </div>
      {preview && (
        <div className={s.panel}>
          <StaffQuizPreview
            id={view.id}
            version={view.version}
            fields={view.fields}
            questions={view.questions}
          />
        </div>
      )}
    </div>
  );
}
