import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StaffFrame } from "@/components/staff/staff-frame";
import {
  StaffContentMaintenance,
  type LinkReport,
} from "@/components/staff/staff-content-maintenance";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canOpenContentWorkspace } from "@/lib/content/editorial-workspace-contract";
import { liveGeneration } from "@/lib/content/live-generation";
import {
  readMaintenancePage,
  type MaintenancePage,
} from "@/lib/content/maintenance";
import {
  canOpenMaintenance,
  contentId,
  MAINTENANCE_FAMILIES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_VIEWS,
  type MaintenanceFamily,
  type MaintenanceStatus,
  type MaintenanceView,
} from "@/lib/content/maintenance-contract";
import {
  describeFinding,
  referenceReport,
  snapshotReferenceItems,
} from "@/lib/content/reference-check";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Maintenance | PipStart",
  robots: { index: false, follow: false },
};

const one = (v: string | string[] | undefined) =>
  typeof v === "string" ? v : undefined;

/** The internal reference report for the generation this deployment serves (MP10b). */
function linkReport(): LinkReport {
  try {
    const live = liveGeneration();
    if (!live) return { kind: "code" };
    const items = snapshotReferenceItems(live.snapshot);
    return {
      kind: "ready",
      generation: live.generation,
      items: items.length,
      lines: referenceReport(items).map(
        (f) => `${f.itemId}: ${describeFinding(f)}`,
      ),
    };
  } catch {
    return { kind: "unavailable" };
  }
}

export default async function StaffMaintenancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  if (!canOpenMaintenance(gate.access)) notFound();
  const owner = gate.access.roles.includes("owner");
  const editor = gate.access.roles.includes("editor");
  const q = await searchParams;
  const requested = one(q.view);
  const chosen: MaintenanceView = (
    MAINTENANCE_VIEWS as readonly string[]
  ).includes(requested ?? "")
    ? (requested as MaintenanceView)
    : "mine";
  // "Due and overdue" across items is for the Owner and Editors; others see their own list.
  const view: MaintenanceView =
    chosen === "all" && !owner && !editor ? "mine" : chosen;
  const status = (MAINTENANCE_STATUSES as readonly string[]).includes(
    one(q.status) ?? "",
  )
    ? (one(q.status) as MaintenanceStatus)
    : null;
  const family = (MAINTENANCE_FAMILIES as readonly string[]).includes(
    one(q.family) ?? "",
  )
    ? (one(q.family) as MaintenanceFamily)
    : null;
  const after = contentId(one(q.after)) ? (one(q.after) as string) : "";
  const scope = view === "mine" ? "mine" : view === "all" ? "all" : null;
  let page: MaintenancePage = {
    worklist: null,
    intervals: null,
    allowlist: null,
    staff: null,
  };
  try {
    const client = await createSupabaseServerClient();
    if (client)
      page = await readMaintenancePage(client, {
        scope,
        status,
        family,
        after,
        owner,
        policy: view === "policy",
      });
  } catch {
    /* Fail closed: each section shows that it could not be read. */
  }
  return (
    <StaffFrame
      verified
      content={canOpenContentWorkspace(gate.access)}
      maintenance
      people={gate.access.capabilities.includes("people.read")}
      audit={gate.access.capabilities.includes("audit.read")}
    >
      <StaffContentMaintenance
        view={view}
        filters={{ status, family, after }}
        page={page}
        report={view === "report" ? linkReport() : null}
        me={gate.access.user_id}
        owner={owner}
        editor={editor}
        probeEnabled={process.env.PIPSTART_MAINTENANCE_PROBE_ENABLED === "true"}
      />
    </StaffFrame>
  );
}
