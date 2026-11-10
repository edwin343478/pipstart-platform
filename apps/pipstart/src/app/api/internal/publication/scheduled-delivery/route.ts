import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleScheduledPublicationDelivery } from "@/lib/content/publication-scheduled-delivery";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  return handleScheduledPublicationDelivery(
    request,
    {
      enabled: process.env.PIPSTART_PUBLICATION_SCHEDULER_DELIVERY_ENABLED,
      secret: process.env.PIPSTART_PUBLICATION_SCHEDULER_TOKEN,
      hook: process.env.PIPSTART_DEPLOY_HOOK_URL,
    },
    { admin: createSupabaseAdminClient },
  );
}
