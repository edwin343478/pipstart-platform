"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createLearnerProviderClient,
  learnerProviderConfigured,
} from "@/lib/supabase/learner-provider";
import {
  runLearnerProviderTransport,
  type LearnerProviderResult,
} from "@/lib/auth/staff-learner-transport";
export async function executeLearnerProviderAction(
  input: unknown,
): Promise<LearnerProviderResult> {
  if (!learnerProviderConfigured()) return { kind: "disabled" };
  try {
    const user = await createSupabaseServerClient(),
      service = createLearnerProviderClient();
    if (!user || !service) return { kind: "disabled" };
    return await runLearnerProviderTransport(
      user,
      service,
      service.auth.admin,
      input,
    );
  } catch {
    return { kind: "unknown" };
  }
}
