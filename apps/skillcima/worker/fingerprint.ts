import type { LeadAttributionData, LeadRequestData } from "@repo/validation";

interface FingerprintPayload {
  lead: {
    firstName: string | null;
    email: string;
    privacyAcknowledged: boolean;
    newsletterConsent: boolean;
  };
  attribution?: LeadAttributionData;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function createFingerprintPayload(
  request: LeadRequestData,
): FingerprintPayload {
  const payload: FingerprintPayload = {
    lead: {
      firstName: request.lead.firstName ?? null,
      email: request.lead.email,
      privacyAcknowledged: request.lead.privacyAcknowledged,
      newsletterConsent: request.lead.newsletterConsent,
    },
  };

  if (request.attribution) {
    payload.attribution = request.attribution;
  }

  return payload;
}

export async function createLeadRequestFingerprint(
  request: LeadRequestData,
): Promise<string> {
  const payload = createFingerprintPayload(request);

  const encoded = new TextEncoder().encode(JSON.stringify(payload));

  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return bytesToHex(digest);
}
