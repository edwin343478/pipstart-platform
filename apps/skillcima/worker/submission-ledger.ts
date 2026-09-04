import type { LeadAttributionData } from "@repo/validation";

import type { SupabaseEnv } from "./supabase";

export type LeadSubmissionStatus =
  "received" | "verified" | "completed" | "rejected" | "failed";

export interface StoredLeadSubmission {
  submissionId: string;
  requestFingerprint: string;
  status: LeadSubmissionStatus;
  leadId: string | null;
  enrolmentId: string | null;
}

interface LeadSubmissionRow {
  submission_id: string;
  request_fingerprint: string;
  status: LeadSubmissionStatus;
  lead_id: string | null;
  enrolment_id: string | null;
}

export type SubmissionReservationResult =
  | {
      status: "reserved";
      submission: StoredLeadSubmission;
    }
  | {
      status: "existing";
      submission: StoredLeadSubmission;
    }
  | {
      status: "conflict";
      submission: StoredLeadSubmission;
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

type LookupResult =
  | {
      status: "found";
      submission: StoredLeadSubmission;
    }
  | {
      status: "not_found";
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

function getSupabaseConfiguration(
  env: SupabaseEnv,
): SupabaseConfiguration | null {
  const url = env.SUPABASE_URL?.trim();
  const secretKey = env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) {
    return null;
  }

  return {
    url: url.replace(/\/+$/, ""),
    secretKey,
  };
}

function toStoredSubmission(row: LeadSubmissionRow): StoredLeadSubmission {
  return {
    submissionId: row.submission_id,
    requestFingerprint: row.request_fingerprint,
    status: row.status,
    leadId: row.lead_id,
    enrolmentId: row.enrolment_id,
  };
}

export function classifyExistingSubmission(
  submission: StoredLeadSubmission,
  requestFingerprint: string,
): SubmissionReservationResult {
  if (submission.requestFingerprint === requestFingerprint) {
    return {
      status: "existing",
      submission,
    };
  }

  return {
    status: "conflict",
    submission,
  };
}

async function lookupSubmission(
  env: SupabaseEnv,
  submissionId: string,
): Promise<LookupResult> {
  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const url = new URL(`${configuration.url}/rest/v1/lead_submissions`);

  url.searchParams.set(
    "select",
    "submission_id,request_fingerprint,status,lead_id,enrolment_id",
  );
  url.searchParams.set("submission_id", `eq.${submissionId}`);
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        apikey: configuration.secretKey,
      },
    });

    if (!response.ok) {
      await response.body?.cancel();

      return {
        status: "unavailable",
        httpStatus: response.status,
      };
    }

    const rows = (await response.json()) as LeadSubmissionRow[];

    const row = rows[0];

    if (!row) {
      return {
        status: "not_found",
      };
    }

    return {
      status: "found",
      submission: toStoredSubmission(row),
    };
  } catch {
    return {
      status: "unavailable",
    };
  }
}

export async function reserveLeadSubmission(
  env: SupabaseEnv,
  submissionId: string,
  requestFingerprint: string,
  attribution?: LeadAttributionData,
): Promise<SubmissionReservationResult> {
  const existing = await lookupSubmission(env, submissionId);

  if (existing.status === "misconfigured") {
    return existing;
  }

  if (existing.status === "unavailable") {
    return existing;
  }

  if (existing.status === "found") {
    return classifyExistingSubmission(existing.submission, requestFingerprint);
  }

  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const url = new URL(`${configuration.url}/rest/v1/lead_submissions`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: configuration.secretKey,
      },
      body: JSON.stringify({
        submission_id: submissionId,
        request_fingerprint: requestFingerprint,
        status: "received",
        source_campaign: attribution?.utmCampaign ?? null,
        utm_source: attribution?.utmSource ?? null,
        utm_medium: attribution?.utmMedium ?? null,
        utm_campaign: attribution?.utmCampaign ?? null,
        utm_content: attribution?.utmContent ?? null,
        utm_term: attribution?.utmTerm ?? null,
      }),
    });

    if (response.ok) {
      await response.body?.cancel();

      return {
        status: "reserved",
        submission: {
          submissionId,
          requestFingerprint,
          status: "received",
          leadId: null,
          enrolmentId: null,
        },
      };
    }

    const httpStatus = response.status;

    await response.body?.cancel();

    if (httpStatus !== 409) {
      return {
        status: "unavailable",
        httpStatus,
      };
    }

    // Another request may have reserved this submissionId
    // between our initial lookup and insert.
    const racedSubmission = await lookupSubmission(env, submissionId);

    if (racedSubmission.status === "found") {
      return classifyExistingSubmission(
        racedSubmission.submission,
        requestFingerprint,
      );
    }

    if (racedSubmission.status === "misconfigured") {
      return racedSubmission;
    }

    if (racedSubmission.status === "unavailable") {
      return racedSubmission;
    }

    return {
      status: "unavailable",
      httpStatus: 409,
    };
  } catch {
    return {
      status: "unavailable",
    };
  }
}
