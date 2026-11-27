import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { analysisId } from "@/lib/content/analysis-draft-contract";
import { canOpenMaintenance } from "@/lib/content/maintenance-contract";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffAnalysisEditor } from "@/components/staff/staff-analysis-editor";
import staffStyles from "@/components/staff/staff.module.css";
import { runAnalysisDraftAction } from "../analysis-actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Analysis post drafts | PipStart",
  robots: { index: false, follow: false },
};
type Params = { id?: string | string[] };
// TA-b: /analysis (new post) or /analysis?id=<post> (edit). Owner only: the store grants
// analysis-post writes to the Owner alone.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  if (!gate.access.roles.includes("owner")) notFound();
  const params = await searchParams;
  if (Object.values(params).some((v) => typeof v !== "string")) notFound();
  const frame = (children: React.ReactNode) => (
    <StaffFrame
      appearance="content"
      verified
      maintenance={canOpenMaintenance(gate.access)}
      content
      people={gate.access.capabilities.includes("people.read")}
      audit={gate.access.capabilities.includes("audit.read")}
    >
      {children}
    </StaffFrame>
  );
  if (params.id === undefined)
    return frame(<StaffAnalysisEditor key="new-analysis" item={null} />);
  if (!analysisId(params.id)) notFound();
  const result = await runAnalysisDraftAction({ kind: "load", id: params.id });
  if (result.kind !== "ready")
    return frame(
      <section className={staffStyles.stateCard}>
        <p className={staffStyles.eyebrow}>Content · Analysis post</p>
        <h1>Analysis editor unavailable</h1>
        <p>
          The post could not be loaded with your current access, or its saved
          shape cannot be edited here. No content was changed.
        </p>
        <a className={staffStyles.primary} href="/admin/staff/content">
          Back to content library
        </a>
      </section>,
    );
  return frame(
    <StaffAnalysisEditor
      key={result.item.id + ":" + result.item.revision}
      item={result.item}
    />,
  );
}
