import { describe, expect, it } from "vitest";
import { buildImportManifest } from "./manifest";

describe("M22 MP05a import manifest", () => {
  it("covers the whole inventory once, parents first, within store limits", async () => {
    const items = await buildImportManifest();
    const count = (family: string) =>
      items.filter((item) => item.family === family).length;
    expect({
      course: count("course"),
      module: count("module"),
      lesson: count("lesson"),
      quiz: count("quiz"),
      analysis: count("analysis"),
    }).toEqual({ course: 22, module: 22, lesson: 89, quiz: 21, analysis: 6 });
    const position = new Map(items.map((item) => [item.id, item.seq]));
    for (const item of items) {
      if (item.parentId)
        expect(position.get(item.parentId)!, item.id).toBeLessThan(item.seq);
      expect(item.bodyBytes, item.id).toBeLessThanOrEqual(262144);
      expect(item.bodySha256).toMatch(/^[0-9a-f]{64}$/);
      expect(item.id).toMatch(/^[a-z0-9][a-z0-9_:/.-]{0,199}$/);
    }
    console.log(
      "MANIFEST " +
        JSON.stringify({
          items: items.length,
          largest: Math.max(...items.map((i) => i.bodyBytes)),
          total: items.reduce((n, i) => n + i.bodyBytes, 0),
        }),
    );
  });
});
