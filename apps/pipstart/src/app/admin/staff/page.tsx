import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Icon, type IconName } from "@/components/admin-preview/icons";
import { StaffFrame } from "@/components/staff/staff-frame";
import { canOpenMaintenance } from "@/lib/content/maintenance-contract";
import styles from "@/components/staff/staff.module.css";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";

import { canOpenContentWorkspace } from "@/lib/content/editorial-workspace-contract";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Staff overview | PipStart",
  robots: { index: false, follow: false },
};

type Section = {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  action: string;
  prefetch?: false;
};

export default async function StaffHomePage() {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  // Same links and the same capability conditions as before the redesign.
  const sections: Section[] = [];
  if (canOpenContentWorkspace(gate.access))
    sections.push({
      href: "/admin/staff/content",
      icon: "book",
      title: "Content library",
      description:
        "Courses, lessons, quizzes and partner links, with their draft and review status.",
      action: "Open content library",
      prefetch: false,
    });
  if (gate.access.capabilities.includes("people.read"))
    sections.push({
      href: "/admin/staff/people",
      icon: "users",
      title: "People",
      description: "Staff roles and learner accounts.",
      action: "Open people and role management",
    });
  if (gate.access.capabilities.includes("audit.read"))
    sections.push({
      href: "/admin/staff/audit",
      icon: "clock",
      title: "Staff audit",
      description: "A record of staff actions, for review.",
      action: "Open staff audit",
      prefetch: false,
    });
  return (
    <StaffFrame
      appearance="overview"
      verified
      maintenance={canOpenMaintenance(gate.access)}
      content={canOpenContentWorkspace(gate.access)}
      audit={gate.access.capabilities.includes("audit.read")}
      people={gate.access.capabilities.includes("people.read")}
    >
      <div className={styles.access}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Staff area</p>
          <h1>Staff overview</h1>
          <p className={styles.lead}>
            Your current staff grants were checked for this request.
          </p>
        </div>
        {sections.length > 0 && (
          <ul className={styles.sectionCards}>
            {sections.map((section) => (
              <li className={styles.sectionCard} key={section.href}>
                <span className={styles.badge}>
                  <Icon name={section.icon} />
                </span>
                <h2 className={styles.cardTitle}>{section.title}</h2>
                <p>{section.description}</p>
                <Link
                  className={styles.sectionLink}
                  href={section.href}
                  prefetch={section.prefetch}
                >
                  {section.action}
                  <Icon name="chevR" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.overviewGrid}>
          <section
            className={styles.overviewCard}
            aria-labelledby="staff-roles-title"
          >
            <div className={styles.cardHead}>
              <span className={styles.badge}>
                <Icon name="user" />
              </span>
              <h2 className={styles.cardTitle} id="staff-roles-title">
                Your staff roles
              </h2>
            </div>
            <ul className={styles.roleChips}>
              {gate.access.roles.map((role) => (
                <li key={role}>{role.replaceAll("_", " ")}</li>
              ))}
            </ul>
          </section>
          <section
            className={styles.overviewCard}
            aria-labelledby="staff-security-title"
          >
            <div className={styles.cardHead}>
              <span className={styles.badge}>
                <Icon name="shield" />
              </span>
              <h2 className={styles.cardTitle} id="staff-security-title">
                Account security
              </h2>
            </div>
            <p className={styles.noteBox}>
              <Icon name="info" />
              <span>
                A verified staff session is not a fresh verification receipt for
                a sensitive action.
              </span>
            </p>
            <Link
              className={styles.secondaryAction}
              href="/admin/access?backup=1"
            >
              <Icon name="device" />
              Set up a backup authenticator
            </Link>
          </section>
        </div>
      </div>
    </StaffFrame>
  );
}
