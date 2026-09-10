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
      </article>
    </ReferencePageShell>
  );
}
