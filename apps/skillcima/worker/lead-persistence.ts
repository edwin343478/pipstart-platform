import type { PendingConsentEvent } from "./consent";
import type { SupabaseEnv } from "./supabase";

export const SKILLCIMA_COURSE_SLUG = "forex-foundations";

export interface CompleteLeadSubmissionInput {
  submissionId: string;
  requestFingerprint: string;
  firstName?: string;
  email: string;
  consentEvents: PendingConsentEvent[];
}

export type CompleteLeadSubmissionResult =
  | {
      status: "completed";
      leadId: string;
      enrolmentId: string;
      replayed: boolean;
    }
  | {
      status: "conflict";
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

interface RpcRow {
  result_lead_id: string;
  result_enrolment_id: string;
  result_status: string;
  result_replayed: boolean;
}

interface RpcErrorBody {
  code?: string;
  message?: string;
}

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

function toRpcConsentEvents(
  events: PendingConsentEvent[],
): Record<string, string>[] {
  return events.map((event) => ({
    category: event.category,
    action: event.action,
    privacy_notice_version: event.privacyNoticeVersion,
    consent_wording: event.consentWording,
    consent_wording_version: event.consentWordingVersion,
    landing_page_version: event.landingPageVersion,
  }));
}

async function readRpcError(response: Response): Promise<RpcErrorBody | null> {
  try {
    return (await response.json()) as RpcErrorBody;
  } catch {
    return null;
  }
}

export async function completeLeadSubmission(
  env: SupabaseEnv,
  input: CompleteLeadSubmissionInput,
): Promise<CompleteLeadSubmissionResult> {
  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const url = new URL(
    `${configuration.url}/rest/v1/rpc/skillcima_complete_lead_submission`,
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: configuration.secretKey,
      },
      body: JSON.stringify({
        p_submission_id: input.submissionId,
        p_request_fingerprint: input.requestFingerprint,
        p_first_name: input.firstName ?? null,
        p_email: input.email,
        p_course_slug: SKILLCIMA_COURSE_SLUG,
        p_consent_events: toRpcConsentEvents(input.consentEvents),
      }),
    });

    if (!response.ok) {
      const httpStatus = response.status;
      const error = await readRpcError(response);

      if (error?.message === "SUBMISSION_CONFLICT") {
        return {
          status: "conflict",
        };
      }

      return {
        status: "unavailable",
        httpStatus,
      };
    }

    const rows = (await response.json()) as RpcRow[];
    const row = rows[0];

    if (
      rows.length !== 1 ||
      !row ||
      row.result_status !== "completed" ||
      typeof row.result_lead_id !== "string" ||
      typeof row.result_enrolment_id !== "string" ||
      typeof row.result_replayed !== "boolean"
    ) {
      return {
        status: "unavailable",
        httpStatus: response.status,
      };
    }

    return {
      status: "completed",
      leadId: row.result_lead_id,
      enrolmentId: row.result_enrolment_id,
      replayed: row.result_replayed,
    };
  } catch {
    return {
      status: "unavailable",
    };
  }
}
