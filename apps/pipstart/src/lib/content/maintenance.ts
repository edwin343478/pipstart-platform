import "server-only";
import { limitedFrom } from "./staff-action-limit";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { parseStaffPeople } from "../auth/staff-people";
import {
  canOpenMaintenance,
  parseAllowlist,
  parseIntervals,
  parseResults,
  parseWorklist,
  validMaintenanceInput,
  type AllowedHost,
  type Interval,
  type MaintenanceActionResult,
  type MaintenanceFamily,
  type MaintenanceStatus,
  type Worklist,
} from "./maintenance-contract";

// M22 MP10c: maintenance reads and changes on the signed-in staff member's own session (never a
// service key). The MP10a store decides every permission and rule; a change is sent at most once
// and an unclear outcome is "uncertain", never retried or inferred.
const codes: Record<string, "conflict" | "denied" | "invalid"> = {
  PT409: "conflict",
  "42501": "denied",
  "22023": "invalid",
};
const call = (client: SupabaseClient, fn: string, args: object) =>
  client.rpc(fn, args).abortSignal(AbortSignal.timeout(8000));

export async function runMaintenance(
  client: SupabaseClient,
  input: unknown,
): Promise<MaintenanceActionResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validMaintenanceInput(input)) return { kind: "invalid" };
  const c = structuredClone(input);
  let sent = false;
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, identity.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (!canOpenMaintenance(live.access)) return { kind: "denied" };
    if (c.action === "results") {
      const { data, error } = await call(
        client,
        "pipstart_maintenance_results",
        { p_item: c.id },
      );
      if (error) return { kind: codes[error.code ?? ""] ?? "unavailable" };
      const parsed = parseResults(data);
      return parsed ? { kind: "results", ...parsed } : { kind: "unavailable" };
    }
    sent = true;
    const { data, error } =
      c.action === "acknowledge"
        ? await call(client, "pipstart_maintenance_acknowledge", {
            p_item: c.id,
            p_expected_revision: c.revision,
            p_reason: c.reason,
          })
        : c.action === "reschedule"
          ? await call(client, "pipstart_maintenance_reschedule", {
              p_item: c.id,
              p_expected_revision: c.revision,
              p_due: c.due,
              p_reason: c.reason,
            })
          : c.action === "result"
            ? await call(client, "pipstart_maintenance_record_result", {
                p_item: c.id,
                p_expected_revision: c.revision,
                p_reference: c.reference,
                p_source: "manual",
                p_classification: c.classification,
                p_evidence: c.note === "" ? null : c.note,
              })
            : c.action === "assign"
              ? await call(client, "pipstart_maintenance_assign", {
                  p_item: c.id,
                  p_assignee: c.assignee,
                  p_reason: c.reason,
                })
              : c.action === "unassign"
                ? await call(client, "pipstart_maintenance_unassign", {
                    p_item: c.id,
                    p_reason: c.reason,
                  })
                : c.action === "interval"
                  ? await call(client, "pipstart_maintenance_interval_set", {
                      p_family: c.family,
                      p_expected_version: c.expected,
                      p_days: c.days,
                      p_reason: c.reason,
                    })
                  : await call(
                      client,
                      "pipstart_maintenance_allowlist_change",
                      {
                        p_host: c.host,
                        p_action: c.change,
                        p_reason: c.reason,
                      },
                    );
    if (error)
      return (
        limitedFrom(error) ?? { kind: codes[error.code ?? ""] ?? "uncertain" }
      );
    return data && typeof data === "object" && !Array.isArray(data)
      ? { kind: "done" }
      : { kind: "uncertain" };
  } catch {
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}

export type MaintenancePage = {
  worklist: Worklist | null;
  intervals: Interval[] | null;
  allowlist: AllowedHost[] | null;
  /** Owner only: active staff who can hold maintenance, for the assign picker and names. */
  staff: { id: string; name: string }[] | null;
};

/** The reads one Maintenance page needs. Each read fails closed to null; nothing is retried. */
export async function readMaintenancePage(
  client: SupabaseClient,
  request: {
    scope: "mine" | "all" | null;
    status: MaintenanceStatus | null;
    family: MaintenanceFamily | null;
    after: string;
    owner: boolean;
    policy: boolean;
  },
): Promise<MaintenancePage> {
  const read = async <T>(
    fn: string,
    args: object,
    parse: (v: unknown) => T | null,
  ): Promise<T | null> => {
    try {
      const { data, error } = await call(client, fn, args);
      return error ? null : parse(data);
    } catch {
      return null;
    }
  };
  const page: MaintenancePage = {
    worklist: null,
    intervals: null,
    allowlist: null,
    staff: null,
  };
  if (request.scope)
    page.worklist = await read(
      "pipstart_maintenance_worklist",
      {
        p_scope: request.scope,
        p_status: request.status,
        p_family: request.family,
        p_after: request.after,
        p_limit: 50,
      },
      parseWorklist,
    );
  if (request.policy) {
    page.intervals = await read(
      "pipstart_maintenance_intervals",
      {},
      parseIntervals,
    );
    if (request.owner)
      page.allowlist = await read(
        "pipstart_maintenance_allowlist",
        {},
        parseAllowlist,
      );
  }
  if (request.owner && request.scope === "all") {
    const staff: { id: string; name: string }[] = [];
    let after: string | null = null;
    for (let n = 0; n < 4; n++) {
      type People = Extract<
        ReturnType<typeof parseStaffPeople>,
        { kind: "ready" }
      >;
      const people: People | null = await read<People>(
        "pipstart_staff_people",
        { p_after: after, p_limit: 50, p_query: "", p_user: null },
        (v) => {
          const p = parseStaffPeople(v);
          return p.kind === "ready" ? p : null;
        },
      );
      if (!people) break;
      for (const p of people.items)
        if (p.staff_active && p.staff_roles.some((r) => r !== "administrator"))
          staff.push({ id: p.user_id, name: p.display_name });
      if (!people.nextAfter) break;
      after = people.nextAfter;
    }
    page.staff = staff;
  }
  return page;
}
