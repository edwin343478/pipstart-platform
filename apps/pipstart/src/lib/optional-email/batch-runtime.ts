import "server-only";
import { createUnsubscribeTokenIssuer } from "../email-unsubscribe/delivery";
import { createOptionalEmailDispatchStore } from "./store";
import { createOptionalEmailQueue } from "./queue-store";
import { createOptionalProviderEvidenceStore } from "./delivery-evidence-store";
import { createOptionalWorkerStore } from "./worker-store";
import { createOptionalResendTransport } from "./resend-transport";
import { runOptionalEmailWorker, type WorkerResult } from "./worker";

// Explicit opt-in at both caller and composition boundaries. No env access here.
export async function runConfiguredOptionalEmailBatch(apiKey = "", enabled = false): Promise<WorkerResult> {
  if (enabled !== true) return { status: "disabled", processed: 0 };
  if (apiKey.trim() !== apiKey || !/^re_[A-Za-z0-9_-]{10,}$/.test(apiKey)) return { status: "unavailable", processed: 0 };
  const receipts = createOptionalProviderEvidenceStore();
  if (!receipts) return { status: "unavailable", processed: 0 };
  const transport = createOptionalResendTransport({ enabled: true, apiKey, receipts });
  if (!transport) return { status: "unavailable", processed: 0 };
  const worker = createOptionalWorkerStore();
  const queue = createOptionalEmailQueue();
  const store = createOptionalEmailDispatchStore();
  const issuer = createUnsubscribeTokenIssuer();
  // The accepted worker validates completeness before persistent admission.
  return runOptionalEmailWorker(worker, { queue, store, issuer, transport }, true);
}
