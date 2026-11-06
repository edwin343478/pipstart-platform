import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { draftId } from "@/lib/content/curriculum-draft-contract";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffQuizEditor } from "@/components/staff/staff-quiz-editor";
import { runQuizDraftAction } from "../quiz-actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Quiz drafts | PipStart",
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
  // Existing quizzes only: a quiz is opened by its permanent identity.
  if (
    Object.keys(params).length !== 1 ||
    typeof params.id !== "string" ||
    !draftId(params.id)
  )
    notFound();
  const result = await runQuizDraftAction({ kind: "load", id: params.id });
  if (result.kind !== "ready")
    return (
      <StaffFrame verified content>
        <h1>Quiz editor unavailable</h1>
        <p>
          The quiz could not be read with your current access, or it is outside
          the supported question rules. No content was changed.
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
      <StaffQuizEditor item={result.item} />
    </StaffFrame>
  );
}
