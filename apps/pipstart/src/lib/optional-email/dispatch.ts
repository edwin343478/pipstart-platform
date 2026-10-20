import "server-only";
import { prepareOptionalEmail, type TokenIssuer } from "../email-unsubscribe/delivery";

export type OptionalEmailKind = "learning_lesson" | "learning_weekly" | "partner_offer";
export type DispatchState = { status: "inactive" } | {
  status: "active"; email: string; learning: boolean; partner: boolean; frequency: "all" | "weekly";
};
export interface DispatchStateStore { load(userId: string): Promise<DispatchState>; }
export interface OptionalEmailJob {
  jobId: string; userId: string; kind: OptionalEmailKind; subject: string; html: string; text: string;
}
export interface OptionalEmailTransport {
  // The caller must implement durable idempotency/attempt accounting. A thrown
  // or malformed provider response is uncertain, never permission to retry.
  deliver(message: {
    jobId: string; to: string; subject: string; html: string; text: string;
    headers: { "List-Unsubscribe": string; "List-Unsubscribe-Post": string };
  }): Promise<{ providerId: string }>;
}
export type DispatchResult =
  | { status: "suppressed"; reason: "account_inactive" | "opted_out" | "frequency_changed" }
  | { status: "unavailable"; reason: "invalid_job" | "dependencies" | "eligibility" | "preparation" }
  | { status: "uncertain" }
  | { status: "accepted"; providerId: string };

export function isDispatchState(value: unknown): value is DispatchState {
  if (!value || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;
  if (state.status === "inactive") return Object.keys(state).length === 1;
  return state.status === "active" && Object.keys(state).sort().join() === "email,frequency,learning,partner,status" &&
    typeof state.email === "string" && state.email.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(state.email) &&
    typeof state.learning === "boolean" && typeof state.partner === "boolean" && ["all", "weekly"].includes(state.frequency as string);
}
export function isOptionalEmailJob(value: unknown): value is OptionalEmailJob {
  if (!value || typeof value !== "object") return false;
  const job = value as Record<string, unknown>;
  return Object.keys(job).sort().join() === "html,jobId,kind,subject,text,userId" &&
    typeof job.jobId === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(job.jobId) &&
    typeof job.userId === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(job.userId) &&
    ["learning_lesson", "learning_weekly", "partner_offer"].includes(job.kind as string) &&
    typeof job.subject === "string" && !!job.subject.trim() && job.subject.length <= 200 && !/[\r\n\x00]/.test(job.subject) &&
    typeof job.html === "string" && !!job.html.trim() && job.html.length <= 200_000 &&
    typeof job.text === "string" && !!job.text.trim() && job.text.length <= 100_000;
}
export function optionalEmailSuppression(state: DispatchState, kind: OptionalEmailKind): Extract<DispatchResult, { status: "suppressed" }> | null {
  if (state.status === "inactive") return { status: "suppressed", reason: "account_inactive" };
  if (!(kind === "partner_offer" ? state.partner : state.learning)) return { status: "suppressed", reason: "opted_out" };
  if (kind !== "partner_offer" && state.frequency !== (kind === "learning_weekly" ? "weekly" : "all")) return { status: "suppressed", reason: "frequency_changed" };
  return null;
}

// No worker, public send route, timer, campaign activation or provider adapter.
// Every future queue attempt must enter here with userId/kind, not a saved
// recipient, preference snapshot or pre-authorized envelope.
export async function dispatchOptionalEmail(
  input: OptionalEmailJob,
  dependencies: { store: DispatchStateStore | null; issuer: TokenIssuer | null; transport: OptionalEmailTransport | null },
): Promise<DispatchResult> {
  if (!isOptionalEmailJob(input)) return { status: "unavailable", reason: "invalid_job" };
  const job = Object.freeze({ ...input });
  const { store, issuer, transport } = dependencies;
  if (!store || !issuer || !transport) return { status: "unavailable", reason: "dependencies" };
  let first: DispatchState;
  try { first = await store.load(job.userId); if (!isDispatchState(first)) throw new Error(); }
  catch { return { status: "unavailable", reason: "eligibility" }; }
  const initialSuppression = optionalEmailSuppression(first, job.kind);
  if (initialSuppression) return initialSuppression;
  let envelope: Awaited<ReturnType<typeof prepareOptionalEmail>>;
  try { envelope = await prepareOptionalEmail({ userId: job.userId, category: job.kind === "partner_offer" ? "partner" : "learning", html: job.html, text: job.text }, issuer); }
  catch { return { status: "unavailable", reason: "preparation" }; }
  let latest: DispatchState;
  try { latest = await store.load(job.userId); if (!isDispatchState(latest)) throw new Error(); }
  catch { return { status: "unavailable", reason: "eligibility" }; }
  const finalSuppression = optionalEmailSuppression(latest, job.kind);
  if (finalSuppression) return finalSuppression;
  if (latest.status !== "active") return { status: "suppressed", reason: "account_inactive" };
  // No awaited work between this final check and invoking the transport. An
  // unsubscribe AFTER handoff cannot recall an already in-flight provider send.
  try {
    const result = await transport.deliver({ jobId: job.jobId, to: latest.email, subject: job.subject, ...envelope });
    if (!result || typeof result.providerId !== "string" || !/^[A-Za-z0-9_-]{1,200}$/.test(result.providerId)) return { status: "uncertain" };
    return { status: "accepted", providerId: result.providerId };
  } catch { return { status: "uncertain" }; }
}
