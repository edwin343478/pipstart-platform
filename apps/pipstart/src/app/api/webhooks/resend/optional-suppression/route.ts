import { handleAddressSuppressionWebhook } from "@/lib/optional-email/address-suppression";
import { createAddressSuppressionStore } from "@/lib/optional-email/address-suppression-store";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(request: Request) {
  return handleAddressSuppressionWebhook(request, process.env.PIPSTART_OPTIONAL_SUPPRESSION_WEBHOOK_SECRET?.trim() ?? "", createAddressSuppressionStore());
}
