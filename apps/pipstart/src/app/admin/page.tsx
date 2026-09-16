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
    </AccountShell>
  );
}
