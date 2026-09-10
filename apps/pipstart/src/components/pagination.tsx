import Link from "next/link";

type PaginationProps = {
  ariaLabel: string;
  className?: string;
  currentPage: number;
  nextHref?: string;
  previousHref?: string;
  totalPages: number;
};

export function Pagination({
  ariaLabel,
  className,
  currentPage,
  nextHref,
  previousHref,
  totalPages,
}: PaginationProps) {
  return (
    <nav className={className} aria-label={ariaLabel}>
      {previousHref ? (
        <Link href={previousHref}>← Previous</Link>
      ) : (
        <span aria-disabled="true">← Previous</span>
      )}
      <p>
        Page {currentPage} of {totalPages}
      </p>
      {nextHref ? (
        <Link href={nextHref}>Next →</Link>
      ) : (
        <span aria-disabled="true">Next →</span>
      )}
    </nav>
  );
}
