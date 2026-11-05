import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { createEditorialRepository, EditorialError } from "./editorial-adapter";
import {
  canOpenContentWorkspace,
  parseWorkspaceDetail,
} from "./editorial-workspace-contract";
import { compareRevisionBodies } from "./revision-compare";
import {
  HISTORY_PAGE_SIZE,
  parseHistory,
  parseRevision,
  validHistoryInput,
  type RevisionHistoryResult,
} from "./revision-history-contract";
/** Read-only: revision summaries, or one earlier revision compared with the latest on the server. */
export async function readRevisionHistory(
  client: SupabaseClient,
  input: unknown,
): Promise<RevisionHistoryResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validHistoryInput(input)) return { kind: "invalid" };
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const gate = await readLiveStaffAccess(client, identity.data.user.id);
    if (gate.kind !== "authorized" || !canOpenContentWorkspace(gate.access))
      return { kind: gate.kind === "unavailable" ? "unavailable" : "denied" };
    const repository = createEditorialRepository({
      rpc: (fn, args) =>
        client.rpc(fn, args).abortSignal(AbortSignal.timeout(8_000)),
    });
    if (input.kind === "history") {
      const page = parseHistory(
        await repository.history(input.id, input.before, HISTORY_PAGE_SIZE + 1),
        input.id,
        input.before,
      );
      return page ? { kind: "history", page } : { kind: "unavailable" };
    }
    const raw = await repository.item(input.id),
      latest = parseWorkspaceDetail(raw, input.id);
    if (!latest) return { kind: "unavailable" };
    if (input.from >= latest.revision) return { kind: "invalid" };
    const earlier = parseRevision(
      await repository.revision(input.id, input.from),
      input.id,
      input.from,
    );
    if (!earlier) return { kind: "unavailable" };
    // A save between the two reads: never compare against a revision that is no longer latest.
    if (earlier.latest !== latest.revision) return { kind: "stale" };
    const comparison = compareRevisionBodies(
      latest.family,
      earlier.body,
      raw.revision.body,
    );
    if (!comparison) return { kind: "unsupported" };
    return {
      kind: "compare",
      id: latest.id,
      from: earlier.ref,
      to: {
        revision: latest.revision,
        state: latest.state,
        bodySha256: latest.bodySha256,
        createdAt: latest.createdAt,
      },
      comparison,
    };
  } catch (error) {
    if (!(error instanceof EditorialError)) return { kind: "unavailable" };
    return {
      kind:
        error.kind === "forbidden"
          ? "denied"
          : error.kind === "invalid"
            ? "invalid"
            : "unavailable",
    };
  }
}
