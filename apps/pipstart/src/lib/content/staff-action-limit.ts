// M22 audit follow-up, Package 4: the store's per-actor hourly limit on consequential staff actions.
// The database raises PT429 (HTTP 429) with the hint "retry_after=<seconds>" and rolls the whole call back,
// so a limited action is a definite "nothing was changed": never "uncertain", and safe to retry later.

export const ACTION_LIMIT_CODE = "PT429";
export type ActionLimited = { kind: "limited"; retryAfter: number | null };

/** Seconds from the store's "retry_after=<seconds>" hint, or null when absent or malformed. */
export function retryAfterFromHint(hint: unknown): number | null {
  if (typeof hint !== "string") return null;
  const m = /^retry_after=(\d{1,5})$/.exec(hint);
  if (!m) return null;
  const s = Number(m[1]);
  return s >= 1 && s <= 3600 ? s : null;
}

/** The limited result when a store error is the action limit; otherwise null. */
export function limitedFrom(
  error: { code?: string | null; hint?: string | null } | null | undefined,
): ActionLimited | null {
  return error?.code === ACTION_LIMIT_CODE
    ? { kind: "limited", retryAfter: retryAfterFromHint(error.hint) }
    : null;
}

/** One message for every staff screen. */
export function actionLimitMessage(retryAfter: number | null): string {
  const wait =
    retryAfter === null
      ? "Try again later."
      : `Try again in about ${Math.max(1, Math.ceil(retryAfter / 60))} minute${Math.ceil(retryAfter / 60) > 1 ? "s" : ""}.`;
  return `Too many changes in the last hour. Nothing was changed; your work is still here. ${wait}`;
}
