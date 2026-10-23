import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), rpc: vi.fn() }));
vi.mock("../supabase/admin", () => ({
  createSupabaseAdminClient: mocks.admin,
}));
import { createOptionalWorkerStore } from "./worker-store";
const id = "00000000-0000-4000-8000-000000000001";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.admin.mockReturnValue({ rpc: mocks.rpc });
});
it("returns null without server config", () => {
  mocks.admin.mockReturnValue(null);
  expect(createOptionalWorkerStore()).toBeNull();
});
it("maps admission and token-bound completion only", async () => {
  const data = { status: "acquired", token: id, jobIds: [id] };
  mocks.rpc
    .mockResolvedValueOnce({ data })
    .mockResolvedValueOnce({ data: true });
  const store = createOptionalWorkerStore()!;
  expect(await store.acquire()).toEqual(data);
  expect(await store.finish(id)).toBe(true);
  expect(mocks.rpc.mock.calls).toEqual([
    ["pipstart_acquire_optional_worker", {}],
    ["pipstart_finish_optional_worker", { p_token: id }],
  ]);
});
it.each([null, {}, "true"])(
  "rejects malformed finish acknowledgement",
  async (data) => {
    mocks.rpc.mockResolvedValue({ data });
    await expect(createOptionalWorkerStore()!.finish(id)).rejects.toThrow(
      /^Optional worker unavailable$/,
    );
  },
);
it("rejects malformed admission and tokens", async () => {
  mocks.rpc.mockResolvedValue({ data: { status: "acquired" } });
  await expect(createOptionalWorkerStore()!.acquire()).rejects.toThrow();
  mocks.rpc.mockClear();
  await expect(createOptionalWorkerStore()!.finish("bad")).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("withholds private database errors", async () => {
  mocks.rpc.mockResolvedValue({ error: { message: "private detail" } });
  await expect(createOptionalWorkerStore()!.acquire()).rejects.toThrow(
    /^Optional worker unavailable$/,
  );
});
