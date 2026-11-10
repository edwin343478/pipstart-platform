"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  runPublicationWithDelivery,
  runPublicationDelivery,
} from "@/lib/content/publication-delivery";
import type { DeliveryResult } from "@/lib/content/publication-delivery-contract";
import type { PublicationResult } from "@/lib/content/publication-contract";
export async function runPublicationAction(
  input: unknown,
): Promise<PublicationResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runPublicationWithDelivery(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}

export async function runPublicationDeliveryAction(
  input: unknown,
): Promise<DeliveryResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await runPublicationDelivery(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}

export async function runPublicationScheduleAction(
  input: unknown,
): Promise<
  import("@/lib/content/publication-schedule-contract").ScheduleResult
> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  try {
    const client = await createSupabaseServerClient();
    return client
      ? await (
          await import("@/lib/content/publication-schedule")
        ).runPublicationSchedule(client, input)
      : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}
