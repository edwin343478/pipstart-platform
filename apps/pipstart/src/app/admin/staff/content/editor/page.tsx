import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { draftId } from "@/lib/content/curriculum-draft-contract";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffCurriculumEditor } from "@/components/staff/staff-curriculum-editor";
import { runCurriculumDraftAction } from "../draft-actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Course and module drafts | PipStart",
  robots: { index: false, follow: false },
};
type Params = {
  id?: string | string[];
  family?: string | string[];
  path?: string | string[];
  parent?: string | string[];
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  if (!gate.access.roles.some((r) => ["owner", "author", "editor"].includes(r)))
    notFound();
  const params = await searchParams;
  if (Object.values(params).some((v) => typeof v !== "string")) notFound();
  let item = null;
  const creation = {
    family: "course" as "course" | "module",
    path: "forex" as "forex" | "crypto",
    parent: "",
    level: "level-1",
  };
  if (params.id !== undefined) {
    if (!draftId(params.id)) notFound();
    const result = await runCurriculumDraftAction({
      kind: "load",
      id: params.id,
    });
    if (result.kind === "ready") item = result.item;
    else
      return (
        <StaffFrame verified content>
          <h1>Draft editor unavailable</h1>
          <p>
            The item could not be loaded with your current access. No content
            was changed.
          </p>
          <a href="/admin/staff/content">Back to content library</a>
        </StaffFrame>
      );
  } else {
    if (params.family !== "course" && params.family !== "module") notFound();
    if (params.family === "course" && !gate.access.roles.includes("owner"))
      notFound();
    if (
      params.path !== undefined &&
      !["forex", "crypto"].includes(String(params.path))
    )
      notFound();
    if (params.parent !== undefined && !draftId(params.parent)) notFound();
    creation.family = params.family;
    creation.path = (params.path ?? "forex") as "forex" | "crypto";
    creation.parent = String(params.parent ?? "");
  }
  return (
    <StaffFrame
      verified
      content
      people={gate.access.capabilities.includes("people.read")}
      audit={gate.access.capabilities.includes("audit.read")}
    >
      <StaffCurriculumEditor item={item} creation={creation} />
    </StaffFrame>
  );
}
