import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { draftId } from "@/lib/content/curriculum-draft-contract";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffQuizEditor } from "@/components/staff/staff-quiz-editor";
import staffStyles from "@/components/staff/staff.module.css";
import { newQuizView } from "@/lib/content/quiz-new";
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
  const keys = Object.keys(params).sort().join(",");
  // Package 5: a new quiz is created in a module (?parent=&path=); an existing quiz is opened by
  // its permanent identity (?id=). Nothing else is accepted.
  if (
    keys === "parent,path" &&
    typeof params.parent === "string" &&
    draftId(params.parent) &&
    (params.path === "forex" || params.path === "crypto")
  ) {
    const creation = { path: params.path, parent: params.parent } as const;
    return (
      <StaffFrame
        appearance="content"
        verified
        content
        people={gate.access.capabilities.includes("people.read")}
        audit={gate.access.capabilities.includes("audit.read")}
      >
        <StaffQuizEditor item={newQuizView(creation)} creation={creation} />
      </StaffFrame>
    );
  }
  if (keys !== "id" || typeof params.id !== "string" || !draftId(params.id))
    notFound();
  const result = await runQuizDraftAction({ kind: "load", id: params.id });
  if (result.kind !== "ready")
    return (
      <StaffFrame appearance="content" verified content>
        <section className={staffStyles.stateCard}>
          <p className={staffStyles.eyebrow}>Content · Quiz draft</p>
          <h1>Quiz editor unavailable</h1>
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
      <StaffQuizEditor item={result.item} />
    </StaffFrame>
  );
}
