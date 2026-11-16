import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StaffFrame } from "@/components/staff/staff-frame";
import { canOpenMaintenance } from "@/lib/content/maintenance-contract";
import { StaffAudit } from "@/components/staff/staff-audit";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  auditFiltered,
  auditRpcArgs,
  parseAuditQuery,
  parseContentAudit,
  parseStaffAudit,
  STAFF_AUDIT_PAGE_SIZE,
  type AuditPage,
  type ContentAuditPage,
} from "@/lib/auth/staff-audit";

import { canOpenContentWorkspace } from "@/lib/content/editorial-workspace-contract";

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
  const input = parseAuditQuery(await searchParams);
  let page: AuditPage | null = null;
  let contentPage: ContentAuditPage | null = null;
  if (input.kind === "ready") {
    const q = input.query;
    try {
      const client = await createSupabaseServerClient();
      if (client) {
        // An unfiltered staff query keeps the original page and arguments (MP02); filters and the
        // content view use the MP10f views (D7).
        const reply = !auditFiltered(q)
          ? await client
              .rpc("pipstart_staff_audit_page", {
                p_before: q.cursor?.before ?? null,
                p_before_id: q.cursor?.beforeId ?? null,
                p_limit: STAFF_AUDIT_PAGE_SIZE + 1,
              })
              .abortSignal(AbortSignal.timeout(8_000))
          : await client
              .rpc(
                q.source === "staff"
                  ? "pipstart_staff_audit_page_filtered"
                  : "pipstart_content_audit_page",
                auditRpcArgs(q),
              )
              .abortSignal(AbortSignal.timeout(8_000));
        if (!reply.error) {
          if (q.source === "staff") {
            const parsed = parseStaffAudit(reply.data, q.cursor);
            if (parsed.kind === "ready") page = parsed;
          } else {
            const parsed = parseContentAudit(reply.data, q.cursor);
            if (parsed.kind === "ready") contentPage = parsed;
          }
        }
      }
    } catch {
      /* No sample fallback, raw errors, export or retry. */
    }
  }
  return (
    <StaffFrame
      verified
      maintenance={canOpenMaintenance(gate.access)}
      content={canOpenContentWorkspace(gate.access)}
      audit
      people={gate.access.capabilities.includes("people.read")}
    >
      <StaffAudit
        page={page}
        contentPage={contentPage}
        query={input.kind === "ready" ? input.query : null}
        invalid={input.kind === "invalid"}
        paginated={input.kind === "ready" && input.query.cursor !== null}
      />
    </StaffFrame>
  );
}
