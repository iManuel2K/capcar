import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  conceptPresets,
  conceptSchema,
  defaultConcept,
} from "./concept-studio";

describe("licensed concept contracts", () => {
  it("validates defaults and every preset", () => {
    expect(conceptSchema.safeParse(defaultConcept).success).toBe(true);
    for (const preset of conceptPresets)
      expect(conceptSchema.safeParse(preset.value).success).toBe(true);
    expect(
      conceptSchema.safeParse({ ...defaultConcept, model: "../../secret" })
        .success,
    ).toBe(false);
  });
  it.each(["sedan-sports", "hatchback-sports"])(
    "ships the mapped %s geometry and local texture",
    (name) => {
      const buffer = readFileSync(`public/models/concepts/${name}.glb`);
      expect(buffer.toString("utf8", 0, 4)).toBe("glTF");
      expect(buffer.length).toBeLessThan(500_000);
      const document = JSON.parse(
        buffer.toString("utf8", 20, 20 + buffer.readUInt32LE(12)),
      );
      expect(
        document.nodes.some((node: { name: string }) => node.name === "body"),
      ).toBe(true);
      if (name === "sedan-sports")
        expect(
          document.nodes.some(
            (node: { name: string }) => node.name === "spoiler",
          ),
        ).toBe(true);
      expect(document.images[0].uri).toBe("Textures/colormap.png");
      expect(
        readFileSync("public/models/concepts/Textures/colormap.png").length,
      ).toBeGreaterThan(0);
      expect(
        readFileSync("public/models/concepts/LICENSE.txt", "utf8"),
      ).toContain("CC0");
    },
  );
});
