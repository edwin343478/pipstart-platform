import Link from "next/link";
import type { GlossaryDisplayTerm } from "../lib/glossary-presentation";
import styles from "../app/glossary/crypto/page.module.css";
export function GlossaryTeaching({ term }: { term: GlossaryDisplayTerm }) {
  return (
    <>
      {term.meanings.map((meaning, index) => (
        <div key={index}>
          <p>{meaning.definition}</p>
          {meaning.example ? (
            <p>
              <strong>Example: </strong>
              {meaning.example}
            </p>
          ) : null}
          {meaning.confusionNote ? (
            <p>
              <strong>Keep in mind: </strong>
              {meaning.confusionNote}
            </p>
          ) : null}
          {meaning.lessons.length ? (
            <ul className={styles.lessonLinks}>
              {meaning.lessons.map((lesson) => (
                <li key={lesson.href}>
                  <Link href={lesson.href}>
                    {lesson.relation === "related-context-not-full-definition"
                      ? "Related lesson: "
                      : "Read in context: "}
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      {term.relatedTerms?.length ? (
        <ul className={styles.lessonLinks} aria-label="Related terms">
          {term.relatedTerms.map((target) => (
            <li key={target.id}>
              <Link href={target.href}>Related term: {target.name}</Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
