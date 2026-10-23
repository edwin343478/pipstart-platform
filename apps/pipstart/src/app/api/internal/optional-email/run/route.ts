import { handleOptionalEmailBatch } from "@/lib/optional-email/batch-endpoint";
import { runConfiguredOptionalEmailBatch } from "@/lib/optional-email/batch-runtime";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleOptionalEmailBatch(
    request,
    {
      enabled: process.env.PIPSTART_OPTIONAL_WORKER_ENABLED,
      secret: process.env.PIPSTART_OPTIONAL_WORKER_SECRET,
      apiKey: process.env.PIPSTART_OPTIONAL_RESEND_API_KEY,
    },
    (apiKey) => runConfiguredOptionalEmailBatch(apiKey, true),
  );
}
