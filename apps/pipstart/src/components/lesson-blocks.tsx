import Image from "next/image";

import styles from "./lesson-blocks.module.css";
import type { LessonBlock } from "../content/lesson-content";

export function LessonBlocks({ blocks }: { blocks: readonly LessonBlock[] }) {
  return (
    <div className={styles.blocks}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "definition":
            return (
              <aside className={styles.definition} key={key}>
                <strong>{block.term}</strong>
                <p>{block.children}</p>
              </aside>
            );
          case "example":
          case "warning":
            return (
              <aside className={styles[block.type]} key={key}>
                <h2>
                  {block.title ??
                    (block.type === "example" ? "Example" : "Warning")}
                </h2>
                <p>{block.children}</p>
              </aside>
            );
          case "keyPoint":
            return (
              <section className={styles.keyPoint} key={key}>
                <h2>{block.title ?? "Key points"}</h2>
                {block.points.map((point) => (
                  <p key={point}>✓ {point}</p>
                ))}
              </section>
            );
          case "formula":
            return (
              <figure className={styles.formula} key={key}>
                <code>{block.expression}</code>
                <figcaption>{block.explanation}</figcaption>
              </figure>
            );
          case "exercise":
            return (
              <section className={styles.exercise} key={key}>
                <h2>Exercise</h2>
                <p>{block.prompt}</p>
              </section>
            );
          case "diagram":
            return (
              <figure className={styles.diagram} key={key}>
                <Image
                  alt={block.alt}
                  height={block.height}
                  src={block.src}
                  width={block.width}
                />
                {block.caption ? (
                  <figcaption>{block.caption}</figcaption>
                ) : null}
              </figure>
            );
          case "comparisonTable":
            return (
              <div className={styles.tableScroller} key={key}>
                <table>
                  <caption>{block.caption}</caption>
                  <thead>
                    <tr>
                      {block.columns.map((column) => (
                        <th key={column} scope="col">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={`${key}-${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <td key={`${key}-${rowIndex}-${cellIndex}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "riskNotice":
            return (
              <aside className={styles.riskNotice} key={key}>
                <h2>Risk notice</h2>
                <p>{block.children}</p>
              </aside>
            );
          case "affiliateDisclosure":
            return (
              <aside className={styles.affiliateDisclosure} key={key}>
                <h2>Affiliate disclosure</h2>
                <p>{block.children}</p>
              </aside>
            );
          case "quizPreview":
            return (
              <aside className={styles.quizPreview} key={key}>
                <h2>{block.title}</h2>
                <p>{block.questionCount} questions · Coming soon</p>
              </aside>
            );
        }
      })}
    </div>
  );
}
