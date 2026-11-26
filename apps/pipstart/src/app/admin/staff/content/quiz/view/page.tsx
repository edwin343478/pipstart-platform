import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { draftId } from "@/lib/content/curriculum-draft-contract";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffQuizView } from "@/components/staff/staff-quiz-view";
import staffStyles from "@/components/staff/staff.module.css";
import { runQuizViewAction } from "../../quiz-actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Quiz review | PipStart",
  robots: { index: false, follow: false },
};
const VIEWERS = ["owner", "author", "editor", "reviewer"];
/** Package 5 (D4): one quiz revision, read-only, for staff who review or edit quizzes. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  if (!gate.access.roles.some((r) => VIEWERS.includes(r))) notFound();
  const params = await searchParams;
  const keys = Object.keys(params).sort().join(",");
  if (
    !["id", "id,revision"].includes(keys) ||
    typeof params.id !== "string" ||
    !draftId(params.id) ||
    (params.revision !== undefined &&
      (typeof params.revision !== "string" ||
        !/^[1-9][0-9]{0,9}$/.test(params.revision)))
  )
    notFound();
  const result = await runQuizViewAction({
    id: params.id,
    revision:
      typeof params.revision === "string" ? Number(params.revision) : null,
  });
  if (result.kind !== "ready")
    return (
      <StaffFrame appearance="content" verified content>
        <section className={staffStyles.stateCard}>
          <p className={staffStyles.eyebrow}>Content · Quiz (read only)</p>
          <h1>Quiz unavailable</h1>
          <p>
            The quiz could not be read with your current access, or it is
            outside the supported question rules. No content was changed.
          </p>
          <a className={staffStyles.primary} href="/admin/staff/content">
            Back to content library
          </a>
        </section>
      </StaffFrame>
    );
  return (
    <StaffFrame
      appearance="content"
      verified
      content
      people={gate.access.capabilities.includes("people.read")}
      audit={gate.access.capabilities.includes("audit.read")}
    >
      <StaffQuizView
        view={result.view}
        canEdit={gate.access.roles.some((r) =>
          ["owner", "author", "editor"].includes(r),
        )}
      />
    </StaffFrame>
  );
}
