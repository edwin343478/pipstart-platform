import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./site-chrome.module.css";

type CompactHeaderProps = {
  className?: string;
  brandClassName?: string;
  section: ReactNode;
};

export function CompactHeader({
  brandClassName,
  className,
  section,
}: CompactHeaderProps) {
  return (
    <header className={className}>
      <Link
        className={styles.mobileBack}
        href="/"
        aria-label="Back to PipStart home"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M12 4l-6 6 6 6" />
        </svg>
      </Link>
      <Link className={brandClassName} href="/" aria-label="PipStart home">
        PipStart
      </Link>
      <span className={styles.section}>{section}</span>
    </header>
  );
}

type CompactFooterProps = {
  className?: string;
  children?: ReactNode;
};

export function CompactFooter({
  children = "PipStart · pipstart.net",
  className,
}: CompactFooterProps) {
  return <footer className={className}>{children}</footer>;
}
