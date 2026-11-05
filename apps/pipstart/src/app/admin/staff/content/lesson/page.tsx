import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { draftId } from "@/lib/content/curriculum-draft-contract";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffLessonEditor } from "@/components/staff/staff-lesson-editor";
import { runLessonEditorAction } from "../lesson-actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Lesson drafts | PipStart",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  if (!gate.access.roles.some((r) => ["owner", "author", "editor"].includes(r)))
    notFound();
  const params = await searchParams;
  if (
    Object.entries(params).some(
      ([k, v]) =>
        !["id", "path", "parent"].includes(k) || typeof v !== "string",
    )
  )
    notFound();
  if (
    params.id !== undefined &&
    (Object.keys(params).length !== 1 || !draftId(params.id))
  )
    notFound();
  if (
    params.path !== undefined &&
    !["forex", "crypto"].includes(String(params.path))
  )
    notFound();
  if (params.parent !== undefined && !draftId(params.parent)) notFound();
  const result =
    params.id !== undefined
      ? await runLessonEditorAction({ kind: "load", id: params.id })
      : null;
  if (result && result.kind !== "ready")
    return (
      <StaffFrame verified content>
        <h1>Lesson editor unavailable</h1>
        <p>
          The lesson could not be read with your current access. No content was
          changed.
        </p>
        <a href="/admin/staff/content">Back to content library</a>
      </StaffFrame>
    );
  return (
    <StaffFrame
      verified
      content
      people={gate.access.capabilities.includes("people.read")}
      audit={gate.access.capabilities.includes("audit.read")}
    >
      <StaffLessonEditor
        item={result?.kind === "ready" ? result.item : null}
        creation={{
          path: (params.path ?? "forex") as "forex" | "crypto",
          parent: String(params.parent ?? ""),
        }}
      />
    </StaffFrame>
  );
}
