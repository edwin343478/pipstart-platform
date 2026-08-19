import type { LeadRequestData } from "@repo/validation";

import { buildConsentEvents } from "./consent";
import { createLeadRequestFingerprint } from "./fingerprint";
import {
  completeLeadSubmission,
  type CompleteLeadSubmissionResult,
} from "./lead-persistence";
import { reserveLeadSubmission } from "./submission-ledger";
import type { SupabaseEnv } from "./supabase";

export type PersistVerifiedLeadResult = CompleteLeadSubmissionResult;

export async function persistVerifiedLead(
  env: SupabaseEnv,
  request: LeadRequestData,
): Promise<PersistVerifiedLeadResult> {
  const requestFingerprint = await createLeadRequestFingerprint(request);

  const reservation = await reserveLeadSubmission(
    env,
    request.submissionId,
    requestFingerprint,
  );

  if (reservation.status === "conflict") {
    return {
      status: "conflict",
    };
  }

  if (reservation.status === "misconfigured") {
    return {
      status: "misconfigured",
    };
  }

  if (reservation.status === "unavailable") {
    if (reservation.httpStatus === undefined) {
      return {
        status: "unavailable",
      };
    }

    return {
      status: "unavailable",
      httpStatus: reservation.httpStatus,
    };
  }

  const consentEvents = buildConsentEvents(request.lead);

  return completeLeadSubmission(env, {
    submissionId: request.submissionId,
    requestFingerprint,
    firstName: request.lead.firstName,
    email: request.lead.email,
    consentEvents,
  });
}
