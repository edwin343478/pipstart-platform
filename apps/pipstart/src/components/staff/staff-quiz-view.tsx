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
    <div className={`${styles.editor} ${styles.review}`}>
      <header className={styles.head}>
        <a className={styles.back} href="/admin/staff/content">
          Back to content library
        </a>
        <div className={styles.headRow}>
          <div className={styles.headText}>
            <p className={styles.eyebrow}>Content · Quiz (read only)</p>
            <h1>{view.fields.title}</h1>
            <p>
              Revision {view.revision} of {view.latestRevision}, version{" "}
              {view.version}. Nothing on this page changes the quiz. Answer keys
              and explanations are shown for review only; learners see them
              after submitting.
            </p>
          </div>
          {canEdit && !view.trashed && (
            <a
              className={styles.editAction}
              href={
                "/admin/staff/content/quiz?id=" + encodeURIComponent(view.id)
              }
            >
              Edit draft
            </a>
          )}
        </div>
      </header>
      <section
        className={`${s.panel} ${styles.reviewCard}`}
        aria-labelledby="quiz-view-record"
      >
        <h2 id="quiz-view-record">Record</h2>
        <dl className={styles.tiles}>
          <div className={styles.tileWide}>
            <dt>Permanent identity</dt>
            <dd className={styles.mono}>{view.id}</dd>
          </div>
          <div>
            <dt>Learning path</dt>
            <dd>{view.path}</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>{view.scope}</dd>
          </div>
          <div className={styles.tileWide}>
            <dt>Parent</dt>
            <dd className={styles.mono}>{view.parent}</dd>
          </div>
          <div className={styles.tileState}>
            <dt>Revision state</dt>
            <dd>{view.state.replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt>Archive</dt>
            <dd>{view.trashed ? "In archive" : "Active"}</dd>
          </div>
          <div>
            <dt>Retention hold</dt>
            <dd>{view.onHold ? "On hold" : "No hold"}</dd>
          </div>
          <div className={styles.tileRest}>
            <dt>Fingerprint</dt>
            <dd>
              <code className={styles.hash}>{view.bodySha256}</code>
            </dd>
          </div>
        </dl>
        <h3>Review record in the quiz</h3>
        {g ? (
          <dl className={styles.tiles}>
            <div>
              <dt>Author</dt>
              <dd>{g.author}</dd>
            </div>
            <div>
              <dt>Reviewer</dt>
              <dd>{g.reviewer}</dd>
            </div>
            <div>
              <dt>Reviewed</dt>
              <dd>{g.reviewedAt}</dd>
            </div>
            <div>
              <dt>Next review</dt>
              <dd>{g.nextReviewAt}</dd>
            </div>
            <div className={styles.tileFull}>
              <dt>Sources</dt>
              <dd>
                <ul>
                  {g.sources.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        ) : (
          <p>No readable review record in this revision.</p>
        )}
      </section>
      <section
        className={`${s.panel} ${styles.reviewCard} ${styles.answerKey}`}
        aria-label="Questions and answer key"
      >
        <QuizSummary
          heading="Questions and answer key"
          fields={view.fields}
          questions={view.questions}
        />
      </section>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={preview}
          onClick={() => setPreview(!preview)}
        >
          {preview ? "Hide sandbox preview" : "Open sandbox preview"}
        </button>
      </div>
      {preview && (
        <div className={`${s.panel} ${styles.previewCard}`}>
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
