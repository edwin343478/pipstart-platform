"use client";

import Link from "next/link";
import { useEffect } from "react";

import { reportClientError } from "../lib/ops/report-client-error";

import styles from "./route-state.module.css";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError("boundary");
  }, [error]);

  return (
    <div className={styles.page}>
      <main id="main-content" className={styles.main}>
        <section className={styles.card} aria-labelledby="route-error-title">
          <p className={styles.eyebrow}>Something went wrong</p>
          <h1 id="route-error-title">This page could not be shown</h1>
          <p className={styles.description}>
            Your saved progress is not affected. Try again, or choose a page
            below to continue learning.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => reset()}
            >
              Try again
            </button>
            <Link className={styles.secondaryAction} href="/">
              Return home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
