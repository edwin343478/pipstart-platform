import "server-only";

import { parseStaffAccess, type StaffAccessResult } from "./staff-access";
import { needsStaffChallenge, staffDeadline } from "./staff-entry";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function staffUiEnabled() {
  return process.env.PIPSTART_M22_STAFF_UI_ENABLED === "true";
}

export type StaffGateResult =
  | { kind: "signed-out" | "unavailable" | "denied" }
  | { kind: "challenge"; userId: string }
  | Extract<StaffAccessResult, { kind: "authorized" }>;

// Never cache this result: an open tab must not preserve revoked grants.
export async function readStaffGate(): Promise<StaffGateResult> {
  if (!staffUiEnabled()) return { kind: "denied" };
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { kind: "unavailable" };
    const identity = await staffDeadline(supabase.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "signed-out" };
    const assurance = await staffDeadline(
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    );
    if (assurance.error || !assurance.data) return { kind: "unavailable" };
    // SDK 2.100.0 can retain nextLevel=aal2 from a stale session after factor
    // removal. Also require a fresh provider-reported verified TOTP factor.
    const currentTotp = identity.data.user.factors?.some(
      (factor) => factor.status === "verified" && factor.factor_type === "totp",
    );
    if (
      !currentTotp ||
      needsStaffChallenge(assurance.data.currentLevel, assurance.data.nextLevel)
    ) {
      return { kind: "challenge", userId: identity.data.user.id };
    }
    const response = await supabase
      .rpc("pipstart_staff_access", { p_kind: "", p_id: "" })
      .abortSignal(AbortSignal.timeout(8_000));
    if (response.error) return { kind: "unavailable" };
    return parseStaffAccess(response.data, identity.data.user.id);
  } catch {
    return { kind: "unavailable" };
  }
}
