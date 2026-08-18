import type { LeadRequestData } from "@repo/validation";

interface FingerprintPayload {
  lead: {
    firstName: string | null;
    email: string;
    privacyAcknowledged: boolean;
    newsletterConsent: boolean;
  };
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function createFingerprintPayload(
  request: LeadRequestData,
): FingerprintPayload {
  return {
    lead: {
      firstName: request.lead.firstName ?? null,
      email: request.lead.email,
      privacyAcknowledged: request.lead.privacyAcknowledged,
      newsletterConsent: request.lead.newsletterConsent,
    },
  };
}

export async function createLeadRequestFingerprint(
  request: LeadRequestData,
): Promise<string> {
  const payload = createFingerprintPayload(request);

  const encoded = new TextEncoder().encode(JSON.stringify(payload));

  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return bytesToHex(digest);
}
