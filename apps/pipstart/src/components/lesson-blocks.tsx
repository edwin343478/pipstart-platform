import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./lesson-blocks.module.css";
import type { LessonBlock, LessonTextContent } from "../content/lesson-content";

function renderInlineText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${index}-${part}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

function textParagraphs(content: LessonTextContent) {
  const paragraphs = Array.isArray(content) ? content : [content];

  return paragraphs.map((paragraph, index) => (
    <p key={`${index}-${paragraph}`}>{renderInlineText(paragraph)}</p>
  ));
}

function ExampleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <circle cx="10" cy="7.5" r="2.8" />
      <path d="M4.5 15.5C5.5 12.5 7.5 11 10 11C12.5 11 14.5 12.5 15.5 15.5" />
    </svg>
  );
}

export function LessonBlocks({
  blocks,
  checklist = false,
}: {
  blocks: readonly LessonBlock[];
  checklist?: boolean;
}) {
  return (
    <div className={styles.blocks}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "heading":
            return block.level === 3 ? (
              <h3 className={styles.proseSubheading} key={key}>
                {renderInlineText(block.children)}
              </h3>
            ) : (
              <h2 className={styles.proseHeading} key={key}>
                {renderInlineText(block.children)}
              </h2>
            );
          case "section":
            return (
              <section className={styles.sectionBlock} key={key}>
                {block.title ? <h3>{renderInlineText(block.title)}</h3> : null}
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{renderInlineText(paragraph)}</p>
                ))}
              </section>
            );
          case "learningLink":
            return (
              <aside className={styles.takeaway} key={key}>
                <p className={styles.takeawayLabel}>
                  Practise with a PipStart tool
                </p>
                <p>
                  <Link className={styles.toolLink} href={block.href}>
                    {block.title} →
                  </Link>
                </p>
                <p>{renderInlineText(block.description)}</p>
              </aside>
            );
          case "references":
            return (
              <section className={styles.referencesBlock} key={key}>
                <h3>References</h3>
                {block.items.map((item) => (
                  <p key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.title} ↗
                    </a>
                  </p>
                ))}
              </section>
            );
          case "paragraph":
          case "riskStatement":
            return (
              <p className={styles.paragraph} key={key}>
                {renderInlineText(block.children)}
              </p>
            );
          case "list": {
            const List = block.style === "ordered" ? "ol" : "ul";
            return (
              <List className={styles.proseList} key={key}>
                {block.items.map((item) => (
                  <li key={item}>{renderInlineText(item)}</li>
                ))}
              </List>
            );
          }
          case "quote":
            return (
              <blockquote className={styles.quote} key={key}>
                <p>{renderInlineText(block.children)}</p>
              </blockquote>
            );
          case "reflection":
            return (
              <section className={styles.reflection} key={key}>
                <h2>{block.title}</h2>
                {block.introduction?.map((paragraph) => (
                  <p key={paragraph}>{renderInlineText(paragraph)}</p>
                ))}
                {block.points.map((point) => (
                  <p className={styles.reflectionPoint} key={point}>
                    — {renderInlineText(point)}
                  </p>
                ))}
                {block.closing?.map((paragraph) => (
                  <p key={paragraph}>{renderInlineText(paragraph)}</p>
                ))}
              </section>
            );
          case "takeaway":
            return (
              <section className={styles.takeaway} key={key}>
                <p className={styles.takeawayLabel}>
                  {block.title ?? "Key takeaway"}
                </p>
                {textParagraphs(block.children)}
              </section>
            );
          case "definition":
            return (
              <aside className={styles.definition} key={key}>
                <strong>{renderInlineText(block.term)}</strong>
                <p>{renderInlineText(block.children)}</p>
              </aside>
            );
          case "example":
            return (
              <aside className={styles.example} key={key}>
                <div className={styles.exampleLabel}>
                  <span className={styles.exampleIcon}>
                    <ExampleIcon />
                  </span>
                  <span>Example</span>
                </div>
                {block.title ? <h3>{renderInlineText(block.title)}</h3> : null}
                {textParagraphs(block.children)}
              </aside>
            );
          case "warning":
            return (
              <aside className={styles.warning} key={key}>
                <h2>{block.title ?? "Warning"}</h2>
                {textParagraphs(block.children)}
              </aside>
            );
          case "keyPoint":
            return checklist ? (
              <section className={styles.checklistCard} key={key}>
                <h3>{block.title ?? "Check what you know"}</h3>
                {block.points.map((point) => (
                  <label key={point}>
                    <input type="checkbox" />{" "}
                    <span>{renderInlineText(point)}</span>
                  </label>
                ))}
              </section>
            ) : (
              <section className={styles.keyPoint} key={key}>
                <h2>{block.title ?? "Key points"}</h2>
                {block.points.map((point) => (
                  <p key={point}>✓ {renderInlineText(point)}</p>
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
                <p>{renderInlineText(block.prompt)}</p>
              </section>
            );
          case "diagram":
            return (
              <figure className={styles.diagram} key={key}>
                <picture>
                  {block.desktopSrc ? (
                    <source
                      media="(min-width: 768px)"
                      srcSet={block.desktopSrc}
                    />
                  ) : null}
                  <Image
                    alt={block.alt}
                    height={block.height}
                    src={block.src}
                    width={block.width}
                  />
                </picture>
                {block.caption ? (
                  <figcaption>{block.caption}</figcaption>
                ) : null}
              </figure>
            );
          case "comparisonTable":
            return (
              <div className={styles.tableScroller} key={key}>
                <table>
                  {block.caption ? <caption>{block.caption}</caption> : null}
                  <thead>
                    <tr>
                      {block.columns.map((column) => (
                        <th key={column} scope="col">
                          {renderInlineText(column)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={`${key}-${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <td key={`${key}-${rowIndex}-${cellIndex}`}>
                            {renderInlineText(cell)}
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
                {textParagraphs(block.children)}
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
