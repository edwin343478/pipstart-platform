import "server-only";
import { createHash } from "node:crypto";
import { normalizeOptionalAddress } from "./address-suppression";
import type {
  DurableOptionalTransport,
  PreparedOptionalMessage,
} from "./queue";
export const optionalSender = "PipStart <no-reply@account.pipstart.net>";
export interface OptionalProviderReceipts {
  acknowledge(
    jobId: string,
    providerId: string,
    preparedHash: string,
  ): Promise<void>;
}
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export function optionalPreparedHash(message: PreparedOptionalMessage): string {
  const fields = [
    message.jobId,
    message.to,
    message.subject,
    message.html,
    message.text,
    message.headers["List-Unsubscribe"],
    message.headers["List-Unsubscribe-Post"],
  ];
  return createHash("sha256")
    .update(
      fields.map((v) => `${Buffer.byteLength(v, "utf8")}:${v}`).join(""),
      "utf8",
    )
    .digest("hex");
}
function valid(message: PreparedOptionalMessage, key: string): boolean {
  return (
    !!message &&
    Object.keys(message).sort().join() ===
      "headers,html,jobId,subject,text,to" &&
    uuid.test(message.jobId) &&
    key === `pipstart-opt-v1-${message.jobId}` &&
    normalizeOptionalAddress(message.to) !== null &&
    typeof message.subject === "string" &&
    !!message.subject.trim() &&
    message.subject.length <= 200 &&
    !/[\r\n\x00]/.test(message.subject) &&
    typeof message.html === "string" &&
    !!message.html.trim() &&
    message.html.length <= 205000 &&
    typeof message.text === "string" &&
    !!message.text.trim() &&
    message.text.length <= 102000 &&
    !!message.headers &&
    Object.keys(message.headers).sort().join() ===
      "List-Unsubscribe,List-Unsubscribe-Post" &&
    /^<https:\/\/pipstart\.net\/unsubscribe\?token=[a-f0-9]{64}>$/.test(
      message.headers["List-Unsubscribe"],
    ) &&
    message.headers["List-Unsubscribe-Post"] === "List-Unsubscribe=One-Click"
  );
}
async function acknowledgement(response: Response): Promise<string> {
  if (
    !response.ok ||
    !/^application\/json(?:;|$)/i.test(
      response.headers.get("content-type") ?? "",
    )
  )
    throw new Error();
  const reader = response.body?.getReader();
  if (!reader) throw new Error();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        throw new Error();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = JSON.parse(
    new TextDecoder("utf8", { fatal: true }).decode(Buffer.concat(chunks)),
  );
  if (!data || typeof data.id !== "string" || !uuid.test(data.id))
    throw new Error();
  return data.id;
}
// Dormant factory. No environment lookup, caller, worker, route or scheduler enables it.
export function createOptionalResendTransport(
  configuration: {
    enabled?: boolean;
    apiKey?: string;
    receipts?: OptionalProviderReceipts | null;
  } = {},
  send: typeof fetch = fetch,
): DurableOptionalTransport | null {
  if (
    configuration.enabled !== true ||
    !/^re_[A-Za-z0-9_-]{10,}$/.test(configuration.apiKey ?? "") ||
    !configuration.receipts
  )
    return null;
  const key = configuration.apiKey!,
    receipts = configuration.receipts;
  return {
    async deliver(message, idempotencyKey) {
      try {
        if (!valid(message, idempotencyKey)) throw new Error();
        const preparedHash = optionalPreparedHash(message),
          jobId = message.jobId;
        // Immediate handoff; never schedule, redirect, retry, batch or add recipients.
        const response = await send("https://api.resend.com/emails", {
          method: "POST",
          redirect: "error",
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            from: optionalSender,
            to: [message.to],
            subject: message.subject,
            html: message.html,
            text: message.text,
            headers: { ...message.headers },
            tags: [
              { name: "pipstart_job_id", value: message.jobId },
              { name: "pipstart_payload_hash", value: preparedHash },
            ],
          }),
        });
        const providerId = await acknowledgement(response);
        // Loss of this acknowledgement remains uncertain; the signed callback can supply evidence.
        await receipts.acknowledge(jobId, providerId, preparedHash);
        return { providerId };
      } catch {
        throw new Error(
          "Optional provider outcome unavailable; investigate without automatic resend",
        );
      }
    },
  };
}
