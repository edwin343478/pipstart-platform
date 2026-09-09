import Link from "next/link";

import styles from "./related-lesson.module.css";

type RelatedLessonProps = {
  description: string;
  href: string;
  title: string;
};

export default function RelatedLesson({
  description,
  href,
  title,
}: RelatedLessonProps) {
  return (
    <aside className={styles.related} aria-labelledby="related-lesson-title">
      <div>
        <span>Related lesson</span>
        <h2 id="related-lesson-title">{title}</h2>
        <p>{description}</p>
      </div>
      <Link href={href}>Open lesson →</Link>
    </aside>
  );
}
