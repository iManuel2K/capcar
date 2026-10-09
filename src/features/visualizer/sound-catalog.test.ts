import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { soundCatalog } from "./sound-catalog";

describe("licensed listening catalog", () => {
  it("has unique sources with attribution and no remote-only playback", () => {
    expect(new Set(soundCatalog.map((item) => item.id)).size).toBe(
      soundCatalog.length,
    );
    expect(soundCatalog).toHaveLength(50);
    for (const item of soundCatalog) {
      const original = readFileSync(
        `public/sounds/${item.fallback ?? item.audio}`,
      );
      expect(original.subarray(0, 4).toString()).toBe("OggS");
      if ("sha1" in item)
        expect(createHash("sha1").update(original).digest("hex")).toBe(
          item.sha1,
        );
      expect(original.length).toBeGreaterThan(1000);
      expect(item.author).toBeTruthy();
      expect(item.licenseUrl).toMatch(/^https:\/\//);
    }
  });
});
