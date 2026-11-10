import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { analysisPosts } from "../../app/analysis/posts";
import { learningPaths } from "../curriculum";
import { buildImportManifest } from "./import/manifest";
import {
  LIVE_GENERATION_FORMAT,
  liveGeneration,
  parseLiveGeneration,
  storeGroups,
} from "./live-generation";
import { buildContentSnapshot } from "./source";

const file = (patch: Record<string, unknown> = {}) =>
  JSON.stringify({
    format: LIVE_GENERATION_FORMAT,
    generation: 3,
    snapshotSha256: "d".repeat(64),
    groups: ["analysis"],
    fetchedAt: "2026-11-06T10:00:00.000Z",
    snapshot: "{}",
    ...patch,
  });
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("M22 MP08b2a live generation file", () => {
  it("reads code unless a known group is switched", () => {
    expect(storeGroups(undefined)).toEqual([]);
    expect(storeGroups("curriculum,analysis")).toEqual([
      "curriculum",
      "analysis",
    ]);
    expect(() => storeGroups("lesson")).toThrow(
      "Unknown PIPSTART_STORE_FAMILIES",
    );
    const read = vi.fn();
    expect(liveGeneration({}, read)).toBeNull();
    expect(read).not.toHaveBeenCalled();
  });
  it("accepts only the exact file made for the switched groups", () => {
    expect(parseLiveGeneration(file(), ["analysis"])).toMatchObject({
      generation: 3,
      groups: ["analysis"],
    });
    for (const [bad, reason] of [
      ["not json", "not valid JSON"],
      [file({ format: "other" }), "malformed"],
      [file({ generation: 0 }), "malformed"],
      [file({ snapshotSha256: "x" }), "malformed"],
      [file({ extra: 1 }), "malformed"],
      [file({ groups: ["curriculum"] }), "made for other content groups"],
    ])
      expect(() => parseLiveGeneration(bad, ["analysis"])).toThrow(reason);
  });
  it("fails closed when a switched group has no file", () => {
    expect(() =>
      liveGeneration({ PIPSTART_STORE_FAMILIES: "analysis" }, () => {
        throw new Error("ENOENT");
      }),
    ).toThrow("ENOENT");
  });
});

describe(
  "M22 MP08b2a analysis posts from the live generation",
  { timeout: 60_000 },
  () => {
    it("serves posts from the deployment's generation, curriculum from code, in Production too", async () => {
      const manifest = await buildImportManifest();
      // A live generation of today's content with one analysis post withdrawn.
      const withdrawn = manifest.find((i) => i.family === "analysis")!.id;
      const items = manifest
        .filter((i) => i.id !== withdrawn)
        .map(({ id, family, learningPath, parentId, body }) => ({
          id,
          family,
          learningPath,
          parentId,
          revisionNo: 1,
          body,
        }));
      const cwd = mkdtempSync(join(tmpdir(), "pipstart-live-gen-"));
      mkdirSync(join(cwd, ".generated"));
      writeFileSync(
        join(cwd, ".generated/live-generation.json"),
        file({
          snapshot: JSON.stringify(
            buildContentSnapshot(items, "2026-11-06T10:00:00.000Z"),
          ),
        }),
      );
      vi.spyOn(process, "cwd").mockReturnValue(cwd);
      vi.resetModules();
      vi.stubEnv("PIPSTART_STORE_FAMILIES", "analysis");
      vi.stubEnv("VERCEL_ENV", "production");
      const posts = (await import("../../app/analysis/posts")).analysisPosts;
      const paths = (await import("../curriculum")).learningPaths;
      expect(posts.map((p) => p.slug)).toEqual(
        analysisPosts.map((p) => p.slug).filter((s) => s !== withdrawn),
      );
      expect(paths).toEqual(learningPaths);
      const route = await import("../../app/live-generation.json/route");
      expect(await route.GET().json()).toEqual({
        format: "pipstart-deployment-generation",
        generation: 3,
        snapshotSha256: "d".repeat(64),
        groups: ["analysis"],
      });
    });
    it("keeps refusing the local snapshot source in Production", async () => {
      vi.resetModules();
      vi.stubEnv("PIPSTART_CONTENT_SOURCE", "snapshot");
      vi.stubEnv("PIPSTART_CONTENT_SNAPSHOT", "x.json");
      vi.stubEnv("VERCEL_ENV", "production");
      await expect(import("../../app/analysis/posts")).rejects.toThrow(
        "refused in Production",
      );
    });
    it("reports no generation when every group reads code", async () => {
      vi.resetModules();
      const route = await import("../../app/live-generation.json/route");
      expect(await route.GET().json()).toEqual({
        format: "pipstart-deployment-generation",
        generation: null,
        snapshotSha256: null,
        groups: [],
      });
    });
  },
);
