// A stale lesson save is refused by the database with PT409 (HTTP 409 through PostgREST).
// 40001 is what the function raised before migration 20261120090000; PostgREST retries that
// code itself, so it rarely arrives here, but it still means the same conflict.
const CONFLICT_CODES = new Set(["PT409", "40001"]);

export const PROGRESS_CONFLICT_MESSAGE =
  "Progress changed on another device. Refresh and try again.";
export const PROGRESS_NOT_SAVED_MESSAGE = "Progress was not saved. Try again.";

export function progressSaveErrorMessage(code: string | null | undefined) {
  return code && CONFLICT_CODES.has(code)
    ? PROGRESS_CONFLICT_MESSAGE
    : PROGRESS_NOT_SAVED_MESSAGE;
}
