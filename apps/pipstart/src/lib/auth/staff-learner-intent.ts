import type { LiveStaffAccess } from "./staff-role-flow";

export type LearnerCommand = Readonly<{
  request: string;
  target: string;
  operation: "auth_suspend" | "auth_resume";
  until: string | null;
  reason: "security_response" | "access_change";
}>;
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    v,
  );
const timestamp = (v: unknown): v is string =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(
    v,
  ) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v.slice(0, 10) + "T00:00:00Z").toISOString().slice(0, 10) ===
    v.slice(0, 10);

// Presentation validation only. The RPC checks live capability, target class,
// exact provider verification, expiry and atomic consumption under SQL locks.
export function validLearnerCommand(v: unknown): v is LearnerCommand {
  return (
    record(v) &&
    Object.keys(v).sort().join(",") ===
      "operation,reason,request,target,until" &&
    uuid(v.request) &&
    uuid(v.target) &&
    (v.operation === "auth_suspend" || v.operation === "auth_resume") &&
    (v.reason === "security_response" || v.reason === "access_change") &&
    (v.operation === "auth_suspend" ? timestamp(v.until) : v.until === null)
  );
}
export function mayPrepareLearnerIntent(
  access: LiveStaffAccess,
  command: unknown,
): boolean {
  return (
    validLearnerCommand(command) &&
    command.target !== access.user_id &&
    access.capabilities.includes("people.manage_learners") &&
    (access.roles.includes("owner") || access.roles.includes("administrator"))
  );
}
export type LearnerRequestResult =
  | { kind: "unavailable" }
  | {
      kind: "intent_recorded";
      request: string;
      target: string;
      operation: LearnerCommand["operation"];
      until: string | null;
      expiresAt: string;
    };
export function parseLearnerRequest(
  value: unknown,
  expectedRequest: string,
  expectedTarget: string,
): LearnerRequestResult {
  if (
    !uuid(expectedRequest) ||
    !uuid(expectedTarget) ||
    !record(value) ||
    Object.keys(value).sort().join(",") !==
      "expires_at,operation,request_id,status,suspend_until,target_id" ||
    value.request_id !== expectedRequest ||
    value.target_id !== expectedTarget ||
    value.status !== "intent_recorded" ||
    !timestamp(value.expires_at) ||
    (value.operation !== "auth_suspend" && value.operation !== "auth_resume") ||
    (value.operation === "auth_suspend"
      ? !timestamp(value.suspend_until)
      : value.suspend_until !== null)
  )
    return { kind: "unavailable" };
  return {
    kind: "intent_recorded",
    request: expectedRequest,
    target: expectedTarget,
    operation: value.operation as LearnerCommand["operation"],
    until: value.suspend_until as string | null,
    expiresAt: value.expires_at,
  };
}
