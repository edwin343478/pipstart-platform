import Link from "next/link";

import { CompactFooter, CompactHeader } from "../components/site-chrome";

import styles from "./route-state.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <CompactHeader
        brandClassName={styles.brand}
        className={styles.header}
        section="Page not found"
      />

      <main id="main-content" className={styles.main}>
        <section className={styles.card} aria-labelledby="not-found-title">
          <p className={styles.eyebrow}>Error 404</p>
          <h1 id="not-found-title">This page could not be found</h1>
          <p className={styles.description}>
            The address may be incorrect, or the page may have moved. Choose a
            clear route below to continue learning.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/start-here">
              Start learning
            </Link>
            <Link className={styles.secondaryAction} href="/">
              Return home
            </Link>
          </div>

          <nav className={styles.recoveryLinks} aria-label="Helpful pages">
            <Link href="/learn/forex">Forex path</Link>
            <Link href="/learn/crypto">Crypto path</Link>
            <Link href="/tools">Calculators</Link>
          </nav>
        </section>
      </main>

      <CompactFooter className={styles.footer} />
    </div>
  );
}
