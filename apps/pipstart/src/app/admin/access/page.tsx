import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffMfa } from "@/components/staff/staff-mfa";
import styles from "@/components/staff/staff.module.css";
import { getLoginRedirect } from "@/lib/auth/redirects";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Staff verification | PipStart",
  robots: { index: false, follow: false },
};

export default async function StaffAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ backup?: string }>;
}) {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind === "signed-out") redirect(getLoginRedirect("/admin/access"));
  const backup = (await searchParams).backup === "1";
  if (gate.kind === "authorized" && !backup) redirect("/admin/staff");
  return (
    <StaffFrame>
      <section className={styles.panel}>
        {gate.kind === "challenge" || gate.kind === "authorized" ? (
          <StaffMfa
            userId={
              gate.kind === "authorized" ? gate.access.user_id : gate.userId
            }
            backup={gate.kind === "authorized" && backup}
          />
        ) : (
          <>
            <h1>
              {gate.kind === "unavailable"
                ? "Staff access is temporarily unavailable"
                : "Staff access is not available for this account"}
            </h1>
            <p>
              {gate.kind === "unavailable"
                ? "No permission was granted. Try this page again later."
                : "Verification alone does not grant a staff role. Ask the Owner if you need staff access."}
            </p>
            <Link className={styles.link} href="/dashboard">
              Return to your learner dashboard
            </Link>
          </>
        )}
      </section>
    </StaffFrame>
  );
}
