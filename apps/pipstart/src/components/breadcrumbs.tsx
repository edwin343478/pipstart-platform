import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./breadcrumbs.module.css";

export type BreadcrumbItem = {
  href?: string;
  label: ReactNode;
};

type BreadcrumbsProps = {
  className?: string;
  items: readonly BreadcrumbItem[];
};

export function Breadcrumbs({ className, items }: BreadcrumbsProps) {
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <nav className={rootClassName} aria-label="Breadcrumb">
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
