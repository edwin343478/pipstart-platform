import Link from "next/link";
import type { ReactNode } from "react";

import { Icon, type IconName } from "./icons";
import { Avatar, Pill, cx } from "./primitives";
import s from "./admin-preview.module.css";

export type AdminRole = "Owner" | "Author" | "Affiliate Manager";

export type NavKey =
  | "audit"
  | "library"
  | "linkhealth"
  | "links"
  | "overview"
  | "partners"
  | "people"
  | "publishing"
  | "reminders"
  | "review"
  | "roles"
  | "trash";

export type ScreenMeta = {
  group: string;
  id: string;
  mfa: string;
  nav: NavKey | "";
  note: string;
  num: string;
  patch: string;
  role: AdminRole;
  roadmap: string;
  shell: "bare" | "full";
  // Screens with no visible page heading get a visually hidden h1.
  srTitle?: boolean;
  title: string;
};

const previewBase = "/admin/preview";
export const previewHref = (id: string) => `${previewBase}/${id}`;

// Navigation only lists what the signed-in role can use. Hiding items is for
// clarity: the database still enforces every action (Milestone 22, MP02/MP03).
const NAV_TARGET: Record<NavKey, string> = {
  audit: "b5-audit",
  library: "c1-library",
  linkhealth: "g2-link-health",
  links: "f3-links",
  overview: "b1-overview",
  partners: "f1-partners",
  people: "b2-people",
  publishing: "e2-publication",
  reminders: "g1-reminders",
  review: "c5-review",
  roles: "b4-roles",
  trash: "e3-trash",
};

type NavItem = {
  badge?: [string, "hot" | "red" | "warn"];
  icon: IconName;
  key: NavKey;
  label: string;
};
type NavGroup = { items: NavItem[]; title: string };

const NAV: Record<AdminRole, NavGroup[]> = {
  Owner: [
    {
      title: "",
      items: [{ key: "overview", label: "Overview", icon: "home" }],
    },
    {
      title: "Content",
      items: [
        { key: "library", label: "Library", icon: "book" },
        {
          key: "review",
          label: "Review queue",
          icon: "check",
          badge: ["3", "warn"],
        },
        {
          key: "publishing",
          label: "Publishing",
          icon: "send",
          badge: ["1", "red"],
        },
        { key: "trash", label: "Trash & recovery", icon: "trash" },
      ],
    },
    {
      title: "Partners",
      items: [
        { key: "partners", label: "Partners", icon: "globe" },
        { key: "links", label: "Affiliate links", icon: "link" },
      ],
    },
    {
      title: "People",
      items: [
        { key: "people", label: "People", icon: "users" },
        { key: "roles", label: "Roles & access", icon: "shield" },
      ],
    },
    {
      title: "Maintenance",
      items: [
        {
          key: "reminders",
          label: "Review reminders",
          icon: "clock",
          badge: ["5", "warn"],
        },
        {
          key: "linkhealth",
          label: "Link health",
          icon: "flag",
          badge: ["3", "red"],
        },
      ],
    },
    {
      title: "Records",
      items: [{ key: "audit", label: "Audit log", icon: "list" }],
    },
  ],
  Author: [
    {
      title: "",
      items: [{ key: "overview", label: "Overview", icon: "home" }],
    },
    {
      title: "Content",
      items: [
        {
          key: "library",
          label: "My drafts",
          icon: "book",
          badge: ["4", "hot"],
        },
      ],
    },
  ],
  "Affiliate Manager": [
    {
      title: "",
      items: [{ key: "overview", label: "Overview", icon: "home" }],
    },
    {
      title: "Partners",
      items: [
        { key: "partners", label: "Partners", icon: "globe" },
        { key: "links", label: "Affiliate links", icon: "link" },
      ],
    },
    {
      title: "Maintenance",
      items: [
        {
          key: "reminders",
          label: "My reminders",
          icon: "clock",
          badge: ["2", "warn"],
        },
      ],
    },
  ],
};

type Tab = { href: string; icon: IconName; key: string; label: string };

const TABS: Record<AdminRole, Tab[]> = {
  Owner: [
    {
      key: "overview",
      label: "Overview",
      icon: "home",
      href: previewHref("b1-overview"),
    },
    {
      key: "library",
      label: "Content",
      icon: "book",
      href: previewHref("c1-library"),
    },
    {
      key: "people",
      label: "People",
      icon: "users",
      href: previewHref("b2-people"),
    },
    {
      key: "partners",
      label: "Partners",
      icon: "globe",
      href: previewHref("f1-partners"),
    },
    {
      key: "more",
      label: "More",
      icon: "menu",
      href: previewHref("a5-navigation"),
    },
  ],
  Author: [
    {
      key: "overview",
      label: "Overview",
      icon: "home",
      href: previewHref("b1-overview"),
    },
    {
      key: "library",
      label: "My drafts",
      icon: "book",
      href: previewHref("c1-library"),
    },
    {
      key: "more",
      label: "More",
      icon: "menu",
      href: previewHref("a5-navigation"),
    },
  ],
  "Affiliate Manager": [
    {
      key: "overview",
      label: "Overview",
      icon: "home",
      href: previewHref("b1-overview"),
    },
    {
      key: "partners",
      label: "Partners",
      icon: "globe",
      href: previewHref("f1-partners"),
    },
    {
      key: "links",
      label: "Links",
      icon: "link",
      href: previewHref("f3-links"),
    },
    {
      key: "more",
      label: "More",
      icon: "menu",
      href: previewHref("a5-navigation"),
    },
  ],
};

