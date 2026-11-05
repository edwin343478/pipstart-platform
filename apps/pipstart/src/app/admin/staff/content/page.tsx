import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffContentWorkspace } from "@/components/staff/staff-content-workspace";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { canOpenContentWorkspace } from "@/lib/content/editorial-workspace-contract";
import { readEditorialWorkspaceAction } from "./actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Content library | PipStart",
  robots: { index: false, follow: false },
};
export default async function StaffContentPage() {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  if (!canOpenContentWorkspace(gate.access)) notFound();
  const result = await readEditorialWorkspaceAction({
    kind: "list",
    after: "",
  });
  return (
    <StaffFrame
      verified
      content
      people={gate.access.capabilities.includes("people.read")}
      audit={gate.access.capabilities.includes("audit.read")}
    >
      <StaffContentWorkspace
        canEdit={gate.access.roles.some((r) =>
          ["owner", "author", "editor"].includes(r),
        )}
        canCreateCourse={gate.access.roles.includes("owner")}
        canSubmit={gate.access.roles.some((r) =>
          ["owner", "author", "editor"].includes(r),
        )}
        canReview={gate.access.roles.some((r) =>
          ["owner", "reviewer"].includes(r),
        )}
        canPublish={gate.access.roles.includes("owner")}
        canArchive={gate.access.roles.some((r) =>
          ["owner", "author", "editor"].includes(r),
        )}
        canRestore={gate.access.roles.some((r) =>
          ["owner", "editor"].includes(r),
        )}
        canHold={gate.access.roles.includes("owner")}
        initialPage={result.kind === "list" ? result.page : null}
      />
    </StaffFrame>
  );
}
