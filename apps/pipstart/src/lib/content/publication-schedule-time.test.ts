import { describe, expect, it } from "vitest";
import { resolveScheduleTime } from "./publication-schedule-time";
describe("MP08c1 explicit wall-clock scheduling", () => {
  it.each([
    ["2027-01-15T12:30", "UTC", "2027-01-15T12:30:00.000Z"],
    ["2027-01-15T12:30", "Africa/Nairobi", "2027-01-15T09:30:00.000Z"],
    ["2027-01-15T12:30", "Asia/Kathmandu", "2027-01-15T06:45:00.000Z"],
    ["2027-01-15T12:30", "Australia/Eucla", "2027-01-15T03:45:00.000Z"],
    ["2027-01-15T00:00", "Pacific/Kiritimati", "2027-01-14T10:00:00.000Z"],
    ["2027-07-15T12:30", "America/New_York", "2027-07-15T16:30:00.000Z"],
    ["2028-02-29T23:59", "UTC", "2028-02-29T23:59:00.000Z"],
  ])(
    "preserves %s in %s with the exact UTC instant",
    (localInput, timeZone, dueAt) => {
      expect(resolveScheduleTime(localInput, timeZone)).toEqual({
        kind: "ready",
        localInput,
        timeZone,
        dueAt,
      });
    },
  );
  it.each([
    ["2027-03-14T02:30", "America/New_York"],
    ["2027-10-03T02:15", "Australia/Lord_Howe"],
  ])("rejects the DST gap %s %s", (local, zone) =>
    expect(resolveScheduleTime(local, zone)).toEqual({ kind: "nonexistent" }),
  );
  it.each([
    ["2027-11-07T01:30", "America/New_York"],
    ["2027-04-04T01:45", "Australia/Lord_Howe"],
  ])("refuses to guess between ambiguous offsets %s %s", (local, zone) =>
    expect(resolveScheduleTime(local, zone)).toEqual({ kind: "ambiguous" }),
  );
  it.each([
    ["2027-02-29T12:00", "UTC"],
    ["2027-13-01T12:00", "UTC"],
    ["2027-01-01T24:00", "UTC"],
    ["2027-01-01T12:60", "UTC"],
    ["2027-1-1T12:00", "UTC"],
    ["2027-01-01T12:00:00", "UTC"],
    [" 2027-01-01T12:00", "UTC"],
    ["1999-01-01T12:00", "UTC"],
    ["2100-01-01T12:00", "UTC"],
    ["2027-01-01T12:00", "+03:00"],
    ["2027-01-01T12:00", "EST"],
    ["2027-01-01T12:00", "Invalid/Zone"],
    [null, "UTC"],
    ["2027-01-01T12:00", null],
  ])("refuses invalid input %#", (local, zone) =>
    expect(resolveScheduleTime(local, zone)).toEqual({ kind: "invalid" }),
  );
});
