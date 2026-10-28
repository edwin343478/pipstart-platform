import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StaffFrame } from "@/components/staff/staff-frame";
import styles from "@/components/staff/staff.module.css";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Staff overview | PipStart",
  robots: { index: false, follow: false },
};

export default async function StaffHomePage() {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  return (
    <StaffFrame
      verified
      audit={gate.access.capabilities.includes("audit.read")}
      people={gate.access.capabilities.includes("people.read")}
    >
      <section className={styles.panel}>
        <h1>Staff overview</h1>
        <p>Your current staff grants were checked for this request.</p>
        {gate.access.capabilities.includes("people.read") && (
          <p>
            <Link className={styles.link} href="/admin/staff/people">
              Open people and role management
            </Link>
          </p>
        )}
        {gate.access.capabilities.includes("audit.read") && (
          <p>
            <Link
              className={styles.link}
              href="/admin/staff/audit"
              prefetch={false}
            >
              Open staff audit
            </Link>
          </p>
        )}
        <h2>Your staff roles</h2>
        <ul className={styles.roles}>
          {gate.access.roles.map((role) => (
            <li key={role}>{role.replaceAll("_", " ")}</li>
          ))}
        </ul>
        <p className={styles.notice}>
          A verified staff session is not a fresh verification receipt for a
          sensitive action.
        </p>
        <Link className={styles.link} href="/admin/access?backup=1">
          Set up a backup authenticator
        </Link>
      </section>
    </StaffFrame>
  );
}
