import { liveGeneration } from "@/lib/content/live-generation";

// M22 MP08b2a: which live publication generation this deployment was built from. Public and
// static: only the generation number, its seal and the switched groups, never content. The
// anonymous delivery check (MP08b2b) compares it with the store's live generation.
export const dynamic = "force-static";

export function GET() {
  const live = liveGeneration();
  return Response.json(
    {
      format: "pipstart-deployment-generation",
      generation: live?.generation ?? null,
      snapshotSha256: live?.snapshotSha256 ?? null,
      groups: live?.groups ?? [],
    },
    { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } },
  );
}
