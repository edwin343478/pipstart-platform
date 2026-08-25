import type { SupabaseEnv } from "./supabase";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type NewsletterWithdrawalMethod =
  | "unsubscribe_link"
  | "preference_center"
  | "support_request";

type NewsletterWithdrawalDatabaseStatus =
  | "withdrawn"
  | "already_withdrawn"
  | "not_subscribed"
  | "not_found"
  | "invalid_consent_state";

export interface WithdrawNewsletterConsentInput {
  leadId: string;
  withdrawalMethod: NewsletterWithdrawalMethod;
  privacyNoticeVersion: string;
  consentWording: string;
  consentWordingVersion: string;
  landingPageVersion: string;
}

interface NewsletterWithdrawalRpcRow {
  result_status: NewsletterWithdrawalDatabaseStatus;
  result_lead_id: string | null;
  result_enrolment_id: string | null;
  result_consent_event_id: string | null;
  result_withdrawn_at: string | null;
}

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

export type WithdrawNewsletterConsentResult =
  | {
      status: "withdrawn" | "already_withdrawn";
      leadId: string;
      enrolmentId: string;
      consentEventId: string;
      withdrawnAt: string;
    }
  | {
      status: "not_subscribed";
      leadId: string;
    }
  | {
      status: "not_found";
    }
  | {
      status: "invalid_consent_state";
      leadId: string;
      enrolmentId: string;
      consentEventId: string;
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

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

function isDatabaseStatus(
  value: unknown,
): value is NewsletterWithdrawalDatabaseStatus {
  return (
    value === "withdrawn" ||
    value === "already_withdrawn" ||
    value === "not_subscribed" ||
    value === "not_found" ||
    value === "invalid_consent_state"
  );
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export async function withdrawNewsletterConsent(
  env: SupabaseEnv,
  input: WithdrawNewsletterConsentInput,
): Promise<WithdrawNewsletterConsentResult> {
  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const url = new URL(
    `${configuration.url}/rest/v1/rpc/skillcima_withdraw_newsletter_consent`,
  );

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: configuration.secretKey,
      },
      body: JSON.stringify({
        p_lead_id: input.leadId,
        p_withdrawal_method: input.withdrawalMethod,
        p_privacy_notice_version: input.privacyNoticeVersion,
        p_consent_wording: input.consentWording,
        p_consent_wording_version: input.consentWordingVersion,
        p_landing_page_version: input.landingPageVersion,
      }),
    });
  } catch {
    return {
      status: "unavailable",
    };
  }

  if (!response.ok) {
    const httpStatus = response.status;

    await response.body?.cancel();

    return {
      status: "unavailable",
      httpStatus,
    };
  }

  let body: unknown;

  try {
    body = (await response.json()) as unknown;
  } catch {
    return {
      status: "unavailable",
      httpStatus: response.status,
    };
  }

  if (!Array.isArray(body) || body.length !== 1) {
    return {
      status: "unavailable",
    };
  }

  const row = body[0];

  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return {
      status: "unavailable",
    };
  }

  const candidate = row as Partial<NewsletterWithdrawalRpcRow>;

  if (!isDatabaseStatus(candidate.result_status)) {
    return {
      status: "unavailable",
    };
  }

  if (candidate.result_status === "not_found") {
    return {
      status: "not_found",
    };
  }

  if (!isUuid(candidate.result_lead_id)) {
    return {
      status: "unavailable",
    };
  }

  if (candidate.result_status === "not_subscribed") {
    return {
      status: "not_subscribed",
      leadId: candidate.result_lead_id,
    };
  }

  if (
    !isUuid(candidate.result_enrolment_id) ||
    !isUuid(candidate.result_consent_event_id)
  ) {
    return {
      status: "unavailable",
    };
  }

  if (candidate.result_status === "invalid_consent_state") {
    return {
      status: "invalid_consent_state",
      leadId: candidate.result_lead_id,
      enrolmentId: candidate.result_enrolment_id,
      consentEventId: candidate.result_consent_event_id,
    };
  }

  if (!isValidTimestamp(candidate.result_withdrawn_at)) {
    return {
      status: "unavailable",
    };
  }

  return {
    status: candidate.result_status,
    leadId: candidate.result_lead_id,
    enrolmentId: candidate.result_enrolment_id,
    consentEventId: candidate.result_consent_event_id,
    withdrawnAt: candidate.result_withdrawn_at,
  };
}
