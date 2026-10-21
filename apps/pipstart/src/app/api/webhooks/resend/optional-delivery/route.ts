import { handleOptionalDeliveryWebhook } from "@/lib/optional-email/delivery-evidence";
import { createOptionalProviderEvidenceStore } from "@/lib/optional-email/delivery-evidence-store";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(request: Request) {
  return handleOptionalDeliveryWebhook(request, process.env.PIPSTART_OPTIONAL_DELIVERY_WEBHOOK_SECRET?.trim() ?? "", createOptionalProviderEvidenceStore());
}
