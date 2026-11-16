import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import {
  partnerItemId,
  partnerSlug,
} from "@/lib/content/partner-editor-contract";
import { StaffFrame } from "@/components/staff/staff-frame";
import { canOpenMaintenance } from "@/lib/content/maintenance-contract";
import { StaffPartnerEditor } from "@/components/staff/staff-partner-editor";
import { runPartnerEditorAction } from "../partner-actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Partner and link drafts | PipStart",
  robots: { index: false, follow: false },
};
type Params = { id?: string | string[]; link?: string | string[] };
// /partner (new partner), /partner?id=partner:x or link:x (edit), /partner?link=x (new link for partner:x).
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  if (
    !gate.access.roles.some((r) => ["owner", "affiliate_manager"].includes(r))
  )
    notFound();
  const params = await searchParams;
  if (Object.values(params).some((v) => typeof v !== "string")) notFound();
  if (params.id !== undefined && params.link !== undefined) notFound();
  const isOwner = gate.access.roles.includes("owner");
  const frame = (children: React.ReactNode) => (
    <StaffFrame
      verified
      maintenance={canOpenMaintenance(gate.access)}
      content
      people={gate.access.capabilities.includes("people.read")}
      audit={gate.access.capabilities.includes("audit.read")}
    >
      {children}
    </StaffFrame>
  );
  if (params.id !== undefined) {
    if (!partnerItemId(params.id)) notFound();
    const result = await runPartnerEditorAction({
      kind: "load",
      id: params.id,
    });
    if (result.kind !== "ready")
      return frame(
        <>
          <h1>Partner editor unavailable</h1>
          <p>
            The item could not be loaded with your current access. No content
            was changed.
          </p>
          <a href="/admin/staff/content">Back to content library</a>
        </>,
      );
    return frame(
      // Keyed by the loaded item: moving between new, partner and link pages remounts the form
      // instead of keeping the previous page's entries.
      <StaffPartnerEditor
        key={
          result.view.kind + ":" + result.view.slug + ":" + result.view.revision
        }
        view={result.view}
        create={null}
        isOwner={isOwner}
      />,
    );
  }
  if (params.link !== undefined) {
    if (!partnerSlug(params.link)) notFound();
    const partner = await runPartnerEditorAction({
      kind: "load",
      id: "partner:" + params.link,
    });
    const existing = await runPartnerEditorAction({
      kind: "load",
      id: "link:" + params.link,
    });
    const policy = await runPartnerEditorAction({
      kind: "read-policy",
      id: "link:" + params.link,
    });
    if (
      partner.kind !== "ready" ||
      existing.kind === "ready" ||
      policy.kind !== "policy"
    )
      notFound();
    return frame(
      <StaffPartnerEditor
        key={"new-link:" + params.link}
        view={null}
        create={{ kind: "link", slug: params.link, policy: policy.policy }}
        isOwner={isOwner}
      />,
    );
  }
  return frame(
    <StaffPartnerEditor
      key="new-partner"
      view={null}
      create={{ kind: "partner", slug: "", policy: null }}
      isOwner={isOwner}
    />,
  );
}
