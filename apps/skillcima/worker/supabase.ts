export interface SupabaseEnv {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
}

export type SupabaseHealthResult =
  | {
      status: "ok";
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

function getSupabaseConfiguration(
  env: SupabaseEnv,
): { url: string; secretKey: string } | null {
  const url = env.SUPABASE_URL?.trim();
  const secretKey = env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) {
    return null;
  }

  return {
    url: url.replace(/\/+$/, ""),
    secretKey,
  };
}

export async function checkSupabaseConnection(
  env: SupabaseEnv,
): Promise<SupabaseHealthResult> {
  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const url = new URL(`${configuration.url}/rest/v1/leads`);
    url.searchParams.set("select", "id");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      method: "GET",
      redirect: "error",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        apikey: configuration.secretKey,
      },
    });

    // The probe only needs the status. A slow or rejected cancellation
    // should not delay or change that result.
    void response.body?.cancel().catch(() => {});
    controller.signal.throwIfAborted();
    return response.ok
      ? { status: "ok" }
      : { status: "unavailable", httpStatus: response.status };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
