// Browser-safe, bounded wall-clock conversion. PostgreSQL independently repeats this check.
export type ScheduleTime =
  | { kind: "ready"; localInput: string; timeZone: string; dueAt: string }
  | { kind: "invalid" | "nonexistent" | "ambiguous" };
const zoneShape = /^(?:UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+)+)$/;
/** Minute-resolution modern IANA times; never guesses an offset or silently normalizes a gap.
 * Enumerates every supported UTC minute within 26 hours, including half/quarter-hour offsets.
 * This intentionally rejects ambiguous times even when the browser could choose one offset. */
export function resolveScheduleTime(
  localInput: unknown,
  timeZone: unknown,
): ScheduleTime {
  if (
    typeof localInput !== "string" ||
    typeof timeZone !== "string" ||
    timeZone.length > 100 ||
    !zoneShape.test(timeZone) ||
    !/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localInput)
  )
    return { kind: "invalid" };
  const [year, month, day, hour, minute] = localInput
    .split(/[-T:]/)
    .map(Number);
  const base = Date.UTC(year, month - 1, day, hour, minute),
    date = new Date(base);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute
  )
    return { kind: "invalid" };
  let format: Intl.DateTimeFormat;
  try {
    format = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      calendar: "gregory",
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    return { kind: "invalid" };
  }
  let found: number | null = null;
  for (let offset = -1560; offset <= 1560; offset++) {
    const instant = base + offset * 60000;
    const parts = Object.fromEntries(
      format.formatToParts(instant).map((p) => [p.type, p.value]),
    );
    if (
      `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}` ===
        localInput &&
      parts.second === "00"
    ) {
      if (found !== null) return { kind: "ambiguous" };
      found = instant;
    }
  }
  return found === null
    ? { kind: "nonexistent" }
    : {
        kind: "ready",
        localInput,
        timeZone,
        dueAt: new Date(found).toISOString(),
      };
}
