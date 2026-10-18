import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { soundCatalog } from "./sound-catalog";

describe("licensed listening catalog", () => {
  it("has unique sources with attribution and no remote-only playback", () => {
    expect(new Set(soundCatalog.map((item) => item.id)).size).toBe(
      soundCatalog.length,
    );
    expect(soundCatalog).toHaveLength(150);
    const hashes = new Set<string>();
    for (const item of soundCatalog) {
      const original = readFileSync(
        `public/sounds/${item.fallback ?? item.audio}`,
      );
      expect(["OggS", "RIFF"]).toContain(original.subarray(0, 4).toString());
      const hash = createHash("sha1").update(original).digest("hex");
      expect(hashes.has(hash)).toBe(false);
      hashes.add(hash);
      if ("sha1" in item)
        expect(createHash("sha1").update(original).digest("hex")).toBe(
          item.sha1,
        );
      expect(original.length).toBeGreaterThan(1000);
      expect(item.author).toBeTruthy();
      expect(item.licenseUrl).toMatch(/^https:\/\//);
      const mp3 = readFileSync(`public/sounds/${item.audio}`);
      expect(mp3.length).toBeGreaterThan(1000);
      expect(item.audio).toMatch(/\.mp3$/);
      expect(item.duration).toMatch(/^\d+:\d{2}$/);
      expect(item.make, item.title).not.toBe("Other");
    }
  });
});
