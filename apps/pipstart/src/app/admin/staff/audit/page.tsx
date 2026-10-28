import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffAudit } from "@/components/staff/staff-audit";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parseAuditCursor,
  parseStaffAudit,
  STAFF_AUDIT_PAGE_SIZE,
  type AuditPage,
} from "@/lib/auth/staff-audit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Staff audit | PipStart",
  robots: { index: false, follow: false },
};
export default async function StaffAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  if (!gate.access.capabilities.includes("audit.read")) notFound();
  const input = parseAuditCursor(await searchParams);
  let page: AuditPage | null = null;
  if (input.kind === "ready") {
    try {
      const client = await createSupabaseServerClient();
      if (client) {
        const reply = await client
          .rpc("pipstart_staff_audit_page", {
            p_before: input.cursor?.before ?? null,
            p_before_id: input.cursor?.beforeId ?? null,
            p_limit: STAFF_AUDIT_PAGE_SIZE + 1,
          })
          .abortSignal(AbortSignal.timeout(8_000));
        if (!reply.error) {
          const parsed = parseStaffAudit(reply.data, input.cursor);
          if (parsed.kind === "ready") page = parsed;
        }
      }
    } catch {
      /* No sample fallback, raw errors, export or retry. */
    }
  }
  return (
    <StaffFrame
      verified
      audit
      people={gate.access.capabilities.includes("people.read")}
    >
      <StaffAudit
        page={page}
        invalid={input.kind === "invalid"}
        paginated={input.kind === "ready" && input.cursor !== null}
      />
    </StaffFrame>
  );
}
