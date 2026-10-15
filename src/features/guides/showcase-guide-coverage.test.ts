import { describe, expect, it } from "vitest";

import {
  guideMatchesVehicle,
  installationGuides,
} from "@/features/guides/guide-catalog";

const showcaseVehicles = [
  {
    make: "Ford",
    model: "F-150",
    platform: "P702",
    engineCode: "3.5 ECOBOOST",
  },
  {
    make: "Mercedes-Benz",
    model: "E 300",
    platform: "W213",
    engineCode: "M264",
  },
  {
    make: "Volkswagen",
    model: "Golf GTI TCR",
    platform: "MK7.5",
    engineCode: "EA888",
  },
];

describe("showcase vehicle guide coverage", () => {
  it.each(showcaseVehicles)(
    "provides at least twenty source-checked guides for $make $model",
    (vehicle) => {
      const guides = installationGuides.filter(
        (guide) =>
          guide.purpose !== "inspection" &&
          guide.vehicleRules?.length &&
          guideMatchesVehicle(guide, vehicle),
      );

      expect(guides.length).toBeGreaterThanOrEqual(20);
      for (const guide of guides) {
        expect(guide.video?.url).toMatch(/^https:\/\//);
        expect(guide.video?.url).not.toContain("youtube.com/results");
        expect(
          guide.sources.some((source) => source.kind === "manufacturer"),
        ).toBe(true);
        expect(guide.sources.every((source) => source.verifiedAt)).toBe(true);
        expect(guide.parts?.length).toBeGreaterThan(0);
        expect(guide.specifications?.length).toBeGreaterThan(0);
        expect(guide.photos?.length).toBeGreaterThanOrEqual(2);
      }
    },
  );

  it("keeps every workshop guide free of YouTube search fallbacks", () => {
    const guides = installationGuides.filter(
      (guide) => guide.purpose !== "inspection",
    );

    expect(
      guides.every(
        (guide) => !guide.video?.url.includes("youtube.com/results"),
      ),
    ).toBe(true);
  });
});
