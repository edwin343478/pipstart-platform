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

  const url = new URL(`${configuration.url}/rest/v1/leads`);

  url.searchParams.set("select", "id");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        apikey: configuration.secretKey,
      },
    });

    if (!response.ok) {
      await response.body?.cancel();

      return {
        status: "unavailable",
        httpStatus: response.status,
      };
    }

    await response.body?.cancel();

    return {
      status: "ok",
    };
  } catch {
    return {
      status: "unavailable",
    };
  }
}
