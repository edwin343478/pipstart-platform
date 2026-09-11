import { pipStartEditorialTeam } from "../../analysis/authors";
import styles from "../../public-page.module.css";
import { ReferencePageShell } from "../../../components/reference-page-shell";

export default function PipStartEditorialTeamPage() {
  return (
    <ReferencePageShell section="Authors">
      <article>
        <p className={styles.eyebrow}>PipStart authors</p>
        <h1 className={styles.title}>{pipStartEditorialTeam.name}</h1>
        <p className={styles.lead}>{pipStartEditorialTeam.description}</p>
        <p className={styles.meta}>
          Editorial policy reviewed{" "}
          <time dateTime="2026-09-11">September 11, 2026</time>
        </p>
        <section className={styles.section}>
          <h2>Editorial purpose</h2>
          <p>
            PipStart explains market concepts clearly, emphasizes risk, and
            helps learners build knowledge without trading signals, promises of
            profit, or personalized financial advice.
          </p>
        </section>
        <section className={styles.section}>
          <h2>Review approach</h2>
          <p>
            Published and reviewed dates appear on analysis articles. Reviews
            check clarity, internal consistency, risk language, and whether
            time-sensitive statements still match their context.
          </p>
        </section>
        <section className={styles.section}>
          <h2>Writers and reviewers</h2>
          <p>
            Content published under the PipStart Editorial Team is prepared and
            maintained collectively. PipStart does not claim named professional
            credentials that have not been independently verified. A named
            byline and reviewer will be added whenever an identifiable
            contributor is responsible for a publication.
          </p>
        </section>
        <section className={styles.section}>
          <h2>Sources and updates</h2>
          <p>
            Time-sensitive analysis should distinguish reported facts from
            interpretation and cite primary public sources when they are relied
            upon. Material corrections and substantive updates should be
            reflected in the article&apos;s reviewed date.
          </p>
        </section>
        <section className={styles.section}>
          <h2>Corrections</h2>
          <p>
            Readers can report a factual or clarity issue through the{" "}
            <Link href="/contact">Contact page</Link>. Reports are reviewed
            against the original context, and confirmed material errors are
            corrected without silently changing the educational meaning.
          </p>
        </section>
      </article>
    </ReferencePageShell>
  );
}
import Link from "next/link";