const NAV_TO_TAB: Partial<Record<NavKey, string>> = {
  publishing: "library",
  review: "library",
  roles: "people",
  trash: "library",
};
const MORE_KEYS = new Set<NavKey>(["audit", "linkhealth", "reminders"]);

export function activeTab(nav: NavKey | "", role: AdminRole) {
  if (nav === "") return "";
  const mapped = NAV_TO_TAB[nav] ?? nav;
  if (role === "Owner" && MORE_KEYS.has(nav)) return "more";
  return TABS[role].some((tab) => tab.key === mapped) ? mapped : "more";
}

const USERS: Record<AdminRole, { initials: string; name: string }> = {
  Owner: { initials: "KB", name: "You" },
  Author: { initials: "GN", name: "Grace Njeri" },
  "Affiliate Manager": { initials: "LA", name: "Lina Abdi" },
};

export function Sidebar({
  current,
  label = "Administration",
  role,
}: {
  current: NavKey | "";
  label?: string;
  role: AdminRole;
}) {
  return (
    <nav aria-label={label}>
      {NAV[role].map((group) => (
        <div className={s.navgrp} key={group.title || "top"}>
          {group.title ? <h6>{group.title}</h6> : null}
          {group.items.map((item) => {
            const active = item.key === current;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cx(s.nav, active && s.on)}
                href={previewHref(NAV_TARGET[item.key])}
                key={item.key}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.badge ? (
                  <Pill kind={item.badge[1]}>{item.badge[0]}</Pill>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function TabBar({ current, role }: { current: NavKey | ""; role: AdminRole }) {
  const active = activeTab(current, role);
  return (
    <nav aria-label="Administration (mobile)" className={s.tabbar}>
      {TABS[role].map((tab) => (
        <Link
          aria-current={tab.key === active ? "page" : undefined}
          className={tab.key === active ? s.on : undefined}
          href={tab.href}
          key={tab.key}
        >
          <Icon name={tab.icon} />
          <span>{tab.label}</span>
          {tab.key === "library" && role === "Owner" ? (
            <span aria-hidden="true" className={s.dot} />
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

export function AdminShell({
  children,
  meta,
  neighbours,
  overlay,
}: {
  children: ReactNode;
  meta: ScreenMeta;
  neighbours: { next?: ScreenMeta; previous?: ScreenMeta };
  overlay?: ReactNode;
}) {
  const user = USERS[meta.role];
  const modalOpen = overlay ? true : undefined;
  return (
    <div className={s.root}>
      <header className={s.top}>
        <Link className={s.brand} href={previewBase}>
          PipStart
        </Link>
        <span className={s.section}>
          <Icon name="shield" />
          Administration
        </span>
        <div className={cx(s.who, s.right)}>
          {meta.mfa ? (
            <span className={s.mfa}>
              <Icon name="shield" />
              {meta.mfa}
            </span>
          ) : null}
          <Avatar initials={user.initials} />
          <div>
            <b>{user.name}</b>
            <small>{meta.role}</small>
          </div>
        </div>
      </header>

      <div className={s.previewBar} role="note">
        <span>
          Design preview · sample data only · controls are not connected ·{" "}
          {meta.num} {meta.title}
        </span>
        <span className={s.spacer}>
          <Link href={previewBase}>All screens</Link>
          {neighbours.previous ? (
            <Link href={previewHref(neighbours.previous.id)}>
              ← {neighbours.previous.num}
            </Link>
          ) : null}
          {neighbours.next ? (
            <Link href={previewHref(neighbours.next.id)}>
              {neighbours.next.num} →
            </Link>
          ) : null}
        </span>
      </div>

      <div className={cx(s.shell, meta.shell === "bare" && s.noside)}>
        {meta.shell === "full" ? (
          <aside
            aria-label="Administration navigation"
            className={s.side}
            inert={modalOpen}
          >
            <Sidebar current={meta.nav} role={meta.role} />
            <div className={s.sidefoot}>
              <b style={{ color: "var(--ink)" }}>Staff session</b>
              <br />
              Access is re-checked on every action. Sensitive actions ask for a
              fresh code.
            </div>
          </aside>
        ) : null}
        <main
          className={cx(s.main, meta.shell === "bare" && s.center)}
          id="main-content"
          inert={modalOpen}
        >
          {meta.srTitle ? <h1 className={s.srOnly}>{meta.title}</h1> : null}
          {children}
          <p className={s.pageFoot} style={{ padding: "2rem 0 0" }}>
            {meta.shell === "full"
              ? "Mock-up · sample data only · Educational content only — not financial advice."
              : "Mock-up · sample data only"}
          </p>
        </main>
        {overlay}
      </div>
      {meta.shell === "full" ? (
        <TabBar current={meta.nav} role={meta.role} />
      ) : null}
    </div>
  );
}
