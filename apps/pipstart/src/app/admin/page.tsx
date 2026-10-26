import Link from "next/link";

import { AccountShell } from "@/components/account-shell";
import { requireAdministrator } from "@/lib/auth/session";

export default async function AdminPage() {
  await requireAdministrator();
  return (
    <AccountShell
      description="Administrator access is active. Administrative tools will be introduced in a later milestone."
      title="Administration"
    >
      <p>No administrative tools are published yet.</p>
      <p>
        <Link href="/admin/preview">Open the Milestone 22 design preview</Link>{" "}
        to review the planned administration screens. It shows sample data only
        and nothing in it is connected.
      </p>
    </AccountShell>
  );
}
