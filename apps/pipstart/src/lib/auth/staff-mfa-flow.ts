import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isFactorId,
  isTotpCode,
  safeTotpQr,
  staffDeadline,
} from "./staff-entry";

export type StaffFactor = { id: string; name: string };
export type StaffSetup = { id: string; qr: string; secret: string };
export type MfaFailure = {
  kind: "unavailable" | "unknown" | "invalid" | "changed" | "rejected";
};

async function sameIdentity(client: SupabaseClient, userId: string) {
  const response = await staffDeadline(client.auth.getUser());
  return !response.error && response.data.user?.id === userId;
}

export async function readStaffFactors(
  client: SupabaseClient,
  userId: string,
): Promise<
  { kind: "ready"; factors: StaffFactor[]; canEnroll: boolean } | MfaFailure
> {
  try {
    if (!(await sameIdentity(client, userId))) return { kind: "changed" };
    const result = await staffDeadline(client.auth.mfa.listFactors());
    if (result.error || !result.data) return { kind: "unavailable" };
    return {
      kind: "ready",
      canEnroll: !result.data.all.some((f) => f.status !== "verified"),
      factors: result.data.totp
        .filter((f) => f.status === "verified" && isFactorId(f.id))
        .map((f) => ({ id: f.id, name: f.friendly_name || "Authenticator" })),
    };
  } catch {
    return { kind: "unavailable" };
  }
}

export async function enrollStaffFactor(
  client: SupabaseClient,
  userId: string,
): Promise<{ kind: "setup"; setup: StaffSetup } | MfaFailure> {
  let attempted = false;
  try {
    if (!(await sameIdentity(client, userId))) return { kind: "changed" };
    const existing = await staffDeadline(client.auth.mfa.listFactors());
    if (existing.error || !existing.data) return { kind: "unavailable" };
    if (existing.data.all.some((f) => f.status !== "verified"))
      return { kind: "changed" };
    attempted = true;
    const result = await staffDeadline(
      client.auth.mfa.enroll({
        factorType: "totp",
        issuer: "PipStart",
        friendlyName: `PipStart ${crypto.randomUUID().slice(0, 8)}`,
      }),
    );
    // An unsuccessful transport can still have created a factor. Never blindly
    // retry enrollment, log a provider error, or delete another factor to recover.
    if (result.error || !result.data) return { kind: "unknown" };
    const qr = safeTotpQr(result.data.totp?.qr_code);
    if (
      !isFactorId(result.data.id) ||
      !qr ||
      !/^[A-Z2-7]{16,256}$/.test(result.data.totp.secret)
    )
      return { kind: "unknown" };
    return {
      kind: "setup",
      setup: { id: result.data.id, qr, secret: result.data.totp.secret },
    };
  } catch {
    return { kind: attempted ? "unknown" : "unavailable" };
  }
}

export async function verifyStaffFactor(
  client: SupabaseClient,
  userId: string,
  factorId: string,
  code: string,
  createdFactorId?: string,
): Promise<{ kind: "verified" } | MfaFailure> {
  if (!isFactorId(factorId) || !isTotpCode(code)) return { kind: "invalid" };
  let attempted = false;
  try {
    if (!(await sameIdentity(client, userId))) return { kind: "changed" };
    const available = await staffDeadline(client.auth.mfa.listFactors());
    if (available.error || !available.data) return { kind: "unavailable" };
    if (
      !available.data.all.some(
        (f) =>
          f.id === factorId &&
          f.factor_type === "totp" &&
          (f.status === "verified" || f.id === createdFactorId),
      )
    )
      return { kind: "changed" };
    const challenge = await staffDeadline(
      client.auth.mfa.challenge({ factorId }),
    );
    if (challenge.error || !challenge.data) return { kind: "unavailable" };
    attempted = true;
    const response = await staffDeadline(
      client.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code,
      }),
    );
    if (response.error) {
      return {
        kind:
          response.error.code === "mfa_verification_failed" ||
          response.error.code === "otp_expired"
            ? "rejected"
            : "unknown",
      };
    }
    if (!response.data?.user || response.data.user.id !== userId)
      return { kind: "unknown" };
    return { kind: "verified" };
  } catch {
    return { kind: attempted ? "unknown" : "unavailable" };
  }
}
