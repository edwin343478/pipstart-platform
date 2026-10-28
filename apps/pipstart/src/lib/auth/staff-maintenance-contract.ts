import { isFactorId } from "./staff-entry";
import type { AccountProof } from "./staff-account-proof";
export type MaintenanceReview = Readonly<{
  request_id: string;
  target_id: string;
  operation: "auth_suspend" | "auth_resume";
  suspend_until: string | null;
  reason: "security_response" | "access_change";
  state: string;
  status: "reviewed";
}>;
export function validMaintenanceProof(v: unknown): v is AccountProof {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const p = v as Record<string, unknown>;
  return (
    Object.keys(p).sort().join(",") === "expiresAt,mode,request,token" &&
    isFactorId(p.request) &&
    p.request === p.request.toLowerCase() &&
    (p.mode === "dispatch" || p.mode === "inspect") &&
    typeof p.token === "string" &&
    /^[a-f0-9]{64}$/.test(p.token) &&
    typeof p.expiresAt === "string" &&
    Number.isFinite(Date.parse(p.expiresAt))
  );
}
export function parseMaintenanceReview(
  v: unknown,
  request: string,
): MaintenanceReview | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const r = v as Record<string, unknown>;
  if (
    Object.keys(r).sort().join(",") !==
      "operation,reason,request_id,state,status,suspend_until,target_id" ||
    r.status !== "reviewed" ||
    r.request_id !== request ||
    !isFactorId(r.target_id) ||
    !["auth_suspend", "auth_resume"].includes(String(r.operation)) ||
    !["security_response", "access_change"].includes(String(r.reason)) ||
    ![
      "prepared",
      "dispatched",
      "succeeded",
      "failed",
      "unknown",
      "cancelled",
      "observed_desired",
      "observed_other",
    ].includes(String(r.state)) ||
    (r.operation === "auth_resume"
      ? r.suspend_until !== null
      : typeof r.suspend_until !== "string" ||
        !Number.isFinite(Date.parse(r.suspend_until)))
  )
    return null;
  return Object.freeze(r as MaintenanceReview);
}
