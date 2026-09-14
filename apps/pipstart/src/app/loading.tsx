import { PageState } from "@repo/ui";

import { CompactFooter, CompactHeader } from "../components/site-chrome";

import styles from "./route-state.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <CompactHeader
        brandClassName={styles.brand}
        className={styles.header}
        section="Loading"
      />

      <main id="main-content" className={styles.loadingMain}>
        <section className={styles.loadingCard} aria-label="Loading page">
          <span className={styles.spinner} aria-hidden="true" />
          <PageState className={styles.loadingMessage} kind="loading">
            Loading your next page…
          </PageState>
          <p className={styles.loadingHint}>
            PipStart is preparing the requested content.
          </p>
        </section>
      </main>

      <CompactFooter className={styles.footer} />
    </div>
  );
}
