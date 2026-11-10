// Browser-safe delivery commands; no client-supplied origin or credential.
export type DeliveryInput = { action: "retry" | "check"; generation: number };
export type DeliveryCode =
  | "started"
  | "not-configured"
  | "failed"
  | "unknown"
  | "verified"
  | "delivering"
  | "different"
  | "unreachable"
  | "state"
  | "denied"
  | "invalid"
  | "unavailable"
  | "superseded";
export type DeliveryResult = { kind: DeliveryCode };
export function validDeliveryInput(input: unknown): input is DeliveryInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const v = input as Record<string, unknown>;
  return (
    Object.keys(v).sort().join(",") === "action,generation" &&
    (v.action === "retry" || v.action === "check") &&
    Number.isSafeInteger(v.generation) &&
    Number(v.generation) >= 1
  );
}
export const deliveryMessage: Record<DeliveryCode, string> = {
  started:
    "Delivery requested. Check the live site after the deployment finishes.",
  "not-configured":
    "Delivery is not configured for this operation. The publication record is unchanged.",
  failed:
    "The deployment request was not confirmed and may have been accepted. Check the live site before deciding whether to retry delivery.",
  unknown:
    "The delivery outcome is unknown. It will not be retried automatically. Reload the status and check the live site.",
  verified:
    "The live site matches this generation, its seal and the configured content groups.",
  delivering:
    "Still delivering. The live deployment is behind this generation.",
  different:
    "The live site does not match the expected seal or content groups. Delivery has not been verified.",
  unreachable:
    "The live site could not be checked. Delivery status was not changed.",
  state:
    "Delivery cannot be retried in this state or its 20-attempt limit has been reached. Reload the status.",
  denied: "You do not have current permission to manage delivery.",
  invalid: "The delivery request is invalid. Reload the status.",
  unavailable:
    "Delivery status is unavailable. Reload before deciding what to do next.",
  superseded: "A newer generation exists. Reload its delivery status.",
};
