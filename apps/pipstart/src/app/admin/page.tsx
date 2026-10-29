import { redirect } from "next/navigation";

import { STAFF_ENTRY_PATH } from "@/lib/auth/staff-entry";

// The legacy profile-role gate is retired. Staff entry applies its own
// MFA, live membership and default-closed checks.
export default function AdminPage() {
  redirect(STAFF_ENTRY_PATH);
}
