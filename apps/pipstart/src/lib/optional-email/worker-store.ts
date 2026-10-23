import "server-only";
import { createSupabaseAdminClient } from "../supabase/admin";
import { isWorkerAdmission, type OptionalWorkerStore } from "./worker";

export function createOptionalWorkerStore(): OptionalWorkerStore | null {
  const client = createSupabaseAdminClient();
  if (!client) return null;
  async function rpc(name: string, args: Record<string, unknown>) {
    const { data, error } = await client!.rpc(name, args);
    if (error) throw new Error("Optional worker unavailable");
    return data;
  }
  return {
    async acquire() {
      const data = await rpc("pipstart_acquire_optional_worker", {});
      if (!isWorkerAdmission(data))
        throw new Error("Optional worker unavailable");
      return data;
    },
    async finish(token) {
      if (
        !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
          token,
        )
      )
        throw new Error("Optional worker unavailable");
      const data = await rpc("pipstart_finish_optional_worker", {
        p_token: token,
      });
      if (typeof data !== "boolean")
        throw new Error("Optional worker unavailable");
      return data;
    },
  };
}
