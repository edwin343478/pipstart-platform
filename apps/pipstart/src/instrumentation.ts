// M24 X01: report server-side request errors (route template and code only).
type RequestInfo = { path?: string; method?: string };
type ErrorContext = { routePath?: string; routeType?: string };

export async function onRequestError(
  error: unknown,
  request: RequestInfo,
  context: ErrorContext,
): Promise<void> {
  try {
    const { buildReport, errorCode, sendErrorReport } =
      await import("./lib/ops/error-report");
    // Prefer Next's route template (for example /learn/[track]); fall back to
    // the request path, which routeTemplate strips of IDs and query strings.
    const route = context?.routePath || request?.path;
    await sendErrorReport(buildReport("server", route, 500, errorCode(error)));
  } catch {
    console.error("PIPSTART_ERROR_REPORT_UNAVAILABLE");
  }
}
