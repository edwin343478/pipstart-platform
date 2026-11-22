"use client";

import Link from "next/link";
import { useEffect } from "react";

import { reportClientError } from "../lib/ops/report-client-error";

import styles from "./route-state.module.css";

// Replaces the root layout when the layout itself fails, so it renders its own
// html and body.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  useEffect(() => {
    reportClientError(error, "global");
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className={styles.page}>
          <main id="main-content" className={styles.main}>
            <section
              className={styles.card}
              aria-labelledby="global-error-title"
            >
              <p className={styles.eyebrow}>Something went wrong</p>
              <h1 id="global-error-title">PipStart could not load this page</h1>
              <p className={styles.description}>
                Your saved progress is not affected. Please try again in a
                moment.
              </p>
              <div className={styles.actions}>
                {reset ? (
                  <button
                    type="button"
                    className={styles.primaryAction}
                    onClick={() => reset()}
                  >
                    Try again
                  </button>
                ) : null}
                <Link className={styles.secondaryAction} href="/">
                  Return home
                </Link>
              </div>
            </section>
          </main>
        </div>
      </body>
    </html>
  );
}
