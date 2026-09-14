import Link from "next/link";

import { Breadcrumbs } from "./breadcrumbs";

type CalculatorHeaderProps = {
  className?: string;
  currentLabel: string;
};

export function CalculatorHeader({
  className,
  currentLabel,
}: CalculatorHeaderProps) {
  return (
    <header className={className}>
      <Link href="/" aria-label="PipStart home">
        PipStart
      </Link>
      <Breadcrumbs
        items={[{ href: "/tools", label: "Tools" }, { label: currentLabel }]}
      />
    </header>
  );
}
