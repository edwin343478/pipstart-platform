import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StaffFrame } from "@/components/staff/staff-frame";
import { StaffPeople } from "@/components/staff/staff-people";
import { readStaffGate, staffUiEnabled } from "@/lib/auth/staff-gate";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseStaffPeople } from "@/lib/auth/staff-people";
import { learnerProviderConfigured } from "@/lib/supabase/learner-provider";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "People | PipStart",
  robots: { index: false, follow: false },
};
export default async function StaffPeoplePage() {
  if (!staffUiEnabled()) notFound();
  const gate = await readStaffGate();
  if (gate.kind !== "authorized") redirect("/admin/access");
  if (!gate.access.capabilities.includes("people.read")) notFound();
  let page: ReturnType<typeof parseStaffPeople> = { kind: "unavailable" };
  try {
    const client = await createSupabaseServerClient();
    if (client) {
      const reply = await client
        .rpc("pipstart_staff_people", {
          p_after: null,
          p_limit: 25,
          p_query: "",
          p_user: null,
        })
        .abortSignal(AbortSignal.timeout(8_000));
      if (!reply.error) page = parseStaffPeople(reply.data);
    }
  } catch {
    /* Fail closed; no sample data or Auth export fallback. */
  }
  return (
    <StaffFrame
      verified
      people
      audit={gate.access.capabilities.includes("audit.read")}
    >
      <StaffPeople
        accountEnabled={learnerProviderConfigured()}
        access={gate.access}
        initialPage={page.kind === "ready" ? page : null}
      />
    </StaffFrame>
  );
}
