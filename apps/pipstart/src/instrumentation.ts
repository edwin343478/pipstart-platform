// M24 X01: report server-side request errors (fixed route category and error class only).
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
    // the request path. Both resolve to a fixed category.
    const route = context?.routePath || request?.path;
    await sendErrorReport(buildReport("server", route, 500, errorCode(error)));
  } catch {
    console.error("PIPSTART_ERROR_REPORT_UNAVAILABLE");
  }
}
