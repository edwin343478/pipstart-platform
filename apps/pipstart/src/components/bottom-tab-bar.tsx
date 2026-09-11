"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./bottom-tab-bar.module.css";

const tabs = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/start-here", label: "Learn", icon: "learn" },
  { href: "/tools", label: "Tools", icon: "tools" },
  { href: "/analysis", label: "Analysis", icon: "analysis" },
] as const;

const hubRoutes = new Set([
  "/",
  "/analysis",
  "/start-here",
  "/brokers",
  "/glossary",
  "/glossary/crypto",
  "/learn/crypto",
  "/learn/forex",
  "/tools",
]);

function TabIcon({ type }: { type: (typeof tabs)[number]["icon"] }) {
  if (type === "home") return <path d="M3 9l7-6 7 6v8H12v-5H8v5H3V9Z" />;
  if (type === "learn") return <path d="M3 4h6v12H3V4Zm8 0h6v12h-6V4Z" />;
  if (type === "tools")
    return (
      <>
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 8h6M7 11h4" />
      </>
    );
  return <path d="m3 15 4-4 3 2 5-7 2 2" />;
}

export function BottomTabBar() {
  const pathname = usePathname();
  if (!hubRoutes.has(pathname)) return null;

  return (
    <nav className={styles.tabBar} aria-label="Mobile primary navigation">
      {tabs.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/"
            : tab.href === "/start-here"
              ? pathname === "/start-here" || pathname.startsWith("/learn")
              : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? styles.active : styles.tab}
            aria-current={active ? "page" : undefined}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <TabIcon type={tab.icon} />
            </svg>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
