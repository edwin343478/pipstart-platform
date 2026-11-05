"use client";
import { LessonBlocks } from "@/components/lesson-blocks";
import {
  lessonContentSchema,
  type LessonDraftContent,
  type LessonDraftFields,
} from "@/lib/content/lesson-draft-contract";
export function StaffLessonPreview({
  fields,
  content,
  label = "Lesson preview",
}: {
  fields: LessonDraftFields;
  content: LessonDraftContent;
  label?: string;
}) {
  const parsed = lessonContentSchema.safeParse(content);
  return (
    <section aria-label={label}>
      <h2>{label}</h2>
      <p>
        Read-only draft preview. Links and progress controls are inactive. No
        progress, attempts or learner records are written.
      </p>
      {!parsed.success ? (
        <p role="status">Complete the block fields to preview this lesson.</p>
      ) : (
        <article>
          <h3>{fields.title || "Untitled lesson"}</h3>
          <p>{fields.description}</p>
          {parsed.data.mode === "flat" ? (
            <LessonBlocks
              blocks={parsed.data.blocks.map((b) => b.value)}
              checklist={false}
              preview
            />
          ) : (
            parsed.data.sections.map((section, i) => (
              <section key={i}>
                <h3>{section.title}</h3>
                <LessonBlocks
                  blocks={section.blocks.map((b) => b.value)}
                  checklist={false}
                  preview
                />
              </section>
            ))
          )}
        </article>
      )}
    </section>
  );
}
