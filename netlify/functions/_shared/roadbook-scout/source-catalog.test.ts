import { describe, expect, it } from "vitest";

import {
  entriesForShard,
  europeanPhotoTargets,
  roadbookScoutSources,
} from "./source-catalog";
import { SCOUT_SHARD_COUNT } from "./types";

describe("Roadbook Scout catalog", () => {
  it("covers 100 geographically distinct European photo targets", () => {
    expect(europeanPhotoTargets).toHaveLength(100);
    expect(new Set(europeanPhotoTargets.map((target) => target.key)).size).toBe(
      100,
    );
    expect(
      new Set(
        europeanPhotoTargets.map(
          (target) => `${target.latitude},${target.longitude}`,
        ),
      ).size,
    ).toBe(100);
    expect(
      new Set(europeanPhotoTargets.map((target) => target.countryCode)).size,
    ).toBeGreaterThanOrEqual(30);
  });

  it("splits image searches evenly across the four weekly jobs", () => {
    const sizes = Array.from({ length: SCOUT_SHARD_COUNT }, (_, shard) =>
      entriesForShard(europeanPhotoTargets, shard, SCOUT_SHARD_COUNT),
    ).map((entries) => entries.length);

    expect(sizes).toEqual([25, 25, 25, 25]);
  });

  it("uses only curated HTTPS sources with explicit scope", () => {
    expect(roadbookScoutSources.length).toBeGreaterThanOrEqual(40);
    expect(new Set(roadbookScoutSources.map((source) => source.key)).size).toBe(
      roadbookScoutSources.length,
    );
    expect(
      roadbookScoutSources.every(
        (source) =>
          source.url.startsWith("https://") &&
          ["global_major", "europe"].includes(source.scope),
      ),
    ).toBe(true);
  });
});
