import { Accordion } from "@repo/ui";

import { JsonLd } from "../../components/json-ld";
import { ReferencePageShell } from "../../components/reference-page-shell";
import { faqEntries } from "./content";
import styles from "./page.module.css";

export default function FaqPage() {
  return (
    <ReferencePageShell section="FAQ">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqEntries.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: entry.answer,
            },
          })),
        }}
      />

      <article>
        <p className={styles.eyebrow}>Frequently asked questions</p>
        <h1 className={styles.title}>Clear answers before you begin</h1>
        <p className={styles.lead}>
          Learn how PipStart works, what is currently available and where its
          educational boundaries apply.
        </p>

        <div className={styles.questions}>
          {faqEntries.map((entry) => (
            <Accordion
              className={styles.question}
              key={entry.question}
              summary={entry.question}
            >
              <p>{entry.answer}</p>
            </Accordion>
          ))}
        </div>
      </article>
    </ReferencePageShell>
  );
}
