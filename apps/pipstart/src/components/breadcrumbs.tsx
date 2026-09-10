import Link from "next/link";
import type { ReactNode } from "react";

export type BreadcrumbItem = {
  href?: string;
  label: ReactNode;
};

type BreadcrumbsProps = {
  className?: string;
  items: readonly BreadcrumbItem[];
};

export function Breadcrumbs({ className, items }: BreadcrumbsProps) {
  return (
    <nav className={className} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${index}-${String(item.href ?? "current")}`}>
          {index > 0 && <span aria-hidden="true"> / </span>}
          {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
        </span>
      ))}
    </nav>
  );
}
