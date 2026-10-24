const sources = ["webhook", "sweep"] as const;
const stages = [
  "configuration",
  "payload",
  "record",
  "start",
  "queue",
  "due",
  "claim",
  "send",
  "accept",
  "health",
  "finish",
  "recovery_finish",
] as const;
const statusClasses = [
  "not_attempted",
  "unavailable",
  "2xx",
  "3xx",
  "4xx",
  "5xx",
] as const;
export type MonitorFailureStage = (typeof stages)[number];
export type ProviderStatusClass = (typeof statusClasses)[number];

export function providerStatusClass(status: number): ProviderStatusClass {
  if (!Number.isInteger(status) || status < 200 || status > 599)
    return "unavailable";
  if (status < 300) return "2xx";
  if (status < 400) return "3xx";
  if (status < 500) return "4xx";
  return "5xx";
}

// Fixed vocabulary only. Never accept an exception, request, provider payload,
// recipient, message ID, token, URL or credential as a diagnostic field.
export function reportMonitorFailure(
  source: (typeof sources)[number],
  stage: MonitorFailureStage,
  providerStatus: ProviderStatusClass = "not_attempted",
): void {
  console.error("PIPSTART_EMAIL_MONITOR_FAILURE_STAGE", {
    source: sources.includes(source) ? source : "unknown",
    stage: stages.includes(stage) ? stage : "unknown",
    provider_status_class: statusClasses.includes(providerStatus)
      ? providerStatus
      : "unavailable",
  });
}
