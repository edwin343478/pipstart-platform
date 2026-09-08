import styles from "./page.module.css";

export function FundamentalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.markerIcon}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 5v5l3 2" />
    </svg>
  );
}

export function TechnicalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.markerIcon}>
      <path d="M3 15l4-4 3 2 5-7 2 2" />
    </svg>
  );
}
