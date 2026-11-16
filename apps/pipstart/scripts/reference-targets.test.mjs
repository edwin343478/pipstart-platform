import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  TARGETS_MODULE,
  computeReferenceTargets,
  renderTargetsModule,
} from "./reference-targets.mjs";

describe("MP10b reference targets", () => {
  it("the committed list equals the repository (run --write after adding an asset or tool page)", () => {
    expect(fs.readFileSync(TARGETS_MODULE, "utf8")).toBe(
      renderTargetsModule(computeReferenceTargets()),
    );
  });
  it("lists served asset paths and only /tools pages that exist", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "pipstart-targets-"));
    fs.mkdirSync(path.join(root, "public", "images", "a"), { recursive: true });
    fs.writeFileSync(path.join(root, "public", "images", "a", "one.svg"), "");
    fs.writeFileSync(path.join(root, "public", "top.png"), "");
    fs.mkdirSync(path.join(root, "src", "app", "tools", "calc"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(root, "src", "app", "tools", "calc", "page.tsx"),
      "",
    );
    fs.mkdirSync(path.join(root, "src", "app", "tools", "components"));
    expect(computeReferenceTargets(root)).toEqual({
      assets: ["/images/a/one.svg", "/top.png"],
      tools: ["/tools", "/tools/calc"],
    });
  });
});
