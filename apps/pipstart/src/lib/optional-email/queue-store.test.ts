import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), rpc: vi.fn() }));
vi.mock("../supabase/admin", () => ({
  createSupabaseAdminClient: mocks.admin,
}));
import { createOptionalEmailQueue } from "./queue-store";
const id = "00000000-0000-4000-8000-000000000001";
const job = {
  userId: id,
  kind: "learning_lesson" as const,
  subject: "Generated",
  html: "<p>Generated</p>",
  text: "Generated",
};
const due = "2026-10-21T13:00:00.000Z";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.admin.mockReturnValue({ rpc: mocks.rpc });
});
describe("service-only optional queue adapter", () => {
  it("is unavailable without server configuration", () => {
    mocks.admin.mockReturnValue(null);
    expect(createOptionalEmailQueue()).toBeNull();
  });
  it.each(["queued", "duplicate"])(
    "maps %s without overwriting the stored body",
    async (status) => {
      mocks.rpc.mockResolvedValue({ data: { status, jobId: id } });
      expect(
        await createOptionalEmailQueue()!.enqueue(job, "logical-job", due),
      ).toEqual({ status, jobId: id });
      expect(mocks.rpc).toHaveBeenCalledWith(
        "pipstart_enqueue_optional_email",
        {
          p_user_id: id,
          p_dedupe_key: "logical-job",
          p_kind: job.kind,
          p_subject: job.subject,
          p_html: job.html,
          p_text: job.text,
          p_available_at: due,
        },
      );
    },
  );
  it.each([
    { status: "conflict" },
    { status: "suppressed", reason: "opted_out" },
  ])("maps non-queued outcomes", async (data) => {
    mocks.rpc.mockResolvedValue({ data });
    expect(
      await createOptionalEmailQueue()!.enqueue(job, "logical", due),
    ).toEqual(data);
  });
  it.each([
    null,
    {},
    { status: "queued", jobId: "bad" },
    { status: "suppressed", reason: "bad" },
  ])("rejects malformed enqueue data", async (data) => {
    mocks.rpc.mockResolvedValue({ data });
    await expect(
      createOptionalEmailQueue()!.enqueue(job, "logical", due),
    ).rejects.toThrow();
  });
  it("rejects stale recipient/snapshot and supplied jobId fields", async () => {
    for (const extra of [
      { to: "cached@example.test" },
      { learning: true },
      { jobId: id },
    ])
      await expect(
        createOptionalEmailQueue()!.enqueue(
          { ...job, ...extra },
          "logical",
          due,
        ),
      ).rejects.toThrow("Invalid optional job");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("checks claim shape", async () => {
    mocks.rpc.mockResolvedValue({ data: { status: "busy" } });
    expect(await createOptionalEmailQueue()!.claim(id)).toEqual({
      status: "busy",
    });
    mocks.rpc.mockResolvedValue({ data: {} });
    await expect(createOptionalEmailQueue()!.claim(id)).rejects.toThrow();
  });
  it.each([true, false])("requires boolean checkpoints: %s", async (data) => {
    mocks.rpc.mockResolvedValue({ data });
    const q = createOptionalEmailQueue()!;
    expect(await q.release(id, id)).toBe(data);
    expect(await q.finish(id, id, "manual", "provider_uncertain", null)).toBe(
      data,
    );
  });
  it.each([null, {}, "true"])("rejects malformed checkpoints", async (data) => {
    mocks.rpc.mockResolvedValue({ data });
    await expect(createOptionalEmailQueue()!.release(id, id)).rejects.toThrow();
  });
  it("does not echo database errors", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "private data" } });
    await expect(createOptionalEmailQueue()!.claim(id)).rejects.toThrow(
      /^Optional queue unavailable$/,
    );
  });
});
