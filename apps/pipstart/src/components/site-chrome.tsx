import Link from "next/link";
import type { ReactNode } from "react";

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
      <Link className={brandClassName} href="/" aria-label="PipStart home">
        PipStart
      </Link>
      <span>{section}</span>
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
