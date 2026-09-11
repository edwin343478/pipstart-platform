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
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${index}-${String(item.href ?? "current")}`}>
              {index > 0 && <span aria-hidden="true"> / </span>}
              {item.href && !current ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={current ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
