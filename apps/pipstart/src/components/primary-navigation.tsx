"use client";

import Link from "next/link";
import { useState } from "react";

type NavigationItem = {
  emphasized?: boolean;
  href: `/${string}`;
  label: string;
};
const navigationItems: readonly NavigationItem[] = [
  { href: "/start-here", label: "Start Here" },
  { href: "/learn/forex", label: "Learn Forex" },
  { href: "/learn/crypto", label: "Learn Crypto" },
  { href: "/analysis", label: "Analysis", emphasized: true },
  { href: "/glossary", label: "Glossary" },
  { href: "/tools", label: "Tools" },
  { href: "/brokers", label: "Brokers" },
];

type PrimaryNavigationProps = {
  analysisLinkClassName?: string;
  className?: string;
  menuButtonClassName?: string;
  openClassName?: string;
};

export function PrimaryNavigation({
  analysisLinkClassName,
  className,
  menuButtonClassName,
  openClassName,
}: PrimaryNavigationProps) {
  const [open, setOpen] = useState(false);
  const navigationClassName = [className, open ? openClassName : undefined]
    .filter(Boolean)
    .join(" ");
  return (
    <>
      <button
        type="button"
        className={menuButtonClassName}
        aria-controls="primary-navigation"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="sr-only">Menu</span>
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d={open ? "M4 4l12 12M16 4 4 16" : "M3 5h14M3 10h14M3 15h14"} />
        </svg>
      </button>
      <nav
        id="primary-navigation"
        className={navigationClassName}
        aria-label="Primary navigation"
      >
        {navigationItems.map((item) => (
          <Link
            className={item.emphasized ? analysisLinkClassName : undefined}
            href={item.href}
            key={item.href}
            onClick={() => setOpen(false)}
          >
            {item.label}
            {item.emphasized ? (
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="m5 8 5 5 5-5" />
              </svg>
            ) : null}
          </Link>
        ))}
      </nav>
    </>
  );
}
