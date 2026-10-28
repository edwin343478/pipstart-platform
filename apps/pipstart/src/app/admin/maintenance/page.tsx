import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffMaintenance } from "@/components/staff/staff-maintenance";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { maintenanceConfigured } from "@/lib/supabase/staff-maintenance";
import { staffDeadline } from "@/lib/auth/staff-entry";
import { getLoginRedirect } from "@/lib/auth/redirects";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Owner maintenance | PipStart",
  robots: { index: false, follow: false },
};
export default async function MaintenancePage() {
  if (!maintenanceConfigured()) notFound();
  const client = await createSupabaseServerClient();
  if (!client) notFound();
  const identity = await staffDeadline(client.auth.getUser()).catch(() => null);
  if (!identity || identity.error || !identity.data.user)
    redirect(getLoginRedirect("/admin/maintenance"));
  // This shell exposes no protected account data. Every review/claim requires
  // a live paused Owner and an exact fresh request-bound MFA receipt in SQL.
  return (
    <StaffFrame paused>
      <StaffMaintenance userId={identity.data.user.id} />
    </StaffFrame>
  );
}
