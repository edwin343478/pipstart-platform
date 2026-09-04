import {
  leadAttributionSchema,
  type LeadAttributionData,
} from "@repo/validation";

const QUERY_PARAMETER_MAP = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
} as const;

export function readLeadAttributionFromSearch(
  search: string,
): LeadAttributionData | undefined {
  const parameters = new URLSearchParams(search);
  const candidate: Record<string, string> = {};

  for (const [parameter, field] of Object.entries(QUERY_PARAMETER_MAP)) {
    const value = parameters.get(parameter);

    if (value !== null) {
      candidate[field] = value;
    }
  }

  if (Object.keys(candidate).length === 0) {
    return undefined;
  }

  const result = leadAttributionSchema.safeParse(candidate);

  return result.success ? result.data : undefined;
}
