import Link from "next/link";
import {
  glossaryGroupingHref,
  type GlossaryBrowseSelection,
  type GlossaryPathname,
  type GlossaryScope,
} from "../lib/glossary-browse";
import styles from "./glossary-controls.module.css";
export function GlossaryGrouping({
  pathname,
  selection,
}: {
  pathname: GlossaryPathname;
  selection: GlossaryBrowseSelection;
}) {
  return (
    <nav className={styles.grouping} aria-label="Terminology grouping">
      <span>View terminology:</span>
      {(
        [
          ["forex", "Forex"],
          ["crypto", "Crypto"],
          ["", "Both"],
        ] as const
      ).map(([course, label]) => (
        <Link
          key={label}
          href={glossaryGroupingHref(
            pathname,
            course as GlossaryScope,
            selection,
          )}
          aria-current={selection.course === course ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
